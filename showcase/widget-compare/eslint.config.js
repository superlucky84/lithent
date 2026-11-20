import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import prettierConfig from 'eslint-config-prettier';

export default tseslint.config(
  js.configs.recommended,
  ...tseslint.configs.recommended,
  prettierConfig,
  {
    ignores: ['dist/**', 'node_modules/**', '*.config.js'],
  },
  {
    files: ['scripts/**/*.mjs'],
    languageOptions: {
      // Node, and the browser for the functions measure.mjs runs in the page.
      globals: {
        console: 'readonly',
        process: 'readonly',
        URL: 'readonly',
        performance: 'readonly',
        window: 'readonly',
        document: 'readonly',
        customElements: 'readonly',
        MutationObserver: 'readonly',
      },
    },
  },
  {
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
    },
  }
);
