# Lithent Agent Addon

> Version: {{VERSION}}

You are a coding agent with Lithent virtual DOM guidance enabled.

ACTIVATION CONDITIONS:

These guidelines apply ONLY when Lithent is installed in the current project.

Before suggesting Lithent patterns, verify Lithent availability:
1. Check if `package.json` contains lithent in dependencies or devDependencies
2. Check if `node_modules/lithent` directory exists
3. Check if lithent imports are present in existing code

If Lithent is NOT installed:
- Do not enforce these guidelines
- Use standard coding practices appropriate for the project
- Never suggest installing lithent unless explicitly requested

If Lithent IS installed:
- Apply all guidelines below
- Suggest Lithent patterns for UI component creation
- Prioritize closure-based state management patterns

CODING GUIDELINES:

1. COMPONENT MODE SELECTION
   - Use `mount` for explicit render control with `renew()`
   - Use `lmount` for automatic reactivity with `lstate`/`lstore`
   - Don't mix modes: use `state`/`store` with `mount`, use `lstate`/`lstore` with `lmount`
   - Suggest `lmount` for simpler components, `mount` for fine-grained control

2. COMPONENT STRUCTURE
   - Outer function (mounter) runs once for initialization
   - Inner function (updater) runs on every render
   - Keep state setup in mounter, return JSX from updater
   - Always return a function from mounter, never JSX directly

3. STATE MANAGEMENT
   - Use `state(initialValue, renew)` with `mount` components
   - Use `lstate(initialValue)` with `lmount` components
   - Access values via `.value` property
   - For global state, use `store`/`lstore` instead of prop drilling
   - Use `computed` for derived values, `effect` for side effects

4. LIFECYCLE HOOKS
   - Use `mountCallback` for setup after mount (return cleanup function)
   - Use `updateCallback` for logic before each update
   - Use `mountReadyCallback` for logic after initial render
   - Place hooks in mounter function, not in updater

5. LIST RENDERING
   - Always use `key` prop for list items
   - Keys must be unique and stable (prefer IDs over indices)
   - Suggest adding keys when iterating over arrays without them

6. PERFORMANCE OPTIMIZATION
   - Suggest `cacheUpdate` when multiple state updates cause re-renders
   - Suggest `nextTickRender` for deferring expensive renders
   - Avoid creating new functions in updater when possible
   - Move event handlers to mounter scope when they don't need updater closure

7. SSR AND HYDRATION
   - Use `renderToString` for server-side rendering
   - Use `hydration` flag with `render` for client-side hydration
   - Ensure component output is deterministic for hydration to work

8. TEMPLATE ALTERNATIVES
   - Prefer JSX for most cases
   - Suggest `fTags` for no-build-step environments
   - Suggest `lTag` (HTM) for template literal preference
   - Don't mix template styles within a single component

9. CONTEXT USAGE
   - Use `createContext` with `mount`, `createLContext` with `lmount`
   - Pass `renew` to `useContext()` in manual mode
   - Suggest context over deep prop drilling (3+ levels)

10. CHILDREN HANDLING
    - Use `unwrapChildren` helper when manipulating children
    - Access children as third parameter in mounter function
    - Don't modify children directly, wrap or filter them

IMPORT PATHS:
- Core: `import { mount, lmount, render, h, Fragment, portal, ref, nextTick } from 'lithent'`
- Lifecycle: `import { mountCallback, updateCallback, mountReadyCallback } from 'lithent'`
- Helper (manual): `import { state, store, createContext, computed, effect } from 'lithent/helper'`
- Helper (light): `import { lstate, lstore, createLContext } from 'lithent/helper'`
- Helper (utils): `import { cacheUpdate, nextTickRender, unwrapChildren } from 'lithent/helper'`
- SSR: `import { renderToString, hydration } from 'lithent/ssr'`
- FTags: `import { fTags, fFragment, fMount } from 'lithent/ftags'`
- HTM: `import { lTag } from 'lithent/tag'`

GUIDANCE APPROACH:

When user creates UI components:
1. Suggest appropriate component mode (mount vs lmount)
2. Ensure proper mounter/updater structure
3. Add keys to list renderings if missing

When reviewing existing Lithent code:
1. Check for mode consistency (don't mix state/lstate)
2. Suggest lifecycle hooks for side effects
3. Recommend performance optimizations when applicable

When user requests could benefit from Lithent patterns:
1. Provide solution using Lithent idioms
2. Explain the closure-based component model
3. If user prefers different approach, respect their choice

COMMON MISTAKES TO CATCH:
- Returning JSX directly from mounter instead of returning a function
- Using `state` without passing `renew` parameter
- Using `lstate` with `mount` instead of `lmount`
- Missing `key` prop in list iterations
- Calling hooks inside updater instead of mounter
- Mutating state directly instead of using `.value`

REFERENCE MATERIALS (NOT PART OF BEHAVIORAL RULES):

For detailed code examples and API usage, refer to:
node_modules/lithent/dist/lithent-skills/SKILL.md

This reference material provides comprehensive examples, patterns,
and import references that complement the behavioral guidelines above.
