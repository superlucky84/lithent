import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { beforeEach, describe, expect, it } from 'vitest';
import { resolveConfig } from 'vite';
import type { ConfigEnv, Plugin, PluginOption, ResolvedConfig } from 'vite';
import { lithentTemplateVite } from '../plugin';

interface TransformResult {
  code: string;
  map: any;
}

const normalizePluginOption = (option: PluginOption): Plugin[] => {
  if (Array.isArray(option)) {
    return option.flatMap(item => normalizePluginOption(item));
  }
  if (!option) {
    return [];
  }
  return [option as Plugin];
};

const createPlugins = (opts?: Parameters<typeof lithentTemplateVite>[0]) => {
  const option = lithentTemplateVite(opts);
  return normalizePluginOption(option).filter(Boolean);
};

type MinimalPlugin = Pick<
  Plugin,
  'config' | 'configResolved' | 'resolveId' | 'load' | 'transform'
>;

const runHook = async (
  plugin: MinimalPlugin,
  hookName: keyof MinimalPlugin,
  context: Record<string, unknown>,
  ...args: unknown[]
): Promise<unknown> => {
  const hook = plugin[hookName];
  if (!hook) {
    return undefined;
  }

  const invoke = async (entry: unknown): Promise<unknown> => {
    if (typeof entry === 'function') {
      return await (entry as (...a: unknown[]) => unknown).apply(context, args);
    }
    if (
      entry &&
      typeof entry === 'object' &&
      'handler' in entry &&
      typeof (entry as { handler: unknown }).handler === 'function'
    ) {
      return await (
        entry as { handler: (...a: unknown[]) => unknown }
      ).handler.apply(context, args);
    }
    return undefined;
  };

  if (Array.isArray(hook)) {
    let last: unknown;
    for (const entry of hook) {
      last = await invoke(entry);
    }
    return last;
  }

  return await invoke(hook);
};

const createPluginContext = () => ({
  warn: () => {},
  addWatchFile: () => {},
  getWatchFiles: () => [] as string[],
  resolve: async () => null,
  load: async () => null,
  transform: async () => null,
});

const setupPlugins = async (
  plugins: Plugin[],
  command: 'serve' | 'build' = 'serve'
): Promise<ResolvedConfig> => {
  const context = createPluginContext();
  const env: ConfigEnv = {
    command,
    mode: command === 'serve' ? 'development' : 'production',
    isSsrBuild: command === 'build',
  };

  const userConfig = {} as Parameters<typeof resolveConfig>[0];

  for (const plugin of plugins) {
    const result = await runHook(plugin, 'config', context, userConfig, env);
    if (result && typeof result === 'object') {
      Object.assign(userConfig, result as object);
    }
  }

  const resolved = (await resolveConfig(
    userConfig,
    command,
    env.mode
  )) as ResolvedConfig;

  await Promise.all(
    plugins.map(plugin => runHook(plugin, 'configResolved', context, resolved))
  );

  return resolved;
};

const runTransforms = async (
  plugins: Plugin[],
  initial: string,
  id: string
): Promise<TransformResult> => {
  const context = createPluginContext();

  let resolvedId = id;
  for (const plugin of plugins) {
    if (!plugin.resolveId) {
      continue;
    }
    const resolution = await runHook(
      plugin,
      'resolveId',
      context,
      resolvedId,
      undefined,
      {}
    );
    if (resolution == null) {
      continue;
    }
    if (typeof resolution === 'string') {
      resolvedId = resolution;
      break;
    }
    if (typeof resolution === 'object' && 'id' in resolution) {
      resolvedId = (resolution as { id: string }).id;
      break;
    }
  }

  let code = initial;
  let map: any = null;

  for (const plugin of plugins) {
    if (!plugin.load) {
      continue;
    }
    const loaded = await runHook(plugin, 'load', context, resolvedId);
    if (loaded == null) {
      continue;
    }
    if (typeof loaded === 'string') {
      code = loaded;
      map = null;
    } else if (loaded && typeof loaded === 'object') {
      const output = loaded as { code?: string; map?: unknown };
      if (typeof output.code === 'string') {
        code = output.code;
      }
      map = output.map ?? null;
    }
    break;
  }

  for (const plugin of plugins) {
    if (!plugin.transform) {
      continue;
    }
    const transformed = await runHook(
      plugin,
      'transform',
      context,
      code,
      resolvedId
    );
    if (transformed == null) {
      continue;
    }
    if (typeof transformed === 'string') {
      code = transformed;
      map = null;
    } else if (transformed && typeof transformed === 'object') {
      const output = transformed as { code?: string; map?: unknown };
      if (typeof output.code === 'string') {
        code = output.code;
      }
      map = output.map ?? null;
    }
  }

  return { code, map };
};

describe('lithentTemplateVite plugin', () => {
  let plugins: Plugin[];
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);

  beforeEach(async () => {
    plugins = createPlugins();
    await setupPlugins(plugins);
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

  it('allows configuring custom extensions', async () => {
    const customPlugins = createPlugins({ extensions: ['.foo'] });
    await setupPlugins(customPlugins);
    const filePath = path.resolve(__dirname, './fixtures/view.foo');
    const code = await readFile(filePath, 'utf-8');
    const result = await runTransforms(customPlugins, code, filePath);
    expect(result.code).toContain('todos.map((todo, index) =>');
  });
});
