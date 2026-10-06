import type { TagFunction } from 'lithent';

/**
 * Prop declarations for `defineElement`. Each key is a camelCase prop name
 * observed as its kebab-case attribute; the constructor picks the attribute
 * conversion (DESIGN §4.1).
 */
export type PropSpec = Record<
  string,
  StringConstructor | NumberConstructor | BooleanConstructor | ObjectConstructor
>;

export type DefineElementOptions<S extends PropSpec = PropSpec> = {
  props?: S;
  shadow?: boolean | 'open' | 'closed';
  styles?: string[];
};

/**
 * Register a lithent component as a Custom Element.
 *
 * Phase 0 scaffold: the signature is fixed here, the behavior lands in
 * Phase 1 (docs/element/IMPLEMENT.md).
 */
export const defineElement = <S extends PropSpec = PropSpec>(
  _name: `${string}-${string}`,
  _component: TagFunction,
  _options?: DefineElementOptions<S>
): CustomElementConstructor | undefined => undefined;
