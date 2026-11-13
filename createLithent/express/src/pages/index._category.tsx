import { mount } from 'lithent';
import { computed } from 'lithent/helper';
import { getPreloadData } from '@/base/data';
import { Link } from '@/components/Link';
import NotFound from '@/components/NotFound';
import { favoriteStore, isFavorite } from '@/favorites';
import { getCategory, getRecipes } from '@/data/recipes';
import type { Category, Recipe } from '@/data/recipes';
import type { PageProps } from '@/base/types';

type CategoryFound = {
  category: Category;
  recipes: Recipe[];
  notFound?: false;
};
type CategoryData = CategoryFound | { notFound: true };

type SortKey = 'time' | 'name';

export const preload = async ({
  params,
}: PageProps): Promise<CategoryData & { layout: { title: string } }> => {
  const category = getCategory(params.category);

  if (!category) {
    return { layout: { title: 'Not found' }, notFound: true };
  }

  return {
    layout: { title: category.name },
    category,
    recipes: getRecipes(category.id),
  };
};

const CategoryPage = mount<PageProps>(renew => {
  const data = getPreloadData<CategoryData>();
  const favorites = favoriteStore(renew);

  // Component state is just closure variables.
  let query = '';
  let sort: SortKey = 'time';

  const visible = computed(() =>
    data.notFound
      ? []
      : data.recipes
          .filter(recipe =>
            recipe.name.toLowerCase().includes(query.trim().toLowerCase())
          )
          .sort((a, b) =>
            sort === 'time'
              ? a.minutes - b.minutes
              : a.name.localeCompare(b.name)
          )
  );

  const onSearch = (event: Event) => {
    query = (event.target as HTMLInputElement).value;
    renew();
  };

  const onSort = (event: Event) => {
    sort = (event.target as HTMLSelectElement).value as SortKey;
    renew();
  };

  return () => {
    if (data.notFound) return <NotFound />;

    const { category, recipes } = data;

    return (
      <div>
        <Link to="/" class="text-sm text-stone-500 hover:text-stone-900">
          ← All categories
        </Link>
        <h1 class="mt-2 text-3xl font-bold">
          {category.emoji} {category.name}
        </h1>
        <p class="text-stone-600">{category.blurb}</p>

        <div class="mt-6 flex flex-wrap items-center gap-3">
          <input
            type="search"
            placeholder="Search recipes"
            aria-label="Search recipes"
            value={query}
            onInput={onSearch}
            class="min-w-0 flex-1 rounded-lg border border-stone-300 bg-white px-3 py-2"
          />
          <select
            aria-label="Sort recipes"
            onChange={onSort}
            class="rounded-lg border border-stone-300 bg-white px-3 py-2"
          >
            <option value="time" selected={sort === 'time'}>
              Quickest first
            </option>
            <option value="name" selected={sort === 'name'}>
              A to Z
            </option>
          </select>
        </div>
        <p class="mt-3 text-sm text-stone-500">
          {visible.value.length} of {recipes.length} recipes
        </p>

        <ul class="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {visible.value.map(recipe => (
            <li key={recipe.id}>
              <Link
                to={`/${category.id}/${recipe.id}`}
                class="block h-full rounded-2xl border border-stone-200 bg-white p-5 transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <div class="flex items-start justify-between">
                  <span class="text-4xl">{recipe.emoji}</span>
                  {isFavorite(favorites.ids, recipe.id) && (
                    <span class="text-amber-500" title="Favorite">
                      ★
                    </span>
                  )}
                </div>
                <h2 class="mt-3 font-semibold">{recipe.name}</h2>
                <p class="text-sm text-stone-600">{recipe.summary}</p>
                <p class="mt-2 text-xs text-stone-500">
                  {recipe.minutes} min · {recipe.difficulty}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    );
  };
});

export default CategoryPage;
