module.exports = {
  root: true,
  // This tells ESLint to load the config from the package.json files
  extends: ['eslint:recommended', '@typescript-eslint/recommended'],
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: 'module',
  },
  env: {
    es6: true,
    node: true,
  },
  ignorePatterns: [
    'node_modules/',
    'dist/',
    '.next/',
    'build/',
    '*.config.js',
  ],
  rules: {
    '@typescript-eslint/no-unused-vars': 'error',
    '@typescript-eslint/no-explicit-any': 'warn',
    'prefer-const': 'error',
    'no-var': 'error',
  },
}