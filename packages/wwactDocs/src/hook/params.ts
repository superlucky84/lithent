const routerParams = { value: {} } as { value: Record<string, string> };

export default function useParams() {
  return routerParams.value;
}

export function addParams(key: string, value: string) {
  routerParams.value[key] = value;
}