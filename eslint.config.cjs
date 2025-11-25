// eslint.config.cjs
// Flat config for ESLint v9+
// This mirrors the previous .eslintrc.cjs intent (node env, ESM, prettier integration)

const nodePlugin = require('eslint-plugin-node');
const prettierPlugin = require('eslint-plugin-prettier');

module.exports = [
  // Basic language options for all files
  {
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        // Node globals we commonly use (readonly)
        console: 'readonly',
        process: 'readonly',
        Buffer: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        global: 'readonly',
        module: 'readonly',
        exports: 'readonly',
      },
    },
    // Apply to all JS files
    files: ['**/*.js'],
  },

  // Main rules + plugins
  {
    files: ['**/*.js'],
    // register plugins (these must be installed)
    plugins: {
      node: nodePlugin,
      prettier: prettierPlugin,
    },
    rules: {
      // formatting: let prettier report formatting errors
      'prettier/prettier': 'error',

      // quality rules roughly matching your old config
      'no-console': 'off',
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      'prefer-const': 'warn',
      'no-var': 'error',
      // node plugin rule to allow ESM modules
      'node/no-unsupported-features/es-syntax': 'off',
    },
  },

  // Optional: disallow unused eslint-disable comments
  {
    linterOptions: {
      reportUnusedDisableDirectives: true,
    },
  },
];
