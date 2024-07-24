#!/usr/bin/env node
import { ModuleSpecSchema } from '@nodescript/core/schema';
import chalk from 'chalk';
import { createHash } from 'crypto';
import { configDotenv } from 'dotenv';
import { readdir, readFile } from 'fs/promises';
import path from 'path';
import semver from 'semver';
import yaml from 'yaml';

import { NodeScriptApi } from './NodeScriptApi.js';

// Use .env to configure API endpoints and keys
const env = process.env.NODE_ENV || 'development';
configDotenv({ path: `env.${env}` });
configDotenv({ path: '.env' });
const forcePublish = process.env.FORCE_PUBLISH === 'true';

// The file arg must point to OpenAPI spec in JSON
// Note: it is expected that it was already processed by `generate`
// and the generated specs exist
const file = process.argv[2];
if (!file) {
    throw new Error('File is required');
}
// Config file is required here, it must contain target workspaceId
const configFile = file.replace(/\.json$/gi, '.config.yaml');
const configSpec = yaml.parse(await readFile(configFile, 'utf-8'));
const workspaceId = configSpec.workspaceId[env];
if (!workspaceId) {
    throw new Error(`Missing workspaceId in ${configFile}`);
}

// Read generated module specs
const targetDir = path.join('.generated', path.basename(file).replace(/\.json$/, ''));
const files = (await readdir(targetDir))
    .filter(_ => _.endsWith('.json'))
    .map(_ => path.join(targetDir, _));

// NodeScript API is configured via .env
const nsApi = new NodeScriptApi(
    process.env.NODESCRIPT_API_URL,
    process.env.NODESCRIPT_REGISTRY_URL,
    process.env.NODESCRIPT_API_TOKEN,
);

// Fetch existing modules, so that we do not publish the unchanged modules
const existingModules = await nsApi.getWorkspaceModules(workspaceId);

for (const file of files) {
    try {
        const moduleSpecJson = JSON.parse(await readFile(file, 'utf-8'));
        const moduleSpec = ModuleSpecSchema.decode(moduleSpecJson);
        const moduleCode = await readFile(file.replace(/\.json$/gi, '.mjs'), 'utf-8');
        const codeHash = createHash('sha256').update(moduleCode.trim(), 'utf-8').digest('hex');
        const existingModule = existingModules.find(_ => _.moduleName === moduleSpec.moduleName);
        // Skip if unchanged
        // TODO also add checks for params and other relevant things
        const isUnchanged = existingModule?.attributes?.codeHash === codeHash;
        if (isUnchanged && !forcePublish) {
            console.info(`Skipping ${moduleSpec.moduleName}`);
            continue;
        }
        // Infer version from existing module, if exists
        const currentVersion = existingModule?.version ?? '0.0.0';
        const nextVersion = semver.inc(currentVersion, 'patch')!;
        moduleSpec.version = nextVersion;
        // Now publish
        await nsApi.publishModule({
            workspaceId,
            moduleSpec,
            computeCode: moduleCode,
            visibility: 'public',
        });
        console.info(chalk.green('✔️'), moduleSpec.moduleName, nextVersion);
    } catch (error) {
        console.error(chalk.red('✗'), file);
        console.error(error);
    }
}
