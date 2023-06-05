import { UseDataStoreValue } from '../types';
export declare function sharedUpdater<T extends {}>(storeKey: string): T;
export declare function makeSharedUpdater<T extends {}>(storeKey: string, initValue: T): UseDataStoreValue;
