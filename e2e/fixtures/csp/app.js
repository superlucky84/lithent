(() => {
  const { h, mount, render } = window.core;
  const { defineElement, emit } = window.lithentElement;
  const probe = new URLSearchParams(location.search).get('probe');

  // ?probe=innerHTML: the one documented path that Trusted Types rejects.
  if (probe === 'innerHTML') {
    const Raw = mount(() => () => h('div', { innerHTML: '<b>raw</b>' }));
    try {
      render(h(Raw, {}), document.getElementById('app'));
      window.probeResult = 'rendered';
    } catch (error) {
      window.probeResult = error.name;
    }
    document.documentElement.dataset.ready = 'true';
    return;
  }

  // Core: attributes, a style object, events, a keyed list and updates.
  const App = mount(renew => {
    let count = 0;
    let items = ['a', 'b', 'c'];
    return () =>
      h(
        'div',
        { class: 'app', 'data-count': String(count) },
        h(
          'button',
          {
            class: 'inc',
            style: { color: count % 2 ? 'rgb(255, 0, 0)' : 'rgb(0, 0, 255)' },
            onClick: () => {
              count += 1;
              items = [...items].reverse();
              renew();
            },
          },
          `count:${count}`
        ),
        h(
          'ul',
          {},
          items.map(item => h('li', { key: item, class: 'item' }, item))
        )
      );
  });
  render(h(App, {}), document.getElementById('app'));

  // lithent/element: shadow root, shared style sheet, attribute and event.
  window.widgetEvents = [];
  document.addEventListener('pay', event => {
    window.widgetEvents.push(event.detail);
  });
  const Widget = mount(
    (_renew, props) => () =>
      h(
        'button',
        { class: 'pay', onClick: () => emit(props.host, 'pay', props.amount) },
        `pay:${props.amount}`
      )
  );
  defineElement('csp-widget', Widget, {
    props: { amount: Number },
    styles: ['button { color: rgb(0, 128, 0); }'],
  });

  document.documentElement.dataset.ready = 'true';
})();
