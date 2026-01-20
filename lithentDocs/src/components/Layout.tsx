import { mount } from 'lithent';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { appStore } from '@/store';
import { Home } from '@/pages/Home';
import { HomeKo } from '@/pages/Home_ko';
import { Introduction } from '@/pages/Introduction';
import { QuickStart } from '@/pages/QuickStart';
import { AgentGuide } from '@/pages/AgentGuide';
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
import { UpdateHooksKo } from '@/pages/UpdateHooks_ko';
import { MountReadyHooks } from '@/pages/MountReadyHooks';
import { MountReadyHooksKo } from '@/pages/MountReadyHooks_ko';
import { UseRenewHooks } from '@/pages/UseRenewHooks';
import { UseRenewHooksKo } from '@/pages/UseRenewHooks_ko';
import { State } from '@/pages/State';
import { StateKo } from '@/pages/State_ko';
import { Lstate } from '@/pages/Lstate';
import { LstateKo } from '@/pages/Lstate_ko';
import { Computed } from '@/pages/Computed';
import { ComputedKo } from '@/pages/Computed_ko';
import { Effect } from '@/pages/Effect';
import { EffectKo } from '@/pages/Effect_ko';
import { Store } from '@/pages/Store';
import { StoreKo } from '@/pages/Store_ko';
import { Lstore } from '@/pages/Lstore';
import { LstoreKo } from '@/pages/Lstore_ko';
import { StateRef } from '@/pages/StateRef';
import { StateRefKo } from '@/pages/StateRef_ko';
import { Context } from '@/pages/Context';
import { ContextKo } from '@/pages/Context_ko';
import { LContext } from '@/pages/LContext';
import { LContextKo } from '@/pages/LContext_ko';
import { CacheUpdate } from '@/pages/CacheUpdate';
import { CacheUpdateKo } from '@/pages/CacheUpdate_ko';
import { NextTick } from '@/pages/NextTick';
import { NextTickKo } from '@/pages/NextTick_ko';
import { VitePlugin } from '@/pages/VitePlugin';
import { VitePluginKo } from '@/pages/VitePlugin_ko';
import { ManualJSX } from '@/pages/ManualJSX';
import { ManualJSXKo } from '@/pages/ManualJSX_ko';
import { FTags } from '@/pages/FTags';
import { FTagsKo } from '@/pages/FTags_ko';
import { HtmTags } from '@/pages/HtmTags';
import { HtmTagsKo } from '@/pages/HtmTags_ko';
import { TemplateStrings } from '@/pages/TemplateStrings';
import { TemplateStringsKo } from '@/pages/TemplateStrings_ko';
import { Stateless } from '@/pages/Stateless';
import { StatelessKo } from '@/pages/Stateless_ko';
import { InnerHTML } from '@/pages/InnerHTML';
import { Fragment as FragmentPage } from '@/pages/Fragment';
import { FragmentKo } from '@/pages/Fragment_ko';
import { Example1Page } from '@/pages/Example1';
import { Example1PageKo } from '@/pages/Example1_ko';
import { Example2Page } from '@/pages/Example2';
import { Example2PageKo } from '@/pages/Example2_ko';
import { Example3Page } from '@/pages/Example3';
import { Example3PageKo } from '@/pages/Example3_ko';
import { Example4Page } from '@/pages/Example4';
import { Example4PageKo } from '@/pages/Example4_ko';
import { Example5Page } from '@/pages/Example5';
import { Example5PageKo } from '@/pages/Example5_ko';
import { Example6Page } from '@/pages/Example6';
import { Example6PageKo } from '@/pages/Example6_ko';
import { Example7Page } from '@/pages/Example7';
import { Example7PageKo } from '@/pages/Example7_ko';
import { Example8Page } from '@/pages/Example8';
import { Example8PageKo } from '@/pages/Example8_ko';
import { Example9Page } from '@/pages/Example9';
import { Example9PageKo } from '@/pages/Example9_ko';
import { Example10Page } from '@/pages/Example10';
import { Example10PageKo } from '@/pages/Example10_ko';
import { Example11Page } from '@/pages/Example11';
import { Example11PageKo } from '@/pages/Example11_ko';
import { Example12Page } from '@/pages/Example12';
import { Example12PageKo } from '@/pages/Example12_ko';
import { Example13Page } from '@/pages/Example13';
import { Example13PageKo } from '@/pages/Example13_ko';
import { Example14Page } from '@/pages/Example14';
import { Example14PageKo } from '@/pages/Example14_ko';
import { Example15Page } from '@/pages/Example15';
import { Example15PageKo } from '@/pages/Example15_ko';
import { Example16Page } from '@/pages/Example16';
import { Example16PageKo } from '@/pages/Example16_ko';
import { Example17Page } from '@/pages/Example17';
import { Example17PageKo } from '@/pages/Example17_ko';
import { Example18Page } from '@/pages/Example18';
import { Example18PageKo } from '@/pages/Example18_ko';
import { Example19Page } from '@/pages/Example19';
import { Example19PageKo } from '@/pages/Example19_ko';
import { Example20Page } from '@/pages/Example20';
import { Example20PageKo } from '@/pages/Example20_ko';
import { Example21Page } from '@/pages/Example21';
import { Example21PageKo } from '@/pages/Example21_ko';
import { IntroductionKo } from '@/pages/Introduction_ko';
import { QuickStartKo } from '@/pages/QuickStart_ko';
import { AgentGuideKo } from '@/pages/AgentGuide_ko';
import { MounterKo } from '@/pages/Mounter_ko';
import { UpdaterKo } from '@/pages/Updater_ko';
import { PropsKo } from '@/pages/Props_ko';
import { ChildrenKo } from '@/pages/Children_ko';
import { RenewerKo } from '@/pages/Renewer_ko';
import { RenderKo } from '@/pages/Render_ko';
import { PortalKo } from '@/pages/Portal_ko';
import { InnerHTMLKo } from '@/pages/InnerHTML_ko';

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
  '/ko': HomeKo,
  '/guide/introduction': Introduction,
  '/ko/guide/introduction': IntroductionKo,
  '/guide/quick-start': QuickStart,
  '/ko/guide/quick-start': QuickStartKo,
  '/guide/agent-guide': AgentGuide,
  '/ko/guide/agent-guide': AgentGuideKo,
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
  '/guide/inner-html': InnerHTML,
  '/ko/guide/inner-html': InnerHTMLKo,
  '/guide/next-tick': NextTick,
  '/ko/guide/next-tick': NextTickKo,
  '/guide/mount-hooks': MountHooks,
  '/ko/guide/mount-hooks': MountHooksKo,
  '/guide/update-hooks': UpdateHooks,
  '/ko/guide/update-hooks': UpdateHooksKo,
  '/guide/mount-ready-hooks': MountReadyHooks,
  '/ko/guide/mount-ready-hooks': MountReadyHooksKo,
  '/guide/use-renew-hooks': UseRenewHooks,
  '/ko/guide/use-renew-hooks': UseRenewHooksKo,
  '/guide/state': State,
  '/ko/guide/state': StateKo,
  '/guide/lstate': Lstate,
  '/ko/guide/lstate': LstateKo,
  '/guide/computed': Computed,
  '/ko/guide/computed': ComputedKo,
  '/guide/effect': Effect,
  '/ko/guide/effect': EffectKo,
  '/guide/store': Store,
  '/ko/guide/store': StoreKo,
  '/guide/lstore': Lstore,
  '/ko/guide/lstore': LstoreKo,
  '/guide/state-ref': StateRef,
  '/ko/guide/state-ref': StateRefKo,
  '/guide/context': Context,
  '/ko/guide/context': ContextKo,
  '/guide/lcontext': LContext,
  '/ko/guide/lcontext': LContextKo,
  '/guide/cache-update': CacheUpdate,
  '/ko/guide/cache-update': CacheUpdateKo,
  '/guide/vite-plugin': VitePlugin,
  '/ko/guide/vite-plugin': VitePluginKo,
  '/guide/jsx-manual': ManualJSX,
  '/ko/guide/jsx-manual': ManualJSXKo,
  '/guide/ftags': FTags,
  '/ko/guide/ftags': FTagsKo,
  '/guide/htm-tags': HtmTags,
  '/ko/guide/htm-tags': HtmTagsKo,
  '/guide/template-strings': TemplateStrings,
  '/ko/guide/template-strings': TemplateStringsKo,
  '/guide/stateless': Stateless,
  '/ko/guide/stateless': StatelessKo,
  '/guide/fragment': FragmentPage,
  '/ko/guide/fragment': FragmentKo,
  '/examples/1': Example1Page,
  '/ko/examples/1': Example1PageKo,
  '/examples/2': Example2Page,
  '/ko/examples/2': Example2PageKo,
  '/examples/3': Example3Page,
  '/ko/examples/3': Example3PageKo,
  '/examples/4': Example4Page,
  '/ko/examples/4': Example4PageKo,
  '/examples/5': Example5Page,
  '/ko/examples/5': Example5PageKo,
  '/examples/6': Example6Page,
  '/ko/examples/6': Example6PageKo,
  '/examples/7': Example7Page,
  '/ko/examples/7': Example7PageKo,
  '/examples/8': Example8Page,
  '/ko/examples/8': Example8PageKo,
  '/examples/9': Example9Page,
  '/ko/examples/9': Example9PageKo,
  '/examples/10': Example10Page,
  '/ko/examples/10': Example10PageKo,
  '/examples/11': Example11Page,
  '/ko/examples/11': Example11PageKo,
  '/examples/12': Example12Page,
  '/ko/examples/12': Example12PageKo,
  '/examples/13': Example13Page,
  '/ko/examples/13': Example13PageKo,
  '/examples/14': Example14Page,
  '/ko/examples/14': Example14PageKo,
  '/examples/15': Example15Page,
  '/ko/examples/15': Example15PageKo,
  '/examples/16': Example16Page,
  '/ko/examples/16': Example16PageKo,
  '/examples/17': Example17Page,
  '/ko/examples/17': Example17PageKo,
  '/examples/18': Example18Page,
  '/ko/examples/18': Example18PageKo,
  '/examples/19': Example19Page,
  '/ko/examples/19': Example19PageKo,
  '/examples/20': Example20Page,
  '/ko/examples/20': Example20PageKo,
  '/examples/21': Example21Page,
  '/ko/examples/21': Example21PageKo,
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
