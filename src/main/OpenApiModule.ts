import { CodeBuilder } from '@nodescript/core/compiler';
import { ModuleDefinition, ParamsDefinition } from '@nodescript/core/types';
import { set } from '@nodescript/pointer';
import { UnknownSchemaDef } from 'airtight';
import camelcase from 'camelcase';
import escapeStringRegexp from 'escape-string-regexp';

import { UnsupportedFeatureError } from './errors.js';
import { OpenApiGenerator } from './OpenApiGenerator.js';
import { OpenApiOperationSpec, OpenApiParameterSpec, OpenApiSchemaSpec } from './schema.js';

export class OpenApiModule {

    inferredName = '';
    requestBodyType: 'none' | 'json' | 'form' = 'none';
    parsedParams: ParsedParamSpec[] = [];
    code = new CodeBuilder();

    constructor(
        readonly generator: OpenApiGenerator,
        public path: string,
        public method: string,
        public server: string,
        public parameters: OpenApiParameterSpec[],
        public opSpec: OpenApiOperationSpec,
    ) {
        this.method = method.toUpperCase();
        this.parseParams();
    }

    async getModuleName() {
        if (!this.inferredName) {
            await this.generator.inferModuleNames();
        }
        if (!this.inferredName) {
            throw new Error(`Could not infer module name: ${this.method} ${this.path}`);
        }
        const serviceName = await this.generator.inferServiceName();
        return `${serviceName} / ${this.inferredName}`;
    }

    async generateModuleSpec(options: {
        attributes?: Record<string, any>;
    } = {}): Promise<ModuleDefinition<any, any>> {
        const moduleName = await this.getModuleName();
        return {
            moduleName,
            version: '0.0.0',
            description: this.opSpec.description ?? '',
            keywords: [], // TODO generate keywords
            cacheMode: 'always',
            evalMode: 'manual',
            params: this.generateParamDefs(),
            result: {
                schema: { type: 'any' },
                async: true,
            },
            attributes: {
                externalDocs: this.opSpec.externalDocs?.url ?? '',
                securitySpec: this.opSpec.security,
                ...options?.attributes,
            },
        };
    }

    async generateModuleCode() {
        this.code = new CodeBuilder();
        this.code.block('export async function compute(params, ctx) {', '}', () => {
            this.code.block(`let url = new URL(`, ');', () => {
                this.code.line(JSON.stringify(this.server + this.path));
                this.code.indent(1);
                for (const param of this.parsedParams) {
                    if (param.in === 'path') {
                        this.code.line(`.replace("{${param.originalName}}", params[${JSON.stringify(param.paramName)}])`);
                    }
                }
                this.code.indent(-1);
            });
            this.code.line('const addQueryParam = (key, val) => { if (val !== undefined) url.searchParams.append(key, val) };');
            this.code.line('const headers = {};');
            this.emitAuth();
            for (const param of this.parsedParams) {
                if (param.in === 'header') {
                    this.code.line(`headers[${JSON.stringify(param.originalName)}] = params[${JSON.stringify(param.paramName)}];`);
                }
            }
            for (const param of this.parsedParams) {
                if (param.in === 'query') {
                    this.emitQueryParam(param);
                }
            }
            if (this.requestBodyType === 'json') {
                this.emitRequestBodyJson();
            } else if (this.requestBodyType === 'form') {
                this.emitRequestBodyForm();
            } else {
                this.code.line('const body = undefined;');
            }
            this.code.block(`const res = await ctx.lib.fetch({`, `}, body);`, () => {
                this.code.line(`method: ${JSON.stringify(this.method)},`);
                this.code.line(`url: url.href,`);
                this.code.line(`headers,`);
            });
            this.code.block('if (res.status == 204) {', '}', () => {
                this.code.line('return undefined;');
            });
            this.code.line('const responseBodyText = await res.body.text();');
            this.code.block('if (res.status >= 400) {', '}', () => {
                this.code.line('const details = ctx.lib.parseJson(responseBodyText) ?? { response: responseBodyText };');
                this.code.line(`const error = new Error("Service returned an error " + res.status);`);
                this.code.line(`error.name = "ServiceRequestError";`);
                this.code.line(`error.status = res.status;`);
                this.code.line(`error.stack = "";`);
                this.code.block(`error.details = {`, `};`, () => {
                    this.code.line(`service: ${JSON.stringify(this.generator.inferredServiceName)},`);
                    this.code.line(`method: ${JSON.stringify(this.method)},`);
                    this.code.line(`url: url.href,`);
                    this.code.line(`...details,`);
                });
                this.code.line('throw error;');
            });
            this.code.line('return ctx.lib.parseJson(responseBodyText) ?? responseBodyText;');
        });
        return this.code.toString();
    }

