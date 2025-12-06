import { mount } from 'lithent';
import { state } from 'lithent/helper';

interface Character {
  face: string;
  hair: string;
  eyes: string;
  outfit: string;
  accessory: string;
  background: string;
}

const options = {
  face: [
    { value: '😊', label: '😊 Happy' },
    { value: '😎', label: '😎 Cool' },
    { value: '🤓', label: '🤓 Nerdy' },
    { value: '😴', label: '😴 Sleepy' },
    { value: '🤠', label: '🤠 Cowboy' },
    { value: '🥳', label: '🥳 Party' },
    { value: '😇', label: '😇 Angel' },
    { value: '🤡', label: '🤡 Clown' },
  ],
  hair: [
    { value: '🦰', label: '🦰 Red Hair' },
    { value: '🦱', label: '🦱 Curly' },
    { value: '🦲', label: '🦲 Bald' },
    { value: '🦳', label: '🦳 White' },
    { value: '💇', label: '💇 Haircut' },
    { value: '👨‍🦰', label: '👨‍🦰 Short Red' },
    { value: '👩‍🦱', label: '👩‍🦱 Curly Long' },
    { value: '🧔', label: '🧔 Beard' },
  ],
  eyes: [
    { value: '👀', label: '👀 Normal' },
    { value: '👁️', label: '👁️ Single' },
    { value: '🕶️', label: '🕶️ Sunglasses' },
    { value: '👓', label: '👓 Glasses' },
    { value: '🥽', label: '🥽 Goggles' },
    { value: '😵‍💫', label: '😵‍💫 Dizzy' },
    { value: '🤩', label: '🤩 Star Eyes' },
    { value: '😍', label: '😍 Heart Eyes' },
  ],
  outfit: [
    { value: '👔', label: '👔 Formal' },
    { value: '👕', label: '👕 T-Shirt' },
    { value: '👗', label: '👗 Dress' },
    { value: '👘', label: '👘 Kimono' },
    { value: '🦺', label: '🦺 Safety Vest' },
    { value: '🥼', label: '🥼 Lab Coat' },
    { value: '🎽', label: '🎽 Athletic' },
    { value: '👚', label: '👚 Blouse' },
  ],
  accessory: [
    { value: '🎩', label: '🎩 Top Hat' },
    { value: '👑', label: '👑 Crown' },
    { value: '🎓', label: '🎓 Grad Cap' },
    { value: '⛑️', label: '⛑️ Helmet' },
    { value: '🧢', label: '🧢 Baseball Cap' },
    { value: '💍', label: '💍 Ring' },
    { value: '🎀', label: '🎀 Ribbon' },
    { value: '🎭', label: '🎭 Theater Mask' },
  ],
  background: [
    { value: 'bg-gradient-to-br from-blue-400 to-blue-600', label: '🌊 Ocean' },
    {
      value: 'bg-gradient-to-br from-green-400 to-green-600',
      label: '🌲 Forest',
    },
    {
      value: 'bg-gradient-to-br from-yellow-400 to-orange-500',
      label: '🌅 Sunset',
    },
    {
      value: 'bg-gradient-to-br from-purple-400 to-pink-500',
      label: '🌸 Fantasy',
    },
    { value: 'bg-gradient-to-br from-gray-700 to-gray-900', label: '🌃 Night' },
    { value: 'bg-gradient-to-br from-red-400 to-red-600', label: '🔥 Fire' },
    { value: 'bg-gradient-to-br from-cyan-300 to-blue-400', label: '❄️ Ice' },
    {
      value: 'bg-gradient-to-br from-yellow-200 to-yellow-400',
      label: '☀️ Sunny',
    },
  ],
};

const presets = {
  developer: {
    face: '🤓',
    hair: '🦲',
    eyes: '👓',
    outfit: '👕',
    accessory: '💻',
    background: 'bg-gradient-to-br from-gray-700 to-gray-900',
  },
  pirate: {
    face: '😎',
    hair: '🧔',
    eyes: '🕶️',
    outfit: '🦺',
    accessory: '🎩',
    background: 'bg-gradient-to-br from-blue-400 to-blue-600',
  },
  royalty: {
    face: '😇',
    hair: '👨‍🦰',
    eyes: '👀',
    outfit: '👗',
    accessory: '👑',
    background: 'bg-gradient-to-br from-purple-400 to-pink-500',
  },
  athlete: {
    face: '🥳',
    hair: '🦱',
    eyes: '😍',
    outfit: '🎽',
    accessory: '🧢',
    background: 'bg-gradient-to-br from-green-400 to-green-600',
  },
};

