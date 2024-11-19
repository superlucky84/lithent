import { render as lRender, h } from 'lithent';
import type { TagFunction } from 'lithent';
import { renderWithHydration } from 'lithent/ssr';
import { store } from 'lithent/helper';

const pageModules = import.meta.glob('./pages/*.tsx');
const cacheRender: { [key: string]: () => void } = {};

/*
function compareArraysWithUnderscore(arr1, arr2) {
  // 배열 길이가 다르면 일치하지 않음
  if (arr1.length !== arr2.length) {
    return false;
  }

  // 각 항목 비교
  for (let i = 0; i < arr1.length; i++) {
    const item1 = arr1[i];
    const item2 = arr2[i];

    // `_`로 시작하지 않는 경우, 값이 정확히 같아야 함
    if (!item1.startsWith('_') && !item2.startsWith('_') && item1 !== item2) {
      return false; // 값이 다르면 false
    }
  }

  // 모든 조건을 만족하면 true
  return true;
}
*/

function findPageModlueKey(pageModuleKeys: string[], key: string) {
  const targetSegments = key.split(/(?:\/|\.)/);
  console.log('TARGETSEGMENTS - ', targetSegments);

  pageModuleKeys.find(item => {
    const moduleSegmentList = item.split(/(?:\/|\.)/);
    console.log('MODULESEGMENTLIST', moduleSegmentList);
  });
}

async function loadPage(dynamicPath: string) {
  const key = `./pages${dynamicPath === '/' ? '/index' : dynamicPath}.tsx`;
  findPageModlueKey(Object.keys(pageModules), key);

  if (cacheRender[key]) {
    cacheRender[key]();
  } else if (pageModules[key]) {
    const res = await pageModules[key]();
    //@ts-ignore
    const render = () => lRender(h(res.default), document.documentElement);
    render();
    cacheRender[key] = render;
  }
}

let init = true;
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
      init = false;
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

export function render(tagFunction: TagFunction) {
  if (init) {
    const destroy = renderWithHydration(tagFunction);

    routeRef.destroy = destroy;

    return typeof destroy === 'string'
      ? destroy
      : () => lRender(h(tagFunction, {}), document.documentElement);
  }

  const rRender = () => lRender(h(tagFunction, {}), document.documentElement);
  const destroy = rRender();

  routeRef.destroy = destroy;

  return rRender;
}
