// The js-framework-benchmark app (docs/benchmark/adapter-baseline/main.tsx)
// as a factory, with deterministic labels so both cores do the same work.
import { Fragment, render, mount, h } from 'lithent';
import { cacheUpdate } from 'lithent/helper';

type Row = { id: number; label: string; view?: (row: Row) => any };

const words = ['pretty', 'large', 'big', 'small', 'red', 'blue', 'table'];

// mode: 'plain' (row components), 'cached' (row components with
// cacheUpdate), 'flat' (the production app: no row components, a cached
// render function per row returning its keyed tr).
export const makeBench = (container: HTMLElement, mode: string) => {
  const cached = mode === 'cached';
  let nextId = 1;
  let seed = 1;
  const label = () => {
    seed = (seed * 16807) % 2147483647;
    return `${words[seed % 7]} ${words[(seed >> 3) % 7]} ${words[(seed >> 6) % 7]}`;
  };
  const build = (count: number) => {
    const data = new Array<Row>(count);
    for (let i = 0; i < count; i++) data[i] = makeRow(nextId++, label());
    return data;
  };
  const state = { rows: [] as Row[], selected: null as number | null };
  const makeRow = (id: number, label: string): Row => {
    const row: Row = { id, label };
    if (mode === 'flat') {
      const onSelect = () => set(() => (state.selected = id));
      const onRemove = () =>
        set(() => (state.rows = state.rows.filter(r => r.id !== id)));
      row.view = cacheUpdate(
        () => [row.label, state.selected === id],
        () => (
          <tr key={id} class={state.selected === id ? 'danger' : undefined}>
            <td class="col-md-1">{id}</td>
            <td class="col-md-4">
              <a onClick={onSelect}>{row.label}</a>
            </td>
            <td class="col-md-1">
              <a onClick={onRemove}>
                <span class="glyphicon glyphicon-remove" aria-hidden="true" />
              </a>
            </td>
            <td class="col-md-6" />
          </tr>
        )
      );
    }
    return row;
  };

  let renewApp = () => {};
  const set = (fn: () => void) => {
    fn();
    renewApp();
  };

  const rowView = (
    props: { row: Row; selected: boolean },
    onSelect: () => void,
    onRemove: () => void
  ) => (
    <tr class={props.selected ? 'danger' : undefined}>
      <td class="col-md-1">{props.row.id}</td>
      <td class="col-md-4">
        <a onClick={onSelect}>{props.row.label}</a>
      </td>
      <td class="col-md-1">
        <a onClick={onRemove}>
          <span class="glyphicon glyphicon-remove" aria-hidden="true" />
        </a>
      </td>
      <td class="col-md-6" />
    </tr>
  );

  const RowView = mount<{ row: Row; selected: boolean; key?: number }>(
    (_, props) => {
      const onSelect = () => set(() => (state.selected = props.row.id));
      const onRemove = () =>
        set(() => (state.rows = state.rows.filter(r => r.id !== props.row.id)));
      return cached
        ? cacheUpdate(
            () => [props.row, props.selected],
            () => rowView(props, onSelect, onRemove)
          )
        : () => rowView(props, onSelect, onRemove);
    }
  );

  const App = mount(renew => {
    renewApp = renew;
    return () => (
      <Fragment>
        {mode === 'flat'
          ? state.rows.map(row => (row.view as (r: Row) => any)(row))
          : state.rows.map(row => (
              <RowView
                key={row.id}
                row={row}
                selected={state.selected === row.id}
              />
            ))}
      </Fragment>
    );
  });

  render(<App />, container);

  return {
    run: () => set(() => (state.rows = build(1000))),
    runLots: () => set(() => (state.rows = build(10000))),
    add: () => set(() => (state.rows = state.rows.concat(build(1000)))),
    update: () =>
      set(() => {
        const rows = state.rows;
        for (let i = 0; i < rows.length; i += 10)
          if (mode === 'flat') rows[i].label += ' !!!';
          else rows[i] = { ...rows[i], label: rows[i].label + ' !!!' };
      }),
    clear: () => set(() => ((state.rows = []), (state.selected = null))),
    swap: () =>
      set(() => {
        const rows = state.rows;
        if (rows.length > 998) {
          const tmp = rows[1];
          rows[1] = rows[998];
          rows[998] = tmp;
        }
      }),
    select: (i: number) =>
      set(() => (state.selected = state.rows[(i % 100) + 1].id)),
    remove: () =>
      set(() => (state.rows = state.rows.filter((_r, i) => i !== 19))),
    rows: () => state.rows.length,
  };
};
