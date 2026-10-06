// ESLint config for FailTwin (Expo SDK 51 + TypeScript).
//
// Uses the official Expo shared config (eslint-config-expo), which bundles the
// TypeScript parser/plugin and React Native rules. Installed with the rest of
// the devDependencies via `npm install`.
//
// `npm run lint` -> `eslint . --ext .ts,.tsx`.
module.exports = {
  root: true,
  extends: ['expo'],
  ignorePatterns: [
    'node_modules/',
    '.expo/',
    'dist/',
    'web-build/',
    '.verify-out/',
    // Offline verification harness uses hand-rolled stubs & intentional
    // any/require shims; it is not shipped and is excluded from linting.
    'verify/',
  ],
  rules: {
    // Project conventions.
    'import/order': 'off',
  },
};
