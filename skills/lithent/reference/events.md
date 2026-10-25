# DOM events

Both `lithent` and `lithent-concurrent` register event props such as `onClick`
on the element with `addEventListener`. The callback receives the browser's
original `Event`. A function's `this` is the element; an object's `handleEvent`
uses the object as its receiver. Frozen functions and handler objects work.

## Updating an event prop

The normal path keeps one internal listener for each element and event type.
Renewing an inline callback changes the callback stored on the element without
removing and adding the native listener. Dispatch reads the latest callback
when that listener runs, including updates queued by an earlier native listener
during a trusted browser event. Callbacks and Event objects are not stamped or
mutated, and the same Event object can be dispatched again.

The internal listener keeps its registration position when the callback changes.
Consequently, registering an external native listener with the same callback
does not deduplicate against an event prop. Removing the original callback with
`removeEventListener` does not remove the managed prop listener. Update/remove
the prop to change that listener, or use direct native registration below.

Event names retain their existing lowercase normalization. Distinct aliases such
as `onClick` and `onclick` enter a native listener path for that event type.
Existing callback registration is preserved when the second alias is added;
new native registrations follow the browser's dispatch timing. Alias removal,
replacement, deduplication and `stopImmediatePropagation` between prop aliases
preserve their native callback identity behavior. The retained proxy still has
the external identity differences described above. Use a single spelling for
ordinary event props.

An existing ancestor listener reads its latest callback when propagation reaches
it. A newly registered listener follows the browser's native propagation rules;
Lithent does not add an event-clock filter.

## Native identity, ordering and listener options

Use the existing `ref` and `mountCallback` APIs when integrating a library that
requires exact callback identity, registration order, capture, passive or once
options. Own that listener's setup and cleanup in the component:

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
