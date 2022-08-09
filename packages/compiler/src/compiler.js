const j = `
<div class={\`aaaaaaaaa$\{data.k\}\`} jj = "2" />
<div class={\`aaaaaaaaa$\{data.k\}\`} jj = "2">
  <button onClick={handle}> !vava{data.k}aa</button>
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
const jLength = j.length;

function isExisty(value) {
  return value !== undefined && value !== null;
}

function getString(s, start, end) {
  let acc = '';
  if (isExisty(start) && isExisty(end)) {
    for (let i = start; i < end; i += 1) {
      acc += s[i];
    }
  }

  return acc;
}

const jj = getString(j.trim(), 0, 13);
console.log(jj);
