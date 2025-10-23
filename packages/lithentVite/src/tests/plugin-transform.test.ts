import { describe, expect, test, vi } from 'vitest';
import { lithentVitePlugin } from '../plugin';

const runTransform = async (source: string, id = '/src/App.tsx') => {
  const plugin = lithentVitePlugin();
  if (!plugin || !plugin.transform) {
    throw new Error('lithentVitePlugin did not provide a transform hook');
  }

  const warn = vi.fn();
  const transform = plugin.transform as (this: { warn: typeof warn }, code: string, id: string) => unknown;

  const result = await transform.call({ warn }, source, id);

  return { result, warnings: warn };
};

describe('lithentVitePlugin transform', () => {
  test('주석 마커를 Lithent HMR 부트스트랩 코드로 치환하고 import 를 추가한다', async () => {
    const source = `
'use client';
import { render, mount } from 'lithent';

/* lithent:hmr-boundary default */

const App = mount((renew, props) => {
  return () => <div>{props.title}</div>;
});

const root = document.getElementById('root');
if (root) {
  render(<App title="hello" />, root);
}

export default App;
`;

    const { result } = await runTransform(source);

    expect(result).not.toBeNull();
    if (!result) return;

    const transformed = result.code;

    expect(transformed.startsWith(`'use client';\nimport { createBoundary }`)).toBe(true);
    expect(transformed).toContain(
      "import { createBoundary } from 'lithent/devmodetest/createBoundary';"
    );
    expect(transformed).toContain(
      "import type { TagFunction } from 'lithent';"
    );
    expect(transformed.indexOf('createBoundary')).toBeLessThan(
      transformed.indexOf("import { render, mount } from 'lithent';")
    );
    expect(transformed).toContain(
      'const __lithentModuleId = new URL(import.meta.url).pathname;'
    );
    expect(transformed).toContain('__lithentSetupHmrHooks();');
    expect(transformed).toContain('const __lithentHmrTargets = ["default"];');
    expect(transformed).not.toContain('/* lithent:hmr-boundary');
    expect(transformed.indexOf('__lithentModuleId')).toBeGreaterThan(
      transformed.indexOf("import { render, mount } from 'lithent';")
    );
  });

  test('이미 필요한 import 가 존재할 때 중복 삽입하지 않는다', async () => {
    const source = `
"use client";
import type { TagFunction } from 'lithent';
import { createBoundary } from 'lithent/devmodetest/createBoundary';
import { render, mount } from 'lithent';

/* lithent:hmr-boundary Counter */

export const Counter = mount((renew, props) => {
  return ({ value }: { value: number }) => <span>{value}</span>;
});
`;

    const { result } = await runTransform(source, '/src/Counter.tsx');

    expect(result).not.toBeNull();
    if (!result) return;

    const transformed = result.code;
    const importOccurrences = transformed.match(
      /createBoundary\s+from\s+'lithent\/devmodetest\/createBoundary'/g
    );
    const tagImportOccurrences = transformed.match(
      /TagFunction\s+}\s+from\s+'lithent'/g
    );

    expect(importOccurrences).toHaveLength(1);
    expect(tagImportOccurrences).toHaveLength(1);
    expect(transformed).toContain(
      'const __lithentHmrTargets = ["Counter"];'
    );
  });

  test('마커 없이도 Lithent 엔트리를 감지해 HMR 부트스트랩을 삽입한다', async () => {
    const source = `
'use client';
import { render, mount } from 'lithent';

const App = mount((renew, props) => {
  return () => <div>{props.title}</div>;
});

const root = document.getElementById('root');
if (root) {
  render(<App title="auto" />, root);
}

export default App;
`;

    const { result } = await runTransform(source, '/src/App.tsx');

    expect(result).not.toBeNull();
    if (!result) return;

    const transformed = result.code;
    expect(transformed.startsWith(`'use client';\nimport { createBoundary }`)).toBe(
      true
    );
    expect(transformed).toContain(
      "import { createBoundary } from 'lithent/devmodetest/createBoundary';"
    );
    expect(transformed).toContain(
      "import type { TagFunction } from 'lithent';"
    );
    expect(transformed).toContain(
      'const __lithentHmrTargets = ["default"];'
    );
    expect(transformed.indexOf('createBoundary')).toBeLessThan(
      transformed.indexOf("import { render, mount } from 'lithent';")
    );
    expect(transformed.indexOf('__lithentModuleId')).toBeGreaterThan(
      transformed.indexOf("import { render, mount } from 'lithent';")
    );
  });
});
