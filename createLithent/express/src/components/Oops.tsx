import { h, mount } from 'lithent';

const Oops = mount(() => {
  return () => (
    <div class="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-800">
      <div class="text-center p-8">
        <h1 class="text-4xl font-bold text-red-500 animate-bounce">Oops!</h1>
        <p class="mt-4 text-xl text-gray-700 dark:text-gray-300">
          Something went wrong. Please try again later.
        </p>
      </div>
    </div>
  );
});

export default Oops;
