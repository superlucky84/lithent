import { UseDataStoreValue, ComponentRef, ComponentSubKey, Props } from '../types';
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
export declare const componentRender: (componentKey: Props) => () => void | undefined;
export declare const setComponetRef: (componentKey: Props) => void;
export declare const getComponentKey: () => Props;
export declare const getComponentSubInfo: (componentKey: Props, subKey: ComponentSubKey) => (() => void) | (() => void)[] | {
    value: number;
} | unknown[][] | (() => void)[] | (() => void)[] | (() => void)[];
export declare const setRedrawAction: ({ componentKey, nodeChildKey, exec, }: {
    componentKey: Props;
    nodeChildKey: Props[];
    exec: () => void;
}) => void;
export declare const initUpdateHookState: (componentKey: Props) => Props;
export declare const initMountHookState: (componentKey: Props) => void;
