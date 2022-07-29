export type UseDataStoreValue = { [key: string | symbol]: unknown };

export type Props = { [key: string]: unknown };

export type TagFunction = (prop: Props, children: WDom[]) => WDom;

export type TagFunctionResolver = {
  tagName: string;
  resolve: (stateKey?: symbol) => WDom;
};

export type FragmentFunction = (
  props: Props,
  children: WDom[]
) => WDom & { isF: boolean };

export type NodePointer = { value: WDom | undefined };

export type MiddleStateVDom =
  | WDom
  | number
  | string
  | false
  | null
  | MiddleStateVDomChildren;

export type MiddleStateVDomChildren = MiddleStateVDom[];

export type WDomType =
  | 'component'
  | 'fragment'
  | 'element'
  | 'loop'
  | 'text'
  | 'empty';

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

export type ComponentSubKey =
  | 'redrawAction'
  | 'dataStore'
  | 'updateSubscribeDefList'
  | 'updateSubscribeList'
  | 'mountSubscribeList'
  | 'unmountSubscribeList';

export type ComponentRef = {
  [key: symbol]: {
    redrawAction?: () => void;
    dataStore?: unknown[];
    updateSubscribeDefList?: any[];
    updateSubscribeList?: (() => void)[];
    mountSubscribeList?: (() => void)[];
    unmountSubscribeList?: (() => void)[];
  };
};
