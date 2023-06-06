import { WDom } from '@/index';
import { Param } from '@/types';

type Option<Props, Member> = (info: Param<Props, Member>) => Member;

export default function make<Props, Member extends {} | null>(
  first: Option<Props, Member>,
  second?: Option<Props, Member>
) {
  let mounter: null | Option<Props, Member>;
  let template: Option<Props, Member>;

  if (second) {
    mounter = first as Option<Props, Member>;
    template = second as Option<Props, Member>;
  } else {
    mounter = null;
    template = first as Option<Props, Member>;
  }

  return function (props: Props, children: WDom[]) {
    const member = {} as Member;
    const info = { props, member, children };

    if (mounter && member) {
      Object.assign(member, mounter({ props, member, children }));
    }

    return () => template(info);
  };
}
