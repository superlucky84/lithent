const SELF_CLOSE_ALLLOW = [
  'area',
  'base',
  'br',
  'col',
  'embed',
  'hr',
  'img',
  'input',
  'keygen',
  'link',
  'meta',
  'param',
  'source',
  'track',
  'wbr',
];

export function isAllowSelfClose(tagname: string) {
  return SELF_CLOSE_ALLLOW.includes(tagname);
}

export function checkExisty(value: unknown) {
  return value !== null && value !== undefined;
}

export function checkVirtualType(type?: string | null) {
  return type && ['f', 'l'].includes(type);
}

export function checkStyleData(
  dataKey: string,
  dataValue: unknown
): dataValue is Record<string, string> {
  return dataKey === 'style' && typeof dataValue === 'object';
}

export function checkRefData(
  dataKey: string,
  dataValue: unknown
): dataValue is {
  value: HTMLElement | Element | DocumentFragment | Text | undefined;
} {
  return dataKey === 'ref' && typeof dataValue === 'object';
}

export function styleObjectToString(styleObj: Record<string, string>) {
  return Object.entries(styleObj)
    .map(([key, value]) => {
      // camelCase를 kebab-case로 변환 (예: borderTop -> border-top)
      const kebabKey = key.replace(/([A-Z])/g, '-$1').toLowerCase();
      return `${kebabKey}: ${value};`;
    })
    .join(' ');
}
