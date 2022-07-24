export type UseDataStoreValue = { [key: string | symbol]: unknown };

export type Props = { [key: string]: unknown };

export type TagFunction = (prop: Props, children: WDom[]) => () => WDom;

export type FragmentFunction = (children: WDom[]) => WDom;

export type NodePointer = { value: WDom | undefined };

export type MiddleStateVDom =
  | WDom
  | number
  | string
  | false
  | null
  | MiddleStateVDomChildren;

export type MiddleStateVDomChildren = MiddleStateVDom[];

export type WDom = { [key: string]: any };
