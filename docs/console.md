04:40:13.734 Running build in Washington, D.C., USA (East) – iad1
04:40:13.735 Build machine configuration: 2 cores, 8 GB
04:40:14.266 Cloning github.com/knaei3933/epackage (Branch: main, Commit: 1f0cde3)
04:40:14.267 Previous build caches not available.
04:40:25.485 Cloning completed: 11.218s
04:40:26.407 Running "vercel build"
04:40:27.044 Vercel CLI 50.15.1
04:40:27.624 Running "install" command: `npm install`...
04:40:31.932 npm warn deprecated scmp@2.1.0: Just use Node.js's crypto.timingSafeEqual()
04:40:32.207 npm warn deprecated rimraf@2.7.1: Rimraf versions prior to v4 are no longer supported
04:40:33.075 npm warn deprecated lodash.isequal@4.5.0: This package is deprecated. Use require('node:util').isDeepStrictEqual instead.
04:40:33.594 npm warn deprecated inflight@1.0.6: This module is not supported, and leaks memory. Do not use it. Check out lru-cache if you want a good and tested way to coalesce async requests by a key value, which is much more comprehensive and powerful.
04:40:35.369 npm warn deprecated node-domexception@1.0.0: Use your platform's native DOMException instead
04:40:35.409 npm warn deprecated fstream@1.0.12: This package is no longer supported.
04:40:36.294 npm warn deprecated @supabase/auth-helpers-shared@0.7.0: This package is now deprecated - please use the @supabase/ssr package instead.
04:40:37.192 npm warn deprecated @supabase/auth-helpers-nextjs@0.10.0: This package is now deprecated - please use the @supabase/ssr package instead.
04:40:39.145 npm warn deprecated glob@7.2.3: Glob versions prior to v9 are no longer supported
04:40:39.401 npm warn deprecated glob@7.2.3: Glob versions prior to v9 are no longer supported
04:40:39.470 npm warn deprecated glob@7.2.3: Glob versions prior to v9 are no longer supported
04:40:40.305 npm warn deprecated glob@7.2.3: Glob versions prior to v9 are no longer supported
04:40:43.545 npm warn deprecated @mswjs/data@0.16.2: Package no longer supported. Contact Support at https://www.npmjs.com/support for more info.
04:41:04.827 npm warn deprecated next@15.1.6: This version has a security vulnerability. Please upgrade to a patched version. See https://nextjs.org/blog/CVE-2025-66478 for more details.
04:41:06.100 
04:41:06.101 added 1398 packages, and audited 1399 packages in 38s
04:41:06.101 
04:41:06.101 241 packages are looking for funding
04:41:06.101   run `npm fund` for details
04:41:06.231 
04:41:06.232 26 vulnerabilities (3 moderate, 21 high, 2 critical)
04:41:06.232 
04:41:06.232 To address issues that do not require attention, run:
04:41:06.232   npm audit fix
04:41:06.232 
04:41:06.232 To address all issues (including breaking changes), run:
04:41:06.232   npm audit fix --force
04:41:06.233 
04:41:06.233 Run `npm audit` for details.
04:41:06.288 Detected Next.js version: 15.1.6
04:41:06.289 Running "npm run build"
04:41:06.391 
04:41:06.391 > epackage-lab-web@0.1.0 build
04:41:06.391 > next build
04:41:06.391 
04:41:06.963 Attention: Next.js now collects completely anonymous telemetry regarding usage.
04:41:06.964 This information is used to shape Next.js' roadmap and prioritize features.
04:41:06.964 You can learn more, including how to opt-out if you'd not like to participate in this anonymous program, by visiting the following URL:
04:41:06.964 https://nextjs.org/telemetry
04:41:06.964 
04:41:07.029    ▲ Next.js 15.1.6
04:41:07.030 
04:41:07.077    Creating an optimized production build ...
04:41:16.101 request to https://fonts.gstatic.com/s/geist/v4/gyByhwUxId8gMEwYGFWNOITddY4.woff2 failed, reason: 
04:41:16.101 
04:41:16.102 Retrying 1/3...
04:41:16.103 request to https://fonts.gstatic.com/s/geist/v4/gyByhwUxId8gMEwSGFWNOITddY4.woff2 failed, reason: 
04:41:16.103 
04:41:16.103 Retrying 1/3...
04:41:16.104 request to https://fonts.gstatic.com/s/geist/v4/gyByhwUxId8gMEwcGFWNOITd.woff2 failed, reason: 
04:41:16.104 
04:41:16.104 Retrying 1/3...
04:41:51.866  ⚠ Compiled with warnings
04:41:51.867 
04:41:51.868 ./node_modules/handlebars/lib/index.js
04:41:51.868 require.extensions is not supported by webpack. Use a loader instead.
04:41:51.868 
04:41:51.869 Import trace for requested module:
04:41:51.869 ./node_modules/handlebars/lib/index.js
04:41:51.870 ./src/app/api/contract/pdf/route.ts
04:41:51.870 
04:41:51.870 ./node_modules/handlebars/lib/index.js
04:41:51.871 require.extensions is not supported by webpack. Use a loader instead.
04:41:51.872 
04:41:51.872 Import trace for requested module:
04:41:51.873 ./node_modules/handlebars/lib/index.js
04:41:51.873 ./src/app/api/contract/pdf/route.ts
04:41:51.873 
04:41:51.874 ./node_modules/handlebars/lib/index.js
04:41:51.874 require.extensions is not supported by webpack. Use a loader instead.
04:41:51.874 
04:41:51.875 Import trace for requested module:
04:41:51.875 ./node_modules/handlebars/lib/index.js
04:41:51.876 ./src/app/api/contract/pdf/route.ts
04:41:51.876 
04:41:57.237 <w> [webpack.cache.PackFileCacheStrategy] Serializing big strings (130kiB) impacts deserialization performance (consider using Buffer instead and decode when needed)
04:41:57.554  ⚠ Compiled with warnings
04:41:57.554 
04:41:57.555 ./node_modules/@supabase/realtime-js/dist/module/lib/websocket-factory.js
04:41:57.556 A Node.js API is used (process.versions at line: 39) which is not supported in the Edge Runtime.
04:41:57.556 Learn more: https://nextjs.org/docs/api-reference/edge-runtime
04:41:57.556 
04:41:57.556 Import trace for requested module:
04:41:57.557 ./node_modules/@supabase/realtime-js/dist/module/lib/websocket-factory.js
04:41:57.557 ./node_modules/@supabase/realtime-js/dist/module/index.js
04:41:57.557 ./node_modules/@supabase/supabase-js/dist/index.mjs
04:41:57.558 ./node_modules/@supabase/ssr/dist/module/createBrowserClient.js
04:41:57.558 ./node_modules/@supabase/ssr/dist/module/index.js
04:41:57.558 
04:41:57.559 ./node_modules/@supabase/supabase-js/dist/index.mjs
04:41:57.559 A Node.js API is used (process.version at line: 395) which is not supported in the Edge Runtime.
04:41:57.559 Learn more: https://nextjs.org/docs/api-reference/edge-runtime
04:41:57.559 
04:41:57.563 Import trace for requested module:
04:41:57.563 ./node_modules/@supabase/supabase-js/dist/index.mjs
04:41:57.564 ./node_modules/@supabase/ssr/dist/module/createBrowserClient.js
04:41:57.564 ./node_modules/@supabase/ssr/dist/module/index.js
04:41:57.564 
04:42:21.184 <w> [webpack.cache.PackFileCacheStrategy] Skipped not serializable cache item 'Compilation/modules|/vercel/path0/node_modules/next/dist/build/webpack/loaders/css-loader/src/index.js??ruleSet[1].rules[13].oneOf[10].use[2]!/vercel/path0/node_modules/next/dist/build/webpack/loaders/postcss-loader/src/index.js??ruleSet[1].rules[13].oneOf[10].use[3]!/vercel/path0/src/app/globals.css': No serializer registered for Warning
04:42:21.185 <w> while serializing webpack/lib/cache/PackFileCacheStrategy.PackContentItems -> webpack/lib/NormalModule -> Array { 1 items } -> webpack/lib/ModuleWarning -> Warning
04:42:23.585  ⚠ Compiled with warnings
04:42:23.586 
04:42:23.587 ./src/app/globals.css.webpack[javascript/auto]!=!./node_modules/next/dist/build/webpack/loaders/css-loader/src/index.js??ruleSet[1].rules[13].oneOf[10].use[2]!./node_modules/next/dist/build/webpack/loaders/postcss-loader/src/index.js??ruleSet[1].rules[13].oneOf[10].use[3]!./src/app/globals.css
04:42:23.587 Warning
04:42:23.588 
04:42:23.588 (837:5) autoprefixer: Replace color-adjust to print-color-adjust. The color-adjust shorthand is currently deprecated.
04:42:23.589 
04:42:23.589 Import trace for requested module:
04:42:23.589 ./src/app/globals.css.webpack[javascript/auto]!=!./node_modules/next/dist/build/webpack/loaders/css-loader/src/index.js??ruleSet[1].rules[13].oneOf[10].use[2]!./node_modules/next/dist/build/webpack/loaders/postcss-loader/src/index.js??ruleSet[1].rules[13].oneOf[10].use[3]!./src/app/globals.css
04:42:23.589 ./src/app/globals.css
04:42:23.590 
04:42:23.716  ✓ Compiled successfully
04:42:23.719    Skipping validation of types
04:42:23.719    Linting ...
04:42:23.999    Collecting page data ...
04:42:25.447 [EpackMailer] No SMTP configured - using console fallback
04:42:25.627 [Email] Production mode - configuring email service
04:42:25.628 [Email] SendGrid not configured
04:42:25.628 [Email] No email service configured - using console fallback
04:42:26.060 [createServiceClient] Credentials not configured, using mock client
04:42:26.646 [AccountDeletionEmail] Configuring email service
04:42:26.647 [AccountDeletionEmail] SendGrid not configured
04:42:26.647 [AccountDeletionEmail] No email service configured - using console fallback
04:42:27.065  ⚠ Using edge runtime on a page currently disables static generation for that page
04:42:35.869    Generating static pages (0/84) ...
04:42:37.351 Error occurred prerendering page "/_not-found". Read more: https://nextjs.org/docs/messages/prerender-error
04:42:37.353 Error: Supabase credentials not configured
04:42:37.353     at /vercel/path0/.next/server/chunks/1653.js:247:89434
04:42:37.353 Export encountered an error on /_not-found/page: /_not-found, exiting the build.
04:42:37.358  ⨯ Static worker exited with code: 1 and signal: null
04:42:37.422 Error: Command "npm run build" exited with 1