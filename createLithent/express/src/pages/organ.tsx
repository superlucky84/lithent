import { h, Fragment, mount, mountCallback } from 'lithent';
import { makeDepartmentTree } from '@/helper/calculator';
import DepartmentTree from '@/components/DepartmentTree';
import UserList from '@/components/UserList';
import UserItem from '@/components/UserItem';
import { allMemberRef, selectMemberRef } from '@/store';
import type { Organ, PageProps } from '@/types';
import { loadData } from '@/load';

export const makeInitProp = async () => {
  const result = await fetch(
    'http://localhost:3000/assets/choonsik_company_org.json'
  );
  const data = await result.json();

  return {
    layout: {
      title: 'organ',
    },
    data,
  };
};

const Organ = mount<PageProps<Organ>>((_renew, props) => {
  const initProp = loadData<Organ>();
  const { departmentList, userList } = initProp.data;
  const { departmantTree } = makeDepartmentTree(departmentList);

  mountCallback(() => {
    console.log('7');
    selectMemberRef.id = props.query.userId;
  });

  allMemberRef.value = userList.map(item => {
    return {
      ...item,
      departmentCodeList: item.departmentCodePath.split(';'),
      departmentNameList: item.departmentNamePath.split(';'),
    };
  });

  return () => (
    <Fragment>
      <div class="w-1/3 h-full bg-red-500 flex items-center justify-center">
        <DepartmentTree departmantTree={departmantTree} />
      </div>
      <div class="w-1/3 h-full bg-green-500 flex items-center justify-center">
        <UserList />
      </div>
      <div class="w-1/3 h-full bg-blue-500 flex items-center justify-center">
        <UserItem />
      </div>
    </Fragment>
  );
});

export default Organ;
