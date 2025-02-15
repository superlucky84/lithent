import { wdomSymbol } from '@/utils/universalRef';

export type UseDataStoreValue = { [key: string | symbol]: unknown };

export type Props = { [key: string]: unknown };

export type TagFunction = (
  prop: Props,
  children?: MiddleStateWDomChildren
) => (renew: Renew, prop: Props, children: WDom[]) => (props: Props) => WDom;

export type Renew = () => boolean;
export type Component<T> = (
  renew: Renew,
  props: T,
  childen: WDom[]
) => (props: T) => WDom;

export type TagFunctionResolver = {
  tagName: string;
  ctor: Function;
  props: Props;
  children: WDom[];
  resolve: (compKey?: Props) => WDom;
};

export type FragmentFunction = (props: Props, children: WDom[]) => WDom;

export type NodePointer = { value: WDom | undefined };

export type MiddleStateWDom =
  | WDom
  | number
  | string
  | false
  | null
  | MiddleStateWDomChildren;

export type MiddleStateWDomChildren = MiddleStateWDom[];

// component, fragment, element, loop, text, none
export type WDomType = 'c' | 'f' | 'e' | 'l' | 't' | 'et';

export interface WDom {
  type?: string | null;
  isRoot?: boolean;
  tag?: string;
  props?: Props;
  oldProps?: Props;
  tagName?: string;
  ctor?: Function;
  children?: WDom[];
  oldChildren?: WDom[];
  getParent?: () => WDom | undefined;
  text?: string | number;
  compKey?: Props;
  reRender?: () => WDom;
  compProps?: Props;
  compChild?: WDom[];
  wrapElement?: HTMLElement;
  afterElement?: HTMLElement;
  el?: HTMLElement | DocumentFragment | Text;
  needRerender?: RenderType;
  isLegacy?: boolean;
  [wdomSymbol]?: boolean;
}

export type RenderType =
  | 'A' // ADD
  | 'D' // DELETE
  | 'R' // REPLACE
  | 'U' // UPDATE
  | 'SR' // S_REPLACE
  | 'SU' // S_UPDATE
  | 'CNSU' // CHILD NOT SORTED AT LOOP
  | 'N'; // NONE

export type ComponentSubKey =
  | 'vd'
  | 'up'
  | 'upR'
  | 'upS'
  | 'upD'
  | 'upCB'
  | 'mts'
  | 'umts';

export type ComponentMap = WeakMap<Props, ComponentInfo>;

export type ComponentInfo = {
  vd: { value: null | WDom };
  up: () => void;
  upR: (() => void)[];
  upS: { value: number };
  upD: unknown[][];
  upCB: (() => void)[];
  mts: (() => void)[];
  umts: (() => void)[];
};

export type Param<Updater, Member, Props> = {
  updater: Updater;
  props: Props;
  member: Member;
  children: WDom[];
};

export type RedrawQueueList = {
  compKey: Props;
  exec: () => void;
}[];

declare namespace JSX {
  interface IntrinsicElements {
    [name: string]: any;
  }
}
