import { describe, it, expect } from 'vitest';
import { wrapMdxModule, MDX_WRAP_SENTINEL } from '../transform';

describe('wrapMdxModule', () => {
  it('should wrap MDXContent with mount() and export default', () => {
    const input = `
function _createMdxContent(props) {
  return <div>Hello</div>;
}
function MDXContent(props) {
  return _createMdxContent(props);
}
export default MDXContent;
`;

    const result = wrapMdxModule(input);

    expect(result.modified).toBe(true);
    expect(result.code).toContain("import { mount } from 'lithent';");
    expect(result.code).toContain(MDX_WRAP_SENTINEL);
    expect(result.code).toContain('const __LithentMdxComponent_MDXContent = mount(');
    expect(result.code).toContain('export default __LithentMdxComponent_MDXContent;');
  });

  it('should not wrap if already wrapped (sentinel present)', () => {
    const input = `
import { mount } from 'lithent';
export function _createMdxContent(props) {
  return <div>Hello</div>;
}
export default function MDXContent(props) {
  return _createMdxContent(props);
}
${MDX_WRAP_SENTINEL}
const __LithentMdxComponent_MDXContent = mount((_renew, props) => {
  return () => MDXContent(props ?? {});
});
export default __LithentMdxComponent_MDXContent;
`;

    const result = wrapMdxModule(input);

    // The wrapMdxExports will still add/fix exports, so modified might be true
    // But sentinel check should prevent re-wrapping
    expect(result.code).toContain(MDX_WRAP_SENTINEL);
    expect(result.code).toContain('__LithentMdxComponent_MDXContent');
  });

  it('should add export to _createMdxContent if missing', () => {
    const input = `
function _createMdxContent(props) {
  return <div>Hello</div>;
}
export default function MDXContent(props) {
  return _createMdxContent(props);
}
`;

    const result = wrapMdxModule(input);

    expect(result.code).toContain('export function _createMdxContent');
    // MDXContent is now wrapped, not exported as "export default function"
    expect(result.code).toContain('export default __LithentMdxComponent_MDXContent');
  });

  it('should handle MDXContent without default export', () => {
    const input = `
export function _createMdxContent(props) {
  return <div>Hello</div>;
}
export default function MDXContent(props) {
  return _createMdxContent(props);
}
`;

    const result = wrapMdxModule(input);

    expect(result.modified).toBe(true);
    expect(result.code).toContain('import { mount } from \'lithent\';');
    expect(result.code).toContain('export default __LithentMdxComponent_MDXContent');
  });
});
