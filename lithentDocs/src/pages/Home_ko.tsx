import { mount, ref } from 'lithent';
import { state } from 'lithent/helper';
import { navigateTo } from '@/store';

interface MenuItem {
  text: string;
  link: string;
}

interface ExampleItem {
  text: string;
  link: string;
  description: string;
}

interface Category {
  title: string;
  description: string;
  icon: string;
  items: MenuItem[];
}

interface CategoryTheme {
  gradient: string;
  borderColor: string;
  hoverBorder: string;
  tagBg: string;
  tagHover: string;
  textColor: string;
}

interface CategoryWithTheme extends Category {
  theme: CategoryTheme;
}

const categories: CategoryWithTheme[] = [
  {
    title: 'Getting Started',
    description: 'Lithent를 시작하기 위한 기본 가이드',
    icon: '🚀',
    theme: {
      gradient:
        'from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20',
      borderColor: 'border-blue-200 dark:border-blue-800',
      hoverBorder: 'hover:border-blue-400 dark:hover:border-blue-600',
      tagBg: 'bg-blue-100 dark:bg-blue-900/40',
      tagHover: 'hover:bg-blue-200 dark:hover:bg-blue-800/60',
      textColor: 'text-blue-900 dark:text-blue-100',
    },
    items: [
      { text: 'Introduction', link: '/guide/introduction' },
      { text: 'Quick Start', link: '/guide/quick-start' },
    ],
  },
  {
    title: 'Essential Features',
    description: 'Lithent의 기본 기능',
    icon: '⚡',
    theme: {
      gradient:
        'from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20',
      borderColor: 'border-green-200 dark:border-green-800',
      hoverBorder: 'hover:border-green-400 dark:hover:border-green-600',
      tagBg: 'bg-green-100 dark:bg-green-900/40',
      tagHover: 'hover:bg-green-200 dark:hover:bg-green-800/60',
      textColor: 'text-green-900 dark:text-green-100',
    },
    items: [
      { text: 'mount', link: '/guide/mounter' },
      { text: 'updater', link: '/guide/updater' },
      { text: 'props', link: '/guide/props' },
      { text: 'children', link: '/guide/children' },
      { text: 'renew', link: '/guide/renewer' },
      { text: 'render', link: '/guide/render' },
      { text: 'portal', link: '/guide/portal' },
      { text: 'mountCallback', link: '/guide/mount-hooks' },
      { text: 'updateCallback', link: '/guide/update-hooks' },
      { text: 'mountReadyCallback', link: '/guide/mount-ready-hooks' },
      { text: 'useRenew', link: '/guide/use-renew-hooks' },
      { text: 'innerHTML', link: '/guide/inner-html' },
      { text: 'nextTick', link: '/guide/next-tick' },
      { text: 'stateless components', link: '/guide/stateless' },
    ],
  },
  {
    title: 'Helper Features',
    description: '선택적으로 사용할 수 있는 헬퍼 기능',
    icon: '🔧',
    theme: {
      gradient:
        'from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20',
      borderColor: 'border-purple-200 dark:border-purple-800',
      hoverBorder: 'hover:border-purple-400 dark:hover:border-purple-600',
      tagBg: 'bg-purple-100 dark:bg-purple-900/40',
      tagHover: 'hover:bg-purple-200 dark:hover:bg-purple-800/60',
      textColor: 'text-purple-900 dark:text-purple-100',
    },
    items: [
      { text: 'state', link: '/guide/state' },
      { text: 'lstate', link: '/guide/lstate' },
      { text: 'computed', link: '/guide/computed' },
      { text: 'effect', link: '/guide/effect' },
      { text: 'store', link: '/guide/store' },
      { text: 'lstore', link: '/guide/lstore' },
      { text: 'context', link: '/guide/context' },
      { text: 'lcontext', link: '/guide/lcontext' },
      { text: 'cacheUpdate', link: '/guide/cache-update' },
      { text: 'stateRef', link: '/guide/state-ref' },
    ],
  },
  {
    title: 'JSX & Templates',
    description: '다양한 템플릿 방식 지원',
    icon: '📝',
    theme: {
      gradient:
        'from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20',
      borderColor: 'border-orange-200 dark:border-orange-800',
      hoverBorder: 'hover:border-orange-400 dark:hover:border-orange-600',
      tagBg: 'bg-orange-100 dark:bg-orange-900/40',
      tagHover: 'hover:bg-orange-200 dark:hover:bg-orange-800/60',
      textColor: 'text-orange-900 dark:text-orange-100',
    },
    items: [
      { text: 'Vite Plugin', link: '/guide/vite-plugin' },
      { text: 'Manual JSX Setup', link: '/guide/jsx-manual' },
      { text: 'FTags', link: '/guide/ftags' },
      { text: 'HTM Tags', link: '/guide/htm-tags' },
      { text: 'Template Strings', link: '/guide/template-strings' },
    ],
  },
];

