20:56:38.317 Running build in Washington, D.C., USA (East) – iad1
20:56:38.317 Build machine configuration: 2 cores, 8 GB
20:56:38.467 Cloning github.com/knaei3933/epackage (Branch: main, Commit: 84b0dc1)
20:56:38.468 Previous build caches not available.
20:56:49.633 Cloning completed: 11.166s
20:56:50.352 Running "vercel build"
20:56:50.939 Vercel CLI 50.15.1
20:56:51.500 Running "install" command: `npm install`...
20:56:55.907 npm warn deprecated scmp@2.1.0: Just use Node.js's crypto.timingSafeEqual()
20:56:55.971 npm warn deprecated rimraf@2.7.1: Rimraf versions prior to v4 are no longer supported
20:56:56.847 npm warn deprecated lodash.isequal@4.5.0: This package is deprecated. Use require('node:util').isDeepStrictEqual instead.
20:56:57.306 npm warn deprecated inflight@1.0.6: This module is not supported, and leaks memory. Do not use it. Check out lru-cache if you want a good and tested way to coalesce async requests by a key value, which is much more comprehensive and powerful.
20:56:59.419 npm warn deprecated fstream@1.0.12: This package is no longer supported.
20:56:59.721 npm warn deprecated @supabase/auth-helpers-shared@0.7.0: This package is now deprecated - please use the @supabase/ssr package instead.
20:57:00.073 npm warn deprecated node-domexception@1.0.0: Use your platform's native DOMException instead
20:57:01.478 npm warn deprecated @supabase/auth-helpers-nextjs@0.10.0: This package is now deprecated - please use the @supabase/ssr package instead.
20:57:02.258 npm warn deprecated glob@7.2.3: Glob versions prior to v9 are no longer supported
20:57:02.508 npm warn deprecated glob@7.2.3: Glob versions prior to v9 are no longer supported
20:57:02.539 npm warn deprecated glob@7.2.3: Glob versions prior to v9 are no longer supported
20:57:03.293 npm warn deprecated glob@7.2.3: Glob versions prior to v9 are no longer supported
20:57:06.905 npm warn deprecated @mswjs/data@0.16.2: Package no longer supported. Contact Support at https://www.npmjs.com/support for more info.
20:57:27.386 npm warn deprecated next@15.1.6: This version has a security vulnerability. Please upgrade to a patched version. See https://nextjs.org/blog/CVE-2025-66478 for more details.
20:57:28.806 
20:57:28.808 added 1398 packages, and audited 1399 packages in 37s
20:57:28.808 
20:57:28.808 241 packages are looking for funding
20:57:28.809   run `npm fund` for details
20:57:28.957 
20:57:28.958 26 vulnerabilities (3 moderate, 21 high, 2 critical)
20:57:28.958 
20:57:28.958 To address issues that do not require attention, run:
20:57:28.959   npm audit fix
20:57:28.959 
20:57:28.959 To address all issues (including breaking changes), run:
20:57:28.959   npm audit fix --force
20:57:28.959 
20:57:28.959 Run `npm audit` for details.
20:57:29.287 Detected Next.js version: 15.1.6
20:57:29.287 Running "npm run build"
20:57:29.383 
20:57:29.384 > epackage-lab-web@0.1.0 build
20:57:29.385 > next build
20:57:29.385 
20:57:29.947 Attention: Next.js now collects completely anonymous telemetry regarding usage.
20:57:29.948 This information is used to shape Next.js' roadmap and prioritize features.
20:57:29.948 You can learn more, including how to opt-out if you'd not like to participate in this anonymous program, by visiting the following URL:
20:57:29.949 https://nextjs.org/telemetry
20:57:29.949 
20:57:30.014    ▲ Next.js 15.1.6
20:57:30.015 
20:57:30.060    Creating an optimized production build ...
20:58:12.030  ⚠ Compiled with warnings
20:58:12.030 
20:58:12.031 ./node_modules/handlebars/lib/index.js
20:58:12.031 require.extensions is not supported by webpack. Use a loader instead.
20:58:12.032 
20:58:12.032 Import trace for requested module:
20:58:12.032 ./node_modules/handlebars/lib/index.js
20:58:12.032 ./src/app/api/contract/pdf/route.ts
20:58:12.033 
20:58:12.033 ./node_modules/handlebars/lib/index.js
20:58:12.033 require.extensions is not supported by webpack. Use a loader instead.
20:58:12.033 
20:58:12.033 Import trace for requested module:
20:58:12.033 ./node_modules/handlebars/lib/index.js
20:58:12.033 ./src/app/api/contract/pdf/route.ts
20:58:12.033 
20:58:12.034 ./node_modules/handlebars/lib/index.js
20:58:12.034 require.extensions is not supported by webpack. Use a loader instead.
20:58:12.034 
20:58:12.034 Import trace for requested module:
20:58:12.034 ./node_modules/handlebars/lib/index.js
20:58:12.035 ./src/app/api/contract/pdf/route.ts
20:58:12.035 
20:58:17.187 <w> [webpack.cache.PackFileCacheStrategy] Serializing big strings (130kiB) impacts deserialization performance (consider using Buffer instead and decode when needed)
20:58:17.492  ⚠ Compiled with warnings
20:58:17.493 
20:58:17.494 ./node_modules/@supabase/realtime-js/dist/module/lib/websocket-factory.js
20:58:17.494 A Node.js API is used (process.versions at line: 39) which is not supported in the Edge Runtime.
20:58:17.494 Learn more: https://nextjs.org/docs/api-reference/edge-runtime
20:58:17.494 
20:58:17.495 Import trace for requested module:
20:58:17.495 ./node_modules/@supabase/realtime-js/dist/module/lib/websocket-factory.js
20:58:17.495 ./node_modules/@supabase/realtime-js/dist/module/index.js
20:58:17.495 ./node_modules/@supabase/supabase-js/dist/index.mjs
20:58:17.496 ./node_modules/@supabase/ssr/dist/module/createBrowserClient.js
20:58:17.496 ./node_modules/@supabase/ssr/dist/module/index.js
20:58:17.496 
20:58:17.496 ./node_modules/@supabase/supabase-js/dist/index.mjs
20:58:17.497 A Node.js API is used (process.version at line: 395) which is not supported in the Edge Runtime.
20:58:17.497 Learn more: https://nextjs.org/docs/api-reference/edge-runtime
20:58:17.497 
20:58:17.497 Import trace for requested module:
20:58:17.497 ./node_modules/@supabase/supabase-js/dist/index.mjs
20:58:17.498 ./node_modules/@supabase/ssr/dist/module/createBrowserClient.js
20:58:17.498 ./node_modules/@supabase/ssr/dist/module/index.js
20:58:17.498 
20:58:40.092 <w> [webpack.cache.PackFileCacheStrategy] Skipped not serializable cache item 'Compilation/modules|/vercel/path0/node_modules/next/dist/build/webpack/loaders/css-loader/src/index.js??ruleSet[1].rules[13].oneOf[10].use[2]!/vercel/path0/node_modules/next/dist/build/webpack/loaders/postcss-loader/src/index.js??ruleSet[1].rules[13].oneOf[10].use[3]!/vercel/path0/src/app/globals.css': No serializer registered for Warning
20:58:40.093 <w> while serializing webpack/lib/cache/PackFileCacheStrategy.PackContentItems -> webpack/lib/NormalModule -> Array { 1 items } -> webpack/lib/ModuleWarning -> Warning
20:58:42.043  ⚠ Compiled with warnings
20:58:42.043 
20:58:42.044 ./src/app/globals.css.webpack[javascript/auto]!=!./node_modules/next/dist/build/webpack/loaders/css-loader/src/index.js??ruleSet[1].rules[13].oneOf[10].use[2]!./node_modules/next/dist/build/webpack/loaders/postcss-loader/src/index.js??ruleSet[1].rules[13].oneOf[10].use[3]!./src/app/globals.css
20:58:42.044 Warning
20:58:42.044 
20:58:42.044 (837:5) autoprefixer: Replace color-adjust to print-color-adjust. The color-adjust shorthand is currently deprecated.
20:58:42.045 
20:58:42.045 Import trace for requested module:
20:58:42.045 ./src/app/globals.css.webpack[javascript/auto]!=!./node_modules/next/dist/build/webpack/loaders/css-loader/src/index.js??ruleSet[1].rules[13].oneOf[10].use[2]!./node_modules/next/dist/build/webpack/loaders/postcss-loader/src/index.js??ruleSet[1].rules[13].oneOf[10].use[3]!./src/app/globals.css
20:58:42.045 ./src/app/globals.css
20:58:42.045 
20:58:42.144  ✓ Compiled successfully
20:58:42.154    Skipping validation of types
20:58:42.155    Linting ...
20:58:42.433    Collecting page data ...
20:58:44.082 [Email] Production mode - configuring email service
20:58:44.083 [Email] SendGrid not configured
20:58:44.084 [Email] No email service configured - using console fallback
20:58:44.107 [EpackMailer] No SMTP configured - using console fallback
20:58:44.238 Error: Missing Supabase environment variables
20:58:44.239     at 25399 (.next/server/app/api/admin/orders/[id]/shipping-info/route.js:1:1026)
20:58:44.239     at t (.next/server/webpack-runtime.js:1:143)
20:58:44.239     at t (.next/server/app/api/admin/orders/[id]/shipping-info/route.js:1:3140)
20:58:44.239     at <unknown> (.next/server/app/api/admin/orders/[id]/shipping-info/route.js:1:3172)
20:58:44.239     at t.X (.next/server/webpack-runtime.js:1:2214)
20:58:44.239     at <unknown> (.next/server/app/api/admin/orders/[id]/shipping-info/route.js:1:3153)
20:58:44.239     at Object.<anonymous> (.next/server/app/api/admin/orders/[id]/shipping-info/route.js:1:3200)
20:58:44.243 
20:58:44.243 > Build error occurred
20:58:44.247 [Error: Failed to collect page data for /api/admin/orders/[id]/shipping-info] {
20:58:44.248   type: 'Error'
20:58:44.248 }
20:58:44.283 Error: Command "npm run build" exited with 1