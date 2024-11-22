import { h } from '@/engine';
import type { WDom } from '@/engine';
import { store } from '@/engine/helper';

const pageModules = import.meta.glob('./pages/*.tsx');

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

async function loadPage(dynamicPath: string) {
  const orgPage = `./pages${dynamicPath === '/' ? '/index' : dynamicPath}.tsx`;
  const comparePage = orgPage.replace(/\?[^\.]*/, '');
  const queryOrg = orgPage.replace(/.*(\?[^\.]*).tsx/, '$1');
  const query = /\?/.test(queryOrg) ? parseQueryStringToMap(queryOrg) : {};
  const { key, params } = findPageModlueKey(
    Object.keys(pageModules),
    comparePage
  );

  if (key && pageModules[key]) {
    const res = await pageModules[key]();
    //@ts-ignore
    const makeInitProp = res.makeInitProp;
    let initProp = null;
    if (makeInitProp) {
      initProp = await makeInitProp();
    }
    console.log('KEY', key);

    //@ts-ignore
    routeRef.component = h(res.default, { params, query, initProp });

    /*
    lRender(
      //@ts-ignore
      h(res.default, { params, query, initProp }),
      document.documentElement
    );
    */
  } else {
    location.href = comparePage;
  }
}

const routeAssign = store<{
  page: string;
  component: WDom | null;
  destroy: (() => void) | string;
}>({
  page: '',
  component: null,
  destroy: '',
});

export const routeRef = routeAssign(
  state => {
    console.log('APAGWE', state.page);
    if (state.page) {
      loadPage(state.page);
    }
  },
  store => [store.page, store.destroy]
);

export function makeRoute() {
  window.addEventListener('popstate', _ => {
    const { pathname, search } = window.location;

    routeRef.page = `${pathname}${search}`;
  });

  return routeRef;
}

export function navigate(pagePath: string) {
  history.pushState(null, '', pagePath);
  routeRef.page = pagePath;
}
