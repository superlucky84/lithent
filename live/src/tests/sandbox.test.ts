import { afterEach, describe, expect, it, vi } from 'vitest';
import { mountLive } from '@/index';
import { buildSrcdoc, sandboxCsp } from '@/srcdoc';
import { begin, SILENT_RUNTIME } from '@/tests/harness';
import type { LiveError } from '@/index';

/**
 * Phase 4 — the sandbox document and its start (RQ-7, DC-7, DC-13):
 * iframe sandbox flags, CSP, escaping, missing runtime, start errors and
 * timeouts. The isolation itself is the browser's; Phase 7/8 check it in a
 * real browser.
 */

afterEach(() => {
  document.body.innerHTML = '';
  vi.restoreAllMocks();
});

const config = {
  ch: 'abc',
  code: 'return 1',
  props: {},
  origin: 'https://host.test',
};

describe('the sandbox iframe (DC-7)', () => {
  it('allows scripts only: no allow-same-origin', () => {
    const { sandbox } = begin();
    const frame = sandbox!.frame;
    expect(frame.getAttribute('sandbox')).toBe('allow-scripts');
    // jsdom has no iframe.sandbox token list; read the attribute.
    expect(frame.getAttribute('sandbox')!.split(/\s+/)).not.toContain(
      'allow-same-origin'
    );
    expect(frame.getAttribute('title')).toBe('lithent live widget');
  });

  it('blocks the network by default with a CSP meta tag', () => {
    const html = buildSrcdoc({ config, runtimeCode: SILENT_RUNTIME });
    expect(html).toContain(
      `<meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src 'unsafe-inline' 'unsafe-eval'; style-src 'unsafe-inline'">`
    );
    expect(html).toContain(`<script>${SILENT_RUNTIME}</script>`);
    expect(html).toContain('<div id="root"></div>');
  });

  it('allows the runtime origin when the runtime is loaded by URL', () => {
    const html = buildSrcdoc({
      config,
      runtimeUrl: 'https://cdn.test/lithent/live/dist/sandboxRuntime.umd.js',
    });
    expect(html).toContain(
      `script-src 'unsafe-inline' 'unsafe-eval' https://cdn.test;`
    );
    expect(html).toContain(
      '<script src="https://cdn.test/lithent/live/dist/sandboxRuntime.umd.js"></script>'
    );
    expect(sandboxCsp('/runtime.js')).toContain(location.origin);
  });

  it('drops the CSP with allowNetwork: true', () => {
    const html = buildSrcdoc({
      config,
      runtimeCode: SILENT_RUNTIME,
      allowNetwork: true,
    });
    expect(html).not.toContain('Content-Security-Policy');
  });

  it('adds the styles', () => {
    const html = buildSrcdoc({
      config,
      runtimeCode: SILENT_RUNTIME,
      styles: ['p { color: red }'],
    });
    expect(html).toContain('<style>html,body{margin:0}</style>');
    expect(html).toContain('<style>p { color: red }</style>');
  });
});

describe('theme and size (DC-8)', () => {
  it('adds theme tokens as CSS custom properties, dropping unsafe ones', () => {
    const html = buildSrcdoc({
      config,
      runtimeCode: SILENT_RUNTIME,
      theme: {
        '--brand': '#0064ff',
        '--gap': '8px',
        color: 'red',
        '--x': 'a;b',
        '--y': '</style><script>',
      },
    });
    expect(html).toContain('<style>:root{--brand:#0064ff;--gap:8px}</style>');
    expect(html).not.toContain('color:red');
    expect(html).not.toContain('--x');
    expect(html).not.toContain('--y');
  });

  it('asks the sandbox for its height unless autoResize is false', () => {
    const configOf = (frame: HTMLIFrameElement) =>
      JSON.parse(/c=(\{.*?\});r\?/.exec(frame.srcdoc)![1]);
    expect(configOf(begin().sandbox!.frame).resize).toBe(true);
    expect(configOf(begin({ autoResize: false }).sandbox!.frame).resize).toBe(
      false
    );
  });
});

describe('escaping the document', () => {
  it('keeps generated code from closing its script', () => {
    const code = 'return "</script><script>alert(1)</script><!--"';
    const html = buildSrcdoc({
      config: { ...config, code },
      runtimeCode: SILENT_RUNTIME,
    });
    // The code travels as JSON with every "<" escaped.
    expect(html).not.toContain('<script>alert(1)');
    expect(html).toContain('\\u003c/script>\\u003cscript>alert(1)');
    expect(html.match(/<\/script>/g)).toHaveLength(2);
  });

  it('keeps the runtime code and styles from closing their elements', () => {
    const html = buildSrcdoc({
      config,
      runtimeCode: 'var s = "</script><!--";',
      styles: ['p::after { content: "</style>" }'],
    });
    expect(html).toContain('var s = "<\\/script><\\!--";');
    expect(html).toContain('content: "<\\/style>"');
    expect(html.match(/<\/script>/g)).toHaveLength(2);
    expect(html.match(/<\/style>/g)).toHaveLength(2);
  });
});

describe('starting (DC-13, §3.4)', () => {
  it('needs runtimeCode or runtimeUrl and makes no iframe without them', async () => {
    const container = document.body.appendChild(document.createElement('div'));
    const errors: LiveError[] = [];
    await expect(
      mountLive({ code: 'return 1', container, onError: e => errors.push(e) })
    ).rejects.toMatchObject({
      phase: 'compile',
      message: expect.stringContaining('runtimeCode'),
    });
    expect(container.querySelector('iframe')).toBeNull();
    expect(errors).toHaveLength(1);
  });

  it('rejects an unknown mode', async () => {
    const container = document.body.appendChild(document.createElement('div'));
    await expect(
      mountLive({
        code: 'return 1',
        container,
        mode: 'remote' as 'sandbox',
        runtimeCode: SILENT_RUNTIME,
      })
    ).rejects.toMatchObject({
      phase: 'compile',
      message: expect.stringContaining('"remote"'),
    });
    expect(container.children).toHaveLength(0);
  });

  it('rejects with the error the sandbox reports and removes it', async () => {
    const { pending, sandbox, container, errors } = begin();
    const error = { phase: 'compile', message: 'Unexpected token' };
    sandbox!.reply({ type: 'error', error });
    await expect(pending).rejects.toEqual(error);
    expect(errors).toEqual([error]);
    expect(container.querySelector('iframe')).toBeNull();
  });

  it('times out when the sandbox never answers', async () => {
    const { pending, container, errors } = begin({ timeoutMs: 30 });
    await expect(pending).rejects.toMatchObject({ phase: 'timeout' });
    expect(errors.map(e => e.phase)).toEqual(['timeout']);
    expect(container.querySelector('iframe')).toBeNull();
  });

  it('hands the sandbox the channel, code, props and host origin', () => {
    const { sandbox } = begin({
      code: 'return lmount(() => () => null)',
      props: { label: 'a' },
    });
    const json = /c=(\{.*?\});r\?/.exec(sandbox!.frame.srcdoc)![1];
    expect(JSON.parse(json)).toEqual({
      ch: sandbox!.ch,
      code: 'return lmount(() => () => null)',
      props: { label: 'a' },
      origin: location.origin,
      resize: true,
    });
    expect(sandbox!.ch).toMatch(/^[a-z0-9]{8,}$/);
  });

  it('gives every sandbox its own channel', () => {
    const one = begin().sandbox!.ch;
    const two = begin().sandbox!.ch;
    expect(one).not.toBe(two);
  });
});
