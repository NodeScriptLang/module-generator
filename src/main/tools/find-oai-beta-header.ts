import { readFile } from 'fs/promises';
import yaml from 'yaml';

import { OpenApiSpec } from '../types.js';

const file = await readFile('openapi/openai.yaml', 'utf-8');
const spec = yaml.parse(file) as OpenApiSpec;

for (const [path, pathSpec] of Object.entries(spec.paths)) {
    for (const [key, opSpec] of Object.entries(pathSpec)) {
        if (JSON.stringify(opSpec).includes('OpenAI-Beta')) {
            console.info(`${key} ${path}`);
        }
    }
}
