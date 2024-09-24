#!/usr/bin/env node
import arg from 'arg';
import { configDotenv } from 'dotenv';
import { mkdir, readFile, writeFile } from 'fs/promises';
import path from 'path';
import yaml from 'yaml';

import { LibrarySpec, LibrarySpecSchema } from '../main/schema/LibrarySpec.js';
import { InvalidSpecError } from '../main/errors.js';

// Use .env to configure keys and generation options
const env = process.env.NODE_ENV || 'development';
configDotenv({ path: '.env' });
configDotenv({ path: `.env.${env}` });

const args = arg({
    '--in': String,
    '--out': String,
    '-i': '--in',
    '-o': '--out',
});

const sourceFile = args['--in'];
if (!sourceFile) {
    throw new Error('Usage: --in=<input spec file> [--out=<output spec file>]');
}

const targetFile = args['--out'] ?? sourceFile;
const targetDir = path.dirname(targetFile);
await mkdir(targetDir, { recursive: true });
const fileContent = await readFile(sourceFile, 'utf-8');

let librarySpec: LibrarySpec;
try {
    const parsedYaml = yaml.parse(fileContent);
    librarySpec = LibrarySpecSchema.decode(parsedYaml);
} catch (error) {
    throw new InvalidSpecError(`Failed to parse and decode the LibrarySpec YAML file: ${error}`);
}
// Add appConnectionTemplateId to the root of LibrarySpec
if (!librarySpec.attributes) {
    librarySpec.attributes = {};
}
librarySpec.attributes.appConnectionTemplateId = librarySpec.id;
// Add appConnectionTemplateId to each module's attributes
for (const module of librarySpec.modules) {
    if (!module.attributes) {
        module.attributes = {};
    }
    module.attributes.appConnectionTemplateId = librarySpec.id;
}
const libraryYaml = yaml.stringify(librarySpec, {
    aliasDuplicateObjects: false,
});
await writeFile(targetFile, libraryYaml, 'utf-8');
