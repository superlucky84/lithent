import { WDom } from './index';
import { Param } from './types';
export default function make<Updater extends {}, Member extends {}, Props>({ updater: updaterData, member: makeMember, mounter: makeCallback, template, }: {
    updater?: Updater;
    member?: (info: Omit<Param<Updater, Member, Props>, 'children'>) => Member;
    mounter?: (info: Param<Updater, Member, Props>) => void;
    template: (info: Param<Updater, Member, Props>) => WDom;
}): (props: Props, children: WDom[]) => () => WDom;
