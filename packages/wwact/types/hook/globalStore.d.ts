import { UseDataStoreValue } from '../types';
export declare const globalStore: <T extends {}>(storeKey: string) => T;
export declare const makeGlobalStore: <T extends {}>(storeKey: string, initValue: T) => UseDataStoreValue;
