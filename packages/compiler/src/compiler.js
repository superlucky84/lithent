const j = `
<div class={\`aaaaaaaaa$\{data.k\}\`} jj = "2" />
<div class={\`aaaaaaaaa$\{data.k\}\`} jj = "2">
  <button onClick={handle}>!vava{data.k}aa</button>
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
`;

const templateArr = j.split('');
const va = makeFinder(templateArr);

console.log(templateArr);

function* makeFinder(templateArr) {
  const target = [...templateArr];
  while (target.length > 0) {
    const item = target.shift();

    yield item;
  }
}

function search(regex) {
  let i;
  let find = false;
  let acc = '';
  do {
    i = va.next();
    acc = acc + i.value;
    if (regex.test(i.value)) {
      find = true;
    }
  } while (!i.done && !find);

  return acc;
}

function findTag(parentArr) {
  const s = search(/[^\n\r]/).trim();
  if (s === '<') {
    const tagName = search(/ /).trim();
    const etc = search(/\/?>/).replace(/>$/, '').trim();
    const hasChildren = !/\/$/.test(etc);
    const children = [];
    console.log('ISTAG', tagName, etc, hasChildren);

    const item = {
      tagName,
      hasChildren,
      children,
      etc,
    };

    console.log(parentArr);
    parentArr.push(item);

    const newParentArr = hasChildren ? children : parentArr;

    return newParentArr;
  } else {
    const text = search(/[ |{]/).trim();

    console.log('ISNOTTAG', s + text);

    return parentArr;
  }
}

const root = [];
let tempParentArr = [];

tempParentArr = findTag(root);
tempParentArr = findTag(tempParentArr);
tempParentArr = findTag(tempParentArr);
tempParentArr = findTag(tempParentArr);
tempParentArr = findTag(tempParentArr);
tempParentArr = findTag(tempParentArr);

console.log('RESULT = ', root);
