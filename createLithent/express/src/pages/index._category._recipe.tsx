import { mount } from 'lithent';
import { getPreloadData } from '@/base/data';
import { Link } from '@/components/Link';
import NotFound from '@/components/NotFound';
import { favoriteStore, isFavorite, toggleFavorite } from '@/favorites';
import { getCategory, getRecipe } from '@/data/recipes';
import type { Category, Recipe } from '@/data/recipes';
import type { PageProps } from '@/base/types';

type RecipeData =
  | { notFound: true }
  | { notFound?: false; category: Category; recipe: Recipe };

export const preload = async ({
  params,
}: PageProps): Promise<RecipeData & { layout: { title: string } }> => {
  const category = getCategory(params.category);
  const recipe = getRecipe(params.category, params.recipe);

  if (!category || !recipe) {
    return { layout: { title: 'Not found' }, notFound: true };
  }

  return { layout: { title: recipe.name }, category, recipe };
};

const formatAmount = (value: number) =>
  Number.isInteger(value) ? String(value) : value.toFixed(1);

const RecipePage = mount<PageProps>(renew => {
  const data = getPreloadData<RecipeData>();
  const favorites = favoriteStore(renew);

  let servings = data.notFound ? 1 : data.recipe.servings;

  const changeServings = (delta: number) => {
    servings = Math.min(12, Math.max(1, servings + delta));
    renew();
  };

  return () => {
    if (data.notFound) return <NotFound />;

    const { category, recipe } = data;
    const scale = servings / recipe.servings;
    const favorite = isFavorite(favorites.ids, recipe.id);

    return (
      <article>
        <Link
          to={`/${category.id}`}
          class="text-sm text-stone-500 hover:text-stone-900"
        >
          ← {category.name}
        </Link>

        <div class="mt-2 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 class="text-3xl font-bold">
              {recipe.emoji} {recipe.name}
            </h1>
            <p class="text-stone-600">{recipe.summary}</p>
            <p class="mt-1 text-sm text-stone-500">
              {recipe.minutes} min · {recipe.difficulty}
            </p>
          </div>
          <button
            type="button"
            aria-pressed={favorite ? 'true' : 'false'}
            onClick={() => toggleFavorite(recipe.id)}
            class={`rounded-lg px-4 py-2 text-sm font-semibold ${
              favorite
                ? 'bg-amber-400 text-amber-950'
                : 'border border-stone-300 bg-white'
            }`}
          >
            {favorite ? '★ Saved' : '☆ Save'}
          </button>
        </div>

        <div class="mt-8 grid gap-8 md:grid-cols-[2fr_3fr]">
          <section class="rounded-2xl border border-stone-200 bg-white p-5">
            <div class="flex items-center justify-between">
              <h2 class="text-lg font-semibold">Ingredients</h2>
              <div class="flex items-center gap-2">
                <button
                  type="button"
                  aria-label="Fewer servings"
                  onClick={() => changeServings(-1)}
                  class="h-8 w-8 rounded-full border border-stone-300"
                >
                  −
                </button>
                <span class="w-20 text-center text-sm">
                  {servings} {servings === 1 ? 'serving' : 'servings'}
                </span>
                <button
                  type="button"
                  aria-label="More servings"
                  onClick={() => changeServings(1)}
                  class="h-8 w-8 rounded-full border border-stone-300"
                >
                  +
                </button>
              </div>
            </div>
            <ul class="mt-4 space-y-2">
              {recipe.ingredients.map(item => (
                <li class="flex justify-between gap-4 text-sm">
                  <span>{item.name}</span>
                  <span class="text-stone-600">
                    {formatAmount(item.amount * scale)} {item.unit}
                  </span>
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2 class="text-lg font-semibold">Steps</h2>
            <ol class="mt-4 list-decimal space-y-3 pl-5">
              {recipe.steps.map(step => (
                <li>{step}</li>
              ))}
            </ol>
          </section>
        </div>
      </article>
    );
  };
});

export default RecipePage;
