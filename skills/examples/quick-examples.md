---
title: Quick Examples
category: examples
version: {{VERSION}}
---

# Quick Examples

## Manual Counter (mount + state)

```tsx
import { mount } from 'lithent';
import { state } from 'lithent/helper';

const Counter = mount((renew) => {
  const count = state(0, renew);
  return () => <button onClick={() => count.value++}>{count.value}</button>;
});
```

## Light Counter (lmount + lstate)

```tsx
import { lmount } from 'lithent';
import { lstate } from 'lithent/helper';

const Counter = lmount(() => {
  const count = lstate(0);
  return () => <button onClick={() => count.value++}>{count.value}</button>;
});
```

## Computed + Effect

```tsx
import { lmount } from 'lithent';
import { lstate, computed, effect } from 'lithent/helper';

const Profile = lmount(() => {
  const first = lstate('Ada');
  const last = lstate('Lovelace');
  const full = computed(() => `${first.value} ${last.value}`);

  effect(() => {
    console.log('Name changed:', full.value);
  });

  return () => <p>{full.value}</p>;
});
```

## Lifecycle Hooks (mount / update)

```tsx
import { mount, mountCallback, updateCallback, mountReadyCallback } from 'lithent';
import { state } from 'lithent/helper';

const Widget = mount((renew) => {
  const count = state(0, renew);

  // Runs after DOM mount
  mountCallback(() => {
    console.log('mounted');
    return () => console.log('unmounted');
  });

  // Runs right after virtual DOM creation (before DOM mount)
  mountReadyCallback(() => {
    console.log('mountReady');
  });

  // Runs before every update; returned function runs after DOM update
  updateCallback(() => {
    console.log('before update');
    return () => console.log('after update');
  });

  return () => (
    <button onClick={() => count.value++}>
      Count: {count.value}
    </button>
  );
});
```

## Ref

```tsx
import { mount, ref } from 'lithent';

const FocusInput = mount((renew) => {
  const inputRef = ref<HTMLInputElement>(null);
  return () => (
    <div>
      <input ref={inputRef} />
      <button onClick={() => inputRef.value?.focus()}>Focus</button>
    </div>
  );
});
```

## Portal

```tsx
import { mount, portal } from 'lithent';

const Modal = mount((renew, props: { onClose: () => void }) => {
  return () => portal(
    <div class="modal" onClick={props.onClose}>Close</div>,
    document.body
  );
});
```

## Context (mount + lmount)

```tsx
import { mount, lmount } from 'lithent';
import { createContext, createLContext } from 'lithent/helper';

const ThemeContext = createContext<{ theme: string }>();
const LThemeContext = createLContext<{ theme: string }>();

const ThemeProvider = mount((renew, _props, children) => {
  return () => (
    <ThemeContext.Provider value={{ theme: 'dark' }}>
      {children}
    </ThemeContext.Provider>
  );
});

const LThemeProvider = lmount((_props, children) => {
  return () => (
    <LThemeContext.Provider value={{ theme: 'dark' }}>
      {children}
    </LThemeContext.Provider>
  );
});

const Consumer = lmount(() => {
  const { theme } = LThemeContext.useContext();
  return () => <p>{theme}</p>;
});
```

## Store (store + lstore)

```tsx
import { mount, lmount } from 'lithent';
import { store, lstore } from 'lithent/helper';

const userStore = store({ name: '', loggedIn: false });
const userLStore = lstore({ name: '', loggedIn: false });

const User = mount((renew) => {
  const user = userStore(renew);
  return () => <p>{user.name}</p>;
});

const UserLite = lmount(() => {
  const user = userLStore();
  return () => <p>{user.name}</p>;
});
```

## Performance (cacheUpdate + nextTickRender)

```ts
import { cacheUpdate, nextTickRender } from 'lithent/helper';

cacheUpdate(() => {
  a.value = 1;
  b.value = 2;
});

nextTickRender(() => {
  items.value = [...items.value, ...more];
});
```

## Children Helpers

```tsx
import { mount } from 'lithent';
import { unwrapChildren } from 'lithent/helper';

const Card = mount((renew, props: { title: string }, children) => {
  return () => (
    <div class="card">
      <h3>{props.title}</h3>
      {unwrapChildren(children)}
    </div>
  );
});
```
