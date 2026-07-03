// Jest setup file (setupFiles 用: テストフレームワーク globals 注入前に実行)
// ※ 本プロジェクトは package.json に "type":"module" が無く CommonJS 扱いのため、
//    ESM の import ではなく require を使用する（import は SyntaxError になる）。
// ※ @testing-library/jest-dom は expect 等 Jest globals を必要とするため、
//    setupFiles（globals 注入前）ではなく setupFilesAfterEnv（注入後）で読み込む。
//    このファイルでは globals 不要な polyfill のみを置く。
//
// ※ Web API（fetch/Request/Response/performance/stream 等）の polyfill は
//    カスタム環境 jest-jsdom-env.js の setup() で注入する（setupFiles の VM 境界では
//    performance 等の jsdom 管理プロパティの上書きが反映されないため）。
const { TextEncoder, TextDecoder } = require('util');

// Node環境でjsdom使用時に欠落する TextEncoder/TextDecoder をポリフィル
// （@testing-library/react 等が内部で依存）
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;
