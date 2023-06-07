declare const state: <T>(value: T) => [() => T, (setValue: T) => void];
export default state;
