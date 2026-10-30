// Experimental opaque HTML description. No compiler or public export.
import type { WDom, Props } from '@/types';
import { createWDom } from '@/utils/createWDom';
import { metrics } from './metrics';
declare const __STATIC_DIAGNOSTIC__: boolean;

type Scalar = string | number | undefined;
type Value = Scalar | ((event: Event) => void);
export type Slot = { slot: number };
export type Schema = {
  tag: string;
  attrs?: Record<string, Scalar | Slot>;
  children?: (Schema | Slot | string | number)[];
};
type Binding = { slot: number; name?: string; root: boolean };
type Plan = {
  tag?: string;
  text?: string | number;
  props: Props;
  attributes: { name: string; slot: number; binding: number }[];
  textBinding?: number;
  children: Plan[];
};
type Blueprint = { plan: Plan; bindings: Binding[]; arity: number };
type State = {
  blueprint: Blueprint;
  values: readonly Value[];
  refs?: WDom[];
  changed?: number[];
  previous?: readonly Value[];
  phase: 'fresh' | 'clean' | 'pending' | 'fault';
};
const blocks = new WeakMap<WDom, State>();
const tags = new Set(
  'a button div em li p section small span strong table tbody td th thead tr ul'.split(
    ' '
  )
);
const fail = (message: string): never => {
  throw Error('Static block: ' + message);
};
const data = (object: object) => {
  const descriptors = Object.getOwnPropertyDescriptors(object);
  for (const d of Object.values(descriptors))
    if (d.get || d.set) fail('schema accessors are unsupported');
  return object;
};
const slotIndex = (value: object) => {
  data(value);
  const keys = Object.keys(value);
  const index = (value as Slot).slot;
  if (
    keys.length !== 1 ||
    keys[0] !== 'slot' ||
    !Number.isSafeInteger(index) ||
    index < 0
  )
    fail('invalid slot');
  return index;
};
export function defineBlock(schema: Schema) {
  const bindings: Binding[] = [];
  const bind = (slot: number, root: boolean, name?: string) =>
    bindings.push({ slot, root, name }) - 1;
  function compile(value: Schema | Slot | string | number, root = false): Plan {
    if (typeof value === 'string' || typeof value === 'number')
      return { text: value, props: {}, attributes: [], children: [] };
    data(value);
    if ('slot' in value) {
      if (root) fail('root must be an element');
      const slot = slotIndex(value);
      return {
        props: {},
        attributes: [],
        children: [],
        textBinding: bind(slot, false),
      };
    }
    if (!tags.has(value.tag)) fail('unsupported HTML tag');
    const props: Props = {},
      attributes: Plan['attributes'] = [];
    data(value.attrs || {});
    for (const [name, attr] of Object.entries(value.attrs || {})) {
      const event = /^on[A-Za-z]+$/.test(name);
      if (
        !event &&
        !/^(class|className|title|id|role|href|type|aria-[\w-]+|data-[\w-]+)$/.test(
          name
        )
      )
        fail('unsupported attribute ' + name);
      if (attr && typeof attr === 'object') {
        const slot = slotIndex(attr);
        attributes.push({ name, slot, binding: bind(slot, root, name) });
      } else {
        if (
          event ||
          (attr !== undefined &&
            typeof attr !== 'string' &&
            typeof attr !== 'number')
        )
          fail('unsupported static value');
        props[name] = attr;
      }
    }
    return {
      tag: value.tag,
      props: Object.freeze(props),
      attributes,
      children: (
        data(value.children || []) as (Schema | Slot | string | number)[]
      ).map(child => compile(child)),
    };
  }
  const plan = compile(schema, true);
  const blueprint: Blueprint = {
    plan,
    bindings,
    arity: bindings.reduce((n, b) => Math.max(n, b.slot + 1), 0),
  };
  return (values: readonly Value[], key?: string | number): WDom => {
    if (values.length !== blueprint.arity) fail('wrong value arity');
    const snapshot = values.slice();
    for (const b of bindings) {
      const value = snapshot[b.slot];
      if (b.name?.startsWith('on')) {
        if (value !== undefined && typeof value !== 'function')
          fail('invalid event value');
      } else if (
        typeof value !== 'string' &&
        typeof value !== 'number' &&
        (b.name === undefined || value !== undefined)
      ) {
        fail('invalid scalar value');
      }
    }
    if (key !== undefined && typeof key !== 'string' && typeof key !== 'number')
      fail('invalid key');
    return description(blueprint, snapshot, key);
  };
}
function propsFor(plan: Plan, values: readonly Value[], key?: string | number) {
  if (!plan.attributes.length && key === undefined) return plan.props;
  const props = { ...plan.props };
  for (const attr of plan.attributes) props[attr.name] = values[attr.slot];
  if (key !== undefined) props.key = key;
  return props;
}
function description(
  blueprint: Blueprint,
  values: readonly Value[],
  key?: string | number
) {
  const root = createWDom(
    'e',
    blueprint.plan.tag,
    propsFor(blueprint.plan, values, key),
    undefined,
    []
  );
  blocks.set(root, { blueprint, values, phase: 'fresh' });
  return root;
}
export function materializeBlock(root: WDom) {
  const state = blocks.get(root);
  if (!state || state.phase !== 'fresh') return;
  const refs: WDom[] = [];
  const build = (plan: Plan, parent?: () => WDom, useRoot?: WDom): WDom => {
    const node =
      useRoot ||
      createWDom(
        plan.tag ? 'e' : 't',
        plan.tag,
        plan.tag ? propsFor(plan, state.values) : undefined,
        plan.textBinding !== undefined
          ? (state.values[state.blueprint.bindings[plan.textBinding].slot] as
              | string
              | number)
          : plan.text,
        plan.tag ? [] : undefined,
        parent
      );
    for (const attr of plan.attributes)
      if (!state.blueprint.bindings[attr.binding].root)
        refs[attr.binding] = node;
    if (plan.textBinding !== undefined) refs[plan.textBinding] = node;
    if (plan.tag) {
      const getParent = () => node;
      node.children = plan.children.map(child => build(child, getParent));
    }
    return node;
  };
  build(state.blueprint.plan, undefined, root);
  state.refs = refs;
  state.phase = 'clean';
  if (__STATIC_DIAGNOSTIC__) metrics.materialized++;
}
export function cloneBlock(root: WDom): WDom | undefined {
  const state = blocks.get(root);
  if (!state) return;
  if (state.phase === 'fault') fail('commit fault: unmount/remount required');
  const copy = description(
    state.blueprint,
    state.values,
    root.props?.key as string | number | undefined
  );
  copy.getParent = root.getParent;
  materializeBlock(copy);
  if (__STATIC_DIAGNOSTIC__) metrics.templateClones++;
  return copy;
}
export function reconcileBlock(next: WDom, original?: WDom): WDom | undefined {
  const state = blocks.get(next);
  if (!state || !original || next === original) return;
  const old = blocks.get(original);
  if (
    !old ||
    old.blueprint !== state.blueprint ||
    original.props?.key !== next.props?.key ||
    original.il
  )
    return;
  if (old.phase === 'fault') fail('commit fault: unmount/remount required');
  if (state.phase === 'fault') fail('commit fault: unmount/remount required');
  // Only committed instances transfer their static children. Other cases
  // materialize and take the ordinary full diff, never borrow pending state.
  if (old.phase !== 'clean' || !old.refs) return;
  const changed: number[] = [];
  state.blueprint.bindings.forEach((binding, index) => {
    if (__STATIC_DIAGNOSTIC__) metrics.comparedSlots++;
    if (state.values[binding.slot] !== old.values[binding.slot])
      changed.push(index);
  });
  next.children = original.children;
  next.el = original.el;
  const getParent = () => next;
  next.children?.forEach(child => {
    child.getParent = getParent;
  });
  next.nr = changed.length
    ? original.getParent?.()?.type === 'l'
      ? 'T'
      : 'U'
    : 'N';
  next.op = original.props;
  original.il = true;
  state.refs = old.refs;
  state.changed = changed.length ? changed : undefined;
  state.previous = changed.length ? old.values : undefined;
  state.phase = changed.length ? 'pending' : 'clean';
  if (__STATIC_DIAGNOSTIC__) metrics.fastBlocks++;
  return next;
}
export function commitBlock(
  root: WDom,
  writeProps: (props: Props, element: WDom['el'], previous: Props) => void,
  writeText: (node: WDom) => void
): boolean {
  const state = blocks.get(root);
  if (!state || state.phase !== 'pending') return false;
  try {
    for (const index of state.changed!) {
      const binding = state.blueprint.bindings[index];
      const target = binding.root ? root : state.refs![index];
      const value = state.values[binding.slot];
      if (binding.name !== undefined) {
        if (target !== root)
          target.props = { ...target.props, [binding.name]: value };
        writeProps({ [binding.name]: value }, target.el, {
          [binding.name]: state.previous![binding.slot],
        });
      } else {
        target.text = value as string | number;
        writeText(target);
      }
    }
    state.phase = 'clean';
    state.changed = undefined;
    state.previous = undefined;
  } catch (error) {
    state.phase = 'fault';
    throw error;
  }
  return true;
}
