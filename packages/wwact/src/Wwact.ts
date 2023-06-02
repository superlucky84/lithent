import { makeData, mounted, updated, unmount, WDom } from '@/index';
type Param<Signal, Member, Props> = {
  signal: Signal;
  props: Props;
  member: Member;
  children: WDom[];
};

type Callbacks = {
  mounted?: () => void;
  updated?: () => [() => void, unknown[]];
  unmount?: () => void;
  mount?: () => void;
  update?: () => void;
};

export default function make<Signal extends {}, Member extends {}, Props>({
  signal: signalData,
  member: makeMember,
  callback: makeCallback,
  template,
}: {
  signal?: Signal;
  member?: (info: Omit<Param<Signal, Member, Props>, 'children'>) => Member;
  callback?: (info: Param<Signal, Member, Props>) => Callbacks;
  template: (info: Param<Signal, Member, Props>) => WDom;
}) {
  return function (props: Props, children: WDom[]) {
    let updateCount = 0;
    const signal = signalData ? makeData<Signal>(signalData) : ({} as Signal);

    const member = {} as Member;
    if (makeMember) {
      Object.assign(member, makeMember({ signal, props, member }));
    }

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
