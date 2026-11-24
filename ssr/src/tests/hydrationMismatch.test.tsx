import { describe, it, expect, vi, afterEach } from 'vitest';
import { h, mount, nextTick } from 'lithent';
import type { TagFunction } from 'lithent';
import { renderToString } from '../renderToString';
import { hydration } from '../hydration';

/**
 * Hydration when the server HTML and the browser's tree differ, and the
 * cases next to it that must keep working: empty texts, which the server HTML
 * has no node for, and server nodes the tree has no place for.
 */

const SVG_NS = 'http://www.w3.org/2000/svg';

/** A host holding `html` as the server sent it. */
function serverHtml(html: string) {
  const host = document.createElement('div');
  host.innerHTML = html;
  document.body.replaceChildren(host);
  return host;
}

function hydrate(Comp: TagFunction, host: HTMLElement) {
  return hydration(h(Comp, {}), host);
}

function spyWarn() {
  return vi.spyOn(console, 'warn').mockImplementation(() => {});
}

afterEach(() => {
  vi.restoreAllMocks();
});

const Counter = mount(renew => {
  let count = 0;
  const inc = () => {
    count += 1;
    renew();
  };

  return () => (
    <div>
      <p>static</p>
      <button onClick={inc}>count {count}</button>
    </div>
  );
});

describe('hydration — empty texts', () => {
  it('updates a text that was empty on the server', async () => {
    const warn = spyWarn();
    const Comp = mount(renew => {
      let label = '';
      return () => (
        <div>
          <span>{label}</span>
          <button
            onClick={() => {
              label = 'ready';
              renew();
            }}
          >
            go
          </button>
        </div>
      );
    });
    const host = serverHtml(renderToString(h(Comp, {})));
    expect(host.innerHTML).toBe('<div><span></span><button>go</button></div>');

    hydrate(Comp, host);
    host.querySelector('button')!.click();
    await nextTick();

    expect(host.querySelector('span')!.textContent).toBe('ready');
    expect(warn).not.toHaveBeenCalled();
  });

  it('keeps an empty text before an element in its place', async () => {
    const warn = spyWarn();
    const Comp = mount(renew => {
      let prefix = '';
      return () => (
        <p>
          {prefix}
          <b
            onClick={() => {
              prefix = '> ';
              renew();
            }}
          >
            item
          </b>
        </p>
      );
    });
    const host = serverHtml(renderToString(h(Comp, {})));
    const bold = host.querySelector('b');

    hydrate(Comp, host);
    host.querySelector('b')!.click();
    await nextTick();

    expect(host.innerHTML).toBe('<p>&gt; <b>item</b></p>');
    expect(host.querySelector('b')).toBe(bold);
    expect(warn).not.toHaveBeenCalled();
  });

  it('splits one server text across texts with an empty node between them', async () => {
    const Comp = mount(renew => {
      let name = 'a';
      return () => (
        <p
          onClick={() => {
            name = 'b';
            renew();
          }}
        >
          {'x'}
          {false}
          {name}
        </p>
      );
    });
    const host = serverHtml(renderToString(h(Comp, {})));
    expect(host.innerHTML).toBe('<p>xa</p>');

    hydrate(Comp, host);
    host.querySelector('p')!.click();
    await nextTick();

    expect(host.innerHTML).toBe('<p>xb</p>');
  });
});

