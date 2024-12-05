import fs from 'fs';
import path, { resolve } from 'path';

import { fileURLToPath } from 'url';

const childPath = path.dirname(fileURLToPath(import.meta.url));
const __dirname = path.dirname(childPath);

export function getScriptPath(routeString) {
  const directoryPath = path.resolve(__dirname, 'dist');

  const findFile = (dir, target) => {
    const files = fs.readdirSync(dir, { withFileTypes: true });

    for (const file of files) {
      const fullPath = path.join(dir, file.name);

      if (file.isDirectory()) {
        const found = findFile(fullPath, target);
        if (found) {
          return found;
        }
      } else {
        const relativePath = path.relative(directoryPath, fullPath);

        if (relativePath.endsWith('.d.ts')) {
          continue;
        }

        if (relativePath.includes(target)) {
          return relativePath;
        }
      }
    }
    return null;
  };

  const result = findFile(directoryPath, routeString);
  return result ? `dist/${result}` : null;
}

export function getEntries() {
  const entriesDir = resolve(__dirname, 'src/pages');
  const files = fs.readdirSync(entriesDir);

  return files.reduce((entries, file) => {
    const name = file.replace(/\.js$/, ''); // 확장자 제거
    entries[name] = resolve(entriesDir, file);
    return entries;
  }, {});
}

export function excludeRoutePath(praamsValue) {
  return (
    Object.values(praamsValue).includes('@vite-plugin-checker-runtime') ||
    Object.values(praamsValue).includes('favicon.ico') ||
    Object.values(praamsValue).includes('dist') ||
    Object.values(praamsValue).includes('next') ||
    Object.values(praamsValue).includes('src') ||
    Object.values(praamsValue).includes('_next') ||
    Object.values(praamsValue).includes('@vite') ||
    Object.values(praamsValue).includes('assets')
  );
}
