/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Aggregated single-file snapshot of Lithent core (`src/`) and helper (`helper/src/`).
 * Generated manually to keep TypeScript types intact while avoiding module imports.
 * NOTE: This file is intended for reference or custom bundling experiments.
 * It is not wired into the build; keep it in sync manually if the sources change.
 */

export const wdomSymbol = Symbol.for('lithentWDomSymbol');

export type UseDataStoreValue = { [key: string | symbol]: unknown };

export type Props = { [key: string]: unknown };

// Component Key type - unique object reference for each component instance
export type CompKey = Props;

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
  compKey?: CompKey;
  reRender?: () => WDom;
  compProps?: Props;
  compChild?: WDom[];
  wrapElement?: HTMLElement;
  afterElement?: HTMLElement;
  el?: HTMLElement | DocumentFragment | Text;
  needRerender?: RenderType;
  isLegacy?: boolean;
  [wdomSymbol]?: boolean | 'provider';
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

declare global {
  namespace JSX {
    interface IntrinsicElements {
      [name: string]: any;
    }
  }
}

export const xmlnsRef: { value: string } = { value: '' };
export const compKeyRef: { value: CompKey | null } = { value: null };
export const needDiffRef: { value: boolean } = { value: false };
export const componentMap: ComponentMap = new WeakMap();

const setComponetRef = (compKey: CompKey): void => {
  componentMap.set(compKey, {
    vd: { value: null },
    up: () => {},
    upR: [],
    upS: { value: 0 },
    upD: [],
    upCB: [],
    mts: [],
    umts: [],
    wdCB: [], // WDom creation callback queue
  });
};

export const getComponentKey = (): CompKey | null => compKeyRef.value;

export const getComponentSubInfo = <K extends ComponentSubKey>(
  compKey: CompKey,
  subKey: K
): ComponentInfo[K] | null => {
  const component = componentMap.get(compKey);
  if (component) {
    return component[subKey];
  }
  return null;
};

export const initUpdateHookState = (compKey: CompKey): void => {
  compKeyRef.value = compKey;
};

export const initMountHookState = (compKey: CompKey): void => {
  compKeyRef.value = compKey;
  setComponetRef(compKey);
};

export const getParent = (vDom: WDom) =>
  (vDom.getParent && vDom.getParent()) as WDom;

export const entries = Object.entries;
export const keys = Object.keys;
export const assign = Object.assign;
export const isPropType = (obj: unknown): obj is Props => {
  return (
    typeof obj === 'object' &&
    !Array.isArray(obj) &&
    !Object.getOwnPropertySymbols(obj).includes(wdomSymbol)
  );
};

type WDomParam =
  | string
  | WDom
  | TagFunction
  | TagFunctionResolver
  | FragmentFunction;

const checkPlainWDomType = (wDom: WDomParam): wDom is WDom =>
  typeof wDom === 'object' && !('resolve' in wDom);

const checkPlainType = (wDom: WDomParam, typeName: string) =>
  checkPlainWDomType(wDom) && wDom.type === typeName;

const checkSameCustomComponent = (
  newWDom: WDom | TagFunction | TagFunctionResolver,
  originalWDom?: WDom
): boolean =>
  'ctor' in newWDom
    ? newWDom.ctor === (originalWDom && originalWDom.ctor)
    : newWDom === (originalWDom && originalWDom.ctor);

const checkSameFragment = (
  newWDom: WDom | TagFunction | TagFunctionResolver,
  originalWDom?: WDom
): boolean =>
  !!(
    checkPlainWDomType(newWDom) &&
    originalWDom &&
    originalWDom.type === 'f' &&
    originalWDom.children &&
    originalWDom.children.length ===
      (newWDom.children && newWDom.children.length)
  );

const checkSameTagElement = (
  newWDom: WDom | TagFunction | TagFunctionResolver,
  originalWDom?: WDom
): boolean =>
  !!(
    checkPlainWDomType(newWDom) &&
    originalWDom &&
    originalWDom.type === 'e' &&
    originalWDom.tag === newWDom.tag &&
    originalWDom.children &&
    originalWDom.children.length ===
      (newWDom.children && newWDom.children.length)
  );

const checkNormalTypeElement = (
  newWDom: WDom | TagFunction | TagFunctionResolver,
  originalWDom?: WDom
): boolean =>
  !!(
    checkPlainWDomType(newWDom) &&
    originalWDom &&
    originalWDom.type === newWDom.type
  );

const checkLoopTypeElement = (
  newWDom: WDom | TagFunction | TagFunctionResolver,
  originalWDom?: WDom
): boolean =>
  !!(
    checkPlainWDomType(newWDom) &&
    originalWDom &&
    originalWDom.type === newWDom.type &&
    ((checkExisty(getKey((newWDom.children || [])[0])) &&
      checkExisty(getKey((originalWDom.children || [])[0]))) ||
      (originalWDom.children &&
        newWDom.children &&
        originalWDom.children.length === newWDom.children.length))
  );

export const getKey = (target: WDom) =>
  (target && target.compProps && target.compProps.key) ||
  (target && target.props && target.props.key);

export const checkVirtualType = (type?: string | null) =>
  type && ['f', 'l'].includes(type); // 'f': fragment, 'l': loop

export const checkCustemComponentFunction = (
  target: WDomParam
): target is TagFunction | TagFunctionResolver =>
  (typeof target === 'function' && !checkFragmentFunction(target)) ||
  (typeof target === 'object' && 'resolve' in target);

export const checkFragmentFunction = (
  target: unknown
): target is FragmentFunction =>
  typeof target === 'function' && target === Fragment;

export const checkEmptyElement = (wDom: WDomParam) =>
  checkPlainWDomType(wDom) && !wDom.type;

export const checkExisty = (value: unknown) =>
  value !== null && value !== undefined;

export const checkStyleData = (
  dataKey: string,
  dataValue: unknown
): dataValue is Record<string, string> =>
  dataKey === 'style' && typeof dataValue === 'object';

export const checkRefData = (
  dataKey: string,
  dataValue: unknown
): dataValue is {
  value: HTMLElement | Element | DocumentFragment | Text | undefined;
} => dataKey === 'ref' && typeof dataValue === 'object';

export const hasAccessorMethods = (target: unknown, dataKey: string) => {
  const descriptor = Object.getOwnPropertyDescriptor(
    target!.constructor.prototype,
    dataKey
  );

  return descriptor && descriptor.get && descriptor.set;
};

