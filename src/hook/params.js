import { routerParams } from '@/util';

export default function useParams(key) {
  return routerParams.value[key];
}

export function addParams(key, value) {
  routerParams.value[key] = value;
}
