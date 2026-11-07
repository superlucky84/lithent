# DOM events

Both `lithent` and `lithent-concurrent` register event props such as `onClick`
on the element with `addEventListener`. The callback receives the browser's
original `Event`. A function's `this` is the element; an object's `handleEvent`
uses the object as its receiver. Frozen functions and handler objects work.

## Updating an event prop

Lithent registers the original callback directly. When its identity changes,
Lithent removes the old callback and registers the new one. Keep handlers in the
mounter scope when they do not need a fresh updater closure to avoid this work.
Callbacks and Event objects are not stamped or mutated; the same Event object
can be dispatched again.

External `addEventListener` calls with the same callback and capture flag share
native deduplication with event props. `removeEventListener` with the original
callback removes that registration. Lithent does not track external mutations:
an unchanged prop does not automatically restore a listener removed externally.
A newly registered replacement goes behind existing listeners of the same event
type and phase. If that callback is already registered, native deduplication
preserves its existing position.

Event names use lowercase normalization. Aliases such as `onClick` and `onclick`
follow native callback identity, deduplication and removal rules. There is no
per-prop owner reference count; prefer one spelling for ordinary event props.

Changes during dispatch follow browser rules. Replacing a target callback from
an earlier native listener can remove the old callback before it runs, while
the new callback waits for the next dispatch. An ancestor callback replaced
before propagation reaches that ancestor can run during the current event.
Lithent does not add an event-clock filter.

## Native identity, ordering and listener options

Use the existing `ref` and `mountCallback` APIs when integrating a library that
requires capture, passive or once options, or needs to own listener setup
and registration order independently of prop updates. Own that listener's setup and cleanup in the component:

```tsx
import { mount, mountCallback, ref } from 'lithent';

const NativeButton = mount(() => {
  const button = ref<HTMLButtonElement | null>(null);

  mountCallback(() => {
    const element = button.value!;
    const handleClick = (event: MouseEvent) => {
      console.log(event.currentTarget);
    };
    element.addEventListener('click', handleClick, { capture: true });
    return () => element.removeEventListener('click', handleClick, true);
  });

  return () => <button ref={button}>Native listener</button>;
});
```

For the concurrent core, import the same APIs from `lithent-concurrent` (or use
the documented exact core alias). No global event mode or additional public API
is needed.

## Disposal and retained DOM

Root disposal removes the rendered nodes. As with native listeners on detached
DOM, ordinary element callbacks remain callable if application code retains
those nodes. Portal teardown removes its target callbacks while preserving
other owners' distinct callbacks. Identical callbacks share native deduplication
behavior rather than a per-owner reference count. A direct native registration's
`mountCallback` cleanup runs on component disposal.

Application-owned stores, cached views and saved renew callbacks must be
released by their owner when they are no longer needed. Root disposal does not
clear external application state.
