import { mount } from 'lithent';

/* lithent:hmr-boundary Counter */
const Counter = mount(renew => {
  let count = 0;
  return () => (
    <section>
      <h1>original counter</h1>
      <button
        onClick={() => {
          count++;
          renew();
        }}
      >
        increment
      </button>
      <output>{count}</output>
    </section>
  );
});
export default Counter;
