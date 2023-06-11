import { UseDataStoreValue, Renew } from '../types';
export declare const protectedStore: <T extends {}>(storeKey: string, renew: Renew) => T;
export declare const makeProtectedStore: <T extends {}>(storeKey: string, initValue: T) => UseDataStoreValue;
