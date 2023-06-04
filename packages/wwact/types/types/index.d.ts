export type UseDataStoreValue = {
    [key: string | symbol]: unknown;
};
export type Props = {
    [key: string]: unknown;
};
export type TagFunction = (prop: Props, children: WDom[]) => () => WDom;
export type TagFunctionResolver = {
    tagName: string;
    constructor: Function;
    props: Props;
    children: WDom[];
    resolve: (componentKey?: Props) => WDom;
};
export type FragmentFunction = (props: Props, children: WDom[]) => WDom & {
    isF: boolean;
};
export type NodePointer = {
    value: WDom | undefined;
};
export type NodeChildKey = {
    value: Props[];
};
export type MiddleStateWDom = WDom | number | string | false | null | MiddleStateWDomChildren;
export type MiddleStateWDomChildren = MiddleStateWDom[];
export type WDomType = 'component' | 'fragment' | 'element' | 'loop' | 'text' | 'empty';
export interface WDom {
    type: string | null;
    isRoot?: boolean;
    tag?: string;
    props?: Props;
    oldProps?: Props;
    tagName?: string;
    constructor?: Function;
    children?: WDom[];
    getParent?: () => WDom | undefined;
    nodeChildKey?: Props[];
    text?: string | number;
    componentKey?: Props;
    reRender?: () => WDom;
    componentProps?: Props;
    componentChildren?: WDom[];
    wrapElement?: HTMLElement;
    el?: HTMLElement | DocumentFragment | Text;
    needRerender?: 'ADD' | 'DELETE' | 'REPLACE' | 'UPDATE' | 'SORTED-REPLACE' | 'SORTED-UPDATE' | 'NONE';
}
export type ComponentSubKey = 'redrawAction' | 'updateReservedList' | 'updateSubscribeDefList' | 'updateSubscribeList' | 'mountSubscribeList' | 'unmountSubscribeList';
export type ComponentRef = WeakMap<Props, {
    redrawAction?: () => void;
    updateReservedList?: (() => void)[];
    updateSubscribeSequence?: {
        value: number;
    };
    updateSubscribeDefList?: unknown[][];
    updateSubscribeList?: (() => void)[];
    mountSubscribeList?: (() => void)[];
    unmountSubscribeList?: (() => void)[];
}>;
export type Param<Signal, Member, Props> = {
    signal: Signal;
    props: Props;
    member: Member;
    children: WDom[];
};
