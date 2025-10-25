import { h, mount, render } from 'lithent';

const moduleId = new URL(import.meta.url).pathname;

const Counter = mount<{ label: string }>(renew => {
  let count = 0;

  const increment = () => {
    count += 1;
    renew();
  };

  return ({ label }) => (
    <div data-module-id={moduleId}>
      <h2>{label}</h2>
      <button id="hmr-counter-button" onClick={increment}>
        increment
      </button>
      <p id="hmr-counter-value">count: {count}</p>
    </div>
  );
});

const App = () => (
  <div>
    <h1>Lithent HMR playground</h1>
    <Counter label="Hot counter" />
  </div>
);

const root = document.getElementById('app');

if (root) {
  render(<App />, root);
}

export default App;
