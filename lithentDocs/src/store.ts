import { store } from 'lithent/helper';

export const assignSharedStore = store<{ showHiddenMenu: boolean }>({
  showHiddenMenu: false,
});
