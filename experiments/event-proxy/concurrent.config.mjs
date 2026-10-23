import config from './vitest.config.mjs';
export default {
  ...config,
  test: {
    ...config.test,
    include: ['lithentConcurrent/src/tests/concurrent-portalEvents.test.ts'],
  },
};
