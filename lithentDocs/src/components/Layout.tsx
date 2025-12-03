import { mount } from 'lithent';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { appStore } from '@/store';
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
import { Example1Page } from '@/pages/Example1';
import { Example2Page } from '@/pages/Example2';
import { Example3Page } from '@/pages/Example3';

const normalizeRoute = (path: string) =>
  path.replace(/\/+$/, '') || '/guide/introduction';

type PageComponent =
  | ((...args: any[]) => ReturnType<typeof Introduction>)
  | ((...args: any[]) => any);

// Route configuration
const routes: Record<string, PageComponent> = {
  '/guide/introduction': Introduction,
  '/guide/quick-start': QuickStart,
  '/guide/mounter': Mounter,
  '/guide/updater': Updater,
  '/guide/props': Props,
  '/guide/children': Children,
  '/guide/renewer': Renewer,
  '/guide/render': Render,
  '/guide/portal': Portal,
  '/guide/next-tick': NextTick,
  '/guide/mount-hooks': MountHooks,
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
  '/examples/1': Example1Page,
  '/examples/2': Example2Page,
  '/examples/3': Example3Page,
};

export const Layout = mount(renew => {
  const store = appStore.watch(renew);

  return () => {
    const normalized = normalizeRoute(store.route);
    const CurrentPage = routes[normalized] || Introduction;

    return (
      <div class="min-h-screen bg-white dark:bg-[#1b1b1f] transition-colors">
        <Header />

        {/* Main Container - centered with max-width */}
        <div class="mx-auto max-w-[1440px]">
          <div class="flex">
            <Sidebar />

            {/* Main Content */}
            <main class="flex-1 w-full min-w-0 px-6 md:px-12 py-8">
              <div class="max-w-full md:max-w-[43rem]">
                <CurrentPage />
              </div>
            </main>
          </div>
        </div>
      </div>
    );
  };
});
