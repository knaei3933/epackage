// Polyfill fetch API for MSW in Node.js environment
// This file must be loaded before any imports that use MSW

// TextEncoder/TextDecoder polyfill (required by MSW)
const { TextEncoder, TextDecoder } = require('util');
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Try Node.js built-in undici (Node 18+)
try {
  const { Response, Headers, Request, fetch } = require('node:undici');

  // Always polyfill for jsdom environment compatibility
  global.Response = global.Response || Response;
  global.Headers = global.Headers || Headers;
  global.Request = global.Request || Request;
  global.fetch = global.fetch || fetch;
} catch (e) {
  // Try undici package (older Node versions)
  try {
    const { Response, Headers, Request, fetch } = require('undici');

    global.Response = global.Response || Response;
    global.Headers = global.Headers || Headers;
    global.Request = global.Request || Request;
    global.fetch = global.fetch || fetch;
  } catch (e2) {
    // Final fallback - use whatwg-url and node-fetch if available
    console.warn('undici not available, using minimal fetch polyfill');

    // Minimal polyfill that satisfies MSW requirements
    if (!global.Response) {
      global.Response = class Response {
        constructor(body, init = {}) {
          this.body = body;
          this.status = init.status || 200;
          this.statusText = init.statusText || 'OK';
          this.headers = new Headers(init.headers);
        }
        static json(data) {
          return new Response(JSON.stringify(data), {
            headers: { 'Content-Type': 'application/json' },
          });
        }
        async json() {
          return JSON.parse(this.body);
        }
        async text() {
          return this.body;
        }
      };
    }

    if (!global.Headers) {
      global.Headers = class Headers {
        constructor(init = {}) {
          this._map = new Map();
          if (Array.isArray(init)) {
            init.forEach(([key, value]) => this._map.set(key, value));
          } else if (init) {
            Object.entries(init).forEach(([key, value]) => this._map.set(key, value));
          }
        }
        set(key, value) {
          this._map.set(key, value);
        }
        get(key) {
          return this._map.get(key);
        }
        has(key) {
          return this._map.has(key);
        }
        delete(key) {
          this._map.delete(key);
        }
        entries() {
          return this._map.entries();
        }
      };
    }

    if (!global.Request) {
      global.Request = class Request {
        constructor(input, init = {}) {
          this.url = typeof input === 'string' ? input : input.url;
          this.method = init.method || 'GET';
          this.headers = new Headers(init.headers);
          this.body = init.body;
        }
      };
    }

    if (!global.fetch) {
      global.fetch = async () => {
        throw new Error('fetch not properly polyfilled');
      };
    }
  }
}
