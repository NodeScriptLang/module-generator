import { get } from '@nodescript/pointer';

import { InvalidAiResponseError, InvalidSpecError } from './errors.js';
import { OpenAiService } from './OpenAi.js';
import { OpenApiModule } from './OpenApiModule.js';
import { OpenApiSpec } from './schema.js';

export interface OpenApiGeneratorOptions {
    workspaceId: string;
    skipInvalid: boolean;
    openAiKey: string;
    proxy: string;
    ignoreParams: string[];
    auth?: {
        in: 'query' | 'header';
        name: string;
        prefix?: string;
        description?: string;
        oauth2?: { // TODO refine schema
            authorizationUrl?: string;
            tokenUrl?: string;
            scopes?: string[];
        };
    };
}

export class OpenApiGenerator {

    options: OpenApiGeneratorOptions;
    openAi: OpenAiService;

    modules: OpenApiModule[] = [];
    inferredServiceName = '';

    constructor(
        public spec: OpenApiSpec,
        options: Partial<OpenApiGeneratorOptions> = {},
    ) {
        this.options = {
            workspaceId: '',
            skipInvalid: false,
            openAiKey: '',
            proxy: '',
            ignoreParams: [],
            ...options,
        };
        if (!this.options.openAiKey) {
            throw new Error('openAiKey is required');
        }
        this.openAi = new OpenAiService(this.options.openAiKey, this.options.proxy);
    }

    parseModules() {
        this.modules = [];
        const mainServer = this.spec.servers?.[0];
        for (const [path, pathItem] of Object.entries(this.spec.paths)) {
            try {

                const {
                    servers: pathServers = [],
                    parameters: pathParameters = [],
                    ...declarations
                } = pathItem;
                const server = pathServers[0] ?? mainServer;
                if (!server) {
                    throw new InvalidSpecError(`Cannot process path ${path}: no server`);
                }
                for (const [method, opSpec] of Object.entries(declarations)) {
                    const parameters = [...pathParameters, ...opSpec.parameters ?? []].map(_ => this.resolveRef(_));
                    const normalizedPath = '/' + path.replace(/^\/+/gi, '');
                    const normalizedServer = server.url.replace(/\/+$/, '');
                    const module = new OpenApiModule(this, normalizedPath, method, normalizedServer, parameters, opSpec);
                    this.modules.push(module);
                }
            } catch (error) {
                if (this.options.skipInvalid) {
                    continue;
                }
                throw error;
            }
        }
    }

    deepResolveRef<T extends { $ref?: string }>(obj: T, visitedRefs = new Set<string>()): T {
        const resolved = this.resolveRef(obj, visitedRefs);
        if (resolved && typeof resolved === 'object') {
            for (const [key, value] of Object.entries(resolved)) {
                (resolved as any)[key] = this.deepResolveRef(value as any, visitedRefs);
            }
        }
        return resolved;
    }

