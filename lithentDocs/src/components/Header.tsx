import { mount } from 'lithent';
import { appStore, toggleTheme } from '@/store';

export const Header = mount(renew => {
  const store = appStore.watch(renew);

  return () => (
    <header class="sticky top-0 z-50 w-full border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-[#1b1b1f]">
      <div class="container mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex h-16 items-center justify-between">
          {/* Left: Logo and Title */}
          <div class="flex items-center gap-4">
            {/* Mobile menu toggle */}
            <button
              class="lg:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md"
              onClick={() => {
                store.sidebarOpen = !store.sidebarOpen;
              }}
            >
              <svg
                class="w-6 h-6 text-gray-600 dark:text-gray-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>

            {/* Logo and Title */}
            <a href="#/guide/introduction" class="flex items-center gap-3">
              <img src="/lithent.png" alt="Lithent" class="w-8 h-8" />
              <span class="font-semibold text-xl text-gray-900 dark:text-white">
                Lithent
              </span>
            </a>
          </div>

          {/* Right: Navigation and Dark Mode Toggle */}
          <div class="flex items-center gap-6">
            {/* Main Navigation */}
            <nav class="hidden md:flex items-center gap-6">
              <a
                href="#/guide/introduction"
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

            {/* Dark Mode Toggle */}
            <button
              onClick={toggleTheme}
              class="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors"
              aria-label="Toggle dark mode"
            >
              {store.theme === 'light' ? (
                // Moon icon for light mode (click to go dark)
                <svg
                  class="w-5 h-5 text-gray-600 dark:text-gray-300"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                  />
                </svg>
              ) : (
                // Sun icon for dark mode (click to go light)
                <svg
                  class="w-5 h-5 text-gray-300"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
});
