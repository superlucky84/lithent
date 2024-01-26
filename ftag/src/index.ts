import { h } from 'lithent';
import type { Props, WDom, MiddleStateWDom } from 'lithent';

type FTags = {
  [tagName: string]: (
    props: Props | null,
    ...childrens: MiddleStateWDom[]
  ) => WDom;
};

export const fTags: FTags = new Proxy(
  {},
  {
    get(_: {}, tagName: string) {
      return (props?: Props | null, ...childrens: MiddleStateWDom[]) =>
        h(tagName, props || {}, ...childrens);
    },
  }
);
