import { mount, ref } from 'lithent';
import { state } from 'lithent/helper';
import { navigateTo } from '@/store';

interface MenuItem {
  text: string;
  link: string;
}

interface ExampleItem {
  text: string;
  link: string;
  description: string;
}

interface Category {
  title: string;
  description: string;
  icon: string;
  items: MenuItem[];
}

interface CategoryTheme {
  gradient: string;
  borderColor: string;
  hoverBorder: string;
  tagBg: string;
  tagHover: string;
  textColor: string;
}

interface CategoryWithTheme extends Category {
  theme: CategoryTheme;
}

const categories: CategoryWithTheme[] = [
  {
    title: 'Getting Started',
    description: 'Basic guide to get started with Lithent',
    icon: '🚀',
    theme: {
      gradient:
        'from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20',
      borderColor: 'border-blue-200 dark:border-blue-800',
      hoverBorder: 'hover:border-blue-400 dark:hover:border-blue-600',
      tagBg: 'bg-blue-100 dark:bg-blue-900/40',
      tagHover: 'hover:bg-blue-200 dark:hover:bg-blue-800/60',
      textColor: 'text-blue-900 dark:text-blue-100',
    },
    items: [
      { text: 'Introduction', link: '/guide/introduction' },
      { text: 'Quick Start', link: '/guide/quick-start' },
    ],
  },
  {
    title: 'Essential Features',
    description: 'Core features of Lithent',
    icon: '⚡',
    theme: {
      gradient:
        'from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20',
      borderColor: 'border-green-200 dark:border-green-800',
      hoverBorder: 'hover:border-green-400 dark:hover:border-green-600',
      tagBg: 'bg-green-100 dark:bg-green-900/40',
      tagHover: 'hover:bg-green-200 dark:hover:bg-green-800/60',
      textColor: 'text-green-900 dark:text-green-100',
    },
    items: [
      { text: 'mount', link: '/guide/mounter' },
      { text: 'updater', link: '/guide/updater' },
      { text: 'props', link: '/guide/props' },
      { text: 'children', link: '/guide/children' },
      { text: 'renew', link: '/guide/renewer' },
      { text: 'render', link: '/guide/render' },
      { text: 'portal', link: '/guide/portal' },
      { text: 'mountCallback', link: '/guide/mount-hooks' },
      { text: 'updateCallback', link: '/guide/update-hooks' },
      { text: 'mountReadyCallback', link: '/guide/mount-ready-hooks' },
      { text: 'useRenew', link: '/guide/use-renew-hooks' },
      { text: 'innerHTML', link: '/guide/inner-html' },
      { text: 'nextTick', link: '/guide/next-tick' },
      { text: 'stateless components', link: '/guide/stateless' },
    ],
  },
  {
    title: 'Helper Features',
    description: 'Optional helper features',
    icon: '🔧',
    theme: {
      gradient:
        'from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20',
      borderColor: 'border-purple-200 dark:border-purple-800',
      hoverBorder: 'hover:border-purple-400 dark:hover:border-purple-600',
      tagBg: 'bg-purple-100 dark:bg-purple-900/40',
      tagHover: 'hover:bg-purple-200 dark:hover:bg-purple-800/60',
      textColor: 'text-purple-900 dark:text-purple-100',
    },
    items: [
      { text: 'state', link: '/guide/state' },
      { text: 'lstate', link: '/guide/lstate' },
      { text: 'computed', link: '/guide/computed' },
      { text: 'effect', link: '/guide/effect' },
      { text: 'store', link: '/guide/store' },
      { text: 'lstore', link: '/guide/lstore' },
      { text: 'context', link: '/guide/context' },
      { text: 'lcontext', link: '/guide/lcontext' },
      { text: 'cacheUpdate', link: '/guide/cache-update' },
      { text: 'stateRef', link: '/guide/state-ref' },
    ],
  },
  {
    title: 'JSX & Templates',
    description: 'Support for various template syntaxes',
    icon: '📝',
    theme: {
      gradient:
        'from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20',
      borderColor: 'border-orange-200 dark:border-orange-800',
      hoverBorder: 'hover:border-orange-400 dark:hover:border-orange-600',
      tagBg: 'bg-orange-100 dark:bg-orange-900/40',
      tagHover: 'hover:bg-orange-200 dark:hover:bg-orange-800/60',
      textColor: 'text-orange-900 dark:text-orange-100',
    },
    items: [
      { text: 'Vite Plugin', link: '/guide/vite-plugin' },
      { text: 'Manual JSX Setup', link: '/guide/jsx-manual' },
      { text: 'FTags', link: '/guide/ftags' },
      { text: 'HTM Tags', link: '/guide/htm-tags' },
      { text: 'Template Strings', link: '/guide/template-strings' },
    ],
  },
];

