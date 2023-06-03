import { WDom } from './index';
import { Param } from './types';
export default function make<Signal extends {}, Member extends {}, Props>({ signal: signalData, member: makeMember, mount: makeCallback, template, }: {
    signal?: Signal;
    member?: (info: Omit<Param<Signal, Member, Props>, 'children'>) => Member;
    mount?: (info: Param<Signal, Member, Props>) => void;
    template: (info: Param<Signal, Member, Props>) => WDom;
}): (props: Props, children: WDom[]) => () => WDom;
