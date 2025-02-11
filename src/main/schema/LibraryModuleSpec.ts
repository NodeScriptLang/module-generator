import { Schema } from 'airtight';

import { LibraryParamSpec, LibraryParamSpecSchema } from './LibraryParamSpec.js';

export interface LibraryModuleSpec {
    moduleName: string;
    method: string;
    path: string;
    description: string;
    externalDocs: string;
    operationId?: string;
    requestBodyType?: 'json' | 'form' | 'form-data';
    params: LibraryParamSpec[];
    attributes?: Record<string, any>;
}

export const LibraryModuleSpecSchema = new Schema<LibraryModuleSpec>({
    type: 'object',
    properties: {
        moduleName: { type: 'string' },
        method: { type: 'string' },
        path: { type: 'string' },
        description: { type: 'string' },
        externalDocs: { type: 'string' },
        operationId: { type: 'string', optional: true },
        requestBodyType: {
            type: 'string',
            enum: ['json', 'form', 'form-data'],
            optional: true,
        },
        params: {
            type: 'array',
            items: LibraryParamSpecSchema.schema,
        },
        attributes: {
            type: 'object',
            properties: {},
            additionalProperties: { type: 'any' },
            optional: true,
        },
    },
});
