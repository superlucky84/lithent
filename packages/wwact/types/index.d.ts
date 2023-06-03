import { h, Fragment } from './wDom';
import make from './Wwact';
import { render } from './render';
import mounted from './hook/mounted';
import unmount from './hook/unmount';
import updated from './hook/updated';
import makeSignal from './hook/signal';
import { makeDataStore, useDataStore } from './hook/dataStore';
import makeRef from './hook/ref';
export type { WDom, TagFunction, TagFunctionResolver, FragmentFunction, ComponentSubKey, ComponentRef, Props, MiddleStateWDomChildren, MiddleStateWDom, NodePointer, Param, } from './types';
declare global {
    namespace JSX {
        interface IntrinsicElements {
            [name: string]: any;
        }
    }
}
export { h, Fragment, render, mounted, updated, unmount, makeSignal, makeDataStore, useDataStore, makeRef, make, };
