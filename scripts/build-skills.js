#!/usr/bin/env node

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = resolve(__dirname, '..');

// Read package.json to get version
const packageJson = JSON.parse(
  readFileSync(resolve(rootDir, 'package.json'), 'utf-8')
);
const version = packageJson.version;

// Ensure dist directory exists
const distDir = resolve(rootDir, 'dist');
if (!existsSync(distDir)) {
  mkdirSync(distDir, { recursive: true });
}

// Files to process
const files = ['lithent-skills.md', 'lithent-agent-addon.md'];

for (const file of files) {
  const content = readFileSync(resolve(rootDir, file), 'utf-8');
  const output = content.replace('{{VERSION}}', version);
  writeFileSync(resolve(distDir, file), output, 'utf-8');
  console.log(`Built ${file} with version ${version}`);
}
