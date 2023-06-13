import { WDom } from '../types';
export declare const useUpdated: (effectAction: () => (() => void) | void, dependencies?: () => any[]) => void;
export declare const runUpdatedQueueFromWDom: (newWDom: WDom) => void;
