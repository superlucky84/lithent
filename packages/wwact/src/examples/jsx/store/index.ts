import { makeGlobalStore } from 'wwact/store';

const promiseTest = (): Promise<number> => {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve(777);
    }, 2000);
  });
};

export interface GlobalData {
  item: string;
  value: number;
  toggleItem: () => void;
  increase: () => void;
}

export default function storeInit() {
  const storeValue: GlobalData = {
    item: 'jjj',
    value: 0,
    toggleItem() {
      this.item = this.item === 'kkk' ? 'jjj' : 'kkk';
    },
    async increase() {
      const value = await promiseTest();
      this.value += value;
    },
  };

  makeGlobalStore<GlobalData>('globalData', storeValue);
  makeGlobalStore<{ title: string }>('example', {
    title: '나만의 커스텀 프레임웍 제작기!!',
  });
}
