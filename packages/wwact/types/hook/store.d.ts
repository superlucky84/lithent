import { UseDataStoreValue, Renew } from '../types';
export declare const store: <T extends {}>(initValue: T, renew: Renew) => T;
export declare const updater: <T extends UseDataStoreValue>({ initValue, renew, }: {
    initValue: T;
    renew: () => void;
}) => T;
