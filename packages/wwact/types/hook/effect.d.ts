import { WDom } from '../types';
export default function mounted(effectAction: () => void, dependencies?: unknown[]): void;
export declare function runMountedQueueFromWDom(newWDom: WDom): void;
