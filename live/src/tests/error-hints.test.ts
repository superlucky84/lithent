import { afterEach, describe, expect, it, vi } from 'vitest';
import { hintFor } from '@/hints';
import { symbolNames } from '@/names';
import { mountLive } from '@/index';
import { begin } from '@/tests/harness';
import type { LiveError } from '@/index';

/**
 * Phase 5 — self-repair hints (RQ-8, §3.4): the LiveError an LLM gets back
 * names the fix for the mistakes generated code makes most. Engines word
 * errors differently, so the unit cases use several wordings.
 */

afterEach(() => {
  document.body.innerHTML = '';
  vi.restoreAllMocks();
});

const compile = (message: string): LiveError => ({ phase: 'compile', message });

describe('hintFor (§3.4)', () => {
  it.each([
    ["Unexpected token '<'"], // V8, JavaScriptCore
    ["expected expression, got '<'"], // SpiderMonkey
  ])('JSX: %s', message => {
    expect(hintFor(compile(message), 'return () => <p>hi</p>')).toMatch(
      /JSX is not available.*fTags/
    );
  });

  it('import statements', () => {
    const code =
      "import { lmount } from 'lithent';\nreturn lmount(() => () => null);";
    expect(
      hintFor(compile('Cannot use import statement outside a module'), code)
    ).toMatch(/Remove the import statements/);
  });

  it('export statements', () => {
    const code = 'export default lmount(() => () => null);';
    expect(hintFor(compile("Unexpected token 'export'"), code)).toMatch(
      /Do not export.*return/
    );
  });

  it('a body that returns no component', () => {
    expect(
      hintFor(
        compile('The code must return a component, e.g. ...'),
        'const W = lmount(() => () => null);'
      )
    ).toMatch(/must return the component/);
  });

  it.each([
    ['useState is not defined'], // V8, SpiderMonkey
    ["Can't find variable: useEffect"], // JavaScriptCore
    ['React is not defined'],
  ])('React habits: %s', message => {
    expect(hintFor({ phase: 'mount', message }, '')).toMatch(
      /not React.*lstate/
    );
  });

  it('rendering by hand', () => {
    expect(
      hintFor({ phase: 'mount', message: 'render is not defined' }, '')
    ).toMatch(/Do not render the widget yourself/);
  });

  it('an unknown name lists what is in scope', () => {
    const hint = hintFor(
      { phase: 'render', message: 'useStore is not defined' },
      ''
    );
    expect(hint).toContain('"useStore" is not available');
    for (const name of symbolNames) expect(hint).toContain(name);
  });

  it('a timeout', () => {
    expect(hintFor({ phase: 'timeout', message: 'no answer' }, '')).toMatch(
      /endless loop/
    );
  });

  it('nothing specific: no hint', () => {
    expect(
      hintFor({ phase: 'mount', message: 'boom' }, 'return 1')
    ).toBeUndefined();
    expect(
      hintFor(compile('Unexpected end of input'), 'return (')
    ).toBeUndefined();
  });
});

describe('hints on real failures (direct mode runs the code here)', () => {
  const fails = async (code: string) => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    const container = document.body.appendChild(document.createElement('div'));
    const reported: LiveError[] = [];
    const error = await mountLive({
      code,
      container,
      mode: 'direct',
      onError: e => reported.push(e),
    }).then(
      () => undefined,
      (e: LiveError) => e
    );
    expect(reported).toEqual([error]);
    return error!;
  };

  it.each([
    ['JSX', 'return lmount(() => () => <p>hi</p>);', 'compile', /JSX/],
    [
      'an import',
      "import { lmount } from 'lithent';\nreturn lmount(() => () => null);",
      'compile',
      /import/,
    ],
    [
      'an export',
      'export default lmount(() => () => null);',
      'compile',
      /export/,
    ],
    [
      'no return',
      'const W = lmount(() => () => fTags.p({}, "x"));',
      'compile',
      /return the component/,
    ],
    [
      'React state',
      'return lmount(() => { const [n] = useState(0); return () => fTags.p({}, n); });',
      'mount',
      /not React/,
    ],
  ])('%s', async (_label, code, phase, hint) => {
    const error = await fails(code);
    expect(error.phase).toBe(phase);
    expect(error.hint).toMatch(hint);
  });
});

describe('hints on sandbox errors', () => {
  it('the host adds the hint to an error reported by the sandbox', async () => {
    const code = 'return lmount(() => () => <p>hi</p>);';
    const { pending, sandbox, errors } = begin({ code });
    sandbox!.reply({ type: 'error', error: compile("Unexpected token '<'") });
    await expect(pending).rejects.toMatchObject({
      phase: 'compile',
      hint: expect.stringMatching(/JSX/),
    });
    expect(errors[0].hint).toMatch(/JSX/);
  });

  it('keeps a hint the error already has', async () => {
    const { pending, sandbox } = begin();
    sandbox!.reply({
      type: 'error',
      error: { phase: 'compile', message: "Unexpected token '<'", hint: 'own' },
    });
    await expect(pending).rejects.toMatchObject({ hint: 'own' });
  });
});
