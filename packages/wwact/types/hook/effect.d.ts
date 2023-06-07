declare const effect: (forward: () => (() => void) | void, backward: () => (() => void) | void, dependencies?: () => any[]) => void;
export default effect;
