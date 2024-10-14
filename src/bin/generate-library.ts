#!/usr/bin/env node
import arg from 'arg';
import chalk from 'chalk';
import { createHash } from 'crypto';
import { configDotenv } from 'dotenv';
import { mkdir, readFile, writeFile } from 'fs/promises';
import path from 'path';
import yaml from 'yaml';

import { LibraryGenerator } from '../main/generators/LibraryGenerator.js';
import { LibrarySpecSchema } from '../main/schema/LibrarySpec.js';

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
const librarySpec = LibrarySpecSchema.decode(yaml.parse(await readFile(sourceFile, 'utf-8')));
const id = path.basename(sourceFile).replace(/\.(json|yaml)$/gi, '');

const targetDir = path.join('generated', id);
await mkdir(targetDir, { recursive: true });

const generator = new LibraryGenerator(librarySpec);
const skipInvalid = process.env.SKIP_INVALID === 'true';

for (const mspec of librarySpec.modules) {
    try {
        const baseFilename = mspec.moduleName.replace(/\s+/g, '').replace(/\//gi, '.');
        // First generate the code
        const moduleCode = generator.generateModuleCode(mspec);
        const moduleCodeFile = path.join(targetDir, baseFilename + '.mjs');
        writeFile(moduleCodeFile, moduleCode, 'utf-8');
        // Also evaluate the hash of the code
        // (subsequently used in publishing to avoid bumping unchanged modules)
        const codeHash = createHash('sha256').update(moduleCode.trim(), 'utf-8').digest('hex');
        // Now generate module spec
        const moduleDef = generator.generateModuleDefinition(mspec);
        moduleDef.attributes = {
            ...moduleDef.attributes,
            codeHash,
        };
        const moduleSpecFile = path.join(targetDir, baseFilename + '.json');
        writeFile(moduleSpecFile, JSON.stringify(moduleDef, null, 2), 'utf-8');
        // Done
        console.info(`${chalk.green('✔️')} ${mspec.moduleName}`);
    } catch (error) {
        // Optionally can skip invalid modules
        if (skipInvalid) {
            console.error(`${chalk.red('✗')} ${mspec.moduleName}`);
            console.error(error);
        } else {
            throw error;
        }
    }
}
