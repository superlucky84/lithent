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
  plugins: ['jest'],
  extends: ['plugin:prettier/recommended'],
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
