// An uncached directory UI; separate from the archived official benchmark app.
import { h, mount, render } from 'lithent';

type Row = { id: number; label: string };
const people = ['Alex Kim', 'Sam Lee', 'Morgan Park', 'Taylor Choi'];

const Directory = mount(renew => {
  let rows: Row[] = [];
  let selected = 0;
  let nextId = 1;
  let query = '';
  let lastTrusted = false;
  const build = (count: number) =>
    Array.from({ length: count }, () => {
      const id = nextId++;
      return { id, label: `${people[id % people.length]} ${id}` };
    });
  const act = (event: Event, action: () => void) => {
    lastTrusted = event.isTrusted;
    action();
    renew();
  };
  const buttons: { id: string; label: string; run: (event: Event) => void }[] =
    [
      {
        id: 'run',
        label: 'Load 1,000 members',
        run: event =>
          act(event, () => {
            rows = build(1000);
            query = '';
            selected = 0;
          }),
      },
      {
        id: 'runlots',
        label: 'Load 10,000 members',
        run: event =>
          act(event, () => {
            rows = build(10000);
            query = '';
            selected = 0;
          }),
      },
      {
        id: 'add',
        label: 'Add members',
        run: event =>
          act(event, () => {
            rows = rows.concat(build(1000));
          }),
      },
      {
        id: 'update',
        label: 'Update every tenth profile',
        run: event =>
          act(event, () => {
            for (let index = 0; index < rows.length; index += 10)
              rows[index].label += ' !!!';
          }),
      },
      {
        id: 'clear',
        label: 'Clear directory',
        run: event =>
          act(event, () => {
            rows = [];
            selected = 0;
          }),
      },
      {
        id: 'swaprows',
        label: 'Reorder two profiles',
        run: event =>
          act(event, () => {
            if (rows.length > 998) [rows[1], rows[998]] = [rows[998], rows[1]];
          }),
      },
    ];
  Object.assign(window, { __directory: { lastTrusted: () => lastTrusted } });
  return () => (
    <main class="container">
      <div class="jumbotron">
        <h1>Team directory</h1>
        <div class="row">
          {buttons.map(button => (
            <div class="col-sm-4 smallpad" key={button.id}>
              <button
                class="btn btn-primary btn-block"
                type="button"
                id={button.id}
                onClick={button.run}
              >
                {button.label}
              </button>
            </div>
          ))}
        </div>
        <label>
          Filter members
          <input
            class="form-control"
            value={query}
            onInput={(event: Event) =>
              act(event, () => {
                query = (event.target as HTMLInputElement).value;
              })
            }
          />
        </label>
      </div>
      <table class="table table-hover table-striped test-data">
        <tbody id="tbody">
          {rows
            .filter(row =>
              row.label.toLowerCase().includes(query.toLowerCase())
            )
            .map(row => (
              <tr key={row.id} class={selected === row.id ? 'danger' : ''}>
                <td class="col-md-1">{row.id}</td>
                <td class="col-md-4">
                  <a
                    onClick={(event: Event) =>
                      act(event, () => {
                        selected = row.id;
                      })
                    }
                  >
                    {row.label}
                  </a>
                </td>
                <td class="col-md-1">
                  <a
                    onClick={(event: Event) =>
                      act(event, () => {
                        rows = rows.filter(item => item.id !== row.id);
                      })
                    }
                  >
                    <span
                      class="glyphicon glyphicon-remove"
                      aria-hidden="true"
                    />
                  </a>
                </td>
                <td class="col-md-6" />
              </tr>
            ))}
        </tbody>
      </table>
      <span class="preloadicon glyphicon glyphicon-remove" aria-hidden="true" />
    </main>
  );
});

render(<Directory />, document.getElementById('main'));
