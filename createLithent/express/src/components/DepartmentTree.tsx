import { state } from '@/engine/helper';
import { h, mount, Fragment } from '@/engine';
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

const DepartmentItem = mount<{ item: Department }>(renew => {
  const opend = state(true, renew);

  const handleToggle = () => {
    opend.value = !opend.value;
  };

  return ({ item }) => (
    <Fragment>
      <li>
        <button onClick={handleToggle}>{opend.value ? '-' : '+'}</button>
        {item.code}
      </li>
      {item.children.length > 0 && <DepartmentTree departmantTree={item} />}
    </Fragment>
  );
});

export default DepartmentTree;
