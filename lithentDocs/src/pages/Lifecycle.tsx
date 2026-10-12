import { CodeBlock } from '@/components/CodeBlock';
import { navigateTo, resolveRouteForLanguage } from '@/store';

const copy = {
  en: {
    title: 'Lifecycle Helpers',
    intro:
      'Own requests, timers, and subscriptions explicitly. Keep a closure and its DOM while a view is hidden, stop activity work, and let instance work finish. Import every helper below from lithent/helper.',
    availability:
      'Requires lithent 1.25.0 or later. Freezing native child updates also requires lithent-concurrent 0.2.0 or later. The live example uses a build with these APIs.',
    ownership: 'Ownership and latest results',
    ownershipText:
      'createOwnerScope() starts no external work. own(cleanup) returns a release function; each registration is cleaned once. useOwnerScope() connects disposal to a committed component’s unmount. Call it once in the mounter and start external work in mountCallback or events.',
    taskText:
      'Create a separate latest-task group for each independent operation. Starting a new run aborts and invalidates the previous one. Only the current run can publish success, error, and pending observers, even if a transport ignores abort. A run resolves to success, error, or stale.',
    activity: 'Activity versus instance lifetime',
    activityText:
      'createActivityScope() is initially inactive. activate() creates a fresh activity and AbortSignal; deactivate() aborts and cleans that activity. onActive() starts registered work on each activation and owns its returned cleanup. scope.own() lasts until final disposal.',
    scopedText:
      'createScopedTask(scope) defaults to activity: hiding cancels that generation and an inactive run returns stale without calling work. createScopedTask(scope, "instance") survives hiding, but the next run still replaces the previous one. Save ordering, retries, and server rollback belong to the application.',
    retained: 'Retain an editor',
    retainedText:
      'createRetainedView(host, initialize, options?) creates an initially hidden independent root. It returns scope, show(), hide(), and dispose(). initialize receives a managed renew and ActivityScope, and returns a render function. Hidden model changes are collected until the next show.',
    hostText:
      'createRetainedHost(initialize, reportCleanupError?, options?) wraps that root in a component. active defaults to false. The committed host creates the editor; removing the host disposes it. Hiding preserves the closure and DOM, while permanent removal releases them.',
    freeze: 'Freeze native child updates with Concurrent',
    freezeText:
      'freezeChildren defaults to false. Managed renew is collected while hidden, but a child’s native renew can still update. To stop native child renews and parent diffs, use a Concurrent build with lifecycle support and pass freezeChildren: true. Unsupported cores fail before initialization or DOM insertion.',
    aliasText:
      'Use the existing Concurrent core and match only the bare lithent import. Components, JSX, and helpers must share one core instance. Older Concurrent releases may lack lifecycle support; supportsRenderBoundary() checks the currently resolved core.',
    boundaryText:
      'useRenderBoundary(initialActive = true) creates one boundary per component mounter with active, disposed, pause(), resume(), and dispose(). Call pause outside render. It controls updates; it does not hide DOM or cancel tasks. Initial construction is allowed even when inactive. Resume applies the latest dirty model.',
    pauseText:
      'Related parked work that has already run effects or initializers can finish synchronously before pause. Pause has no one-frame latency guarantee. Retained views connect the boundary to hiding and activity cleanup for you.',
    api: 'API reference',
    signature: 'Function / returned handle',
    contract: 'Behavior and support',
    types: 'Public TypeScript types',
    integration: 'SSR and Custom Elements',
    ssrText:
      'Importing or creating scopes starts no requests or timers. SSR renders a retained host’s shell without initializing its browser view. Direct retained-view creation needs a DOM. User work started directly in a mounter is not automatically suppressed during SSR.',
    elementText:
      'Pass a retained host to defineElement and declare active as Boolean. Keep the element connected while hiding it. A same-task DOM move preserves the instance; actual removal disposes it, and reconnecting creates a fresh instance.',
    limits: 'Cleanup, cancellation, and cost',
    limitsText:
      'Cleanup is synchronous. Disposal attempts every registered cleanup and reports failures as AggregateError. A custom component cleanup reporter must not throw. Observer exceptions reject run(); work failures produce an error outcome. cancel() does not emit pending(false), so reset pending UI when starting a new activity or handling manual cancellation.',
    sideEffects:
      'Abort does not undo direct writes inside work or server-side saves, and cannot force a Promise to finish. Hiding retains memory. Choose a retention limit and dispose unused views. Focus and selection restoration, accessibility, portal visibility, and media or iframe suspension need application handling.',
    cost: 'These APIs live in the helper; the default core keeps its existing behavior. ESM can tree-shake unused lifecycle APIs. The full helper UMD includes them all, so its download grows even when an application only uses an older helper.',
    example: 'Try the retained editor example →',
    concurrent: 'Concurrent setup and scheduling →',
    element: 'Custom Element integration →',
  },
  ko: {
    title: '수명 관리 헬퍼',
    intro:
      '요청·타이머·구독의 소유권을 명시적으로 관리합니다. 화면을 숨겨도 클로저와 DOM을 보존하고, 활동 작업은 멈추며 인스턴스 작업은 계속할 수 있습니다. 아래 헬퍼는 모두 lithent/helper에서 가져옵니다.',
    availability:
      'lithent 1.25.0 이상이 필요합니다. 자식의 native 갱신까지 중단하려면 lithent-concurrent 0.2.0 이상도 필요합니다. 실행 예제는 이 API가 포함된 빌드로 동작합니다.',
    ownership: '소유권과 최신 결과',
    ownershipText:
      'createOwnerScope()는 외부 작업을 시작하지 않습니다. own(cleanup)은 수동 해제 함수를 반환하며 등록마다 한 번 정리합니다. useOwnerScope()는 확정된 컴포넌트의 언마운트에 폐기를 연결합니다. mounter에서 한 번 호출하고 외부 작업은 mountCallback이나 이벤트에서 시작하세요.',
    taskText:
      '서로 독립된 작업에는 각각 최신 작업 그룹을 만듭니다. 새 run은 이전 실행을 abort하고 무효화합니다. 전송 계층이 abort를 무시해도 현재 실행만 success·error·pending observer에 반영합니다. run 결과는 success·error·stale 중 하나입니다.',
    activity: '활동과 인스턴스 수명',
    activityText:
      'createActivityScope()는 처음 비활성입니다. activate()는 새 활동과 AbortSignal을 만들고 deactivate()는 그 활동을 abort하고 정리합니다. onActive()는 활성화마다 등록한 작업을 시작하고 반환한 cleanup을 소유합니다. scope.own()은 최종 폐기까지 유지합니다.',
    scopedText:
      'createScopedTask(scope)의 기본값은 activity입니다. 숨기면 해당 세대를 취소하고 비활성 run은 work를 호출하지 않고 stale을 반환합니다. createScopedTask(scope, "instance")는 숨김 중 계속되지만 다음 run은 이전 실행을 대체합니다. 저장 순서·재시도·서버 rollback은 앱이 처리합니다.',
    retained: '편집기를 보존하기',
    retainedText:
      'createRetainedView(host, initialize, options?)는 처음 숨긴 독립 루트를 만들고 scope·show()·hide()·dispose()를 반환합니다. initialize는 관리된 renew와 ActivityScope를 받아 렌더 함수를 반환합니다. 숨김 중 모델 변경은 다음 show까지 모아 둡니다.',
    hostText:
      'createRetainedHost(initialize, reportCleanupError?, options?)는 그 루트를 컴포넌트로 감쌉니다. active 기본값은 false입니다. 확정된 호스트가 편집기를 만들고 호스트 제거는 폐기합니다. 숨김은 클로저·DOM을 유지하며 영구 제거는 해제합니다.',
    freeze: 'Concurrent로 자식 갱신 중단하기',
    freezeText:
      'freezeChildren의 기본값은 false입니다. 관리된 renew는 숨김 중 모으지만 자식의 native renew는 계속될 수 있습니다. 자식 native renew와 부모 diff까지 막으려면 lifecycle을 지원하는 Concurrent 빌드에서 freezeChildren: true를 전달하세요. 지원하지 않는 코어는 초기화·DOM 삽입 전에 실패합니다.',
    aliasText:
      '기존 Concurrent 코어를 선택하고 lithent 단독 import에만 alias를 적용하세요. 컴포넌트·JSX·helper는 같은 코어 인스턴스를 사용해야 합니다. 오래된 Concurrent는 이 기능이 없을 수 있으며 supportsRenderBoundary()로 현재 코어의 지원 여부를 확인합니다.',
    boundaryText:
      'useRenderBoundary(initialActive = true)는 mounter당 경계 하나를 만들고 active·disposed·pause()·resume()·dispose()를 제공합니다. pause는 렌더 밖에서 호출하세요. 갱신만 제어하며 DOM 숨김이나 작업 취소는 하지 않습니다. 처음 비활성이어도 첫 구성은 허용하고 재개하면 최신 dirty 모델을 반영합니다.',
    pauseText:
      '이미 effect나 초기화를 실행한 관련 대기 작업은 pause 전에 동기로 완료할 수 있습니다. pause가 한 프레임 안에 끝난다는 보장은 없습니다. 보존 view는 경계·DOM 숨김·활동 정리를 함께 연결합니다.',
    api: 'API 목록',
    signature: '함수 / 반환 핸들',
    contract: '동작과 지원 범위',
    types: '공개 TypeScript 타입',
    integration: 'SSR와 Custom Elements',
    ssrText:
      'import·scope 생성은 요청과 타이머를 시작하지 않습니다. SSR의 보존 host는 브라우저 view를 초기화하지 않고 껍데기만 렌더합니다. view 직접 생성에는 DOM이 필요합니다. 사용자가 mounter에서 직접 시작한 작업은 SSR 중 자동 차단하지 않습니다.',
    elementText:
      '보존 host를 defineElement에 전달하고 active를 Boolean으로 선언합니다. 숨김 중에는 element 연결을 유지하세요. 같은 태스크의 DOM 이동은 인스턴스를 보존하고 실제 제거는 폐기합니다. 재연결하면 새 인스턴스입니다.',
    limits: '정리·취소·비용',
    limitsText:
      '정리는 동기입니다. dispose는 모든 등록의 정리를 시도한 뒤 실패를 AggregateError로 보고합니다. 사용자 cleanup reporter는 예외를 던지지 않아야 합니다. observer 예외는 run을 reject하고 work 실패는 error outcome을 반환합니다. cancel()은 pending(false)를 발행하지 않으므로 새 활동이나 수동 취소에서 pending UI를 초기화하세요.',
    sideEffects:
      'Abort는 work 내부의 직접 상태 변경·서버 저장을 되돌리지 않고 Promise를 강제 종료하지 않습니다. 숨김은 메모리를 유지하므로 보존 개수와 최종 폐기를 정하세요. 포커스·선택 복원, 접근성, portal 표시, 영상·iframe 중단은 앱이 처리합니다.',
    cost: 'API는 helper에 있고 기본 코어의 동작을 유지합니다. ESM에서는 미사용 lifecycle API를 제거할 수 있습니다. 전체 helper UMD는 모든 API를 포함하므로 기존 helper만 사용해도 다운로드 크기가 늘어납니다.',
    example: '보존 편집기 실행 예제 →',
    concurrent: 'Concurrent 설정과 스케줄링 →',
    element: 'Custom Element 연결 →',
  },
};

