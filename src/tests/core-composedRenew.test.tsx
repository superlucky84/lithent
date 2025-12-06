import { describe, it, expect } from 'vitest';
import { h, render, mount, nextTick } from '@/index';

const Badge = ({ count }: { count: number }) => (
  <p class="badge">
    <span class="count">{count}</span>
  </p>
);

const InfoCard = mount<{ count: number }>(() => props => (
  <Badge count={props.count} />
));

const Dashboard = mount<{ count: number }>(() => props => (
  <InfoCard count={props.count} />
));

const ToggleDashboard = mount(renew => {
  let count = 1;

  return () => (
    <div>
      {count % 2 === 1 && <Dashboard count={count} />}
      <button
        class="toggle"
        onClick={() => {
          count += 1;
          renew();
        }}
      >
        inc
      </button>
    </div>
  );
});

describe('nested components toggle correctly', () => {
  it('adds and removes child component across multiple toggles', async () => {
    const wrap = document.createElement('div');
    render(<ToggleDashboard />, wrap);

    const button = wrap.querySelector('.toggle') as HTMLButtonElement;

    // initial: visible, count 1
    expect(wrap.querySelector('.badge')?.textContent).toContain('1');

    // hide on even count
    button.click();
    await nextTick();
    expect(wrap.querySelector('.badge')).toBeNull();

    // show again on odd
    button.click();
    await nextTick();
    expect(wrap.querySelector('.badge')?.textContent).toContain('3');

    // hide again on even
    button.click();
    await nextTick();
    expect(wrap.querySelector('.badge')).toBeNull();
  });
});
