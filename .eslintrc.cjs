module.exports = {
  env: {
    node: true,
    es2021: true,
  },
  extends: ['eslint:recommended', 'plugin:node/recommended', 'plugin:prettier/recommended'],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  rules: {
    // basic quality rules - tweak if needed
    'no-console': 'off', // allow console while developing; change to 'warn' for production
    'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    'prefer-const': 'warn',
    'no-var': 'error',
    'node/no-unsupported-features/es-syntax': [
      'error',
      { ignores: ['modules'] }, // for ESM
    ],
  },
};
