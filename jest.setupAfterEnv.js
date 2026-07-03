// Jest setup file (setupFilesAfterEnv 用: テストフレームワーク globals 注入後に実行)
// ※ @testing-library/jest-dom v6 は expect 等 Jest globals を拡張するため、
//    setupFiles（globals 注入前）では "expect is not defined" になる。
//    そのため setupFilesAfterEnv で読み込む。
// ※ CommonJS プロジェクトのため require を使用。
require('@testing-library/jest-dom');
