import { SchemaSpecSchema } from '@nodescript/core/schema';
import { SchemaSpec } from '@nodescript/core/types';
import { Schema } from 'airtight';

import { OpenApiParameterSpec } from '../types.js';

export interface LibraryParamSpec {
    paramName: string;
    originalName: string;
    in: 'query' | 'header' | 'cookie' | 'path' | 'body' | 'body_raw';
    required: boolean;
    advanced?: boolean;
    description: string;
    schema: SchemaSpec;
    example?: any;
    style?: OpenApiParameterSpec['style'];
    explode?: OpenApiParameterSpec['explode'];
}

export const LibraryParamSpecSchema = new Schema<LibraryParamSpec>({
    type: 'object',
    properties: {
        paramName: { type: 'string' },
        originalName: { type: 'string' },
        description: { type: 'string' },
        in: {
            type: 'string',
            enum: ['query', 'header', 'cookie', 'path', 'body', 'body_raw'],
        },
        required: { type: 'boolean' },
        advanced: {
            type: 'boolean',
            optional: true,
        },
        schema: SchemaSpecSchema.schema,
        example: {
            type: 'any',
            optional: true,
        },
        style: {
            type: 'string',
            optional: true,
            enum: ['form', 'spaceDelimited', 'pipeDelimited'],
        },
        explode: {
            type: 'boolean',
            optional: true,
        },
    },
});
