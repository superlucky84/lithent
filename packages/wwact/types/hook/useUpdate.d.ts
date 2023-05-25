import { WDom } from '../types';
export default function updated(effectAction: () => void, dependencies?: unknown[]): void;
export declare function runUpdatedQueueFromWDom(newWDom: WDom): void;
