type ClassValue = string | number | boolean | null | undefined;
type ClassArray = ClassValue[];
type ClassObject = Record<string, boolean>;
type ClassInput = ClassValue | ClassArray | ClassObject;

export default function clsx(...args: ClassInput[]): string {
  return args
    .flatMap(arg => {
      if (typeof arg === 'string' || typeof arg === 'number') {
        return arg;
      }
      if (Array.isArray(arg)) {
        return clsx(...arg);
      }
      if (typeof arg === 'object' && arg !== null) {
        return Object.keys(arg).filter(key => arg[key]);
      }
      return [];
    })
    .filter(Boolean) // null, undefined, false 제거
    .join(' ');
}
