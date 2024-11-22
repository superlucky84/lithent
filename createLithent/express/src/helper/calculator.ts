import type { Department, DepartmentList } from '@/types';

/**
 * 부서 트리 만들기
 */
export function makeDepartmentTree(departmentList: DepartmentList) {
  const departmantMap = departmentList.reduce((acc, item) => {
    acc[item.code] = { ...item, children: [] };
    return acc;
  }, {} as Record<string, Department>);

  return Object.entries(departmantMap).reduce(
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
    { code: '0', parentCode: '0', name: 'ROOT', children: [] } as Department
  );
}
