import { WDom, TagFunction, FragmentFunction, Props, MiddleStateWDomChildren, Component } from './types';
export type Children = WDom[];
export declare const Fragment: (_props: Props, ...children: WDom[]) => {
    type: string;
    children: WDom[];
};
export declare const h: (tag: TagFunction | FragmentFunction | string, props: Props, ...children: MiddleStateWDomChildren) => WDom | {
    type: string;
    children: WDom[];
} | {
    tagName: string;
    constructor: TagFunction;
    props: Props;
    children: WDom[];
    resolve: (componentKey?: Props) => WDom;
};
export declare const wwx: <T>(component: Component<T>) => (_props: T, _children: WDom[]) => Component<T>;
