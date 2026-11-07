import { CodeBlock } from '@/components/CodeBlock';
import { LifecycleDemo } from '@/components/LifecycleDemo';
import demoSource from '@/components/LifecycleDemo.tsx?raw';
import { LifecycleAvailability, LifecycleLink } from './Lifecycle';

export const LifecycleExample = ({ language }: { language: 'en' | 'ko' }) => {
  const ko = language === 'ko';
  return (
    <div class="prose prose-lg dark:prose-invert max-w-none space-y-6 text-gray-700 dark:text-gray-300 [&_h1]:text-3xl [&_h1]:font-semibold [&_h2]:text-2xl [&_h2]:font-medium [&_a]:text-[#42b883] [&_ol]:list-decimal [&_ol]:pl-6">
      <h1>
        {ko ? '보존 편집기와 작업 수명' : 'Retained Editor and Task Lifetimes'}
      </h1>
      <p>
        {ko
          ? '초안과 되돌리기 기록을 유지하면서 활동 작업과 저장의 수명을 구분합니다. 영구 제거는 보존을 끝냅니다.'
          : 'Keep the draft and undo history while separating activity work from saves. Permanent removal ends retention.'}
      </p>
      <LifecycleAvailability language={language} />
      <h2>{ko ? '직접 확인하기' : 'Try it'}</h2>
      <ol class="space-y-2">
        <li>
          {ko
            ? '초안을 두 번 바꾸고 숨겼다가 다시 열어 되돌리기를 누릅니다. 같은 textarea와 이전 초안이 유지됩니다.'
            : 'Change the draft twice, hide and reopen the editor, then undo. The same textarea and draft history remain.'}
        </li>
        <li>
          {ko
            ? '느린 검색 A 다음 빠른 B를 누릅니다. A가 늦게 완료해도 B가 표시됩니다. 검색 중 숨겼다가 열어도 이전 활동의 응답이 반영되지 않습니다.'
            : 'Start slow search A, then fast B. B stays visible when A finishes late. Hide and reopen during search to expire the previous activity.'}
        </li>
        <li>
          {ko
            ? '저장을 누르고 바로 숨깁니다. 폴링은 멈추고 저장은 한 번 완료합니다. 다시 열면 저장 결과가 보입니다.'
            : 'Save, then immediately hide. Polling stops while the save finishes once. Reopen to see the saved draft.'}
        </li>
        <li>
          {ko
            ? '영구 제거 후 새로 만듭니다. 이전 타이머와 작업은 정리되고 빈 초안의 새 인스턴스가 시작합니다.'
            : 'Remove permanently and create a new editor. Old timers and tasks are disposed, and a fresh instance starts with an empty draft.'}
        </li>
      </ol>
      <LifecycleDemo language={language} />
      <h2>{ko ? '예제 코드' : 'Example source'}</h2>
      <p>
        {ko
          ? '화면에서 실행한 소스입니다. createRetainedHost가 최종 폐기를 소유하고, onActive는 폴링, createScopedTask는 검색과 저장의 수명을 관리합니다. 실제 요청에서는 work에 전달된 signal을 fetch에 넘기세요.'
          : 'This is the running example’s source. createRetainedHost owns final disposal; onActive owns polling, and createScopedTask assigns search and save lifetimes. Pass the work signal to fetch for real requests.'}
      </p>
      <details>
        <summary class="cursor-pointer text-[#42b883] mb-4">
          {ko ? '전체 소스 보기' : 'Show full source'}
        </summary>
        <CodeBlock language="tsx" code={demoSource} />
      </details>
      <p>
        <LifecycleLink
          language={language}
          path="/guide/lifecycle"
          label={
            ko
              ? '수명 관리 API와 Concurrent 지원 조건 →'
              : 'Lifecycle APIs and Concurrent support →'
          }
        />
      </p>
    </div>
  );
};

export const Example22Page = () => <LifecycleExample language="en" />;
