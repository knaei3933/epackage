21:56:49.641 Running build in Washington, D.C., USA (East) – iad1
21:56:49.642 Build machine configuration: 2 cores, 8 GB
21:56:49.869 Cloning github.com/knaei3933/epackage (Branch: main, Commit: 5805c48)
21:56:49.870 Previous build caches not available.
21:57:01.157 Cloning completed: 11.288s
21:57:01.929 Running "vercel build"
21:57:02.516 Vercel CLI 50.15.1
21:57:03.075 Running "install" command: `npm install`...
21:57:07.519 npm warn deprecated scmp@2.1.0: Just use Node.js's crypto.timingSafeEqual()
21:57:07.578 npm warn deprecated rimraf@2.7.1: Rimraf versions prior to v4 are no longer supported
21:57:08.576 npm warn deprecated lodash.isequal@4.5.0: This package is deprecated. Use require('node:util').isDeepStrictEqual instead.
21:57:09.026 npm warn deprecated inflight@1.0.6: This module is not supported, and leaks memory. Do not use it. Check out lru-cache if you want a good and tested way to coalesce async requests by a key value, which is much more comprehensive and powerful.
21:57:10.846 npm warn deprecated fstream@1.0.12: This package is no longer supported.
21:57:11.060 npm warn deprecated node-domexception@1.0.0: Use your platform's native DOMException instead
21:57:11.378 npm warn deprecated @supabase/auth-helpers-shared@0.7.0: This package is now deprecated - please use the @supabase/ssr package instead.
21:57:12.975 npm warn deprecated @supabase/auth-helpers-nextjs@0.10.0: This package is now deprecated - please use the @supabase/ssr package instead.
21:57:14.316 npm warn deprecated glob@7.2.3: Glob versions prior to v9 are no longer supported
21:57:14.450 npm warn deprecated glob@7.2.3: Glob versions prior to v9 are no longer supported
21:57:14.451 npm warn deprecated glob@7.2.3: Glob versions prior to v9 are no longer supported
21:57:15.445 npm warn deprecated glob@7.2.3: Glob versions prior to v9 are no longer supported
21:57:18.721 npm warn deprecated @mswjs/data@0.16.2: Package no longer supported. Contact Support at https://www.npmjs.com/support for more info.
21:57:39.711 npm warn deprecated next@15.1.6: This version has a security vulnerability. Please upgrade to a patched version. See https://nextjs.org/blog/CVE-2025-66478 for more details.
21:57:40.942 
21:57:40.943 added 1398 packages, and audited 1399 packages in 38s
21:57:40.944 
21:57:40.944 241 packages are looking for funding
21:57:40.944   run `npm fund` for details
21:57:41.092 
21:57:41.093 26 vulnerabilities (3 moderate, 21 high, 2 critical)
21:57:41.093 
21:57:41.093 To address issues that do not require attention, run:
21:57:41.093   npm audit fix
21:57:41.093 
21:57:41.093 To address all issues (including breaking changes), run:
21:57:41.093   npm audit fix --force
21:57:41.093 
21:57:41.093 Run `npm audit` for details.
21:57:41.301 Detected Next.js version: 15.1.6
21:57:41.303 Running "npm run build"
21:57:41.456 
21:57:41.457 > epackage-lab-web@0.1.0 build
21:57:41.457 > next build
21:57:41.457 
21:57:42.037 Attention: Next.js now collects completely anonymous telemetry regarding usage.
21:57:42.038 This information is used to shape Next.js' roadmap and prioritize features.
21:57:42.039 You can learn more, including how to opt-out if you'd not like to participate in this anonymous program, by visiting the following URL:
21:57:42.039 https://nextjs.org/telemetry
21:57:42.040 
21:57:42.107    ▲ Next.js 15.1.6
21:57:42.107 
21:57:42.152    Creating an optimized production build ...
21:58:23.942  ⚠ Compiled with warnings
21:58:23.943 
21:58:23.944 ./node_modules/handlebars/lib/index.js
21:58:23.944 require.extensions is not supported by webpack. Use a loader instead.
21:58:23.944 
21:58:23.945 Import trace for requested module:
21:58:23.945 ./node_modules/handlebars/lib/index.js
21:58:23.945 ./src/app/api/contract/pdf/route.ts
21:58:23.946 
21:58:23.946 ./node_modules/handlebars/lib/index.js
21:58:23.946 require.extensions is not supported by webpack. Use a loader instead.
21:58:23.947 
21:58:23.947 Import trace for requested module:
21:58:23.947 ./node_modules/handlebars/lib/index.js
21:58:23.948 ./src/app/api/contract/pdf/route.ts
21:58:23.948 
21:58:23.948 ./node_modules/handlebars/lib/index.js
21:58:23.949 require.extensions is not supported by webpack. Use a loader instead.
21:58:23.949 
21:58:23.949 Import trace for requested module:
21:58:23.950 ./node_modules/handlebars/lib/index.js
21:58:23.951 ./src/app/api/contract/pdf/route.ts
21:58:23.951 
21:58:28.967 <w> [webpack.cache.PackFileCacheStrategy] Serializing big strings (130kiB) impacts deserialization performance (consider using Buffer instead and decode when needed)
21:58:29.281  ⚠ Compiled with warnings
21:58:29.281 
21:58:29.282 ./node_modules/@supabase/realtime-js/dist/module/lib/websocket-factory.js
21:58:29.282 A Node.js API is used (process.versions at line: 39) which is not supported in the Edge Runtime.
21:58:29.283 Learn more: https://nextjs.org/docs/api-reference/edge-runtime
21:58:29.283 
21:58:29.283 Import trace for requested module:
21:58:29.283 ./node_modules/@supabase/realtime-js/dist/module/lib/websocket-factory.js
21:58:29.283 ./node_modules/@supabase/realtime-js/dist/module/index.js
21:58:29.283 ./node_modules/@supabase/supabase-js/dist/index.mjs
21:58:29.284 ./node_modules/@supabase/ssr/dist/module/createBrowserClient.js
21:58:29.284 ./node_modules/@supabase/ssr/dist/module/index.js
21:58:29.284 
21:58:29.284 ./node_modules/@supabase/supabase-js/dist/index.mjs
21:58:29.284 A Node.js API is used (process.version at line: 395) which is not supported in the Edge Runtime.
21:58:29.285 Learn more: https://nextjs.org/docs/api-reference/edge-runtime
21:58:29.285 
21:58:29.285 Import trace for requested module:
21:58:29.285 ./node_modules/@supabase/supabase-js/dist/index.mjs
21:58:29.285 ./node_modules/@supabase/ssr/dist/module/createBrowserClient.js
21:58:29.285 ./node_modules/@supabase/ssr/dist/module/index.js
21:58:29.285 
21:58:51.330 <w> [webpack.cache.PackFileCacheStrategy] Skipped not serializable cache item 'Compilation/modules|/vercel/path0/node_modules/next/dist/build/webpack/loaders/css-loader/src/index.js??ruleSet[1].rules[13].oneOf[10].use[2]!/vercel/path0/node_modules/next/dist/build/webpack/loaders/postcss-loader/src/index.js??ruleSet[1].rules[13].oneOf[10].use[3]!/vercel/path0/src/app/globals.css': No serializer registered for Warning
21:58:51.331 <w> while serializing webpack/lib/cache/PackFileCacheStrategy.PackContentItems -> webpack/lib/NormalModule -> Array { 1 items } -> webpack/lib/ModuleWarning -> Warning
21:58:53.121  ⚠ Compiled with warnings
21:58:53.123 
21:58:53.123 ./src/app/globals.css.webpack[javascript/auto]!=!./node_modules/next/dist/build/webpack/loaders/css-loader/src/index.js??ruleSet[1].rules[13].oneOf[10].use[2]!./node_modules/next/dist/build/webpack/loaders/postcss-loader/src/index.js??ruleSet[1].rules[13].oneOf[10].use[3]!./src/app/globals.css
21:58:53.124 Warning
21:58:53.124 
21:58:53.124 (837:5) autoprefixer: Replace color-adjust to print-color-adjust. The color-adjust shorthand is currently deprecated.
21:58:53.125 
21:58:53.125 Import trace for requested module:
21:58:53.125 ./src/app/globals.css.webpack[javascript/auto]!=!./node_modules/next/dist/build/webpack/loaders/css-loader/src/index.js??ruleSet[1].rules[13].oneOf[10].use[2]!./node_modules/next/dist/build/webpack/loaders/postcss-loader/src/index.js??ruleSet[1].rules[13].oneOf[10].use[3]!./src/app/globals.css
21:58:53.126 ./src/app/globals.css
21:58:53.126 
21:58:53.240  ✓ Compiled successfully
21:58:53.242    Skipping validation of types
21:58:53.243    Linting ...
21:58:53.508    Collecting page data ...
21:58:54.892 [Email] Production mode - configuring email service
21:58:54.892 [Email] SendGrid not configured
21:58:54.893 [Email] No email service configured - using console fallback
21:58:55.020 [EpackMailer] No SMTP configured - using console fallback
21:58:55.499 Error: Supabase service credentials not configured
21:58:55.500     at A (.next/server/chunks/4166.js:1:3739)
21:58:55.500     at new c (.next/server/app/api/admin/shipments/[id]/tracking/route.js:1:4719)
21:58:55.500     at <unknown> (.next/server/app/api/admin/shipments/[id]/tracking/route.js:1:10835)
21:58:55.500     at t.a (.next/server/webpack-runtime.js:1:918)
21:58:55.500     at 86128 (.next/server/app/api/admin/shipments/[id]/tracking/route.js:1:4546)
21:58:55.500     at t (.next/server/webpack-runtime.js:1:143)
21:58:55.500     at <unknown> (.next/server/app/api/admin/shipments/[id]/tracking/route.js:1:1524)
21:58:55.500     at t.a (.next/server/webpack-runtime.js:1:918)
21:58:55.500     at 38194 (.next/server/app/api/admin/shipments/[id]/tracking/route.js:1:1414)
21:58:55.500     at t (.next/server/webpack-runtime.js:1:143)
21:58:55.500     at <unknown> (.next/server/app/api/admin/shipments/[id]/tracking/route.js:1:819)
21:58:55.501     at t.a (.next/server/webpack-runtime.js:1:918)
21:58:55.501     at 24532 (.next/server/app/api/admin/shipments/[id]/tracking/route.js:1:640)
21:58:55.501     at t (.next/server/webpack-runtime.js:1:143)
21:58:55.501     at a (.next/server/app/api/admin/shipments/[id]/tracking/route.js:1:10934)
21:58:55.501     at <unknown> (.next/server/app/api/admin/shipments/[id]/tracking/route.js:1:10976)
21:58:55.504 
21:58:55.504 > Build error occurred
21:58:55.507 [Error: Failed to collect page data for /api/admin/shipments/[id]/tracking] {
21:58:55.507   type: 'Error'
21:58:55.508 }
21:58:55.542 Error: Command "npm run build" exited with 1