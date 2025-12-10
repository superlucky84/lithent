import { mount, portal } from 'lithent';
import { state } from 'lithent/helper';

interface Photo {
  id: number;
  title: string;
  thumbnail: string;
  full: string;
}

const photos: Photo[] = [
  {
    id: 1,
    title: 'Mountain Landscape',
    thumbnail: '🏔️',
    full: '🏔️',
  },
  {
    id: 2,
    title: 'Ocean View',
    thumbnail: '🌊',
    full: '🌊',
  },
  {
    id: 3,
    title: 'City Night View',
    thumbnail: '🌃',
    full: '🌃',
  },
  {
    id: 4,
    title: 'Forest',
    thumbnail: '🌲',
    full: '🌲',
  },
  {
    id: 5,
    title: 'Sunset',
    thumbnail: '🌅',
    full: '🌅',
  },
  {
    id: 6,
    title: 'Starry Night',
    thumbnail: '🌌',
    full: '🌌',
  },
];

export const Example20 = mount(renew => {
  const selectedPhoto = state<Photo | null>(null, renew);

  const openLightbox = (photo: Photo) => {
    selectedPhoto.v = photo;
  };

  const closeLightbox = () => {
    selectedPhoto.v = null;
  };

  return () => (
    <div class="w-full max-w-4xl mx-auto">
      <div class="mb-4">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          🖼️ Image Gallery
        </h3>
        <p class="text-xs text-gray-500 dark:text-gray-400">
          Click thumbnails to display lightbox via Portal
        </p>
      </div>

      {/* Gallery container (overflow:hidden) */}
      <div class="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 mb-4 overflow-hidden border-2 border-dashed border-gray-400 dark:border-gray-600">
        <p class="text-xs text-gray-600 dark:text-gray-400 mb-3">
          📦 overflow: hidden container
        </p>
        <div class="grid grid-cols-3 md:grid-cols-6 gap-3">
          {photos.map(photo => (
            <button
              key={photo.id}
              onClick={() => openLightbox(photo)}
              class="aspect-square bg-white dark:bg-gray-700 rounded-lg shadow hover:shadow-lg transition-all hover:scale-105 flex flex-col items-center justify-center p-2 border border-gray-200 dark:border-gray-600"
            >
              <span class="text-3xl md:text-4xl">{photo.thumbnail}</span>
              <span class="text-xs text-gray-600 dark:text-gray-300 mt-1">
                {photo.title}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Render lightbox with Portal */}
      {selectedPhoto.v &&
        portal(
          <div class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80 animate-fadeIn">
            <button
              onClick={closeLightbox}
              class="absolute top-4 right-4 text-white text-3xl hover:text-gray-300 transition-colors"
            >
              ✕
            </button>

            <div class="bg-white dark:bg-gray-800 rounded-lg shadow-2xl p-6 max-w-2xl w-full mx-4">
              <div class="flex flex-col items-center">
                <span class="text-9xl mb-4">{selectedPhoto.v.full}</span>
                <h3 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  {selectedPhoto.v.title}
                </h3>
                <p class="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  ID: {selectedPhoto.v.id}
                </p>
                <button
                  onClick={closeLightbox}
                  class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>,
          document.body as HTMLElement
        )}

      {/* Description */}
      <div class="mt-4 p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
        <p class="text-xs text-blue-800 dark:text-blue-200 mb-2">
          💡 <strong>Key characteristics of Portal:</strong>
        </p>
        <ol class="text-xs text-blue-700 dark:text-blue-300 ml-4 space-y-1">
          <li>
            1. Gallery is inside <strong>overflow:hidden</strong> container
          </li>
          <li>
            2. Lightbox is rendered in a separate area via{' '}
            <strong>Portal</strong>
          </li>
          <li>
            3. Displays as <strong>full screen</strong> without overflow
            constraints
          </li>
        </ol>
      </div>

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
      `}</style>
    </div>
  );
});
