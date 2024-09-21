import { store } from 'lithent/helper';

export const assignSharedStore = store<{
  showHiddenMenu: boolean;
  hashState: string;
}>({
  showHiddenMenu: false,
  hashState: location.hash,
});
