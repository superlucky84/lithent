import { render as lRender, h } from 'lithent';
import { store } from 'lithent/helper';

const pageModules = import.meta.glob('./pages/*.tsx');

function compareArraysWithUnderscore(arr1: string[], arr2: string[]) {
  const params: Record<string, string> = {};
  // 배열 길이가 다르면 일치하지 않음
  if (arr1.length !== arr2.length) {
    return [false];
  }

  for (let i = 0; i < arr1.length; i++) {
    const item1 = arr1[i];
    const item2 = arr2[i];

    if (!item2.startsWith('_') && item1 !== item2) {
      return [false]; // 값이 다르면 false
    } else if (item2.startsWith('_')) {
      params[item2.replace(/^_/, '')] = item1;
    }
  }

  // 모든 조건을 만족하면 true
  return [true, params];
}

function findPageModlueKey(pageModuleKeys: string[], key: string) {
  const targetSegments = key.split(/(?:\/|\.)/);
  console.log('ts', targetSegments);

  let params: Record<string, string> = {};
  const matchItem = pageModuleKeys.find(item => {
    const moduleSegmentList = item.split(/(?:\/|\.)/);
    const res = compareArraysWithUnderscore(targetSegments, moduleSegmentList);

    params = res[1] as Record<string, string>;

    return res[0];
  });

  console.log('PARAM 0', params);
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

  console.log('KEY', key, params);

  if (key) {
    if (pageModules[key]) {
      const res = await pageModules[key]();

      //@ts-ignore
      lRender(h(res.default, { params, query }), document.documentElement);
    }
  } else {
    location.href = comparePage;
  }
}

export const routeAssign = store<{
  page: string;
  destroy: (() => void) | string;
}>({
  page: '',
  destroy: '',
});

let prePage = '';
export const routeRef = routeAssign(
  state => {
    if (
      state &&
      state.page !== prePage &&
      typeof state.destroy === 'function'
    ) {
      state.destroy();

      loadPage(state.page);
    }
    prePage = state.page;
  },
  store => [store.page, store.destroy]
);

if (typeof window !== 'undefined') {
  //@ts-ignore
  window.routeRef = routeRef;
}
