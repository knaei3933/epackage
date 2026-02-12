22:07:06.176 Running build in Washington, D.C., USA (East) – iad1
22:07:06.177 Build machine configuration: 2 cores, 8 GB
22:07:06.285 Cloning github.com/knaei3933/epackage (Branch: main, Commit: eee907a)
22:07:06.286 Previous build caches not available.
22:07:18.172 Cloning completed: 11.887s
22:07:18.966 Running "vercel build"
22:07:19.525 Vercel CLI 50.15.1
22:07:20.056 Running "install" command: `npm install`...
22:07:24.159 npm warn deprecated scmp@2.1.0: Just use Node.js's crypto.timingSafeEqual()
22:07:24.228 npm warn deprecated rimraf@2.7.1: Rimraf versions prior to v4 are no longer supported
22:07:25.084 npm warn deprecated lodash.isequal@4.5.0: This package is deprecated. Use require('node:util').isDeepStrictEqual instead.
22:07:25.505 npm warn deprecated inflight@1.0.6: This module is not supported, and leaks memory. Do not use it. Check out lru-cache if you want a good and tested way to coalesce async requests by a key value, which is much more comprehensive and powerful.
22:07:27.036 npm warn deprecated fstream@1.0.12: This package is no longer supported.
22:07:27.061 npm warn deprecated node-domexception@1.0.0: Use your platform's native DOMException instead
22:07:27.726 npm warn deprecated @supabase/auth-helpers-shared@0.7.0: This package is now deprecated - please use the @supabase/ssr package instead.
22:07:28.479 npm warn deprecated @supabase/auth-helpers-nextjs@0.10.0: This package is now deprecated - please use the @supabase/ssr package instead.
22:07:30.491 npm warn deprecated glob@7.2.3: Glob versions prior to v9 are no longer supported
22:07:30.628 npm warn deprecated glob@7.2.3: Glob versions prior to v9 are no longer supported
22:07:30.631 npm warn deprecated glob@7.2.3: Glob versions prior to v9 are no longer supported
22:07:31.306 npm warn deprecated glob@7.2.3: Glob versions prior to v9 are no longer supported
22:07:34.081 npm warn deprecated @mswjs/data@0.16.2: Package no longer supported. Contact Support at https://www.npmjs.com/support for more info.
22:07:53.617 npm warn deprecated next@15.1.6: This version has a security vulnerability. Please upgrade to a patched version. See https://nextjs.org/blog/CVE-2025-66478 for more details.
22:07:54.450 
22:07:54.451 added 1398 packages, and audited 1399 packages in 34s
22:07:54.452 
22:07:54.452 241 packages are looking for funding
22:07:54.452   run `npm fund` for details
22:07:54.582 
22:07:54.582 26 vulnerabilities (3 moderate, 21 high, 2 critical)
22:07:54.583 
22:07:54.583 To address issues that do not require attention, run:
22:07:54.583   npm audit fix
22:07:54.583 
22:07:54.584 To address all issues (including breaking changes), run:
22:07:54.584   npm audit fix --force
22:07:54.584 
22:07:54.585 Run `npm audit` for details.
22:07:54.660 Detected Next.js version: 15.1.6
22:07:54.662 Running "npm run build"
22:07:54.758 
22:07:54.758 > epackage-lab-web@0.1.0 build
22:07:54.758 > next build
22:07:54.758 
22:07:55.292 Attention: Next.js now collects completely anonymous telemetry regarding usage.
22:07:55.293 This information is used to shape Next.js' roadmap and prioritize features.
22:07:55.293 You can learn more, including how to opt-out if you'd not like to participate in this anonymous program, by visiting the following URL:
22:07:55.293 https://nextjs.org/telemetry
22:07:55.293 
22:07:55.353    ▲ Next.js 15.1.6
22:07:55.353 
22:07:55.395    Creating an optimized production build ...
22:08:34.637  ⚠ Compiled with warnings
22:08:34.637 
22:08:34.638 ./node_modules/handlebars/lib/index.js
22:08:34.638 require.extensions is not supported by webpack. Use a loader instead.
22:08:34.638 
22:08:34.638 Import trace for requested module:
22:08:34.638 ./node_modules/handlebars/lib/index.js
22:08:34.639 ./src/app/api/contract/pdf/route.ts
22:08:34.639 
22:08:34.639 ./node_modules/handlebars/lib/index.js
22:08:34.639 require.extensions is not supported by webpack. Use a loader instead.
22:08:34.639 
22:08:34.639 Import trace for requested module:
22:08:34.640 ./node_modules/handlebars/lib/index.js
22:08:34.640 ./src/app/api/contract/pdf/route.ts
22:08:34.640 
22:08:34.640 ./node_modules/handlebars/lib/index.js
22:08:34.640 require.extensions is not supported by webpack. Use a loader instead.
22:08:34.641 
22:08:34.641 Import trace for requested module:
22:08:34.641 ./node_modules/handlebars/lib/index.js
22:08:34.642 ./src/app/api/contract/pdf/route.ts
22:08:34.642 
22:08:39.515 <w> [webpack.cache.PackFileCacheStrategy] Serializing big strings (130kiB) impacts deserialization performance (consider using Buffer instead and decode when needed)
22:08:39.823  ⚠ Compiled with warnings
22:08:39.824 
22:08:39.825 ./node_modules/@supabase/realtime-js/dist/module/lib/websocket-factory.js
22:08:39.825 A Node.js API is used (process.versions at line: 39) which is not supported in the Edge Runtime.
22:08:39.825 Learn more: https://nextjs.org/docs/api-reference/edge-runtime
22:08:39.826 
22:08:39.826 Import trace for requested module:
22:08:39.826 ./node_modules/@supabase/realtime-js/dist/module/lib/websocket-factory.js
22:08:39.826 ./node_modules/@supabase/realtime-js/dist/module/index.js
22:08:39.827 ./node_modules/@supabase/supabase-js/dist/index.mjs
22:08:39.827 ./node_modules/@supabase/ssr/dist/module/createBrowserClient.js
22:08:39.827 ./node_modules/@supabase/ssr/dist/module/index.js
22:08:39.828 
22:08:39.828 ./node_modules/@supabase/supabase-js/dist/index.mjs
22:08:39.828 A Node.js API is used (process.version at line: 395) which is not supported in the Edge Runtime.
22:08:39.828 Learn more: https://nextjs.org/docs/api-reference/edge-runtime
22:08:39.829 
22:08:39.829 Import trace for requested module:
22:08:39.829 ./node_modules/@supabase/supabase-js/dist/index.mjs
22:08:39.829 ./node_modules/@supabase/ssr/dist/module/createBrowserClient.js
22:08:39.829 ./node_modules/@supabase/ssr/dist/module/index.js
22:08:39.830 
22:09:00.453 <w> [webpack.cache.PackFileCacheStrategy] Skipped not serializable cache item 'Compilation/modules|/vercel/path0/node_modules/next/dist/build/webpack/loaders/css-loader/src/index.js??ruleSet[1].rules[13].oneOf[10].use[2]!/vercel/path0/node_modules/next/dist/build/webpack/loaders/postcss-loader/src/index.js??ruleSet[1].rules[13].oneOf[10].use[3]!/vercel/path0/src/app/globals.css': No serializer registered for Warning
22:09:00.454 <w> while serializing webpack/lib/cache/PackFileCacheStrategy.PackContentItems -> webpack/lib/NormalModule -> Array { 1 items } -> webpack/lib/ModuleWarning -> Warning
22:09:02.608  ⚠ Compiled with warnings
22:09:02.609 
22:09:02.612 ./src/app/globals.css.webpack[javascript/auto]!=!./node_modules/next/dist/build/webpack/loaders/css-loader/src/index.js??ruleSet[1].rules[13].oneOf[10].use[2]!./node_modules/next/dist/build/webpack/loaders/postcss-loader/src/index.js??ruleSet[1].rules[13].oneOf[10].use[3]!./src/app/globals.css
22:09:02.612 Warning
22:09:02.613 
22:09:02.613 (837:5) autoprefixer: Replace color-adjust to print-color-adjust. The color-adjust shorthand is currently deprecated.
22:09:02.613 
22:09:02.614 Import trace for requested module:
22:09:02.614 ./src/app/globals.css.webpack[javascript/auto]!=!./node_modules/next/dist/build/webpack/loaders/css-loader/src/index.js??ruleSet[1].rules[13].oneOf[10].use[2]!./node_modules/next/dist/build/webpack/loaders/postcss-loader/src/index.js??ruleSet[1].rules[13].oneOf[10].use[3]!./src/app/globals.css
22:09:02.614 ./src/app/globals.css
22:09:02.617 
22:09:02.722  ✓ Compiled successfully
22:09:02.784    Skipping validation of types
22:09:02.784    Linting ...
22:09:03.043    Collecting page data ...
22:09:04.539 [EpackMailer] No SMTP configured - using console fallback
22:09:04.585 [Email] Production mode - configuring email service
22:09:04.586 [Email] SendGrid not configured
22:09:04.586 [Email] No email service configured - using console fallback
22:09:05.052 [createServiceClient] Credentials not configured, using mock client
22:09:05.523 [AccountDeletionEmail] Configuring email service
22:09:05.524 [AccountDeletionEmail] SendGrid not configured
22:09:05.524 [AccountDeletionEmail] No email service configured - using console fallback
22:09:05.678 Error: Missing Supabase environment variables
22:09:05.679     at 71531 (.next/server/app/api/member/quotations/[id]/confirm-payment/route.js:1:1117)
22:09:05.679     at t (.next/server/webpack-runtime.js:1:143)
22:09:05.679     at r (.next/server/app/api/member/quotations/[id]/confirm-payment/route.js:145:3533)
22:09:05.679     at <unknown> (.next/server/app/api/member/quotations/[id]/confirm-payment/route.js:145:3570)
22:09:05.679     at t.X (.next/server/webpack-runtime.js:1:2214)
22:09:05.679     at <unknown> (.next/server/app/api/member/quotations/[id]/confirm-payment/route.js:145:3546)
22:09:05.679     at Object.<anonymous> (.next/server/app/api/member/quotations/[id]/confirm-payment/route.js:145:3598)
22:09:05.682 
22:09:05.682 > Build error occurred
22:09:05.685 [Error: Failed to collect page data for /api/member/quotations/[id]/confirm-payment] {
22:09:05.685   type: 'Error'
22:09:05.686 }
22:09:05.721 Error: Command "npm run build" exited with 1