export type PageProps<T = null> = {
  params: Record<string, string>;
  query: Record<string, string>;
  initProp: T;
};

export type Organ = {
  userList: UserList;
  departmentList: DepartmentList;
};

export type UserList = {
  departmentCode: string;
  departmentCodePath: string;
  departmentName: string;
  departmentNamePath: string;
  dutyCode: string;
  dutyName: string;
  email: string;
  id: string;
  name: string;
  telephoneNumber: string;
}[];

export type DepartmentList = {
  code: string;
  name: string;
  parentCode: string;
}[];
