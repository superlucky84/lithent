import { symbolNames } from '@/names';
import type { LiveError } from '@/types';

/**
 * RQ-8 self-repair (docs/agent-ui/DESIGN.md §3.4): a one-line fix an LLM can
 * apply, for the mistakes generated widget code makes most. Engines word
 * errors differently, so rules match the message loosely and look at the
 * code too. Returns undefined when nothing specific applies.
 */

const REACT =
  /^(React|ReactDOM|use(State|Effect|Ref|Memo|Callback|Reducer|Context|LayoutEffect))$/;

export const hintFor = (error: LiveError, code: string): string | undefined => {
  const message = error.message;
  const missing = /(\w+) is not defined|Can't find variable: (\w+)/.exec(
    message
  );

  if (missing) {
    const name = missing[1] || missing[2];
    if (REACT.test(name)) {
      return 'This is not React: keep state with lstate (in lmount) or state (in mount), and run effects with mountCallback / updateCallback.';
    }
    if (name == 'render' || name == 'createRoot') {
      return 'Do not render the widget yourself: return the component and the runtime mounts it.';
    }
    return `"${name}" is not available. In scope: ${symbolNames.join(', ')}.`;
  }

  // The mounter returned the markup instead of a render function: the
  // core then calls it ("… is not a function"). Correct code always has a
  // `() =>` render function after `=>` or `return`.
  if (
    error.phase == 'mount' &&
    /is not a function/.test(message) &&
    !/(=>|return)\s*\(\s*\)\s*=>/.test(code)
  ) {
    return 'The mounter must return a render function, not the markup: `lmount(props => () => fTags.p({}, props.label))`.';
  }

  if (error.phase != 'compile') {
    return error.phase == 'timeout'
      ? 'The widget did not answer: look for an endless loop or a promise that never settles in the mounter, the render or an action.' +
          // A start that never answers may be the host page's CSP, which the
          // sandbox document inherits (DESIGN §3.3).
          (/did not start/.test(message)
            ? " If the page has a Content-Security-Policy, it must allow inline scripts and 'unsafe-eval' for the sandbox."
            : '')
      : undefined;
  }

  if (/'<'|got '<'/.test(message)) {
    return 'JSX is not available in build-less widget code: use fTags, e.g. fTags.div({ class: "box" }, "text"), or lTag`<div>...</div>`.';
  }
  if (/^\s*import\s/m.test(code)) {
    return 'Remove the import statements: lithent, the helper states, fTags, lTag, agentAction and agentState are already in scope.';
  }
  if (/^\s*export\s/m.test(code)) {
    return 'Do not export: the code is a function body. End it with `return Widget;` or start it with `return lmount(...)`.';
  }
  if (/must return a component/.test(message)) {
    return 'The code is a function body that must return the component, e.g. `return lmount(props => () => fTags.p({}, props.label))`.';
  }
  return undefined;
};
