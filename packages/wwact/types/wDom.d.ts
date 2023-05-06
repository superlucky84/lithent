import { WDom, TagFunction, FragmentFunction, Props, MiddleStateWDomChildren } from './types';
export type Children = WDom[];
export declare function Fragment(_props: Props, ...children: WDom[]): {
    type: string;
    children: WDom[];
};
export declare function h(tag: TagFunction | FragmentFunction | string, props: Props, ...children: MiddleStateWDomChildren): WDom | {
    type: string;
    children: WDom[];
} | {
    tagName: string;
    constructor: TagFunction;
    props: Props;
    children: WDom[];
    resolve: (componentKey?: Props) => WDom;
};