const examples: ExampleItem[] = [
  {
    text: 'Computed (Coffee Order Calculator)',
    link: '/examples/1',
    description:
      'Manage derived values automatically calculated from multiple states using computed',
  },
  {
    text: 'Shared Store (helper)',
    link: '/examples/2',
    description: 'Share state across multiple components with a global store',
  },
  {
    text: 'Render Props (Mouse tracker)',
    link: '/examples/3',
    description: 'Implement reusable logic with the render props pattern',
  },
  {
    text: 'Effect Lifecycle (helper)',
    link: '/examples/4',
    description: 'Execute side effects when state changes using effect',
  },
  {
    text: 'Nested Fragments (Notifications)',
    link: '/examples/5',
    description: 'Manage complex DOM structures with nested Fragments',
  },
  {
    text: 'Key-based Lists (Playlist)',
    link: '/examples/6',
    description: 'Efficient updates with key-based list rendering',
  },
  {
    text: 'innerHTML (Markdown Editor)',
    link: '/examples/7',
    description: 'Render dynamic HTML content with innerHTML',
  },
  {
    text: 'Select Controls (Character)',
    link: '/examples/8',
    description: 'Control select inputs and synchronize state',
  },
  {
    text: 'Input Controls (Business Card)',
    link: '/examples/9',
    description: 'Control input fields with two-way data binding',
  },
  {
    text: 'Checkbox & Radio (Pizza Builder)',
    link: '/examples/10',
    description: 'Control checkbox and radio inputs',
  },
  {
    text: 'Context (Theme & User)',
    link: '/examples/11',
    description: 'Share user/theme/accent across the entire tree with Context',
  },
  {
    text: 'Mixed DOM (Social Timeline)',
    link: '/examples/12',
    description: 'Mix virtual DOM with real DOM',
  },
  {
    text: 'Mixed DOM + Loop (Waitlist)',
    link: '/examples/13',
    description: 'Utilize loops with mixed DOM patterns',
  },
  {
    text: 'Nested Unmount (Game Inventory)',
    link: '/examples/14',
    description: 'Manage unmount lifecycle of nested components',
  },
  {
    text: 'Nested Props (Volume Controller)',
    link: '/examples/15',
    description: 'Pass props to nested components',
  },
  {
    text: 'insertBefore + Destroy (Music Library)',
    link: '/examples/16',
    description: 'Control DOM insertion position and component removal',
  },
  {
    text: 'SVG Rendering (Traffic Light)',
    link: '/examples/17',
    description: 'Dynamic SVG element rendering',
  },
  {
    text: 'CacheUpdate (Product Filter)',
    link: '/examples/18',
    description: 'Apply multiple state changes at once with cacheUpdate',
  },
  {
    text: 'FTags CDN (Smart Todo List)',
    link: '/examples/19',
    description: 'Build apps with FTags using only CDN without build tools',
  },
  {
    text: 'Portal (Image Lightbox)',
    link: '/examples/20',
    description: 'Render components in a different DOM location with portal',
  },
  {
    text: 'HTM Tags CDN (Quick Notes)',
    link: '/examples/21',
    description:
      'Build a complete notes app using HTM Tags, Import Maps, and Lithent’s light API with CDN only',
  },
];

