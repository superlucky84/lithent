import { mount } from 'lithent';
import { Link } from '@/components/Link';

export const NotFound = mount(() => {
  return () => (
    <section class="py-16 text-center">
      <p class="text-5xl">🥄</p>
      <h1 class="mt-4 text-2xl font-bold">Page not found</h1>
      <p class="mt-2 text-stone-600">
        There is no recipe or category at this address.
      </p>
      <Link
        to="/"
        class="mt-6 inline-block rounded-lg bg-stone-900 px-4 py-2 text-sm font-semibold text-white"
      >
        Back to all recipes
      </Link>
    </section>
  );
});
