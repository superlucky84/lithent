// example.jsx
import { h, render, mount } from 'lithent';
import { store } from 'lithent/helper';

const assignShardStore = store<{ text: string; count: number }>({
  text: 'sharedText',
  count: 3,
});

// This is the "mount" function.
// This function is only executed on mount, and on update, only updates `props` and then executes the internal return function.
// childen is passed as the second argument.
const ComponentA = mount(renew => {
  const shardStore = assignShardStore(renew);
  const changeInput = (event: InputEvent) => {
    shardStore.text = (event.target as HTMLInputElement).value;
  };
  return () => (
    <textarea
      type="text"
      onInput={changeInput}
      value={shardStore.text}
      style={{ width: '300px', height: '200px' }}
    />
  );
});

const ComponentB = mount(renew => {
  const shardStore = assignShardStore(renew);
  const changeInput = (event: InputEvent) => {
    shardStore.text = (event.target as HTMLInputElement).value;
  };
  return () => (
    <textarea
      type="text"
      onInput={changeInput}
      value={shardStore.text}
      style={{ width: '300px', height: '200px' }}
    />
  );
});

const componentA = <ComponentA />;
const componentB = <ComponentB />;

render(componentA, document.getElementById('root'));
render(componentB, document.getElementById('root'));
