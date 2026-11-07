import config from '../comprehensive/vitest.config.mjs';

export default {
  ...config,
  test: {
    ...config.test,
    include: [
      ...config.test.include,
      'experiments/dc25-keyed-fast-path/lifetime.test.tsx',
    ],
  },
};
