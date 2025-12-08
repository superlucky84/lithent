import { mount } from 'lithent';
import { state } from 'lithent/helper';

interface BusinessCard {
  name: string;
  title: string;
  company: string;
  email: string;
  phone: string;
  website: string;
  bio: string;
  theme: 'modern' | 'classic' | 'minimal' | 'vibrant';
}

const themes = {
  modern: {
    gradient: 'bg-gradient-to-br from-blue-500 to-purple-600',
    text: 'text-white',
    accent: 'text-blue-100',
  },
  classic: {
    gradient: 'bg-gradient-to-br from-gray-800 to-gray-900',
    text: 'text-white',
    accent: 'text-gray-300',
  },
  minimal: {
    gradient: 'bg-white dark:bg-gray-100',
    text: 'text-gray-900',
    accent: 'text-gray-600',
  },
  vibrant: {
    gradient: 'bg-gradient-to-br from-pink-500 to-orange-500',
    text: 'text-white',
    accent: 'text-pink-100',
  },
};

const templates = {
  developer: {
    name: 'Alex Johnson',
    title: 'Full Stack Developer',
    company: 'TechCorp Inc.',
    email: 'alex@techcorp.com',
    phone: '+1 (555) 123-4567',
    website: 'alexjohnson.dev',
    bio: 'Passionate about building scalable web applications with modern technologies.',
    theme: 'modern' as const,
  },
  designer: {
    name: 'Sarah Lee',
    title: 'Creative Director',
    company: 'Design Studio',
    email: 'sarah@designstudio.io',
    phone: '+1 (555) 234-5678',
    website: 'sarahlee.design',
    bio: 'Creating beautiful and intuitive user experiences.',
    theme: 'vibrant' as const,
  },
  entrepreneur: {
    name: 'Michael Chen',
    title: 'CEO & Founder',
    company: 'StartupXYZ',
    email: 'michael@startupxyz.com',
    phone: '+1 (555) 345-6789',
    website: 'startupxyz.com',
    bio: 'Building the future of technology, one startup at a time.',
    theme: 'classic' as const,
  },
};

