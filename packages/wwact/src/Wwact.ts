import { WDom } from '@/index';
import { Param } from '@/types';

export default function make<Props, Member extends {}>(
  mounter: (info: Omit<Param<Props, Member>, 'children'>) => Member,
  template: (info: Param<Props, Member>) => WDom
) {
  return function (props: Props, children: WDom[]) {
    const member = {} as Member;

    if (mounter) {
      Object.assign(member, mounter({ props, member }));
    }

    const info = { props, member, children };

    return () => template(info);
  };
}
