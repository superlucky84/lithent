import { Renew } from '../types';
export declare const state: <T>(value: T, renew: Renew) => {
    value: T;
    v: T;
};