const apis = [
  [
    'createOwnerScope() → OwnerScope',
    'own(cleanup), disposed, dispose(); instance ownership on both cores.',
    'own(cleanup)·disposed·dispose(); 두 코어의 인스턴스 소유권.',
  ],
  [
    'useOwnerScope(reportCleanupError?) → OwnerScope',
    'Mounter hook; dispose on committed unmount. Default reporter: console.error.',
    'mounter에서 사용, 확정된 언마운트에 폐기. 기본 reporter는 console.error.',
  ],
  [
    'createLatestTask(scope) → LatestTask',
    'run(work, handlers?) and cancel(); one latest-only group on both cores.',
    'run(work, handlers?)·cancel(); 두 코어의 최신 작업 그룹 하나.',
  ],
  [
    'createActivityScope() → ActivityScope',
    'active, activity, activate, deactivate, onActive, own, dispose; initially inactive.',
    'active·activity·activate·deactivate·onActive·own·dispose; 처음 비활성.',
  ],
  [
    'createScopedTask(scope, lifetime?) → LatestTask',
    'Defaults to activity; instance survives hiding. Both cores.',
    '기본 activity, instance는 숨김 중 유지. 두 코어 지원.',
  ],
  [
    'createRetainedView(host, initialize, options?) → RetainedView',
    'Initially hidden DOM root; scope, show, hide, dispose. freezeChildren defaults to false.',
    '처음 숨긴 DOM 루트, scope·show·hide·dispose. freezeChildren 기본 false.',
  ],
  [
    'createRetainedHost(initialize, reportCleanupError?, options?)',
    'Component with RetainedHostProps; active defaults to false. Both cores.',
    'RetainedHostProps 컴포넌트, active 기본 false. 두 코어 지원.',
  ],
  [
    'useRenderBoundary(initialActive?) → RenderBoundary',
    'Concurrent mounter only; defaults to active. pause, resume, dispose.',
    '지원하는 Concurrent mounter 전용, 기본 활성. pause·resume·dispose.',
  ],
  [
    'supportsRenderBoundary() → boolean',
    'Capability check on either core; does not enable freezing.',
    '두 코어에서 capability 확인. 호출 자체로 중단을 켜지 않음.',
  ],
];