export const getWDomType = (
  wDom: WDom | TagFunction | TagFunctionResolver
): WDomType =>
  checkCustemComponentFunction(wDom)
    ? 'c'
    : checkPlainType(wDom, 'f')
      ? 'f'
      : checkPlainType(wDom, 'e')
        ? 'e'
        : checkPlainType(wDom, 'l')
          ? 'l'
          : checkPlainType(wDom, 't')
            ? 't'
            : 'et';

export const checkSameWDomWithOriginal = {
  c: checkSameCustomComponent,
  l: checkLoopTypeElement,
  t: checkNormalTypeElement,
  e: checkSameTagElement,
  f: checkSameFragment,
  et: checkNormalTypeElement,
};

const redrawQueue = new Map<Props, () => void>();
let redrawQueueTimeout = false;

export const setRedrawAction = (compKey: Props, exec: () => void) => {
  if (componentMap.get(compKey)) {
    componentMap.get(compKey)!.up = () => {
      redrawQueue.set(compKey, exec);

      if (!redrawQueueTimeout) {
        redrawQueueTimeout = true;
        queueMicrotask(execRedrawQueue);
      }
    };
  }
};

export const componentUpdate = (compKey: Props) => () => {
  const comp = componentMap.get(compKey);
  const up = comp && comp.up;
  if (up) {
    up();
    return true;
  }
  return false;
};

const execRedrawQueue = () => {
  redrawQueue.forEach((item: () => void) => {
    item();
  });

  redrawQueue.clear();
  redrawQueueTimeout = false;
};

export const unmount = (effectAction: () => void) => {
  const compKey = getComponentKey();
  if (compKey) {
    const comp = componentMap.get(compKey);
    comp && comp.umts.push(effectAction);
  }
};

export const runUnmountQueueFromWDom = (newWDom: WDom) => {
  const { compKey } = newWDom;

  if (compKey) {
    removeItem(compKey);
  }
  recursiveRunUnmount(newWDom);
};

const recursiveRunUnmount = (wDom: WDom) => {
  (wDom.children || []).forEach(item => {
    const childComKey = item.compKey;
    if (childComKey) {
      runUnmountQueueFromWDom(item);
    } else {
      recursiveRunUnmount(item);
    }
  });
};

const removeItem = (compKey: CompKey) => {
  const subInfo = componentMap.get(compKey);
  if (subInfo) {
    subInfo.umts.forEach(effect => effect());
    subInfo.umts = [];
    componentMap.delete(compKey);
  }
};

export const useUpdated = (
  effectAction: () => (() => void) | void,
  dependencies: () => any[] = () => []
) => {
  const compKey = getComponentKey();
  if (!compKey) return;

  const component = componentMap.get(compKey);
  if (!component) return;

  const { upD, upS } = component;
  const def = upD[upS.value];

  if (def && checkNeedPushQueue(def, dependencies())) {
    const callback = effectAction();
    if (callback) {
      component.upCB.push(callback);
    }
  }

  upD[upS.value] = dependencies();
  upS.value += 1;
};

export const runUpdatedQueueFromWDom = (newWDom: WDom) => {
  const { compKey } = newWDom;

  if (compKey) {
    const component = componentMap.get(compKey);
    const queue = component && component.upCB;
    const sequence = component && component.upS;

    compKeyRef.value = compKey;

    if (sequence) {
      sequence.value = 0;
    }

    if (newWDom.ctor && queue) {
      component.upCB = [];
      queue.forEach((effect: Function) => effect());
    }
  }
};

const checkNeedPushQueue = (originalDefs: unknown[], newDefs: unknown[]) =>
  !originalDefs.length
    ? true
    : originalDefs.some((def, index) => def !== newDefs[index]);

let mountedQueue: WDom[] = [];

export const addMountedQueue = (wDom: WDom) => {
  if (wDom.compKey) {
    mountedQueue.push(wDom);
  }
};

export const execMountedQueue = () => {
  mountedQueue.forEach(item => runMountedQueueFromWDom(item));
  mountedQueue = [];
};

export const mountCallback = (effectAction: () => void) => {
  const compKey = getComponentKey();
  if (compKey) {
    const comp = componentMap.get(compKey);
    comp && comp.mts.push(effectAction);
  }
};

const runMountedQueueFromWDom = (newWDom: WDom) => {
  const { compKey } = newWDom;

  if (compKey) {
    const component = componentMap.get(compKey);
    const mountQueue = component && component.mts;
    const sequence = component && component.upS;

    compKeyRef.value = compKey;

    if (sequence) {
      sequence.value = 0;
    }

    if (mountQueue) {
      component.mts = [];

      mountQueue.forEach((effect: Function) => {
        const callback = effect();
        if (callback) {
          unmount(callback);
        }
      });
    }
  }
};

export const mountReadyCallback = (
  effectAction: () => void | (() => void)
) => {
  const compKey = getComponentKey();
  if (compKey) {
    const comp = componentMap.get(compKey);
    comp && comp.wdCB.push(effectAction);
  }
};

export const runWDomCallbacksFromWDom = (newWDom: WDom) => {
  const { compKey } = newWDom;

  if (compKey) {
    const component = componentMap.get(compKey);
    const wdCBQueue = component && component.wdCB;

    compKeyRef.value = compKey;

    if (wdCBQueue && wdCBQueue.length > 0) {
      component.wdCB = [];

      wdCBQueue.forEach((effect: Function) => {
        const cleanup = effect();
        if (cleanup && typeof cleanup === 'function') {
          unmount(cleanup);
        }
      });
    }
  }
};

export const updateCallback = (
  effectAction: () => (() => void) | void,
  dependencies: () => any[] = () => []
) => {
  const compKey = getComponentKey();
  if (!compKey) return;

  const component = componentMap.get(compKey);
  if (!component) return;

  component.upR.push(() => useUpdated(effectAction, dependencies));
  useUpdated(effectAction, dependencies);
};

export const runUpdateCallback = () => {
  const compKey = getComponentKey();
  if (!compKey) return;

  const comp = componentMap.get(compKey);
  const updateReqs = comp && comp.upR;

  if (updateReqs && updateReqs.length) {
    updateReqs.forEach(callback => callback());
  }
};

export const ref = <T>(initValue: T) => ({ value: initValue });
export const nextTick = () => Promise.resolve();

const getAttrKey = (k: string) => (k === 'className' ? 'class' : k);

const getEventName = (k: string) =>
  k.replace(/^on(.*)/, (_, p) => p.toLowerCase());

const DF = () => new DocumentFragment();
const CE = (t: string) => document.createElement(t);