    resolveRef<T extends { $ref?: string }>(obj: T, visitedRefs = new Set<string>()): T {
        if (obj?.$ref) {
            // Prevent circular dependencies
            if (visitedRefs.has(obj.$ref)) {
                return {} as any;
            }
            visitedRefs.add(obj.$ref);
            const reference = get(this.spec, obj.$ref.replace(/^#/, ''));
            if (reference == null) {
                throw new InvalidSpecError(`Invalid reference: ${obj.$ref}`);
            }
            return this.resolveRef(reference as T, visitedRefs);
        }
        return obj;
    }

    async inferServiceName() {
        if (this.inferredServiceName) {
            return this.inferredServiceName;
        }
        const prompt = [
            `Infer the short name of the service from the following Open API spec fragment.
              Omit unrelated or generic terms like "API", "Service", "REST", etc.
              For example, "Google RESTful API" becomes "Google".`,

            JSON.stringify(this.spec.info),

            'Return the response as JSON object in format { name: string }'
        ];
        const res = await this.openAi.generateCompletion(prompt);
        if (typeof res.name !== 'string') {
            throw new InvalidAiResponseError('Expected { name: string } response', res);
        }
        console.info(`Inferred service name: ${res.name}`);
        this.inferredServiceName = res.name;
        return res.name;
    }

    async inferCategories() {
        const endpointsInfo = this.modules.map(module => {
            return {
                method: module.method,
                path: module.path,
                summary: module.opSpec.summary,
                operationId: module.opSpec.operationId,
                tags: module.opSpec.tags,
            };
        });
        const tags = this.spec.tags;
        const prompt = [
            `API endpoints list:`,

            JSON.stringify(endpointsInfo),

            `Group those endpoints logically into top-level categories.
            Within each category identify one level of subcategories.`,

            `The categories and subcategories should represent a compact,
            systematic and logical grouping of the endpoints.`,

            `Subcategories with too few items can be omitted.
            Empty, repetitive and overly generic subcategories should be avoided.
            All names should be succinct, in human case, words capitalized,
            with single space between words.
            Omit generic terms that do not contribute to meaning.
            Avoid repeating same terms in subcategories that already exist in categories.`,

            tags.length > 1 ? `The following OpenAPI spec tags can help with inferring top-level categories: ${JSON.stringify(tags)}` : '',

            `The result should be a valid JSON in the following format:

            {
                categories: [
                    {
                        category: string;
                        subcategories: string[];
                    }
                ]
            }
            `
        ].map(_ => _.replace(/\s+/g, ' '));
        const res = await this.openAi.generateCompletion(prompt, 'gpt-4o');
        if (!Array.isArray(res.categories)) {
            throw new InvalidAiResponseError('Expected { categories: Array }', res);
        }
        return res.categories;
    }

    async inferModuleNames() {
        const endpointsInfo = this.modules.map(module => {
            return {
                method: module.method,
                path: module.path,
                summary: module.opSpec.summary,
                operationId: module.opSpec.operationId,
            };
        });
        const prompt = [
            'List of API endpoints:',

            JSON.stringify(endpointsInfo),

            `For each endpoint in the list infer the structured name in format "Category / Optional Subcategory / Operation Name"`,

            `Rules:`,

            `- Subcategory is optional, so each name can have either 2 or 3 components.`,
            `- Name components are delimited with slashes, with a single space around slash.`,
            `- Each naming component must be human-readable, words separated and capitalized, with a single space between words.`,
            `- Name components should be as succinct as possible.`,
            `- Operation names should not repeat terms if they already occur in category or subcategory, except when this alters the meaning of the operation.`,
            `- Operation name should be either a single verb (if context is defined by category or subcategory) or a verb followed by other words.`,
            `- Generic terms that do not contribute to the meaning should be omitted, except when name becomes ambiguous.`,
            `- Naming scheme should be consistent across all results.`,
            `- Duplicate and ambiguous names are not allowed.`,
            `- Each structured name should be unique across all endpoints.`,

            `Examples:`,

            `GET /v1/spreadsheets/{spreadsheetId} => "Spreadsheets / Get"`,
            `POST /v1/spreadsheets/{spreadsheetId} => "Spreadsheets / Create"`,
            `GET /repos/{owner}/{repo}/branches => "Repos / Branches / List"`,
            `POST /repos/{owner}/{repo}/branches => "Repos / Branches / Create"`,
            `POST /orgs/{org}/actions/runners/{runner_id}/labels => "Orgs / Actions / Add Runner Label"`,
            `DELETE /repos/{owner}/{repo}/branches/{branch}/protection/required_pull_request_reviews => "Repos / Branch Protection / Remove Pull Request Review"`,

            `The result should be a valid JSON object in format: { result: string[] },
            each string in the result must correspond to the endpoints from the original list by index.`,
        ];
        const res = await this.openAi.generateCompletion(prompt);
        if (!Array.isArray(res.result)) {
            throw new InvalidAiResponseError('Expected { result: string[] }', res);
        }
        for (const [i, inferredName] of res.result.entries()) {
            this.modules[i].inferredName = inferredName;
        }
        console.info(`Inferred names for ${this.modules.length} modules`);
    }

}
