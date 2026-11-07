import { mount, render } from 'lithent';
import DefaultBadge, {
  Card,
  Panel,
  Empty,
  List,
  UsesDirect,
  Direct,
} from './Stateless';

const App = mount(renew => {
  let count = 0;
  let visible = true;
  return () => (
    <main>
      <button
        id="parent-increment"
        onClick={() => {
          count++;
          renew();
        }}
      >
        parent increment
      </button>
      <output id="parent-count">{count}</output>
      <button
        id="parent-toggle"
        onClick={() => {
          visible = !visible;
          renew();
        }}
      >
        toggle components
      </button>
      {visible && (
        <Card title={`Title ${count}`}>
          <strong id="card-child">Child {count}</strong>
        </Card>
      )}
      {visible && (
        <section id="external-direct-owner">
          {Direct({ label: `External ${count}` })}
        </section>
      )}
      {visible && <DefaultBadge label={`Label ${count}`} />}
      {visible && <Panel />}
      {visible && <Empty />}
      {visible && <UsesDirect label={`Label ${count}`} />}
      {visible && (
        <ul>
          <List labels={[`Item ${count}`, 'Last']} />
        </ul>
      )}
    </main>
  );
});
render(<App />, document.getElementById('app')!);
