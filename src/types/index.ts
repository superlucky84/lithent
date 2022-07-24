export type UseDataStoreValue = { [key: string | symbol]: unknown };

export type Props = { [key: string]: unknown };

export type TagFunction = (prop: Props, children: WDom[]) => () => WDom;

export type FragmentFunction = (children: WDom[]) => WDom;

export type NodePointer = { value: WDom };

export type MiddleStateVDom =
  | WDom
  | number
  | string
  | false
  | null
  | MiddleStateVDomChildren;

export type MiddleStateVDomChildren = MiddleStateVDom[];

// export type WDom = {[key: string]: any};

export interface WDom {
  isRoot?: boolean;
  type?: string | null;
  tag?: string;
  props?: Props;
  oldProps?: Props;
  tagName?: string;
  children?: WDom[];
  getParent?: () => WDom;
  text?: string | number;
  stateKey?: symbol;
  reRender?: any;
  componentProps?: any;
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
