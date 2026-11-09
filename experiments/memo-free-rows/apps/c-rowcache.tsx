// C — a row component whose updater caches its output with cacheUpdate (the
// "C" app of COMPONENT_COST_RESULTS): the updater still runs for every row.
import { h, mount } from 'lithent';
import { cacheUpdate } from 'lithent/helper';
import { start, RowData, Bench } from './shared';

let bench: Bench<RowData>;

const Row = mount<{ id: number; label: string; selected: boolean }>(
  (_renew, props) => {
    const onSelect = () => bench.select(props.id);
    const onRemove = () => bench.remove(props.id);

    return cacheUpdate(
      () => [props.label, props.selected],
      () => (
        <tr class={props.selected ? 'danger' : undefined}>
          <td class="col-md-1">{props.id}</td>
          <td class="col-md-4">
            <a onClick={onSelect}>{props.label}</a>
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
);

start<RowData>(
  (id, label) => ({ id, label }),
  b => {
    bench = b;
    return b.state.rows.map(row => (
      <Row
        key={row.id}
        id={row.id}
        label={row.label}
        selected={b.state.selected === row.id}
      />
    ));
  }
);