export const render = (
  wDom: WDom,
  wrapElement: HTMLElement | null,
  afterElement?: HTMLElement | null,
  isHydration?: boolean
) => {
  wDom.isRoot = true;
  wrapElement = wrapElement || document.body;
  wDom.wrapElement = wrapElement;

  const Dom = wDomToDom(wDom, isHydration);

  if (afterElement) {
    wDom.afterElement = afterElement;
    wrapElement.insertBefore(Dom, afterElement);
  } else if (!isHydration) {
    if (wrapElement.tagName === 'HTML') {
      wrapElement.replaceWith(Dom);
    } else {
      wrapElement.appendChild(Dom);
    }
  }

  execMountedQueue();

  return () => {
    const compData = componentMap.get(wDom.compProps || {});
    const comp = (compData && compData.vd.value) || wDom;
    if (comp !== wDom) runUnmountQueueFromWDom(comp);
    recursiveRemoveEvent(comp);
    rootDelete(comp);
  };
};

export const wDomUpdate = (newWDomTree: WDom) => {
  const { needRerender } = newWDomTree;

  if (needRerender && needRerender !== 'N') {
    ({
      A: typeAdd,
      D: typeDelete,
      R: typeReplace,
      U: typeUpdate,
      CNSU: typeUpdate,
      SR: typeSortedReplace,
      SU: typeSortedUpdate,
    })[needRerender](newWDomTree);

    delete newWDomTree.needRerender;
    delete newWDomTree.oldChildren;
    delete newWDomTree.oldProps;
  }
};

export const recursiveRemoveEvent = (originalWDom: WDom) => {
  if (originalWDom.props && originalWDom.el) {
    removeEvent(originalWDom.props, originalWDom.el);
  }

  (originalWDom.children || []).forEach((childItem: WDom) => {
    recursiveRemoveEvent(childItem);
  });
};

const rootDelete = (newWDom: WDom) =>
  deleteRealDom(newWDom, newWDom.wrapElement as HTMLElement);

export const typeDelete = (newWDom: WDom) => {
  if (newWDom.oldProps && newWDom.el) {
    removeEvent(newWDom.oldProps, newWDom.el);
  }

  deleteRealDom(
    newWDom,
    findRealParentElement(getParent(newWDom)) as HTMLElement
  );
};

const deleteRealDom = (newWDom: WDom, parent: HTMLElement) => {
  if (parent && newWDom.el) {
    const nt = newWDom.el.nodeType;
    if ([1, 3].includes(nt)) {
      parent.removeChild(newWDom.el);
    } else if (nt === 11) {
      findChildWithRemoveElement(newWDom, parent);
    }
    delete newWDom.el;
  }
};

const findChildWithRemoveElement = (newWDom: WDom, parent: HTMLElement) => {
  (
    (newWDom && newWDom.oldChildren) ||
    (newWDom && newWDom.children) ||
    []
  ).forEach(item => {
    const nt = item.el && item.el.nodeType;
    if (nt) {
      if ([1, 3].includes(nt)) {
        const el = item.el as HTMLElement;
        el.tagName === 'HTML' ? (el.innerHTML = '') : el.remove();
      } else if (nt === 11) {
        findChildWithRemoveElement(item, parent);
      }
    }
  });
};

const typeSortedReplace = (newWDom: WDom) => {
  typeDelete(newWDom);
  typeAdd(newWDom);
};

const typeSortedUpdate = (newWDom: WDom) => {
  typeUpdate(newWDom);

  const parentWDom = getParent(newWDom);
  if (parentWDom.needRerender !== 'CNSU') {
    const newElement = getElementFromFragment(newWDom);

    typeAdd(newWDom, newElement);
  }
};

const typeAdd = (
  newWDom: WDom,
  newElement?: HTMLElement | DocumentFragment | Text
) => {
  if (!newElement) {
    newElement = wDomToDom(newWDom) as HTMLElement;
  }

  const parentWDom = getParent(newWDom);
  if (parentWDom.type) {
    const parentEl = findRealParentElement(parentWDom);
    const isLoop = parentWDom.type === 'l';
    const nextEl =
      isLoop && parentWDom.needRerender && parentWDom.needRerender !== 'CNSU'
        ? startFindNextBrotherElement(parentWDom, getParent(parentWDom))
        : startFindNextBrotherElement(newWDom, parentWDom);

    if (newElement && parentEl) {
      if (newWDom.tag !== 'portal') {
        nextEl
          ? parentEl.insertBefore(newElement, nextEl)
          : parentEl.appendChild(newElement);
      }
      execMountedQueue();
    }
  }
};

const getElementFromFragment = (newWDom: WDom) => {
  if (checkVirtualType(newWDom.type)) {
    return ((newWDom && newWDom.children) || []).reduce((acc, item) => {
      const element = getElementFromFragment(item);

      if (element) {
        acc.appendChild(element);
      }
      return acc;
    }, DF());
  }

  return newWDom.el;
};

const startFindNextBrotherElement = (
  wDom: WDom,
  parentWDom: WDom
): HTMLElement | DocumentFragment | Text | undefined => {
  const brothers = parentWDom.children || [];
  const index = brothers.indexOf(wDom);
  const nextIndex = index + 1;
  const candidiateBrothers = brothers.slice(nextIndex);

  const finedNextEl = findChildFragmentNextElement(candidiateBrothers);
  const parentType = parentWDom.type || '';

  if (finedNextEl) {
    return finedNextEl;
  }

  if (!parentWDom.isRoot && checkVirtualType(parentType)) {
    return startFindNextBrotherElement(parentWDom, getParent(parentWDom));
  } else if (
    parentWDom.isRoot &&
    checkVirtualType(parentType) &&
    parentWDom.afterElement
  ) {
    return parentWDom.afterElement;
  }

  return undefined;
};

const findChildFragmentNextElement = (
  candidiateBrothers: WDom[]
): HTMLElement | DocumentFragment | Text | undefined =>
  candidiateBrothers.reduce(
    (
      targetEl: HTMLElement | DocumentFragment | Text | undefined,
      bItem: WDom
    ) => {
      if (targetEl) return targetEl;
      const { type, el } = bItem;
      if (type && checkVirtualType(type))
        return findChildFragmentNextElement(bItem.children || []);
      if (el && el.nodeType !== 11) return el;
      return targetEl;
    },
    undefined
  );

const typeReplace = (newWDom: WDom) => {
  const parentWDom = getParent(newWDom);
  const orignalElement = newWDom.el;

  if (parentWDom.type && orignalElement) {
    if (orignalElement.nodeType === 11) {
      typeSortedReplace(newWDom);
    } else {
      const parentElement = findRealParentElement(parentWDom);
      const newElement = wDomToDom(newWDom);

      if (parentElement && newWDom.tag !== 'portal') {
        parentElement.replaceChild(newElement, orignalElement);
      }
      execMountedQueue();
    }
  }
};

