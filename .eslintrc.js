// .eslintrc
module.exports = {
  parser: '@typescript-eslint/parser',
  ignorePatterns: ['.eslintrc.js'],
  parserOptions: {
    ecmaVersion: 12,
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'prettier',
    'plugin:react-hooks/recommended',
  ],

  rules: {
    '@typescript-eslint/no-unused-vars': 'error',
  },

  env: {
    browser: true,
    es2021: true,
  },
};
