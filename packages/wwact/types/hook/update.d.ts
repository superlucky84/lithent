declare const update: (effectAction: () => (() => void) | void, dependencies?: () => any[]) => void;
export default update;
export declare const runUpdateCallback: () => void;
