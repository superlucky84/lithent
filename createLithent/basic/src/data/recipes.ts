/**
 * Demo data. Replace this module with your own data source (an API call,
 * a CMS, a database query on the server, ...).
 */
export type Category = {
  id: string;
  name: string;
  emoji: string;
  /** Static Tailwind classes, so Tailwind can find them in the source. */
  color: string;
  blurb: string;
};

export type Ingredient = { amount: number; unit: string; name: string };

export type Recipe = {
  id: string;
  category: string;
  name: string;
  emoji: string;
  minutes: number;
  difficulty: 'easy' | 'medium' | 'hard';
  servings: number;
  summary: string;
  ingredients: Ingredient[];
  steps: string[];
};

export const categories: Category[] = [
  {
    id: 'breakfast',
    name: 'Breakfast',
    emoji: '🥞',
    color: 'bg-amber-100 text-amber-900',
    blurb: 'Quick starts for slow mornings.',
  },
  {
    id: 'salads',
    name: 'Salads',
    emoji: '🥗',
    color: 'bg-lime-100 text-lime-900',
    blurb: 'Crunchy, bright and done in minutes.',
  },
  {
    id: 'soups',
    name: 'Soups',
    emoji: '🍲',
    color: 'bg-orange-100 text-orange-900',
    blurb: 'One pot, many bowls.',
  },
  {
    id: 'pasta',
    name: 'Pasta',
    emoji: '🍝',
    color: 'bg-rose-100 text-rose-900',
    blurb: 'Weeknight classics.',
  },
  {
    id: 'desserts',
    name: 'Desserts',
    emoji: '🍰',
    color: 'bg-violet-100 text-violet-900',
    blurb: 'Something sweet to finish.',
  },
];

