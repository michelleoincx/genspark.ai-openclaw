/** @type {import('jest').Config} */
export default {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  extensionsToTreatAsEsm: ['.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@background/(.*)$': '<rootDir>/src/background/$1',
    '^@content/(.*)$': '<rootDir>/src/content/$1',
    '^@popup/(.*)$': '<rootDir>/src/popup/$1',
    '^@utils/(.*)$': '<rootDir>/src/utils/$1',
    '^@api/(.*)$': '<rootDir>/src/api/$1',
    'webextension-polyfill': '<rootDir>/tests/__mocks__/webextension-polyfill.ts',
  },
  transform: {
    '^.+\\.ts$': ['ts-jest', { useESM: true }],
  },
  collectCoverageFrom: ['src/**/*.ts'],
  coverageDirectory: 'coverage',
  testMatch: ['**/tests/**/*.test.ts'],
};