    private generateParamDefs() {
        const params: ParamsDefinition<any> = {};
        const { auth } = this.generator.options;
        if (auth) {
            params['auth'] = {
                schema: {
                    type: 'string',
                    description: auth.description,
                },
                attributes: {
                    oauth2: auth.oauth2,
                }
            };
        }
        for (const param of this.parsedParams) {
            const schema = this.getSimplifiedSchema(param.schema);
            if (!param.required && schema.default == null) {
                schema.optional = true;
            }
            schema.description = param.description ?? '';
            schema.metadata = {
                originalSchema: param.schema,
            };
            params[param.paramName] = {
                schema,
                advanced: !param.required,
                hideValue: schema.type === 'any',
            };
        }
        return params;
    }

    private parseParams() {
        this.parsedParams = [];
        for (const param of this.parameters) {
            if (!param.name.trim()) {
                // You won't believe, but those exist (see Notion / Pages / Get)
                continue;
            }
            const paramName = camelcase(param.name.trim());
            if (this.generator.options.ignoreParams.includes(paramName)) {
                continue;
            }
            const resolvedSchema = this.generator.deepResolveRef(param.schema ?? {});
            const description = param.description ?? resolvedSchema.description ?? '';
            const parsedParam: ParsedParamSpec = {
                paramName,
                description,
                originalName: param.name.trim(),
                in: param.in,
                schema: { ...resolvedSchema, description },
                required: param.required ?? false,
                style: param.style,
                explode: param.explode,
            };
            this.applyParamOverrides(parsedParam);
            this.parsedParams.push(parsedParam);
        }
        if (this.opSpec.requestBody) {
            const requestBody = this.generator.deepResolveRef(this.opSpec.requestBody);
            const jsonContent = requestBody.content?.['application/json'];
            const formContent = requestBody.content?.['application/x-www-form-urlencoded'];
            if (jsonContent?.schema) {
                this.requestBodyType = 'json';
                this.parseRequestBody(jsonContent.schema);
            } else if (formContent?.schema) {
                this.requestBodyType = 'form';
                this.parseRequestBody(formContent.schema);
            } else {
                throw new UnsupportedFeatureError('Unsupported request body content');
            }
        }
    }

    private applyParamOverrides(paramSpec: ParsedParamSpec) {
        const overrides = this.generator.options.paramOverrides ?? [];
        const paramOverride = overrides.find(_ => _.paramName === paramSpec.paramName);
        if (!paramOverride) {
            return;
        }
        for (const [key, value] of Object.entries(paramOverride.overrides)) {
            set(paramSpec, key, value);
        }
    }

