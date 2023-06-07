import { WDom } from '../types';
declare const useUpdated: (effectAction: () => (() => void) | void, dependencies?: () => any[]) => void;
export default useUpdated;
export declare const runUpdatedQueueFromWDom: (newWDom: WDom) => void;