const removeEvent = (
  oldProps: Props,
  element: HTMLElement | DocumentFragment | Text
) => {
  entries(oldProps || {}).forEach(([dataKey, dataValue]: [string, unknown]) => {
    if (dataKey.match(/^on/)) {
      element.removeEventListener(
        getEventName(dataKey),
        dataValue as (e: Event) => void
      );
    }
  });
};

const typeUpdate = (newWDom: WDom) => {
  if (newWDom.type === 't') {
    updateText(newWDom);
    return;
  }

  if (newWDom.el) {
    const { oldProps, props } = newWDom;
    updateProps(props, newWDom.el, oldProps);
    delete newWDom.oldProps;

    if (newWDom.tag === 'input') {
      (newWDom.el as HTMLInputElement).value = String(
        (props && props.value) || ''
      );
    }
  }

  (newWDom.children || []).forEach(childItem => wDomUpdate(childItem));
  runUpdatedQueueFromWDom(newWDom);
};

const updateText = (newWDom: WDom) => {
  if (newWDom.el) {
    newWDom.el.nodeValue = String(newWDom.text);
  }
};

const updateProps = (
  props?: Props,
  element?: HTMLElement | Element | DocumentFragment | Text,
  oldProps?: Props | null,
  isHydration?: boolean
) => {
  const originalProps = { ...oldProps };

  entries(props || {}).forEach(([dataKey, dataValue]: [string, unknown]) => {
    if (isHydration && dataKey.match(/^on/)) {
      updateEvent(
        element as HTMLElement,
        dataKey,
        dataValue as (e: Event) => void,
        originalProps[dataKey] as (e: Event) => void
      );
    } else {
      if (dataKey === 'key' || dataValue === originalProps[dataKey]) {
        // Do nothing
      } else if (dataKey === 'portal' && typeof dataValue === 'object') {
        // Do nothing
      } else if (dataKey === 'innerHTML' && typeof dataValue === 'string') {
        (element as HTMLElement).innerHTML = dataValue;
      } else if (checkStyleData(dataKey, dataValue)) {
        updateStyle(
          dataValue,
          checkStyleData(dataKey, originalProps.style)
            ? originalProps.style
            : {},
          element
        );
      } else if (checkRefData(dataKey, dataValue)) {
        dataValue.value = element;
      } else if (dataKey.match(/^on/)) {
        updateEvent(
          element as HTMLElement,
          dataKey,
          dataValue as (e: Event) => void,
          originalProps[dataKey] as (e: Event) => void
        );
      } else if (dataKey) {
        if (dataKey !== 'type' && hasAccessorMethods(element, dataKey)) {
          (element as { [key: string]: any })[dataKey] = dataValue;
        } else {
          setAttr(
            getAttrKey(dataKey),
            element as HTMLElement,
            dataValue as string
          );
        }
      }

      delete originalProps[dataKey];
    }
  });

  keys(originalProps).forEach(dataKey =>
    (element as HTMLElement).removeAttribute(dataKey)
  );
};

const setAttr = (k: string, el: HTMLElement, v: string) =>
  xmlnsRef.value && k !== 'xmlns'
    ? el.setAttributeNS(null, k, v)
    : el.setAttribute(k, v);

const wDomToDom = (wDom: WDom, isHydration?: boolean): HTMLElement => {
  let element;
  const { type, tag, text, props, children = [] } = wDom;
  const isVirtualType = checkVirtualType(type);

  runWDomCallbacksFromWDom(wDom);

  if (tag === 'svg') {
    xmlnsRef.value = String(props && props.xmlns);
  }

  if (!isHydration) {
    if (isVirtualType) {
      element = DF();
    } else if (type === 'e' && tag) {
      if (tag === 'portal' && props && props.portal) {
        element = props.portal as HTMLElement;
      } else {
        element = xmlnsRef.value
          ? document.createElementNS(xmlnsRef.value, tag)
          : CE(tag);
      }
    } else if (type === 't' && checkExisty(text)) {
      element = document.createTextNode(String(text));
    } else {
      element = CE('e');
    }

    wDom.el = element as HTMLElement;
  } else {
    element = wDom.el;
  }

  wDomChildrenToDom(children, element, isHydration);

  updateProps(props, element, null, isHydration);

  addMountedQueue(wDom);

  if (tag === 'svg') {
    xmlnsRef.value = '';
  }

  return element as HTMLElement;
};

const wDomChildrenToDom = (
  children: WDom[],
  parentElement?: HTMLElement | Element | DocumentFragment | Text,
  isHydration?: boolean
) => {
  const frag = children.reduce((acc: DocumentFragment, childItem: WDom) => {
    if (childItem.type) {
      const childElement = wDomToDom(childItem, isHydration);
      if (childItem.tag !== 'portal' && !isHydration) {
        acc.appendChild(childElement);
      }
    }
    return acc;
  }, DF());

  if (!isHydration && parentElement && frag.hasChildNodes()) {
    parentElement.appendChild(frag);
  }
};

const updateEvent = (
  element: HTMLElement,
  eventKey: string,
  newEventHandler: (e: Event) => void,
  oldEventHandler: (e: Event) => void
) => {
  const eventName = getEventName(eventKey);

  if (oldEventHandler !== newEventHandler) {
    if (oldEventHandler) {
      element.removeEventListener(eventName, oldEventHandler);
    }

    if (newEventHandler) {
      element.addEventListener(eventName, newEventHandler);
    }
  }
};

const updateStyle = (
  style: Record<string, string>,
  oldStyle: Record<string, string>,
  element?: HTMLElement | Element | DocumentFragment | Text
) => {
  const orig = { ...oldStyle };
  const es = (element as HTMLElement) && (element as HTMLElement).style;

  if (es) {
    entries(style).forEach(([k, v]) => {
      (es as any)[k] = v;
      delete orig[k];
    });
    entries(orig).forEach(([k]) => ((es as any)[k] = ''));
  }
};

const findRealParentElement = (
  vDom: WDom
): HTMLElement | DocumentFragment | Text | undefined => {
  const isVirtualType = checkVirtualType(vDom.type);
  if (vDom.isRoot && isVirtualType) {
    return vDom.wrapElement;
  }

  if (!isVirtualType) {
    return vDom.el as HTMLElement;
  }

  return findRealParentElement(getParent(vDom));
};

