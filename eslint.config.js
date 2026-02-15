/**
 * ESLint Flat Config for ESLint v9
 * Next.js 16 + TypeScript + React 19
 */

const { FlatCompat } = require('@eslint/eslintrc')
const js = require('@eslint/js')

const compat = new FlatCompat({
  baseDirectory: __dirname,
})

module.exports = [
  // Base JavaScript rules
  js.configs.recommended,

  // Next.js config (using compat to convert the old config)
  ...compat.extends('next/core-web-vitals', 'next/typescript'),

  {
    ignores: [
      'node_modules/**',
      '.next/**',
      'out/**',
      'build/**',
      'dist/**',
      '*.config.js',
      '*.config.ts',
      'server/**',
      '.vscode/**',
      'coverage/**',
      'scripts/**',
      'public/**',
    ],
  },

  {
    rules: {
      // TypeScript specific rules
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          ignoreRestSiblings: true,
        },
      ],
      '@typescript-eslint/no-explicit-any': 'warn',

      // React specific rules
      'react/prop-types': 'off',
      'react/react-in-jsx-scope': 'off',
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',

      // General rules
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'prefer-const': 'warn',
      'no-var': 'error',
    },
  },

  {
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
      globals: {
        ...require('globals').node,
        ...require('globals').browser,
      },
    },
  },
]
