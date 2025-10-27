import { wrapMdxModule, MDX_WRAP_SENTINEL } from '../index';

const sampleMdxOutput = `
function _createMdxContent(props = {}) {
  return null;
}

function MDXContent(props = {}) {
  return _createMdxContent(props);
}
`;

const wrapResult = wrapMdxModule(sampleMdxOutput);

console.log('[mdx] modified:', wrapResult.modified);
console.log('[mdx] code:', wrapResult.code);

if (import.meta.vitest) {
  const { describe, it, expect } = import.meta.vitest;

  describe('wrapMdxModule', () => {
    it('exports MDX functions and wraps default export for lithent HMR', () => {
      expect(wrapResult.modified).toBe(true);
      expect(wrapResult.code).toContain(MDX_WRAP_SENTINEL);
      expect(wrapResult.code).toContain("import { mount } from 'lithent';");
      expect(wrapResult.code).toContain('export function _createMdxContent');
      expect(wrapResult.code).toContain(
        'const __LithentMdxComponent_MDXContent'
      );
      expect(wrapResult.code).toContain(
        'export default __LithentMdxComponent_MDXContent;'
      );
    });
  });
}
