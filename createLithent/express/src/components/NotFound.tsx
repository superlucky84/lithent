import { mount } from 'lithent';

const NotFound = mount(() => {
  return () => (
    <div class="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-800">
      <div class="text-center p-8">
        <h1 class="text-4xl font-bold text-blue-500 animate-bounce">404</h1>
        <p class="mt-4 text-xl text-gray-700 dark:text-gray-300">
          The page you’re looking for doesn’t exist.
        </p>
        <p class="mt-2 text-lg text-gray-600 dark:text-gray-400">
          Please check the URL or return to the homepage.
        </p>
        <a
          href="/"
          class="inline-block mt-6 px-6 py-2 text-sm font-medium text-white bg-blue-500 rounded hover:bg-blue-600"
        >
          Go to Homepage
        </a>
      </div>
    </div>
  );
});

export default NotFound;
