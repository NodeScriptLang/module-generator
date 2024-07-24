// TODO consider implementing schema for decoding the specs

export interface OpenApiSpec {
    openapi: string;
    servers: { url: string }[];
    tags: {
        name: string;
        description?: string;
    }[];
    info: {
        title: string;
        description?: string;
        version?: string;
        'x-logo'?: { url: string };
        'x-origin'?: { url: string };
    };
    externalDocs?: {
        url: string;
        description?: string;
    };
    paths: {
        [key: string]: {
            servers?: { url: string }[];
            parameters?: OpenApiParameterSpec[];
            get?: OpenApiOperationSpec;
            put?: OpenApiOperationSpec;
            post?: OpenApiOperationSpec;
            delete?: OpenApiOperationSpec;
            patch?: OpenApiOperationSpec;
            options?: OpenApiOperationSpec;
            head?: OpenApiOperationSpec;
            trace?: OpenApiOperationSpec;
        };
    };
    components?: {
        securitySchemes:{
            [key: string]: OpenApiSecuritySchemeSpec;
        };
        [key: string]: any;
    };
}

export interface OpenApiOperationSpec {
    tags?: string[];
    summary?: string;
    description?: string;
    externalDocs?: {
        url: string;
        description: string;
    };
    operationId?: string;
    parameters?: OpenApiParameterSpec[];
    requestBody?: OpenApiRequestBodySpec;
    security?: OpenApiSecurityRequirementsSpec[];
}

export interface OpenApiParameterSpec {
    $ref?: string;
    name: string;
    in: 'path' | 'query' | 'header' | 'cookie';
    description?: string;
    required?: boolean;
    schema?: OpenApiSchemaSpec;
    style?: 'form' | 'simple' | 'spaceDelimited' | 'pipeDelimited'; // There are more, but not yet supported
    explode?: boolean;
}

export interface OpenApiRequestBodySpec {
    $ref?: string;
    content: {
        [key: string]: {
            $ref?: string;
            schema?: OpenApiSchemaSpec;
        };
    };
    required?: boolean;
}

export interface OpenApiSecurityRequirementsSpec {
    [key: string]: string[];
}

export interface OpenApiSchemaSpec {
    $ref?: string;
    type?: string;
    items?: OpenApiSchemaSpec;
    properties?: OpenApiSchemaSpec;
    additionalProperties?: boolean | OpenApiSchemaSpec;
    required?: string[];
    enum?: string[];
    minimum?: number;
    maximum?: number;
    description?: string;
    default?: any;
    example?: any;
}

export interface OpenApiSecuritySchemeSpec {
    type: 'apiKey' | 'http' | 'mutualTLS' | 'oauth2' | 'openIdConnect';
    description?: string;
    in: 'query' | 'header' | 'cookie';
    name?: string;
    scheme?: string;
    bearerFormat?: string;
    flows?: {
        [key: string]: {
            authorizationUrl?: string;
            tokenUrl?: string;
            refreshUrl?: string;
            scopes?: string[];
        };
    };
    openIdConnectUrl?: string;
}
