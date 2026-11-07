import fs from 'node:fs';
import assert from 'node:assert/strict';
import path from 'node:path';
const out = fs.realpathSync(process.argv[2]);
const read = f => JSON.parse(fs.readFileSync(path.join(out, f), 'utf8'));
const r = read('results.json'),
  audit = read('audit.json'),
  decision = read('decision.json');
assert(audit.passed);
const pct = x => `${x >= 0 ? '+' : ''}${(100 * x).toFixed(2)}%`,
  n = x => x.toFixed(4);
const lines = [];
lines.push(
  '# 정적/동적 HTML 정보 — 수동 blueprint 실험 결과',
  '',
  decision.summary,
  '',
  '## 비교와 판단',
  '',
  '- 기준 HEAD `4109bd3`. stock은 원래 A 앱/원래 core, control은 같은 앱/overlay, candidate는 같은 목록 map/cache에 수동 row blueprint를 쓴 overlay다. C4 알림이나 행별 component는 추가하지 않았다.',
  '- 자동 compiler 변환을 구현하기 전의 opt-in 정보 원리 검증이다. 생성은 readonly plan/static props 공유와 기존 createWDom layout을 쓰는 새 경로도 포함하므로 비교 생략만의 단독 효과가 아니다.',
  '- stock 번들 SHA `95f96c9a…`/Brotli5,491B는 기존 A와 같지만 과거 timing을 합산하지 않는다. 이번 새 CPU870/공식 메모리90 양순서만 사용한다. peer/Vue/일반 JSX 무수정 개선·기본 채택 검증은 아니다.',
  `- 판단: **${decision.disposition}**. ${decision.reasons.join(' ')}`,
  `- ${decision.next}`,
  '',
  '## 전체/JS/paint 가중 변화',
  '',
  '각 항목 중앙값의 기존 가중 기하평균이다. net=candidate/stock, information=candidate/control, hooks=control/stock이다. pooled는 합친 표본에서 중앙값을 다시 구한 값이며 순서별 개선율의 평균이 아니다. 음수는 빠른 것이다. 전체 분포·순서별 값은 [JSON](./static-dynamic-results.json)에 보존했다.',
  '',
  '| 순서 | 비교 | 전체 | JS | paint |',
  '| --- | --- | ---: | ---: | ---: |'
);
for (const order of ['main', 'reverse', 'pooled'])
  for (const pair of ['net', 'information', 'hooks']) {
    const w = r.weighted[order][pair];
    lines.push(
      `| ${order} | ${pair} | ${pct(w.total)} | ${pct(w.script)} | ${pct(w.paint)} |`
    );
  }
