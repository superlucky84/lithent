import type { UserList, User } from '@/types';
import { store } from 'lithent/helper';

/**
 * 모든맴버
 */
// 구독함수
export const allMembersWatch = store<UserList>([]);
//  모든맴버 참조객체
export const allMemberRef = allMembersWatch();

/**
 * 선택된 부서
 */
// 선택된 부서 상태 구독함수
export const selectedDepartmentWatch = store<{
  code: string;
  members: UserList;
}>({
  code: '',
  members: [],
});
export const selectedDepartmentRef = selectedDepartmentWatch();

// 선택된 부서 코드 변경시, 맴버리스트도 업데이트
selectedDepartmentWatch(
  state => {
    const filteredList = allMemberRef.value.filter(
      item => state.code && item.departmentCodeList.includes(state.code)
    );
    state.members = filteredList;
  },
  state => [state.code]
);

/**
 * 선택된 멤버
 */
export const selectedMemberWatch = store<{
  id: string;
  info: User | null;
}>({
  id: '',
  info: null,
});
export const selectMemberRef = selectedMemberWatch();

selectedMemberWatch(
  state => {
    const info = allMemberRef.value.find(item => state.id === item.id);
    if (info && state.id) {
      console.log('UPDATEID', info.id, state.id);
      state.info = info;
    } else {
      state.info = null;
    }
  },
  state => [state.id]
);
