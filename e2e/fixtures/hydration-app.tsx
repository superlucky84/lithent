import { h, mount } from 'lithent';
import * as core from 'lithent';
import { renderToString } from 'lithent/ssr';

export const createApp = () => {
  const Row = mount<{ key: number; id: number }>((renew, props) => {
    let count = 0;
    return () => (
      <li data-id={props.id}>
        <span class="row-label">row {props.id}</span>
        <button
          onClick={() => {
            count++;
            renew();
          }}
        >
          row +1
        </button>
        <output>{count}</output>
      </li>
    );
  });
  return mount(renew => {
    let value = 'server';
    let rows = [1, 2, 3];
    const update = (scope: () => void) => {
      if (document.documentElement.dataset.core === 'concurrent') {
        (
          core as typeof core & { deferRender: (scope: () => void) => void }
        ).deferRender(scope);
      } else scope();
    };
    return () => (
      <section>
        <button
          id="value"
          onClick={() =>
            update(() => {
              value = 'client';
              renew();
            })
          }
        >
          {value}
        </button>
        <button
          onClick={() =>
            update(() => {
              rows = [4, ...rows];
              renew();
            })
          }
        >
          add
        </button>
        <button
          onClick={() =>
            update(() => {
              rows = rows.filter(id => id !== 2);
              renew();
            })
          }
        >
          remove
        </button>
        <button
          onClick={() =>
            update(() => {
              rows = [...rows].reverse();
              renew();
            })
          }
        >
          reverse
        </button>
        <ul>
          {rows.map(id => (
            <Row key={id} id={id} />
          ))}
        </ul>
      </section>
    );
  });
};
export const serverMarkup = () => renderToString(h(createApp(), {}));
