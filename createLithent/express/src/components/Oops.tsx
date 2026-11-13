import { mount } from 'lithent';

const Oops = mount(() => {
  return () => (
    <section class="py-16 text-center">
      <p class="text-5xl">🔥</p>
      <h1 class="mt-4 text-2xl font-bold">Something went wrong</h1>
      <p class="mt-2 text-stone-600">
        The page failed to render. Check the server log for details.
      </p>
      <a
        href="/"
        class="mt-6 inline-block rounded-lg bg-stone-900 px-4 py-2 text-sm font-semibold text-white"
      >
        Back to all recipes
      </a>
    </section>
  );
});

export default Oops;
