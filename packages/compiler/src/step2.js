import { makeCursor } from '@/util';

export default function traverse(node) {
  if (node.tagName) {
    const [props, ifValue] = propsToObjectString(node.s);
    node.props = props;
    node.ifValue = ifValue;
  } else if (node.text) {
    const textArr = textToArr(node.text);
    node.textArr = textArr;
  }

  node.children = (node.children || []).map(childItem => {
    return traverse(childItem);
  });

  return node;
}

function search(cursor, targetString) {
  let acc = '';
  let finded = false;

  for (
    cursor.end = cursor.start;
    cursor.end < cursor.code.length;
    cursor.end += 1
  ) {
    if (cursor.code[cursor.end] === targetString) {
      finded = true;
      cursor.start = cursor.end;
      break;
    }

    acc += cursor.code[cursor.end];
  }

  return [finded, acc];
}

function textToArr(target) {
  let newTarget = target.replace(/\n|\r/g, ' ');
  const cursor = makeCursor(newTarget);

  function parse(acc) {
    const startTick = search(cursor, '{');
    if (startTick[0]) {
      acc.push(startTick[1]);

      const endTick = search(cursor, '}');
      if (endTick[0]) {
        endTick[1] += '}';
        cursor.start += 1;
      }

      acc.push(endTick[1]);
      return parse(acc);
    }

    acc.push(startTick[1]);

    return acc;
  }

  const arr = parse([]).filter(item => item);
  const result = arr.reduce((acc, item) => {
    if (/^{.*}$/.test(item)) {
      acc += item.replace(/^{|}$/g, '') + ', ';
    } else {
      acc += `'${item}', `;
    }

    return acc;
  }, '');

  return `${result.replace(/, $/, '')}`;
}

function propsToObjectString(target) {
  let ifValue = '';
  let newTarget = target.replace(/\n|\r/g, '');
  newTarget = newTarget.replace(/=\s*/g, '=');
  newTarget = newTarget.replace(/\s*=/g, '=');
  newTarget = newTarget.replace(/\s{2,}/g, ' ');
  const [, ...propsArr] = newTarget.split(' ');

  // console.log(propsArr);
  // console.log(propsArr.join(',').replace(/=/g, ': '));

  const result = propsArr.reduce((acc, item) => {
    const [key, value] = item.split('=');
    console.log(key);
    if (key.replace('/', '')) {
      const newValue = (value || "''").replace(/^{|}$/g, '');

      if (key === 'w-if') {
        ifValue = `(newValue) && `;
      } else {
        acc.push(`${key}: ${newValue}`);
      }
    }

    return acc;
  }, []);

  return [result.length ? `{ ${result.join(', ')} }` : null, ifValue];
}
