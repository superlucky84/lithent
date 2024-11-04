import { render } from 'lithent';
import { fMount, fTags, fFragment } from '@/index';

const { section, div, p, br, strong, article } = fTags;

const fTagComponent = fMount<any>((_r, props, children) => {
  return () =>
    fFragment(
      'first inner',
      div({ style: { border: '1px solid red' } }, 'second inner'),
      props.a,
      ...children
    );
});

const Root = fTagComponent(
  { a: 3 },
  div({ style: { border: '1px solid green' } }, `Fchildren1`),
  'Fchildren2',
  br(),
  section(
    'section first inner',
    p(
      'p tag wrap',
      strong({ style: 'font-style: italic; padding: 2px' }, 'strong tag child'),
      ' p tag child'
    )
  )
);

const testWrap =
  document.getElementById('root') || document.createElement('div');

if (!import.meta.vitest) {
  render(Root, testWrap);
}

if (import.meta.vitest) {
  const { describe, it, expect, afterEach } = import.meta.vitest;
  let destroy = () => {};

  describe('FTAG TEST', () => {
    afterEach(() => {
      destroy();
    });

    it('The generic element should print out fine.', () => {
      destroy = render(div('aaa'), testWrap);

      expect(testWrap.outerHTML).toBe('<div><div>aaa</div></div>');
    });

    it('A normal element with a prop should output fine.', () => {
      testWrap.innerHTML = '';

      destroy = render(
        div({ style: { border: '1px solid red' }, id: 'normal' }, 'aaa'),
        testWrap
      );

      expect(testWrap.outerHTML).toBe(
        '<div><div style="border: 1px solid red;" id="normal">aaa</div></div>'
      );
    });

    it('Custom component should output normally.', () => {
      const fTagComponent = fMount((_r, _props, children) => {
        return () => fFragment('inner text', ...children);
      });

      destroy = render(fTagComponent(), testWrap);

      expect(testWrap.outerHTML).toBe('<div>inner text</div>');
    });

    it('The custom component reflecting the prop value should output normally.', () => {
      const fTagComponent = fMount<{ a: number }>((_r, props, children) => {
        return () => fFragment('inner text', props.a, ...children);
      });

      destroy = render(fTagComponent({ a: 7 }), testWrap);

      expect(testWrap.outerHTML).toBe('<div>inner text7</div>');
    });

    it('Custom components with slots should output normally', () => {
      const fTagComponent = fMount((_r, _props, children) => {
        return () => fFragment('inner text', ...children);
      });

      destroy = render(
        fTagComponent(article('div1'), article('div2')),
        testWrap
      );

      expect(testWrap.outerHTML).toBe(
        '<div>inner text<article>div1</article><article>div2</article></div>'
      );
    });

    it('Custom components with slot and prop should output normally.', () => {
      const fTagComponent = fMount<{ a: number }>((_r, props, children) => {
        return () => fFragment('inner text', ...children, props.a);
      });

      destroy = render(
        fTagComponent({ a: 7 }, article('div1'), article('div2')),
        testWrap
      );

      expect(testWrap.outerHTML).toBe(
        '<div>inner text<article>div1</article><article>div2</article>7</div>'
      );
    });

    it('User components nested inside regular elements should be output correctly.', () => {
      const fTagComponent = fMount<{ a: number }>((_r, props, children) => {
        return () => fFragment('inner text', props.a, ...children);
      });

      destroy = render(
        div(
          { style: { border: '1px solid red' }, id: 'normal' },
          fTagComponent({ a: 9 }, 'aaa')
        ),
        testWrap
      );

      expect(testWrap.outerHTML).toBe(
        '<div><div style="border: 1px solid red;" id="normal">inner text9aaa</div></div>'
      );
    });
  });
}
