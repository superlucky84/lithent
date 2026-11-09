// A — the listed app (upstream note #1261): no row component; each row's data
// carries a cacheUpdate view that hands back its previous virtual nodes.
import { h } from 'lithent';
import { cacheUpdate } from 'lithent/helper';
import { start, RowData } from './shared';

type Row = RowData & { view: ReturnType<typeof cacheUpdate> };

start<Row>(
  (id, label, bench) => {
    const onSelect = () => bench.select(id);
    const onRemove = () => bench.remove(id);
    const row: Row = {
      id,
      label,
      view: cacheUpdate(
        () => [row.label, bench.state.selected === id],
        () => (
          <tr
            key={id}
            class={bench.state.selected === id ? 'danger' : undefined}
          >
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
      ),
    };
    return row;
  },
  bench => bench.state.rows.map(row => row.view(row))
);
