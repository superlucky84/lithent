import {
  Fragment,
  render,
  mount,
  h,
  useParentMemo,
  mountCallback,
  getComponentKey,
  getComponentSubInfo,
  type CompKey,
} from 'lithent';

declare const __LITHENT_DIAGNOSTIC__: boolean;
const memoEnabled = window.__PARENT_MEMO__;
const metrics = { renders: 0, mounts: 0, unmounts: 0 };
const keys: CompKey[] = [];
let references: WeakRef<object>[] = [];

type RowProps = { key: number; row: Row; selected: boolean };
type Row = {
  id: number;
  label: string;
};

type State = {
  rows: Row[];
  selected: Row | null;
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
  select: (row: Row) => void;
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
      data[i] = makeRow(nextId, buildLabel());
      nextId += 1;
    }
    return data;
  },
  run() {
    this.state.selected = null;
    this.state.rows = this.buildData(1000);
  },
  runLots() {
    this.state.selected = null;
    this.state.rows = this.buildData(10000);
  },
  add() {
    this.state.rows = this.state.rows.concat(this.buildData(1000));
  },
  update() {
    const { rows } = this.state;
    for (let i = 0; i < rows.length; i += 10) {
      rows[i].label += ' !!!';
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
    if (this.state.selected?.id === id) this.state.selected = null;
    this.state.rows = this.state.rows.filter(r => r.id !== id);
  },
  select(row) {
    const previous = this.state.selected;
    if (previous === row) return;
    this.state.selected = row;
  },
};

// Only the table needs to renew after a store action.
let renewTable = () => {};

function makeRow(id: number, label: string): Row {
  return { id, label };
}

const RowView = mount<RowProps>((_renew, props) => {
  if (memoEnabled)
    useParentMemo<RowProps>(next => [
      next.row,
      next.row.id,
      next.row.label,
      next.selected,
    ]);
  if (__LITHENT_DIAGNOSTIC__) {
    keys.push(getComponentKey()!);
    mountCallback(() => {
      metrics.mounts++;
      return () => {
        metrics.unmounts++;
      };
    });
  }
  const onSelect = () => {
    store.select(props.row);
    renewTable();
  };
  const onRemove = () => {
    store.remove(props.row.id);
    renewTable();
  };
  return () => {
    if (__LITHENT_DIAGNOSTIC__) metrics.renders++;
    return (
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
  };
});

const Table = mount(renew => {
  renewTable = renew;
  return () => (
    <Fragment>
      {store.state.rows.map(row => (
        <RowView
          key={row.id}
          row={row}
          selected={store.state.selected === row}
        />
      ))}
    </Fragment>
  );
});

const App = mount(() => {
  const action = (run: () => void) => () => {
    run();
    renewTable();
  };
  const buttons = [
    {
      id: 'run',
      text: 'Create 1,000 rows',
      onClick: action(() => store.run()),
    },
    {
      id: 'runlots',
      text: 'Create 10,000 rows',
      onClick: action(() => store.runLots()),
    },
    {
      id: 'add',
      text: 'Append 1,000 rows',
      onClick: action(() => store.add()),
    },
    {
      id: 'update',
      text: 'Update every 10th row',
      onClick: action(() => store.update()),
    },
    { id: 'clear', text: 'Clear', onClick: action(() => store.clear()) },
    {
      id: 'swaprows',
      text: 'Swap Rows',
      onClick: action(() => store.swapRows()),
    },
  ];

  return () => (
    <div class="container">
      <div class="jumbotron">
        <div class="row">
          <div class="col-md-6">
            <h1>Lithent-&quot;keyed&quot;</h1>
          </div>
          <div class="col-md-6">
            <div class="row">
              {buttons.map(({ id, text, onClick }) => (
                <div key={id} class="col-sm-6 smallpad">
                  <button
                    type="button"
                    class="btn btn-primary btn-block"
                    id={id}
                    onClick={onClick}
                  >
                    {text}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <table class="table table-hover table-striped test-data">
        <tbody id="tbody">
          <Table />
        </tbody>
      </table>
      <span class="preloadicon glyphicon glyphicon-remove" aria-hidden="true" />
    </div>
  );
});

let host: HTMLElement | undefined = document.getElementById('main')!;
let dispose: (() => void) | undefined = render(<App />, host);
if (__LITHENT_DIAGNOSTIC__)
  window.__memoDiagnostic = {
    memoEnabled,
    metrics,
    refresh: () => renewTable(),
    destroy: () => {
      references = keys.flatMap(key => {
        const node = getComponentSubInfo(key, 'vd')?.value;
        return node ? [new WeakRef<object>(node)] : [];
      });
      references.push(new WeakRef<object>(host!));
      dispose!();
      dispose = undefined;
      host!.remove();
      host = undefined;
      store.state.rows = [];
      store.state.selected = null;
    },
    retention: () => ({
      retainedKeys: keys.length,
      registered: keys.filter(key => !!getComponentSubInfo(key, 'vd')).length,
      liveOutputsAndHost: references.filter(reference => !!reference.deref())
        .length,
    }),
  };

declare global {
  interface Window {
    __PARENT_MEMO__: boolean;
    __memoDiagnostic?: {
      memoEnabled: boolean;
      metrics: typeof metrics;
      refresh: () => void;
      destroy: () => void;
      retention: () => {
        retainedKeys: number;
        registered: number;
        liveOutputsAndHost: number;
      };
    };
  }
}
