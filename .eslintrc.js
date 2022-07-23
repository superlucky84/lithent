module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true,
    'jest/globals': true,
  },
  globals: {
    PRODUCTION: true,
  },
  plugins: ['jest', '@typescript-eslint'],
  extends: ['plugin:prettier/recommended'],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 12,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
  },
  rules: {
    'require-jsdoc': 0,
    'max-len': 'off',
  },
};
