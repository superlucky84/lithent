import { state } from '@/engine/helper';
import { h, mount, Fragment } from '@/engine';
import type { Department } from '@/types';

const DepartmentTree = mount<{ departmantTree: Department }>(renew => {
  const opend = state(true, renew);

  return ({ departmantTree }) => (
    <ul style={{ paddingLeft: '10px' }}>
      {departmantTree.children.map(item => (
        <Fragment>
          <li>{item.code}</li>
          {item.children.length > 0 && <DepartmentTree departmantTree={item} />}
        </Fragment>
      ))}
    </ul>
  );
});

export default DepartmentTree;
