import tsParser from '@typescript-eslint/parser';
import tsPlugin from '@typescript-eslint/eslint-plugin';
import prettierPlugin from 'eslint-plugin-prettier';

export default [
  {
    files: ['**/*.{ts,tsx,js,jsx}'], // 적용할 파일 패턴
    languageOptions: {
      ecmaVersion: 2021, // ES2021 문법 사용
      sourceType: 'module', // ES 모듈 사용
      globals: {
        PRODUCTION: 'readonly', // 전역 변수 설정 (읽기 전용)
      },
      parser: tsParser, // 올바른 TypeScript 파서
      parserOptions: {
        ecmaFeatures: {
          jsx: true, // JSX 지원
        },
      },
    },
    plugins: {
      '@typescript-eslint': tsPlugin, // TypeScript 플러그인
      prettier: prettierPlugin, // Prettier 플러그인
    },
    rules: {
      'require-jsdoc': 'off', // 규칙 설정
      'max-len': 'off',
      'prettier/prettier': 'error', // Prettier 규칙 적용
    },
  },
  {
    ignores: ['node_modules', 'dist'], // 무시할 파일 및 디렉터리
  },
];
