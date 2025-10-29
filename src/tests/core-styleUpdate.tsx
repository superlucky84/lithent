import { h, render, mount, ref, nextTick } from '@/index';

const updateStyleRef = ref<null | ((color: string) => void)>(null);

const StyleComponent = mount(renew => {
  let color = 'red';
  let margin = '10px';

  updateStyleRef.value = (nextColor: string) => {
    color = nextColor;
    margin = nextColor === 'blue' ? '' : '10px';
    renew();
  };

  return () => (
    <div
      id="styled-target"
      style={{ backgroundColor: color, marginTop: margin }}
    >
      Styled content
    </div>
  );
});

const testWrap =
  document.getElementById('root') || document.createElement('div');

render(<StyleComponent />, testWrap);

if (import.meta.vitest) {
  const { it, expect } = import.meta.vitest;

  it('applies camelCase style properties on initial render', () => {
    const target = testWrap.querySelector('#styled-target') as HTMLElement;
    expect(target).not.toBeNull();
    expect(target.style.backgroundColor).toBe('red');
    expect(target.style.marginTop).toBe('10px');
  });

  it('updates and removes camelCase style properties', async () => {
    updateStyleRef.value?.('blue');

    await nextTick();

    const target = testWrap.querySelector('#styled-target') as HTMLElement;
    expect(target.style.backgroundColor).toBe('blue');
    expect(target.style.marginTop).toBe('');
  });
}
