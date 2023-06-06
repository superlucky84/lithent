export default function update(effectAction: () => (() => void) | void, dependencies?: () => any[]): void;
export declare function runUpdateCallback(): void;