export const makeNewWDomTree = (
  newWDom: WDom | TagFunctionResolver,
  originalWDom?: WDom
) =>
  remakeNewWDom(
    newWDom,
    checkSameWDomWithOriginal[getWDomType(newWDom)](newWDom, originalWDom),
    originalWDom
  );

const remakeNewWDom = (
  newWDom: WDom | TagFunctionResolver,
  isSameType: boolean,
  originalWDom?: WDom
) => {
  const remakeWDom = generalize(newWDom, isSameType, originalWDom);
  const needRerender = addReRenderTypeProperty(
    remakeWDom,
    isSameType,
    originalWDom
  );
  const isNoting = needRerender === 'N';

  if (!isNoting) {
    remakeWDom.children = remakeChildrenForDiff(
      remakeWDom,
      isSameType,
      originalWDom
    );
  }

  remakeWDom.needRerender = needRerender;
  inheritPropForRender(remakeWDom, originalWDom, needRerender);

  if (!isNoting && originalWDom) {
    originalWDom.isLegacy = true;
    delete originalWDom.children;
  }

  return remakeWDom;
};

const inheritPropForRender = (
  remakeWDom: WDom,
  originalWDom?: WDom,
  needRerender?: RenderType
) => {
  if (needRerender !== 'A' && originalWDom) {
    remakeWDom.el = originalWDom.el;
  }

  if (needRerender && ['D', 'R', 'SR'].includes(needRerender)) {
    if (originalWDom) {
      runUnmountQueueFromWDom(originalWDom);
      recursiveRemoveEvent(originalWDom);
    }
    remakeWDom.oldChildren = originalWDom && originalWDom.children;
  }

  remakeWDom.oldProps = originalWDom && originalWDom.props;
};

const addReRenderTypeProperty = (
  newWDom: WDom,
  isSameType: boolean,
  originalWDom?: WDom
): RenderType | undefined => {
  if (checkEmptyElement(newWDom)) return 'D';

  const isSameText =
    newWDom.type === 't' &&
    isSameType &&
    newWDom.text === (originalWDom && originalWDom.text);
  if (isSameText || newWDom === originalWDom) return 'N';

  const existOriginalWDom = originalWDom && originalWDom.type;
  if (!existOriginalWDom) return 'A';

  const key = getKey(newWDom);
  const parent = getParent(originalWDom);
  const isKeyChecked =
    !newWDom.isRoot && parent && parent.type === 'l' && checkExisty(key);

  let result: RenderType = isSameType
    ? isKeyChecked
      ? 'SU'
      : 'U'
    : isKeyChecked
      ? 'SR'
      : 'R';

  if (
    newWDom.type === 'l' &&
    result === 'U' &&
    originalWDom &&
    chkDiffLoopOrder(newWDom, originalWDom)
  ) {
    result = 'CNSU';
  }

  return result;
};

const chkDiffLoopOrder = (newWDom: WDom, originalWDom: WDom) => {
  const origChildren = [...((originalWDom && originalWDom.children) || [])];
  const newChildren = [...((newWDom && newWDom.children) || [])].filter(item =>
    origChildren.find(newItem => getKey(item) === getKey(newItem))
  );
  const filteredChildren = origChildren.filter(item =>
    newChildren.find(newItem => getKey(item) === getKey(newItem))
  );
  let isSame = filteredChildren.length === newChildren.length;

  if (isSame) {
    isSame = filteredChildren.every(
      (item, index) => getKey(item) === getKey(newChildren[index])
    );
  }

  return isSame;
};

const syncResolverProps = (props: Props, infoProps: Props) => {
  if (props && infoProps !== props) {
    keys(props).forEach(key => delete props[key]);
    entries(infoProps || {}).forEach(([key, value]) => (props[key] = value));
  }
};

const syncResolverChildren = (children: WDom[], infoChidren: WDom[]) => {
  if (children) {
    children.splice(0, children.length);

    if (infoChidren) {
      infoChidren.forEach(childrenItem => children.push(childrenItem));
    }
  }
};

const runUpdate = (vDom: WDom, infoVdom: TagFunctionResolver) => {
  const { compProps: props, compChild: children } = vDom;
  const { props: infoProps, children: infoChidren } = infoVdom;

  if (props) {
    syncResolverProps(props, infoProps);
  }

  if (children && infoChidren && children !== infoChidren) {
    syncResolverChildren(children, infoChidren);
  }

  const newVDom = vDom.reRender && vDom.reRender();

  return newVDom as WDom;
};

const generalize = (
  newWDom: WDom | TagFunctionResolver,
  isSameType: boolean,
  originalWDom?: WDom
): WDom => {
  return checkCustemComponentFunction(newWDom)
    ? isSameType && originalWDom
      ? runUpdate(originalWDom, newWDom)
      : newWDom.resolve()
    : newWDom;
};

const remakeChildrenForDiff = (
  newWDom: WDom,
  isSameType: boolean,
  originalWDom?: WDom
) =>
  isSameType && originalWDom
    ? remakeChildrenForUpdate(newWDom, originalWDom)
    : remakeChildrenForAdd(newWDom);

const remakeChildrenForAdd = (newWDom: WDom) =>
  (newWDom.children || []).map((item: WDom) =>
    assign(makeNewWDomTree(item), { getParent: () => newWDom })
  );

const remakeChildrenForUpdate = (newWDom: WDom, originalWDom: WDom) =>
  newWDom.type === 'l' && checkExisty(getKey((newWDom.children || [])[0]))
    ? remakeChildrenForLoopUpdate(newWDom, originalWDom)
    : (newWDom.children || []).map((item: WDom, index: number) =>
        assign(makeNewWDomTree(item, (originalWDom.children || [])[index]), {
          getParent: () => newWDom,
        })
      );

const remakeChildrenForLoopUpdate = (newWDom: WDom, originalWDom: WDom) => {
  const [remakedChildren, unUsedChildren] = diffLoopChildren(
    newWDom,
    originalWDom
  );

  unUsedChildren.forEach(unusedItem => {
    runUnmountQueueFromWDom(unusedItem);
    recursiveRemoveEvent(unusedItem);
    typeDelete(unusedItem);
  });

  return remakedChildren;
};

const diffLoopChildren = (newWDom: WDom, originalWDom: WDom) => {
  const origCh = [...(originalWDom.children || [])];
  const remaked = (newWDom.children || []).map(item => {
    const orig = findSameKeyOriginalItem(item, origCh);
    const child = makeNewWDomTree(item, orig);

    if (orig) origCh.splice(origCh.indexOf(orig), 1);
    child.getParent = () => newWDom;

    return child;
  });

  return [remaked, origCh];
};

