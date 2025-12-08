import { mount } from 'lithent';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { appStore } from '@/store';
import { Home } from '@/pages/Home';
import { Introduction } from '@/pages/Introduction';
import { QuickStart } from '@/pages/QuickStart';
import { Mounter } from '@/pages/Mounter';
import { Updater } from '@/pages/Updater';
import { Props } from '@/pages/Props';
import { Children } from '@/pages/Children';
import { Renewer } from '@/pages/Renewer';
import { Render } from '@/pages/Render';
import { Portal } from '@/pages/Portal';
import { MountHooks } from '@/pages/MountHooks';
import { MountHooksKo } from '@/pages/MountHooks_ko';
import { UpdateHooks } from '@/pages/UpdateHooks';
import { MountReadyHooks } from '@/pages/MountReadyHooks';
import { UseRenewHooks } from '@/pages/UseRenewHooks';
import { State } from '@/pages/State';
import { Lstate } from '@/pages/Lstate';
import { Computed } from '@/pages/Computed';
import { Effect } from '@/pages/Effect';
import { Store } from '@/pages/Store';
import { Lstore } from '@/pages/Lstore';
import { StateRef } from '@/pages/StateRef';
import { Context } from '@/pages/Context';
import { LContext } from '@/pages/LContext';
import { CacheUpdate } from '@/pages/CacheUpdate';
import { NextTick } from '@/pages/NextTick';
import { VitePlugin } from '@/pages/VitePlugin';
import { ManualJSX } from '@/pages/ManualJSX';
import { FTags } from '@/pages/FTags';
import { HtmTags } from '@/pages/HtmTags';
import { TemplateStrings } from '@/pages/TemplateStrings';
import { Stateless } from '@/pages/Stateless';
import { Example1Page } from '@/pages/Example1';
import { Example2Page } from '@/pages/Example2';
import { Example3Page } from '@/pages/Example3';
import { Example4Page } from '@/pages/Example4';
import { Example5Page } from '@/pages/Example5';
import { Example6Page } from '@/pages/Example6';
import { Example7Page } from '@/pages/Example7';
import { Example8Page } from '@/pages/Example8';
import { Example9Page } from '@/pages/Example9';
import { Example10Page } from '@/pages/Example10';
import { Example11Page } from '@/pages/Example11';
import { Example12Page } from '@/pages/Example12';
import { Example13Page } from '@/pages/Example13';
import { Example14Page } from '@/pages/Example14';
import { Example15Page } from '@/pages/Example15';
import { Example16Page } from '@/pages/Example16';
import { Example17Page } from '@/pages/Example17';
import { Example18Page } from '@/pages/Example18';
import { Example19Page } from '@/pages/Example19';
import { Example20Page } from '@/pages/Example20';
import { IntroductionKo } from '@/pages/Introduction_ko';
import { QuickStartKo } from '@/pages/QuickStart_ko';
import { MounterKo } from '@/pages/Mounter_ko';
import { UpdaterKo } from '@/pages/Updater_ko';
import { PropsKo } from '@/pages/Props_ko';
import { ChildrenKo } from '@/pages/Children_ko';
import { RenewerKo } from '@/pages/Renewer_ko';
import { RenderKo } from '@/pages/Render_ko';
import { PortalKo } from '@/pages/Portal_ko';

type PageComponent =
  | ((...args: any[]) => ReturnType<typeof Introduction>)
  | ((...args: any[]) => any);

const normalizeRoute = (path: string) => {
  const cleaned = path.replace(/\/+$/, '');
  return cleaned || '/';
};

// Route configuration
const routes: Record<string, PageComponent> = {
  '/': Home,
  '/guide/introduction': Introduction,
  '/ko/guide/introduction': IntroductionKo,
  '/guide/quick-start': QuickStart,
  '/ko/guide/quick-start': QuickStartKo,
  '/guide/mounter': Mounter,
  '/ko/guide/mounter': MounterKo,
  '/guide/updater': Updater,
  '/ko/guide/updater': UpdaterKo,
  '/guide/props': Props,
  '/ko/guide/props': PropsKo,
  '/guide/children': Children,
  '/ko/guide/children': ChildrenKo,
  '/guide/renewer': Renewer,
  '/ko/guide/renewer': RenewerKo,
  '/guide/render': Render,
  '/ko/guide/render': RenderKo,
  '/guide/portal': Portal,
  '/ko/guide/portal': PortalKo,
  '/guide/next-tick': NextTick,
  '/guide/mount-hooks': MountHooks,
  '/ko/guide/mount-hooks': MountHooksKo,
  '/guide/update-hooks': UpdateHooks,
  '/guide/mount-ready-hooks': MountReadyHooks,
  '/guide/use-renew-hooks': UseRenewHooks,
  '/guide/state': State,
  '/guide/lstate': Lstate,
  '/guide/computed': Computed,
  '/guide/effect': Effect,
  '/guide/store': Store,
  '/guide/lstore': Lstore,
  '/guide/state-ref': StateRef,
  '/guide/context': Context,
  '/guide/lcontext': LContext,
  '/guide/cache-update': CacheUpdate,
  '/guide/vite-plugin': VitePlugin,
  '/guide/jsx-manual': ManualJSX,
  '/guide/ftags': FTags,
  '/guide/htm-tags': HtmTags,
  '/guide/template-strings': TemplateStrings,
  '/guide/stateless': Stateless,
  '/examples/1': Example1Page,
  '/examples/2': Example2Page,
  '/examples/3': Example3Page,
  '/examples/4': Example4Page,
  '/examples/5': Example5Page,
  '/examples/6': Example6Page,
  '/examples/7': Example7Page,
  '/examples/8': Example8Page,
  '/examples/9': Example9Page,
  '/examples/10': Example10Page,
  '/examples/11': Example11Page,
  '/examples/12': Example12Page,
  '/examples/13': Example13Page,
  '/examples/14': Example14Page,
  '/examples/15': Example15Page,
  '/examples/16': Example16Page,
  '/examples/17': Example17Page,
  '/examples/18': Example18Page,
  '/examples/19': Example19Page,
  '/examples/20': Example20Page,
};

const resolveRoute = (path: string): PageComponent => {
  const normalized = normalizeRoute(path);
  const current = routes[normalized];

  if (current) {
    return current;
  }

  if (normalized.startsWith('/ko')) {
    const fallback = normalizeRoute(normalized.replace(/^\/ko/, '') || '/');
    return routes[fallback] || Introduction;
  }

  return Introduction;
};

export const Layout = mount(renew => {
  const store = appStore.watch(renew);

  return () => {
    const CurrentPage = resolveRoute(store.route);

    return (
      <div class="min-h-screen bg-white dark:bg-[#1b1b1f] transition-colors">
        <Header />

        {/* Main Container - centered with max-width */}
        <div class="mx-auto max-w-[1440px]">
          <div class="flex">
            <Sidebar />

            {/* Main Content */}
            <main class="flex-1 w-full min-w-0 px-6 md:px-12 py-8 max-w-full">
              <div class="max-w-full md:max-w-[43rem] page-shell">
                <CurrentPage />
              </div>
            </main>
          </div>
        </div>
      </div>
    );
  };
});
