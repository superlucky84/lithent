// M — the row component of R wrapped in the candidate `memo`: the parent's
// redraw skips a row whose props are the same values as last time. Builds
// only against a core that exports `memo` (DC-29 candidate).
import { h, mount, memo } from 'lithent';
import { start, RowData, Bench } from './shared';

let bench: Bench<RowData>;

const Row = memo(
  mount<{ id: number; label: string; selected: boolean }>((_renew, props) => {
    const onSelect = () => bench.select(props.id);
    const onRemove = () => bench.remove(props.id);

    return () => (
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
    );
  })
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
