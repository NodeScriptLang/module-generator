#!/usr/bin/env node
import { ModuleSpecSchema } from '@nodescript/core/schema';
import arg from 'arg';
import chalk from 'chalk';
import { execSync } from 'child_process';
import { createHash } from 'crypto';
import { configDotenv } from 'dotenv';
import { readdir, readFile } from 'fs/promises';
import path from 'path';
import semver from 'semver';

import { NodeScriptApi } from '../main/services/NodeScriptApi.js';

// Use .env to configure keys and generation options
const env = process.env.NODE_ENV || 'development';
configDotenv({ path: '.env' });
configDotenv({ path: `.env.${env}` });
configDotenv({ path: `.env.openapi` });

const args = arg({
    '--in': String,
    '-i': '--in',
});

const sourceFile = args['--in'];
if (!sourceFile) {
    throw new Error('Usage: --in=<spec file>');
}

const id = path.basename(sourceFile).replace(/\.(json|yaml)$/gi, '');

const targetDir = path.join('generated', id);
const files = (await readdir(targetDir))
    .filter(_ => _.endsWith('.json'))
    .map(_ => path.join(targetDir, _));


let configJson: Record<string, any> = {};

if (env === 'production') {
    try {
        configJson = JSON.parse(execSync('sops -d ./secrets/production/config.json', { encoding: 'utf-8' }));
        console.info(chalk.green('✔️'), 'Key file decrypted successfully');
    } catch (error) {
        console.error(chalk.red('✗'), 'Failed to decrypt key file');
        console.error(error);
        process.exit(1);
    }
} else if (env === 'development') {
    configJson = JSON.parse(await readFile(`./secrets/development/config.json`, 'utf-8'));
} else {
    throw new Error(`NODE_ENV not set`);
}

const config = configJson[id];
if (!config) {
    throw new Error(`Missing config for ${id} in config.json`);
}

const workspaceId = config.workspaceId;
if (!workspaceId) {
    throw new Error(`Missing workspaceId in config.json`);
}


const nsApi = new NodeScriptApi(
    process.env.NODESCRIPT_API_URL,
    process.env.NODESCRIPT_REGISTRY_URL,
    config.key,
);
const forcePublish = process.env.FORCE_PUBLISH === 'true';

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
            console.info(`${chalk.yellow('Skipping')} ${moduleSpec.moduleName}`);
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
