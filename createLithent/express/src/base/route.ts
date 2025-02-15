import Oops from '@/components/Oops';
import NotFound from '@/components/NotFound';
import { routeRef, routeWatch, pageModules } from '@/base/routeStore';

let initPage = '';

function compareArraysWithUnderscore(arr1: string[], arr2: string[]) {
  const params: Record<string, string> = {};

  if (arr1.length !== arr2.length) {
    return [false];
  }

  for (let i = 0; i < arr1.length; i++) {
    const item1 = arr1[i];
    const item2 = arr2[i];

    if (!item2.startsWith('_') && item1 !== item2) {
      return [false];
    } else if (item2.startsWith('_')) {
      params[item2.replace(/^_/, '')] = item1;
    }
  }

  return [true, params];
}

function findMatch(targetSegments: string[], pageModuleKeys: string[]) {
  let params: Record<string, string> = {};

  const matchItem = pageModuleKeys.find(item => {
    const moduleSegmentList = item.split(/(?:\/|\.)/);
    moduleSegmentList.pop();
    const res = compareArraysWithUnderscore(targetSegments, moduleSegmentList);

    params = res[1] as Record<string, string>;

    return res[0];
  });

  return { matchItem, params };
}

function findPageModlueKey(pageModuleKeys: string[], key: string) {
  const targetSegments = key.split(/(?:\/|\.)/);

  let { matchItem, params } = findMatch(targetSegments, pageModuleKeys);
  if (!matchItem) {
    targetSegments.splice(targetSegments.indexOf('pages') + 1, 0, 'index');
    ({ matchItem, params } = findMatch(targetSegments, pageModuleKeys));
  }

  return { key: matchItem, params };
}

function parseQueryStringToMap(queryString: string) {
  const params = new URLSearchParams(queryString);
  const map: Record<string, string> = {};
  params.forEach((value, key) => {
    map[key] = value;
  });
  return map;
}

export function makePathToKey(dynamicPath: string) {
  const orgPage = `../pages${dynamicPath.replace(/\?.+$/, '') === '/' ? '/index' : dynamicPath}`;
  const comparePage = orgPage.replace(/\?[^\.]*/, '').replace(/\/$/, '');
  const queryOrg = orgPage.replace(/.*(\?[^\.]*)/, '$1');
  const query = /\?/.test(queryOrg) ? parseQueryStringToMap(queryOrg) : {};
  const origin = typeof window !== 'undefined' ? window.location.origin : '';

  const { key, params } = findPageModlueKey(
    Object.keys(pageModules.v),
    comparePage
  );

  const id = (key || 'index.tsx').split('/').at(-1);

  return { key, id, query, params, origin };
}

export async function loadPage(dynamicPath: string) {
  const { key, id, query, params, origin } = makePathToKey(dynamicPath);

  const rVDom = routeRef.rVDom.value;

  if (key && pageModules.v[key]) {
    routeRef.loading.value = true;
    let Page;
    try {
      const res = await pageModules.v[key]();
      //@ts-ignore
      const preload = res.preload;
      let initProp = null;
      if (preload) {
        initProp = await preload({ id, query, params, origin });
      }
      (globalThis as any).pagedata = initProp;
      //@ts-ignore
      Page = res.default;
    } catch {
      Page = Oops;
    }
    if (rVDom?.compProps) {
      rVDom.compProps.page = Page;
      rVDom.compProps.id = id;
      rVDom.compProps.query = query;
      rVDom.compProps.params = params;
      routeRef.renew.value();
    }
    routeRef.loading.value = false;
  } else if (rVDom?.compProps) {
    rVDom.compProps.page = NotFound;
    rVDom.compProps.id = id;
    rVDom.compProps.query = query;
    rVDom.compProps.params = params;
    routeRef.renew.value();
  }
}

export function makeRoute() {
  pageModules.v = import.meta.glob('../pages/*.(tsx|mdx)');
  routeWatch(state => {
    if (initPage && initPage && state.page.value !== initPage && state.rVDom) {
      loadPage(state.page.value);
    }
    initPage = state.page.value;
  });

  window.addEventListener('popstate', _ => {
    const { pathname, search, origin } = window.location;

    const urlA = new URL(routeRef.page.value, origin);
    const urlB = new URL(`${pathname}${search}`, origin);

    execRoute(urlA, urlB, false);
  });
}

export function navigate(pagePath: string) {
  const { pathname, search, origin } = window.location;

  const urlA = new URL(`${pathname}${search}`, origin);
  const urlB = new URL(pagePath, origin);

  if (urlA.toString() !== urlB.toString()) {
    execRoute(urlA, urlB, true);
  }
}

function execRoute(urlA: URL, urlB: URL, isPush?: boolean) {
  if (urlA.pathname !== urlB.pathname) {
    routeRef.page.value = `${urlB.pathname}${urlB.search}`;
  }

  if (isPush) {
    history.pushState(null, '', `${urlB.pathname}${urlB.search}`);
  }
}
