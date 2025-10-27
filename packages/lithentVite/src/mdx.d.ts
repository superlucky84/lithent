declare module '*.mdx' {
  import type { ComponentType } from 'lithent';
  const component: ComponentType<any>;
  export default component;
}
