import arg from 'arg';
import { readFile } from 'fs/promises';
import yaml from 'yaml';

import { LibrarySpec } from '../schema/LibrarySpec.js';

const args = arg({
    '--in': String,
    '-i': '--in',
});

const sourceFile = args['--in'];
if (!sourceFile) {
    throw new Error('Usage: --in=<spec file>');
}

const file = await readFile(sourceFile, 'utf-8');
const spec = yaml.parse(file) as LibrarySpec;

const moduleNames: string[] = [];

for (const module of spec.modules) {
    moduleNames.push(module.moduleName);
}

moduleNames.sort();
console.info(moduleNames.join('\n'));
