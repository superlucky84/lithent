import { routerParams } from '@/helper/universalRef';

export default function useParams() {
  return routerParams.value;
}

export function addParams(key, value) {
  routerParams.value[key] = value;
}