lines.push(
  '',
  '## 9항목 pooled 전체 시간',
  '',
  '단위 ms. candidate/stock을 총 변화, candidate/control을 같은 overlay에서 정보 활용의 변화로 본다.',
  '',
  '| 항목 | stock | control | candidate | 총 전체 변화 | 총 JS 변화 | 정보 전체 변화 |',
  '| --- | ---: | ---: | ---: | ---: | ---: | ---: |'
);
for (const row of r.cpu.pooled) {
  const c = row.conditions;
  lines.push(
    `| ${row.id} | ${n(c.stock.total.median)} | ${n(c.control.total.median)} | ${n(c.candidate.total.median)} | ${pct(row.change.net.total)} | ${pct(row.change.net.script)} | ${pct(row.change.information.total)} |`
  );
}
lines.push(
  '',
  decision.interpretation,
  '',
  '## 실제 제거한 작업과 남는 비용',
  '',
  'schema는 고정 HTML tag/arity/static props와 동적 text/attr/direct event slot을 한 번 검증·복사한다. 인스턴스의 순수 값 배열을 snapshot하고 첫 생성은 독립 WDom/DOM을 소유한다. 같은 blueprint/key는 정적 자식을 재생성·diff 방문하지 않고 값이 바뀐 slot만 기존 updateProps/updateText로 commit한다. child parent 연결과 VDOM 값도 갱신한다. clone은 description snapshot을 독립적으로 materialize하고 다른 blueprint/key/plain 전환은 일반 full diff로 처리한다.',
  '',
  '아래는 별도 diagnostic build의 **비시간 실측 counter**다. DOM 쓰기 수가 같은 상태에서 생성/방문 감소를 확인했다. 목록 map·key Map 매칭·불변 행 방문은 남으며 O(n)을 없앤 것이 아니다. 값 tuple 생성/복사·slot 비교·metadata/refs·최초 materialize·global hook 비용도 candidate/control에 포함한다.',
  '',
  '| n | k | 조건 | WDom 생성 | diff 방문 | update 방문 | text 쓰기 | slot 비교 |',
  '| ---: | ---: | --- | ---: | ---: | ---: | ---: | ---: |'
);
for (const row of r.validation.unit.work) {
  const c = row.counts;
  lines.push(
    `| ${row.n} | ${row.k} | ${row.variant} | ${c.wdCreated} | ${c.diffVisits} | ${c.updateVisits} | ${c.textWrites} | ${c.comparedSlots} |`
  );
}
lines.push(
  '',
  'V1의 변경 없는 cached row fixture에서 전체 WeakMap.get 호출 계수는1k/10k행2013/20013회였다. V2는 일반 core 경로를 유지하고 block hook만 동일 객체에서 건너뛰어13/13회로 줄였다. V1 부분 CPU 수집은 중단·보존했으며 아래 최종 수치는 재검증한 V2의 새 전체 수집만 사용한다.'
);
lines.push(
  '',
  'Chrome의 실제 candidate 앱에서 partial100/선택1/선택 전환2행의 fast block과 text100/class1/class2 쓰기도 확인했다. 공식 번들에는 diagnostic counter가 없다.',
  '',
  '## 공식 메모리와 앱 크기',
  '',
  '메모리 단위는 공식 runner의 MB다. 전체 JS heap 무누수를 보장하는 검사가 아니며 readonly schema/static props와 per-instance metadata/값·refs/DOM을 모두 포함한다.',
  '',
  '| 항목 | stock MB | control MB | candidate MB | candidate-stock MB | 총 변화 |',
  '| --- | ---: | ---: | ---: | ---: | ---: | ---: |'
);
for (const row of r.memory.pooled) {
  const c = row.conditions;
  lines.push(
    `| ${row.id} | ${n(c.stock.median)} | ${n(c.control.median)} | ${n(c.candidate.median)} | ${n(c.candidate.median - c.stock.median)} | ${pct(row.change.net)} |`
  );
}
lines.push(
  '',
  '같은 compressor의 전체 앱 번들이다. 기존 base UMD guard와 직접 비교하지 않는다.',
  '',
  '| 조건 | raw B | gzip B | Brotli B |',
  '| --- | ---: | ---: | ---: |'
);
for (const name of ['stock', 'control', 'candidate']) {
  const b = r.builds[name];
  lines.push(`| ${name} | ${b.raw} | ${b.gzip} | ${b.brotli} |`);
}
lines.push(
  '',
  '## 정합성·감사·준비 기록',
  '',
  `- JSDOM 계약/작업량 ${r.validation.unit.cases}검사(일반 HTML 계약19 + 작업량8), 기존 core ${r.validation.core.files}파일/${r.validation.core.passed}검사와 stock/overlay 분리 strict types 통과. 값/schema 복사·text/attrs/events·undefined/빈 문자열·plain/blueprint fallback·parent/callback·keyed 이동/삭제·같은 description/clone·pending/retired snapshot·focus·fault/remount를 확인했다.`,
  `- 세 앱 공식 keyed/9동작/font와 Chrome ${r.validation.browser.native.checks}검사 통과. 세 앱 각각3context의100회 create/clear·100회 partial 뒤 DOM/listener는 초기 수준으로 돌아왔다. heap 증가량은 별도 browser.json에 보존하며 전체 JS heap 누수 부재로 확대하지 않는다.`,
  `- 독립 ${audit.distributions}분포/${audit.ratios}비율/${audit.weighted}가중 검산과 반대 순서·표본·source/browser/bundle·runner/설치 hash 통과. 입력은 root${audit.frozenRoot}+추가root${audit.additionalRoot}/stage${audit.frozenStage}, runner${audit.runnerFiles}/package${audit.runnerPackages}다.`,
  '- 최초 준비에서 두 core의 JSX 전역을 함께 type-check한 중복 선언과 diagnostic alias 누락을 수정했다. 일반 core 회귀의 넓은 root 탐색은 중단하고 격리 root로 제한해 통과했다. runtime/공식 번들은 그 설정 수정 전후 같다. 실패한 setup은 archive의 별도 prefix에 보존한다.',
  '- 공식 수집은 직렬이며 build/test/profile/다른 benchmark를 함께 실행하지 않았다. 기존 C4/DC-25와 같은 source 원본을 쓰지만 과거 CPU·memory 표본은 가져오지 않는다.',
  '',
  '| 순서/모드 | 시작 UTC | 종료 UTC | Chrome | 실패 batch | warnings |',
  '| --- | --- | --- | --- | ---: | ---: |'
);
for (const [order, modes] of Object.entries(r.runs))
  for (const [mode, v] of Object.entries(modes))
    lines.push(
      `| ${order}/${mode} | ${v.startedAt} | ${v.finishedAt} | ${v.chrome} | ${v.failedBatches.length} | ${v.warnings.length} |`
    );
lines.push(
  '',
  '## 계약 한계와 재현',
  '',
  'block은 일반 h의 내부 표현 관찰과 다른, 순수 값 tuple의 불투명 opt-in description이다. materialize 전 subtree 관찰/외부 WDom mutation을 지원하지 않는다. blueprint 내부 per-node hook/VDOM callback·component/portal/Fragment/ref/style/input/SVG/custom element·동적 구조/getter/spread는 지원하지 않으며 일반 h 경로를 사용한다. 자동 JSX/template compiler·concurrent/SSR/HMR·제품 API·일반 rollback은 범위 밖이다. 기존 portal BUG-3을 해결한 것으로 표시하지 않는다. 기본 runtime/exports/guard는 유지했다.',
  '',
  `[도구/명령](../../experiments/static-dynamic/README.md), [정본 인계](../performance-improvement/IMPLEMENT.md#상태--핸드오프). staging은 \`${out}\`이다. [증거 archive](https://github.com/superlucky84/lithent/releases/download/benchmark-evidence/static-dynamic-evidence.tar.gz)와 [manifest](./static-dynamic-evidence-manifest.json)에 실제 원본/overlay/patch·앱/번들·raw/trace·입력/runner/lock·준비 실패와 도구를 보존했다. 기존 C4 자료는 유지한다.`,
  ''
);
fs.writeFileSync('docs/benchmark/STATIC_DYNAMIC_RESULTS.md', lines.join('\n'));
fs.writeFileSync(
  'docs/benchmark/static-dynamic-results.json',
  JSON.stringify({ ...r, audit, decision }, null, 2) + '\n'
);
console.log(JSON.stringify({ report: 'STATIC_DYNAMIC_RESULTS.md', decision }));
