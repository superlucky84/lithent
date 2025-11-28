import { mount } from 'lithent';
import { computed } from 'lithent/helper';
import { Guide } from '@/pages/guide';
import { Install } from '@/pages/install';
import { Examples } from '@/pages/examples';
import { About } from '@/pages/about';
import { Introduction } from '@/pages/Introduction';
import { QuickStart } from '@/pages/QuickStart';
import { Mounter } from '@/pages/Mounter';
import { Updater } from '@/pages/Updater';
import { Renewer } from '@/pages/Renewer';
import { Render } from '@/pages/Render';
import { Portal } from '@/pages/Portal';
import { MountHooks } from '@/pages/MountHooks';
import { UpdateHooks } from '@/pages/UpdateHooks';
import { MountReadyHooks } from '@/pages/MountReadyHooks';
import { appStore } from '@/store';

export const Mainbody = mount(renew => {
  const store = appStore.watch(renew);

  window.addEventListener('popstate', () => {
    store.sidebarOpen = false;
    store.route = location.pathname;
    window.scrollTo(0, 0);
  });

  const matchPath = computed<string>(() => {
    // Getting Started
    if ('/guide/introduction' === store.route) {
      return <Introduction />;
    } else if ('/guide/quick-start' === store.route) {
      return <QuickStart />;
    }
    // Essential Features
    else if ('/guide/mounter' === store.route) {
      return <Mounter />;
    } else if ('/guide/updater' === store.route) {
      return <Updater />;
    } else if ('/guide/renewer' === store.route) {
      return <Renewer />;
    } else if ('/guide/render' === store.route) {
      return <Render />;
    } else if ('/guide/portal' === store.route) {
      return <Portal />;
    } else if ('/guide/mount-hooks' === store.route) {
      return <MountHooks />;
    } else if ('/guide/update-hooks' === store.route) {
      return <UpdateHooks />;
    } else if ('/guide/mount-ready-hooks' === store.route) {
      return <MountReadyHooks />;
    }
    // Others
    else if ('/examples' === store.route) {
      return <Examples />;
    } else if ('/install' === store.route) {
      return <Install />;
    } else if ('/about' === store.route) {
      return <About />;
    }
    return <Guide />;
  });

  return () => <main class="h-full">{matchPath.v}</main>;
});
