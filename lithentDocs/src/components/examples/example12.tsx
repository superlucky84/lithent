import { mount, mountCallback, Fragment, render, ref } from 'lithent';
import { state } from 'lithent/helper';

interface Post {
  id: string;
  author: string;
  avatar: string;
  content: string;
  time: string;
  likes: number;
  type: 'user' | 'trending' | 'sponsored';
}

const newPosts: Post[] = [
  {
    id: 'new1',
    author: 'Sarah Chen',
    avatar: '👩‍💻',
    content:
      'Just shipped a new feature with Lithent! The virtual DOM performance is amazing 🚀',
    time: '2 min ago',
    likes: 42,
    type: 'user',
  },
  {
    id: 'new2',
    author: 'Alex Rivera',
    avatar: '🧑‍🎨',
    content:
      'Hot take: Mixing real DOM and virtual DOM is actually a superpower for progressive enhancement',
    time: '5 min ago',
    likes: 28,
    type: 'trending',
  },
  {
    id: 'new3',
    author: 'Jordan Kim',
    avatar: '🧑‍🚀',
    content:
      'Anyone else loving how lightweight Lithent is? No more bloated bundles!',
    time: '8 min ago',
    likes: 67,
    type: 'user',
  },
];

// 동적 포스트 컴포넌트 (가상 DOM)
const DynamicPosts = mount(r => {
  const visiblePosts = state<boolean[]>([true, true, true], r);

  const togglePost = (index: number) => {
    visiblePosts.v = visiblePosts.v.map((v, i) => (i === index ? !v : v));
  };

  const showAll = () => {
    visiblePosts.v = [true, true, true];
  };

  const hideAll = () => {
    visiblePosts.v = [false, false, false];
  };

  return () => (
    <Fragment>
      {/* 컨트롤 패널 */}
      <div class="sticky top-0 z-10 bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 p-3 mb-3">
        <div class="flex items-center gap-2 mb-2">
          <span class="text-xs font-semibold text-blue-800 dark:text-blue-200">
            🔄 실시간 포스트 (가상 DOM)
          </span>
        </div>
        <div class="flex flex-wrap gap-2">
          <button
            onClick={() => togglePost(0)}
            class={`px-2 py-1 text-xs rounded ${
              visiblePosts.v[0]
                ? 'bg-blue-600 text-white'
                : 'bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300'
            }`}
          >
            Post 1
          </button>
          <button
            onClick={() => togglePost(1)}
            class={`px-2 py-1 text-xs rounded ${
              visiblePosts.v[1]
                ? 'bg-orange-600 text-white'
                : 'bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300'
            }`}
          >
            Post 2 (Trending)
          </button>
          <button
            onClick={() => togglePost(2)}
            class={`px-2 py-1 text-xs rounded ${
              visiblePosts.v[2]
                ? 'bg-blue-600 text-white'
                : 'bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300'
            }`}
          >
            Post 3
          </button>
          <div class="flex-1"></div>
          <button
            onClick={showAll}
            class="px-2 py-1 text-xs rounded bg-green-600 text-white hover:bg-green-700"
          >
            전체 보기
          </button>
          <button
            onClick={hideAll}
            class="px-2 py-1 text-xs rounded bg-red-600 text-white hover:bg-red-700"
          >
            전체 숨기기
          </button>
        </div>
      </div>

      {/* 동적 포스트들 */}
      {visiblePosts.v[0] && (
        <article class="bg-white dark:bg-gray-800 rounded-lg p-4 mb-3 border-l-4 border-blue-500 shadow-sm animate-fade-in">
          <div class="flex items-start gap-3">
            <div class="text-3xl">{newPosts[0].avatar}</div>
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2 mb-1">
                <h4 class="font-semibold text-gray-900 dark:text-white text-sm">
                  {newPosts[0].author}
                </h4>
                <span class="text-xs text-gray-500 dark:text-gray-400">
                  · {newPosts[0].time}
                </span>
                <span class="px-1.5 py-0.5 text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded">
                  가상 DOM
                </span>
              </div>
              <p class="text-sm text-gray-700 dark:text-gray-300 mb-2">
                {newPosts[0].content}
              </p>
              <div class="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                <button class="hover:text-red-500">
                  ❤️ {newPosts[0].likes}
                </button>
                <button class="hover:text-blue-500">💬 Reply</button>
                <button class="hover:text-green-500">🔄 Repost</button>
              </div>
            </div>
          </div>
        </article>
      )}

      {visiblePosts.v[1] && (
        <article class="bg-gradient-to-r from-orange-50 to-yellow-50 dark:from-orange-900/20 dark:to-yellow-900/20 rounded-lg p-4 mb-3 border-l-4 border-orange-500 shadow-sm animate-fade-in">
          <div class="flex items-start gap-3">
            <div class="text-3xl">{newPosts[1].avatar}</div>
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2 mb-1">
                <h4 class="font-semibold text-gray-900 dark:text-white text-sm">
                  {newPosts[1].author}
                </h4>
                <span class="text-xs text-gray-500 dark:text-gray-400">
                  · {newPosts[1].time}
                </span>
                <span class="px-1.5 py-0.5 text-xs bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200 rounded">
                  🔥 Trending
                </span>
                <span class="px-1.5 py-0.5 text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded">
                  가상 DOM
                </span>
              </div>
              <p class="text-sm text-gray-700 dark:text-gray-300 mb-2">
                {newPosts[1].content}
              </p>
              <div class="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                <button class="hover:text-red-500">
                  ❤️ {newPosts[1].likes}
                </button>
                <button class="hover:text-blue-500">💬 Reply</button>
                <button class="hover:text-green-500">🔄 Repost</button>
              </div>
            </div>
          </div>
        </article>
      )}

      {visiblePosts.v[2] && (
        <article class="bg-white dark:bg-gray-800 rounded-lg p-4 mb-3 border-l-4 border-blue-500 shadow-sm animate-fade-in">
          <div class="flex items-start gap-3">
            <div class="text-3xl">{newPosts[2].avatar}</div>
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2 mb-1">
                <h4 class="font-semibold text-gray-900 dark:text-white text-sm">
                  {newPosts[2].author}
                </h4>
                <span class="text-xs text-gray-500 dark:text-gray-400">
                  · {newPosts[2].time}
                </span>
                <span class="px-1.5 py-0.5 text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded">
                  가상 DOM
                </span>
              </div>
              <p class="text-sm text-gray-700 dark:text-gray-300 mb-2">
                {newPosts[2].content}
              </p>
              <div class="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                <button class="hover:text-red-500">
                  ❤️ {newPosts[2].likes}
                </button>
                <button class="hover:text-blue-500">💬 Reply</button>
                <button class="hover:text-green-500">🔄 Repost</button>
              </div>
            </div>
          </div>
        </article>
      )}
    </Fragment>
  );
});

