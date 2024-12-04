import MakePage from './makePage.js';

export default class DevMakePage extends MakePage {
  constructor(info) {
    super(info);
  }

  addLoaderFromPageString(appHtmlOrig, initProp) {
    return appHtmlOrig.replace(
      '</body>',
      `<script type="module">
                  import load from '/src/base/load';
                  load('${this.key}', ${JSON.stringify(
        Object.assign({}, this.props)
      )}, ${JSON.stringify(initProp)});
                 </script></body>`
    );
  }

  async makePageString(Layout, Page) {
    const pageString = this.commonPageToString(Layout, Page);

    return await this.vite.transformIndexHtml(this.req.originalUrl, pageString);
  }

  async makeComponents() {
    const { default: Oops } = await this.vite.ssrLoadModule(
      `@/components/Oops`
    );
    const { default: Layout } = await this.vite.ssrLoadModule(`@/layout`);
    const { default: Page, preload } = await this.vite.ssrLoadModule(
      `@/pages/${this.key}`
    );

    return { Oops, Layout, Page, preload };
  }
}
