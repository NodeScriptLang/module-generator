import { CodeBuilder } from '@nodescript/core/compiler';
import { ModuleDefinition, ParamsDefinition, SchemaSpec } from '@nodescript/core/types';
import { UnknownSchemaDef } from 'airtight';
import escapeStringRegexp from 'escape-string-regexp';

import { LibraryModuleSpec } from '../schema/LibraryModuleSpec.js';
import { LibraryParamSpec } from '../schema/LibraryParamSpec.js';
import { LibrarySpec } from '../schema/LibrarySpec.js';

export class LibraryGenerator {

    constructor(readonly librarySpec: LibrarySpec) {}

    generateModuleDefinition(mspec: LibraryModuleSpec): ModuleDefinition<any, any> {
        return {
            moduleName: mspec.moduleName,
            version: '0.0.0',
            description: mspec.description,
            keywords: [],
            cacheMode: 'always',
            evalMode: 'manual',
            params: this.generateParamDefs(mspec),
            result: {
                schema: { type: 'any' },
                async: true,
            },
            attributes: {
                externalDocs: mspec.externalDocs,
            },
        };
    }

    generateModuleCode(mspec: LibraryModuleSpec): string {
        const code = new CodeBuilder();
        code.block('export async function compute(params, ctx) {', '}', () => {
            code.block(`let url = new URL(`, ');', () => {
                code.line(JSON.stringify(this.librarySpec.baseUrl + mspec.path));
                code.indent(1);
                for (const pspec of this.getParamSpecs(mspec)) {
                    if (pspec.in === 'path') {
                        code.line(`.replace("{${pspec.originalName}}", ${this.paramValueExpr(pspec)})`);
                    }
                }
                code.indent(-1);
            });
            code.line('const addQueryParam = (key, val) => { if (val !== undefined) url.searchParams.append(key, val) };');
            code.line('const headers = {};');
            for (const pspec of this.getParamSpecs(mspec)) {
                if (pspec.in === 'header') {
                    code.line(`headers[${JSON.stringify(pspec.originalName)}] = ${this.paramValueExpr(pspec)};`);
                }
                if (pspec.in === 'query') {
                    this.emitQueryParam(code, pspec);
                }
            }
            if (mspec.requestBodyType === 'json') {
                this.emitRequestBodyJson(code, mspec);
            } else if (mspec.requestBodyType === 'form') {
                this.emitRequestBodyForm(code, mspec);
            } else {
                code.line('const body = undefined;');
            }
            code.block(`const res = await ctx.lib.fetch({`, `}, body);`, () => {
                code.line(`method: ${JSON.stringify(mspec.method)},`);
                code.line(`url: url.href,`);
                code.line(`headers,`);
            });
            code.block('if (res.status == 204) {', '}', () => {
                code.line('return undefined;');
            });
            code.line('const responseBodyText = await res.body.text();');
            code.block('if (res.status >= 400) {', '}', () => {
                code.line('const details = ctx.lib.parseJson(responseBodyText) ?? { response: responseBodyText };');
                code.line(`const error = new Error("Service returned an error " + res.status);`);
                code.line(`error.name = "ServiceRequestError";`);
                code.line(`error.status = res.status;`);
                code.line(`error.stack = "";`);
                code.block(`error.details = {`, `};`, () => {
                    code.line(`service: ${JSON.stringify(this.librarySpec.displayName)},`);
                    code.line(`method: ${JSON.stringify(mspec.method)},`);
                    code.line(`url: url.href,`);
                    code.line(`...details,`);
                });
                code.line('throw error;');
            });
            code.line('return ctx.lib.parseJson(responseBodyText) ?? responseBodyText;');
        });
        return code.toString();
    }

    private generateParamDefs(mspec: LibraryModuleSpec): ParamsDefinition<any> {
        const params: ParamsDefinition<any> = {};
        for (const pspec of this.getParamSpecs(mspec)) {
            const schema: SchemaSpec = { ...pspec.schema };
            if (!pspec.required && schema.default == null) {
                schema.optional = true;
            }
            schema.description = pspec.description ?? '';
            params[pspec.paramName] = {
                schema: pspec.schema as UnknownSchemaDef,
                advanced: pspec.advanced ?? !pspec.required,
                hideValue: pspec.hideValue ?? schema.type === 'any',
            };
        }
        return params;
    }

    private getParamSpecs(mspec: LibraryModuleSpec): LibraryParamSpec[] {
        return [
            ...(this.librarySpec.commonParams ?? []),
            ...mspec.params,
        ];
    }

    private paramValueExpr(pspec: LibraryParamSpec) {
        const { paramName, prefix } = pspec;
        const valueExpr = `params[${JSON.stringify(paramName)}]`;
        if (prefix) {
            return `(${JSON.stringify(prefix)} + " " + ${valueExpr}.replace(/^${escapeStringRegexp(prefix)}\\s+/gi, ''))`;
        }
        return valueExpr;
    }

    private emitQueryParam(code: CodeBuilder, pspec: LibraryParamSpec) {
        const paramName = JSON.stringify(pspec.paramName);
        const originalName = JSON.stringify(pspec.originalName);
        if (pspec.schema.type === 'array') {
            // https://spec.openapis.org/oas/latest.html#style-values
            const delimiter = pspec.style === 'form' ? ',' :
                pspec.style === 'spaceDelimited' ? ' ' :
                    pspec.style === 'pipeDelimited' ? '|' : ',';
            if (pspec.explode) {
                code.block(`for (const item of params[]) {`, '}', () => {
                    code.line(`addQueryParam(${originalName}, item);`);
                });
            } else {
                code.line(`addQueryParam(${originalName}, params[${paramName}].join(${JSON.stringify(delimiter)}));`);
            }
        // TODO add support for objects
        } else {
            code.line(`addQueryParam(${originalName}, params[${paramName}]);`);
        }
    }

    private emitRequestBodyJson(code: CodeBuilder, mspec: LibraryModuleSpec) {
        code.line('headers["content-type"] = "application/json";');
        const bodyRaw = this.getParamSpecs(mspec).find(_ => _.in === 'body_raw');
        code.line('let body = {};');
        if (bodyRaw) {
            code.line(`body = JSON.stringify(params[${JSON.stringify(bodyRaw.paramName)}]);`);
        } else {
            for (const pspec of this.getParamSpecs(mspec)) {
                if (pspec.in === 'body') {
                    const paramName = JSON.stringify(pspec.paramName);
                    const originalName = JSON.stringify(pspec.originalName);
                    code.line(`body[${originalName}] = params[${paramName}];`);
                }
            }
        }
        code.line('body = JSON.stringify(body);');
    }

    private emitRequestBodyForm(code: CodeBuilder, mspec: LibraryModuleSpec) {
        code.line('headers["content-type"] = "application/x-www-form-urlencoded";');
        code.line('const body = new URLSearchParams();');
        code.line('const addBodyParam = (key, val) => { if (val !== undefined) body.append(key, val) };');
        for (const param of this.getParamSpecs(mspec)) {
            if (param.in === 'body') {
                const paramName = JSON.stringify(param.paramName);
                const originalName = JSON.stringify(param.originalName);
                code.line(`addBodyParam(${originalName}, params[${paramName}]);`);
            }
        }
    }

}