const findSameKeyOriginalItem = (item: WDom, originalChildren: WDom[]) =>
  originalChildren.find(
    orignalChildItem => getKey(orignalChildItem) === getKey(item)
  );

export const Fragment = (_props: Props, ...children: WDom[]) =>
  ({
    type: 'f',
    [wdomSymbol]: true,
    children,
  }) as WDom;

export const h = (
  tag: TagFunction | FragmentFunction | string,
  props: Props,
  ...children: MiddleStateWDomChildren
) => {
  const nodeParentPointer: NodePointer = { value: undefined };
  const newChildren = remakeChildren(nodeParentPointer, children);
  const node = makeNode(tag, props || {}, newChildren);

  if (!checkCustemComponentFunction(node)) {
    nodeParentPointer.value = node;
  }

  return node;
};

export const portal = (wDom: WDom, portal: HTMLElement) =>
  h('portal', { portal }, wDom);

export const mount =
  <T>(component: Component<T>) =>
  (_props: T, _children?: MiddleStateWDomChildren) =>
    component;

const syncAncestorComponentChildren = (
  parent: WDom | undefined,
  prevChild: WDom,
  nextChild: WDom
) => {
  const walk = (node: WDom | undefined, visited: Set<WDom>): void => {
    if (!node || visited.has(node)) {
      return;
    }

    visited.add(node);

    if (node.compChild) {
      const childIndex = node.compChild.indexOf(prevChild);

      if (childIndex !== -1) {
        node.compChild.splice(childIndex, 1, nextChild);
      }
    }

    walk(node.getParent ? node.getParent() : undefined, visited);
  };

  walk(parent, new Set<WDom>());
};

export const replaceWDom = (
  tag: TagFunction,
  props: Props,
  children: WDom[],
  originalWDom: WDom
) => {
  if (originalWDom.isLegacy) {
    return;
  }
  needDiffRef.value = true;

  const newWDom = makeWDomResolver(tag, props, children);
  const newWDomTree = makeNewWDomTree(newWDom, originalWDom);
  const { isRoot, getParent, wrapElement, afterElement } = originalWDom;

  newWDomTree.getParent = getParent;

  if (!isRoot && getParent) {
    const parent = getParent();
    const brothers = (parent && parent.children) || [];
    const index = brothers.indexOf(originalWDom);

    if (index !== -1) {
      brothers.splice(index, 1, newWDomTree);
    }

    syncAncestorComponentChildren(parent, originalWDom, newWDomTree);
  } else {
    newWDomTree.isRoot = true;
    newWDomTree.wrapElement = wrapElement;
    newWDomTree.afterElement = afterElement;
  }

  needDiffRef.value = false;

  wDomUpdate(newWDomTree);
};

const makeNode = (
  tag: TagFunction | FragmentFunction | string,
  props: Props,
  children: WDom[]
) => {
  if (checkFragmentFunction(tag)) {
    return Fragment(props, ...children);
  } else if (checkCustemComponentFunction(tag)) {
    const componetMakeResolver = makeWDomResolver(tag, props, children);

    return needDiffRef.value
      ? componetMakeResolver
      : componetMakeResolver.resolve();
  }

  return {
    type: 'e',
    [wdomSymbol]: true,
    tag,
    props,
    children,
  } as WDom;
};

const remakeChildren = (
  nodeParentPointer: NodePointer,
  children: MiddleStateWDomChildren
): WDom[] =>
  children.map((item: MiddleStateWDom) =>
    assign(makeChildrenItem(item), { getParent: () => nodeParentPointer.value })
  );

const makeChildrenItem = (item: MiddleStateWDom): WDom => {
  if (item === null || item === undefined || item === false) {
    return { type: null, [wdomSymbol]: true } as WDom;
  } else if (Array.isArray(item)) {
    const nodeParentPointer: NodePointer = { value: undefined };
    const children = remakeChildren(nodeParentPointer, item);
    const node = {
      type: 'l',
      [wdomSymbol]: true,
      children,
    } as WDom;
    nodeParentPointer.value = node;

    return node;
  } else if (typeof item === 'string' || typeof item === 'number') {
    return { type: 't', [wdomSymbol]: true, text: item } as WDom;
  }

  return item;
};

const createComponentResolver = (
  tag: TagFunction,
  props: Props,
  wrappedChildren: WDom[]
) => {
  return (compKey = props) => {
    initMountHookState(compKey);

    const initialComponent = tag(props, wrappedChildren);
    const component =
      typeof initialComponent === 'function'
        ? initialComponent
        : () => () => initialComponent;
    const componentMaker = component(
      componentUpdate(compKey),
      props,
      wrappedChildren
    );

    return makeCustomNode(componentMaker, compKey, tag, props, wrappedChildren);
  };
};

const makeWDomResolver = (tag: TagFunction, props: Props, children: WDom[]) => {
  const tagName = tag.name;
  const ctor = tag;

  const wrappedChildren = children;

  const resolve = createComponentResolver(tag, props, wrappedChildren);

  return { tagName, ctor, props, children: wrappedChildren, resolve };
};

const makeCustomNode = (
  componentMaker: (props: Props) => WDom,
  compKey: Props,
  tag: TagFunction,
  props: Props,
  children: WDom[]
) => {
  const { wrappedComponentMaker, customNode } = wrapComponentMakerIfNeeded(
    componentMaker,
    props
  );
  const reRender = makeReRender(
    wrappedComponentMaker,
    compKey,
    tag,
    props,
    children
  );

  addComponentProps(customNode, compKey, tag, props, children, reRender);
  return customNode;
};

const makeReRender = (
  componentMaker: (props: Props) => WDom,
  compKey: Props,
  tag: TagFunction,
  props: Props,
  children: WDom[]
) => {
  const reRender = () =>
    wDomMaker(componentMaker, compKey, tag, props, children, reRender);
  return reRender;
};

const wDomMaker = (
  componentMaker: (props: Props) => WDom,
  compKey: Props,
  tag: TagFunction,
  props: Props,
  children: WDom[],
  reRender: () => WDom
) => {
  initUpdateHookState(compKey);
  runUpdateCallback();

  const customNode = componentMaker(props);
  addComponentProps(customNode, compKey, tag, props, children, reRender);

  return customNode;
};

const wrapComponentMakerIfNeeded = (
  componentMaker: (props: Props) => WDom,
  props: Props
): { wrappedComponentMaker: (props: Props) => WDom; customNode: WDom } => {
  let customNode = componentMaker(props);

  if (!customNode.reRender) {
    return { wrappedComponentMaker: componentMaker, customNode };
  }

  const wrappedComponentMaker = (newProps: Props): WDom => {
    const customNode = componentMaker(newProps);
    const newNode = Fragment({}, customNode);
    customNode.getParent = () => newNode;
    return newNode;
  };

  customNode = wrappedComponentMaker(props);

  return { wrappedComponentMaker, customNode };
};

