export type UseDataStoreValue = { [key: string | symbol]: unknown };

export type Props = { [key: string]: unknown };

export type TagFunction = (prop: Props, children: WDom[]) => () => WDom;

export type TagFunctionResolver = {
  tagName: string;
  resolve: (stateKey?: symbol) => WDom;
};

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

export interface WDom {
  type: string | null;
  isRoot?: boolean;
  tag?: string;
  props?: Props;
  oldProps?: Props;
  tagName?: string;
  children?: WDom[];
  getParent?: () => WDom | undefined;
  text?: string | number;
  stateKey?: symbol;
  reRender?: () => WDom;
  componentProps?: Props;
  wrapElement?: HTMLElement;
  el?: HTMLElement | DocumentFragment | Text;
  needRerender?:
    | 'ADD'
    | 'DELETE'
    | 'REPLACE'
    | 'UPDATE'
    | 'SORTED-REPLACE'
    | 'SORTED-UPDATE'
    | 'NONE';
}
