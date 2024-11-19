export type PageProps<T = null> = {
  params: Record<string, string>;
  query: Record<string, string>;
  initProp: T;
};
