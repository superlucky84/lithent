import { makeSignal, WDom } from '@/index';
import { Param, Callbacks } from '@/types';

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
    const signal = signalData ? makeSignal<Signal>(signalData) : ({} as Signal);
    const member = {} as Member;

    if (makeMember) {
      Object.assign(member, makeMember({ signal, props, member }));
    }

    const info = { signal, props, member, children };
    const callbacks = makeCallback ? makeCallback(info) : {};
    const { mount = () => {} } = callbacks as Required<Callbacks>;

    mount();

    return () => template(info);
  };
}
