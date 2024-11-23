import { readFile, writeFile } from 'fs/promises';
import yaml from 'yaml';

import { OpenApiOperationSpec, OpenApiSpec } from '../types.js';

const file = await readFile('openapi/github.original.yaml', 'utf-8');
const spec = yaml.parse(file) as OpenApiSpec;

const tags = [
    // 'actions',
    'activity',
    'emojis',
    'dependabot',
    'gists',
    'git',
    'issues',
    'meta',
    'orgs',
    'packages',
    'projects',
    'pulls',
    'reactions',
    'repos',
    'search',
    'teams',
    'users',
];

spec.tags = spec.tags.filter(_ => tags.includes(_.name));

for (const [path, pathSpec] of Object.entries(spec.paths)) {
    for (const [key, obj] of Object.entries(pathSpec)) {
        const opSpec = obj as OpenApiOperationSpec;
        if (!opSpec.operationId) {
            continue;
        }
        const isLegacy = opSpec.operationId.includes('-legacy');
        const retain = !isLegacy && opSpec.tags && opSpec.tags.some(_ => tags.includes(_));
        if (!retain) {
            console.info(`Removed ${path} -> ${key}`);
            delete (pathSpec as any)[key];
        }
    }
    if (Object.keys(pathSpec).length === 0) {
        console.info(`Removed ${path}`);
        delete (spec.paths as any)[path];
    }
}

let totalCount = 0;

for (const [_path, pathSpec] of Object.entries(spec.paths)) {
    totalCount += Object.keys(pathSpec).length;
}

console.info(`\n\nSummary: ${totalCount} endpoints`);

await writeFile('openapi/github.stripped.yaml', yaml.stringify(spec), 'utf-8');
