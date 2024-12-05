export type PageProps<T = {}> = {
  params: Record<string, string>;
  query: Record<string, string>;
} & T;
