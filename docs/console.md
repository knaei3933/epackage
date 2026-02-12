22:02:10.766 Running build in Washington, D.C., USA (East) – iad1
22:02:10.767 Build machine configuration: 2 cores, 8 GB
22:02:10.885 Cloning github.com/knaei3933/epackage (Branch: main, Commit: db503e2)
22:02:10.887 Previous build caches not available.
22:02:22.229 Cloning completed: 11.343s
22:02:23.045 Running "vercel build"
22:02:23.641 Vercel CLI 50.15.1
22:02:24.297 Running "install" command: `npm install`...
22:02:28.706 npm warn deprecated scmp@2.1.0: Just use Node.js's crypto.timingSafeEqual()
22:02:28.821 npm warn deprecated rimraf@2.7.1: Rimraf versions prior to v4 are no longer supported
22:02:29.821 npm warn deprecated lodash.isequal@4.5.0: This package is deprecated. Use require('node:util').isDeepStrictEqual instead.
22:02:30.298 npm warn deprecated inflight@1.0.6: This module is not supported, and leaks memory. Do not use it. Check out lru-cache if you want a good and tested way to coalesce async requests by a key value, which is much more comprehensive and powerful.
22:02:31.997 npm warn deprecated fstream@1.0.12: This package is no longer supported.
22:02:32.096 npm warn deprecated node-domexception@1.0.0: Use your platform's native DOMException instead
22:02:32.859 npm warn deprecated @supabase/auth-helpers-shared@0.7.0: This package is now deprecated - please use the @supabase/ssr package instead.
22:02:34.123 npm warn deprecated @supabase/auth-helpers-nextjs@0.10.0: This package is now deprecated - please use the @supabase/ssr package instead.
22:02:36.042 npm warn deprecated glob@7.2.3: Glob versions prior to v9 are no longer supported
22:02:36.166 npm warn deprecated glob@7.2.3: Glob versions prior to v9 are no longer supported
22:02:36.168 npm warn deprecated glob@7.2.3: Glob versions prior to v9 are no longer supported
22:02:37.164 npm warn deprecated glob@7.2.3: Glob versions prior to v9 are no longer supported
22:02:40.327 npm warn deprecated @mswjs/data@0.16.2: Package no longer supported. Contact Support at https://www.npmjs.com/support for more info.
22:03:01.550 npm warn deprecated next@15.1.6: This version has a security vulnerability. Please upgrade to a patched version. See https://nextjs.org/blog/CVE-2025-66478 for more details.
22:03:02.606 
22:03:02.607 added 1398 packages, and audited 1399 packages in 38s
22:03:02.607 
22:03:02.610 241 packages are looking for funding
22:03:02.610   run `npm fund` for details
22:03:02.746 
22:03:02.746 26 vulnerabilities (3 moderate, 21 high, 2 critical)
22:03:02.746 
22:03:02.747 To address issues that do not require attention, run:
22:03:02.747   npm audit fix
22:03:02.747 
22:03:02.748 To address all issues (including breaking changes), run:
22:03:02.748   npm audit fix --force
22:03:02.749 
22:03:02.749 Run `npm audit` for details.
22:03:02.831 Detected Next.js version: 15.1.6
22:03:02.832 Running "npm run build"
22:03:02.931 
22:03:02.935 > epackage-lab-web@0.1.0 build
22:03:02.935 > next build
22:03:02.936 
22:03:03.498 Attention: Next.js now collects completely anonymous telemetry regarding usage.
22:03:03.499 This information is used to shape Next.js' roadmap and prioritize features.
22:03:03.500 You can learn more, including how to opt-out if you'd not like to participate in this anonymous program, by visiting the following URL:
22:03:03.500 https://nextjs.org/telemetry
22:03:03.500 
22:03:03.563    ▲ Next.js 15.1.6
22:03:03.564 
22:03:03.608    Creating an optimized production build ...
22:03:48.351  ⚠ Compiled with warnings
22:03:48.352 
22:03:48.352 ./node_modules/handlebars/lib/index.js
22:03:48.353 require.extensions is not supported by webpack. Use a loader instead.
22:03:48.353 
22:03:48.353 Import trace for requested module:
22:03:48.353 ./node_modules/handlebars/lib/index.js
22:03:48.354 ./src/app/api/contract/pdf/route.ts
22:03:48.354 
22:03:48.355 ./node_modules/handlebars/lib/index.js
22:03:48.355 require.extensions is not supported by webpack. Use a loader instead.
22:03:48.356 
22:03:48.356 Import trace for requested module:
22:03:48.356 ./node_modules/handlebars/lib/index.js
22:03:48.357 ./src/app/api/contract/pdf/route.ts
22:03:48.357 
22:03:48.357 ./node_modules/handlebars/lib/index.js
22:03:48.358 require.extensions is not supported by webpack. Use a loader instead.
22:03:48.358 
22:03:48.358 Import trace for requested module:
22:03:48.359 ./node_modules/handlebars/lib/index.js
22:03:48.360 ./src/app/api/contract/pdf/route.ts
22:03:48.360 
22:03:53.783 <w> [webpack.cache.PackFileCacheStrategy] Serializing big strings (130kiB) impacts deserialization performance (consider using Buffer instead and decode when needed)
22:03:54.125  ⚠ Compiled with warnings
22:03:54.125 
22:03:54.126 ./node_modules/@supabase/realtime-js/dist/module/lib/websocket-factory.js
22:03:54.126 A Node.js API is used (process.versions at line: 39) which is not supported in the Edge Runtime.
22:03:54.126 Learn more: https://nextjs.org/docs/api-reference/edge-runtime
22:03:54.126 
22:03:54.127 Import trace for requested module:
22:03:54.127 ./node_modules/@supabase/realtime-js/dist/module/lib/websocket-factory.js
22:03:54.127 ./node_modules/@supabase/realtime-js/dist/module/index.js
22:03:54.127 ./node_modules/@supabase/supabase-js/dist/index.mjs
22:03:54.127 ./node_modules/@supabase/ssr/dist/module/createBrowserClient.js
22:03:54.128 ./node_modules/@supabase/ssr/dist/module/index.js
22:03:54.128 
22:03:54.128 ./node_modules/@supabase/supabase-js/dist/index.mjs
22:03:54.128 A Node.js API is used (process.version at line: 395) which is not supported in the Edge Runtime.
22:03:54.128 Learn more: https://nextjs.org/docs/api-reference/edge-runtime
22:03:54.128 
22:03:54.129 Import trace for requested module:
22:03:54.129 ./node_modules/@supabase/supabase-js/dist/index.mjs
22:03:54.129 ./node_modules/@supabase/ssr/dist/module/createBrowserClient.js
22:03:54.129 ./node_modules/@supabase/ssr/dist/module/index.js
22:03:54.130 
22:04:18.216 <w> [webpack.cache.PackFileCacheStrategy] Skipped not serializable cache item 'Compilation/modules|/vercel/path0/node_modules/next/dist/build/webpack/loaders/css-loader/src/index.js??ruleSet[1].rules[13].oneOf[10].use[2]!/vercel/path0/node_modules/next/dist/build/webpack/loaders/postcss-loader/src/index.js??ruleSet[1].rules[13].oneOf[10].use[3]!/vercel/path0/src/app/globals.css': No serializer registered for Warning
22:04:18.217 <w> while serializing webpack/lib/cache/PackFileCacheStrategy.PackContentItems -> webpack/lib/NormalModule -> Array { 1 items } -> webpack/lib/ModuleWarning -> Warning
22:04:20.201  ⚠ Compiled with warnings
22:04:20.202 
22:04:20.202 ./src/app/globals.css.webpack[javascript/auto]!=!./node_modules/next/dist/build/webpack/loaders/css-loader/src/index.js??ruleSet[1].rules[13].oneOf[10].use[2]!./node_modules/next/dist/build/webpack/loaders/postcss-loader/src/index.js??ruleSet[1].rules[13].oneOf[10].use[3]!./src/app/globals.css
22:04:20.203 Warning
22:04:20.203 
22:04:20.204 (837:5) autoprefixer: Replace color-adjust to print-color-adjust. The color-adjust shorthand is currently deprecated.
22:04:20.204 
22:04:20.204 Import trace for requested module:
22:04:20.205 ./src/app/globals.css.webpack[javascript/auto]!=!./node_modules/next/dist/build/webpack/loaders/css-loader/src/index.js??ruleSet[1].rules[13].oneOf[10].use[2]!./node_modules/next/dist/build/webpack/loaders/postcss-loader/src/index.js??ruleSet[1].rules[13].oneOf[10].use[3]!./src/app/globals.css
22:04:20.205 ./src/app/globals.css
22:04:20.208 
22:04:20.296  ✓ Compiled successfully
22:04:20.337    Skipping validation of types
22:04:20.338    Linting ...
22:04:20.628    Collecting page data ...
22:04:22.170 [Email] Production mode - configuring email service
22:04:22.171 [Email] SendGrid not configured
22:04:22.172 [Email] No email service configured - using console fallback
22:04:22.310 [EpackMailer] No SMTP configured - using console fallback
22:04:22.829 Error: Supabase service credentials not configured
22:04:22.830     at A (.next/server/chunks/4166.js:1:3739)
22:04:22.830     at new c (.next/server/app/api/admin/shipments/[id]/tracking/route.js:1:5411)
22:04:22.830     at <unknown> (.next/server/app/api/admin/shipments/[id]/tracking/route.js:1:11527)
22:04:22.830     at t.a (.next/server/webpack-runtime.js:1:918)
22:04:22.830     at 86128 (.next/server/app/api/admin/shipments/[id]/tracking/route.js:1:5238)
22:04:22.830     at t (.next/server/webpack-runtime.js:1:143)
22:04:22.831     at <unknown> (.next/server/app/api/admin/shipments/[id]/tracking/route.js:1:1524)
22:04:22.831     at t.a (.next/server/webpack-runtime.js:1:918)
22:04:22.831     at 38194 (.next/server/app/api/admin/shipments/[id]/tracking/route.js:1:1414)
22:04:22.831     at t (.next/server/webpack-runtime.js:1:143)
22:04:22.831     at <unknown> (.next/server/app/api/admin/shipments/[id]/tracking/route.js:1:819)
22:04:22.831     at t.a (.next/server/webpack-runtime.js:1:918)
22:04:22.832     at 24532 (.next/server/app/api/admin/shipments/[id]/tracking/route.js:1:640)
22:04:22.832     at t (.next/server/webpack-runtime.js:1:143)
22:04:22.832     at r (.next/server/app/api/admin/shipments/[id]/tracking/route.js:1:11626)
22:04:22.832     at <unknown> (.next/server/app/api/admin/shipments/[id]/tracking/route.js:1:11668)
22:04:22.834 
22:04:22.835 > Build error occurred
22:04:22.838 [Error: Failed to collect page data for /api/admin/shipments/[id]/tracking] {
22:04:22.838   type: 'Error'
22:04:22.839 }
22:04:22.872 Error: Command "npm run build" exited with 1