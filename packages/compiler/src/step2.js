import { makeCursor } from '@/util';

export default function traverse(node) {
  if (node.tagName) {
    const [props, ifValue, forValue, elseIfValue, elseValue] =
      propsToObjectString(node.s);
    node.props = props;
    node.ifValue = ifValue;
    node.elseIfValue = elseIfValue;
    node.elseValue = elseValue;
    node.forValue = forValue;
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
  const { ignoreStr, ignoreChk } = cursor;

  for (
    cursor.end = cursor.start;
    cursor.end < cursor.code.length;
    cursor.end += 1
  ) {
    const currentString = cursor.code[cursor.end];
    const matchString = currentString === targetString;
    const isIgnore = ignoreChk.length > 0;

    if (matchString && !isIgnore) {
      finded = true;
      cursor.start = cursor.end;
      break;
    }

    const isIgnoreString = ignoreStr.includes(currentString);
    if (isIgnoreString) {
      if (ignoreChk[ignoreChk.length - 1] === '"' && currentString === '"') {
        ignoreChk.pop();
      } else if (
        ignoreChk[ignoreChk.length - 1] === '{' &&
        currentString === '}'
      ) {
        ignoreChk.pop();
      } else {
        ignoreChk.push(currentString);
      }
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
  let forValue = '';
  let elseIfValue = '';
  let elseValue = '';
  let newTarget = target.replace(/\n|\r/g, '');
  newTarget = newTarget.replace(/=\s*/g, '=');
  newTarget = newTarget.replace(/\s*=/g, '=');
  newTarget = newTarget.replace(/\s{2,}/g, ' ');

  const cursor = makeCursor(newTarget, ['"', '{', '}']);
  const finder = (res = []) => {
    let [finded, findedItem] = search(cursor, ' ');
    if (finded) {
      res.push(findedItem);
      cursor.start += 1;

      return finder(res);
    }
    res.push(findedItem);

    return res;
  };

  const [, ...propsArr] = finder();

  const result = propsArr.reduce((acc, item) => {
    const [key, value] = item.split('=');
    if (key.replace('/', '')) {
      const newValue = (value || "''").replace(/^{|}$/g, '');

      if (key === 'w-if') {
        ifValue = `((${newValue}) && `;
      } else if (key === 'w-else-if') {
        elseIfValue = `((${newValue}) && `;
      } else if (key === 'w-else') {
        elseValue = `((${newValue}) && `;
      } else if (key === 'w-for') {
        let [listItem, list] = newValue.split(' in ');
        if (!list) {
          list = listItem;
          listItem = `${list}Item`;
        }
        forValue = `(${list}).map(${listItem}, index) => `;
      } else {
        acc.push(`${key}: ${newValue}`);
      }
    }

    return acc;
  }, []);

  return [
    result.length ? `{ ${result.join(', ')} }` : null,
    ifValue,
    forValue,
    elseIfValue,
    elseValue,
  ];
}
