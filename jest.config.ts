import type { Config } from 'jest';

/**
 * Jest is scoped to the backend (domain / application / infra) — the code that
 * holds the business logic. UI components are intentionally out of the test
 * scope for this time-box (see README), so we only pick up `*.test.ts` files.
 */
const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/*.test.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  clearMocks: true,
  collectCoverageFrom: [
    'src/shared/**/*.ts',
    'src/contexts/**/*.ts',
    '!src/**/*.test.ts',
    '!src/contexts/**/tests/**',
  ],
};

export default config;
