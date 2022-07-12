import { makeDataStore } from '@/hook';

const promiseTest = () => {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve(777);
    }, 2000);
  });
};

export default function init() {
  makeDataStore('globalData', {
    item: 'jjj',
    value: 0,
    toggleItem() {
      this.item = this.item === 'kkk' ? 'jjj' : 'kkk';
    },
    async increase() {
      const value = await promiseTest();
      this.value += value;
    },
  });
}
