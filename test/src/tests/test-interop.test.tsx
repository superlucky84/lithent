import { afterEach, describe, expect, it } from 'vitest';
import { fireEvent, screen, within } from '@testing-library/dom';
import userEvent from '@testing-library/user-event';
import { h, mount } from 'lithent';
import { act, cleanup, render } from '@/index';

afterEach(() => cleanup());

// The README's example: lithent/test renders and waits, @testing-library/dom
// finds elements and fires events on the real DOM lithent produced.
const Counter = mount(renew => {
  let count = 0;
  return () => (
    <div>
      <p>count: {count}</p>
      <button
        type="button"
        onClick={() => {
          count += 1;
          renew();
        }}
      >
        +1
      </button>
    </div>
  );
});

const Greeting = mount(renew => {
  let name = '';
  return () => (
    <form
      aria-label="greeting"
      onSubmit={(event: Event) => event.preventDefault()}
    >
      <label>
        Name
        <input
          value={name}
          onInput={(event: Event) => {
            name = (event.target as HTMLInputElement).value;
            renew();
          }}
        />
      </label>
      <output>{name ? `Hello, ${name}!` : 'Who are you?'}</output>
    </form>
  );
});

describe('with @testing-library/dom', () => {
  it('screen queries and fireEvent inside act', async () => {
    render(<Counter />);
    await act(() =>
      fireEvent.click(screen.getByRole('button', { name: '+1' }))
    );
    expect(screen.getByText('count: 1')).toBeTruthy();
  });

  it('within a container, and findBy* without act', async () => {
    const { container } = render(<Counter />);
    const view = within(container);
    fireEvent.click(view.getByRole('button'));
    fireEvent.click(view.getByRole('button'));
    expect(await view.findByText('count: 2')).toBeTruthy();
  });

  it('cleanup leaves nothing for the next query', () => {
    render(<Counter />);
    cleanup();
    expect(screen.queryByRole('button')).toBeNull();
  });
});

describe('with @testing-library/user-event', () => {
  it('typing into an input re-renders on each keystroke', async () => {
    const user = userEvent.setup();
    render(<Greeting />);
    expect(screen.getByRole('status').textContent).toBe('Who are you?');
    await act(() => user.type(screen.getByLabelText('Name'), 'Ada'));
    expect(screen.getByRole('status').textContent).toBe('Hello, Ada!');
    expect((screen.getByLabelText('Name') as HTMLInputElement).value).toBe(
      'Ada'
    );
  });
});