    private parseRequestBody(schema: OpenApiSchemaSpec) {
        if (schema.type === 'object') {
            // Top-level properties become sockets
            for (const [key, propSchema] of Object.entries(schema.properties ?? {})) {
                const paramName = camelcase(key);
                // Note: schema of request body is already deep-resolved
                const resolvedSchema = propSchema;
                const required = (schema.required ?? []).includes(key);
                this.parsedParams.push({
                    paramName,
                    description: resolvedSchema.description ?? '',
                    originalName: key,
                    in: 'body',
                    schema: resolvedSchema,
                    required,
                    example: schema.example,
                });
            }
        } else {
            this.parsedParams.push({
                paramName: 'requestBody',
                originalName: '',
                description: schema.description ?? '',
                in: 'body_raw',
                schema,
                required: true,
                example: schema.example,
            });
        }
    }

    private getSimplifiedSchema(schema: OpenApiSchemaSpec): UnknownSchemaDef {
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
                };
            case 'boolean':
                return {
                    type: 'boolean',
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

    private emitQueryParam(param: ParsedParamSpec) {
        const paramName = JSON.stringify(param.paramName);
        const originalName = JSON.stringify(param.originalName);
        if (param.schema.type === 'array') {
            // https://spec.openapis.org/oas/latest.html#style-values
            const delimiter = param.style === 'form' ? ',' :
                param.style === 'spaceDelimited' ? ' ' :
                    param.style === 'pipeDelimited' ? '|' : ',';
            if (param.explode) {
                this.code.block(`for (const item of params[]) {`, '}', () => {
                    this.code.line(`addQueryParam(${originalName}, item);`);
                });
            } else {
                this.code.line(`addQueryParam(${originalName}, params[${paramName}].join(${JSON.stringify(delimiter)}));`);
            }
        // TODO add support for objects
        } else {
            this.code.line(`addQueryParam(${originalName}, params[${paramName}]);`);
        }
    }

    private emitRequestBodyJson() {
        this.code.line('headers["content-type"] = "application/json";');
        const bodyRaw = this.parsedParams.find(_ => _.in === 'body_raw');
        this.code.line('let body = {};');
        if (bodyRaw) {
            this.code.line(`body = JSON.stringify(params[${JSON.stringify(bodyRaw.paramName)}]);`);
        } else {
            for (const param of this.parsedParams) {
                if (param.in === 'body') {
                    const paramName = JSON.stringify(param.paramName);
                    const originalName = JSON.stringify(param.originalName);
                    this.code.line(`body[${originalName}] = params[${paramName}];`);
                }
            }
        }
        this.code.line('body = JSON.stringify(body);');
    }

    private emitRequestBodyForm() {
        this.code.line('headers["content-type"] = "application/x-www-form-urlencoded";');
        this.code.line('const body = new URLSearchParams();');
        this.code.line('const addBodyParam = (key, val) => { if (val !== undefined) body.append(key, val) };');
        for (const param of this.parsedParams) {
            if (param.in === 'body') {
                const paramName = JSON.stringify(param.paramName);
                const originalName = JSON.stringify(param.originalName);
                this.code.line(`addBodyParam(${originalName}, params[${paramName}]);`);
            }
        }
    }

    private emitAuth() {
        const { auth } = this.generator.options;
        if (!auth) {
            return;
        }
        // TODO implement oauth2 flows
        this.code.line(`let auth = params.auth;`);
        if (auth.prefix) {
            this.code.line(`auth = ${JSON.stringify(auth.prefix)} + " " + auth.replace(/^${escapeStringRegexp(auth.prefix)}\\s+/gi, '')`);
        }
        if (auth.in === 'header') {
            this.code.line(`headers[${JSON.stringify(auth.name)}] = auth;`);
        }
        if (auth.in === 'query') {
            this.code.line(`addQueryParam(${JSON.stringify(auth.name)}, auth);`);
        }
    }

}

export interface ParsedParamSpec {
    paramName: string;
    originalName: string;
    description: string;
    in: 'query' | 'header' | 'cookie' | 'path' | 'body' | 'body_raw';
    schema: OpenApiSchemaSpec;
    required: boolean;
    example?: any;
    style?: OpenApiParameterSpec['style'];
    explode?: OpenApiParameterSpec['explode'];
}
