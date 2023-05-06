import { WDom } from '../types';
export default function updated(effectAction: () => void, dependencies?: unknown[]): boolean;
export declare function runUpdatedQueueFromWDom(newWDom: WDom): void;
