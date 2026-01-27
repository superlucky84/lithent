#!/usr/bin/env node

import {
  readFileSync,
  writeFileSync,
  mkdirSync,
  existsSync,
  readdirSync,
  rmSync,
  copyFileSync,
} from 'fs';
import { dirname, resolve, extname } from 'path';
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

const replaceVersion = (content) => content.replace(/{{VERSION}}/g, version);

const processFile = (srcPath, destPath) => {
  mkdirSync(dirname(destPath), { recursive: true });
  if (extname(srcPath) === '.md') {
    const output = replaceVersion(readFileSync(srcPath, 'utf-8'));
    writeFileSync(destPath, output, 'utf-8');
    return;
  }
  copyFileSync(srcPath, destPath);
};

const processDirectory = (srcDir, destDir) => {
  mkdirSync(destDir, { recursive: true });
  const entries = readdirSync(srcDir, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = resolve(srcDir, entry.name);
    const destPath = resolve(destDir, entry.name);
    if (entry.isDirectory()) {
      processDirectory(srcPath, destPath);
      continue;
    }
    if (entry.isFile()) {
      processFile(srcPath, destPath);
    }
  }
};

const skillDir = 'skills';
const skillSrcDir = resolve(rootDir, skillDir);
const skillDistDir = resolve(distDir, skillDir);

if (existsSync(skillDistDir)) {
  rmSync(skillDistDir, { recursive: true, force: true });
}

processDirectory(skillSrcDir, skillDistDir);
console.log(`Built ${skillDir}/ with version ${version}`);

// Files to process
const files = ['lithent-agent-addon.md'];

for (const file of files) {
  const content = readFileSync(resolve(rootDir, file), 'utf-8');
  const output = replaceVersion(content);
  writeFileSync(resolve(distDir, file), output, 'utf-8');
  console.log(`Built ${file} with version ${version}`);
}
