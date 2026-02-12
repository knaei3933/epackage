22:46:41.518 Running build in Washington, D.C., USA (East) – iad1
22:46:41.519 Build machine configuration: 2 cores, 8 GB
22:46:41.732 Cloning github.com/knaei3933/epackage (Branch: main, Commit: a23ffa5)
22:46:41.734 Previous build caches not available.
22:46:53.203 Cloning completed: 11.471s
22:46:54.148 Running "vercel build"
22:46:54.746 Vercel CLI 50.15.1
22:46:55.441 Running "install" command: `npm install`...
22:46:59.818 npm warn deprecated scmp@2.1.0: Just use Node.js's crypto.timingSafeEqual()
22:47:00.105 npm warn deprecated rimraf@2.7.1: Rimraf versions prior to v4 are no longer supported
22:47:01.019 npm warn deprecated lodash.isequal@4.5.0: This package is deprecated. Use require('node:util').isDeepStrictEqual instead.
22:47:01.527 npm warn deprecated inflight@1.0.6: This module is not supported, and leaks memory. Do not use it. Check out lru-cache if you want a good and tested way to coalesce async requests by a key value, which is much more comprehensive and powerful.
22:47:03.075 npm warn deprecated fstream@1.0.12: This package is no longer supported.
22:47:03.144 npm warn deprecated node-domexception@1.0.0: Use your platform's native DOMException instead
22:47:04.162 npm warn deprecated @supabase/auth-helpers-shared@0.7.0: This package is now deprecated - please use the @supabase/ssr package instead.
22:47:05.329 npm warn deprecated @supabase/auth-helpers-nextjs@0.10.0: This package is now deprecated - please use the @supabase/ssr package instead.
22:47:07.429 npm warn deprecated glob@7.2.3: Glob versions prior to v9 are no longer supported
22:47:07.563 npm warn deprecated glob@7.2.3: Glob versions prior to v9 are no longer supported
22:47:07.563 npm warn deprecated glob@7.2.3: Glob versions prior to v9 are no longer supported
22:47:08.446 npm warn deprecated glob@7.2.3: Glob versions prior to v9 are no longer supported
22:47:11.846 npm warn deprecated @mswjs/data@0.16.2: Package no longer supported. Contact Support at https://www.npmjs.com/support for more info.
22:47:33.321 npm warn deprecated next@15.1.6: This version has a security vulnerability. Please upgrade to a patched version. See https://nextjs.org/blog/CVE-2025-66478 for more details.
22:47:34.614 
22:47:34.618 added 1398 packages, and audited 1399 packages in 39s
22:47:34.618 
22:47:34.619 241 packages are looking for funding
22:47:34.619   run `npm fund` for details
22:47:34.759 
22:47:34.760 26 vulnerabilities (3 moderate, 21 high, 2 critical)
22:47:34.760 
22:47:34.761 To address issues that do not require attention, run:
22:47:34.761   npm audit fix
22:47:34.761 
22:47:34.761 To address all issues (including breaking changes), run:
22:47:34.762   npm audit fix --force
22:47:34.762 
22:47:34.762 Run `npm audit` for details.
22:47:34.872 Detected Next.js version: 15.1.6
22:47:34.876 Running "npm run build"
22:47:34.974 
22:47:34.974 > epackage-lab-web@0.1.0 build
22:47:34.974 > next build
22:47:34.975 
22:47:35.552 Attention: Next.js now collects completely anonymous telemetry regarding usage.
22:47:35.553 This information is used to shape Next.js' roadmap and prioritize features.
22:47:35.553 You can learn more, including how to opt-out if you'd not like to participate in this anonymous program, by visiting the following URL:
22:47:35.553 https://nextjs.org/telemetry
22:47:35.554 
22:47:35.618    ▲ Next.js 15.1.6
22:47:35.619 
22:47:35.667    Creating an optimized production build ...
22:48:19.440  ⚠ Compiled with warnings
22:48:19.440 
22:48:19.440 ./node_modules/handlebars/lib/index.js
22:48:19.440 require.extensions is not supported by webpack. Use a loader instead.
22:48:19.441 
22:48:19.441 Import trace for requested module:
22:48:19.441 ./node_modules/handlebars/lib/index.js
22:48:19.441 ./src/app/api/contract/pdf/route.ts
22:48:19.441 
22:48:19.442 ./node_modules/handlebars/lib/index.js
22:48:19.442 require.extensions is not supported by webpack. Use a loader instead.
22:48:19.442 
22:48:19.442 Import trace for requested module:
22:48:19.443 ./node_modules/handlebars/lib/index.js
22:48:19.443 ./src/app/api/contract/pdf/route.ts
22:48:19.443 
22:48:19.443 ./node_modules/handlebars/lib/index.js
22:48:19.443 require.extensions is not supported by webpack. Use a loader instead.
22:48:19.444 
22:48:19.444 Import trace for requested module:
22:48:19.444 ./node_modules/handlebars/lib/index.js
22:48:19.444 ./src/app/api/contract/pdf/route.ts
22:48:19.444 
22:48:24.809 <w> [webpack.cache.PackFileCacheStrategy] Serializing big strings (130kiB) impacts deserialization performance (consider using Buffer instead and decode when needed)
22:48:25.136  ⚠ Compiled with warnings
22:48:25.137 
22:48:25.137 ./node_modules/@supabase/realtime-js/dist/module/lib/websocket-factory.js
22:48:25.138 A Node.js API is used (process.versions at line: 39) which is not supported in the Edge Runtime.
22:48:25.138 Learn more: https://nextjs.org/docs/api-reference/edge-runtime
22:48:25.138 
22:48:25.139 Import trace for requested module:
22:48:25.139 ./node_modules/@supabase/realtime-js/dist/module/lib/websocket-factory.js
22:48:25.139 ./node_modules/@supabase/realtime-js/dist/module/index.js
22:48:25.139 ./node_modules/@supabase/supabase-js/dist/index.mjs
22:48:25.140 ./node_modules/@supabase/ssr/dist/module/createBrowserClient.js
22:48:25.140 ./node_modules/@supabase/ssr/dist/module/index.js
22:48:25.140 
22:48:25.141 ./node_modules/@supabase/supabase-js/dist/index.mjs
22:48:25.141 A Node.js API is used (process.version at line: 395) which is not supported in the Edge Runtime.
22:48:25.141 Learn more: https://nextjs.org/docs/api-reference/edge-runtime
22:48:25.141 
22:48:25.142 Import trace for requested module:
22:48:25.142 ./node_modules/@supabase/supabase-js/dist/index.mjs
22:48:25.142 ./node_modules/@supabase/ssr/dist/module/createBrowserClient.js
22:48:25.142 ./node_modules/@supabase/ssr/dist/module/index.js
22:48:25.143 
22:48:49.498 <w> [webpack.cache.PackFileCacheStrategy] Skipped not serializable cache item 'Compilation/modules|/vercel/path0/node_modules/next/dist/build/webpack/loaders/css-loader/src/index.js??ruleSet[1].rules[13].oneOf[10].use[2]!/vercel/path0/node_modules/next/dist/build/webpack/loaders/postcss-loader/src/index.js??ruleSet[1].rules[13].oneOf[10].use[3]!/vercel/path0/src/app/globals.css': No serializer registered for Warning
22:48:49.499 <w> while serializing webpack/lib/cache/PackFileCacheStrategy.PackContentItems -> webpack/lib/NormalModule -> Array { 1 items } -> webpack/lib/ModuleWarning -> Warning
22:48:51.497  ⚠ Compiled with warnings
22:48:51.498 
22:48:51.499 ./src/app/globals.css.webpack[javascript/auto]!=!./node_modules/next/dist/build/webpack/loaders/css-loader/src/index.js??ruleSet[1].rules[13].oneOf[10].use[2]!./node_modules/next/dist/build/webpack/loaders/postcss-loader/src/index.js??ruleSet[1].rules[13].oneOf[10].use[3]!./src/app/globals.css
22:48:51.499 Warning
22:48:51.499 
22:48:51.500 (837:5) autoprefixer: Replace color-adjust to print-color-adjust. The color-adjust shorthand is currently deprecated.
22:48:51.500 
22:48:51.500 Import trace for requested module:
22:48:51.501 ./src/app/globals.css.webpack[javascript/auto]!=!./node_modules/next/dist/build/webpack/loaders/css-loader/src/index.js??ruleSet[1].rules[13].oneOf[10].use[2]!./node_modules/next/dist/build/webpack/loaders/postcss-loader/src/index.js??ruleSet[1].rules[13].oneOf[10].use[3]!./src/app/globals.css
22:48:51.501 ./src/app/globals.css
22:48:51.504 
22:48:51.603  ✓ Compiled successfully
22:48:51.607    Skipping validation of types
22:48:51.607    Linting ...
22:48:51.892    Collecting page data ...
22:48:53.512 [Email] Production mode - configuring email service
22:48:53.517 [Email] SendGrid not configured
22:48:53.517 [Email] No email service configured - using console fallback
22:48:53.586 [EpackMailer] No SMTP configured - using console fallback
22:48:53.995 [createServiceClient] Credentials not configured, using mock client
22:48:54.589 [AccountDeletionEmail] Configuring email service
22:48:54.591 [AccountDeletionEmail] SendGrid not configured
22:48:54.591 [AccountDeletionEmail] No email service configured - using console fallback
22:48:55.022  ⚠ Using edge runtime on a page currently disables static generation for that page
22:49:04.102    Generating static pages (0/84) ...
22:49:05.439 Error occurred prerendering page "/_not-found". Read more: https://nextjs.org/docs/messages/prerender-error
22:49:05.440 Error: Supabase credentials not configured
22:49:05.441     at /vercel/path0/.next/server/chunks/1653.js:247:89434
22:49:05.441 Export encountered an error on /_not-found/page: /_not-found, exiting the build.
22:49:05.446  ⨯ Static worker exited with code: 1 and signal: null
22:49:05.513 Error: Command "npm run build" exited with 1