describe('hydration — markup missing from the server HTML', () => {
  it('creates a missing element before the next server element', async () => {
    const warn = spyWarn();
    const host = serverHtml('<div><button>count 0</button></div>');
    const button = host.querySelector('button');

    hydrate(Counter, host);

    expect(host.innerHTML).toBe(
      '<div><p>static</p><button>count 0</button></div>'
    );
    expect(host.querySelector('button')).toBe(button);
    expect(warn).toHaveBeenCalledTimes(1);
    expect(warn.mock.calls[0][0]).toContain('<p> inside <div>');

    button!.click();
    await nextTick();
    expect(host.querySelector('button')!.textContent).toBe('count 1');
  });

  it('creates a missing element at the end, with its events', async () => {
    const warn = spyWarn();
    const host = serverHtml('<div><p>static</p></div>');

    hydrate(Counter, host);
    host.querySelector('button')!.click();
    await nextTick();

    expect(host.innerHTML).toBe(
      '<div><p>static</p><button>count 1</button></div>'
    );
    expect(warn).toHaveBeenCalledTimes(1);
  });

  it('creates an element whose tag differs and leaves the server one', async () => {
    const warn = spyWarn();
    const host = serverHtml(
      '<div><section>static</section><button>count 0</button></div>'
    );

    hydrate(Counter, host);
    host.querySelector('button')!.click();
    await nextTick();

    expect(host.innerHTML).toBe(
      '<div><section>static</section><p>static</p><button>count 1</button></div>'
    );
    expect(warn).toHaveBeenCalledTimes(1);
  });

  it('creates a missing subtree with attributes, texts and nested elements', () => {
    spyWarn();
    const Comp = mount(() => () => (
      <div>
        <ul class="list">
          <li>one</li>
          <li>two</li>
        </ul>
      </div>
    ));
    const host = serverHtml('<div></div>');

    hydrate(Comp, host);

    expect(host.innerHTML).toBe(
      '<div><ul class="list"><li>one</li><li>two</li></ul></div>'
    );
  });

  it('creates a missing text and warns', () => {
    const warn = spyWarn();
    const Comp = mount(() => () => (
      <p>
        <b>a</b>
        tail
      </p>
    ));
    const host = serverHtml('<p><b>a</b></p>');

    hydrate(Comp, host);

    expect(host.innerHTML).toBe('<p><b>a</b>tail</p>');
    expect(warn.mock.calls[0][0]).toContain('text "tail"');
  });

  it('creates missing SVG children in the SVG namespace', () => {
    spyWarn();
    const Comp = mount(() => () => (
      <svg xmlns={SVG_NS} viewBox="0 0 10 10">
        <linearGradient id="g" />
        <circle cx="5" cy="5" r="4" />
      </svg>
    ));
    const host = serverHtml(
      `<svg xmlns="${SVG_NS}" viewBox="0 0 10 10"><linearGradient id="g"></linearGradient></svg>`
    );
    const gradient = host.querySelector('linearGradient');

    hydrate(Comp, host);

    const circle = host.querySelector('circle')!;
    expect(circle.namespaceURI).toBe(SVG_NS);
    expect(circle.getAttribute('r')).toBe('4');
    // A camelCase SVG tag still pairs with the server node.
    expect(host.querySelector('linearGradient')).toBe(gradient);
  });
});

describe('hydration — long lists', () => {
  it('creates a long list the server HTML lacks, in order', () => {
    const warn = spyWarn();
    const items = Array.from({ length: 1000 }, (_, i) => i);
    const List = mount(() => () => (
      <ul>
        {items.map(i => (
          <li key={i}>{i}</li>
        ))}
      </ul>
    ));
    const host = serverHtml('<ul></ul>');

    hydrate(List, host);

    const texts = [...host.querySelectorAll('li')].map(li => li.textContent);
    expect(texts).toEqual(items.map(String));
    expect(warn).toHaveBeenCalledTimes(1000);
  });

  it('pairs in order when a large part of a list differs', async () => {
    spyWarn();
    const items = Array.from({ length: 600 }, (_, i) => i);
    const List = mount(renew => {
      let picked = -1;
      return () => (
        <ul>
          {items.map(i => (
            <li
              key={i}
              onClick={() => {
                picked = i;
                renew();
              }}
            >
              {i === picked ? 'picked' : i}
            </li>
          ))}
        </ul>
      );
    });
    const host = serverHtml(
      `<ul>${items.map(i => `<p>${i}</p>`).join('')}</ul>`
    );

    hydrate(List, host);
    host.querySelectorAll('li')[599].click();
    await nextTick();

    const lis = host.querySelectorAll('li');
    expect(lis.length).toBe(600);
    expect(lis[0].textContent).toBe('0');
    expect(lis[599].textContent).toBe('picked');
    expect(host.querySelectorAll('p').length).toBe(600);
  });
});

describe('hydration — server nodes the tree has no place for', () => {
  it('leaves a script after the app and pairs the rest', async () => {
    const warn = spyWarn();
    const host = serverHtml(
      `${renderToString(h(Counter, {}))}<script>/* loader */</script>`
    );
    const button = host.querySelector('button');

    hydrate(Counter, host);
    button!.click();
    await nextTick();

    expect(host.innerHTML).toBe(
      '<div><p>static</p><button>count 1</button></div><script>/* loader */</script>'
    );
    expect(host.querySelector('button')).toBe(button);
    expect(warn).not.toHaveBeenCalled();
  });

  it('skips an element added before the app’s own', async () => {
    const warn = spyWarn();
    const host = serverHtml(
      '<div><ins>extension</ins><p>static</p><button>count 0</button></div>'
    );
    const paragraph = host.querySelector('p');

    hydrate(Counter, host);
    host.querySelector('button')!.click();
    await nextTick();

    expect(host.innerHTML).toBe(
      '<div><ins>extension</ins><p>static</p><button>count 1</button></div>'
    );
    expect(host.querySelector('p')).toBe(paragraph);
    expect(warn).not.toHaveBeenCalled();
  });

  it('pairs a whitespace text instead of adding another', () => {
    const warn = spyWarn();
    const Comp = mount(() => () => (
      <p>
        <b>a</b> <i>b</i>
      </p>
    ));
    const host = serverHtml(renderToString(h(Comp, {})));

    hydrate(Comp, host);

    expect(host.innerHTML).toBe('<p><b>a</b> <i>b</i></p>');
    expect(host.querySelector('p')!.childNodes.length).toBe(3);
    expect(warn).not.toHaveBeenCalled();
  });
});
