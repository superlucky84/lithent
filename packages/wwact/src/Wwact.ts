import { makeData, mounted, updated, unmount, WDom } from '@/index';
type Param<A, B, C> = {
  state: A;
  props: C;
  values: B;
  children: WDom[];
};

export default function make<A, B, C>({
  signal,
  makePrivates,
  makeCallbacks,
  makeComponent,
}: {
  signal: A;
  makePrivates: (info: Omit<Param<A, B, C>, 'children' | 'values'>) => B;
  makeCallbacks?: (info: Param<A, B, C>) => {
    mountedCallback: () => void;
    updatedCallback: () => [() => void, unknown[]];
    unmountCallback: () => void;
  };
  makeComponent: (info: Param<A, B, C>) => WDom;
}) {
  return function (props: C, children: WDom[]) {
    const state = makeData<A>(signal);
    const values = makePrivates({ state, props });
    const info = { state, props, values, children };
    const { mountedCallback, updatedCallback, unmountCallback } = makeCallbacks
      ? makeCallbacks(info)
      : {
          mountedCallback: null,
          updatedCallback: () => [],
          unmountCallback: null,
        };

    const [uEffect] = updatedCallback();

    return () => {
      if (mountedCallback) {
        mounted(mountedCallback);
      }
      if (unmountCallback) {
        unmount(unmountCallback);
      }
      if (updatedCallback) {
        const [, callbackDefs] = updatedCallback();
        updated(uEffect, callbackDefs);
      }

      return makeComponent(info);
    };
  };
}
