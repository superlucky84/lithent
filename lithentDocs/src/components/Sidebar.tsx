import { mount } from 'lithent';
import { appStore, navigateTo, resolveRouteForLanguage } from '@/store';

interface MenuItem {
  text: string;
  link: string;
}

interface MenuSection {
  text: string;
  items: MenuItem[];
}

const menuData: MenuSection[] = [
  {
    text: 'Getting Started',
    items: [
      { text: 'Introduction', link: '/guide/introduction' },
      { text: 'Quick Start', link: '/guide/quick-start' },
    ],
  },
  {
    text: 'Essential Features',
    items: [
      { text: 'Mounter', link: '/guide/mounter' },
      { text: 'Updater', link: '/guide/updater' },
      { text: 'Props', link: '/guide/props' },
      { text: 'Children', link: '/guide/children' },
      { text: 'Renewer', link: '/guide/renewer' },
      { text: 'Render', link: '/guide/render' },
      { text: 'Portal', link: '/guide/portal' },
      { text: 'Mount Hooks', link: '/guide/mount-hooks' },
      { text: 'Update Hooks', link: '/guide/update-hooks' },
      { text: 'Mount Ready Hooks', link: '/guide/mount-ready-hooks' },
      { text: 'useRenew Hooks', link: '/guide/use-renew-hooks' },
      { text: 'NextTick', link: '/guide/next-tick' },
      { text: 'Stateless Components', link: '/guide/stateless' },
    ],
  },
  {
    text: 'Helper Features',
    items: [
      { text: 'State', link: '/guide/state' },
      { text: 'Lstate', link: '/guide/lstate' },
      { text: 'Computed', link: '/guide/computed' },
      { text: 'Effect', link: '/guide/effect' },
      { text: 'Store', link: '/guide/store' },
      { text: 'Lstore', link: '/guide/lstore' },
      { text: 'Context', link: '/guide/context' },
      { text: 'LContext', link: '/guide/lcontext' },
      { text: 'CacheUpdate', link: '/guide/cache-update' },
      { text: 'State-Ref', link: '/guide/state-ref' },
    ],
  },
  {
    text: 'JSX & Templates',
    items: [
      { text: 'Vite Plugin', link: '/guide/vite-plugin' },
      { text: 'Manual JSX Setup', link: '/guide/jsx-manual' },
      { text: 'FTags', link: '/guide/ftags' },
      { text: 'HTM Tags', link: '/guide/htm-tags' },
      { text: 'Template Strings', link: '/guide/template-strings' },
    ],
  },
  {
    text: 'Examples',
    items: [
      { text: 'Computed (바나나 칼로리)', link: '/examples/1' },
      { text: 'Shared Store (helper)', link: '/examples/2' },
      { text: 'Render Props (Mouse tracker)', link: '/examples/3' },
      { text: 'Effect Lifecycle (helper)', link: '/examples/4' },
      { text: 'Nested Fragments (Notifications)', link: '/examples/5' },
      { text: 'Key-based Lists (Playlist)', link: '/examples/6' },
      { text: 'innerHTML (Markdown Editor)', link: '/examples/7' },
      { text: 'Select Controls (Character)', link: '/examples/8' },
      { text: 'Input Controls (Business Card)', link: '/examples/9' },
      { text: 'Checkbox & Radio (Pizza Builder)', link: '/examples/10' },
      { text: 'Context (Theme & User)', link: '/examples/11' },
      { text: 'Mixed DOM (Social Timeline)', link: '/examples/12' },
      { text: 'Mixed DOM + Loop (Waitlist)', link: '/examples/13' },
      { text: 'Nested Unmount (Game Inventory)', link: '/examples/14' },
      { text: 'Nested Props (Volume Controller)', link: '/examples/15' },
      { text: 'insertBefore + Destroy (Music Library)', link: '/examples/16' },
      { text: 'SVG Rendering (Traffic Light)', link: '/examples/17' },
      { text: 'CacheUpdate (Product Filter)', link: '/examples/18' },
      { text: 'FTags CDN (Smart Todo List)', link: '/examples/19' },
      { text: 'Portal (이미지 라이트박스)', link: '/examples/20' },
    ],
  },
];

const normalizePath = (path: string) => path.replace(/\/+$/, '') || '/';

export const Sidebar = mount(renew => {
  const store = appStore.watch(renew);
  const expanded: Record<string, boolean> = Object.fromEntries(
    menuData.map(section => [section.text, false])
  );
  let prevRoute = store.route;

  const handleClick = (link: string) => {
    const lang = store.route.startsWith('/ko') ? 'ko' : 'en';
    navigateTo(resolveRouteForLanguage(link, lang));
  };

  const toggleSection = (title: string) => {
    expanded[title] = !expanded[title];
    renew();
  };

  return () => {
    const routeChanged = store.route !== prevRoute;
    const normalizedRoute = normalizePath(store.route);
    const currentLang = store.route.startsWith('/ko') ? 'ko' : 'en';
    const toLocalizedLink = (link: string) =>
      normalizePath(resolveRouteForLanguage(link, currentLang));

    // 메인페이지로 이동하면 모든 섹션 닫기
    if (routeChanged && normalizedRoute === '/') {
      menuData.forEach(section => {
        expanded[section.text] = false;
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
              if (routeChanged && normalizedRoute !== '/') {
                const hasActive = section.items.some(
                  item => toLocalizedLink(item.link) === normalizedRoute
                );
                if (hasActive) {
                  expanded[section.text] = true;
                }
              }

              const isExpanded = expanded[section.text];

              return (
                <div class="mb-3">
                  <button
                    class="mb-1 w-full flex items-center justify-between text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider"
                    onClick={() => toggleSection(section.text)}
                  >
                    <span>{section.text}</span>
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
                            {item.text}
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
