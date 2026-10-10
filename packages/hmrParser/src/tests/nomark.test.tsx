import { describe, expect, it } from 'vitest';
import { parse } from '@babel/parser';
import { transformWithoutMarker } from '../noMarkerParse';

const transform = (code: string) =>
  transformWithoutMarker({
    code,
    boundaryImportSpecifier: 'lithent/devHelper',
    tagFunctionImportSpecifier: 'lithent',
  });

describe('component discovery without a marker', () => {
  it.each([
    [
      'expression arrow',
      'export const Badge = ({label}) => <span>{label}</span>;',
    ],
    [
      'block arrow',
      'export const Badge = ({label}) => { return <span>{label}</span>; };',
    ],
    [
      'function declaration',
      'export function Badge({label}) { return <span>{label}</span>; }',
    ],
    [
      'function expression',
      'export const Badge = function ({label}) { return <span>{label}</span>; };',
    ],
    [
      'named default',
      'export default function Badge({label}) { return <span>{label}</span>; }',
    ],
    [
      'lowercase named default',
      'export default function badge() { return <span/>; }',
    ],
    ['null output', 'export const Empty = () => null;'],
    [
      'JSX list',
      'export const List = ({items}) => items.map(item => <span>{item}</span>);',
    ],
    [
      'returned local',
      'export const Badge = () => {const output = <span/>; return output;};',
    ],
    ['anonymous default', 'export default ({label}) => <span>{label}</span>;'],
    [
      'anonymous default function',
      'export default function ({label}) { return <span>{label}</span>; }',
    ],
  ])('discovers and produces valid syntax for %s', (_name, code) => {
    const result = transform(code);
    expect(result.transformed).toBe(true);
    expect(result.code).toContain('__lithentWrapComponent(');
    expect(() =>
      parse(result.code, {
        sourceType: 'module',
        plugins: ['typescript', 'jsx'],
      })
    ).not.toThrow();
  });

  it('discovers automatic JSX runtime calls and leaves ordinary helpers alone', () => {
    const result = transform(`
import {jsx as _jsx} from 'lithent/jsx-runtime';
export const Badge = props => _jsx('span', {children: props.label});
export const Format = value => String(value);
export const Handle = () => () => _jsx('span', {});
`);
    expect(result.code).toContain('__lithentWrapComponent("Badge",');
    expect(result.code).not.toContain('__lithentWrapComponent("Format",');
    expect(result.code).not.toContain('__lithentWrapComponent("Handle",');
  });

  it('handles aliased mount, lmount, and multiple declarations', () => {
    const result = transform(`
import {mount as make, lmount} from 'lithent';
export const A = make(function () {return () => <span/>;}), B = lmount(() => () => <div/>);
`);
    expect(result.code).toContain('__lithentWrapComponent("A", make(');
    expect(result.code).toContain('__lithentWrapComponent("B", lmount(');
    expect(() =>
      parse(result.code, {
        sourceType: 'module',
        plugins: ['typescript', 'jsx'],
      })
    ).not.toThrow();
  });

  it('recognizes namespace imports and typed expressions', () => {
    const result = transform(`
import * as core from 'lithent';
import * as runtime from 'lithent/jsx-runtime';
export const A = core.mount(() => () => core.h('span', {}));
export const B = props => runtime.jsx('span', {children: props.label});
export const C = (() => null) satisfies () => null;
`);
    for (const name of ['A', 'B', 'C'])
      expect(result.code).toContain(`__lithentWrapComponent("${name}",`);
  });

  it('does not treat imports from other frameworks as Lithent components', () => {
    const result = transform(
      "import {jsx} from 'react/jsx-runtime'; export const Badge = () => jsx('span', {});"
    );
    expect(result.transformed).toBe(false);
  });

  it('does not discover JSX side effects, async functions, or generators', () => {
    for (const source of [
      'export const Handle = () => {const ignored = <span/>; return 42;};',
      'export const Badge = async () => <span/>;',
      'export function* Badge() {yield <span/>;}',
    ]) {
      expect(transform(source).code).not.toContain('__lithentWrapComponent(');
    }
  });
});
