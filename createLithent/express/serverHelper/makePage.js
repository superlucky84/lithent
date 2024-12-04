import { h } from 'lithent';
import { renderToString } from 'lithent/ssr';

export default class MakePage {
  constructor({ key, req, props, isDev, vite }) {
    this.key = key || '';
    this.props = props;
    this.vite = vite;
    this.isDev = isDev;
    this.req = req;
  }
  async run() {
    const { Layout, Page, preload } = await this.makeComponents();
    const initProp = await this.makePageData(preload);

    const appHtmlOrig = await this.makePageString(Layout, Page);
    const finalHtml = this.addLoaderFromPageString(appHtmlOrig, initProp);

    return finalHtml;
  }
  async runOops() {
    const { Oops, Layout } = await this.makeOopComponents();

    const appHtmlOrig = await this.makePageString(Layout, Oops);
    const finalHtml = this.addLoaderFromPageString(appHtmlOrig, null);

    return finalHtml;
  }
  async run404() {
    const { Not, Layout } = await this.make404Components();

    const appHtmlOrig = await this.makePageString(Layout, Not);
    const finalHtml = this.addLoaderFromPageString(appHtmlOrig, null);

    return finalHtml;
  }
  async makePageData(preload) {
    let initProp = null;
    if (preload) {
      initProp = await preload(this.props);
    }

    globalThis.pagedata = initProp;

    return initProp;
  }
  commonPageToString(Layout, Page) {
    let pageString = renderToString(
      h(Layout, Object.assign({ page: Page }, this.props))
    );
    return `<!doctype html>${pageString}`;
  }
}
