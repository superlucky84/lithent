import fs from 'node:fs';
import path from 'node:path';
import { root, read } from './config.mjs';

const a = read(path.join(root, 'docs/benchmark/peer-baseline-results.json'));
const data = {
  rows: a.rows,
  memory: a.memory,
  goal: a.goal,
  weights: a.weights,
  versions: {
    lithent: '1.25.2',
    ...Object.fromEntries(
      Object.entries(a.provenance.peers).map(([name, p]) => [name, p.version])
    ),
  },
};
const color = fs.readFileSync(
  path.join(
    process.argv[2] || '/tmp/lithent-peers-20261023',
    'color-function.js'
  ),
  'utf8'
);
const html = `<!doctype html>
<html lang="ko"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>DC-16 · Lithent / React / Preact</title>
<style>
:root{font-family:system-ui,sans-serif;color:#18202b;background:#f7f8fa}body{max-width:1300px;margin:40px auto;padding:0 24px}h1{font-size:28px;margin:0 0 12px}p{line-height:1.6}.summary{font-size:20px;font-weight:650}label{display:inline-block;margin:12px 24px 16px 0}select{font:inherit;padding:8px;border:1px solid #aaa;border-radius:6px}.scroll{overflow:auto}table{border-collapse:collapse;width:100%;background:white}th,td{border:1px solid #d6dae1;padding:12px;text-align:right;white-space:nowrap}th:first-child,td:first-child{text-align:left}th{background:#edf0f5}td small{display:block;font-size:12px;opacity:.8;margin-top:4px}.goal{font-weight:700}.fail{color:#a12e21}.pass{color:#155f35}.note{color:#455166;font-size:14px}a{color:#2456b8}footer{margin:24px 0}caption{text-align:left;margin:8px 0}
</style>
<h1>고정 peer 전체 비교</h1>
<p class="summary" id="summary"></p>
<p>CPU 목표: 9항목 모두에서 Lithent 전체 시간 중앙값 ≤ 고정 네 peer 최저값 × 1.10.</p>
<label>지표 <select id="metric"><option value="total">CPU 전체 시간 · ms</option><option value="script">CPU JS · ms</option><option value="paint">CPU paint · ms</option><option value="memory">공식 메모리 · MB</option></select></label>
<label>표본 <select id="round"><option value="pooled">두 차수 합산</option><option value="main">첫 차수</option><option value="reverse">반대 차수</option></select></label>
<div class="scroll"><table><caption id="caption"></caption><thead id="head"></thead><tbody id="body"></tbody></table></div>
<p class="note">셀 색상과 셀 아래 비율: 다섯 앱의 항목별 최저 중앙값 기준, 고정 upstream 연속 색상 함수. 목표 판정: 네 peer 최저값 기준. JS·paint·메모리에는 CPU1.10 목표를 적용하지 않습니다.</p>
<p class="note">각 CPU 항목은 차수별 15표본(선택25), 메모리는3표본입니다. 표시는 소수3자리로 반올림하지만 판정은 원시 비율을 사용합니다. 합산만 경계를 통과하거나 작은 차이가 있으면 두 차수를 함께 확인하세요. 색상·평균은 전 항목 목표 달성의 대체 지표가 아닙니다.</p>
<p class="note">React hooks19.2.0 / classes19.0.0, Preact hooks/classes11.0.0의 고정 구현 비교입니다. 버전·hooks 효과를 분리한 실험이 아닙니다.</p>
<footer><a href="PEER_BASELINE_RESULTS.md">해석·병목 진단·제한</a> · <a href="peer-baseline-results.json">원본 수치</a></footer>
<script>
const data=${JSON.stringify(data).replaceAll('<', '\\u003c')};
${color}
const names=Object.keys(data.versions),peers=names.slice(1);
const el=id=>document.getElementById(id);
el('summary').textContent='합산 '+data.goal.pooledPassed+'/9 통과 · 첫 차수 '+data.goal.mainPassed+'/9 · 반대 차수 '+data.goal.reversePassed+'/9';
function render(){
 const metric=el('metric').value,round=el('round').value,memory=metric==='memory',primary=metric==='total';
 const rows=(memory?data.memory:data.rows)[round];
 el('head').replaceChildren();el('body').replaceChildren();
 const header=document.createElement('tr');
 for(const label of ['항목',...names.map(n=>n+' '+data.versions[n]),'L / 최저 peer',...(primary?['1.10 목표']:[])]){const th=document.createElement('th');th.textContent=label;header.append(th);}el('head').append(header);
 for(const row of rows){
  const value=n=>memory?row.conditions[n].median:row.conditions[n][metric].median;
  const best=Math.min(...names.map(value)),bestPeer=Math.min(...peers.map(value)),ratio=value('lithent')/bestPeer;
  const tr=document.createElement('tr'),label=document.createElement('td');label.textContent=row.id;tr.append(label);
  for(const name of names){const stat=memory?row.conditions[name]:row.conditions[name][metric];const td=document.createElement('td');td.textContent=value(name).toFixed(3);td.style.backgroundColor=computeColor(value(name)/best);td.title='n='+stat.count+'; Q1='+stat.p25.toFixed(3)+'; Q3='+stat.p75.toFixed(3)+'; min='+stat.min.toFixed(3)+'; max='+stat.max.toFixed(3);const small=document.createElement('small');small.textContent=(value(name)/best).toFixed(3)+'×';td.append(small);tr.append(td);}
  const relative=document.createElement('td');relative.textContent=ratio.toFixed(3)+'×';tr.append(relative);
  if(primary){const td=document.createElement('td');td.textContent=ratio<=1.10?'통과':'미달';td.className='goal '+(ratio<=1.10?'pass':'fail');tr.append(td);}el('body').append(tr);
 }
 el('caption').textContent=memory?'공식 메모리 중앙값 · MB (bytes/1024²)':'공식 클릭→최종 paint 중 '+({total:'전체',script:'JS',paint:'paint'}[metric])+' 시간 중앙값 · ms';
}
el('metric').addEventListener('change',render);el('round').addEventListener('change',render);render();
</script></html>`;
fs.writeFileSync(
  path.join(root, 'docs/benchmark/PEER_BASELINE_TABLE.html'),
  html
);