const examples: ExampleItem[] = [
  {
    text: 'Computed (커피 주문 계산기)',
    link: '/examples/1',
    description: 'computed로 여러 state에서 자동 계산되는 파생 값 관리',
  },
  {
    text: 'Shared Store (helper)',
    link: '/examples/2',
    description: '전역 store로 여러 컴포넌트 간 상태 공유',
  },
  {
    text: 'Render Props (Mouse tracker)',
    link: '/examples/3',
    description: 'render props 패턴으로 재사용 가능한 로직 구현',
  },
  {
    text: 'Effect Lifecycle (helper)',
    link: '/examples/4',
    description: 'effect로 상태 변경 시 사이드 이펙트 실행',
  },
  {
    text: 'Nested Fragments (Notifications)',
    link: '/examples/5',
    description: '중첩된 Fragment로 복잡한 DOM 구조 관리',
  },
  {
    text: 'Key-based Lists (Playlist)',
    link: '/examples/6',
    description: 'key 기반 리스트 렌더링으로 효율적인 업데이트',
  },
  {
    text: 'innerHTML (Markdown Editor)',
    link: '/examples/7',
    description: 'innerHTML로 동적 HTML 콘텐츠 렌더링',
  },
  {
    text: 'Select Controls (Character)',
    link: '/examples/8',
    description: 'select 입력 제어와 상태 동기화',
  },
  {
    text: 'Input Controls (Business Card)',
    link: '/examples/9',
    description: 'input 필드 제어와 양방향 데이터 바인딩',
  },
  {
    text: 'Checkbox & Radio (Pizza Builder)',
    link: '/examples/10',
    description: 'checkbox와 radio 입력 제어',
  },
  {
    text: 'Context (Theme & User)',
    link: '/examples/11',
    description: 'Context로 user/theme/accent를 트리 전체에서 공유',
  },
  {
    text: 'Mixed DOM (Social Timeline)',
    link: '/examples/12',
    description: '가상 DOM과 실제 DOM을 혼합 사용',
  },
  {
    text: 'Mixed DOM + Loop (Waitlist)',
    link: '/examples/13',
    description: '반복문과 혼합 DOM 패턴 활용',
  },
  {
    text: 'Nested Unmount (Game Inventory)',
    link: '/examples/14',
    description: '중첩된 컴포넌트의 unmount 생명주기 관리',
  },
  {
    text: 'Nested Props (Volume Controller)',
    link: '/examples/15',
    description: '중첩 컴포넌트에 props 전달',
  },
  {
    text: 'insertBefore + Destroy (Music Library)',
    link: '/examples/16',
    description: 'DOM 삽입 위치 제어와 컴포넌트 제거',
  },
  {
    text: 'SVG Rendering (Traffic Light)',
    link: '/examples/17',
    description: 'SVG 요소 동적 렌더링',
  },
  {
    text: 'CacheUpdate (Product Filter)',
    link: '/examples/18',
    description: 'cacheUpdate로 여러 상태 변경을 한 번에 반영',
  },
  {
    text: 'FTags CDN (Smart Todo List)',
    link: '/examples/19',
    description: 'FTags로 빌드 없이 CDN만으로 앱 구현',
  },
  {
    text: 'Portal (이미지 라이트박스)',
    link: '/examples/20',
    description: 'portal로 다른 DOM 위치에 컴포넌트 렌더링',
  },
  {
    text: 'HTM Tags CDN (Quick Notes)',
    link: '/examples/21',
    description:
      'HTM Tags와 Import Maps, Lithent Light API를 사용해 CDN만으로 완전한 메모 앱 구현',
  },
];

