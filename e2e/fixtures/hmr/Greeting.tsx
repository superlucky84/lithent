import { mount } from 'lithent';
import { greetingStore, label } from './greeting-store';

export const Greeting = mount<{ entry: string }>((renew, props) => {
  const greeting = greetingStore(renew);
  return () => (
    <section id="greeting">
      <p id="greeting-label">{label}</p>
      <p id="greeting-entry">{props.entry}</p>
      <button id="greeting-increment" onClick={() => greeting.count++}>
        increment
      </button>
      <output id="greeting-count">{greeting.count}</output>
    </section>
  );
});
