import { mount } from 'lithent';
import { appStore, toggleTheme, navigateTo } from '@/store';

export const Header = mount(renew => {
  const store = appStore.watch(renew);

  return () => (
    <header class="sticky top-0 z-50 w-full border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-[#1b1b1f]">
      <div class="mx-auto max-w-[1440px]">
        <div class="flex h-16">
          {/* Left Area - Responsive Width */}
          <div class="w-auto sm:w-48 lg:w-64 flex-shrink-0 flex items-center px-6 md:px-12">
            {/* Logo and Title */}
            <a
              href="/guide/introduction"
              onClick={(e: Event) => {
                e.preventDefault();
                navigateTo('/guide/introduction');
              }}
              class="flex items-center gap-3"
            >
              <img src="/lithent.png" alt="Lithent" class="w-8 h-8" />
              <span class="font-semibold text-xl text-gray-900 dark:text-white">
                Lithent
              </span>
            </a>
          </div>

          {/* Right Area - Main Content Area */}
          <div class="flex-1 w-full min-w-0 px-6 md:px-12">
            <div class="max-w-full md:max-w-[43rem] flex items-center justify-end h-16">
              {/* Main Navigation */}
              <nav class="hidden md:flex items-center gap-6">
                <a
                  href="/guide/introduction"
                  onClick={(e: Event) => {
                    e.preventDefault();
                    navigateTo('/guide/introduction');
                  }}
                  class="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-[#42b883] dark:hover:text-[#42b883] transition-colors"
                >
                  Guide
                </a>
                <a
                  href="https://github.com/superlucky84/lithent"
                  target="_blank"
                  rel="noopener"
                  class="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-[#42b883] dark:hover:text-[#42b883] transition-colors"
                >
                  GitHub
                </a>
              </nav>

              {/* Dark Mode Toggle Switch - Vue Style - Hidden on very small screens */}
              <button
                onClick={toggleTheme}
                class="hidden sm:inline-flex ml-6 relative items-center h-9 w-16 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#42b883] focus:ring-offset-2 bg-gray-200 dark:bg-gray-700"
                aria-label="Toggle dark mode"
                title={
                  store.theme === 'light'
                    ? 'Switch to dark mode'
                    : 'Switch to light mode'
                }
              >
                {/* Toggle Circle */}
                <span
                  class={`inline-block h-7 w-7 transform rounded-full bg-white shadow-lg transition-transform duration-200 ease-in-out ${
                    store.theme === 'dark' ? 'translate-x-8' : 'translate-x-1'
                  }`}
                >
                  {/* Icon inside circle */}
                  <span class="flex items-center justify-center h-full">
                    {store.theme === 'light' ? (
                      <svg
                        class="w-4 h-4 text-gray-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                        />
                      </svg>
                    ) : (
                      <svg
                        class="w-4 h-4 text-gray-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                        />
                      </svg>
                    )}
                  </span>
                </span>
              </button>

              {/* Mobile menu toggle - Only show on mobile/tablet */}
              <button
                class="lg:hidden hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md p-2 ml-4"
                onClick={() => {
                  store.sidebarOpen = !store.sidebarOpen;
                }}
                aria-label="Toggle sidebar"
              >
                <svg
                  class="w-6 h-6 text-gray-600 dark:text-gray-300"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
});
