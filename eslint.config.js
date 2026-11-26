import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import jsxA11y from 'eslint-plugin-jsx-a11y';

export default tseslint.config(
  {
    ignores: [
      'dist',
      'storybook-static',
      'node_modules',
      '*.config.*',
      '.storybook',
      '.github/tests',
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['**/*.{ts,tsx}'],
    plugins: {
      react,
      'react-hooks': reactHooks,
      'jsx-a11y': jsxA11y,
    },
    languageOptions: {
      parserOptions: {
        ecmaFeatures: { jsx: true },
        project: './tsconfig.json',
      },
    },
    settings: {
      react: { version: '18.3' },
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      ...jsxA11y.configs.recommended.rules,
      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'off',
      // SOLID / single-purpose component enforcement
      '@typescript-eslint/no-explicit-any': 'error',
      // Single-purpose functions: keep cyclomatic complexity low
      complexity: ['error', { max: 20 }],
      // Small functions; skip blank/comment lines for realistic budgets
      'max-lines-per-function': ['error', { max: 200, skipBlankLines: true, skipComments: true }],
      // Shallow nesting depth guardrail
      'max-depth': ['error', 5],
      // DRY — no duplicate import statements
      'no-duplicate-imports': 'error',
      // React composition best practices for small components
      'react/jsx-key': 'error',
      'react/jsx-no-duplicate-props': 'error',
      'react/no-unstable-nested-components': 'error',
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    },
  },
  {
    // Strict budgets for shared UI primitives — small single-purpose components
    files: ['src/components/**/*.{ts,tsx}'],
    rules: {
      complexity: ['error', { max: 10 }],
      'max-lines-per-function': ['error', { max: 60, skipBlankLines: true, skipComments: true }],
      'max-depth': ['error', 4],
    },
  },
  {
    // Storybook demo files get a documented, looser demo budget; refactor toward shared patterns
    files: ['src/stories/**/*.{ts,tsx}'],
    rules: {
      complexity: ['error', { max: 30 }],
      'max-lines-per-function': ['error', { max: 400, skipBlankLines: true, skipComments: true }],
      'max-depth': ['error', 6],
    },
  },
  {
    files: ['**/*.{js,jsx}'],
    plugins: {
      react,
      'react-hooks': reactHooks,
      'jsx-a11y': jsxA11y,
    },
    languageOptions: {
      ecmaFeatures: { jsx: true },
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      ...jsxA11y.configs.recommended.rules,
      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'off',
    },
  }
);
