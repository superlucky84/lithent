/**
 * IMPLEMENT 11-8 — createLithent 보일러플레이트에서 코어를 갈아끼운다.
 *
 * 손으로 하면 매번 다르게 하게 되는 절차를 고정한다:
 * 템플릿 복사 -> alias 주입 -> 빌드 -> SSR 응답 확인 -> 서버 띄우기.
 * 마지막 하이드레이션 확인만 사람이 브라우저에서 한다.
 *
 *   pnpm check:scaffold              # 기본 코어
 *   pnpm check:scaffold:concurrent   # lithent -> lithent-concurrent
 *
 * 스크래치 디렉터리에서만 작업하므로 `createLithent/express` 원본은 건드리지 않는다.
 */
import {
  mkdirSync,
  rmSync,
  readdirSync,
  symlinkSync,
  readFileSync,
  writeFileSync,
  cpSync,
} from 'fs';
import { resolve, join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { spawn, spawnSync } from 'child_process';

// `import.meta.dirname`은 Node 20.11+ 전용이라 쓰지 않는다.
const repo = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const template = join(repo, 'createLithent/express');
const work = join(repo, '.scaffold-check');
const concurrent = process.env.LITHENT_CORE === 'concurrent';

const step = name => console.log(`\n> ${name}`);
const ok = msg => console.log(`  [ok] ${msg}`);
const bad = msg => {
  console.log(`  [FAIL] ${msg}`);
  process.exitCode = 1;
};

// --- 1. 템플릿 복사 ----------------------------------------------------------

step('템플릿을 스크래치로 복사');
rmSync(work, { recursive: true, force: true });
mkdirSync(work, { recursive: true });

for (const entry of readdirSync(template)) {
  if (entry === 'node_modules' || entry === 'dist') continue;
  cpSync(join(template, entry), join(work, entry), { recursive: true });
}
ok(work);

// --- 2. node_modules 연결 ----------------------------------------------------

step('의존성 연결 (설치 대신 워크스페이스 것을 링크)');
const nm = join(work, 'node_modules');
mkdirSync(nm, { recursive: true });

for (const entry of readdirSync(join(template, 'node_modules'))) {
  symlinkSync(join(template, 'node_modules', entry), join(nm, entry));
}

if (concurrent) {
  // 소비자가 `npm i lithent-concurrent` 한 상태를 흉내낸다.
  symlinkSync(join(repo, 'lithentConcurrent'), join(nm, 'lithent-concurrent'));
  ok('lithent-concurrent 링크됨');
} else {
  ok('기본 코어 그대로');
}

// --- 3. alias 주입 -----------------------------------------------------------

step('vite alias 주입');
const configPath = join(work, 'vite.config.js');
const config = readFileSync(configPath, 'utf8');
const target = `  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },`;

if (!config.includes(target)) {
  bad('vite.config.js 모양이 예상과 다르다 — 템플릿이 바뀌었는지 확인할 것');
  process.exit(1);
}

const swap = concurrent
  ? `      // anchored여야 한다. 접두사 매칭은 lithent/jsx-runtime 같은 서브패스까지 끌어간다.
      // 그리고 파일 경로가 아니라 패키지 이름으로 건다 — 이 템플릿은 lithent를
      // external로 두므로, 파일 경로를 넣으면 브라우저가 받을 수 없는 것이 나온다.
      { find: /^lithent$/, replacement: 'lithent-concurrent' },
`
  : '';

writeFileSync(
  configPath,
  config.replace(
    target,
    `  resolve: {
    alias: [
${swap}      { find: '@', replacement: resolve(__dirname, './src') },
    ],
  },`
  )
);
ok(concurrent ? "lithent -> 'lithent-concurrent' (anchored)" : 'alias 없음');

// --- 4. 빌드 ----------------------------------------------------------------

step('빌드');
const build = spawnSync('npx', ['vite', 'build'], {
  cwd: work,
  encoding: 'utf8',
});

if (build.status !== 0) {
  bad('빌드 실패');
  console.log(build.stdout?.slice(-2000));
  console.log(build.stderr?.slice(-2000));
  process.exit(1);
}
ok('vite build 통과');

// --- 5. 산출물이 실제로 어느 코어를 가리키는가 --------------------------------

step('산출물의 코어 확인');

// 두 가지로 본다.
//
//   1. 번들된 JS에 `MessageChannel`이 있는가. 저우선순위 레인의 스케줄링 수단이며
//      기본 코어에는 없다(0회 vs 2회). 전역 이름이라 minify를 견딘다 — 코어가
//      실제로 출하 번들에 들어갔다는 증거다.
//   2. 생성된 `.d.ts`가 `lithent-concurrent`를 가리키는가. 빌드가 그 이름으로
//      해소했다는 증거이며 사람이 읽기 쉽다.
//
// 이 템플릿은 코어를 청크에 번들하므로 JS의 import 문에는 이름이 남지 않는다.
// "DevTools Network에서 확인하세요"라고 사람에게 미루던 항목을 여기로 옮겼다.
const found = { marker: false, specifier: false };

const scan = dir => {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);

    if (entry.isDirectory()) {
      scan(full);
      continue;
    }

    const text = readFileSync(full, 'utf8');

    if (entry.name.endsWith('.js') && text.includes('MessageChannel')) {
      found.marker = true;
    }

    if (text.includes('lithent-concurrent')) {
      found.specifier = true;
    }
  }
};

