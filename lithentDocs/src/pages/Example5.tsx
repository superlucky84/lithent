import { CodeBlock } from '@/components/CodeBlock';
import { Example5 } from '@/components/examples/example5';
import type { Introduction } from '@/pages/Introduction';

const example5Code = `import { mount, Fragment } from 'lithent';
import { state } from 'lithent/helper';

interface Notification {
  id: number;
  type: 'like' | 'comment' | 'follow' | 'system';
  user?: string;
  content: string;
  time: string;
  read: boolean;
}

const NotificationCenter = mount(r => {
  const notifications = state<Notification[]>([...], r);
  const filters = state({
    like: true,
    comment: true,
    follow: true,
    system: true,
  }, r);

  const toggleFilter = (type) => {
    filters.v = { ...filters.v, [type]: !filters.v[type] };
  };

  return () => {
    const likes = notifications.v.filter(n => n.type === 'like');
    const comments = notifications.v.filter(n => n.type === 'comment');
    const follows = notifications.v.filter(n => n.type === 'follow');
    const systems = notifications.v.filter(n => n.type === 'system');

    return (
      <>
        {/* 중첩된 Fragment 구조 */}
        <Fragment>
          {/* Likes Fragment Group */}
          {filters.v.like && (
            <Fragment>
              {likes.map(n => <NotificationItem notification={n} />)}
            </Fragment>
          )}

          {/* Comments Fragment Group */}
          {filters.v.comment && (
            <Fragment>
              {comments.map(n => <NotificationItem notification={n} />)}
            </Fragment>
          )}

          {/* 더 깊게 중첩된 Fragment */}
          <Fragment>
            {filters.v.follow && (
              <Fragment>
                {follows.map(n => <NotificationItem notification={n} />)}
              </Fragment>
            )}

            {filters.v.system && (
              <Fragment>
                {systems.map(n => <NotificationItem notification={n} />)}
              </Fragment>
            )}
          </Fragment>
        </Fragment>
      </>
    );
  };
});
`;

export const Example5Page = (): ReturnType<typeof Introduction> => (
  <div class="prose prose-lg dark:prose-invert max-w-none">
    <h1 class="text-3xl md:text-4xl font-semibold text-gray-900 dark:text-white mb-6">
      Nested Fragments (Notification Center)
    </h1>
    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
      중첩된{' '}
      <code class="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm">
        Fragment
      </code>
      를 사용하여 알림 센터를 구현한 예제입니다. 각 알림 타입(좋아요, 댓글,
      팔로우, 시스템)을 Fragment로 그룹화하고, 필터 버튼으로 특정 타입의
      알림들을 토글할 수 있습니다.
    </p>
    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
      이 예제는{' '}
      <strong>
        Lithent의 가상 돔 엔진이 복잡하게 중첩된 Fragment 구조를 정확하게
        처리하고 효율적으로 업데이트하는지 테스트
      </strong>
      하기 위해 설계되었습니다.
    </p>
    <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
      필터를 변경하면 Fragment 단위로 DOM이 추가/제거되며, 여러 단계로 중첩된
      구조에서도 올바르게 diff 알고리즘이 작동합니다.
    </p>

    <CodeBlock language="typescript" code={example5Code} />

    <div class="not-prose mt-6">
      <div class="rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 p-4 shadow-sm">
        <h3 class="text-base font-semibold text-gray-900 dark:text-white mb-3">
          Live demo
        </h3>
        <Example5 />
      </div>
    </div>

    <div class="mt-6">
      <h2 class="text-2xl font-semibold text-gray-900 dark:text-white mb-3">
        Fragment 중첩 구조의 장점
      </h2>
      <ul class="list-disc list-inside space-y-2 text-sm md:text-base text-gray-700 dark:text-gray-300">
        <li>
          <strong>논리적 그룹화</strong>: 관련된 요소들을 Fragment로 묶어 구조를
          명확하게 표현
        </li>
        <li>
          <strong>효율적인 업데이트</strong>: 필터 변경 시 해당 Fragment 그룹만
          추가/제거
        </li>
        <li>
          <strong>깨끗한 DOM</strong>: Fragment는 실제 DOM 노드를 생성하지 않아
          불필요한 래퍼 요소가 없음
        </li>
        <li>
          <strong>유연한 구조</strong>: 여러 단계로 중첩하여 복잡한 조건부
          렌더링 구현 가능
        </li>
      </ul>
    </div>

    <div class="mt-10">
      <h2 class="text-2xl font-semibold text-gray-900 dark:text-white mb-3">
        관련 문서
      </h2>
      <ul class="list-disc list-inside space-y-2 text-sm md:text-base text-gray-700 dark:text-gray-300">
        <li>
          <a
            href="/guide/children"
            class="text-[#42b883] hover:underline"
            onClick={(e: Event) => {
              e.preventDefault();
              window.history.pushState({}, '', '/guide/children');
              window.dispatchEvent(new PopStateEvent('popstate'));
            }}
          >
            Children 가이드
          </a>{' '}
          - Fragment와 children이 어떻게 렌더 트리를 구성하는지 기본 개념을
          정리합니다.
        </li>
        <li>
          <a
            href="/guide/updater"
            class="text-[#42b883] hover:underline"
            onClick={(e: Event) => {
              e.preventDefault();
              window.history.pushState({}, '', '/guide/updater');
              window.dispatchEvent(new PopStateEvent('popstate'));
            }}
          >
            Updater 가이드
          </a>{' '}
          - 필터 변경 시 Fragment 그룹이 어떻게 갱신되는지, 업데이트 흐름
          관점에서 이해할 수 있습니다.
        </li>
      </ul>
    </div>
  </div>
);
