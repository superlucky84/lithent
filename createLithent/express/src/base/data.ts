export function getPreloadData<T>() {
  return (globalThis as any).pagedata as T;
}
