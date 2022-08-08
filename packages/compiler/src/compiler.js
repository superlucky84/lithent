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

function findTag() {
  search(/</);
  const tagName = search(/ /).trim();
  const etc = search(/\/?>/).replace(/>$/, '').trim();
  const hasChildren = !/\/$/.test(etc);
  console.log(tagName, etc, hasChildren);
}

const va = makeFinder(templateArr);

findTag();
findTag();
findTag();
findTag();
findTag();
findTag();
