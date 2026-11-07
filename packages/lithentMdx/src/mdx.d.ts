declare module '*.mdx' {
  import type { TagFunction } from 'lithent';
  const component: TagFunction;
  export default component;
}
