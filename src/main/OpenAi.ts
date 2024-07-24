import { createHash } from 'crypto';
import fs from 'fs/promises';
import path from 'path';
import { getGlobalDispatcher, ProxyAgent, request } from 'undici';

import { InvalidAiResponseError } from './errors.js';

export class OpenAiService {

    cacheDir = '.aicache/openai';

    constructor(
        public openAiKey: string,
        public proxy: string = '',
    ) {}

    async generateCompletion(prompt: string[], model = 'gpt-4o') {
        const promptText = prompt.join('\n\n');
        const key = createHash('sha256').update(promptText, 'utf-8').digest('hex');
        const cacheFile = path.join(this.cacheDir, key + '.cache.txt');
        const promptFile = path.join(this.cacheDir, key + '.prompt.txt');
        const metaFile = path.join(this.cacheDir, key + '.meta.txt');
        const exists = await fs.stat(cacheFile).then(() => true, () => false);
        if (exists) {
            const cached = await fs.readFile(cacheFile, 'utf-8');
            return JSON.parse(cached);
        }
        const dispatcher = this.getDispatcher();
        const res = await request('https://api.openai.com/v1/chat/completions', {
            dispatcher,
            method: 'POST',
            headers: {
                'authorization': `Bearer ${this.openAiKey}`,
                'content-type': 'application/json',
            },
            body: JSON.stringify({
                model,
                response_format: {
                    type: 'json_object',
                },
                messages: [
                    {
                        role: 'system',
                        content: 'You provide machine-readable responses in JSON format.'
                    },
                    {
                        role: 'user',
                        content: promptText,
                    },
                ],
            }),
        });
        if (res.statusCode !== 200) {
            throw new InvalidAiResponseError(`OpenAI returned ${res.statusCode}`, await res.body.text());
        }
        const json = await res.body.json() as OpenAiCompletionResponse;
        const choice = json.choices[0];
        if (choice.finish_reason !== 'stop') {
            throw new InvalidAiResponseError('AI did not generate full response', json);
        }
        const parsed = JSON.parse(choice.message.content);
        await fs.mkdir(path.dirname(cacheFile), { recursive: true });
        await fs.writeFile(cacheFile, JSON.stringify(parsed, null, 2), 'utf-8');
        await fs.writeFile(promptFile, promptText, 'utf-8');
        await fs.writeFile(metaFile, JSON.stringify({ usage: json.usage }, null, 2), 'utf-8');
        return parsed;
    }

    private getDispatcher() {
        if (this.proxy) {
            const proxyUrl = new URL(this.proxy);
            const auth = (proxyUrl.username || proxyUrl.password) ? this.makeBasicAuth(proxyUrl.username, proxyUrl.password) : undefined;
            return new ProxyAgent({
                uri: this.proxy,
                token: auth,
            });
        }
        return getGlobalDispatcher();
    }

    private makeBasicAuth(username: string, password: string) {
        return `Basic ${Buffer.from(username + ':' + password).toString('base64')}`;
    }

}

export interface OpenAiCompletionResponse {
    choices: OpenAiCompletionChoice[];
    model: string;
    usage: {
        'completion_tokens': number;
        'prompt_tokens': number;
        'total_tokens': number;
    };
}

export interface OpenAiCompletionChoice {
    finish_reason: string;
    index: number;
    message: {
        content: string;
        role: string;
    };
}