const addComponentProps = (
  wDom: WDom,
  compKey: Props,
  tag: TagFunction,
  props: Props,
  children: WDom[],
  reRender: () => WDom
) => {
  assign(wDom, {
    compProps: props,
    compChild: children,
    ctor: tag,
    tagName: tag.name,
    compKey,
    reRender,
  });

  setRedrawAction(compKey, () => replaceWDom(tag, props, children, wDom));

  if (getComponentSubInfo(compKey, 'vd')) {
    (getComponentSubInfo(compKey, 'vd') as { value: WDom }).value = wDom;
  }
};

export type PropSingleChild<T = unknown> =
  T extends MiddleStateWDomChildren[number]
    ? T
    : MiddleStateWDomChildren[number];

export type PropChildren<T = WDom> = (T extends MiddleStateWDomChildren[number]
  ? T
  : MiddleStateWDomChildren[number])[];

export const unwrapChildren = <T = unknown>(
  children: PropChildren<T> | undefined
): PropSingleChild<T> | PropChildren<T> | undefined => {
  if (!children || children.length === 0) {
    return undefined;
  }

  return children.length === 1 ? children[0] : children;
};

export type State<T> = {
  value: T;
  v: T;
};

export const state = <T>(value: T, renew: () => boolean): State<T> => {
  let result = value;

  return {
    get value() {
      return result;
    },
    get v() {
      return result;
    },
    set value(newValue: T) {
      result = newValue;
      renew();
    },
    set v(newValue: T) {
      result = newValue;
      renew();
    },
  };
};

export type Computed<T> = {
  readonly value: T;
  readonly v: T;
};

export const computed = <T>(value: () => T): Computed<T> => {
  let result = value;

  return {
    get value() {
      return result();
    },
    get v() {
      return result();
    },
    set value(_newValue: T) {
      throw new Error(`You can't change 'computed'`);
    },
    set v(_newValue: T) {
      throw new Error(`You can't change 'computed'`);
    },
  };
};

export const effect = (
  forward: () => (() => void) | void,
  backward: () => (() => void) | void = () => {},
  dependencies: () => any[] = () => []
) => {
  mountCallback(() => {
    forward();

    return backward;
  });

  updateCallback(() => {
    if (backward) {
      backward();
    }

    return forward;
  }, dependencies);
};

export const nextTickRender = (
  wDomMaker: () => WDom,
  wrapElement: HTMLElement | null,
  afterElement?: HTMLElement | null
) => {
  let destroy = () => {};

  nextTick().then(() => {
    destroy = render(wDomMaker(), wrapElement, afterElement);
  });

  return () => destroy();
};

export const cacheUpdate = (
  checkFunction: () => unknown[],
  updater: (props: Props) => WDom
) => {
  let originalDefs: unknown[] = [];
  let originalUpdater: WDom | null = null;

  return (props: Props) => {
    const newDefs = checkFunction();
    const isSame = originalDefs.every((def, index) => def === newDefs[index]);

    originalDefs = newDefs;

    if (isSame && originalUpdater) {
      return originalUpdater;
    }

    const newUpdater = updater(props);
    originalUpdater = newUpdater;

    return newUpdater;
  };
};

const INJECT = Symbol('INJECT');
const ADDRENEW = Symbol('ADDRENEW');
const providerSymbol = Symbol('Provider');

export type ContextState<T> = {
  value: T;
  [INJECT]: (value: T) => void;
  [ADDRENEW]: (renewFn: (newValue: T) => boolean) => boolean;
};

export type ProviderProps<T> =
  T extends Record<string, unknown>
    ? {
        [K in keyof T]: ContextState<T[K]>;
      }
    : never;

export type Context<T> = {
  Provider: ReturnType<typeof mount<ProviderProps<T>>>;
  contextState: <V>(value?: V, renew?: Renew) => ContextState<V>;
  useContext: (
    context: Context<T>,
    renew: Renew,
    subscribeKeys?: string[]
  ) => T extends Record<string, unknown> ? ProviderProps<T> : ContextState<T>;
};

type ProviderPropsInternal<T> = ProviderProps<T> & {
  [providerSymbol]?: boolean;
};

export function createContext<T>(): Context<T> {
  const Provider = mount<ProviderPropsInternal<T>>(
    (_renew, props, children: WDom[]) => {
      props[providerSymbol] = true;

      return () => Fragment({}, ...children);
    }
  );

  const useContext = (
    context: Context<T>,
    renew: Renew,
    subscribeKeys?: string[]
  ) => {
    const targetProvider = context.Provider;

    if (targetProvider !== Provider) {
      throw new Error('Context mismatch: Provider does not match');
    }

    const myCompKey = getComponentKey();

    const cStateMap: Record<string, ContextState<unknown>> = {};

    const createStateForKey = (key: string) => {
      cStateMap[key] = createContextState();
    };

    if (subscribeKeys) {
      subscribeKeys.forEach(key => createStateForKey(key));
    }

    const findProviderInTree = (
      wdom?: WDom
    ): ProviderPropsInternal<T> | null => {
      if (!wdom) {
        const vdRef =
          myCompKey &&
          (getComponentSubInfo(myCompKey, 'vd') as {
            value: WDom;
          } | null);
        return vdRef?.value ? findProviderInTree(vdRef.value) : null;
      }

      if (
        wdom.compProps &&
        (wdom.compProps as ProviderPropsInternal<T>)[providerSymbol]
      ) {
        return wdom.compProps as ProviderPropsInternal<T>;
      }

      const parent = wdom.getParent?.();
      return parent ? findProviderInTree(parent) : null;
    };

    mountReadyCallback(() => {
      const providerProps = findProviderInTree();

      if (providerProps) {
        const keysToConnect =
          subscribeKeys ||
          Object.keys(providerProps).filter(
            k =>
              typeof k === 'string' &&
              k !== 'children' &&
              providerProps[k as keyof ProviderPropsInternal<T>] &&
              typeof (
                providerProps[
                  k as keyof ProviderPropsInternal<T>
                ] as ContextState<unknown>
              )[ADDRENEW] === 'function'
          );

        keysToConnect.forEach((key: string) => {
          if (!cStateMap[key]) {
            createStateForKey(key);
          }

          const providerState = providerProps[
            key as keyof ProviderPropsInternal<T>
          ] as ContextState<unknown> | undefined;

          if (!providerState) return;

          const cState = cStateMap[key];

          cState[INJECT](providerState.value);

          const wrapRenew = (newValue: unknown) => {
            cState[INJECT](newValue);
            return renew();
          };

          providerState[ADDRENEW](wrapRenew);

          cState[ADDRENEW]((newValue: unknown) => {
            providerState.value = newValue;
            return true;
          });
        });

        renew();
      }
    });

    return cStateMap as T extends Record<string, unknown>
      ? ProviderProps<T>
      : ContextState<T>;
  };

  return {
    Provider,
    contextState: createContextState,
    useContext,
  };
}

