import MakePage from './makePage.js';
import { serializeForScript } from './helper.js';

export default class DevMakePage extends MakePage {
  constructor(info) {
    super(info);
  }

  addLoaderFromPageString(appHtmlOrig, initProp) {
    // A replacer function: a replacement string would expand `$'` and
    // similar patterns that can appear in the serialized data.
    return appHtmlOrig.replace(
      '</body>',
      () => `<script type="module">
        import load from '/src/base/load';
        load(${serializeForScript(this.key)}, ${serializeForScript(
          Object.assign({}, this.props)
        )}, ${serializeForScript(initProp)});
       </script></body>`
    );
  }

  async makePageString(Layout, Page, initProp) {
    const pageString = this.commonPageToString(Layout, Page, initProp);

    return await this.vite.transformIndexHtml(this.req.originalUrl, pageString);
  }

  async makeOopComponents() {
    const { default: Oops } =
      await this.vite.ssrLoadModule(`@/components/Oops`);
    const { default: Layout } = await this.vite.ssrLoadModule(`@/layout`);

    return { Oops, Layout };
  }

  async make404Components() {
    const { default: Not } = await this.vite.ssrLoadModule(
      `@/components/NotFound`
    );
    const { default: Layout } = await this.vite.ssrLoadModule(`@/layout`);

    return { Not, Layout };
  }

  async makeComponents() {
    const { default: Layout } = await this.vite.ssrLoadModule(`@/layout`);
    const { default: Page, preload } = await this.vite.ssrLoadModule(
      `@/pages/${this.key}`
    );

    return { Layout, Page, preload };
  }
}
