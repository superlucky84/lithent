import type { MiddleStateWDomChildren, WDom } from 'lithent';

export type PropSingleChild<T = unknown> =
  T extends MiddleStateWDomChildren[number]
    ? T
    : MiddleStateWDomChildren[number];

export type PropChildren<T = WDom> = (T extends MiddleStateWDomChildren[number]
  ? T
  : MiddleStateWDomChildren[number])[];
