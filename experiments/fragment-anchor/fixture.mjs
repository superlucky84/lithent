import {
  Fragment,
  h,
  mount,
  mountCallback,
  nextTick,
  render,
} from './core.mjs';

export function setup(kind, size) {
  const host = document.querySelector('#host');
  let tick = 0;
  let renew = () => {};
  let shown = false;
  let rows = Array.from({ length: size }, (_, id) => id);
  let mounts = 0;
  let unmounts = 0;
  const Leaf = mount(() => {
    mountCallback(() => {
      mounts++;
      return () => unmounts++;
    });
    return () => h('b', {}, 'visible');
  });
  const Child = mount(bump => {
    if (kind === 'reveal') renew = bump;
    return () =>
      shown
        ? h(Fragment, {}, h(Fragment, {}, null, h(Leaf, {})), 'tail')
        : null;
  });
  const Row = mount((_bump, props) => {
    mountCallback(() => {
      mounts++;
      return () => unmounts++;
    });
    return () =>
      h(
        Fragment,
        {},
        h('input', { 'data-id': props.id, value: props.id }),
        h('b', {}, props.id)
      );
  });
  const App = mount(bump => {
    if (kind !== 'reveal') renew = bump;
    return () =>
      kind === 'reveal'
        ? h(
            Fragment,
            {},
            h(Child, {}),
            ...Array.from({ length: size }, (_, id) => h('span', {}, id)),
            h('input', { id: 'focus', value: 'kept' })
          )
        : kind === 'reorder'
          ? h(
              'section',
              {},
              rows.map(id => h(Row, { id, key: id })),
              h('footer', {}, 'end')
            )
          : h(
              'section',
              {},
              ...Array.from({ length: size }, (_, id) =>
                h('span', {}, id === 0 ? tick : id)
              ),
              h('footer', {}, 'end')
            );
  });
  const dispose = render(h(App, {}), host);
  let identities = new Map(
    [...host.querySelectorAll('input')].map(input => [
      input.dataset.id || 'focus',
      input,
    ])
  );
  if (kind === 'reveal') host.querySelector('#focus').focus();
  const validate = () => {
    if (kind === 'reveal') {
      if (
        host.querySelectorAll('span').length !== size ||
        !!host.querySelector('b') !== shown ||
        document.activeElement !== identities.get('focus')
      )
        throw Error('reveal DOM/focus');
    } else if (kind === 'reorder') {
      const inputs = [...host.querySelectorAll('input')];
      if (inputs.map(input => Number(input.dataset.id)).join() !== rows.join())
        throw Error('row order');
      for (const input of inputs) {
        const id = input.dataset.id;
        if (identities.has(id) && identities.get(id) !== input)
          throw Error('row identity');
      }
      identities = new Map(inputs.map(input => [input.dataset.id, input]));
      if (mounts - unmounts !== size) throw Error('row lifecycle');
    } else if (host.querySelector('span').textContent !== String(tick))
      throw Error('control text');
    if (
      kind !== 'reveal' &&
      host.querySelector('section').lastElementChild.tagName !== 'FOOTER'
    )
      throw Error('footer boundary');
    return { tick, mounts, unmounts, children: host.childNodes.length };
  };
  return {
    validate,
    async step(frames = true, check = false) {
      const start = performance.now();
      tick++;
      if (kind === 'reveal') shown = !shown;
      if (kind === 'reorder') {
        const offset = (tick * 17) % size;
        const group = tick % 4 === 0 ? size : 0;
        rows = Array.from(
          { length: size },
          (_, i) => group + ((i + offset) % size)
        );
        if (tick % 2) rows.reverse();
      }
      renew();
      await nextTick();
      const updateMs = performance.now() - start;
      if (check) validate();
      if (frames)
        await new Promise(resolve =>
          requestAnimationFrame(() => requestAnimationFrame(resolve))
        );
      return { updateMs, twoRafMs: performance.now() - start };
    },
    dispose() {
      dispose();
      identities.clear();
      if (host.childNodes.length) throw Error('dispose DOM');
      if (mounts !== unmounts) throw Error('dispose lifecycle');
    },
  };
}
