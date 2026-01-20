import { mount } from 'lithent';
import { appStore, navigateTo, resolveRouteForLanguage } from '@/store';

interface MenuItem {
  text: { en: string; ko: string };
  link: string;
}

interface MenuSection {
  text: { en: string; ko: string };
  items: MenuItem[];
}

const menuData: MenuSection[] = [
  {
    text: { en: 'Getting Started', ko: '시작하기' },
    items: [
      { text: { en: 'Introduction', ko: '소개' }, link: '/guide/introduction' },
      {
        text: { en: 'Quick Start', ko: '빠른 시작' },
        link: '/guide/quick-start',
      },
      {
        text: { en: 'AI Agent Guide', ko: 'AI 에이전트 가이드' },
        link: '/guide/agent-guide',
      },
    ],
  },
  {
    text: { en: 'Essential Features', ko: '기본 기능' },
    items: [
      { text: { en: 'mount', ko: 'mount' }, link: '/guide/mounter' },
      { text: { en: 'updater', ko: 'updater' }, link: '/guide/updater' },
      { text: { en: 'props', ko: 'props' }, link: '/guide/props' },
      { text: { en: 'children', ko: 'children' }, link: '/guide/children' },
      { text: { en: 'renew', ko: 'renew' }, link: '/guide/renewer' },
      { text: { en: 'render', ko: 'render' }, link: '/guide/render' },
      { text: { en: 'portal', ko: 'portal' }, link: '/guide/portal' },
      {
        text: { en: 'mountCallback', ko: 'mountCallback' },
        link: '/guide/mount-hooks',
      },
      {
        text: { en: 'updateCallback', ko: 'updateCallback' },
        link: '/guide/update-hooks',
      },
      {
        text: { en: 'mountReadyCallback', ko: 'mountReadyCallback' },
        link: '/guide/mount-ready-hooks',
      },
      {
        text: { en: 'useRenew', ko: 'useRenew' },
        link: '/guide/use-renew-hooks',
      },
      { text: { en: 'innerHTML', ko: 'innerHTML' }, link: '/guide/inner-html' },
      { text: { en: 'nextTick', ko: 'nextTick' }, link: '/guide/next-tick' },
      {
        text: { en: 'stateless components', ko: 'stateless components' },
        link: '/guide/stateless',
      },
      { text: { en: 'Fragment', ko: 'Fragment' }, link: '/guide/fragment' },
    ],
  },
  {
    text: { en: 'Helper Features', ko: '헬퍼 기능' },
    items: [
      { text: { en: 'state', ko: 'state' }, link: '/guide/state' },
      { text: { en: 'lstate', ko: 'lstate' }, link: '/guide/lstate' },
      { text: { en: 'computed', ko: 'computed' }, link: '/guide/computed' },
      { text: { en: 'effect', ko: 'effect' }, link: '/guide/effect' },
      { text: { en: 'store', ko: 'store' }, link: '/guide/store' },
      { text: { en: 'lstore', ko: 'lstore' }, link: '/guide/lstore' },
      { text: { en: 'context', ko: 'context' }, link: '/guide/context' },
      { text: { en: 'lcontext', ko: 'lcontext' }, link: '/guide/lcontext' },
      {
        text: { en: 'cacheUpdate', ko: 'cacheUpdate' },
        link: '/guide/cache-update',
      },
      { text: { en: 'stateRef', ko: 'stateRef' }, link: '/guide/state-ref' },
    ],
  },
  {
    text: { en: 'JSX & Templates', ko: 'JSX & 템플릿' },
    items: [
      {
        text: { en: 'Vite Plugin', ko: 'Vite 플러그인' },
        link: '/guide/vite-plugin',
      },
      {
        text: { en: 'Manual JSX Setup', ko: '수동 JSX 설정' },
        link: '/guide/jsx-manual',
      },
      { text: { en: 'FTags', ko: 'FTags' }, link: '/guide/ftags' },
      { text: { en: 'HTM Tags', ko: 'HTM Tags' }, link: '/guide/htm-tags' },
      {
        text: { en: 'Template Strings', ko: '템플릿 스트링' },
        link: '/guide/template-strings',
      },
    ],
  },
  {
    text: { en: 'Examples', ko: '예제' },
    items: [
      {
        text: {
          en: 'Computed (Coffee Order Calculator)',
          ko: 'Computed (커피 주문 계산기)',
        },
        link: '/examples/1',
      },
      {
        text: { en: 'Shared Store (helper)', ko: 'Shared Store (helper)' },
        link: '/examples/2',
      },
      {
        text: {
          en: 'Render Props (Mouse tracker)',
          ko: 'Render Props (마우스 트래커)',
        },
        link: '/examples/3',
      },
      {
        text: {
          en: 'Effect Lifecycle (helper)',
          ko: 'Effect Lifecycle (helper)',
        },
        link: '/examples/4',
      },
      {
        text: {
          en: 'Nested Fragments (Notifications)',
          ko: 'Nested Fragments (알림)',
        },
        link: '/examples/5',
      },
      {
        text: {
          en: 'Key-based Lists (Playlist)',
          ko: 'Key-based Lists (재생목록)',
        },
        link: '/examples/6',
      },
      {
        text: {
          en: 'innerHTML (Markdown Editor)',
          ko: 'innerHTML (마크다운 에디터)',
        },
        link: '/examples/7',
      },
      {
        text: {
          en: 'Select Controls (Character)',
          ko: 'Select Controls (캐릭터)',
        },
        link: '/examples/8',
      },
      {
        text: {
          en: 'Input Controls (Business Card)',
          ko: 'Input Controls (명함)',
        },
        link: '/examples/9',
      },
      {
        text: {
          en: 'Checkbox & Radio (Pizza Builder)',
          ko: 'Checkbox & Radio (피자 빌더)',
        },
        link: '/examples/10',
      },
      {
        text: { en: 'Context (Theme & User)', ko: 'Context (테마 & 사용자)' },
        link: '/examples/11',
      },
      {
        text: {
          en: 'Mixed DOM (Social Timeline)',
          ko: 'Mixed DOM (소셜 타임라인)',
        },
        link: '/examples/12',
      },
      {
        text: {
          en: 'Mixed DOM + Loop (Waitlist)',
          ko: 'Mixed DOM + Loop (대기목록)',
        },
        link: '/examples/13',
      },
      {
        text: {
          en: 'Nested Unmount (Game Inventory)',
          ko: 'Nested Unmount (게임 인벤토리)',
        },
        link: '/examples/14',
      },
      {
        text: {
          en: 'Nested Props (Volume Controller)',
          ko: 'Nested Props (볼륨 컨트롤러)',
        },
        link: '/examples/15',
      },
      {
        text: {
          en: 'insertBefore + Destroy (Music Library)',
          ko: 'insertBefore + Destroy (음악 라이브러리)',
        },
        link: '/examples/16',
      },
      {
        text: {
          en: 'SVG Rendering (Traffic Light)',
          ko: 'SVG Rendering (신호등)',
        },
        link: '/examples/17',
      },
      {
        text: {
          en: 'CacheUpdate (Product Filter)',
          ko: 'CacheUpdate (제품 필터)',
        },
        link: '/examples/18',
      },
      {
        text: {
          en: 'FTags CDN (Smart Todo List)',
          ko: 'FTags CDN (스마트 할일 목록)',
        },
        link: '/examples/19',
      },
      {
        text: {
          en: 'Portal (Image Lightbox)',
          ko: 'Portal (이미지 라이트박스)',
        },
        link: '/examples/20',
      },
      {
        text: {
          en: 'HTM Tags CDN (Quick Notes)',
          ko: 'HTM Tags CDN (빠른 메모)',
        },
        link: '/examples/21',
      },
    ],
  },
];

