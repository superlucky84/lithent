import step1 from '@/step1';

const code = `
<div
  class   =   {\`aaaaaaaaa$\{data.k\}\`}
        jj  =  "2" kk={3}>
  <button w-if={true} onClick={handle}>{ssv} !vava{data.k}a {data.j}a  asdlg  asdg</button>
  <button onClick={handle2}>{data2.k}-vava</button>
  <button onClick={handle3}>{data3.k}-vava</button>
  <div ref={domRef}>
    <div>data.k: {data.k}</div>
    <div>data.j: {data.j}</div>
    <div>data2.k: {data2.k}</div>
    <div>data3.k: {data3.k}</div>
  </div>
  <br />
  <br />
</div>
`.trim();

console.log(code);

function makeCursor(code) {
  return { start: 0, end: 0, code };
}

const stepIns = new step1(makeCursor(code));
const step1Result = stepIns.run();

console.log(step1Result);

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

  return `[ ${result.replace(/, $/, '')} ]`;
}
// ['{ssv}', '!vava', '{data.k}', 'a', '{data.j}', 'a  asdlg  asdg']
// !vava{data.k}aa
// ['!vava', data.k, 'aa']

function propsToObjectString(target) {
  let newTarget = target.replace(/\n|\r/g, '');
  newTarget = newTarget.replace(/=\s*/g, '=');
  newTarget = newTarget.replace(/\s*=/g, '=');
  newTarget = newTarget.replace(/\s{2,}/g, ' ');
  const [, ...propsArr] = newTarget.split(' ');

  // console.log(propsArr);
  // console.log(propsArr.join(',').replace(/=/g, ': '));

  const result = propsArr.reduce((acc, item) => {
    const [key, value] = item.split('=');
    acc.push(`${key}: ${value.replace(/^{|}$/g, '')}`);

    return acc;
  }, []);

  return `{ ${result.join(', ')} }`;
}

// propsToObjectString(step1Result.children[0].s);
// console.log(propsToObjectString(step1Result.children[0].children[0].s));
// console.log(textToArr(step1Result.children[0].children[0].children[0].text));
