import { mount } from 'lithent';
import { Link } from '@/components/Link';
import { ManualCounter, ReactiveCounter } from '@/components/Counters';
import { categories, getRecipes } from '@/data/recipes';

export const Home = mount(() => {
  return () => (
    <div>
      <section>
        <h1 class="text-3xl font-bold">Welcome to your Lithent app</h1>
        <p class="mt-2 text-stone-600">
          Edit <code>src/pages/Home.tsx</code> and save to see it update. The
          same counter is written in both component styles:
        </p>
        <div class="mt-6 grid gap-4 sm:grid-cols-2">
          <ManualCounter />
          <ReactiveCounter />
        </div>
      </section>

      <section class="mt-12">
        <h2 class="text-2xl font-bold">Recipes</h2>
        <ul class="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map(category => (
            <li key={category.id}>
              <Link
                to={`/${category.id}`}
                class={`block rounded-2xl p-5 transition hover:-translate-y-0.5 hover:shadow-md ${category.color}`}
              >
                <span class="text-4xl">{category.emoji}</span>
                <h3 class="mt-3 text-lg font-semibold">{category.name}</h3>
                <p class="text-sm opacity-80">{category.blurb}</p>
                <p class="mt-2 text-xs font-semibold uppercase tracking-wide opacity-70">
                  {getRecipes(category.id).length} recipes
                </p>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
});
