module.exports = {
  preset: 'ts-jest',
  // jsdom VM 環境に Node ネイティブの Web API（fetch/Response/performance/stream 等）を
  // 注入するカスタム環境。詳細は jest-jsdom-env.js を参照。
  testEnvironment: '<rootDir>/jest-jsdom-env.js',
  setupFiles: ['<rootDir>/jest.setup.js'],
  // @testing-library/jest-dom は expect 等 Jest globals を拡張するため、
  // setupFiles（globals 注入前）ではなく setupFilesAfterEnv（注入後）で読み込む
  setupFilesAfterEnv: ['<rootDir>/jest.setupAfterEnv.js'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  transform: {
    '^.+\\.(ts|tsx)$': ['@swc/jest', {
      jsc: {
        parser: {
          syntax: 'typescript',
          tsx: true,
        },
        transform: {
          react: {
            runtime: 'automatic',
          },
        },
      },
    }],
  },
  testMatch: [
    '**/__tests__/**/*.(test|spec).(ts|tsx|js)',
    '**/*.(test|spec).(ts|tsx|js)',
  ],
  // jest 非対象のテストを除外
  // - tests/e2e: Playwright E2E テスト（jest 環境では @playwright/test の import に失敗する）
  // - server:    server/ 配下は別プロジェクト（独立 package.json）
  // - scripts:   補助スクリプト（実行用ツール）
  testPathIgnorePatterns: [
    '/node_modules/',
    '/tests/e2e/',
    '/server/',
    '/scripts/',
    '/.next/',
  ],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.{ts,tsx}',
    '!src/**/__tests__/**',
  ],
};
