const j = `
<div class={\`aaaaaaaaa$\{data.k\}\`} jj = "2" />
<div class={\`aaaaaaaaa$\{data.k\}\`} jj = "2">
  <button w-if={true} onClick={handle}> !vava{data.k}aa</button>
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

console.log(j);

const jLength = j.length;

const result = {
  children: [],
};
const sa = {
  start: 0,
  end: 0,
  code: j,
};

function isExisty(value) {
  return value !== undefined && value !== null;
}

function search(targetString) {
  let acc = '';
  let finded = false;

  for (sa.end = sa.start; sa.end < sa.code.length; sa.end += 1) {
    if (sa.code[sa.end] === targetString) {
      finded = true;
      sa.start = sa.end;
      break;
    }

    acc += sa.code[sa.end];
  }

  return [finded, acc.trim()];
}

const tagStack = [];

function find(parent) {
  const [finded, acc1] = search('<');
  if (finded) {
    const innerValue = acc1.replace(/>/, '');
    if (innerValue) {
      const item = {
        text: innerValue,
        parent,
      };
      parent.children.push(item);
    }
    sa.start += 1;

    const [finded, acc] = search('>');
    if (finded) {
      const children = [];
      const [tagName] = acc.split(' ');

      if (!/^\//.test(tagName)) {
        const hasChildren = !/\/$/.test(acc);
        const item = {
          tagName,
          s: acc,
          hasChildren,
          children,
          parent,
        };
        tagStack.push(tagName);

        parent.children.push(item);

        return hasChildren ? item : parent;
      } else {
        return parent.parent;
      }
    }
  }
}

function makeTree(parentArr = { children: [] }) {
  const returnArr = find(parentArr);
  if (returnArr) {
    return makeTree(returnArr);
  }

  return parentArr;
}
const result2 = makeTree();

console.log(result2);
