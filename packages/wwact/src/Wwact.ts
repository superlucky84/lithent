import { makeData, mounted, updated, unmount, WDom } from '@/index';
type Param<A, B, C> = {
  state: A;
  props: C;
  values: B;
  children: WDom[];
};

type Callbacks = {
  mountedCallback?: () => void;
  updatedCallback?: () => [() => void, unknown[]];
  unmountCallback?: () => void;
  mountCallback?: () => void;
  updateCallback?: () => void;
};

export default function make<A extends {}, B extends {}, C>({
  signal,
  makePrivates,
  makeCallbacks,
  makeComponent,
}: {
  signal: A;
  makePrivates: (info: Omit<Param<A, B, C>, 'children'>) => B;
  makeCallbacks?: (info: Param<A, B, C>) => Callbacks;
  makeComponent: (info: Param<A, B, C>) => WDom;
}) {
  return function (props: C, children: WDom[]) {
    let updateCount = 0;
    const state = makeData<A>(signal);
    const values = {} as B;
    Object.assign(values, makePrivates({ state, props, values }));

    const info = { state, props, values, children };
    const callbacks = makeCallbacks ? makeCallbacks(info) : {};
    const {
      mountedCallback = null,
      updatedCallback = () => [],
      unmountCallback = null,
      mountCallback = () => {},
      updateCallback = () => {},
    } = callbacks as Required<Callbacks>;
    const [uEffect] = updatedCallback();

    mountCallback();

    return () => {
      if (updateCount) {
        updateCallback();
      }
      updateCount += 1;

      if (mountedCallback) {
        mounted(mountedCallback);
      }
      if (unmountCallback) {
        unmount(unmountCallback);
      }
      if (uEffect && updatedCallback) {
        const [, callbackDefs] = updatedCallback();
        updated(uEffect, callbackDefs);
      }

      return makeComponent(info);
    };
  };
}
