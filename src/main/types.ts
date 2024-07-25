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
    paramOverrides?: OpenApiGeneratorParamOverride[];
}

export interface OpenApiGeneratorParamOverride {
    paramName: string;
    overrides: Record<string, any>;
}
