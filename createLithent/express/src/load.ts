import { h, componentUpdate } from 'lithent';
import type { WDom, Props, TagFunction } from 'lithent';
import { hydration } from 'lithent/ssr';
const pageModules = import.meta.glob('./pages/*.tsx');
import { makeRoute } from '@/route';
import Layout from '@/layout';

export default async function load(key: string, props: Props) {
  const res = await pageModules[`./pages/${key}`]();
  const routeRef = makeRoute();

  const { pathname, search } = location;

  // @ts-ignore
  const Page = h(res!.default as TagFunction, props) as WDom;
  const LayoutWDom = h(Layout as TagFunction, {
    page: Page,
  }) as WDom;
  const renewRoot =
    (LayoutWDom.compKey && componentUpdate(LayoutWDom.compKey)) || (() => {});

  routeRef.page = `${pathname}${search}`;
  routeRef.destroy = hydration(LayoutWDom, document.documentElement);
  routeRef.renew = renewRoot;
  routeRef.rVDom = LayoutWDom;
}
