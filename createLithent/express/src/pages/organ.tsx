import { h, mount } from '@/engine';
import Layout from '@/layout';
import { navigate } from '@/route';
import DepartmentTree from '@/components/DepartmentTree';
import type { Organ, PageProps, Department, DepartmentRoot } from '@/types';

console.log(navigate);

export const makeInitProp = async () => {
  const result = await fetch(
    'http://localhost:3000/assets/choonsik_company_org.json'
  );
  return result.json();
};

const Organ = mount<PageProps<Organ>>((_renew, props) => {
  const initProp = props.initProp;
  const { departmentList } = initProp;

  console.log('QUERY', departmentList);
  const departmantMap = departmentList.reduce((acc, item) => {
    acc[item.code] = { ...item, children: [] };
    return acc;
  }, {} as Record<string, Department>);

  const departmantTree = Object.entries(departmantMap).reduce(
    (acc, [_code, item]: [string, Department]) => {
      const isRoot = item.parentCode === '0';
      const parentItem = departmantMap[item.parentCode];

      if (isRoot && acc.children) {
        acc.children.push(item);
      } else if (parentItem.children) {
        parentItem.children.push(item);
      }
      return acc;
    },
    { code: '0', parentCode: '0', name: 'ROOT', children: [] } as DepartmentRoot
  );

  console.log('DEPARTMANTMAP', departmantTree);

  return () => (
    <Layout>
      <DepartmentTree departmantTree={departmantTree} />
    </Layout>
  );
});

export default Organ;
