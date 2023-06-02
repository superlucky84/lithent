import { makeData, mounted, updated, unmount, WDom } from '@/index';
type Param<A, B, C> = {
  signal: A;
  props: C;
  member: B;
  children: WDom[];
};

type Callbacks = {
  mounted?: () => void;
  updated?: () => [() => void, unknown[]];
  unmount?: () => void;
  mount?: () => void;
  update?: () => void;
};

export default function make<A extends {}, B extends {}, C>({
  signal: signalData,
  member: makeMember,
  callback: makeCallback,
  template,
}: {
  signal: A;
  member: (info: Omit<Param<A, B, C>, 'children'>) => B;
  callback?: (info: Param<A, B, C>) => Callbacks;
  template: (info: Param<A, B, C>) => WDom;
}) {
  return function (props: C, children: WDom[]) {
    let updateCount = 0;
    const signal = makeData<A>(signalData);
    const member = {} as B;
    Object.assign(member, makeMember({ signal, props, member }));

    const info = { signal, props, member, children };
    const callbacks = makeCallback ? makeCallback(info) : {};
    const {
      mounted: mountedCallback = null,
      updated: updatedCallback = () => [],
      unmount: unmountCallback = null,
      mount: mountCallback = () => {},
      update: updateCallback = () => {},
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

      return template(info);
    };
  };
}
