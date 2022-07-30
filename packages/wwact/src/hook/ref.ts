export default function makeRef<T>(initValue: T) {
  return { value: initValue };
}
