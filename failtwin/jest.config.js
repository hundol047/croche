// RN/component tests use the jest-expo preset (run on a networked machine
// after `npm install`). Pure-TS logic tests run via ts-jest and need no RN.
module.exports = {
  projects: [
    {
      displayName: 'logic',
      preset: 'ts-jest',
      testEnvironment: 'node',
      testMatch: ['<rootDir>/__tests__/**/*.test.ts'],
      moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/src/$1',
      },
      transform: {
        '^.+\\.tsx?$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.logic.json' }],
      },
    },
    {
      displayName: 'components',
      preset: 'jest-expo',
      testMatch: ['<rootDir>/__tests__/**/*.test.tsx'],
      moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/src/$1',
      },
      transformIgnorePatterns: [
        'node_modules/(?!((jest-)?react-native|@react-native(-community)?|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg))',
      ],
    },
  ],
};
