import { describe, it, expect } from 'vitest';
import { h, mount, Fragment } from 'lithent';
import { renderToString } from '../renderToString';

// ── helpers ──

/** Render a no-arg component to string */
function render(Comp: ReturnType<typeof mount>): string {
  return renderToString(h(Comp, {}));
}

// ── Text node HTML escaping ──

describe('renderToString — text node HTML escaping', () => {
  it('escapes < and > in text node content', () => {
    const Comp = mount(_r => () => (
      <p>{'Page shell with <h-state> anchors'}</p>
    ));
    expect(render(Comp)).toBe('<p>Page shell with &lt;h-state&gt; anchors</p>');
  });

  it('escapes & in text node content', () => {
    const Comp = mount(_r => () => <p>{'foo & bar'}</p>);
    expect(render(Comp)).toBe('<p>foo &amp; bar</p>');
  });

  it('escapes multiple occurrences', () => {
    const Comp = mount(_r => () => <p>{'<b>bold</b> & <i>italic</i>'}</p>);
    expect(render(Comp)).toBe(
      '<p>&lt;b&gt;bold&lt;/b&gt; &amp; &lt;i&gt;italic&lt;/i&gt;</p>'
    );
  });

  it('does not escape plain text', () => {
    const Comp = mount(_r => () => <p>{'hello world'}</p>);
    expect(render(Comp)).toBe('<p>hello world</p>');
  });

  it('does not escape innerHTML prop (raw HTML passthrough)', () => {
    const Comp = mount(_r => () => (
      <section innerHTML="<article>raw content</article>" />
    ));
    expect(render(Comp)).toBe(
      '<section><article>raw content</article></section>'
    );
  });

  it('escapes text nodes inside nested elements', () => {
    const Comp = mount(_r => () => (
      <div>
        <span>{'<script>alert(1)</script>'}</span>
      </div>
    ));
    expect(render(Comp)).toBe(
      '<div><span>&lt;script&gt;alert(1)&lt;/script&gt;</span></div>'
    );
  });

  it('escapes text nodes mixed with other children', () => {
    const Comp = mount(_r => () => (
      <p>
        {'prefix <tag> '}
        <strong>bold</strong>
        {' suffix'}
      </p>
    ));
    expect(render(Comp)).toBe(
      '<p>prefix &lt;tag&gt; <strong>bold</strong> suffix</p>'
    );
  });

  it('escapes text nodes inside Fragment', () => {
    const Comp = mount(_r => () => (
      <Fragment>
        <p>{'<h-state> anchor'}</p>
        <p>{'A & B'}</p>
      </Fragment>
    ));
    expect(render(Comp)).toBe('<p>&lt;h-state&gt; anchor</p><p>A &amp; B</p>');
  });
});

// ── Attribute value escaping ──

describe('renderToString — attribute escaping', () => {
  it('escapes " in an attribute value so it cannot close the attribute', () => {
    const value = '"><script>alert(1)</script>';
    const Comp = mount(_r => () => <input value={value} />);
    expect(render(Comp)).toBe(
      '<input value="&quot;&gt;&lt;script&gt;alert(1)&lt;/script&gt;" />'
    );
  });

  it('escapes & in an attribute value', () => {
    const Comp = mount(_r => () => <a href="/search?a=1&b=2">go</a>);
    expect(render(Comp)).toBe('<a href="/search?a=1&amp;b=2">go</a>');
  });

  it('escapes " in a style value', () => {
    const Comp = mount(_r => () => (
      <div style={{ fontFamily: '"Fira Code", monospace' }} />
    ));
    expect(render(Comp)).toBe(
      '<div style="font-family: &quot;Fira Code&quot;, monospace;"></div>'
    );
  });

  it('does not change a plain attribute value', () => {
    const Comp = mount(_r => () => <div class="a b" data-id={3} />);
    expect(render(Comp)).toBe('<div class="a b" data-id="3"></div>');
  });

  it('drops a prop whose name could not be an attribute name', () => {
    const props = { 'x onmouseover="alert(1)"': 'y', id: 'ok' };
    const Comp = mount(_r => () => <div {...props} />);
    expect(render(Comp)).toBe('<div id="ok"></div>');
  });

  it('round-trips through the HTML parser', () => {
    const value = `a"b'c<d>e&f`;
    const Comp = mount(_r => () => <div title={value} />);
    const wrap = document.createElement('div');
    wrap.innerHTML = render(Comp);
    expect(wrap.children.length).toBe(1);
    expect(wrap.firstElementChild!.getAttribute('title')).toBe(value);
  });
});
