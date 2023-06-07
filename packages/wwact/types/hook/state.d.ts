export default function state<T>(value: T): [() => T, (setValue: T) => void];
