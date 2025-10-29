import {
  h,
  componentUpdate,
  // componentMap,
  // replaceWDom
} from 'lithent';
import type { WDom, Props, TagFunction } from 'lithent';
import { hydration } from 'lithent/ssr';
import {
  makeRoute,
  // makePathToKey
} from '@/base/route';
import { routeRef, pageModules } from '@/base/routeStore';
import Layout from '@/layout';

export default async function load(
  key?: string,
  props?: Props,
  initProp?: any
) {
  makeRoute();

  let res;
  if (key === 'oops') {
    res = await import('@/components/Oops');
  } else if (key === 'notfound') {
    res = await import('@/components/NotFound');
  } else {
    res = await pageModules.v[`../pages/${key}`]();
  }

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

  routeRef.page.value = `${pathname}${search}`;
  routeRef.renew.value = renewRoot;
  routeRef.rVDom.value = LayoutWDom;

  hydration(LayoutWDom, document.documentElement);
}
