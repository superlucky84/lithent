declare module '*.mdx' {
  const MDXContent: (props: Record<string, unknown>) => any;
  export default MDXContent;
}
