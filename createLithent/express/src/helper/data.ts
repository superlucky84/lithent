export function loadData<T>() {
  return (globalThis as any).pagedata as T;
}
