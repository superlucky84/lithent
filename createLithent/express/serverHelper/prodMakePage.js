import { getScriptPath } from './helper.js';
import MakePage from './makePage.js';
import path from 'path';

import { fileURLToPath } from 'url';

const childPath = path.dirname(fileURLToPath(import.meta.url));
const __dirname = path.dirname(childPath);

export default class ProdMakePage extends MakePage {
  constructor(info) {
    super(info);
  }

  addLoaderFromPageString(appHtmlOrig, initProp) {
    const loadResourcePath = getScriptPath('base/load.ts');

    return appHtmlOrig.replace(
      '</body>',
      `<script type="module">
                import load from '/${loadResourcePath}';

                load('${this.key}', ${JSON.stringify(
        Object.assign({}, this.props)
      )}, ${JSON.stringify(initProp)});
                </script></body>`
    );
  }

  async makePageString(Layout, Page) {
    const pageString = this.commonPageToString(Layout, Page);

    const cssResourcePath = getScriptPath('style');

    return pageString.replace(
      '</head>',
      `<link rel="stylesheet" href="/${cssResourcePath}"></head>`
    );
  }

  async makeOopComponents() {
    const oopsResourcePath = getScriptPath(`components/Oops.tsx`);
    const oopsPath = path.resolve(__dirname, oopsResourcePath);

    const layoutResourcePath = getScriptPath('layout.ts');
    const layoutPath = path.resolve(__dirname, layoutResourcePath);

    const oops = await import(oopsPath);
    const Oops = oops.default;

    const layoutModule = await import(layoutPath);
    const Layout = layoutModule.default;

    return { Oops, Layout };
  }

  async make404Components() {
    const notResourcePath = getScriptPath(`components/NotFound.tsx`);
    const notPath = path.resolve(__dirname, notResourcePath);

    const layoutResourcePath = getScriptPath('layout.ts');
    const layoutPath = path.resolve(__dirname, layoutResourcePath);

    const not = await import(notPath);
    const Not = not.default;

    const layoutModule = await import(layoutPath);
    const Layout = layoutModule.default;

    return { Not, Layout };
  }

  async makeComponents() {
    const resourcePath = getScriptPath(`pages/${this.key}`);
    const modulePath = path.resolve(__dirname, resourcePath);

    const layoutResourcePath = getScriptPath('layout.ts');
    const layoutPath = path.resolve(__dirname, layoutResourcePath);

    const module = await import(modulePath);

    const Page = module.default;
    const preload = module.preload;

    const layoutModule = await import(layoutPath);
    const Layout = layoutModule.default;

    return { Layout, Page, preload };
  }
}
