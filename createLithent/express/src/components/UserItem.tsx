// import type { UserList, User } from '@/types';
// import { state, computed } from '@/engine/helper';
import { h, mount, updateCallback, mountCallback } from '@/engine';
import { selectedMemberWatch } from '@/store';
// import clsx from '@/helper/clsx';

const UserItem = mount(renew => {
  const userInfo = selectedMemberWatch(renew, s => [s.info]);
  console.log('00000000000000000000000000');
  mountCallback(() => {
    console.log('VVVVVVVVVVVVVVVVVV');
  });
  updateCallback(() => {
    return () => {
      console.log('AAAAAAAA');
    };
  });

  return () => <ul>{userInfo.id}</ul>;
});

export default UserItem;
