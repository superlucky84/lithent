import { mount } from 'lithent';
import { Example20 } from '@/components/examples/example20';
import { CodeBlock } from '@/components/CodeBlock';

export const Example20Page = mount(() => {
  return () => (
    <div>
      <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-4">
        Image Gallery Lightbox
      </h1>

      <p class="text-base text-gray-700 dark:text-gray-300 mb-6">
        This example implements an image gallery where clicking a thumbnail
        inside an overflow:hidden container displays a full-screen lightbox
        using the Portal feature. Experience Portal's core characteristics in
        the most intuitive way!
      </p>

      <div class="my-8 p-4 bg-purple-50 dark:bg-purple-900/20 border-l-4 border-purple-500 rounded">
        <h3 class="text-lg font-semibold text-purple-900 dark:text-purple-100 mb-2">
          💡 Learning Points
        </h3>
        <p class="text-sm text-purple-800 dark:text-purple-200">
          <strong>The Magic of Portal:</strong> The gallery is confined within
          an overflow:hidden container, but clicking a thumbnail displays a
          full-screen lightbox through Portal. The lightbox is rendered at a
          physically different DOM location, unaffected by the parent's overflow
          constraints.
        </p>
      </div>

      <h2 class="text-2xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">
        Problem Solved by Portal
      </h2>

      <p class="text-base text-gray-700 dark:text-gray-300 mb-4">
        Typically, when a parent container has overflow: hidden, child elements
        get clipped. However, lightboxes and modals need to cover the full
        screen. Portal solves this problem.
      </p>

      <h2 class="text-2xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">
        Gallery Lightbox Structure
      </h2>

      <ul class="list-disc list-inside text-gray-700 dark:text-gray-300 mb-6 space-y-2">
        <li>
          <strong>Thumbnail Gallery:</strong> 6 images inside overflow:hidden
          container
        </li>
        <li>
          <strong>Click Event:</strong> Update selected photo state when
          thumbnail is clicked
        </li>
        <li>
          <strong>Portal Rendering:</strong> Display lightbox at separate DOM
          location
        </li>
        <li>
          <strong>Full Screen Overlay:</strong> Dark background + large image
          display
        </li>
        <li>
          <strong>Close Function:</strong> Close lightbox with X button or close
          button
        </li>
      </ul>

      <h2 class="text-2xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">
        Technologies Used
      </h2>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div class="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg border border-purple-200 dark:border-purple-800">
          <h3 class="text-base font-semibold text-purple-900 dark:text-purple-100 mb-2">
            portal()
          </h3>
          <p class="text-sm text-purple-800 dark:text-purple-200">
            Renders the lightbox to a different DOM location. Used as
            portal(content, targetElement).
          </p>
        </div>

        <div class="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
          <h3 class="text-base font-semibold text-green-900 dark:text-green-100 mb-2">
            state (helper)
          </h3>
          <p class="text-sm text-green-800 dark:text-green-200">
            Manages selected photo state. Access with .v and automatically
            re-renders.
          </p>
        </div>
      </div>

      <h2 class="text-2xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">
        Code Example
      </h2>

      <p class="text-base text-gray-700 dark:text-gray-300 mb-4">
        Here's an example of using Portal to render a lightbox in an area
        pre-rendered by SSR:
      </p>

      <div class="mb-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
        <h3 class="text-sm font-semibold text-gray-900 dark:text-white mb-2">
          💡 SSR Scenario
        </h3>
        <p class="text-xs text-gray-700 dark:text-gray-300">
          Pre-render the lightbox container in HTML on the server, then use
          Portal on the client to render the lightbox to that area (e.g.,{' '}
          <code>document.body</code> or a separate <code>lightbox-root</code>).
        </p>
      </div>

      <CodeBlock
        language="html"
        code={`<!-- index.html (HTML rendered by server) -->
<!DOCTYPE html>
<html>
<body>
  <!-- Area where app will be mounted -->
  <div id="app"></div>

  <!-- Lightbox container pre-rendered by SSR -->
  <div id="lightbox-root"></div>
</body>
</html>`}
      />

      <CodeBlock
        language="tsx"
        code={`// app.tsx (Client code)
import { mount, portal } from 'lithent';
import { state } from 'lithent/helper';

export const Gallery = mount(renew => {
  const selectedPhoto = state<Photo | null>(null, renew);

  const openLightbox = (photo: Photo) => {
    selectedPhoto.v = photo;
  };

  const closeLightbox = () => {
    selectedPhoto.v = null;
  };

  return () => (
    <div>
      {/* Gallery (overflow:hidden container) */}
      <div class="gallery-container" style="overflow: hidden;">
        {photos.map(photo => (
          <button key={photo.id} onClick={() => openLightbox(photo)}>
            <span>{photo.thumbnail}</span>
            <span>{photo.title}</span>
          </button>
        ))}
      </div>

      {/* Portal rendering - document.body or SSR-defined lightbox-root, etc. */}
      {selectedPhoto.v &&
        portal(
          <Lightbox photo={selectedPhoto.v} onClose={closeLightbox} />,
          document.body
        )}
    </div>
  );
});`}
      />

      <p class="text-sm text-gray-700 dark:text-gray-300 mt-4 mb-2">
        <strong>Lightbox Component (Content rendered via Portal):</strong>
      </p>

      <CodeBlock
        language="tsx"
        code={`// Lightbox.tsx (Component rendered via Portal)
const Lightbox = mount<{
  photo: Photo;
  onClose: () => void;
}>((r, props) => {
  return () => (
    <div class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80 animate-fadeIn">
      {/* Close button */}
      <button
        onClick={props.onClose}
        class="absolute top-4 right-4 text-white text-3xl hover:text-gray-300 transition-colors"
      >
        ✕
      </button>

      {/* Lightbox body */}
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-2xl p-6 max-w-2xl w-full mx-4">
        <div class="flex flex-col items-center">
          {/* Large image */}
          <span class="text-9xl mb-4">{props.photo.full}</span>

          {/* Title */}
          <h3 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {props.photo.title}
          </h3>

          {/* ID */}
          <p class="text-sm text-gray-600 dark:text-gray-400 mb-4">
            ID: {props.photo.id}
          </p>

          {/* Close button */}
          <button
            onClick={props.onClose}
            class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
});

// Usage in Gallery component
const renderLightbox = () => {
  const lightboxRoot = document.getElementById('lightbox-root');
  return lightboxRoot && selectedPhoto.v
    ? portal(
        <Lightbox photo={selectedPhoto.v} onClose={closeLightbox} />,
        lightboxRoot
      )
    : null;
};`}
      />

      <div class="my-6 p-4 bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 rounded">
        <h3 class="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">
          💡 Key Points
        </h3>
        <ul class="text-sm text-blue-800 dark:text-blue-200 space-y-2">
          <li>
            <strong>1. SSR Container:</strong> Uses lightbox-root pre-defined in
            HTML.
          </li>
          <li>
            <strong>2. document.getElementById():</strong> Directly references
            DOM elements rendered by SSR.
          </li>
          <li>
            <strong>3. portal() Function:</strong> Renders the lightbox
            component with portal(&lt;Lightbox /&gt;, lightboxRoot).
          </li>
          <li>
            <strong>4. Reusable Component:</strong> Separates Lightbox as an
            independent component, passing data via props.
          </li>
          <li>
            <strong>5. Solving overflow:</strong> Gallery has overflow:hidden
            but lightbox displays full screen.
          </li>
        </ul>
      </div>

      <h2 class="text-2xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">
        Live Example
      </h2>

      <div class="my-8">
        <Example20 />
      </div>

      <h2 class="text-2xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">
        Core Characteristics of Portal
      </h2>

      <div class="bg-gray-50 dark:bg-gray-900 rounded-lg p-6 mb-6">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-3">
          🎯 What This Example Demonstrates
        </h3>

        <div class="space-y-4">
          <div>
            <h4 class="text-base font-semibold text-gray-900 dark:text-white mb-2">
              1️⃣ Overcoming Overflow Constraints
            </h4>
            <p class="text-sm text-gray-700 dark:text-gray-300">
              The gallery container has overflow:hidden, but the lightbox
              rendered via Portal can cover the full screen.
            </p>
          </div>

          <div>
            <h4 class="text-base font-semibold text-gray-900 dark:text-white mb-2">
              2️⃣ Visually Clear Concept
            </h4>
            <p class="text-sm text-gray-700 dark:text-gray-300">
              The transition from small thumbnail → large lightbox intuitively
              demonstrates Portal's "rendering at different location" concept.
            </p>
          </div>

          <div>
            <h4 class="text-base font-semibold text-gray-900 dark:text-white mb-2">
              3️⃣ Practical Pattern
            </h4>
            <p class="text-sm text-gray-700 dark:text-gray-300">
              The image gallery + lightbox pattern commonly used in real
              websites.
            </p>
          </div>

          <div>
            <h4 class="text-base font-semibold text-gray-900 dark:text-white mb-2">
              4️⃣ Lifecycle Management
            </h4>
            <p class="text-sm text-gray-700 dark:text-gray-300">
              When selected photo state becomes null, the Portal is
              automatically removed.
            </p>
          </div>
        </div>
      </div>

      <h2 class="text-2xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">
        Practical Use Cases
      </h2>

      <div class="grid gap-4 mb-6">
        <div class="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 p-4 rounded-lg border border-purple-200 dark:border-purple-800">
          <h4 class="text-base font-semibold text-purple-900 dark:text-purple-100 mb-2">
            🖼️ Image Gallery
          </h4>
          <p class="text-sm text-purple-800 dark:text-purple-200">
            Implement lightboxes that display images large in portfolios, blogs,
            shopping malls, etc.
          </p>
        </div>

        <div class="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
          <h4 class="text-base font-semibold text-blue-900 dark:text-blue-100 mb-2">
            🎬 Video Player
          </h4>
          <p class="text-sm text-blue-800 dark:text-blue-200">
            Display a full-screen video player when clicking a small thumbnail.
          </p>
        </div>

        <div class="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
          <h4 class="text-base font-semibold text-green-900 dark:text-green-100 mb-2">
            📄 Document Preview
          </h4>
          <p class="text-sm text-green-800 dark:text-green-200">
            Create a viewer to preview documents like PDFs and images on a large
            screen.
          </p>
        </div>

        <div class="bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 p-4 rounded-lg border border-orange-200 dark:border-orange-800">
          <h4 class="text-base font-semibold text-orange-900 dark:text-orange-100 mb-2">
            🎨 Product Detail View
          </h4>
          <p class="text-sm text-orange-800 dark:text-orange-200">
            Implement zoom functionality to enlarge and display product images
            in shopping malls.
          </p>
        </div>
      </div>

      <div class="my-8 p-4 bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-500 rounded">
        <h3 class="text-lg font-semibold text-yellow-900 dark:text-yellow-100 mb-2">
          ⚠️ Cautions
        </h3>
        <ul class="text-sm text-yellow-800 dark:text-yellow-200 space-y-2">
          <li>
            <strong>Event Bubbling:</strong> Click events inside Portal can
            propagate to parent, so e.stopPropagation() may be needed.
          </li>
          <li>
            <strong>Accessibility:</strong> It's good to add accessibility
            features like ESC key to close and focus trap.
          </li>
          <li>
            <strong>Scroll Prevention:</strong> Disabling body scroll when
            lightbox opens provides better UX.
          </li>
          <li>
            <strong>Animation:</strong> Adding fade-in/fade-out animations gives
            smoother transition effects.
          </li>
        </ul>
      </div>

      <h2 class="text-2xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">
        Extension Ideas
      </h2>

      <div class="grid gap-4 mb-6">
        <div class="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <h4 class="text-base font-semibold text-gray-900 dark:text-gray-100 mb-2">
            ⬅️➡️ Previous/Next Navigation
          </h4>
          <p class="text-sm text-gray-700 dark:text-gray-300">
            Add functionality to view next/previous images with arrow buttons in
            the lightbox.
          </p>
        </div>

        <div class="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <h4 class="text-base font-semibold text-gray-900 dark:text-gray-100 mb-2">
            🔍 Zoom In/Out
          </h4>
          <p class="text-sm text-gray-700 dark:text-gray-300">
            Add functionality to zoom in/out images with mouse wheel or pinch
            gestures.
          </p>
        </div>

        <div class="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <h4 class="text-base font-semibold text-gray-900 dark:text-gray-100 mb-2">
            📱 Swipe Support
          </h4>
          <p class="text-sm text-gray-700 dark:text-gray-300">
            Add functionality to switch images with left/right swipes on mobile.
          </p>
        </div>

        <div class="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <h4 class="text-base font-semibold text-gray-900 dark:text-gray-100 mb-2">
            🎞️ Slideshow
          </h4>
          <p class="text-sm text-gray-700 dark:text-gray-300">
            Add slideshow mode that automatically advances to the next image.
          </p>
        </div>
      </div>

      <h2 class="text-2xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">
        Related Documentation
      </h2>

      <ul class="list-disc list-inside text-gray-700 dark:text-gray-300 mb-6 space-y-2">
        <li>
          <a
            href="/guide/portal"
            class="text-[#42b883] hover:underline"
            onClick={(e: Event) => {
              e.preventDefault();
              window.history.pushState({}, '', '/guide/portal');
              window.dispatchEvent(new PopStateEvent('popstate'));
            }}
          >
            Portal Guide
          </a>{' '}
          - All features and API documentation for Portal
        </li>
        <li>
          <a
            href="/guide/mount-hooks"
            class="text-[#42b883] hover:underline"
            onClick={(e: Event) => {
              e.preventDefault();
              window.history.pushState({}, '', '/guide/mount-hooks');
              window.dispatchEvent(new PopStateEvent('popstate'));
            }}
          >
            Mount Hooks Guide
          </a>{' '}
          - mountCallback and component lifecycle
        </li>
        <li>
          <a
            href="/guide/state-ref"
            class="text-[#42b883] hover:underline"
            onClick={(e: Event) => {
              e.preventDefault();
              window.history.pushState({}, '', '/guide/state-ref');
              window.dispatchEvent(new PopStateEvent('popstate'));
            }}
          >
            State-Ref Guide
          </a>{' '}
          - DOM element reference using ref
        </li>
      </ul>
    </div>
  );
});
