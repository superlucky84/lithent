import type { UserList } from '@/types';
import { store } from '@/engine/helper';

/**
 * 부서 코드 상태
 */
// export const selectedCodeWatch = store<null | string>(null);

export const selectedDepartmentWatch = store<{
  code: null | string;
  members: UserList;
}>({
  code: null,
  members: [],
});
