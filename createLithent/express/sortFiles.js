// Express tries routes in registration order. At the first position where two
// routes differ, a fixed segment wins over a parameter, so `blog._slug.tsx`
// (/blog/:slug) is registered before `index._category._recipe.tsx`
// (/:category/:recipe). `src/base/route.ts` matches in the same order.
const segmentsOf = file =>
  file
    .split('.')
    .slice(0, -1)
    .filter(part => part !== 'index');

function compareRoutes(a, b) {
  const segmentsA = segmentsOf(a);
  const segmentsB = segmentsOf(b);

  for (let i = 0; i < Math.min(segmentsA.length, segmentsB.length); i++) {
    const paramA = segmentsA[i].startsWith('_');
    const paramB = segmentsB[i].startsWith('_');

    if (paramA !== paramB) return paramA ? 1 : -1;
  }

  return segmentsB.length - segmentsA.length;
}

export default function sortFiles(files) {
  return [...files].sort(compareRoutes);
}
