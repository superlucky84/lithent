import { mount, lmount, mountCallback } from 'lithent';
import type { WDom } from 'lithent';

export const Badge = ({ label }: { label: string }) => (
  <span className="badge">original badge: {label}</span>
);

export function Card({ title }: { title: string }, children: WDom[]) {
  return (
    <div id="stateless-card">
      <Badge label="Info" />
      <h2>original card: {title}</h2>
      {children}
    </div>
  );
}

export const Inner = mount(renew => {
  mountCallback(() => {
    const active = window as unknown as { hmrActiveMounts: number };
    active.hmrActiveMounts = (active.hmrActiveMounts || 0) + 1;
    return () => {
      active.hmrActiveMounts--;
    };
  });
  let count = 0;
  return () => (
    <section id="mixed-inner">
      <h3>original inner</h3>
      <button
        onClick={() => {
          count++;
          renew();
        }}
      >
        inner increment
      </button>
      <output>{count}</output>
    </section>
  );
});

export const Panel = lmount(() => () => (
  <aside id="mixed-panel">
    <h3>original panel</h3>
    <Inner />
  </aside>
));

export default ({ label }: { label: string }) => (
  <p id="stateless-default">original default: {label}</p>
);

export const Empty = () => null;

export const Direct = ({ label }: { label: string }) => (
  <span>original direct: {label}</span>
);
export const UsesDirect = mount<{ label: string }>((_renew, props) => () => (
  <section id="direct-owner">{Direct(props)}</section>
));

export const List = ({ labels }: { labels: string[] }) =>
  labels.map(label => (
    <li className="stateless-list-item">original list: {label}</li>
  ));
