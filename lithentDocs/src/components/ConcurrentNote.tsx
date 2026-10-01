import { navigateTo } from '@/store';

const notes = {
  nextTick: {
    en: 'With lithent-concurrent, nextTick waits for synchronous commits only. Use whenIdle to wait for deferred renders. Neither API guarantees browser paint.',
    ko: 'lithent-concurrent의 nextTick은 동기 커밋만 기다립니다. 미룬 렌더까지 기다리려면 whenIdle을 사용하세요. 어느 API도 브라우저 페인트를 보장하지 않습니다.',
  },
  mount: {
    en: 'With lithent-concurrent, mountCallback observes the complete commit, including newly inserted siblings. Mount callbacks run child to parent; unmount cleanup runs parent to child. mountReadyCallback still runs before DOM insertion.',
    ko: 'lithent-concurrent의 mountCallback은 새 형제까지 포함한 완성된 커밋을 관찰합니다. 마운트 콜백은 자식→부모, 언마운트 정리는 부모→자식 순서입니다. mountReadyCallback은 여전히 DOM 삽입 전에 실행됩니다.',
  },
  update: {
    en: 'The function returned from updateCallback runs after that commit. It is not an unmount cleanup; use mountCallback cleanup or the effect helper for resource cleanup. Concurrent rendering changes the commit boundary rather than the meaning of this return value.',
    ko: 'updateCallback의 반환 함수는 그 커밋 뒤에 실행되는 후처리입니다. 언마운트 정리는 mountCallback의 반환값이나 effect 헬퍼로 처리하세요. Concurrent 렌더링은 커밋 경계를 바꾸며 반환값의 의미는 유지합니다.',
  },
  jsx: {
    en: 'Use lithent 1.22.1 or newer for automatic JSX. Dynamic children arrays retain their keyed-list identity, preserving row state and DOM through additions and reordering, including after hydration. With the concurrent core, alias only lithent; keep both JSX runtime subpaths unchanged.',
    ko: '자동 JSX에는 lithent 1.22.1 이상을 사용하세요. 동적 children 배열의 keyed 목록 정보를 유지해 추가·정렬이나 hydration 후 갱신에도 행의 상태와 DOM을 보존합니다. Concurrent 코어에서는 lithent만 alias하고 두 JSX runtime 서브패스는 유지하세요.',
  },
};

export const ConcurrentNote = ({
  kind,
  language,
}: {
  kind: keyof typeof notes;
  language: 'en' | 'ko';
}) => (
  <aside class="my-6 p-4 rounded-r border-l-4 border-[#42b883] bg-[#42b883]/5 text-sm text-gray-700 dark:text-gray-300">
    <p class="mb-3">{notes[kind][language]}</p>
    <a
      class="text-[#42b883] font-medium"
      href="#/guide/concurrent-rendering"
      onClick={(event: Event) => {
        event.preventDefault();
        navigateTo('/guide/concurrent-rendering');
      }}
    >
      {language === 'ko'
        ? 'Concurrent 렌더링 가이드 →'
        : 'Concurrent rendering guide →'}
    </a>
  </aside>
);
