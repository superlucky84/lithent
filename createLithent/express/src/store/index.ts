import type { UserList } from '@/types';
import { store } from '@/engine/helper';

/**
 * 모든맴버
 */
export const allMembersWatch = store<UserList>([]);
export const allMemberRef = allMembersWatch();

/**
 * 부서 코드 상태
 */
export const selectedDepartmentWatch = store<{
  code: null | string;
  members: UserList;
}>({
  code: null,
  members: [],
});
export const selectedDepartmentRef = selectedDepartmentWatch();

// 선택된 부서 코드 변경시, 맴버리스트도 업데이트
selectedDepartmentWatch(
  state => {
    console.log('vv', state.code);
    console.log('vv', allMemberRef.value);
    const filteredList = allMemberRef.value.filter(
      item => state.code && item.departmentCodeList.includes(state.code)
    );
    state.members = filteredList;
  },
  state => [state.code]
);

selectedDepartmentWatch(
  state => {
    console.log('members update', state.members);
  },
  state => [state.members]
);
