import { state, computed } from '@/engine/helper';
import { h, mount, Fragment } from '@/engine';
import { selectedDepartmentWatch } from '@/store';
import type { Department } from '@/types';

const DepartmentTree = mount<{ departmantTree: Department }>(_renew => {
  return ({ departmantTree }) => (
    <ul style={{ paddingLeft: '10px' }}>
      {departmantTree.children.map(item => (
        <DepartmentItem item={item} />
      ))}
    </ul>
  );
});

const DepartmentItem = mount<{ item: Department }>((renew, props) => {
  const opend = state(true, renew);

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
  };

  return ({ item }) => (
    <Fragment>
      <li
        style={{
          border: `1px solid ${isSelected.value ? 'red' : 'black'}`,
        }}
      >
        {hasChildren.value && (
          <button onClick={handleToggle}>{opend.value ? '-' : '+'}</button>
        )}
        <button onClick={() => handleSelect(item.code)}>{item.code}</button>
      </li>
      {hasChildren.value && opend.value && (
        <DepartmentTree departmantTree={item} />
      )}
    </Fragment>
  );
});

export default DepartmentTree;
