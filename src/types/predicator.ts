export function checkFunction(target: unknown): target is Function {
  return typeof target === 'function';
}