const createContextState = <T,>(
  value?: T,
  renew?: Renew
): ContextState<T> => {
  let result = value as T;
  let renewlist: Array<(value: T) => boolean> = [];

  if (renew) {
    renewlist.push(() => {
      return renew();
    });
  }

  return {
    get value() {
      return result;
    },
    set value(newValue: T) {
      result = newValue;
      if (renewlist.length) {
        renewlist = renewlist.filter(wrapRenew => wrapRenew(result));
      }
    },
    [INJECT](newValue: T) {
      result = newValue;
    },
    [ADDRENEW](wrapRenew: (value: T) => boolean) {
      renewlist.push(wrapRenew);
      return true;
    },
  };
};

export type StoreRenew<T> = (store: T) => boolean | AbortSignal | void;
export type StoreType<V> = V extends { [key: string]: unknown }
  ? V
  : { value: V };
export type StoreObserver<T> = (store: T) => unknown[];
export type StoreOptions = { cache?: boolean };

type Run = () => boolean | AbortSignal | void;
type StoreValue = {
  [key: string | symbol]: Set<Run>;
};

const DEFAULT_OPTION = { cache: true };

export function store<V>(initialValue: V) {
  type T = StoreType<V>;

  const allowInitSetting = { value: false };
  const isObjectTypeValue =
    !Array.isArray(initialValue) &&
    typeof initialValue === 'object' &&
    initialValue !== null;
  const value: T = isObjectTypeValue
    ? (initialValue as T)
    : ({ value: initialValue } as T);

  const storeRenderList: Set<Run> = new Set();
  const storeRenderObserveList: StoreValue[] = [];
  const cacheMap = new WeakMap<StoreRenew<T>, T>();

  return (
    renew?: StoreRenew<T>,
    makeObserver?: StoreObserver<T> | null,
    userOption?: StoreOptions
  ) => {
    const { cache } = Object.assign({}, DEFAULT_OPTION, userOption || {});

    if (cache && renew && cacheMap.has(renew)) {
      return cacheMap.get(renew)!;
    }

    const storeRenderObserveMap: StoreValue = {};
    const allowedAccessProp: Set<keyof T> = new Set();

    let makedProxy: { value: null | T } = { value: null };
    let run: Run = () => {};

    storeRenderObserveList.push(storeRenderObserveMap);

    if (renew && makeObserver) {
      run = () => renew(makedProxy.value!);
      makedProxy.value = updater<T>(
        value,
        allowInitSetting,
        storeRenderList,
        allowedAccessProp,
        storeRenderObserveList,
        run,
        storeRenderObserveMap
      );
      allowInitSetting.value = true;
      makeObserver(makedProxy.value);
      allowInitSetting.value = false;
    }

    if (!makedProxy.value) {
      makedProxy.value = updater<T>(
        value,
        allowInitSetting,
        storeRenderList,
        allowedAccessProp,
        storeRenderObserveList
      );

      if (renew) {
        run = () => renew(makedProxy.value!);
        storeRenderList.add(run);
      }
    }

    if (renew) {
      runFirstEmit<T>(
        run,
        storeRenderList,
        storeRenderObserveMap,
        allowedAccessProp
      );
      cacheMap.set(renew, makedProxy.value);
    }

    return makedProxy.value;
  };
}

function updater<T extends { [key: string | symbol]: unknown }>(
  value: T,
  allowInitSetting: { value: boolean },
  storeRenderList: Set<Run>,
  allowedAccessProp: Set<keyof T>,
  storeRenderObserveList: StoreValue[],
  run?: Run,
  storeRenderObserveMap?: StoreValue
) {
  const result = new Proxy(value, {
    get(target: T, prop: keyof T) {
      if (run && storeRenderObserveMap && allowInitSetting.value) {
        storeRenderObserveMap[prop] ??= new Set();

        if (!storeRenderObserveMap[prop].has(run)) {
          storeRenderObserveMap[prop].add(run);
          allowedAccessProp.add(prop);
        }
      }

      return target[prop];
    },
    set(target, prop: keyof T, value) {
      if (target[prop] === value) {
        return true;
      }

      target[prop] = value;

      execDependentCallbacks(storeRenderList, storeRenderObserveList, prop);

      return true;
    },
  });

  return result;
}

function execDependentCallbacks<T>(
  storeRenderList: Set<Run>,
  storeRenderObserveList: StoreValue[] = [],
  prop: keyof T
) {
  const trashCollections: Set<Run> = new Set();

  runWithtrashCollectUnit(storeRenderList).forEach(value =>
    trashCollections.add(value)
  );

  (storeRenderObserveList || []).forEach(storeRenderObserveMap => {
    const renderObserveList: Set<Run> =
      storeRenderObserveMap[prop] || new Set<Run>();

    runWithtrashCollectUnit(renderObserveList).forEach(value =>
      trashCollections.add(value)
    );

    removeTrashCollect(trashCollections, renderObserveList);
  });

  removeTrashCollect(trashCollections, storeRenderList);
}

function removeTrashCollect(trashCollections: Set<Run>, targetList: Set<Run>) {
  trashCollections.forEach(deleteTarget => {
    targetList.delete(deleteTarget);
  });
}

function runWithtrashCollectUnit(storeRenderList: Set<Run>) {
  const trashes: Run[] = [];
  storeRenderList.forEach(run => {
    if (run() === false) {
      trashes.push(run);
    }
  });
  return trashes;
}

function runFirstEmit<T>(
  run: () => boolean | void | AbortSignal,
  storeRenderList: Set<Run>,
  storeRenderObserveMap: StoreValue,
  allowedAccessProp: Set<keyof T>
) {
  const renewResult = run();

  if (renewResult instanceof AbortSignal) {
    renewResult.addEventListener('abort', () => {
      const renderObserveList: StoreValue = storeRenderObserveMap || {};

      storeRenderList.delete(run);

      Object.entries(renderObserveList).forEach(([key, item]) => {
        item.delete(run);
        allowedAccessProp.delete(key as keyof T);
      });
    });
  }
}
