import { h, render, mount, ref, nextTick } from '@/index';

const parentIncrementRef = ref<null | (() => void)>(null);
const childIncrementRef = ref<null | (() => void)>(null);

const Child = mount<{ parentValue: number }>(renew => {
  let childCount = 0;

  childIncrementRef.value = () => {
    childCount += 1;
    renew();
  };

  return props => (
    <div className="child">
      <span className="child-parent">Parent value: {props.parentValue}</span>
      <span className="child-count">Child count: {childCount}</span>
    </div>
  );
});

const Parent = mount(renew => {
  let parentCount = 0;

  const increaseParent = () => {
    parentCount += 1;
    renew();
  };

  parentIncrementRef.value = increaseParent;

  return () => <Child parentValue={parentCount} />;
});

if (import.meta.vitest) {
  const { it, expect } = import.meta.vitest;

  it('maintains direct parent-child nesting with repeated renews', async () => {
    const container = document.createElement('div');

    render(<Parent />, container);
    await nextTick();

    expect(container.children.length).toBe(1);
    expect(container.firstElementChild?.classList.contains('child')).toBe(true);
    expect(container.querySelector('.child-parent')?.textContent).toBe(
      'Parent value: 0'
    );
    expect(container.querySelector('.child-count')?.textContent).toBe(
      'Child count: 0'
    );

    parentIncrementRef.value?.();
    await nextTick();
    parentIncrementRef.value?.();
    await nextTick();

    expect(container.querySelector('.child-parent')?.textContent).toBe(
      'Parent value: 2'
    );
    expect(container.querySelector('.child-count')?.textContent).toBe(
      'Child count: 0'
    );

    childIncrementRef.value?.();
    await nextTick();
    childIncrementRef.value?.();
    await nextTick();
    childIncrementRef.value?.();
    await nextTick();

    expect(container.querySelector('.child-parent')?.textContent).toBe(
      'Parent value: 2'
    );
    expect(container.querySelector('.child-count')?.textContent).toBe(
      'Child count: 3'
    );

    parentIncrementRef.value?.();
    await nextTick();
    parentIncrementRef.value?.();
    await nextTick();

    expect(container.querySelector('.child-parent')?.textContent).toBe(
      'Parent value: 4'
    );
    expect(container.querySelector('.child-count')?.textContent).toBe(
      'Child count: 3'
    );
    expect(container.children.length).toBe(1);
    expect(container.firstElementChild?.classList.contains('child')).toBe(true);

    childIncrementRef.value?.();
    await nextTick();

    expect(container.querySelector('.child-parent')?.textContent).toBe(
      'Parent value: 4'
    );
    expect(container.querySelector('.child-count')?.textContent).toBe(
      'Child count: 4'
    );
  });
}
