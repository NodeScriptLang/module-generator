import { ModuleSpec } from '@nodescript/core/types';

export class NodeScriptApi {

    constructor(
        public apiUrl = 'https://api.nodescript.dev',
        public registryUrl = 'https://registry.nodescript.dev',
        public token = '',
    ) {}

    async getWorkspaceModules(workspaceId: string): Promise<ModuleSpec[]> {
        const { modules } = await this.sendGet('/Module/getWorkspaceModules', { workspaceId });
        return modules.map((_: any) => _.moduleSpec);
    }

    async publishModule(spec: PublishEsmSpec) {
        await this.sendPost('/Module/publishEsm', { spec });
    }

    async sendGet(path: string, params: Record<string, any> = {}): Promise<any> {
        const url = new URL(path.replace(/^\//, ''), this.apiUrl);
        for (const [k, v] of Object.entries(params)) {
            url.searchParams.append(k, v);
        }
        const res = await fetch(url, {
            method: 'GET',
            headers: {
                authorization: `Bearer ${this.token}`,
            }
        });
        return await this.processResponse(res);
    }

    async sendPost(path: string, params: Record<string, any> = {}): Promise<any> {
        const url = new URL(path.replace(/^\//, ''), this.apiUrl);
        const res = await fetch(url, {
            method: 'POST',
            headers: {
                authorization: `Bearer ${this.token}`,
                'content-type': 'application/json'
            },
            body: JSON.stringify(params),
        });
        return await this.processResponse(res);
    }

    protected async processResponse(res: Response) {
        if (!res.ok) {
            const errJson = await res.json().catch(err => {
                return {
                    name: err.name,
                    message: err.message,
                };
            });
            const err = new Error();
            err.name = errJson.name ?? 'UnknownError';
            err.message = errJson.message ?? 'Unknown message';
            (err as any).status = res.status;
            throw err;
        }
        return await res.json();
    }

}

export interface PublishEsmSpec {
    workspaceId: string;
    moduleSpec: ModuleSpec;
    computeCode: string;
    bundleCode?: string;
    sourceUrl?: string;
    visibility?: 'private' | 'public';
}
