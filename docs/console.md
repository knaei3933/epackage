22:10:58.025 Running build in Washington, D.C., USA (East) – iad1
22:10:58.031 Build machine configuration: 2 cores, 8 GB
22:10:58.247 Cloning github.com/knaei3933/epackage (Branch: main, Commit: 9560963)
22:10:58.248 Previous build caches not available.
22:11:09.673 Cloning completed: 11.426s
22:11:10.476 Running "vercel build"
22:11:11.072 Vercel CLI 50.15.1
22:11:11.613 Running "install" command: `npm install`...
22:11:15.874 npm warn deprecated scmp@2.1.0: Just use Node.js's crypto.timingSafeEqual()
22:11:16.125 npm warn deprecated rimraf@2.7.1: Rimraf versions prior to v4 are no longer supported
22:11:17.135 npm warn deprecated lodash.isequal@4.5.0: This package is deprecated. Use require('node:util').isDeepStrictEqual instead.
22:11:17.643 npm warn deprecated inflight@1.0.6: This module is not supported, and leaks memory. Do not use it. Check out lru-cache if you want a good and tested way to coalesce async requests by a key value, which is much more comprehensive and powerful.
22:11:19.439 npm warn deprecated fstream@1.0.12: This package is no longer supported.
22:11:19.589 npm warn deprecated node-domexception@1.0.0: Use your platform's native DOMException instead
22:11:20.162 npm warn deprecated @supabase/auth-helpers-shared@0.7.0: This package is now deprecated - please use the @supabase/ssr package instead.
22:11:21.837 npm warn deprecated @supabase/auth-helpers-nextjs@0.10.0: This package is now deprecated - please use the @supabase/ssr package instead.
22:11:23.153 npm warn deprecated glob@7.2.3: Glob versions prior to v9 are no longer supported
22:11:23.267 npm warn deprecated glob@7.2.3: Glob versions prior to v9 are no longer supported
22:11:23.268 npm warn deprecated glob@7.2.3: Glob versions prior to v9 are no longer supported
22:11:24.219 npm warn deprecated glob@7.2.3: Glob versions prior to v9 are no longer supported
22:11:27.434 npm warn deprecated @mswjs/data@0.16.2: Package no longer supported. Contact Support at https://www.npmjs.com/support for more info.
22:11:48.822 npm warn deprecated next@15.1.6: This version has a security vulnerability. Please upgrade to a patched version. See https://nextjs.org/blog/CVE-2025-66478 for more details.
22:11:50.231 
22:11:50.231 added 1398 packages, and audited 1399 packages in 38s
22:11:50.236 
22:11:50.236 241 packages are looking for funding
22:11:50.237   run `npm fund` for details
22:11:50.369 
22:11:50.369 26 vulnerabilities (3 moderate, 21 high, 2 critical)
22:11:50.370 
22:11:50.370 To address issues that do not require attention, run:
22:11:50.370   npm audit fix
22:11:50.370 
22:11:50.370 To address all issues (including breaking changes), run:
22:11:50.370   npm audit fix --force
22:11:50.370 
22:11:50.371 Run `npm audit` for details.
22:11:50.480 Detected Next.js version: 15.1.6
22:11:50.481 Running "npm run build"
22:11:50.583 
22:11:50.583 > epackage-lab-web@0.1.0 build
22:11:50.583 > next build
22:11:50.584 
22:11:51.156 Attention: Next.js now collects completely anonymous telemetry regarding usage.
22:11:51.156 This information is used to shape Next.js' roadmap and prioritize features.
22:11:51.157 You can learn more, including how to opt-out if you'd not like to participate in this anonymous program, by visiting the following URL:
22:11:51.157 https://nextjs.org/telemetry
22:11:51.157 
22:11:51.223    ▲ Next.js 15.1.6
22:11:51.223 
22:11:51.269    Creating an optimized production build ...
22:12:36.088  ⚠ Compiled with warnings
22:12:36.089 
22:12:36.089 ./node_modules/handlebars/lib/index.js
22:12:36.089 require.extensions is not supported by webpack. Use a loader instead.
22:12:36.090 
22:12:36.090 Import trace for requested module:
22:12:36.090 ./node_modules/handlebars/lib/index.js
22:12:36.090 ./src/app/api/contract/pdf/route.ts
22:12:36.090 
22:12:36.091 ./node_modules/handlebars/lib/index.js
22:12:36.091 require.extensions is not supported by webpack. Use a loader instead.
22:12:36.091 
22:12:36.091 Import trace for requested module:
22:12:36.091 ./node_modules/handlebars/lib/index.js
22:12:36.091 ./src/app/api/contract/pdf/route.ts
22:12:36.092 
22:12:36.092 ./node_modules/handlebars/lib/index.js
22:12:36.092 require.extensions is not supported by webpack. Use a loader instead.
22:12:36.092 
22:12:36.092 Import trace for requested module:
22:12:36.093 ./node_modules/handlebars/lib/index.js
22:12:36.093 ./src/app/api/contract/pdf/route.ts
22:12:36.093 
22:12:41.474 <w> [webpack.cache.PackFileCacheStrategy] Serializing big strings (130kiB) impacts deserialization performance (consider using Buffer instead and decode when needed)
22:12:41.806  ⚠ Compiled with warnings
22:12:41.808 
22:12:41.808 ./node_modules/@supabase/realtime-js/dist/module/lib/websocket-factory.js
22:12:41.809 A Node.js API is used (process.versions at line: 39) which is not supported in the Edge Runtime.
22:12:41.809 Learn more: https://nextjs.org/docs/api-reference/edge-runtime
22:12:41.809 
22:12:41.810 Import trace for requested module:
22:12:41.810 ./node_modules/@supabase/realtime-js/dist/module/lib/websocket-factory.js
22:12:41.810 ./node_modules/@supabase/realtime-js/dist/module/index.js
22:12:41.810 ./node_modules/@supabase/supabase-js/dist/index.mjs
22:12:41.811 ./node_modules/@supabase/ssr/dist/module/createBrowserClient.js
22:12:41.811 ./node_modules/@supabase/ssr/dist/module/index.js
22:12:41.811 
22:12:41.812 ./node_modules/@supabase/supabase-js/dist/index.mjs
22:12:41.812 A Node.js API is used (process.version at line: 395) which is not supported in the Edge Runtime.
22:12:41.812 Learn more: https://nextjs.org/docs/api-reference/edge-runtime
22:12:41.812 
22:12:41.813 Import trace for requested module:
22:12:41.813 ./node_modules/@supabase/supabase-js/dist/index.mjs
22:12:41.813 ./node_modules/@supabase/ssr/dist/module/createBrowserClient.js
22:12:41.813 ./node_modules/@supabase/ssr/dist/module/index.js
22:12:41.814 
22:12:47.511 request to https://fonts.gstatic.com/s/geist/v4/gyByhwUxId8gMEwYGFWNOITddY4.woff2 failed, reason: 
22:12:47.511 
22:12:47.511 Retrying 1/3...
22:12:47.518 request to https://fonts.gstatic.com/s/geist/v4/gyByhwUxId8gMEwSGFWNOITddY4.woff2 failed, reason: 
22:12:47.518 
22:12:47.518 Retrying 1/3...
22:12:47.518 request to https://fonts.gstatic.com/s/geist/v4/gyByhwUxId8gMEwcGFWNOITd.woff2 failed, reason: 
22:12:47.518 
22:12:47.518 Retrying 1/3...
22:13:06.797 <w> [webpack.cache.PackFileCacheStrategy] Skipped not serializable cache item 'Compilation/modules|/vercel/path0/node_modules/next/dist/build/webpack/loaders/css-loader/src/index.js??ruleSet[1].rules[13].oneOf[10].use[2]!/vercel/path0/node_modules/next/dist/build/webpack/loaders/postcss-loader/src/index.js??ruleSet[1].rules[13].oneOf[10].use[3]!/vercel/path0/src/app/globals.css': No serializer registered for Warning
22:13:06.797 <w> while serializing webpack/lib/cache/PackFileCacheStrategy.PackContentItems -> webpack/lib/NormalModule -> Array { 1 items } -> webpack/lib/ModuleWarning -> Warning
22:13:08.768  ⚠ Compiled with warnings
22:13:08.769 
22:13:08.769 ./src/app/globals.css.webpack[javascript/auto]!=!./node_modules/next/dist/build/webpack/loaders/css-loader/src/index.js??ruleSet[1].rules[13].oneOf[10].use[2]!./node_modules/next/dist/build/webpack/loaders/postcss-loader/src/index.js??ruleSet[1].rules[13].oneOf[10].use[3]!./src/app/globals.css
22:13:08.769 Warning
22:13:08.772 
22:13:08.772 (837:5) autoprefixer: Replace color-adjust to print-color-adjust. The color-adjust shorthand is currently deprecated.
22:13:08.772 
22:13:08.772 Import trace for requested module:
22:13:08.773 ./src/app/globals.css.webpack[javascript/auto]!=!./node_modules/next/dist/build/webpack/loaders/css-loader/src/index.js??ruleSet[1].rules[13].oneOf[10].use[2]!./node_modules/next/dist/build/webpack/loaders/postcss-loader/src/index.js??ruleSet[1].rules[13].oneOf[10].use[3]!./src/app/globals.css
22:13:08.773 ./src/app/globals.css
22:13:08.773 
22:13:08.873  ✓ Compiled successfully
22:13:08.876    Skipping validation of types
22:13:08.876    Linting ...
22:13:09.168    Collecting page data ...
22:13:10.635 [EpackMailer] No SMTP configured - using console fallback
22:13:10.836 [Email] Production mode - configuring email service
22:13:10.837 [Email] SendGrid not configured
22:13:10.837 [Email] No email service configured - using console fallback
22:13:10.976 [createServiceClient] Credentials not configured, using mock client
22:13:11.829 [AccountDeletionEmail] Configuring email service
22:13:11.830 [AccountDeletionEmail] SendGrid not configured
22:13:11.831 [AccountDeletionEmail] No email service configured - using console fallback
22:13:12.023 Error: Missing Supabase environment variables
22:13:12.023     at 3681 (.next/server/app/api/member/quotations/[id]/invoice/route.js:1:1320)
22:13:12.024     at t (.next/server/webpack-runtime.js:1:143)
22:13:12.024     at r (.next/server/app/api/member/quotations/[id]/invoice/route.js:23:2316)
22:13:12.025     at <unknown> (.next/server/app/api/member/quotations/[id]/invoice/route.js:23:2353)
22:13:12.025     at t.X (.next/server/webpack-runtime.js:1:2214)
22:13:12.025     at <unknown> (.next/server/app/api/member/quotations/[id]/invoice/route.js:23:2329)
22:13:12.025     at Object.<anonymous> (.next/server/app/api/member/quotations/[id]/invoice/route.js:23:2380)
22:13:12.028 
22:13:12.028 > Build error occurred
22:13:12.032 [Error: Failed to collect page data for /api/member/quotations/[id]/invoice] {
22:13:12.032   type: 'Error'
22:13:12.033 }
22:13:12.070 Error: Command "npm run build" exited with 1