const normalizePath = (path: string) => path.replace(/\/+$/, '') || '/';

export const Sidebar = mount(renew => {
  const store = appStore.watch(renew);
  const expanded: Record<string, boolean> = Object.fromEntries(
    menuData.map(section => [section.text.en, false])
  );
  let prevRoute = ''; // Initialize with empty string to trigger expansion on first load

  const handleClick = (link: string) => {
    const lang = store.route.startsWith('/ko') ? 'ko' : 'en';
    navigateTo(resolveRouteForLanguage(link, lang));
  };

  const toggleSection = (titleKey: string) => {
    expanded[titleKey] = !expanded[titleKey];
    renew();
  };

  return () => {
    const routeChanged = store.route !== prevRoute;
    const normalizedRoute = normalizePath(store.route);
    const currentLang = store.route.startsWith('/ko') ? 'ko' : 'en';
    const toLocalizedLink = (link: string) =>
      normalizePath(resolveRouteForLanguage(link, currentLang));

    // 메인페이지로 이동하면 모든 섹션 닫기
    if (
      routeChanged &&
      (normalizedRoute === '/' || normalizedRoute === '/ko')
    ) {
      menuData.forEach(section => {
        expanded[section.text.en] = false;
      });
    }

    const view = (
      <>
        {/* Mobile overlay */}
        {store.sidebarOpen && (
          <div
            class="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
            onClick={() => {
              store.sidebarOpen = false;
            }}
          />
        )}

        {/* Sidebar */}
        <aside
          class={`
            fixed lg:sticky top-16 left-0 z-40
            w-64 h-[calc(100vh-4rem)] flex-shrink-0
            bg-white dark:bg-[#1b1b1f]
            border-r border-gray-200 dark:border-gray-800
            overflow-y-auto
            transition-transform duration-300
            ${store.sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          `}
        >
          <nav class="pl-6 md:pl-12 pr-3 md:pr-4 py-6">
            {menuData.map(section => {
              const sectionKey = section.text.en;
              if (
                routeChanged &&
                normalizedRoute !== '/' &&
                normalizedRoute !== '/ko'
              ) {
                const hasActive = section.items.some(
                  item => toLocalizedLink(item.link) === normalizedRoute
                );
                if (hasActive) {
                  expanded[sectionKey] = true;
                }
              }

              const isExpanded = expanded[sectionKey];

              return (
                <div class="mb-3">
                  <button
                    class="mb-1 w-full flex items-center justify-between text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider"
                    onClick={() => toggleSection(sectionKey)}
                  >
                    <span>{section.text[currentLang]}</span>
                    <span class="text-base leading-none">
                      {isExpanded ? '▾' : '▸'}
                    </span>
                  </button>
                  <ul
                    class={`
                      space-y-0 overflow-hidden transition-all duration-200 ease-in-out
                      ${isExpanded ? 'max-h-[1200px] opacity-100' : 'max-h-0 opacity-0 pointer-events-none'}
                    `}
                    aria-hidden={!isExpanded}
                  >
                    {section.items.map(item => {
                      const targetLink = resolveRouteForLanguage(
                        item.link,
                        currentLang
                      );
                      const isActive =
                        normalizedRoute === normalizePath(targetLink);
                      return (
                        <li>
                          <a
                            href={targetLink}
                            onClick={(e: Event) => {
                              e.preventDefault();
                              handleClick(item.link);
                            }}
                            class={`
                              block px-2 py-1.5 rounded-md text-sm font-normal transition-colors
                              ${
                                isActive
                                  ? 'text-[#42b883] bg-[#42b883] bg-opacity-10'
                                  : 'text-gray-700 dark:text-gray-300 hover:text-[#42b883] dark:hover:text-[#42b883] hover:bg-gray-100 dark:hover:bg-gray-800'
                              }
                            `}
                          >
                            {item.text[currentLang]}
                          </a>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              );
            })}
          </nav>
        </aside>
      </>
    );

    prevRoute = store.route;
    return view;
  };
});
