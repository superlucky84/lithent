import { makeSignal, WDom } from '@/index';
import { Param } from '@/types';

export default function make<Signal extends {}, Member extends {}, Props>({
  signal: signalData,
  member: makeMember,
  mount: makeCallback,
  template,
}: {
  signal?: Signal;
  member?: (info: Omit<Param<Signal, Member, Props>, 'children'>) => Member;
  mount?: (info: Param<Signal, Member, Props>) => void;
  template: (info: Param<Signal, Member, Props>) => WDom;
}) {
  return function (props: Props, children: WDom[]) {
    const signal = signalData ? makeSignal<Signal>(signalData) : ({} as Signal);
    const member = {} as Member;

    if (makeMember) {
      Object.assign(member, makeMember({ signal, props, member }));
    }

    const info = { signal, props, member, children };
    makeCallback ? makeCallback(info) : {};

    return () => template(info);
  };
}
