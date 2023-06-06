import { updater as updaterHook, WDom } from '@/index';
import { Param } from '@/types';

export default function make<Updater extends {}, Member extends {}, Props>({
  updater: makeUpdater,
  member: makeMember,
  mounter: makeMounter,
  template,
}: {
  updater?: (
    info: Omit<Param<Updater, Member, Props>, 'children' | 'updater' | 'member'>
  ) => Updater;
  member?: (info: Omit<Param<Updater, Member, Props>, 'children'>) => Member;
  mounter?: (info: Param<Updater, Member, Props>) => void;
  template: (info: Param<Updater, Member, Props>) => WDom;
}) {
  return function (props: Props, children: WDom[]) {
    const member = {} as Member;
    const updater = makeUpdater
      ? updaterHook(makeUpdater({ props }))
      : ({} as Updater);

    const info = { updater, props, member, children };

    if (makeMember) {
      Object.assign(member, makeMember(info));
    }

    if (makeMounter) {
      makeMounter(info);
    }

    return () => template(info);
  };
}
