// import { h } from 'lithent';

export const tags = new Proxy(
  {},
  {
    get(_, tagName) {
      const tagFunction = (...allArgs: any[]) => {
        const [firstArgs, ...restArgs] = allArgs;
        const existProps = typeof firstArgs === 'object';
        const props = existProps ? firstArgs : null;
        const childrens = existProps ? restArgs : allArgs;

        h(tagName, props, ...childrens);
      };
      return tagFunction;
    },
  }
);
