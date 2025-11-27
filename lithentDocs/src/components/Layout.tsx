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

        <div class="flex">
          <Sidebar />

          {/* Main Content */}
          <main class="flex-1 lg:ml-64">
            <div class="container mx-auto px-6 py-8 max-w-4xl">
              <CurrentPage />
            </div>
          </main>
        </div>
      </div>
    );
  };
});
