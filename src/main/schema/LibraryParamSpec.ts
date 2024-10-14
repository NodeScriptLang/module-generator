import { SchemaSpecSchema } from '@nodescript/core/schema';
import { SchemaSpec } from '@nodescript/core/types';
import { Schema } from 'airtight';

import { OpenApiParameterSpec } from '../types.js';

export interface LibraryParamSpec {
    paramName: string;
    paramKey: string;
    description: string;
    in: 'query' | 'header' | 'cookie' | 'path' | 'body' | 'body_raw';
    schema: SchemaSpec;
    required: boolean;
    advanced?: boolean;
    hideValue?: boolean;
    example?: any;
    prefix?: string;
    style?: OpenApiParameterSpec['style'];
    explode?: OpenApiParameterSpec['explode'];
    attributes?: Record<string, any>;
}

export const LibraryParamSpecSchema = new Schema<LibraryParamSpec>({
    type: 'object',
    properties: {
        paramName: { type: 'string' },
        paramKey: { type: 'string' },
        description: { type: 'string' },
        in: {
            type: 'string',
            enum: ['query', 'header', 'cookie', 'path', 'body', 'body_raw'],
        },
        schema: SchemaSpecSchema.schema,
        required: { type: 'boolean' },
        advanced: {
            type: 'boolean',
            optional: true,
        },
        hideValue: {
            type: 'boolean',
            optional: true,
        },
        example: {
            type: 'any',
            optional: true,
        },
        prefix: {
            type: 'string',
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
        attributes: {
            type: 'object',
            properties: {},
            additionalProperties: { type: 'any' },
            optional: true,
        },
    },
});