scan(join(work, 'dist'));

if (found.marker === concurrent) {
  ok(
    concurrent
      ? '번들에 concurrent 스케줄러가 들어 있다 (MessageChannel)'
      : '번들에 concurrent 스케줄러가 없다 (기본 코어)'
  );
} else {
  bad(
    concurrent
      ? 'alias를 걸었는데 번들에 concurrent 코어가 없다'
      : 'alias를 안 걸었는데 번들에 concurrent 코어가 있다'
  );
}

if (found.specifier === concurrent) {
  ok(
    concurrent
      ? '생성된 선언이 lithent-concurrent 를 가리킨다'
      : '생성된 선언이 lithent-concurrent 를 가리키지 않는다'
  );
} else {
  bad('선언 파일의 코어 참조가 기대와 다르다');
}

// --- 6. SSR 응답 확인 --------------------------------------------------------

step('SSR 응답 확인');
const server = spawn('node', ['server.js'], {
  cwd: work,
  env: { ...process.env, NODE_ENV: 'production' },
  stdio: ['ignore', 'pipe', 'pipe'],
});

const url = 'http://localhost:3000/';
let html = '';

for (let attempt = 0; attempt < 20; attempt++) {
  await new Promise(r => setTimeout(r, 500));

  try {
    const response = await fetch(url);

    if (response.ok) {
      html = await response.text();
      break;
    }
  } catch {
    // 아직 안 떴다
  }
}

if (!html) {
  bad('서버가 응답하지 않았다');
  server.kill();
  process.exit(1);
}

ok(`${url} 200, ${html.length} bytes`);

// 서버가 실제로 렌더한 마크업인지 — 빈 껍데기면 SSR이 아니다.
const hasMarkup = /<div[^>]*>[\s\S]{200,}<\/div>/.test(html);

if (hasMarkup) {
  ok('SSR 마크업이 채워져 있다');
} else {
  bad('HTML이 사실상 비어 있다 — SSR이 안 됐다');
}

// --- 7. 사람 몫 --------------------------------------------------------------

step('여기부터 사람 몫 (하이드레이션)');
console.log(`
  서버가 ${url} 에서 돌고 있다. 브라우저로 열고 확인할 것:

    1. 서버가 준 마크업이 그대로 보이는가 (새로고침 직후 깜빡임 없이)
    2. 링크/버튼이 동작하는가  -> 하이드레이션이 붙었다는 뜻
    3. 콘솔에 에러 0건

  어느 코어인지는 위에서 이미 확인했다 (산출물의 import 문). 브라우저에서
  다시 볼 필요 없다.

  ${concurrent ? '기본 코어와 비교: pnpm check:scaffold' : 'concurrent로 보려면: pnpm check:scaffold:concurrent'}

  Ctrl+C 로 종료. 작업 디렉터리는 ${work} 이며 다음 실행에서 지워진다.
`);

process.on('SIGINT', () => {
  server.kill();
  process.exit(0);
});
