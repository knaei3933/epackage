20:42:25.503 Running build in Washington, D.C., USA (East) – iad1
20:42:25.503 Build machine configuration: 2 cores, 8 GB
20:42:25.630 Cloning github.com/knaei3933/epackage (Branch: main, Commit: 105eedd)
20:42:25.631 Previous build caches not available.
20:42:36.853 Cloning completed: 11.223s
20:42:37.654 Running "vercel build"
20:42:38.231 Vercel CLI 50.15.1
20:42:38.785 Running "install" command: `npm install`...
20:42:43.176 npm warn deprecated scmp@2.1.0: Just use Node.js's crypto.timingSafeEqual()
20:42:43.228 npm warn deprecated rimraf@2.7.1: Rimraf versions prior to v4 are no longer supported
20:42:43.995 npm warn deprecated lodash.isequal@4.5.0: This package is deprecated. Use require('node:util').isDeepStrictEqual instead.
20:42:44.406 npm warn deprecated inflight@1.0.6: This module is not supported, and leaks memory. Do not use it. Check out lru-cache if you want a good and tested way to coalesce async requests by a key value, which is much more comprehensive and powerful.
20:42:46.432 npm warn deprecated fstream@1.0.12: This package is no longer supported.
20:42:46.863 npm warn deprecated @supabase/auth-helpers-shared@0.7.0: This package is now deprecated - please use the @supabase/ssr package instead.
20:42:46.951 npm warn deprecated node-domexception@1.0.0: Use your platform's native DOMException instead
20:42:48.326 npm warn deprecated @supabase/auth-helpers-nextjs@0.10.0: This package is now deprecated - please use the @supabase/ssr package instead.
20:42:49.537 npm warn deprecated glob@7.2.3: Glob versions prior to v9 are no longer supported
20:42:49.801 npm warn deprecated glob@7.2.3: Glob versions prior to v9 are no longer supported
20:42:49.828 npm warn deprecated glob@7.2.3: Glob versions prior to v9 are no longer supported
20:42:50.505 npm warn deprecated glob@7.2.3: Glob versions prior to v9 are no longer supported
20:42:53.800 npm warn deprecated @mswjs/data@0.16.2: Package no longer supported. Contact Support at https://www.npmjs.com/support for more info.
20:43:13.726 npm warn deprecated next@15.1.6: This version has a security vulnerability. Please upgrade to a patched version. See https://nextjs.org/blog/CVE-2025-66478 for more details.
20:43:15.031 
20:43:15.034 added 1398 packages, and audited 1399 packages in 36s
20:43:15.035 
20:43:15.035 241 packages are looking for funding
20:43:15.035   run `npm fund` for details
20:43:15.184 
20:43:15.185 26 vulnerabilities (3 moderate, 21 high, 2 critical)
20:43:15.185 
20:43:15.185 To address issues that do not require attention, run:
20:43:15.185   npm audit fix
20:43:15.185 
20:43:15.185 To address all issues (including breaking changes), run:
20:43:15.185   npm audit fix --force
20:43:15.185 
20:43:15.185 Run `npm audit` for details.
20:43:15.481 Detected Next.js version: 15.1.6
20:43:15.482 Running "npm run build"
20:43:15.709 
20:43:15.709 > epackage-lab-web@0.1.0 build
20:43:15.709 > next build
20:43:15.709 
20:43:16.675 Attention: Next.js now collects completely anonymous telemetry regarding usage.
20:43:16.676 This information is used to shape Next.js' roadmap and prioritize features.
20:43:16.676 You can learn more, including how to opt-out if you'd not like to participate in this anonymous program, by visiting the following URL:
20:43:16.676 https://nextjs.org/telemetry
20:43:16.676 
20:43:16.738    ▲ Next.js 15.1.6
20:43:16.739 
20:43:16.782    Creating an optimized production build ...
20:43:56.016  ⚠ Compiled with warnings
20:43:56.017 
20:43:56.017 ./node_modules/handlebars/lib/index.js
20:43:56.017 require.extensions is not supported by webpack. Use a loader instead.
20:43:56.017 
20:43:56.018 Import trace for requested module:
20:43:56.018 ./node_modules/handlebars/lib/index.js
20:43:56.018 ./src/app/api/contract/pdf/route.ts
20:43:56.018 
20:43:56.018 ./node_modules/handlebars/lib/index.js
20:43:56.018 require.extensions is not supported by webpack. Use a loader instead.
20:43:56.018 
20:43:56.019 Import trace for requested module:
20:43:56.019 ./node_modules/handlebars/lib/index.js
20:43:56.019 ./src/app/api/contract/pdf/route.ts
20:43:56.019 
20:43:56.019 ./node_modules/handlebars/lib/index.js
20:43:56.019 require.extensions is not supported by webpack. Use a loader instead.
20:43:56.020 
20:43:56.020 Import trace for requested module:
20:43:56.020 ./node_modules/handlebars/lib/index.js
20:43:56.020 ./src/app/api/contract/pdf/route.ts
20:43:56.020 
20:44:00.996 <w> [webpack.cache.PackFileCacheStrategy] Serializing big strings (130kiB) impacts deserialization performance (consider using Buffer instead and decode when needed)
20:44:01.311  ⚠ Compiled with warnings
20:44:01.311 
20:44:01.311 ./node_modules/@supabase/realtime-js/dist/module/lib/websocket-factory.js
20:44:01.311 A Node.js API is used (process.versions at line: 39) which is not supported in the Edge Runtime.
20:44:01.311 Learn more: https://nextjs.org/docs/api-reference/edge-runtime
20:44:01.311 
20:44:01.311 Import trace for requested module:
20:44:01.311 ./node_modules/@supabase/realtime-js/dist/module/lib/websocket-factory.js
20:44:01.311 ./node_modules/@supabase/realtime-js/dist/module/index.js
20:44:01.311 ./node_modules/@supabase/supabase-js/dist/index.mjs
20:44:01.311 ./node_modules/@supabase/ssr/dist/module/createBrowserClient.js
20:44:01.312 ./node_modules/@supabase/ssr/dist/module/index.js
20:44:01.312 
20:44:01.312 ./node_modules/@supabase/supabase-js/dist/index.mjs
20:44:01.312 A Node.js API is used (process.version at line: 395) which is not supported in the Edge Runtime.
20:44:01.312 Learn more: https://nextjs.org/docs/api-reference/edge-runtime
20:44:01.312 
20:44:01.312 Import trace for requested module:
20:44:01.312 ./node_modules/@supabase/supabase-js/dist/index.mjs
20:44:01.312 ./node_modules/@supabase/ssr/dist/module/createBrowserClient.js
20:44:01.312 ./node_modules/@supabase/ssr/dist/module/index.js
20:44:01.312 
20:44:23.820 <w> [webpack.cache.PackFileCacheStrategy] Skipped not serializable cache item 'Compilation/modules|/vercel/path0/node_modules/next/dist/build/webpack/loaders/css-loader/src/index.js??ruleSet[1].rules[13].oneOf[10].use[2]!/vercel/path0/node_modules/next/dist/build/webpack/loaders/postcss-loader/src/index.js??ruleSet[1].rules[13].oneOf[10].use[3]!/vercel/path0/src/app/globals.css': No serializer registered for Warning
20:44:23.821 <w> while serializing webpack/lib/cache/PackFileCacheStrategy.PackContentItems -> webpack/lib/NormalModule -> Array { 1 items } -> webpack/lib/ModuleWarning -> Warning
20:44:25.784  ⚠ Compiled with warnings
20:44:25.785 
20:44:25.786 ./src/app/globals.css.webpack[javascript/auto]!=!./node_modules/next/dist/build/webpack/loaders/css-loader/src/index.js??ruleSet[1].rules[13].oneOf[10].use[2]!./node_modules/next/dist/build/webpack/loaders/postcss-loader/src/index.js??ruleSet[1].rules[13].oneOf[10].use[3]!./src/app/globals.css
20:44:25.786 Warning
20:44:25.786 
20:44:25.786 (837:5) autoprefixer: Replace color-adjust to print-color-adjust. The color-adjust shorthand is currently deprecated.
20:44:25.787 
20:44:25.787 Import trace for requested module:
20:44:25.787 ./src/app/globals.css.webpack[javascript/auto]!=!./node_modules/next/dist/build/webpack/loaders/css-loader/src/index.js??ruleSet[1].rules[13].oneOf[10].use[2]!./node_modules/next/dist/build/webpack/loaders/postcss-loader/src/index.js??ruleSet[1].rules[13].oneOf[10].use[3]!./src/app/globals.css
20:44:25.788 ./src/app/globals.css
20:44:25.790 
20:44:25.878  ✓ Compiled successfully
20:44:25.881    Skipping validation of types
20:44:25.881    Linting ...
20:44:26.157    Collecting page data ...
20:44:27.575 [Email] Production mode - configuring email service
20:44:27.576 [Email] SendGrid not configured
20:44:27.577 [Email] No email service configured - using console fallback
20:44:27.761 [EpackMailer] No SMTP configured - using console fallback
20:44:27.831 Error: Missing Supabase environment variables
20:44:27.833     at 16835 (.next/server/app/api/admin/orders/[id]/payment-confirmation/route.js:1:1858)
20:44:27.833     at t (.next/server/webpack-runtime.js:1:143)
20:44:27.834     at t (.next/server/app/api/admin/orders/[id]/payment-confirmation/route.js:1:6903)
20:44:27.834     at <unknown> (.next/server/app/api/admin/orders/[id]/payment-confirmation/route.js:1:6955)
20:44:27.834     at t.X (.next/server/webpack-runtime.js:1:2214)
20:44:27.834     at <unknown> (.next/server/app/api/admin/orders/[id]/payment-confirmation/route.js:1:6916)
20:44:27.834     at Object.<anonymous> (.next/server/app/api/admin/orders/[id]/payment-confirmation/route.js:1:6983)
20:44:27.835 
20:44:27.835 > Build error occurred
20:44:27.837 [Error: Failed to collect page data for /api/admin/orders/[id]/payment-confirmation] {
20:44:27.837   type: 'Error'
20:44:27.837 }
20:44:27.869 Error: Command "npm run build" exited with 1
========================================
BUILD FIX APPLIED - 2026-02-12 20:46:29
========================================

Fixed module-level environment variable check in:
- src/app/api/admin/orders/[id]/payment-confirmation/route.ts

Change: Moved environment variable check from module level to getSupabaseClient() helper function
This prevents the 'Missing Supabase environment variables' error during build time.

Build Status: PASSING
