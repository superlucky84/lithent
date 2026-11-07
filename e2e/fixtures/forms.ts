import { h, mount, mountCallback, render } from 'lithent';

type InputRecord = { type: string; trusted: boolean; value: string };
type FormProbe = {
  events: Record<'managed' | 'native', InputRecord[]>;
  checkboxEvents: { type: string; trusted: boolean; checked: boolean }[];
  inputs: Record<string, HTMLInputElement>;
  renew: () => void;
  reorder: () => void;
};
declare global {
  interface Window {
    formProbe: FormProbe;
  }
}
const probe: FormProbe = (window.formProbe = {
  events: { managed: [], native: [] },
  checkboxEvents: [],
  inputs: {},
  renew: () => {},
  reorder: () => {},
});

const App = mount(renew => {
  let text = 'abcdef';
  let checked = false;
  let revision = 0;
  let order = ['a', 'b', 'c'];
  const rows: Record<string, string> = {
    a: 'entry-a',
    b: 'entry-b',
    c: 'entry-c',
  };
  probe.renew = () => {
    revision++;
    renew();
  };
  probe.reorder = () => {
    order = ['a', 'c', 'b'];
    renew();
  };
  mountCallback(() => {
    const remove: (() => void)[] = [];
    for (const id of ['managed', 'native', 'row-a', 'row-b', 'row-c', 'toggle'])
      probe.inputs[id] = document.querySelector<HTMLInputElement>(`#${id}`)!;
    for (const id of ['managed', 'native'] as const) {
      const input = probe.inputs[id];
      const record = (event: Event) =>
        probe.events[id].push({
          type: event.type,
          trusted: event.isTrusted,
          value: input.value,
        });
      for (const type of [
        'focus',
        'keydown',
        'beforeinput',
        'input',
        'keyup',
        'change',
        'blur',
      ]) {
        input.addEventListener(type, record);
        remove.push(() => input.removeEventListener(type, record));
      }
    }
    return () => remove.forEach(stop => stop());
  });
  return () =>
    h(
      'section',
      {},
      h(
        'label',
        {},
        'Managed text',
        h('input', {
          id: 'managed',
          value: text,
          onInput: (event: Event) => {
            text = (event.target as HTMLInputElement).value;
            renew();
          },
        })
      ),
      h('output', { id: 'text-value' }, text),
      h(
        'label',
        {},
        'Toggle',
        h('input', {
          id: 'toggle',
          type: 'checkbox',
          checked,
          onChange: (event: Event) => {
            checked = (event.target as HTMLInputElement).checked;
            probe.checkboxEvents.push({
              type: event.type,
              trusted: event.isTrusted,
              checked,
            });
            renew();
          },
        })
      ),
      h('output', { id: 'checked-value' }, String(checked)),
      h('output', { id: 'revision' }, `revision ${revision}`),
      h(
        'ul',
        { id: 'rows' },
        order.map(key =>
          h(
            'li',
            { key },
            h(
              'label',
              {},
              key,
              h('input', {
                id: `row-${key}`,
                value: rows[key],
                onInput: (event: Event) => {
                  rows[key] = (event.target as HTMLInputElement).value;
                  renew();
                },
              })
            )
          )
        )
      ),
      h('button', { id: 'after', type: 'button' }, 'After fields')
    );
});
render(h(App, {}), document.querySelector('#app'));
