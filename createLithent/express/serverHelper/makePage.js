import { h } from 'lithent';
import { renderToString } from 'lithent/ssr';

export default class MakePage {
  constructor({ key, req, props, isDev, vite }) {
    this.key = key || '';
    this.props = props;
    this.vite = vite;
    this.isDev = isDev;
    this.req = req;
    this.status = 200;
  }
  async run() {
    const { Layout, Page, preload } = await this.makeComponents();
    const initProp = await this.makePageData(preload);
    // A preload that returns `{ notFound: true }` answers with HTTP 404.
    this.status = initProp?.notFound ? 404 : 200;

    const appHtmlOrig = await this.makePageString(Layout, Page, initProp);
    const finalHtml = this.addLoaderFromPageString(appHtmlOrig, initProp);

    return finalHtml;
  }
  async runOops() {
    this.status = 500;
    const { Oops, Layout } = await this.makeOopComponents();

    const appHtmlOrig = await this.makePageString(Layout, Oops, null);
    const finalHtml = this.addLoaderFromPageString(appHtmlOrig, null);

    return finalHtml;
  }
  async run404() {
    this.status = 404;
    const { Not, Layout } = await this.make404Components();

    const appHtmlOrig = await this.makePageString(Layout, Not, null);
    const finalHtml = this.addLoaderFromPageString(appHtmlOrig, null);

    return finalHtml;
  }
  async makePageData(preload) {
    let initProp = null;
    if (preload) {
      initProp = await preload(this.props);
    }

    return initProp;
  }
  commonPageToString(Layout, Page, initProp) {
    // Components read the page data from this global while rendering.
    // Set it right before the synchronous render, never across an `await`:
    // concurrent requests would otherwise render each other's data.
    globalThis.pagedata = initProp;
    let pageString = renderToString(
      h(Layout, Object.assign({ page: Page }, this.props))
    );
    return `<!doctype html>${pageString}`;
  }
}
