import { h, mount } from '@/engine';
import Layout from '@/layout';
import { makeDepartmentTree } from '@/helper/calculator';
import DepartmentTree from '@/components/DepartmentTree';
import UserList from '@/components/UserList';
import { allMemberRef } from '@/store';
import type { Organ, PageProps } from '@/types';

export const makeInitProp = async () => {
  const result = await fetch(
    'http://localhost:3000/assets/choonsik_company_org.json'
  );
  return result.json();
};

const Organ = mount<PageProps<Organ>>((_renew, props) => {
  const initProp = props.initProp;
  const { departmentList, userList } = initProp;
  const { departmantTree } = makeDepartmentTree(departmentList);

  allMemberRef.value = userList.map(item => {
    return {
      ...item,
      departmentCodeList: item.departmentCodePath.split(';'),
      departmentNameList: item.departmentNamePath.split(';'),
    };
  });

  return () => (
    <Layout>
      <div class="w-1/2 h-full bg-red-500 flex items-center justify-center">
        <DepartmentTree departmantTree={departmantTree} />
      </div>
      <div class="w-1/2 h-full bg-green-500 flex items-center justify-center">
        <UserList />
      </div>
    </Layout>
  );
});

export default Organ;
