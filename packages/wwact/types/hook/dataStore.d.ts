import { UseDataStoreValue } from '../types';
export declare function useDataStore<T extends {}>(storeKey: string): T;
export declare function makeDataStore<T extends {}>(storeKey: string, initValue: T): UseDataStoreValue;
