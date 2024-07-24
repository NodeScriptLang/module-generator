#!/usr/bin/env node
import chalk from 'chalk';
import { createHash } from 'crypto';
import { configDotenv } from 'dotenv';
import { mkdir, readFile, writeFile } from 'fs/promises';
import path from 'path';
import yaml from 'yaml';

import { OpenApiGenerator } from './OpenApiGenerator.js';

// Use .env to configure keys and generation options
configDotenv({ path: '.env' });

// The file arg must point to OpenAPI spec in JSON
const file = process.argv[2];
if (!file) {
    throw new Error('File is required');
}
const apiSpec = JSON.parse(await readFile(file, 'utf-8'));

// Optionally .config.yaml can be used to further customize generation
const configFile = file.replace(/\.json$/gi, '.config.yaml');
const configSpec = yaml.parse(await readFile(configFile, 'utf-8').catch(() => '{}'));

// Generated specs will be placed in .generated dir
const targetDir = path.join('.generated', path.basename(file).replace(/\.json$/, ''));
await mkdir(targetDir, { recursive: true });

const generator = new OpenApiGenerator(apiSpec, {
    openAiKey: process.env.OPENAI_KEY ?? '',
    proxy: process.env.HTTP_PROXY ?? '',
    skipInvalid: process.env.SKIP_INVALID === 'true',
    ...configSpec,
});

// Parse all OpenAPI endpoints
generator.parseModules();

// Infer names and categories with AI (slow)
await generator.inferServiceName();
await generator.inferModuleNames();

for (const module of generator.modules) {
    const moduleName = await module.getModuleName();
    const baseFilename = module.inferredName.replace(/\s+/g, '').replace(/\//gi, '.');
    try {
        // First generate the code
        const moduleCode = await module.generateModuleCode();
        const moduleCodeFile = path.join(targetDir, baseFilename + '.mjs');
        writeFile(moduleCodeFile, moduleCode, 'utf-8');
        // Also evaluate the hash of the code
        // (subsequently used in publishing to avoid bumping unchanged modules)
        const codeHash = createHash('sha256').update(moduleCode.trim(), 'utf-8').digest('hex');
        // Now generate module spec
        const moduleSpec = await module.generateModuleSpec({
            attributes: {
                codeHash
            }
        });
        const moduleSpecFile = path.join(targetDir, baseFilename + '.json');
        writeFile(moduleSpecFile, JSON.stringify(moduleSpec, null, 2), 'utf-8');
        // Done
        console.info(`${chalk.green('✔️')} ${moduleName}`);
    } catch (error) {
        // Optionally can skip invalid modules
        if (generator.options.skipInvalid) {
            console.error(`${chalk.red('✗')} ${moduleName}`);
            console.error(error);
        } else {
            throw error;
        }
    }
}
