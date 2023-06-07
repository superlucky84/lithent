import { UseDataStoreValue } from '../types';
export declare const sharedUpdater: <T extends {}>(storeKey: string) => T;
export declare const makeSharedUpdater: <T extends {}>(storeKey: string, initValue: T) => UseDataStoreValue;
