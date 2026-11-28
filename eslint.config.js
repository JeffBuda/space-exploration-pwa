import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import reactRefresh from 'eslint-plugin-react-refresh';
import boundaries from 'eslint-plugin-boundaries';
import globals from 'globals';
import eslintConfigPrettier from 'eslint-config-prettier';

export default tseslint.config(
  {
    ignores: [
      'dist',
      'storybook-static',
      'node_modules',
      'playwright-report',
      'test-results',
      'dev-dist',
      '*.config.*',
      '.storybook',
      '.github/tests',
    ],
  },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      sourceType: 'module',
      parserOptions: {
        ecmaFeatures: { jsx: true },
        project: './tsconfig.json',
      },
    },
    plugins: {
      react,
      'react-hooks': reactHooks,
      'jsx-a11y': jsxA11y,
      'react-refresh': reactRefresh,
      boundaries: boundaries,
    },
    settings: {
      react: { version: '18.3' },
      'import/resolver': {
        typescript: {
          alwaysTryTypes: true,
        },
      },
      'boundaries/elements': [
        { type: 'engine', pattern: 'src/engine/**' },
        { type: 'db', pattern: 'src/db/**' },
        { type: 'utils', pattern: 'src/utils/**' },
        { type: 'hooks', pattern: 'src/hooks/**' },
        { type: 'components', pattern: 'src/components/**' },
        { type: 'e2e', pattern: 'tests/e2e/**' },
      ],
      'boundaries/files': [{ category: 'test', pattern: 'src/**/*.test.{ts,tsx}' }],
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      ...jsxA11y.configs.recommended.rules,
      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'off',
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
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
      // ---- Ban Math.random() — use crypto.getRandomValues() for entropy,
      // ---- or createSeededRNG() from src/utils/rng.ts for deterministic RNG ----
      'no-restricted-properties': [
        'error',
        {
          object: 'Math',
          property: 'random',
          message:
            'Math.random() is banned project-wide. Use crypto.getRandomValues() for entropy, or createSeededRNG() from src/utils/rng.ts for deterministic randomness.',
        },
      ],
      // ---- Architectural boundary enforcement ----
      'boundaries/dependencies': [
        'error',
        {
          default: 'allow',
          policies: [
            // Engine: pure layer — must not depend on db, hooks, components
            {
              from: { element: { type: 'engine' } },
              disallow: {
                to: {
                  element: { types: ['db', 'hooks', 'components'] },
                },
              },
            },
            // Db: persistence layer — must not depend on any other internal layer
            {
              from: { element: { type: 'db' } },
              disallow: {
                to: {
                  element: {
                    types: ['engine', 'hooks', 'components', 'utils'],
                  },
                },
              },
            },
            // Components: presentation layer — must not import engine or db directly
            // Test files (category: 'test') are exempt from boundary checks
            {
              from: { element: { type: 'components' }, file: { categories: '!test' } },
              disallow: {
                to: { element: { types: ['engine', 'db'] } },
              },
            },
            // Hooks: must not depend on components
            {
              from: { element: { type: 'hooks' } },
              disallow: {
                to: {
                  element: { types: ['components'] },
                },
              },
            },
            // Utils: pure utilities — must not depend on any other internal layer
            {
              from: { element: { type: 'utils' } },
              disallow: {
                to: {
                  element: {
                    types: ['engine', 'db', 'hooks', 'components'],
                  },
                },
              },
            },
            // No file (source or test) should import from test files
            {
              disallow: {
                to: { file: { categories: 'test' } },
              },
            },
            // E2E tests: interact with the app via browser UI only — must NOT
            // import from any internal source layer (engine, db, hooks, utils,
            // components). See docs/e2e-testing-guide.md §3 for the
            // injectGameState-before-page.goto pattern.
            {
              from: { element: { type: 'e2e' } },
              disallow: {
                to: {
                  element: {
                    types: ['engine', 'db', 'hooks', 'utils', 'components'],
                  },
                },
              },
            },
          ],
        },
      ],
    },
  },
  // Strict budgets for shared UI primitives — small single-purpose components
  {
    files: ['src/components/**/*.{ts,tsx}'],
    rules: {
      complexity: ['error', { max: 10 }],
      'max-lines-per-function': ['error', { max: 60, skipBlankLines: true, skipComments: true }],
      'max-depth': ['error', 4],
    },
  },
  // Storybook demo files get a documented, looser demo budget; refactor toward shared patterns
  {
    files: ['src/stories/**/*.{ts,tsx}'],
    rules: {
      complexity: ['error', { max: 30 }],
      'max-lines-per-function': ['error', { max: 400, skipBlankLines: true, skipComments: true }],
      'max-depth': ['error', 6],
    },
  },
  // ---- Code-level restrictions for the engine layer ----
  // Engine must not use localStorage/sessionStorage, must use IndexedDB via db layer
  // Engine must not access window/document — must remain pure
  // Engine must not use Date — pass currentTime as parameter for determinism
  {
    files: ['src/engine/**/*.ts'],
    rules: {
      'no-restricted-globals': [
        'error',
        {
          name: 'localStorage',
          message: 'Engine must not use localStorage — use IndexedDB via db layer',
        },
        {
          name: 'sessionStorage',
          message: 'Engine must not use sessionStorage — use IndexedDB via db layer',
        },
        {
          name: 'window',
          message: 'Engine must not access window — the engine layer must be pure',
        },
        {
          name: 'document',
          message: 'Engine must not access document — the engine layer must be pure',
        },
        {
          name: 'Date',
          message: 'Engine must not use Date — pass currentTime as a parameter for determinism',
        },
      ],
    },
  },
  // ---- Code-level restrictions for the db layer ----
  // DB layer must use IndexedDB only
  {
    files: ['src/db/**/*.ts'],
    rules: {
      'no-restricted-globals': [
        'error',
        {
          name: 'localStorage',
          message: 'DB layer must not use localStorage — use IndexedDB only',
        },
        {
          name: 'sessionStorage',
          message: 'DB layer must not use sessionStorage — use IndexedDB only',
        },
      ],
    },
  },
  // ---- E2E test restrictions ----
  // tests/e2e/*.spec.ts must inject deterministic seeds via injectGameState —
  // never override or call crypto.getRandomValues directly. See docs/e2e-testing-guide.md §3.
  {
    files: ['tests/e2e/**/*.ts'],
    rules: {
      'no-restricted-syntax': [
        'error',
        {
          selector:
            "AssignmentExpression[left.type='MemberExpression'][left.object.name='crypto'][left.property.name='getRandomValues']",
          message:
            'Do not override crypto.getRandomValues in E2E tests. Inject a deterministic rngSeed via injectGameState(page, { rngSeed: "test-seed", starMap: null }) before page.goto("/"). See docs/e2e-testing-guide.md §3.',
        },
        {
          selector:
            "CallExpression[callee.type='MemberExpression'][callee.object.name='crypto'][callee.property.name='getRandomValues']",
          message:
            'Do not call crypto.getRandomValues in E2E tests. Inject a deterministic rngSeed via injectGameState instead. See docs/e2e-testing-guide.md §3.',
        },
      ],
    },
  },
  // JavaScript/JSX files (non-TypeScript)
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
  },
  eslintConfigPrettier
);
