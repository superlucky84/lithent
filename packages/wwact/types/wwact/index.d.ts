import { h, Fragment, wwx } from '../wDom';
import { render } from '../render';
import { mountCallback } from '../hook/mountCallback';
import { updateCallback } from '../hook/updateCallback';
import { ref } from '../hook/ref';
declare const ext: {
    componentRef: import('../types').ComponentRef;
    componentKeyRef: {
        value: import('../types').Props;
    };
    dataStoreStore: {
        [key: string]: import('../types').UseDataStoreValue;
    };
    dataStoreRenderQueue: {
        [key: string]: (() => boolean)[];
    };
    checkFunction: (target: unknown) => target is Function;
    getComponentKey: () => import('../types').Props;
    componentRender: (componentKey: import('../types').Props) => () => boolean;
};
export type { WDom, TagFunction, TagFunctionResolver, FragmentFunction, ComponentSubKey, ComponentRef, Props, Renew, MiddleStateWDomChildren, MiddleStateWDom, UseDataStoreValue, NodePointer, Param, } from '../types';
declare global {
    namespace JSX {
        interface IntrinsicElements {
            [name: string]: any;
        }
    }
}
export { h, Fragment, render, wwx, mountCallback, updateCallback, ref, ext };
