// N — no cache and no row component: every redraw describes every row again.
import { h } from 'lithent';
import { start, RowData } from './shared';

start<RowData>(
  (id, label) => ({ id, label }),
  bench =>
    bench.state.rows.map(row => (
      <tr
        key={row.id}
        class={bench.state.selected === row.id ? 'danger' : undefined}
      >
        <td class="col-md-1">{row.id}</td>
        <td class="col-md-4">
          <a onClick={() => bench.select(row.id)}>{row.label}</a>
        </td>
        <td class="col-md-1">
          <a onClick={() => bench.remove(row.id)}>
            <span class="glyphicon glyphicon-remove" aria-hidden="true" />
          </a>
        </td>
        <td class="col-md-6" />
      </tr>
    ))
);