export const HomeKo = mount(renew => {
  const examplesExpanded = state(false, renew);
  const examplesSectionRef = ref<HTMLElement | null>(null);

  const handleNavigation = (link: string) => {
    navigateTo(link);
  };

  const toggleExamples = () => {
    examplesExpanded.v = !examplesExpanded.v;

    // 열렸을 때 스크롤
    if (examplesExpanded.v) {
      setTimeout(() => {
        if (examplesSectionRef.value) {
          examplesSectionRef.value.scrollIntoView({
            behavior: 'smooth',
            block: 'start',
          });
        }
      }, 200);
    }
  };

  return () => (
    <div>
      {/* Hero Section */}
      <div class="mb-12">
        <h1 class="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
          Lithent Documentation
        </h1>
        <p class="text-lg text-gray-600 dark:text-gray-400">
          친숙한 클로저 패턴을 사용하여 예측 가능하고 가벼운 UI를 만드는
          JavaScript 라이브러리
        </p>
      </div>

      {/* Categories */}
      <div class="space-y-6 mb-12">
        {categories.map(category => (
          <div
            key={category.title}
            class={`bg-gradient-to-r ${category.theme.gradient} rounded-lg border ${category.theme.borderColor} ${category.theme.hoverBorder} p-6 transition-all hover:shadow-xl`}
          >
            <div class="flex items-start gap-4 mb-4">
              <span class="text-4xl flex-shrink-0">{category.icon}</span>
              <div class="flex-1">
                <h2
                  class={`text-2xl font-bold ${category.theme.textColor} mb-2`}
                >
                  {category.title}
                </h2>
                <p class="text-sm text-gray-700 dark:text-gray-300">
                  {category.description}
                </p>
              </div>
            </div>
            <div class="flex flex-wrap gap-2">
              {category.items.map(item => (
                <a
                  key={item.link}
                  href={item.link}
                  onClick={(e: Event) => {
                    e.preventDefault();
                    handleNavigation(item.link);
                  }}
                  class={`inline-flex items-center px-3 py-1.5 rounded-md text-sm font-medium ${category.theme.tagBg} ${category.theme.tagHover} ${category.theme.textColor} transition-all hover:shadow-md`}
                >
                  {item.text}
                </a>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Examples Section */}
      <div
        ref={examplesSectionRef}
        class="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-lg border border-indigo-200 dark:border-indigo-800 hover:border-indigo-400 dark:hover:border-indigo-600 p-6 transition-all hover:shadow-lg"
      >
        <button
          onClick={toggleExamples}
          class="w-full flex items-center justify-between mb-4 group"
        >
          <div class="flex items-start gap-4">
            <span class="text-4xl flex-shrink-0">💡</span>
            <div class="flex-1 text-left">
              <h2 class="text-2xl font-bold text-indigo-900 dark:text-indigo-100 mb-2">
                Examples
              </h2>
              {!examplesExpanded.v && (
                <p class="text-sm text-gray-700 dark:text-gray-300">
                  {examples.length}개의 실용적인 예제를 확인해보세요
                </p>
              )}
            </div>
          </div>
          <span
            class={`text-2xl text-indigo-600 dark:text-indigo-400 transition-transform duration-200 ${
              examplesExpanded.v ? 'rotate-90' : ''
            }`}
          >
            ▸
          </span>
        </button>

        <div
          class={`grid grid-cols-1 md:grid-cols-2 gap-3 overflow-hidden transition-all duration-300 ease-in-out ${
            examplesExpanded.v
              ? 'max-h-[3000px] opacity-100 mt-4'
              : 'max-h-0 opacity-0'
          }`}
        >
          {examples.map(example => (
            <a
              key={example.link}
              href={example.link}
              onClick={(e: Event) => {
                e.preventDefault();
                handleNavigation(example.link);
              }}
              class="bg-white dark:bg-indigo-950/30 rounded-lg border border-indigo-200 dark:border-indigo-800 p-4 hover:border-indigo-400 dark:hover:border-indigo-600 transition-all hover:shadow-lg"
            >
              <div class="text-sm font-semibold text-indigo-900 dark:text-indigo-100 mb-1.5">
                {example.text}
              </div>
              <div class="text-xs text-gray-700 dark:text-gray-300 leading-relaxed">
                {example.description}
              </div>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
});
