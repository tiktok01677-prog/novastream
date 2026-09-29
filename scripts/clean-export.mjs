import fs from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
await Promise.all(['.next', 'out', 'dist'].map((directory) => fs.rm(path.join(root, directory), {recursive: true, force: true})));
console.log('✓ Previous build output cleared');