export const Example8 = mount(r => {
  const character = state<Character>(
    {
      face: '😊',
      hair: '🦰',
      eyes: '👀',
      outfit: '👔',
      accessory: '🎩',
      background: 'bg-gradient-to-br from-blue-400 to-blue-600',
    },
    r
  );

  const updateCharacter = (key: keyof Character, value: string) => {
    character.v = { ...character.v, [key]: value };
  };

  const loadPreset = (preset: keyof typeof presets) => {
    character.v = { ...presets[preset] };
  };

  const randomize = () => {
    character.v = {
      face: options.face[Math.floor(Math.random() * options.face.length)].value,
      hair: options.hair[Math.floor(Math.random() * options.hair.length)].value,
      eyes: options.eyes[Math.floor(Math.random() * options.eyes.length)].value,
      outfit:
        options.outfit[Math.floor(Math.random() * options.outfit.length)].value,
      accessory:
        options.accessory[Math.floor(Math.random() * options.accessory.length)]
          .value,
      background:
        options.background[
          Math.floor(Math.random() * options.background.length)
        ].value,
    };
  };

  const exportCharacter = () => {
    const json = JSON.stringify(character.v, null, 2);
    navigator.clipboard.writeText(json);
    alert('캐릭터 데이터가 클립보드에 복사되었습니다!');
  };

  return () => {
    return (
      <div class="w-full max-w-4xl mx-auto">
        <div class="mb-4">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            🎨 Character Creator
          </h3>
          <p class="text-xs text-gray-500 dark:text-gray-400">
            Create your unique character using select controls
          </p>
        </div>

        {/* Preset Buttons */}
        <div class="flex flex-wrap gap-2 mb-4">
          <button
            onClick={() => loadPreset('developer')}
            class="px-3 py-1.5 text-xs font-medium rounded-lg text-white bg-gray-700 hover:bg-gray-800 transition-colors"
          >
            💻 Developer
          </button>
          <button
            onClick={() => loadPreset('pirate')}
            class="px-3 py-1.5 text-xs font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 transition-colors"
          >
            🏴‍☠️ Pirate
          </button>
          <button
            onClick={() => loadPreset('royalty')}
            class="px-3 py-1.5 text-xs font-medium rounded-lg text-white bg-purple-600 hover:bg-purple-700 transition-colors"
          >
            👑 Royalty
          </button>
          <button
            onClick={() => loadPreset('athlete')}
            class="px-3 py-1.5 text-xs font-medium rounded-lg text-white bg-green-600 hover:bg-green-700 transition-colors"
          >
            🏃 Athlete
          </button>
          <button
            onClick={randomize}
            class="px-3 py-1.5 text-xs font-medium rounded-lg text-white bg-orange-600 hover:bg-orange-700 transition-colors"
          >
            🎲 Randomize
          </button>
          <button
            onClick={exportCharacter}
            class="px-3 py-1.5 text-xs font-medium rounded-lg text-gray-700 dark:text-gray-200 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          >
            📋 Export
          </button>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Character Preview */}
          <div class="order-2 md:order-1">
            <h4 class="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
              Your Character
            </h4>
            <div
              class={`relative rounded-2xl ${character.v.background} p-8 min-h-[300px] flex items-center justify-center shadow-lg`}
            >
              <div class="text-center">
                <div class="text-8xl mb-4">{character.v.face}</div>
                <div class="flex justify-center gap-4 text-5xl mb-4">
                  <span>{character.v.hair}</span>
                  <span>{character.v.eyes}</span>
                </div>
                <div class="flex justify-center gap-4 text-5xl">
                  <span>{character.v.outfit}</span>
                  <span>{character.v.accessory}</span>
                </div>
              </div>
            </div>
            <div class="mt-3 text-xs text-gray-500 dark:text-gray-400 text-center">
              💡 Select controls update character in real-time
            </div>
          </div>

          {/* Controls */}
          <div class="order-1 md:order-2 space-y-3">
            <h4 class="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
              Customize
            </h4>

            {/* Face */}
            <div>
              <label class="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                Face
              </label>
              <select
                value={character.v.face}
                onChange={(e: Event) =>
                  updateCharacter('face', (e.target as HTMLSelectElement).value)
                }
                class="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-[#42b883]"
              >
                {options.face.map(opt => (
                  <option
                    value={opt.value}
                    selected={character.v.face === opt.value}
                  >
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Hair */}
            <div>
              <label class="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                Hair Style
              </label>
              <select
                value={character.v.hair}
                onChange={(e: Event) =>
                  updateCharacter('hair', (e.target as HTMLSelectElement).value)
                }
                class="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-[#42b883]"
              >
                {options.hair.map(opt => (
                  <option
                    value={opt.value}
                    selected={character.v.hair === opt.value}
                  >
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Eyes */}
            <div>
              <label class="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                Eyes / Eyewear
              </label>
              <select
                value={character.v.eyes}
                onChange={(e: Event) =>
                  updateCharacter('eyes', (e.target as HTMLSelectElement).value)
                }
                class="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-[#42b883]"
              >
                {options.eyes.map(opt => (
                  <option
                    value={opt.value}
                    selected={character.v.eyes === opt.value}
                  >
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Outfit */}
            <div>
              <label class="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                Outfit
              </label>
              <select
                value={character.v.outfit}
                onChange={(e: Event) =>
                  updateCharacter(
                    'outfit',
                    (e.target as HTMLSelectElement).value
                  )
                }
                class="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-[#42b883]"
              >
                {options.outfit.map(opt => (
                  <option
                    value={opt.value}
                    selected={character.v.outfit === opt.value}
                  >
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Accessory */}
            <div>
              <label class="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                Accessory
              </label>
              <select
                value={character.v.accessory}
                onChange={(e: Event) =>
                  updateCharacter(
                    'accessory',
                    (e.target as HTMLSelectElement).value
                  )
                }
                class="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-[#42b883]"
              >
                {options.accessory.map(opt => (
                  <option
                    value={opt.value}
                    selected={character.v.accessory === opt.value}
                  >
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Background */}
            <div>
              <label class="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                Background
              </label>
              <select
                value={character.v.background}
                onChange={(e: Event) =>
                  updateCharacter(
                    'background',
                    (e.target as HTMLSelectElement).value
                  )
                }
                class="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-[#42b883]"
              >
                {options.background.map(opt => (
                  <option
                    value={opt.value}
                    selected={character.v.background === opt.value}
                  >
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div class="mt-4 p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
          <p class="text-xs text-blue-800 dark:text-blue-200">
            💡 <strong>Select 동작 확인:</strong> 각 드롭다운에서 옵션을
            선택하면 onChange 이벤트가 발생하고, Lithent가 변경된 값을 감지하여
            캐릭터 프리뷰를 즉시 업데이트합니다. selected 속성이 올바르게
            동기화되는지 확인해보세요!
          </p>
        </div>
      </div>
    );
  };
});
