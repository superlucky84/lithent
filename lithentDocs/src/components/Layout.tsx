import { mount } from 'lithent';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { appStore } from '@/store';
import { Introduction } from '@/pages/Introduction';
import { QuickStart } from '@/pages/QuickStart';

type PageComponent = () => ReturnType<typeof Introduction>;

// Route configuration
const routes: Record<string, PageComponent> = {
  '/guide/introduction': Introduction,
  '/guide/quick-start': QuickStart,
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
              <div class="max-w-full md:max-w-[48rem]">
                <CurrentPage />
              </div>
            </main>
          </div>
        </div>
      </div>
    );
  };
});
