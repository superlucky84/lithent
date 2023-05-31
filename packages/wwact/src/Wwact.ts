import { makeData, mounted, updated, unmount, WDom } from '@/index';
type Param<A, B, C> = {
  state: A;
  props: C;
  values: B;
  children: WDom[];
};

export default function wwact<A, B, C>({
  signal,
  makePrivates,
  callbacks,
  makeComponent,
}: {
  signal: A;
  makePrivates: (info: Omit<Param<A, B, C>, 'children' | 'values'>) => B;
  callbacks?: {
    mountedCallback?: (info: Param<A, B, C>) => () => void;
    updatedCallback?: (info: Param<A, B, C>) => () => void;
    unmountCallback?: (info: Param<A, B, C>) => () => void;
  };
  makeComponent: (info: Param<A, B, C>) => WDom;
}) {
  return (props: C, children: WDom[]) => {
    const state = makeData<A>(signal);
    const values = makePrivates({ state, props });
    const info = { state, props, values, children };

    return () => {
      if (callbacks?.mountedCallback) {
        mounted(callbacks.mountedCallback(info));
      }
      if (callbacks?.updatedCallback) {
        updated(callbacks.updatedCallback(info));
      }
      if (callbacks?.unmountCallback) {
        unmount(callbacks.unmountCallback(info));
      }

      return makeComponent(info);
    };
  };
}
