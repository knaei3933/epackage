/** Narrow Jest config for the G001 performance foundation. */
module.exports = {
  rootDir: '../..',
  roots: ['<rootDir>/tests/performance'],
  testEnvironment: 'node',
  testMatch: ['<rootDir>/tests/performance/**/*.test.ts'],
  modulePaths: process.env.PERFORMANCE_JEST_MODULE_PATH ? [process.env.PERFORMANCE_JEST_MODULE_PATH] : [],
  transform: {
    '^.+\\.(ts|tsx)$': [process.env.PERFORMANCE_SWC_JEST_PATH || '@swc/jest', {
      jsc: {
        parser: { syntax: 'typescript', tsx: true },
        transform: { react: { runtime: 'automatic' } },
      },
    }],
  },
  moduleNameMapper: { '^@/(.*)$': '<rootDir>/src/$1' },
};
