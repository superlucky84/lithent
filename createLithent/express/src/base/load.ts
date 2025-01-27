import { h, componentUpdate } from 'lithent';
import type { WDom, Props, TagFunction } from 'lithent';
import { hydration } from 'lithent/ssr';
const pageModules = import.meta.glob('../pages/*.(tsx|mdx)');
import { makeRoute, loadPage } from '@/base/route';
import { routeRef } from '@/base/routeStore';
import Layout from '@/layout';

export default async function load(
  key?: string,
  props?: Props,
  initProp?: any
) {
  let res;
  if (key === 'oops') {
    res = await import('@/components/Oops');
  } else if (key === 'notfound') {
    res = await import('@/components/NotFound');
  } else {
    res = await pageModules[`../pages/${key}`]();
  }

  makeRoute();

  const { pathname, search } = location;

  (globalThis as any).pagedata = initProp;
  // const Page = h(res!.default as TagFunction, props) as WDom;
  const LayoutWDom = h(
    Layout as TagFunction,
    Object.assign(
      {
        // @ts-ignore
        page: res!.default,
      },
      props
    )
  ) as WDom;

  const renewRoot =
    (LayoutWDom.compKey && componentUpdate(LayoutWDom.compKey)) || (() => {});

  routeRef.info.page.value = `${pathname}${search}`;
  routeRef.info.renew.value = renewRoot;
  routeRef.info.rVDom.value = LayoutWDom;

  hydration(LayoutWDom, document.documentElement);
}

if (import.meta.hot) {
  import.meta.hot.accept(() => {
    console.log('Accept up resources...');
    loadPage(routeRef.info.page.value);
  });

  import.meta.hot.dispose(() => {
    console.log('Cleaning up resources...');
    routeRef.abortList.forEach(item => {
      item.abort();
    });
    routeRef.abortList = [];
  });
}