export const recipes: Recipe[] = [
  {
    id: 'fluffy-pancakes',
    category: 'breakfast',
    name: 'Fluffy Pancakes',
    emoji: '🥞',
    minutes: 25,
    difficulty: 'easy',
    servings: 4,
    summary: 'Tall, soft pancakes from pantry staples.',
    ingredients: [
      { amount: 200, unit: 'g', name: 'flour' },
      { amount: 2, unit: 'tsp', name: 'baking powder' },
      { amount: 1, unit: 'tbsp', name: 'sugar' },
      { amount: 300, unit: 'ml', name: 'milk' },
      { amount: 1, unit: '', name: 'egg' },
      { amount: 30, unit: 'g', name: 'melted butter' },
    ],
    steps: [
      'Whisk the flour, baking powder and sugar.',
      'Beat the milk, egg and butter, then fold into the dry mix.',
      'Cook ladlefuls on a medium pan until bubbles form, then flip.',
    ],
  },
  {
    id: 'avocado-toast',
    category: 'breakfast',
    name: 'Avocado Toast',
    emoji: '🥑',
    minutes: 10,
    difficulty: 'easy',
    servings: 2,
    summary: 'Crisp toast, creamy avocado, a squeeze of lemon.',
    ingredients: [
      { amount: 2, unit: 'slices', name: 'sourdough bread' },
      { amount: 1, unit: '', name: 'ripe avocado' },
      { amount: 1, unit: 'tsp', name: 'lemon juice' },
      { amount: 1, unit: 'pinch', name: 'chili flakes' },
    ],
    steps: [
      'Toast the bread.',
      'Mash the avocado with lemon juice and a pinch of salt.',
      'Spread on the toast and finish with chili flakes.',
    ],
  },
  {
    id: 'overnight-oats',
    category: 'breakfast',
    name: 'Overnight Oats',
    emoji: '🥣',
    minutes: 5,
    difficulty: 'easy',
    servings: 1,
    summary: 'Mix tonight, eat tomorrow.',
    ingredients: [
      { amount: 50, unit: 'g', name: 'rolled oats' },
      { amount: 120, unit: 'ml', name: 'milk' },
      { amount: 60, unit: 'g', name: 'yogurt' },
      { amount: 1, unit: 'tsp', name: 'honey' },
    ],
    steps: [
      'Stir everything together in a jar.',
      'Cover and refrigerate overnight.',
      'Top with fruit before serving.',
    ],
  },
  {
    id: 'greek-salad',
    category: 'salads',
    name: 'Greek Salad',
    emoji: '🫒',
    minutes: 15,
    difficulty: 'easy',
    servings: 2,
    summary: 'Tomato, cucumber, olives and feta.',
    ingredients: [
      { amount: 3, unit: '', name: 'tomatoes' },
      { amount: 1, unit: '', name: 'cucumber' },
      { amount: 60, unit: 'g', name: 'olives' },
      { amount: 100, unit: 'g', name: 'feta' },
      { amount: 2, unit: 'tbsp', name: 'olive oil' },
    ],
    steps: [
      'Chop the tomatoes and cucumber into chunks.',
      'Add the olives and drizzle with olive oil.',
      'Lay the feta on top and season with oregano.',
    ],
  },
  {
    id: 'caesar-salad',
    category: 'salads',
    name: 'Caesar Salad',
    emoji: '🥬',
    minutes: 20,
    difficulty: 'medium',
    servings: 2,
    summary: 'Romaine, croutons and a garlicky dressing.',
    ingredients: [
      { amount: 1, unit: 'head', name: 'romaine lettuce' },
      { amount: 60, unit: 'g', name: 'croutons' },
      { amount: 30, unit: 'g', name: 'parmesan' },
      { amount: 3, unit: 'tbsp', name: 'caesar dressing' },
    ],
    steps: [
      'Tear the lettuce into bite-sized pieces.',
      'Toss with the dressing.',
      'Top with croutons and shaved parmesan.',
    ],
  },
  {
    id: 'quinoa-bowl',
    category: 'salads',
    name: 'Quinoa Bowl',
    emoji: '🍚',
    minutes: 30,
    difficulty: 'medium',
    servings: 2,
    summary: 'Warm quinoa with roasted vegetables.',
    ingredients: [
      { amount: 150, unit: 'g', name: 'quinoa' },
      { amount: 1, unit: '', name: 'sweet potato' },
      { amount: 1, unit: 'can', name: 'chickpeas' },
      { amount: 2, unit: 'tbsp', name: 'tahini' },
    ],
    steps: [
      'Cook the quinoa according to the packet.',
      'Roast cubed sweet potato and chickpeas for 20 minutes.',
      'Assemble the bowls and drizzle with tahini.',
    ],
  },
  {
    id: 'tomato-soup',
    category: 'soups',
    name: 'Tomato Soup',
    emoji: '🍅',
    minutes: 35,
    difficulty: 'easy',
    servings: 4,
    summary: 'Silky, sweet and perfect with grilled cheese.',
    ingredients: [
      { amount: 800, unit: 'g', name: 'canned tomatoes' },
      { amount: 1, unit: '', name: 'onion' },
      { amount: 2, unit: 'cloves', name: 'garlic' },
      { amount: 500, unit: 'ml', name: 'vegetable stock' },
      { amount: 50, unit: 'ml', name: 'cream' },
    ],
    steps: [
      'Soften the onion and garlic in a little oil.',
      'Add the tomatoes and stock, simmer for 20 minutes.',
      'Blend until smooth and stir in the cream.',
    ],
  },
  {
    id: 'chicken-noodle',
    category: 'soups',
    name: 'Chicken Noodle Soup',
    emoji: '🍜',
    minutes: 45,
    difficulty: 'medium',
    servings: 4,
    summary: 'The cozy classic.',
    ingredients: [
      { amount: 2, unit: '', name: 'chicken breasts' },
      { amount: 2, unit: '', name: 'carrots' },
      { amount: 2, unit: 'stalks', name: 'celery' },
      { amount: 1.5, unit: 'l', name: 'chicken stock' },
      { amount: 150, unit: 'g', name: 'egg noodles' },
    ],
    steps: [
      'Simmer the chicken in the stock for 20 minutes, then shred it.',
      'Add the sliced carrots and celery and cook until tender.',
      'Add the noodles and the chicken and cook for 6 more minutes.',
    ],
  },
  {
    id: 'miso-soup',
    category: 'soups',
    name: 'Miso Soup',
    emoji: '🥢',
    minutes: 15,
    difficulty: 'easy',
    servings: 2,
    summary: 'Light broth with tofu and seaweed.',
    ingredients: [
      { amount: 500, unit: 'ml', name: 'dashi' },
      { amount: 2, unit: 'tbsp', name: 'miso paste' },
      { amount: 150, unit: 'g', name: 'silken tofu' },
      { amount: 1, unit: 'tbsp', name: 'dried wakame' },
    ],
    steps: [
      'Warm the dashi without letting it boil.',
      'Dissolve the miso in a ladle of broth and stir it back in.',
      'Add the cubed tofu and wakame and serve.',
    ],
  },
  {
    id: 'spaghetti-carbonara',
    category: 'pasta',
    name: 'Spaghetti Carbonara',
    emoji: '🥓',
    minutes: 25,
    difficulty: 'medium',
    servings: 2,
    summary: 'Eggs, cheese and pepper — no cream.',
    ingredients: [
      { amount: 200, unit: 'g', name: 'spaghetti' },
      { amount: 100, unit: 'g', name: 'pancetta' },
      { amount: 2, unit: '', name: 'eggs' },
      { amount: 50, unit: 'g', name: 'pecorino' },
    ],
    steps: [
      'Cook the spaghetti in salted water.',
      'Crisp the pancetta in a dry pan.',
      'Off the heat, toss the pasta with pancetta, beaten eggs and cheese.',
    ],
  },
  {
    id: 'pesto-pasta',
    category: 'pasta',
    name: 'Pesto Pasta',
    emoji: '🌿',
    minutes: 20,
    difficulty: 'easy',
    servings: 2,
    summary: 'Fresh basil pesto in the time the pasta cooks.',
    ingredients: [
      { amount: 200, unit: 'g', name: 'penne' },
      { amount: 40, unit: 'g', name: 'basil' },
      { amount: 30, unit: 'g', name: 'pine nuts' },
      { amount: 40, unit: 'g', name: 'parmesan' },
      { amount: 80, unit: 'ml', name: 'olive oil' },
    ],
    steps: [
      'Cook the penne.',
      'Blend the basil, pine nuts, parmesan and oil.',
      'Toss with the pasta and a splash of cooking water.',
    ],
  },
  {
    id: 'mac-and-cheese',
    category: 'pasta',
    name: 'Mac and Cheese',
    emoji: '🧀',
    minutes: 40,
    difficulty: 'medium',
    servings: 4,
    summary: 'Baked, bubbling and golden on top.',
    ingredients: [
      { amount: 300, unit: 'g', name: 'macaroni' },
      { amount: 40, unit: 'g', name: 'butter' },
      { amount: 40, unit: 'g', name: 'flour' },
      { amount: 600, unit: 'ml', name: 'milk' },
      { amount: 200, unit: 'g', name: 'cheddar' },
    ],
    steps: [
      'Cook the macaroni until just underdone.',
      'Make a roux with butter and flour, whisk in the milk, melt in the cheese.',
      'Combine, top with more cheese and bake at 200°C for 20 minutes.',
    ],
  },
  {
    id: 'chocolate-mug-cake',
    category: 'desserts',
    name: 'Chocolate Mug Cake',
    emoji: '☕',
    minutes: 5,
    difficulty: 'easy',
    servings: 1,
    summary: 'A two-minute microwave treat.',
    ingredients: [
      { amount: 4, unit: 'tbsp', name: 'flour' },
      { amount: 2, unit: 'tbsp', name: 'cocoa powder' },
      { amount: 3, unit: 'tbsp', name: 'sugar' },
      { amount: 3, unit: 'tbsp', name: 'milk' },
      { amount: 2, unit: 'tbsp', name: 'oil' },
    ],
    steps: [
      'Mix everything in a large mug.',
      'Microwave for 70–90 seconds.',
      'Let it rest for a minute before eating.',
    ],
  },
  {
    id: 'apple-crumble',
    category: 'desserts',
    name: 'Apple Crumble',
    emoji: '🍎',
    minutes: 50,
    difficulty: 'easy',
    servings: 6,
    summary: 'Soft spiced apples under a buttery crumble.',
    ingredients: [
      { amount: 6, unit: '', name: 'apples' },
      { amount: 1, unit: 'tsp', name: 'cinnamon' },
      { amount: 150, unit: 'g', name: 'flour' },
      { amount: 100, unit: 'g', name: 'butter' },
      { amount: 100, unit: 'g', name: 'brown sugar' },
    ],
    steps: [
      'Slice the apples and toss with cinnamon in a baking dish.',
      'Rub the flour, butter and sugar into crumbs and scatter over.',
      'Bake at 180°C for 35 minutes.',
    ],
  },
  {
    id: 'panna-cotta',
    category: 'desserts',
    name: 'Panna Cotta',
    emoji: '🍮',
    minutes: 20,
    difficulty: 'hard',
    servings: 4,
    summary: 'Set cream with a gentle wobble.',
    ingredients: [
      { amount: 500, unit: 'ml', name: 'cream' },
      { amount: 60, unit: 'g', name: 'sugar' },
      { amount: 3, unit: 'sheets', name: 'gelatin' },
      { amount: 1, unit: 'tsp', name: 'vanilla extract' },
    ],
    steps: [
      'Soak the gelatin in cold water.',
      'Warm the cream with sugar and vanilla, then melt in the gelatin.',
      'Pour into glasses and chill for at least 4 hours.',
    ],
  },
];

export function getCategory(id: string): Category | undefined {
  return categories.find(category => category.id === id);
}

export function getRecipes(category: string): Recipe[] {
  return recipes.filter(recipe => recipe.category === category);
}

export function getRecipe(category: string, id: string): Recipe | undefined {
  return recipes.find(
    recipe => recipe.category === category && recipe.id === id
  );
}
