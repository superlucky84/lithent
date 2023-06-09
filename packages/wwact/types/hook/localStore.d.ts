import { UseDataStoreValue } from '../types';
export declare const localStore: <T extends {}>(initValue: T) => T;
export declare const updater: <T extends UseDataStoreValue>({ initValue, render, }: {
    initValue: T;
    render: () => void;
}) => T;
