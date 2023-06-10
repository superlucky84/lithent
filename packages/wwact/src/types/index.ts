export type UseDataStoreValue = { [key: string | symbol]: unknown };

export type Props = { [key: string]: unknown };

export type TagFunction = (
  prop: Props,
  children: WDom[]
) => (renew: Renew, prop: Props, children: WDom[]) => () => WDom;

export type Renew = () => boolean;
export type Component<T> = (
  renew: Renew,
  props: T,
  childen: WDom[]
) => () => WDom;

export type TagFunctionResolver = {
  tagName: string;
  constructor: Function;
  props: Props;
  children: WDom[];
  resolve: (componentKey?: Props) => WDom;
};

export type FragmentFunction = (props: Props, children: WDom[]) => WDom;

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

// component, fragment, element, loop, text, none
export type WDomType = 'c' | 'f' | 'e' | 'l' | 't' | 'et';

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
  needRerender?: RenderType;
}

export type RenderType =
  | 'A' // ADD
  | 'D' // DELETE
  | 'R' // REPLACE
  | 'U' // UPDATE
  | 'SR' // S_REPLACE
  | 'SU' // S_UPDATE
  | 'N'; // NONE

export type ComponentSubKey =
  | 'up'
  | 'upR'
  | 'upS'
  | 'upD'
  | 'upCB'
  | 'mts'
  | 'umts';

export type ComponentRef = WeakMap<
  Props,
  {
    up: () => void;
    upR: (() => void)[];
    upS: { value: number };
    upD: unknown[][];
    upCB: (() => void)[];
    mts: (() => void)[];
    umts: (() => void)[];
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
