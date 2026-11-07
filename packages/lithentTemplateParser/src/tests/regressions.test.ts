import { describe, expect, it } from 'vitest';
import { h, Fragment } from 'lithent';
import { renderToString } from '../../../../ssr/src/renderToString';
import { compile, type CompileOptions } from '../compiler';
import { transformDocument } from '../docPipe';

function evaluate(
  template: string,
  scope: Record<string, unknown> = {},
  options?: CompileOptions
) {
  const result = compile(template, options);
  expect(result.errors).toEqual([]);
  return new Function(
    'h',
    'Fragment',
    ...Object.keys(scope),
    `return (${result.code});`
  )(h, Fragment, ...Object.values(scope));
}

function render(
  template: string,
  scope: Record<string, unknown> = {},
  options?: CompileOptions
) {
  return renderToString(evaluate(template, scope, options));
}

describe('executable template regressions', () => {
  it('renders hyphenated and namespaced attributes', () => {
    expect(render('<div data-id="x" aria-label="hello" />')).toBe(
      '<div data-id="x" aria-label="hello"></div>'
    );
    expect(() => evaluate('<svg xml:lang="en" />')).not.toThrow();
  });

  it('preserves backslashes and line breaks in static properties', () => {
    expect(render(String.raw`<div title="C:\temp" />`)).toContain(
      String.raw`title="C:\temp"`
    );
    expect(render('<div title="hello\nworld" />')).toContain(
      'title="hello\nworld"'
    );
  });

  it('loops before evaluating conditions that use the loop variable', () => {
    expect(
      render(
        '<ul><li l-for={item in items} l-if={item.visible}>{item.label}</li></ul>',
        {
          items: [
            { visible: true, label: 'yes' },
            { visible: false, label: 'no' },
          ],
        }
      )
    ).toBe('<ul><li>yes</li></ul>');
  });

  it('preserves loops on each branch of a conditional chain', () => {
    const template =
      '<ul><li l-if={ok}>primary</li><li l-else l-for={other in fallback}>{other}</li></ul>';
    expect(
      render(template, { ok: true, items: ['a', 'b'], fallback: ['c'] })
    ).toBe('<ul><li>primary</li></ul>');
    expect(
      render(template, { ok: false, items: ['a', 'b'], fallback: ['c'] })
    ).toBe('<ul><li>c</li></ul>');
  });

  it('allows comments and whitespace between conditional branches', () => {
    const template =
      '<main><div l-if={ok}>yes</div>\n<!-- comment --><div l-else>no</div></main>';
    expect(render(template, { ok: true })).toBe('<main><div>yes</div></main>');
    expect(render(template, { ok: false })).toBe('<main><div>no</div></main>');
  });

  it('preserves meaningful spaces around interpolations and inline elements', () => {
    expect(render('<p>Hello {name}, welcome!</p>', { name: 'Ada' })).toBe(
      '<p>Hello Ada, welcome!</p>'
    );
    expect(render('<p><b>Hello</b> <i>world</i></p>')).toBe(
      '<p><b>Hello</b> <i>world</i></p>'
    );
    expect(
      render('<p> Hello</p>', {}, { transform: { optimize: false } })
    ).toBe('<p> Hello</p>');
  });

  it('preserves preformatted content and explicitly disabled whitespace trimming', () => {
    expect(render('<pre>\n  Hello {name}\n</pre>', { name: 'Ada' })).toBe(
      '<pre>\n  Hello Ada\n</pre>'
    );
    expect(
      render(
        '<p>  Hello  </p>',
        {},
        {
          transform: {
            optimizeOptions: { trimText: false, removeWhitespace: false },
          },
        }
      )
    ).toBe('<p>  Hello  </p>');
  });

  it('preserves comma-expression values in children and properties', () => {
    expect(render('<div>{a, b}</div>', { a: 'first', b: 'second' })).toBe(
      '<div>second</div>'
    );
    expect(render('<div title={a, b} />', { a: 'first', b: 'second' })).toBe(
      '<div title="second"></div>'
    );
  });

  it.each([
    ['1 /* } */ + 2', '3'],
    ['1 // }\n + 2', '3'],
    ['String(/}/.test(value))', 'true'],
    ['String(/[/{}]/.test(value))', 'true'],
    ['8 / 2 / 2', '2'],
    ['`hello ${`${value}`}`', 'hello }'],
  ])('handles JavaScript lexical contexts in %s', (expression, expected) => {
    expect(render(`<p>{${expression}}</p>`, { value: '}' })).toBe(
      `<p>${expected}</p>`
    );
  });

  it('compiles embedded templates after return', () => {
    expect(
      render(
        '<div>{items.map(item => { return <span>{item}</span>; })}</div>',
        { items: ['a', 'b'] }
      )
    ).toBe('<div><span>a</span><span>b</span></div>');
  });

  it.each([
    '<div>hello',
    '</div>',
    '<!-- unclosed',
    '<div title="unclosed',
    '<div l-else>fallback</div>',
    '<div l-else-if={ok} />',
    '<li l-for={item of items}>{item}</li>',
    '<div value={} />',
    '<div l-if={} />',
    '<div value={foo />',
    '<div l-if={ok} /><span /><div l-else />',
    '<><div /></div>',
    '<>',
  ])('reports positioned errors for malformed input %s', template => {
    const result = compile(template);
    expect(result.code).toBe('');
    expect(result.errors.length).toBeGreaterThan(0);
    expect(result.errors[0].line).toBeGreaterThan(0);
    expect(result.errors[0].column).toBeGreaterThan(0);
  });
});

describe('document scanning regressions', () => {
  it('transforms bare return templates', () => {
    const result = transformDocument('function View() { return <div />; }');
    expect(result.errors).toEqual([]);
    expect(result.transformed).toBe(true);
    expect(new Function('h', `${result.code}; return View();`)(h).tag).toBe(
      'div'
    );
  });

  it('does not interpret comment-looking template text as JavaScript', () => {
    const result = transformDocument(
      'const View=()=> <p>https://example.com /* hello */</p>;'
    );
    expect(result.transformed).toBe(true);
    expect(
      renderToString(new Function('h', `${result.code}; return View();`)(h))
    ).toBe('<p>https://example.com /* hello */</p>');
  });

  it('preserves regexes, strings, comments, comparisons and TypeScript generics', () => {
    const source = String.raw`const re = /<img \/>/; const text = '<div />'; // <a />
const less = a < b; const identity = <T>(value: T) => value;`;
    expect(transformDocument(source).code).toBe(source);
  });

  it('preserves regex expression statements after control parentheses and blocks', () => {
    const source = String.raw`if (ok) /<img \/>/.test(html); if (ok) {} /<div \/>/.test(html);`;
    expect(transformDocument(source).code).toBe(source);
  });

  it('transforms templates after division and preserves regexes elsewhere', () => {
    const source = String.raw`const re = /<img \/>/; const n = 8 / 2; const View = () => <p>{n}</p>;`;
    const result = transformDocument(source);
    expect(result.transformed).toBe(true);
    const view = new Function('h', `${result.code}; return View();`)(h);
    expect(renderToString(view)).toBe('<p>4</p>');
  });
});
