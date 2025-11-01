import { describe, expect, it } from 'vitest';
import { transformDocument } from '../docPipe';

const wrapStrong = (content: string): string =>
  `<strong class="todo-status pending">${content}</strong>`;

describe('docPipe: transformDocument', () => {
  const cases = [
    {
      name: 'text containing single quote',
      source: wrapStrong("as'ldkgjas"),
      expected: "h('strong', { class: 'todo-status pending' }, 'as\\'ldkgjas')",
    },
    {
      name: 'text containing double quote',
      source: wrapStrong('as"ldkgjas'),
      expected: "h('strong', { class: 'todo-status pending' }, 'as\"ldkgjas')",
    },
    {
      name: 'text containing backtick',
      source: wrapStrong('as`ldkgjas'),
      expected: "h('strong', { class: 'todo-status pending' }, 'as`ldkgjas')",
    },
  ];

  for (const { name, source, expected } of cases) {
    it(`should transform template with ${name}`, () => {
      const result = transformDocument(source);
      expect(result.errors).toHaveLength(0);
      expect(result.transformed).toBe(true);
      expect(result.code).toContain(expected);
    });
  }

  it('should report compile error for unterminated expression braces', () => {
    const source = wrapStrong('as{ldkgjas');
    const result = transformDocument(source);
    expect(result.transformed).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });
});
