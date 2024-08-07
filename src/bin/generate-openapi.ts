#!/usr/bin/env node
import arg from 'arg';
import { configDotenv } from 'dotenv';
import { mkdir, readFile, writeFile } from 'fs/promises';
import path from 'path';
import yaml from 'yaml';

import { OpenApiGenerator } from '../main/generators/OpenApiGenerator.js';

// Use .env to configure keys and generation options
const env = process.env.NODE_ENV || 'development';
configDotenv({ path: `.env.${env}` });
configDotenv({ path: '.env' });

const args = arg({
    '--in': String,
    '--out': String,
    '-i': '--in',
    '-o': '--out',
});

const sourceFile = args['--in'];
if (!sourceFile) {
    throw new Error('Usage: --in=<openapi file> --out=<library spec file>');
}
const openApiSpec = yaml.parse(await readFile(sourceFile, 'utf-8'));

const targetFile = args['--out'];
if (!targetFile) {
    throw new Error('Usage: --in=<openapi file> --out=<library spec file>');
}
const targetDir = path.basename(targetFile).replace(/\.(json|yaml)$/gi, '');
await mkdir(targetDir, { recursive: true });

const id = path.basename(sourceFile).replace(/\.(json|yaml)$/gi, '');

const generator = new OpenApiGenerator(id, openApiSpec, {
    openAiKey: process.env.OPENAI_KEY ?? '',
    proxy: process.env.HTTP_PROXY ?? '',
    skipInvalid: process.env.SKIP_INVALID === 'true',
});

const librarySpec = await generator.generateLibrarySpec();
const libraryYaml = yaml.stringify(librarySpec, {
    aliasDuplicateObjects: false,
});
writeFile(targetFile, libraryYaml, 'utf-8');
