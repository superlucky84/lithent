import { mount } from 'lithent';
import { stormStore, storeLabel } from './store';

// Several components in one module, nested in each other and in lists: a
// replacement registers new descendants while it runs (#95).
export const Item = mount<{ index: number }>((_renew, props) => () => (
  <li class="storm-item">item original {props.index}</li>
));

export const List = ({ size }: { size: number }) =>
  Array.from({ length: size }, (_, index) => (
    <Item key={index} index={index} />
  ));

export const Inner = mount(renew => {
  let count = 0;
  return () => (
    <button
      class="storm-inner"
      onClick={() => {
        count++;
        renew();
      }}
    >
      inner original {count}
    </button>
  );
});

export const Outer = mount(renew => {
  const shared = stormStore(renew);
  return () => (
    <section class="storm-outer">
      <p class="storm-store">
        {storeLabel} {shared.clicks}
      </p>
      <Inner />
      <Inner />
      <ul>
        <List size={20} />
      </ul>
    </section>
  );
});
