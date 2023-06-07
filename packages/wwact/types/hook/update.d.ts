declare const update: (effectAction: () => (() => void) | void, dependencies?: () => any[]) => void;
export default update;
export declare function runUpdateCallback(): void;
