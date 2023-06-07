export type UseDataStoreValue = { [key: string | symbol]: unknown };

export type Props = { [key: string]: unknown };

export type TagFunction = (prop: Props, children: WDom[]) => () => WDom;

export type TagFunctionResolver = {
  tagName: string;
  constructor: Function;
  props: Props;
  children: WDom[];
  resolve: (componentKey?: Props) => WDom;
};

export type FragmentFunction = (
  props: Props,
  children: WDom[]
) => WDom & { isF: boolean };

export type NodePointer = { value: WDom | undefined };

export type NodeChildKey = { value: Props[] };

export type MiddleStateWDom =
  | WDom
  | number
  | string
  | false
  | null
  | MiddleStateWDomChildren;

export type MiddleStateWDomChildren = MiddleStateWDom[];

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
  constructor?: Function;
  children?: WDom[];
  getParent?: () => WDom | undefined;
  nodeChildKey?: Props[];
  text?: string | number;
  componentKey?: Props;
  reRender?: () => WDom;
  componentProps?: Props;
  componentChildren?: WDom[];
  wrapElement?: HTMLElement;
  el?: HTMLElement | DocumentFragment | Text;
  needRerender?:
    | 'ADD'
    | 'DELETE'
    | 'REPLACE'
    | 'UPDATE'
    | 'S_REPLACE'
    | 'S_UPDATE'
    | 'NONE';
}

export type ComponentSubKey =
  | 'redrawAction'
  | 'updateReservedList'
  | 'updateSubscribeDefList'
  | 'updateSubscribeList'
  | 'stateSubscribeDefList'
  | 'stateSubscribeSequence'
  | 'mountSubscribeList'
  | 'unmountSubscribeList';

export type ComponentRef = WeakMap<
  Props,
  {
    redrawAction?: () => void;
    updateReservedList?: (() => void)[];
    updateSubscribeSequence?: { value: number };
    updateSubscribeDefList?: unknown[][];
    stateSubscribeSequence?: { value: number };
    stateSubscribeDefList?: unknown[];
    updateSubscribeList?: (() => void)[];
    mountSubscribeList?: (() => void)[];
    unmountSubscribeList?: (() => void)[];
  }
>;

export type Param<Updater, Member, Props> = {
  updater: Updater;
  props: Props;
  member: Member;
  children: WDom[];
};

declare namespace JSX {
  interface IntrinsicElements {
    [name: string]: any;
  }
}
