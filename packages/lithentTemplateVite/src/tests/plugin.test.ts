import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it, beforeEach } from 'vitest';
import type { Plugin, ResolvedConfig, UserConfig } from 'vite';
import { lithentTemplateVite } from '../plugin';

interface TransformResult {
  code: string;
  map: any;
}

const createPlugin = () => {
  const plugin = lithentTemplateVite();
  const plugins = Array.isArray(plugin) ? plugin.filter(Boolean) : [plugin];
  return plugins as Plugin[];
};

const setupPlugins = (
  plugins: Plugin[],
  command: 'serve' | 'build' = 'serve'
) => {
  const userConfig: UserConfig = {};
  const env = {
    command,
    mode: command === 'serve' ? 'development' : 'production',
    ssrBuild: false,
  };

  for (const plugin of plugins) {
    if (plugin.config) {
      plugin.config.call(plugin, userConfig, env);
    }
  }

  const resolved: ResolvedConfig = {
    configFile: null,
    mode: env.mode,
    root: process.cwd(),
    define: {},
    plugins: plugins as any,
    build: {} as any,
    optimizeDeps: {} as any,
    server: {} as any,
    resolve: {} as any,
    css: {} as any,
    publicDir: '',
    cacheDir: '',
    command,
    assetsInclude: () => false,
    logger: console as any,
    base: '/',
    cacheDirOutput: '',
    experimental: {} as any,
    env: {} as any,
    isProduction: command === 'build',
    preview: {} as any,
    ssr: {} as any,
    worker: {} as any,
    appType: 'spa',
    envDir: process.cwd(),
    esbuild: {} as any,
    extensions: [],
    inlineConfig: {} as any,
    json: {} as any,
    legacy: {} as any,
  };

  for (const plugin of plugins) {
    plugin.configResolved?.call(plugin, resolved);
  }
};

const runTransforms = async (
  plugins: Plugin[],
  initial: string,
  id: string
): Promise<TransformResult> => {
  const context = {
    warn: () => {},
    addWatchFile: () => {},
  };

  let resolvedId: string = id;
  for (const plugin of plugins) {
    if (!plugin.resolveId) {
      continue;
    }
    const resolution = await plugin.resolveId.call(context as any, resolvedId, undefined, {});
    if (resolution == null) {
      continue;
    }
    if (typeof resolution === 'string') {
      resolvedId = resolution;
      break;
    }
    if (typeof resolution === 'object' && 'id' in resolution) {
      resolvedId = resolution.id!;
      break;
    }
  }

  let code: string | null = null;
  let map: any = null;

  for (const plugin of plugins) {
    if (!plugin.load) {
      continue;
    }
    const loaded = await plugin.load.call(context as any, resolvedId);
    if (loaded == null) {
      continue;
    }
    if (typeof loaded === 'string') {
      code = loaded;
      map = null;
    } else {
      code = loaded.code;
      map = loaded.map ?? null;
    }
    break;
  }

  if (code === null) {
    code = initial;
    map = null;
  }

  for (const plugin of plugins) {
    if (!plugin.transform) {
      continue;
    }
    const transformed = await plugin.transform.call(context as any, code, resolvedId);
    if (transformed == null) {
      continue;
    }
    if (typeof transformed === 'string') {
      code = transformed;
      map = null;
    } else {
      code = transformed.code;
      map = transformed.map ?? null;
    }
  }

  return { code, map };
};

describe('lithentTemplateVite plugin', () => {
  let plugins: Plugin[];
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);

  beforeEach(() => {
    plugins = createPlugin();
    setupPlugins(plugins);
  });

  it('transforms l-for template with plain text content', async () => {
    const filePath = path.resolve(__dirname, './fixtures/view.ltsx');
    const code = await readFile(filePath, 'utf-8');
    const result = await runTransforms(plugins, code, filePath);

    expect(result.code).toContain('todos.map((todo, index) =>');
    expect(result.code).toMatch(
      /h\("strong", { class: "todo-status pending" }, "Pending\\n\s*"\)/
    );
  });

  it('skips transformation for non-matching files', async () => {
    const code = `<div>test</div>`;
    const result = await runTransforms(plugins, code, 'script.js');

    expect(result.code).toBe(code);
  });

  it('does not transform .tsx files by default', async () => {
    const code = `
      import { useState } from 'react';
      export const Example = ({ todos }) => (
        <div>
          <li l-for={(todo, index) in todos} class="todo-item">
            <span>{todo.text}</span>
          </li>
        </div>
      );
    `;
    const result = await runTransforms(plugins, code, 'component.tsx');
    expect(result.code).toBe(code);
  });
});
