import { updater as updaterHook, WDom } from '@/index';
import { Param } from '@/types';

export default function make<Updater extends {}, Member extends {}, Props>({
  updater: updaterData,
  member: makeMember,
  mounter: makeCallback,
  template,
}: {
  updater?: Updater;
  member?: (info: Omit<Param<Updater, Member, Props>, 'children'>) => Member;
  mounter?: (info: Param<Updater, Member, Props>) => void;
  template: (info: Param<Updater, Member, Props>) => WDom;
}) {
  return function (props: Props, children: WDom[]) {
    const updater = updaterData
      ? updaterHook<Updater>(updaterData)
      : ({} as Updater);
    const member = {} as Member;

    if (makeMember) {
      Object.assign(member, makeMember({ updater, props, member }));
    }

    const info = { updater, props, member, children };
    makeCallback ? makeCallback(info) : {};

    return () => template(info);
  };
}
