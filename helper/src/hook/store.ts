export const store = <T extends {}>(initValue: T, renew: () => boolean) => {
  return updater<T>({
    initValue,
    renew,
  });
};

export const updater = <T extends { [key: string | symbol]: unknown }>({
  initValue,
  renew,
}: {
  initValue: T;
  renew: () => void;
}) =>
  new Proxy(initValue, {
    get(target: T, prop: string) {
      return target[prop];
    },
    set(target, prop: keyof T, value) {
      target[prop] = value;
      renew();

      return true;
    },
  });
