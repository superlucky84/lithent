export type UseDataStoreValue = { [key: string | symbol]: unknown };

export type WDom = { [key: string]: any };

export type MiddleStateVDomChildren = (
  | WDom
  | number
  | string
  | MiddleStateVDomChildren
)[];
