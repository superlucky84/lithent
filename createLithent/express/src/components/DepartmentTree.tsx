import { state, computed } from '@/engine/helper';
import { h, mount, Fragment, updateCallback } from '@/engine';
import { selectedDepartmentWatch } from '@/store';
import clsx from '@/helper/clsx';
import type { Department } from '@/types';

const DepartmentTree = mount<{ departmantTree: Department }>(renew => {
  const selectedCode = selectedDepartmentWatch(renew, state => [state.code]);

  console.log('00000000000000000000000000');
  updateCallback(() => {
    console.log('787777777777', selectedCode.code);
  });
  return ({ departmantTree }) => (
    <ul class="pl-2">
      {departmantTree.children.map(item => (
        <DepartmentItem item={item} />
      ))}
    </ul>
  );
});

const DepartmentItem = mount<{ item: Department }>((renew, props) => {
  const opend = state(false, renew);

  /**
   * 스토어에서 선택부서 코드만 구독
   */
  const selectedCode = selectedDepartmentWatch(renew, state => [state.code]);
  const hasChildren = computed<boolean>(() => props.item.children.length > 0);

  /**
   * 선택 상태
   */
  const isSelected = computed<boolean>(
    () => selectedCode.code === props.item.code
  );

  const handleToggle = () => {
    opend.value = !opend.value;
  };

  const handleSelect = (code: string) => {
    selectedCode.code = code;
    opend.value = true;
  };

  return ({ item }) => (
    <Fragment>
      <li class={clsx('relative', { 'bg-stone-200': isSelected.value })}>
        {hasChildren.value && (
          <button class="absolute -left-3" onClick={handleToggle}>
            {opend.value ? '-' : '+'}
          </button>
        )}
        <button onClick={() => handleSelect(item.code)}>{item.name}</button>
      </li>
      {hasChildren.value && opend.value && (
        <DepartmentTree departmantTree={item} />
      )}
    </Fragment>
  );
});

export default DepartmentTree;
