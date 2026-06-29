// jest 30 + jest-environment-jsdom カスタム環境
// 目的: jsdom VM 環境に Node ネイティブの Web API グローバルを注入する。
//
// 背景: jest 30.2.0 + jest-environment-jsdom 30.2.0 では、jsdom VM サンドボックスの
// globalThis に Node ネイティブの fetch/Request/Response/performance/stream 系が露出しない。
// setupFiles で global に代入しても、performance 等 jsdom が管理するプロパティは
// VM 境界で上書きされ反映されないため、環境の setup() で this.global に直接注入する。
//
// withErrorHandler（new Response(...)）・API route テスト・supabase クライアント等、
// fetch API を必須とするテストが多数あるため必須の polyfill。

const { TestEnvironment } = require('jest-environment-jsdom');
const { performance: nodePerf } = require('perf_hooks');
const { ReadableStream, WritableStream, TransformStream, TextEncoderStream, TextDecoderStream } = require('stream/web');
const { MessageChannel, MessagePort } = require('worker_threads');
const { webcrypto } = require('crypto');
const { Blob, File } = require('buffer');
const { setImmediate, clearImmediate } = require('timers');
const { fetch, Request, Response, Headers, FormData } = require('undici');

class JsdomWithNodeGlobalsEnvironment extends TestEnvironment {
  async setup() {
    await super.setup();
    const g = this.global;

    // performance（jsdom のものを Node 実装で置換。undici が markResourceTiming を使用）
    g.performance = nodePerf;

    // stream/web グローバル（undici/Node fetch が依存）
    g.ReadableStream = g.ReadableStream || ReadableStream;
    g.WritableStream = g.WritableStream || WritableStream;
    g.TransformStream = g.TransformStream || TransformStream;
    g.TextEncoderStream = g.TextEncoderStream || TextEncoderStream;
    g.TextDecoderStream = g.TextDecoderStream || TextDecoderStream;

    // worker_threads グローバル（undici が依存）
    g.MessageChannel = g.MessageChannel || MessageChannel;
    g.MessagePort = g.MessagePort || MessagePort;

    // crypto / Blob / File
    // jsdom の File は arrayBuffer() を持たない（aiFileParser 等が file.arrayBuffer() を呼ぶ）ため、
    // Node ネイティブの File（arrayBuffer/text/stream 対応）で強制上書きする。Blob も同様。
    g.crypto = g.crypto || webcrypto;
    g.Blob = Blob;
    g.File = File;

    // timers グローバル（jsdom 環境に setImmediate/clearImmediate がない）
    g.setImmediate = g.setImmediate || setImmediate;
    g.clearImmediate = g.clearImmediate || clearImmediate;

    // Web Fetch API
    g.fetch = g.fetch || fetch;
    g.Request = g.Request || Request;
    g.Response = g.Response || Response;
    g.Headers = g.Headers || Headers;
    g.FormData = g.FormData || FormData;
  }

  async teardown() {
    await super.teardown();
  }
}

module.exports = JsdomWithNodeGlobalsEnvironment;
