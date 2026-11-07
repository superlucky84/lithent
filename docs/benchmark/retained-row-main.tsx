import {
  Fragment,
  render,
  mount,
  h,
  getComponentKey,
  getComponentSubInfo,
  type WDom,
} from 'lithent';

type RowProps = { key: number; row: Row };
type Row = {
  id: number;
  label: string;
  renew: () => void;
  currentView: { value: WDom | null } | null;
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
      rows[i].renew();
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
    previous?.renew();
    row.renew();
  },
};

// Only the table needs to renew after a store action.
let renewTable = () => {};

function makeRow(id: number, label: string): Row {
  const row = { id, label, renew: () => {}, currentView: null } as Row;
  return row;
}

const RowView = mount<RowProps>((renew, props) => {
  const { row } = props;
  row.renew = renew;
  // Keep the core-owned live reference: caching the initial <RowView /> would
  // retain a retired wrapper after the row renews. Read this reference only.
  row.currentView = getComponentSubInfo(getComponentKey()!, 'vd');
  const onSelect = () => store.select(row);
  const onRemove = () => {
    store.remove(row.id);
    renewTable();
  };
  const idCell = <td class="col-md-1">{row.id}</td>;
  const removeCell = (
    <td class="col-md-1">
      <a onClick={onRemove}>
        <span class="glyphicon glyphicon-remove" aria-hidden="true" />
      </a>
    </td>
  );
  const emptyCell = <td class="col-md-6" />;
  let previousLabel: string;
  let labelCell: WDom;
  // Only explicit row changes renew this component; structural parent updates
  // reuse its current wrapper. No whole-row dependency cache is needed.
  return () => {
    if (row.label !== previousLabel) {
      previousLabel = row.label;
      labelCell = (
        <td class="col-md-4">
          <a onClick={onSelect}>{row.label}</a>
        </td>
      );
    }
    return (
      <tr class={store.state.selected === row ? 'danger' : undefined}>
        {idCell}
        {labelCell}
        {removeCell}
        {emptyCell}
      </tr>
    );
  };
});

const Table = mount(renew => {
  renewTable = renew;
  // Row props never change, and store actions explicitly renew every changed
  // row. Structural changes can therefore reuse each live component node.
  return () => (
    <Fragment>
      {store.state.rows.map(
        row => row.currentView?.value || <RowView key={row.id} row={row} />
      )}
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
      onClick: () => store.update(),
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

render(<App />, document.getElementById('main'));
