import { h, mount, mountCallback, render, nextTick } from '@/index';

export const cases = {
  async prototypeNameComponentProp() {
    let next = { label: 'a', toString: 'owned' };
    let renew = () => {};
    let held;
    const Child = mount((_renew, props) => {
      held = props;
      return () => h('p', {}, props.label);
    });
    const Parent = mount(bump => {
      renew = bump;
      return () => h('div', {}, h(Child, next));
    });
    const host = document.createElement('div');
    const destroy = render(h(Parent, {}), host);
    next = { label: 'b' };
    renew();
    await nextTick();
    const result = { text: host.textContent, ownKeys: Object.keys(held) };
    destroy();
    return result;
  },
  async inheritedComponentProp() {
    let next = { value: 'owned' };
    let renew = () => {};
    let held;
    const Child = mount((_renew, props) => {
      held = props;
      return () => h('p', {}, String(props.value));
    });
    const Parent = mount(bump => {
      renew = bump;
      return () => h('div', {}, h(Child, next));
    });
    const host = document.createElement('div');
    const destroy = render(h(Parent, {}), host);
    next = Object.create({ value: 'inherited' });
    renew();
    await nextTick();
    const result = { text: host.textContent, ownKeys: Object.keys(held) };
    destroy();
    return result;
  },
  async nonEnumerableComponentProp() {
    let next = { value: 'owned' };
    let renew = () => {};
    let held;
    const Child = mount((_renew, props) => {
      held = props;
      return () => h('p', {}, String(props.value));
    });
    const Parent = mount(bump => {
      renew = bump;
      return () => h('div', {}, h(Child, next));
    });
    const host = document.createElement('div');
    const destroy = render(h(Parent, {}), host);
    next = Object.defineProperty({}, 'value', { value: 'hidden' });
    renew();
    await nextTick();
    const result = { text: host.textContent, ownKeys: Object.keys(held) };
    destroy();
    return result;
  },
  async inheritedHiddenDomProp() {
    let next = { title: 'owned' };
    let renew = () => {};
    const App = mount(bump => {
      renew = bump;
      return () => h('p', next);
    });
    const host = document.createElement('div');
    const destroy = render(h(App, {}), host);
    const proto = Object.defineProperty({}, 'title', { value: 'hidden' });
    next = Object.create(proto);
    renew();
    await nextTick();
    const result = { title: host.querySelector('p').getAttribute('title') };
    destroy();
    return result;
  },
  async removedNodeEvent() {
    let show = true;
    let renew = () => {};
    let clicks = 0;
    const App = mount(bump => {
      renew = bump;
      return () =>
        h(
          'div',
          {},
          show ? h('button', { onClick: () => clicks++ }, 'x') : null
        );
    });
    const host = document.createElement('div');
    const destroy = render(h(App, {}), host);
    const button = host.querySelector('button');
    show = false;
    renew();
    await nextTick();
    button.dispatchEvent(new Event('click'));
    const result = {
      clicks,
      remaining: host.querySelectorAll('button').length,
    };
    destroy();
    return result;
  },
  async destroyedRootEvent() {
    let clicks = 0;
    const host = document.createElement('div');
    const destroy = render(h('button', { onClick: () => clicks++ }, 'x'), host);
    const button = host.querySelector('button');
    destroy();
    button.dispatchEvent(new Event('click'));
    return { clicks, remaining: host.childNodes.length };
  },
  async removalDuringBubbling() {
    const calls = [];
    let destroy = () => {};
    const App = mount(() => {
      mountCallback(() => () => calls.push('unmount'));
      return () =>
        h(
          'section',
          { onClick: () => calls.push('parent') },
          h(
            'button',
            {
              onClick: () => {
                calls.push('child');
                destroy();
              },
            },
            'x'
          )
        );
    });
    const host = document.createElement('div');
    document.body.appendChild(host);
    destroy = render(h(App, {}), host);
    host.querySelector('button').click();
    return { calls, remaining: host.childNodes.length };
  },
  async persistentPortalHostListener() {
    const target = document.createElement('div');
    document.body.appendChild(target);
    let show = true;
    let renew = () => {};
    let calls = 0;
    const counts = [];
    const App = mount(bump => {
      renew = bump;
      return () =>
        h(
          'div',
          {},
          show
            ? h(
                'portal',
                {
                  portal: target,
                  onClick: () => calls++,
                },
                h('button', {}, 'x')
              )
            : null
        );
    });
    const host = document.createElement('div');
    const destroy = render(h(App, {}), host);
    for (let index = 0; index < 3; index++) {
      show = false;
      renew();
      await nextTick();
      const before = calls;
      target.dispatchEvent(new Event('click'));
      counts.push(calls - before);
      show = true;
      renew();
      await nextTick();
    }
    destroy();
    const before = calls;
    target.dispatchEvent(new Event('click'));
    return {
      countsAfterRemoval: counts,
      callsAfterDestroy: calls - before,
      remaining: target.childNodes.length,
    };
  },
  async renewedAfterParentUpdate() {
    let parentRenew = () => {};
    let childRenew = () => {};
    let label = 'a';
    let clicks = 0;
    const Child = mount((bump, props) => {
      childRenew = bump;
      return () => h('b', {}, `${props.label}:${clicks}`);
    });
    const Parent = mount(bump => {
      parentRenew = bump;
      return () => h('section', {}, h(Child, { label }));
    });
    const host = document.createElement('div');
    const destroy = render(h(Parent, {}), host);
    label = 'b';
    parentRenew();
    childRenew();
    await nextTick();
    clicks++;
    childRenew();
    await nextTick();
    const result = { text: host.textContent };
    destroy();
    return result;
  },
};

window.compatibilityCases = cases;
