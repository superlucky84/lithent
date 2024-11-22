import { h, mount } from '@/engine';
import Layout from '@/layout';
import { makeDepartmentTree } from '@/helper/calculator';
import DepartmentTree from '@/components/DepartmentTree';
import type { Organ, PageProps } from '@/types';

export const makeInitProp = async () => {
  const result = await fetch(
    'http://localhost:3000/assets/choonsik_company_org.json'
  );
  return result.json();
};

const Organ = mount<PageProps<Organ>>((_renew, props) => {
  const initProp = props.initProp;
  const { departmentList } = initProp;
  const departmantTree = makeDepartmentTree(departmentList);

  return () => (
    <Layout>
      <DepartmentTree departmantTree={departmantTree} />
    </Layout>
  );
});

export default Organ;