export const LifecycleLink = ({
  language,
  path,
  label,
}: {
  language: 'en' | 'ko';
  path: string;
  label: string;
}) => (
  <a
    href={`#${resolveRouteForLanguage(path, language)}`}
    onClick={(event: Event) => {
      event.preventDefault();
      navigateTo(path);
    }}
  >
    {label}
  </a>
);

export const LifecycleAvailability = ({
  language,
}: {
  language: 'en' | 'ko';
}) => (
  <p class="rounded-lg border border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-900/20 p-4 text-sm text-amber-900 dark:text-amber-100">
    {copy[language].availability}
  </p>
);

export const LifecycleGuide = ({ language }: { language: 'en' | 'ko' }) => {
  const t = copy[language];
  return (
    <div class="prose prose-lg dark:prose-invert max-w-none space-y-6 text-gray-700 dark:text-gray-300 [&_h1]:text-3xl [&_h1]:font-semibold [&_h2]:text-2xl [&_h2]:font-medium [&_h2]:mt-10 [&_a]:text-[#42b883]">
      <h1>{t.title}</h1>
      <p>{t.intro}</p>
      <LifecycleAvailability language={language} />
      <CodeBlock
        code={`import { createOwnerScope, useOwnerScope, createLatestTask,
  createActivityScope, createScopedTask, createRetainedView,
  createRetainedHost, useRenderBoundary, supportsRenderBoundary,
} from 'lithent/helper';`}
      />
      <h2>{t.ownership}</h2>
      <p>{t.ownershipText}</p>
      <p>{t.taskText}</p>
      <CodeBlock
        language="tsx"
        code={`import { mount, mountCallback } from 'lithent';
import { useOwnerScope, createLatestTask } from 'lithent/helper';

export const Search = mount(renew => {
  const owner = useOwnerScope();
  const task = createLatestTask(owner);
  let result = '';
  mountCallback(() => {
    const onOnline = () => renew();
    window.addEventListener('online', onOnline);
    owner.own(() => window.removeEventListener('online', onOnline));
  });
  const search = () => task.run(async signal => {
    const response = await fetch('/search?q=Lithent', { signal });
    if (!response.ok) throw new Error('Search failed');
    return response.text();
  }, { success: value => { result = value; renew(); } });
  return () => <button onClick={() => { void search(); }}>{result || 'Search'}</button>;
});`}
      />
      <h2>{t.activity}</h2>
      <p>{t.activityText}</p>
      <p>{t.scopedText}</p>
      <h2>{t.retained}</h2>
      <p>{t.retainedText}</p>
      <CodeBlock
        language="tsx"
        code={`import { createRetainedView } from 'lithent/helper';

// Browser entry: initialize once the host DOM exists.
const view = createRetainedView(document.querySelector<HTMLElement>('#editor')!,
  (renew, scope) => {
    let draft = '';
    scope.onActive(() => {
      const timer = setInterval(() => { renew(); }, 10_000);
      return () => clearInterval(timer);
    });
    return () => <textarea value={draft} onInput={(event: Event) => {
      draft = (event.target as HTMLTextAreaElement).value;
      renew();
    }} />;
  });
view.show();
// Temporary: view.hide(); then view.show().
// Permanent: view.dispose().`}
      />
      <p>{t.hostText}</p>
      <CodeBlock
        language="tsx"
        code={`import { mount } from 'lithent';
import { createRetainedHost } from 'lithent/helper';

const Editor = createRetainedHost(renew => {
  let draft = '';
  return () => <textarea value={draft} onInput={(event: Event) => {
    draft = (event.target as HTMLTextAreaElement).value;
    renew();
  }} />;
});
export const Tabs = mount(renew => {
  let active = true;
  return () => <div>
    <button onClick={() => { active = !active; renew(); }}>Toggle editor</button>
    <Editor active={active} />
  </div>;
});`}
      />
      <p>
        <LifecycleLink
          language={language}
          path="/examples/22"
          label={t.example}
        />
      </p>
      <h2>{t.freeze}</h2>
      <p>{t.freezeText}</p>
      <p>{t.aliasText}</p>
      <CodeBlock
        language="typescript"
        code={`import { defineConfig } from 'vite';

export default defineConfig({
  resolve: {
    alias: [{ find: /^lithent$/, replacement: 'lithent-concurrent' }],
  },
});`}
      />
      <CodeBlock
        language="tsx"
        code={`import { createRetainedHost, supportsRenderBoundary } from 'lithent/helper';

// After selecting Concurrent for this application's core imports:
if (!supportsRenderBoundary()) throw new Error('Unsupported core');
export const FrozenEditor = createRetainedHost(
  () => () => <p>Retained content</p>,
  undefined,
  { freezeChildren: true },
);
// A view accepts the same options as its third argument.`}
      />
      <p>{t.boundaryText}</p>
      <p>{t.pauseText}</p>
      <p>
        <LifecycleLink
          language={language}
          path="/guide/concurrent-rendering"
          label={t.concurrent}
        />
      </p>
      <h2>{t.api}</h2>
      <div class="overflow-x-auto rounded border border-gray-200 dark:border-gray-700">
        <table class="w-full text-sm text-left">
          <thead>
            <tr>
              <th class="p-3">{t.signature}</th>
              <th class="p-3">{t.contract}</th>
            </tr>
          </thead>
          <tbody>
            {apis.map(([signature, en, ko]) => (
              <tr class="border-t border-gray-200 dark:border-gray-700">
                <td class="p-3 align-top break-words">
                  <code>{signature}</code>
                </td>
                <td class="p-3 align-top">{language === 'ko' ? ko : en}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <h2>{t.types}</h2>
      <CodeBlock
        code={`import type {
  Cleanup, CleanupErrorReporter, OwnerScope, Activity, ActivityScope,
  LatestTask, TaskWork, TaskHandlers, TaskOutcome, TaskLifetime,
  RetainedView, RetainedViewInitializer, RetainedViewOptions,
  RetainedHostProps, RenderBoundary,
} from 'lithent/helper';`}
      />
      <h2>{t.integration}</h2>
      <p>{t.ssrText}</p>
      <p>{t.elementText}</p>
      <CodeBlock
        code={`import { defineElement } from 'lithent/element';

// Editor is the retained host component above.
defineElement('retained-editor', Editor, { props: { active: Boolean } });
// <retained-editor active></retained-editor>
// Hide in place: element.active = false;
// Dispose: element.remove();`}
      />
      <p>
        <LifecycleLink
          language={language}
          path="/guide/element"
          label={t.element}
        />
      </p>
      <h2>{t.limits}</h2>
      <p>{t.limitsText}</p>
      <p>{t.sideEffects}</p>
      <p>{t.cost}</p>
    </div>
  );
};

export const Lifecycle = () => <LifecycleGuide language="en" />;
