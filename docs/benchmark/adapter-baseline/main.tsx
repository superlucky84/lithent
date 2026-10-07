import { Fragment, render, mount, mountCallback, h } from 'lithent';
import { cacheUpdate } from 'lithent/helper';

type Row = { id: number; label: string };

type State = {
  rows: Row[];
  selected: number | null;
};

type Store = {
  state: State;
  buildData: (count: number) => Row[];
  run: () => void;
  runLots: () => void;
  add: () => void;
  update: () => void;
  clear: () => void;
  swapRows: () => void;
  remove: (id: number) => void;
  select: (id: number) => void;
};

const adjectives = [
  'pretty',
  'large',
  'big',
  'small',
  'tall',
  'short',
  'long',
  'handsome',
  'plain',
  'quaint',
  'clean',
  'elegant',
  'easy',
  'angry',
  'crazy',
  'helpful',
  'mushy',
  'odd',
  'unsightly',
  'adorable',
  'important',
  'inexpensive',
  'cheap',
  'expensive',
  'fancy',
];
const colours = [
  'red',
  'yellow',
  'blue',
  'green',
  'pink',
  'brown',
  'purple',
  'brown',
  'white',
  'black',
  'orange',
];
const nouns = [
  'table',
  'chair',
  'house',
  'bbq',
  'desk',
  'car',
  'pony',
  'cookie',
  'sandwich',
  'burger',
  'pizza',
  'mouse',
  'keyboard',
];

const random = (max: number) => Math.round(Math.random() * 1000) % max;

const buildLabel = () =>
  `${adjectives[random(adjectives.length)]} ${colours[random(colours.length)]} ${nouns[random(nouns.length)]}`;

let nextId = 1;

const store: Store = {
  state: { rows: [], selected: null },
  buildData(count) {
    const data = new Array<Row>(count);
    for (let i = 0; i < count; i += 1) {
      data[i] = { id: nextId, label: buildLabel() };
      nextId += 1;
    }
    return data;
  },
  run() {
    this.state.rows = this.buildData(1000);
  },
  runLots() {
    this.state.rows = this.buildData(10000);
  },
  add() {
    this.state.rows = this.state.rows.concat(this.buildData(1000));
  },
  update() {
    const { rows } = this.state;
    for (let i = 0; i < rows.length; i += 10) {
      rows[i] = { ...rows[i], label: `${rows[i].label} !!!` };
    }
  },
  clear() {
    this.state.rows = [];
    this.state.selected = null;
  },
  swapRows() {
    const { rows } = this.state;
    if (rows.length > 998) {
      const tmp = rows[1];
      rows[1] = rows[998];
      rows[998] = tmp;
    }
  },
  remove(id) {
    this.state.rows = this.state.rows.filter(r => r.id !== id);
  },
  select(id) {
    this.state.selected = id;
  },
};

// The app's renew, set when App mounts. Row handlers go through it.
let renewApp = () => {};
const set = (fn: () => void) => {
  fn();
  renewApp();
};

const RowView = mount<{ row: Row; selected: boolean }>((_, props) => {
  // Created once per row: the mounter runs once, `props` is kept up to date.
  const onSelect = () => set(() => store.select(props.row.id));
  const onRemove = () => set(() => store.remove(props.row.id));

  // Re-render the row only when its data or its selection changes.
  return cacheUpdate(
    () => [props.row, props.selected],
    () => (
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
    )
  );
});

const App = mount(renew => {
  renewApp = renew;

  mountCallback(() => {
    const byId = (id: string) => document.getElementById(id)!;
    byId('run').onclick = () => set(() => store.run());
    byId('runlots').onclick = () => set(() => store.runLots());
    byId('add').onclick = () => set(() => store.add());
    byId('update').onclick = () => set(() => store.update());
    byId('clear').onclick = () => set(() => store.clear());
    byId('swaprows').onclick = () => set(() => store.swapRows());
  });

  return () => (
    <Fragment>
      {store.state.rows.map(row => (
        <RowView
          key={row.id}
          row={row}
          selected={store.state.selected === row.id}
        />
      ))}
    </Fragment>
  );
});

render(<App />, document.getElementById('tbody'));
