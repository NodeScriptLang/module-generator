import { Schema } from 'airtight';

import { LibraryParamSpec, LibraryParamSpecSchema } from './LibraryParamSpec.js';

export interface LibraryModuleSpec {
    moduleName: string;
    method: string;
    path: string;
    description: string;
    externalDocs: string;
    requestBodyType?: 'json' | 'form';
    params: LibraryParamSpec[];
}

export const LibraryModuleSpecSchema = new Schema<LibraryModuleSpec>({
    type: 'object',
    properties: {
        moduleName: { type: 'string' },
        method: { type: 'string' },
        path: { type: 'string' },
        description: { type: 'string' },
        externalDocs: { type: 'string' },
        requestBodyType: {
            type: 'string',
            enum: ['json', 'form'],
            optional: true,
        },
        params: {
            type: 'array',
            items: LibraryParamSpecSchema.schema,
        },
    },
});
