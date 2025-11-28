import { mount } from 'lithent';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { appStore } from '@/store';
import { Introduction } from '@/pages/Introduction';
import { QuickStart } from '@/pages/QuickStart';
import { Mounter } from '@/pages/Mounter';
import { Updater } from '@/pages/Updater';
import { Props } from '@/pages/Props';
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

type PageComponent = () => ReturnType<typeof Introduction>;

// Route configuration
const routes: Record<string, PageComponent> = {
  '/guide/introduction': Introduction,
  '/guide/quick-start': QuickStart,
  '/guide/mounter': Mounter,
  '/guide/updater': Updater,
  '/guide/props': Props,
  '/guide/renewer': Renewer,
  '/guide/render': Render,
  '/guide/portal': Portal,
  '/guide/mount-hooks': MountHooks,
  '/guide/update-hooks': UpdateHooks,
  '/guide/mount-ready-hooks': MountReadyHooks,
  '/guide/use-renew-hooks': UseRenewHooks,
  '/guide/state': State,
  '/guide/lstate': Lstate,
  '/guide/computed': Computed,
  '/guide/effect': Effect,
};

export const Layout = mount(renew => {
  const store = appStore.watch(renew);

  return () => {
    const CurrentPage = routes[store.route] || Introduction;

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
