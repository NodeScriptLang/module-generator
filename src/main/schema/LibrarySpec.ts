import { Schema } from 'airtight';

import { LibraryModuleSpec, LibraryModuleSpecSchema } from './LibraryModuleSpec.js';
import { LibraryParamSpec, LibraryParamSpecSchema } from './LibraryParamSpec.js';

export interface LibrarySpec {
    id: string;
    displayName: string;
    baseUrl: string;
    description: string;
    commonParams?: LibraryParamSpec[];
    commonKeywords?: string[];
    auth?: {
        name: string;
        in: 'header' | 'query';
        description: string;
    };
    modules: LibraryModuleSpec[];
}

export const LibrarySpecSchema = new Schema<LibrarySpec>({
    type: 'object',
    properties: {
        id: { type: 'string' },
        displayName: { type: 'string' },
        baseUrl: { type: 'string' },
        description: { type: 'string' },
        commonParams: {
            type: 'array',
            items: LibraryParamSpecSchema.schema,
            optional: true,
        },
        commonKeywords: {
            type: 'array',
            items: { type: 'string' },
            optional: true,
        },
        auth: {
            type: 'object',
            properties: {
                name: { type: 'string' },
                in: {
                    type: 'string',
                    enum: ['header', 'query']
                },
                description: {
                    type: 'string',
                },
            },
            optional: true,
        },
        modules: {
            type: 'array',
            items: LibraryModuleSpecSchema.schema,
        },
    },
});