export const Example9 = mount(r => {
  const card = state<BusinessCard>(
    {
      name: 'Your Name',
      title: 'Your Title',
      company: 'Your Company',
      email: 'email@example.com',
      phone: '+1 (555) 000-0000',
      website: 'yourwebsite.com',
      bio: 'Write a short bio about yourself...',
      theme: 'modern',
    },
    r
  );

  const updateField = (field: keyof BusinessCard, value: string) => {
    card.v = { ...card.v, [field]: value };
  };

  const loadTemplate = (template: keyof typeof templates) => {
    card.v = { ...templates[template] };
  };

  const resetCard = () => {
    card.v = {
      name: '',
      title: '',
      company: '',
      email: '',
      phone: '',
      website: '',
      bio: '',
      theme: 'modern',
    };
  };

  const exportCard = () => {
    const json = JSON.stringify(card.v, null, 2);
    navigator.clipboard.writeText(json);
    alert('Business card data has been copied to the clipboard!');
  };

  return () => {
    const currentTheme = themes[card.v.theme];

    return (
      <div class="w-full max-w-5xl mx-auto">
        <div class="mb-4">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            💼 Business Card Generator
          </h3>
          <p class="text-xs text-gray-500 dark:text-gray-400">
            Create your digital business card with live preview
          </p>
        </div>

        {/* Template & Action Buttons */}
        <div class="flex flex-wrap gap-2 mb-4">
          <button
            onClick={() => loadTemplate('developer')}
            class="px-3 py-1.5 text-xs font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 transition-colors"
          >
            👨‍💻 Developer
          </button>
          <button
            onClick={() => loadTemplate('designer')}
            class="px-3 py-1.5 text-xs font-medium rounded-lg text-white bg-pink-600 hover:bg-pink-700 transition-colors"
          >
            🎨 Designer
          </button>
          <button
            onClick={() => loadTemplate('entrepreneur')}
            class="px-3 py-1.5 text-xs font-medium rounded-lg text-white bg-gray-700 hover:bg-gray-800 transition-colors"
          >
            🚀 Entrepreneur
          </button>
          <button
            onClick={resetCard}
            class="px-3 py-1.5 text-xs font-medium rounded-lg text-white bg-orange-600 hover:bg-orange-700 transition-colors"
          >
            🔄 Reset
          </button>
          <button
            onClick={exportCard}
            class="px-3 py-1.5 text-xs font-medium rounded-lg text-gray-700 dark:text-gray-200 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          >
            📋 Export
          </button>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Business Card Preview */}
          <div class="order-2 lg:order-1">
            <h4 class="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
              Card Preview
            </h4>
            <div class="aspect-[1.6/1] max-w-md mx-auto">
              <div
                class={`w-full h-full rounded-2xl shadow-2xl p-8 flex flex-col justify-between ${currentTheme.gradient}`}
              >
                <div>
                  <h2
                    class={`text-2xl font-bold mb-1 ${currentTheme.text} truncate`}
                  >
                    {card.v.name || 'Your Name'}
                  </h2>
                  <p class={`text-sm ${currentTheme.accent} truncate`}>
                    {card.v.title || 'Your Title'}
                  </p>
                  <p
                    class={`text-sm font-medium ${currentTheme.text} truncate`}
                  >
                    {card.v.company || 'Your Company'}
                  </p>
                </div>

                <div class={`text-xs ${currentTheme.accent} space-y-1`}>
                  <p class="truncate">
                    📧 {card.v.email || 'email@example.com'}
                  </p>
                  <p class="truncate">
                    📱 {card.v.phone || '+1 (555) 000-0000'}
                  </p>
                  <p class="truncate">
                    🌐 {card.v.website || 'yourwebsite.com'}
                  </p>
                </div>

                <div
                  class={`text-xs ${currentTheme.text} opacity-90 line-clamp-2`}
                >
                  {card.v.bio || 'Write a short bio...'}
                </div>
              </div>
            </div>
            <div class="mt-3 text-xs text-gray-500 dark:text-gray-400 text-center">
              💡 Input fields update the card in real time.
            </div>
          </div>

          {/* Input Fields */}
          <div class="order-1 lg:order-2 space-y-3">
            <h4 class="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
              Card Information
            </h4>

            {/* Name */}
            <div>
              <label class="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                Full Name
              </label>
              <input
                type="text"
                value={card.v.name}
                onInput={(e: Event) =>
                  updateField('name', (e.target as HTMLInputElement).value)
                }
                placeholder="Enter your name"
                class="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-[#42b883]"
              />
            </div>

            {/* Title */}
            <div>
              <label class="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                Job Title
              </label>
              <input
                type="text"
                value={card.v.title}
                onInput={(e: Event) =>
                  updateField('title', (e.target as HTMLInputElement).value)
                }
                placeholder="Enter your job title"
                class="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-[#42b883]"
              />
            </div>

            {/* Company */}
            <div>
              <label class="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                Company
              </label>
              <input
                type="text"
                value={card.v.company}
                onInput={(e: Event) =>
                  updateField('company', (e.target as HTMLInputElement).value)
                }
                placeholder="Enter your company name"
                class="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-[#42b883]"
              />
            </div>

            {/* Email */}
            <div>
              <label class="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                Email
              </label>
              <input
                type="email"
                value={card.v.email}
                onInput={(e: Event) =>
                  updateField('email', (e.target as HTMLInputElement).value)
                }
                placeholder="your@email.com"
                class="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-[#42b883]"
              />
            </div>

            {/* Phone */}
            <div>
              <label class="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                Phone
              </label>
              <input
                type="tel"
                value={card.v.phone}
                onInput={(e: Event) =>
                  updateField('phone', (e.target as HTMLInputElement).value)
                }
                placeholder="+1 (555) 000-0000"
                class="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-[#42b883]"
              />
            </div>

            {/* Website */}
            <div>
              <label class="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                Website
              </label>
              <input
                type="url"
                value={card.v.website}
                onInput={(e: Event) =>
                  updateField('website', (e.target as HTMLInputElement).value)
                }
                placeholder="yourwebsite.com"
                class="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-[#42b883]"
              />
            </div>

            {/* Bio */}
            <div>
              <label class="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                Bio (Short Description)
              </label>
              <textarea
                value={card.v.bio}
                onInput={(e: Event) =>
                  updateField('bio', (e.target as HTMLTextAreaElement).value)
                }
                placeholder="Write a short bio..."
                rows={3}
                class="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-[#42b883] resize-none"
              />
            </div>

            {/* Theme */}
            <div>
              <label class="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                Card Theme
              </label>
              <div class="grid grid-cols-2 gap-2">
                <button
                  onClick={() => updateField('theme', 'modern')}
                  class={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                    card.v.theme === 'modern'
                      ? 'bg-blue-600 text-white ring-2 ring-blue-400'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  Modern
                </button>
                <button
                  onClick={() => updateField('theme', 'classic')}
                  class={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                    card.v.theme === 'classic'
                      ? 'bg-gray-800 text-white ring-2 ring-gray-600'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  Classic
                </button>
                <button
                  onClick={() => updateField('theme', 'minimal')}
                  class={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                    card.v.theme === 'minimal'
                      ? 'bg-white text-gray-900 ring-2 ring-gray-400'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  Minimal
                </button>
                <button
                  onClick={() => updateField('theme', 'vibrant')}
                  class={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                    card.v.theme === 'vibrant'
                      ? 'bg-pink-600 text-white ring-2 ring-pink-400'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  Vibrant
                </button>
              </div>
            </div>
          </div>
        </div>

        <div class="mt-4 p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
          <p class="text-xs text-blue-800 dark:text-blue-200">
            💡 <strong>Checking input behavior:</strong> when you type into any
            field, the <code>onInput</code> event fires and Lithent detects the
            new value, updating the business card preview immediately. Verify
            that two-way binding via the <code>value</code> attribute works as
            expected.
          </p>
        </div>
      </div>
    );
  };
});
