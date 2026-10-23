import { Fragment, componentMap, h, mount, nextTick, render } from 'lithent';

let version = 0;
let count = 20;
let refresh = () => {};
const localUpdates: (() => void)[] = [];
const Row = mount<{ key?: number; id: number }>((renew, props) => {
  let local = 0;
  localUpdates[props.id] = () => {
    local++;
    renew();
  };
  return () => (
    <>
      <input value={`${props.id}:${version}:${local}`} />
      {version % 2 ? null : <i>{props.id}</i>}
    </>
  );
});
const Parent = mount(renew => {
  refresh = renew;
  return () => (
    <section>
      {Array.from({ length: count }, (_, id) => (
        <Row key={id} id={id} />
      ))}
      <footer>{version}</footer>
    </section>
  );
});
const dispose = render(<Parent />, document.getElementById('main'));
Object.assign(globalThis, {
  __fixture: {
    update: async () => {
      version++;
      refresh();
      await nextTick();
    },
    local: async () => {
      localUpdates[count - 1]();
      await nextTick();
    },
    clear: async () => {
      count = 0;
      refresh();
      await nextTick();
    },
    dispose,
  },
});
export { componentMap, nextTick };
