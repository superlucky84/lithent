// Shared store and page shell for the DC-29 row variants. Each variant only
// decides how a row is described; data, actions and the surrounding page are
// the same as the listed js-framework-benchmark app (keyed/lithent).
import { Fragment, render, mount, h } from 'lithent';
import type { WDom } from 'lithent';

export type RowData = { id: number; label: string };

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

export type Bench<R extends RowData> = {
  state: { rows: R[]; selected: number | null };
  renew: () => void;
  select: (id: number) => void;
  remove: (id: number) => void;
};

export const start = <R extends RowData>(
  makeRow: (id: number, label: string, bench: Bench<R>) => R,
  rowsView: (bench: Bench<R>) => WDom[],
  // true: partial update replaces the row object (immutable data, as the
  // listed React/Preact apps do); false: it mutates the label in place (as
  // the listed Lithent app does).
  immutable = false
) => {
  let nextId = 1;
  const state: Bench<R>['state'] = { rows: [], selected: null };
  const bench: Bench<R> = {
    state,
    renew: () => {},
    select(id) {
      state.selected = id;
      bench.renew();
    },
    remove(id) {
      state.rows = state.rows.filter(r => r.id !== id);
      bench.renew();
    },
  };
  const buildData = (count: number) => {
    const data = new Array<R>(count);
    for (let i = 0; i < count; i += 1) {
      data[i] = makeRow(nextId, buildLabel(), bench);
      nextId += 1;
    }
    return data;
  };
  const actions: Record<string, () => void> = {
    run() {
      state.rows = buildData(1000);
    },
    runlots() {
      state.rows = buildData(10000);
    },
    add() {
      state.rows = state.rows.concat(buildData(1000));
    },
    update() {
      const { rows } = state;
      if (immutable) {
        const next = rows.slice();
        for (let i = 0; i < next.length; i += 10) {
          next[i] = { ...next[i], label: next[i].label + ' !!!' };
        }
        state.rows = next;
      } else {
        for (let i = 0; i < rows.length; i += 10) {
          rows[i].label += ' !!!';
        }
      }
    },
    clear() {
      state.rows = [];
      state.selected = null;
    },
    swaprows() {
      const { rows } = state;
      if (rows.length > 998) {
        if (immutable) {
          const next = rows.slice();
          next[1] = rows[998];
          next[998] = rows[1];
          state.rows = next;
        } else {
          const tmp = rows[1];
          rows[1] = rows[998];
          rows[998] = tmp;
        }
      }
    },
  };

  const Table = mount(renew => {
    bench.renew = renew;
    return () => <Fragment>{rowsView(bench)}</Fragment>;
  });

  const App = mount(() => {
    const buttons = [
      { id: 'run', text: 'Create 1,000 rows' },
      { id: 'runlots', text: 'Create 10,000 rows' },
      { id: 'add', text: 'Append 1,000 rows' },
      { id: 'update', text: 'Update every 10th row' },
      { id: 'clear', text: 'Clear' },
      { id: 'swaprows', text: 'Swap Rows' },
    ].map(({ id, text }) => ({
      id,
      text,
      onClick: () => {
        actions[id]();
        bench.renew();
      },
    }));

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
        <span
          class="preloadicon glyphicon glyphicon-remove"
          aria-hidden="true"
        />
      </div>
    );
  });

  render(<App />, document.getElementById('main'));
};
