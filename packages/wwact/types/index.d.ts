import { h, Fragment } from './wDom';
import { render } from './render';
import { state } from './hook/state';
import { effect } from './hook/effect';
import { mounted } from './hook/mounted';
import { update } from './hook/update';
import { makeRef } from './hook/ref';
declare const ext: {
    componentRef: import('./types').ComponentRef;
    componentKeyRef: {
        value: import('./types').Props;
    };
    dataStoreStore: {
        [key: string]: import('./types').UseDataStoreValue;
    };
    dataStoreRenderQueue: {
        [key: string]: (() => (() => void) | undefined)[];
    };
    checkFunction: (target: unknown) => target is Function;
    getComponentKey: () => import('./types').Props;
    componentRender: (componentKey: import('./types').Props) => () => void | undefined;
};
export type { WDom, TagFunction, TagFunctionResolver, FragmentFunction, ComponentSubKey, ComponentRef, Props, MiddleStateWDomChildren, MiddleStateWDom, UseDataStoreValue, NodePointer, Param, } from './types';
declare global {
    namespace JSX {
        interface IntrinsicElements {
            [name: string]: any;
        }
    }
}
export { h, Fragment, render, state, mounted, update, effect, makeRef, ext };
