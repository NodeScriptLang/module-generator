import { SchemaSpec } from '@nodescript/core/types';
import { get } from '@nodescript/pointer';
import camelcase from 'camelcase';

import { InvalidAiResponseError, InvalidSpecError, UnsupportedFeatureError } from '../errors.js';
import { LibraryModuleSpec } from '../schema/LibraryModuleSpec.js';
import { LibraryParamSpec } from '../schema/LibraryParamSpec.js';
import { LibrarySpec } from '../schema/LibrarySpec.js';
import { OpenAiService } from '../services/OpenAi.js';
import { OpenApiParameterSpec, OpenApiSchemaSpec, OpenApiSpec } from '../types.js';
import { normalizePath, normalizeServerUrl } from '../utils.js';

export interface OpenApiGeneratorOptions {
    skipInvalid: boolean;
    openAiKey: string;
    proxy: string;
    ignoreParams: string[];
}

export class OpenApiGenerator {

    options: OpenApiGeneratorOptions;
    openAi: OpenAiService;

    private inferredServiceName = '';
    private inferredModuleNames = new Map<string, string>();

    constructor(
        public id: string,
        public spec: OpenApiSpec,
        options: Partial<OpenApiGeneratorOptions> = {},
    ) {
        this.options = {
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

    async generateLibrarySpec(): Promise<LibrarySpec> {
        await this.inferServiceName();
        await this.inferModuleNames();
        const baseUrl = normalizeServerUrl(this.spec.servers?.[0]?.url ?? '');
        const description = this.spec.info.description ?? '';
        return {
            id: this.id,
            displayName: this.inferredServiceName,
            baseUrl,
            description,
            modules: [...this.generateModuleSpecs()],
        };
    }

    *generateModuleSpecs(): Iterable<LibraryModuleSpec> {
        for (const ep of this.traverseEndpoints()) {
            try {
                const inferredModuleName = this.inferredModuleNames.get([ep.method, ep.path].join(' ')) ?? '';
                const paramSpecs = [...this.parseParameters(ep.parameters)];
                let requestBodyType: 'json' | 'form' | undefined;
                if (ep.opSpec.requestBody) {
                    const requestBody = this.deepResolveRef(ep.opSpec.requestBody);
                    const jsonContent = requestBody.content?.['application/json'];
                    const formContent = requestBody.content?.['application/x-www-form-urlencoded'];
                    if (jsonContent?.schema) {
                        requestBodyType = 'json';
                        paramSpecs.push(...this.parseRequestBody(jsonContent.schema));
                    } else if (formContent?.schema) {
                        requestBodyType = 'form';
                        paramSpecs.push(...this.parseRequestBody(formContent.schema));
                    } else {
                        throw new UnsupportedFeatureError('Unsupported request body content');
                    }
                }
                yield {
                    moduleName: inferredModuleName,
                    method: ep.method,
                    path: normalizePath(ep.path),
                    description: ep.opSpec.description ?? ep.opSpec.summary ?? '',
                    externalDocs: ep.opSpec.externalDocs?.url ?? '',
                    params: paramSpecs,
                    requestBodyType,
                };
            } catch (err) {
                if (!this.options.skipInvalid) {
                    throw err;
                }
            }
        }
    }

    private *parseParameters(parameters: OpenApiParameterSpec[]): Iterable<LibraryParamSpec> {
        for (const param of parameters) {
            if (!param.name.trim()) {
                continue;
            }
            const paramName = camelcase(param.name.trim());
            if (this.options.ignoreParams.includes(paramName) || this.options.ignoreParams.includes(param.name)) {
                continue;
            }
            const resolvedSchema = this.deepResolveRef(param.schema ?? {});
            const description = param.description ?? resolvedSchema.description ?? '';
            yield {
                paramName,
                description,
                paramKey: param.name.trim(),
                in: param.in,
                schema: this.getSimplifiedSchema(resolvedSchema),
                required: param.required ?? false,
                style: param.style,
                explode: param.explode,
            };
        }
    }

    private *parseRequestBody(schema: OpenApiSchemaSpec): Iterable<LibraryParamSpec> {
        if (schema.type === 'object') {
            // Top-level properties become sockets
            for (const [key, propSchema] of Object.entries(schema.properties ?? {})) {
                const paramName = camelcase(key);
                // Note: schema of request body is already deep-resolved
                const resolvedSchema = propSchema;
                const required = (schema.required ?? []).includes(key);
                yield {
                    paramName,
                    description: resolvedSchema.description ?? '',
                    paramKey: key,
                    in: 'body',
                    schema: this.getSimplifiedSchema(resolvedSchema),
                    required,
                    example: schema.example,
                };
            }
        } else {
            yield {
                paramName: 'requestBody',
                paramKey: '',
                description: schema.description ?? '',
                in: 'body_raw',
                schema: this.getSimplifiedSchema(schema),
                required: true,
                example: schema.example,
            };
        }
    }

    private getSimplifiedSchema(schema: OpenApiSchemaSpec): SchemaSpec {
        switch (schema.type) {
            case 'string':
                return {
                    type: 'string',
                    default: schema.default,
                    enum: schema.enum,
                };
            case 'integer':
            case 'number':
                return {
                    type: 'number',
                    minimum: schema.minimum,
                    maximum: schema.maximum,
                    default: schema.default,
                };
            case 'boolean':
                return {
                    type: 'boolean',
                    default: schema.default,
                };
            case 'array':
                return {
                    type: 'array',
                    items: { type: 'any' },
                };
            case 'object':
            default:
                return {
                    type: 'any',
                };
        }
    }

    private deepResolveRef<T extends { $ref?: string }>(obj: T, visitedRefs = new Set<string>()): T {
        const resolved = this.resolveRef(obj, visitedRefs);
        if (resolved && typeof resolved === 'object') {
            for (const [key, value] of Object.entries(resolved)) {
                (resolved as any)[key] = this.deepResolveRef(value as any, visitedRefs);
            }
        }
        return resolved;
    }

    private resolveRef<T extends { $ref?: string }>(obj: T, visitedRefs = new Set<string>()): T {
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

    private async inferServiceName() {
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

    private async inferModuleNames() {
        const endpointsInfo = this.getEndpointsInfo();
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
        if (res.result.length !== endpointsInfo.length) {
            throw new InvalidAiResponseError(`Expected the same number of module name suggestions as the number of endpoints`, res);
        }
        for (const [i, inferredName] of res.result.entries()) {
            const ep = endpointsInfo[i];
            this.inferredModuleNames.set([ep.method, ep.path].join(' '), inferredName);
        }
        console.info(`Inferred names for ${endpointsInfo.length} modules`);
    }

    private getEndpointsInfo() {
        const res: EndpointInfo[] = [];
        for (const ep of this.traverseEndpoints()) {
            const { method, path, opSpec } = ep;
            res.push({
                method,
                path,
                // summary: opSpec.summary,
                operationId: opSpec.operationId,
                tags: opSpec.tags,
            });
        }
        return res;
    }

    private *traverseEndpoints() {
        for (const [path, pathItem] of Object.entries(this.spec.paths)) {
            const {
                servers: endpointServers,
                parameters: endpointParams,
                ...declarations
            } = pathItem;
            for (const [method, opSpec] of Object.entries(declarations)) {
                const parameters = [
                    ...(endpointParams ?? []),
                    ...(opSpec.parameters ?? [])
                ].map(_ => this.resolveRef(_));
                yield {
                    method,
                    path,
                    endpointServers,
                    parameters,
                    opSpec,
                };
            }
        }
    }

}

interface EndpointInfo {
    method: string;
    path: string;
    summary?: string;
    operationId?: string;
    tags?: string[];
}
