import { UseDataStoreValue, ComponentRef, ComponentSubKey, Props, NodeChildKey } from '../types';
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
export declare const nodeChildKeyList: {
    value: NodeChildKey[];
};
export declare const pushNodeChildKey: (key: Props) => void;
export declare const removeNodeChildKey: (item: NodeChildKey) => void;
export declare const cleanNodeChildKey: () => never[];
/**
 * DataStore
 */
export declare const dataStoreStore: {
    [key: string]: UseDataStoreValue;
};
export declare const dataStoreRenderQueue: {
    [key: string]: (() => boolean)[];
};
/**
 * Router
 */
export declare const routerParams: {
    value: {
        [key: string]: string;
    };
};
export declare const componentRender: (componentKey: Props) => () => boolean;
export declare const setComponetRef: (componentKey: Props) => void;
export declare const getComponentKey: () => Props;
export declare const getComponentSubInfo: (componentKey: Props, subKey: ComponentSubKey) => (() => void)[] | {
    value: number;
} | (() => void)[] | (() => void)[] | (() => void)[] | unknown[][] | (() => void);
export declare const setRedrawAction: ({ componentKey, nodeChildKey, exec, }: {
    componentKey: Props;
    nodeChildKey: {
        value: Props[];
    };
    exec: () => void;
}) => void;
export declare const initUpdateHookState: (componentKey: Props) => Props;
export declare const initMountHookState: (componentKey: Props) => void;