export const Example12 = mount(() => {
  const feedContainer = ref<null | HTMLElement>(null);
  const insertionPoint = ref<null | HTMLElement>(null);

  mountCallback(() => {
    const container = feedContainer.value as HTMLElement;
    const nextElement = insertionPoint.value as HTMLElement;
    render(<DynamicPosts />, container, nextElement);
  });

  return () => (
    <div class="w-full max-w-2xl mx-auto">
      <div class="mb-4">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          📱 Social Media Timeline
        </h3>
        <p class="text-xs text-gray-500 dark:text-gray-400">
          실제 DOM (서버 렌더링)과 가상 DOM (클라이언트 렌더링)이 혼합된
          타임라인
        </p>
      </div>

      <div
        ref={feedContainer}
        class="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 max-h-[600px] overflow-y-auto"
      >
        {/* 상단 고정 포스트 (실제 DOM - SSR) */}
        <article class="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 mb-3 border-l-4 border-purple-500 shadow-sm">
          <div class="flex items-start gap-3">
            <div class="text-3xl">📌</div>
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2 mb-1">
                <h4 class="font-semibold text-gray-900 dark:text-white text-sm">
                  Lithent Team
                </h4>
                <span class="text-xs text-gray-500 dark:text-gray-400">
                  · 1 hour ago
                </span>
                <span class="px-1.5 py-0.5 text-xs bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded">
                  Pinned
                </span>
                <span class="px-1.5 py-0.5 text-xs bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded">
                  실제 DOM
                </span>
              </div>
              <p class="text-sm text-gray-700 dark:text-gray-300 mb-2">
                Welcome to our feed! This post is server-rendered (real DOM) and
                always stays at the top.
              </p>
              <div class="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                <button class="hover:text-red-500">❤️ 156</button>
                <button class="hover:text-blue-500">💬 Reply</button>
              </div>
            </div>
          </div>
        </article>

        <article class="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 mb-3 border-l-4 border-gray-400 shadow-sm">
          <div class="flex items-start gap-3">
            <div class="text-3xl">👤</div>
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2 mb-1">
                <h4 class="font-semibold text-gray-900 dark:text-white text-sm">
                  Previous User
                </h4>
                <span class="text-xs text-gray-500 dark:text-gray-400">
                  · 15 min ago
                </span>
                <span class="px-1.5 py-0.5 text-xs bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded">
                  실제 DOM
                </span>
              </div>
              <p class="text-sm text-gray-700 dark:text-gray-300 mb-2">
                This is an older post that was server-rendered. It's part of the
                initial HTML.
              </p>
              <div class="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                <button class="hover:text-red-500">❤️ 23</button>
                <button class="hover:text-blue-500">💬 Reply</button>
              </div>
            </div>
          </div>
        </article>

        {/*
          여기에 가상 DOM 포스트들이 삽입됩니다!
          render(<DynamicPosts />, feedContainer, insertionPoint)
        */}

        {/* 하단 광고 포스트 (실제 DOM - 항상 고정) */}
        <article
          ref={insertionPoint}
          class="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 mb-3 border-l-4 border-green-500 shadow-sm"
        >
          <div class="flex items-start gap-3">
            <div class="text-3xl">📢</div>
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2 mb-1">
                <h4 class="font-semibold text-gray-900 dark:text-white text-sm">
                  Sponsored
                </h4>
                <span class="text-xs text-gray-500 dark:text-gray-400">
                  · Ad
                </span>
                <span class="px-1.5 py-0.5 text-xs bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded">
                  실제 DOM
                </span>
              </div>
              <p class="text-sm text-gray-700 dark:text-gray-300 mb-2">
                This sponsored post is also real DOM - it stays in place
                regardless of what happens above!
              </p>
              <div class="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                <button class="hover:text-blue-500">Learn More →</button>
              </div>
            </div>
          </div>
        </article>

        <article class="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 border-l-4 border-gray-400 shadow-sm">
          <div class="flex items-start gap-3">
            <div class="text-3xl">📜</div>
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2 mb-1">
                <h4 class="font-semibold text-gray-900 dark:text-white text-sm">
                  Archive
                </h4>
                <span class="text-xs text-gray-500 dark:text-gray-400">
                  · 2 hours ago
                </span>
                <span class="px-1.5 py-0.5 text-xs bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded">
                  실제 DOM
                </span>
              </div>
              <p class="text-sm text-gray-700 dark:text-gray-300 mb-2">
                Older content that's part of the initial page load. Real DOM
                element.
              </p>
              <div class="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                <button class="hover:text-red-500">❤️ 8</button>
                <button class="hover:text-blue-500">💬 Reply</button>
              </div>
            </div>
          </div>
        </article>
      </div>

      <div class="mt-4 p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
        <p class="text-xs text-blue-800 dark:text-blue-200">
          💡 <strong>혼합 DOM 테스트:</strong> 컨트롤 패널의 버튼으로 중간의
          포스트들을 토글하세요. 실제 DOM 요소(상단 Pinned, 하단 Sponsored,
          Archive)는 그대로 유지되고, 그 사이에 가상 DOM 포스트들이 동적으로
          추가/제거됩니다. Lithent가 실제 DOM과 가상 DOM을 올바르게 혼합
          관리하는지 확인하세요!
        </p>
      </div>

      <style>
        {`
          @keyframes fade-in {
            from {
              opacity: 0;
              transform: translateY(-10px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          .animate-fade-in {
            animation: fade-in 0.3s ease-out;
          }
        `}
      </style>
    </div>
  );
});
