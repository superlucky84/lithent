import { WDom } from '../types';
export default function useUpdated(effectAction: () => void, dependencies?: () => any[]): void;
export declare function runUpdatedQueueFromWDom(newWDom: WDom): void;
