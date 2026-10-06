import { describe, it, expect, expectTypeOf } from 'vitest';
import { h, mount, lmount } from 'lithent';
import { defineElement } from '@/index';
import type { ElementProps, LithentElementOf, PropsOf } from '@/index';

/**
 * Phase 7 — types (RC-5). The build's type check (BG-4) compiles this file,
 * so every `@ts-expect-error` below must still be an error: a typing
 * regression fails the build, not only this test.
 */

const spec = { amount: Number, label: String, open: Boolean, options: Object };

describe('PropsOf (DESIGN §8)', () => {
  it('maps constructors to prop types; only Boolean is always present', () => {
    expectTypeOf<PropsOf<typeof spec>>().toEqualTypeOf<
      { open: boolean } & {
        amount?: number;
        label?: string;
        options?: unknown;
      }
    >();
    expectTypeOf<
      ElementProps<typeof spec>['host']
    >().toEqualTypeOf<HTMLElement>();
  });
});

describe('defineElement typing', () => {
  it('accepts components whose props match the declaration', () => {
    const Exact = mount<{
      amount?: number;
      label?: string;
      open: boolean;
      options?: unknown;
      host: HTMLElement;
    }>(() => () => h('i', {}));
    const Partial = mount<{ amount?: number }>(() => () => h('i', {}));
    const Untyped = mount(() => () => h('i', {}));
    const Light = lmount<{ label?: string }>(() => () => h('i', {}));

    expect(defineElement('typ-exact', Exact, { props: spec })).toBeDefined();
    expect(
      defineElement('typ-partial', Partial, { props: spec })
    ).toBeDefined();
    expect(defineElement('typ-untyped', Untyped)).toBeDefined();
    expect(defineElement('typ-light', Light, { props: spec })).toBeDefined();
  });

  it('types the constructor with a property per prop', () => {
    const Ctor = defineElement(
      'typ-ctor',
      mount(() => () => h('i', {})),
      {
        props: spec,
      }
    );
    expectTypeOf(Ctor).toEqualTypeOf<
      (new () => LithentElementOf<typeof spec>) | undefined
    >();
    const el = new Ctor!();
    expectTypeOf(el.amount).toEqualTypeOf<number | undefined>();
    expectTypeOf(el.open).toEqualTypeOf<boolean>();
    expectTypeOf(el).toMatchTypeOf<HTMLElement>();
    expect(el).toBeInstanceOf(HTMLElement);
  });
});

/**
 * Mismatches the types must reject. Never called: only compiled.
 */
export const rejectedAtCompileTime = () => {
  const NeedsAmount = mount<{ amount: number }>(() => () => h('i', {}));
  // @ts-expect-error amount can be absent: the component must accept undefined
  defineElement('typ-required', NeedsAmount, { props: { amount: Number } });

  const WrongType = mount<{ amount?: string }>(() => () => h('i', {}));
  // @ts-expect-error a Number prop is not a string
  defineElement('typ-wrong', WrongType, { props: { amount: Number } });

  const Undeclared = mount<{ extra: string }>(() => () => h('i', {}));
  // @ts-expect-error extra is never provided
  defineElement('typ-undeclared', Undeclared, { props: { amount: Number } });

  // A component whose props are all optional still has to have them
  // declared: none of them overlaps what the element provides.
  const OnlyOptional = mount<{ amount?: number }>(() => () => h('i', {}));
  // @ts-expect-error amount is not declared
  defineElement('typ-undeclared-optional', OnlyOptional);

  const NotHost = mount<{ host: string }>(() => () => h('i', {}));
  // @ts-expect-error host is the element
  defineElement('typ-host-type', NotHost);

  const C = mount(() => () => h('i', {}));
  // @ts-expect-error host is reserved
  defineElement('typ-host', C, { props: { host: String } });

  // @ts-expect-error custom element names need a hyphen
  defineElement('nohyphen', C);

  // @ts-expect-error only String, Number, Boolean and Object are conversions
  defineElement('typ-date', C, { props: { at: Date } });
};
