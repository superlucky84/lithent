export default function effect(forward: () => (() => void) | void, backward: () => (() => void) | void, dependencies?: () => any[]): void;