export const Home = mount(renew => {
  const examplesExpanded = state(false, renew);
  const examplesSectionRef = ref<HTMLElement | null>(null);

  const handleNavigation = (link: string) => {
    navigateTo(link);
  };

  const toggleExamples = () => {
    examplesExpanded.v = !examplesExpanded.v;

    // Scroll when expanded
    if (examplesExpanded.v) {
      setTimeout(() => {
        if (examplesSectionRef.value) {
          examplesSectionRef.value.scrollIntoView({
            behavior: 'smooth',
            block: 'start',
          });
        }
      }, 200);
    }
  };

  return () => (
    <div>
      {/* Hero Section */}
      <div class="mb-12">
        <h1 class="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
          Lithent Documentation
        </h1>
        <p class="text-lg text-gray-600 dark:text-gray-400">
          A JavaScript library for building predictable and lightweight UIs
          using familiar closure patterns
        </p>
      </div>

      {/* Categories */}
      <div class="space-y-6 mb-12">
        {categories.map(category => (
          <div
            key={category.title}
            class={`bg-gradient-to-r ${category.theme.gradient} rounded-lg border ${category.theme.borderColor} ${category.theme.hoverBorder} p-6 transition-all hover:shadow-xl`}
          >
            <div class="flex items-start gap-4 mb-4">
              <span class="text-4xl flex-shrink-0">{category.icon}</span>
              <div class="flex-1">
                <h2
                  class={`text-2xl font-bold ${category.theme.textColor} mb-2`}
                >
                  {category.title}
                </h2>
                <p class="text-sm text-gray-700 dark:text-gray-300">
                  {category.description}
                </p>
              </div>
            </div>
            <div class="flex flex-wrap gap-2">
              {category.items.map(item => (
                <a
                  key={item.link}
                  href={item.link}
                  onClick={(e: Event) => {
                    e.preventDefault();
                    handleNavigation(item.link);
                  }}
                  class={`inline-flex items-center px-3 py-1.5 rounded-md text-sm font-medium ${category.theme.tagBg} ${category.theme.tagHover} ${category.theme.textColor} transition-all hover:shadow-md`}
                >
                  {item.text}
                </a>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Examples Section */}
      <div
        ref={examplesSectionRef}
        class="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-lg border border-indigo-200 dark:border-indigo-800 hover:border-indigo-400 dark:hover:border-indigo-600 p-6 transition-all hover:shadow-lg"
      >
        <button
          onClick={toggleExamples}
          class="w-full flex items-center justify-between mb-4 group"
        >
          <div class="flex items-start gap-4">
            <span class="text-4xl flex-shrink-0">💡</span>
            <div class="flex-1 text-left">
              <h2 class="text-2xl font-bold text-indigo-900 dark:text-indigo-100 mb-2">
                Examples
              </h2>
              {!examplesExpanded.v && (
                <p class="text-sm text-gray-700 dark:text-gray-300">
                  Explore {examples.length} practical examples
                </p>
              )}
            </div>
          </div>
          <span
            class={`text-2xl text-indigo-600 dark:text-indigo-400 transition-transform duration-200 ${
              examplesExpanded.v ? 'rotate-90' : ''
            }`}
          >
            ▸
          </span>
        </button>

        <div
          class={`grid grid-cols-1 md:grid-cols-2 gap-3 overflow-hidden transition-all duration-300 ease-in-out ${
            examplesExpanded.v
              ? 'max-h-[3000px] opacity-100 mt-4'
              : 'max-h-0 opacity-0'
          }`}
        >
          {examples.map(example => (
            <a
              key={example.link}
              href={example.link}
              onClick={(e: Event) => {
                e.preventDefault();
                handleNavigation(example.link);
              }}
              class="bg-white dark:bg-indigo-950/30 rounded-lg border border-indigo-200 dark:border-indigo-800 p-4 hover:border-indigo-400 dark:hover:border-indigo-600 transition-all hover:shadow-lg"
            >
              <div class="text-sm font-semibold text-indigo-900 dark:text-indigo-100 mb-1.5">
                {example.text}
              </div>
              <div class="text-xs text-gray-700 dark:text-gray-300 leading-relaxed">
                {example.description}
              </div>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
});
