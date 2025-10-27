import type { Plugin, PluginOption } from 'vite';
import mdxRollup from '@mdx-js/rollup';
import { wrapMdxModule } from './transform';

export interface LithentMdxPluginOptions {
  /**
   * MDX plugin options to pass to @mdx-js/rollup
   */
  mdxOptions?: Record<string, unknown>;

  /**
   * JSX import source for MDX files
   * @default 'lithent'
   */
  jsxImportSource?: string;
}

export const lithentMdx = (
  options: LithentMdxPluginOptions = {}
): PluginOption => {
  const jsxImportSource = options.jsxImportSource ?? 'lithent';

  // Create the MDX rollup plugin with Lithent-specific JSX settings
  const mdxPlugin = mdxRollup({
    jsxImportSource,
    ...options.mdxOptions,
  });

  // Create the wrapper plugin that adds mount() wrapping
  const wrapperPlugin: Plugin = {
    name: 'lithent:mdx-wrapper',
    enforce: undefined, // normal - runs after mdxPlugin in array order

    transform(code, id) {
      const [filepath] = id.split('?', 1);

      // Only process .mdx files
      if (!/\.mdx$/i.test(filepath)) {
        return null;
      }

      // Wrap MDXContent with mount() and add export default
      const result = wrapMdxModule(code);

      if (!result.modified) {
        return null;
      }

      return {
        code: result.code,
        map: null,
      };
    },
  };

  // Return both plugins as an array
  // Order matters: mdxPlugin first (MDX → JSX), then wrapperPlugin (add mount())
  return [mdxPlugin, wrapperPlugin];
};

export default lithentMdx;
