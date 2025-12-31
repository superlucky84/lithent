import { wdomSymbol } from '@/utils/universalRef';

export type UseDataStoreValue = { [key: string | symbol]: unknown };

export type Props = Partial<Record<string, unknown>>;

// Component Key type - unique object reference for each component instance
export type CompKey = Props;

export type TagFunction = (
  prop: Props,
  children?: MiddleStateWDomChildren
) =>
  | ((
      renew: Renew,
      prop: Props,
      children: WDom[]
    ) => (props: Props) => MiddleStateWDom)
  | MiddleStateWDom;

export type Renew = () => boolean;
export type Component<T> = (
  renew: Renew,
  props: T,
  childen: WDom[]
) => (props: T) => MiddleStateWDom;

export type LComponent<T> = (
  props: T,
  childen: WDom[]
) => (props: T) => MiddleStateWDom;

export type TagFunctionResolver = {
  ctor: Function;
  props: Props;
  children: WDom[];
  resolve: (compKey?: CompKey) => WDom;
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

// Internal metadata uses short keys to keep bundle size down.
// we: wrapElement, ae: afterElement, op: oldProps, oc: oldChildren
// nr: needRerender, il: isLegacy
export interface WDom {
  type?: string | null;
  isRoot?: boolean;
  tag?: string;
  props?: Props;
  op?: Props; // oldProps (previous props)
  ctor?: Function;
  children?: WDom[];
  oc?: WDom[]; // oldChildren (previous children)
  getParent?: () => WDom | undefined;
  text?: string | number;
  compKey?: CompKey;
  reRender?: () => WDom;
  compProps?: Props;
  compChild?: WDom[];
  we?: HTMLElement; // wrapElement (root wrapper)
  ae?: HTMLElement; // afterElement (insert before)
  el?: HTMLElement | DocumentFragment | Text;
  nr?: RenderType; // needRerender
  il?: boolean; // isLegacy
  [wdomSymbol]?: boolean | 'provider';
}

export type RenderType =
  | 'A' // ADD
  | 'D' // DELETE
  | 'R' // REPLACE
  | 'U' // UPDATE
  | 'S' // SORTED_REPLACE (was SR)
  | 'T' // SORTED_UPDATE (was SU)
  | 'L' // LOOP_CHILDREN_NOT_SORTED_UPDATE (was CNSU)
  | 'N'; // NONE

export type ComponentSubKey =
  | 'vd'
  | 'up'
  | 'upR'
  | 'upS'
  | 'upD'
  | 'upCB'
  | 'mts'
  | 'umts'
  | 'wdCB';

export type ComponentMap = WeakMap<CompKey, ComponentInfo>;

export type ComponentInfo = {
  vd: { value: null | WDom };
  up: () => void;
  upR: (() => void)[];
  upS: { value: number };
  upD: unknown[][];
  upCB: (() => void)[];
  mts: (() => void)[];
  umts: (() => void)[];
  wdCB: (() => void | (() => void))[];
};

export type Param<Updater, Member, Props> = {
  updater: Updater;
  props: Props;
  member: Member;
  children: WDom[];
};

export type RedrawQueueList = {
  compKey: CompKey;
  exec: () => void;
}[];

declare namespace JSX {
  interface IntrinsicElements {
    [name: string]: Props;
  }
}
