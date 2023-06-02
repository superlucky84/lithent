import { WDom } from './index';
type Param<Signal, Member, Props> = {
    signal: Signal;
    props: Props;
    member: Member;
    children: WDom[];
};
type Callbacks = {
    mount?: () => void;
    update?: () => void;
};
export default function make<Signal extends {}, Member extends {}, Props>({ signal: signalData, member: makeMember, callback: makeCallback, template, }: {
    signal?: Signal;
    member?: (info: Omit<Param<Signal, Member, Props>, 'children'>) => Member;
    callback?: (info: Param<Signal, Member, Props>) => Callbacks;
    template: (info: Param<Signal, Member, Props>) => WDom;
}): (props: Props, children: WDom[]) => () => WDom;
export {};
