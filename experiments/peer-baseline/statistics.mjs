import assert from 'node:assert/strict';
export const median = values => {
  const a = [...values].sort((a, b) => a - b),
    i = Math.floor(a.length / 2);
  return a.length % 2 ? a[i] : (a[i - 1] + a[i]) / 2;
};
export const distribution = values => {
  assert.ok(values.length && values.every(Number.isFinite));
  const a = [...values].sort((a, b) => a - b);
  return {
    count: a.length,
    median: median(a),
    p25: median(a.slice(0, Math.floor(a.length / 2))),
    p75: median(a.slice(Math.ceil(a.length / 2))),
    min: a[0],
    max: a.at(-1),
  };
};
export const weighted = (ratios, weights) =>
  Math.exp(
    ratios.reduce((sum, ratio, i) => sum + weights[i] * Math.log(ratio), 0) /
      weights.reduce((a, b) => a + b)
  );
