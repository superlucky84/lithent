import { h, render, mount, ref, nextTick } from 'lithent';
import { store } from '@/index';
const testChangeRef = ref<null | (() => void)>(null);

const assignShardStore = store<{ text: string; count: number }>({
  text: 'sharedText',
  count: 3,
});

const Component = mount(renew => {
  const shardStore = assignShardStore(renew);
  const changeInput = (event: InputEvent) => {
    shardStore.text = (event.target as HTMLInputElement).value;
  };
  testChangeRef.value = () => {
    shardStore.text = 'newSharedText';
  };
  return () => (
    <textarea
      type="text"
      onInput={changeInput}
      value={shardStore.text}
      style={{ width: '100px', height: '100px' }}
    />
  );
});

document.body.innerHTML = `<div id="root"><span>1</span><span>2</span><span>3</span></div>`;

const testWrap = document.getElementById('root') as HTMLElement;

render(
  <Component />,
  testWrap,
  testWrap.querySelector('span:nth-of-type(2)') as HTMLElement
);

render(
  <Component />,
  testWrap,
  testWrap.querySelector('span:nth-of-type(3)') as HTMLElement
);

if (import.meta.vitest) {
  const { it, expect } = import.meta.vitest;

  it('A DOM should be created with the textarea inserted in the middle, and the initial values you set for the textarea should be set.', () => {
    expect(testWrap?.querySelector('textarea')?.value).toBe('sharedText');
  });

  it('If you change the value of the store, the value of the textarea should also change.', () => {
    if (testChangeRef.value) {
      testChangeRef.value();
    }
    nextTick().then(() => {
      expect(testWrap?.querySelector('textarea')?.value).toBe('newSharedText');
    });
  });
}
