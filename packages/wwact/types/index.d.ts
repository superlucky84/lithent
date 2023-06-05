import { h, Fragment } from './wDom';
import make from './Wwact';
import { render } from './render';
import mounted from './hook/mounted';
import unmount from './hook/unmount';
import updated from './hook/updated';
import updater from './hook/updater';
import { makeSharedUpdater, sharedUpdater } from './hook/sharedUpdater';
import makeRef from './hook/ref';
export type { WDom, TagFunction, TagFunctionResolver, FragmentFunction, ComponentSubKey, ComponentRef, Props, MiddleStateWDomChildren, MiddleStateWDom, UseDataStoreValue, NodePointer, Param, } from './types';
declare global {
    namespace JSX {
        interface IntrinsicElements {
            [name: string]: any;
        }
    }
}
export { h, Fragment, render, mounted, updated, unmount, updater, makeSharedUpdater, sharedUpdater, makeRef, make, };
