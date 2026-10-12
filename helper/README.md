# Lifecycle helpers

Import lifecycle utilities from the existing `lithent/helper` entry. Ownership,
latest tasks, activities, and retained views work with both rendering cores.
Freezing native child updates requires the Concurrent core with lifecycle support.

```ts
import { h, mount } from 'lithent';
import { createLatestTask, useOwnerScope } from 'lithent/helper';

const Search = mount(renew => {
  const owner = useOwnerScope();
  const search = createLatestTask(owner);
  let result = '';

  const submit = (query: string) =>
    search.run(
      async signal => {
        const response = await fetch(`/search?q=${encodeURIComponent(query)}`, {
          signal,
        });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return response.text();
      },
      {
        success: text => {
          result = text;
          renew();
        },
      }
    );

  return () =>
    h(
      'button',
      {
        onClick: () => {
          void submit('Lithent');
        },
      },
      result || 'Search'
    );
});
```

Call `useOwnerScope` once in a mounter. Start external work in a committed
`mountCallback` or an event. Unmounting disposes the owner and aborts its tasks.
A late response cannot reach task observers even if the work ignores abort.
Exceptions from observers reject `run()`; handle that rejection when observers can throw.

| API                                                             | Contract                                                                    |
| --------------------------------------------------------------- | --------------------------------------------------------------------------- |
| `createOwnerScope()`                                            | Register resources with `own`; release or dispose each registration once.   |
| `useOwnerScope(reportCleanupError?)`                            | Connect an owner to committed component unmount.                            |
| `createLatestTask(scope)`                                       | One latest-only group with generic `run` and `cancel`.                      |
| `createActivityScope()`                                         | Initially inactive; `activate`, `deactivate`, `onActive`, `own`, `dispose`. |
| `createScopedTask(scope, lifetime?)`                            | Defaults to `activity`; `instance` work survives hiding.                    |
| `createRetainedView(host, initialize, options?)`                | Initially hidden independent root with `scope`, `show`, `hide`, `dispose`.  |
| `createRetainedHost(initialize, reportCleanupError?, options?)` | Component with optional boolean `active` prop; removal disposes its root.   |
| `useRenderBoundary(initialActive?)`                             | Concurrent mounter boundary; initially active by default.                   |
| `supportsRenderBoundary()`                                      | Check the currently resolved core's lifecycle capability.                   |

Named types include `OwnerScope`, `Activity`, `ActivityScope`, `LatestTask`,
`TaskWork<T>`, `TaskHandlers<T>`, `TaskOutcome<T>`, `TaskLifetime`, `Cleanup`,
`CleanupErrorReporter`, `RetainedView`, `RetainedViewInitializer`,
`RetainedViewOptions`, `RetainedHostProps`, and `RenderBoundary`.

## Retain a view

```ts
import { h } from 'lithent';
import { createRetainedView, createScopedTask } from 'lithent/helper';

const view = createRetainedView(
  document.querySelector<HTMLElement>('#editor')!,
  (renew, scope) => {
    let saved = '';
    const save = createScopedTask(scope, 'instance');
    scope.onActive(() => {
      const timer = setInterval(() => {
        renew();
      }, 10_000);
      return () => clearInterval(timer);
    });
    return () =>
      h(
        'button',
        {
          onClick: () => {
            void save.run(() => Promise.resolve('saved'), {
              success: value => {
                saved = value;
                renew();
              },
            });
          },
        },
        saved || 'Save'
      );
  }
);

view.show();
// Hide temporarily: view.hide();
// Remove permanently: view.dispose();
```

Each activation has a fresh activity and signal. Activity tasks requested while
inactive return `stale` without starting work. Instance work continues while hidden.
The managed renew queues hidden model changes until the next show. Hiding preserves
the closure and DOM; it does not release memory.

## Concurrent child freezing

Use an exact core alias in the bundler so subpaths keep resolving to Lithent:

```ts
resolve: {
  alias: [{ find: /^lithent$/, replacement: 'lithent-concurrent' }],
}
```

All components and helpers must resolve to the same core instance. Pass
`{ freezeChildren: true }` as the final view/host options argument to also stop
native child renews and parent diffs while hidden. The default is false.
An unsupported core throws before initialization or DOM insertion. Older
Concurrent releases may lack this capability; check `supportsRenderBoundary()`.

`useRenderBoundary().pause()` only controls updates; it neither hides DOM nor
cancels work. Call pause outside render. Initial construction is allowed even for
an inactive boundary. Already observable related parked work finishes before pause,
so pause has no one-frame latency guarantee.

Cleanup is synchronous. All registered cleanups are attempted before an
`AggregateError` is reported. A custom component cleanup reporter must not throw.
`cancel()` does not emit `pending(false)`. Abort does not undo direct state writes
inside work or server-side saves. Handle save ordering and retries in the application.

Importing or creating scopes starts no requests or timers. Retained hosts render
only their shell in SSR; direct retained view creation needs a browser DOM.
Focus restoration, accessibility, portal visibility, and media/iframe suspension
require application-specific handling. ESM consumers can tree-shake unused APIs;
the full UMD helper includes all exports.
