import { UseDataStoreValue, ComponentSubKey, ComponentRef, Props } from '../types';
/**
 * Common
 */
export declare const componentKeyRef: {
    value: Props;
};
export declare const needDiffRef: {
    value: boolean;
};
export declare const componentRef: ComponentRef;
export declare const redrawQueue: {
    value: {
        componentKey: Props;
        nodeChildKey: Props[];
        exec: () => void;
    }[];
};
export declare const redrawQueueTimeout: {
    value: null | number;
};
/**
 * DataStore
 */
export declare const dataStoreStore: {
    [key: string]: UseDataStoreValue;
};
export declare const dataStoreRenderQueue: {
    [key: string]: (() => (() => void) | undefined)[];
};
/**
 * Router
 */
export declare const routerParams: {
    value: {
        [key: string]: string;
    };
};
/**
 * Ref helpers
 */
export declare function makeQueueRef(componentKey: Props, name: ComponentSubKey): (() => void)[];
export declare function makeUpdatedStore(componentKey: Props): [{
    value: number;
}, unknown[][]];
export declare function setRedrawAction({ componentKey, nodeChildKey, exec, }: {
    componentKey: Props;
    nodeChildKey: Props[];
    exec: () => void;
}): void;
export declare function initUpdateHookState(componentKey: Props): void;
export declare function initMountHookState(componentKey: Props): void;
