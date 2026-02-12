19:26:04.032 Running build in Washington, D.C., USA (East) – iad1
19:26:04.032 Build machine configuration: 2 cores, 8 GB
19:26:04.141 Cloning github.com/knaei3933/epackage (Branch: main, Commit: 4395e43)
19:26:04.142 Previous build caches not available.
19:26:15.924 Cloning completed: 11.782s
19:26:16.934 Running "vercel build"
19:26:17.575 Vercel CLI 50.15.1
19:26:18.208 Running "install" command: `npm install`...
19:26:22.905 npm warn deprecated scmp@2.1.0: Just use Node.js's crypto.timingSafeEqual()
19:26:22.968 npm warn deprecated rimraf@2.7.1: Rimraf versions prior to v4 are no longer supported
19:26:23.995 npm warn deprecated lodash.isequal@4.5.0: This package is deprecated. Use require('node:util').isDeepStrictEqual instead.
19:26:24.409 npm warn deprecated inflight@1.0.6: This module is not supported, and leaks memory. Do not use it. Check out lru-cache if you want a good and tested way to coalesce async requests by a key value, which is much more comprehensive and powerful.
19:26:26.575 npm warn deprecated fstream@1.0.12: This package is no longer supported.
19:26:26.986 npm warn deprecated @supabase/auth-helpers-shared@0.7.0: This package is now deprecated - please use the @supabase/ssr package instead.
19:26:27.766 npm warn deprecated node-domexception@1.0.0: Use your platform's native DOMException instead
19:26:28.961 npm warn deprecated @supabase/auth-helpers-nextjs@0.10.0: This package is now deprecated - please use the @supabase/ssr package instead.
19:26:29.515 npm warn deprecated glob@7.2.3: Glob versions prior to v9 are no longer supported
19:26:29.861 npm warn deprecated glob@7.2.3: Glob versions prior to v9 are no longer supported
19:26:29.862 npm warn deprecated glob@7.2.3: Glob versions prior to v9 are no longer supported
19:26:30.644 npm warn deprecated glob@7.2.3: Glob versions prior to v9 are no longer supported
19:26:34.448 npm warn deprecated @mswjs/data@0.16.2: Package no longer supported. Contact Support at https://www.npmjs.com/support for more info.
19:26:56.082 npm warn deprecated next@15.1.6: This version has a security vulnerability. Please upgrade to a patched version. See https://nextjs.org/blog/CVE-2025-66478 for more details.
19:26:57.544 
19:26:57.545 added 1398 packages, and audited 1399 packages in 39s
19:26:57.546 
19:26:57.546 241 packages are looking for funding
19:26:57.546   run `npm fund` for details
19:26:57.682 
19:26:57.683 26 vulnerabilities (3 moderate, 21 high, 2 critical)
19:26:57.683 
19:26:57.686 To address issues that do not require attention, run:
19:26:57.686   npm audit fix
19:26:57.686 
19:26:57.687 To address all issues (including breaking changes), run:
19:26:57.687   npm audit fix --force
19:26:57.687 
19:26:57.693 Run `npm audit` for details.
19:26:57.818 Detected Next.js version: 15.1.6
19:26:57.818 Running "npm run build"
19:26:57.920 
19:26:57.921 > epackage-lab-web@0.1.0 build
19:26:57.921 > next build
19:26:57.922 
19:26:58.595 Attention: Next.js now collects completely anonymous telemetry regarding usage.
19:26:58.596 This information is used to shape Next.js' roadmap and prioritize features.
19:26:58.596 You can learn more, including how to opt-out if you'd not like to participate in this anonymous program, by visiting the following URL:
19:26:58.596 https://nextjs.org/telemetry
19:26:58.597 
19:26:58.670    ▲ Next.js 15.1.6
19:26:58.671 
19:26:58.723    Creating an optimized production build ...
19:27:44.311  ⚠ Compiled with warnings
19:27:44.311 
19:27:44.311 ./src/components/industry/IndustrySolutionTemplate.tsx
19:27:44.312 Attempted import error: 'IndustryNavigation' is not exported from '@/components/industry/IndustryNavigation' (imported as 'IndustryNavigation').
19:27:44.312 
19:27:44.312 Import trace for requested module:
19:27:44.312 ./src/components/industry/IndustrySolutionTemplate.tsx
19:27:44.312 
19:27:44.312 ./node_modules/handlebars/lib/index.js
19:27:44.312 require.extensions is not supported by webpack. Use a loader instead.
19:27:44.312 
19:27:44.312 Import trace for requested module:
19:27:44.313 ./node_modules/handlebars/lib/index.js
19:27:44.313 ./src/app/api/contract/pdf/route.ts
19:27:44.313 
19:27:44.313 ./node_modules/handlebars/lib/index.js
19:27:44.313 require.extensions is not supported by webpack. Use a loader instead.
19:27:44.314 
19:27:44.314 Import trace for requested module:
19:27:44.314 ./node_modules/handlebars/lib/index.js
19:27:44.314 ./src/app/api/contract/pdf/route.ts
19:27:44.314 
19:27:44.314 ./node_modules/handlebars/lib/index.js
19:27:44.315 require.extensions is not supported by webpack. Use a loader instead.
19:27:44.315 
19:27:44.315 Import trace for requested module:
19:27:44.315 ./node_modules/handlebars/lib/index.js
19:27:44.315 ./src/app/api/contract/pdf/route.ts
19:27:44.315 
19:27:49.236 <w> [webpack.cache.PackFileCacheStrategy] Serializing big strings (130kiB) impacts deserialization performance (consider using Buffer instead and decode when needed)
19:27:49.573  ⚠ Compiled with warnings
19:27:49.573 
19:27:49.573 ./node_modules/@supabase/realtime-js/dist/module/lib/websocket-factory.js
19:27:49.573 A Node.js API is used (process.versions at line: 39) which is not supported in the Edge Runtime.
19:27:49.573 Learn more: https://nextjs.org/docs/api-reference/edge-runtime
19:27:49.574 
19:27:49.574 Import trace for requested module:
19:27:49.574 ./node_modules/@supabase/realtime-js/dist/module/lib/websocket-factory.js
19:27:49.574 ./node_modules/@supabase/realtime-js/dist/module/index.js
19:27:49.574 ./node_modules/@supabase/supabase-js/dist/index.mjs
19:27:49.574 ./node_modules/@supabase/ssr/dist/module/createBrowserClient.js
19:27:49.575 ./node_modules/@supabase/ssr/dist/module/index.js
19:27:49.575 
19:27:49.575 ./node_modules/@supabase/supabase-js/dist/index.mjs
19:27:49.575 A Node.js API is used (process.version at line: 395) which is not supported in the Edge Runtime.
19:27:49.575 Learn more: https://nextjs.org/docs/api-reference/edge-runtime
19:27:49.575 
19:27:49.575 Import trace for requested module:
19:27:49.575 ./node_modules/@supabase/supabase-js/dist/index.mjs
19:27:49.575 ./node_modules/@supabase/ssr/dist/module/createBrowserClient.js
19:27:49.580 ./node_modules/@supabase/ssr/dist/module/index.js
19:27:49.580 
19:28:12.986 <w> [webpack.cache.PackFileCacheStrategy] Skipped not serializable cache item 'Compilation/modules|/vercel/path0/node_modules/next/dist/build/webpack/loaders/css-loader/src/index.js??ruleSet[1].rules[13].oneOf[10].use[2]!/vercel/path0/node_modules/next/dist/build/webpack/loaders/postcss-loader/src/index.js??ruleSet[1].rules[13].oneOf[10].use[3]!/vercel/path0/src/app/globals.css': No serializer registered for Warning
19:28:12.987 <w> while serializing webpack/lib/cache/PackFileCacheStrategy.PackContentItems -> webpack/lib/NormalModule -> Array { 1 items } -> webpack/lib/ModuleWarning -> Warning
19:28:15.364  ⚠ Compiled with warnings
19:28:15.365 
19:28:15.365 ./src/app/globals.css.webpack[javascript/auto]!=!./node_modules/next/dist/build/webpack/loaders/css-loader/src/index.js??ruleSet[1].rules[13].oneOf[10].use[2]!./node_modules/next/dist/build/webpack/loaders/postcss-loader/src/index.js??ruleSet[1].rules[13].oneOf[10].use[3]!./src/app/globals.css
19:28:15.366 Warning
19:28:15.368 
19:28:15.369 (837:5) autoprefixer: Replace color-adjust to print-color-adjust. The color-adjust shorthand is currently deprecated.
19:28:15.369 
19:28:15.369 Import trace for requested module:
19:28:15.369 ./src/app/globals.css.webpack[javascript/auto]!=!./node_modules/next/dist/build/webpack/loaders/css-loader/src/index.js??ruleSet[1].rules[13].oneOf[10].use[2]!./node_modules/next/dist/build/webpack/loaders/postcss-loader/src/index.js??ruleSet[1].rules[13].oneOf[10].use[3]!./src/app/globals.css
19:28:15.370 ./src/app/globals.css
19:28:15.370 
19:28:15.370 ./src/components/industry/IndustrySolutionTemplate.tsx
19:28:15.371 Attempted import error: 'IndustryNavigation' is not exported from '@/components/industry/IndustryNavigation' (imported as 'IndustryNavigation').
19:28:15.371 
19:28:15.371 Import trace for requested module:
19:28:15.371 ./src/components/industry/IndustrySolutionTemplate.tsx
19:28:15.372 
19:28:15.460  ✓ Compiled successfully
19:28:15.463    Skipping validation of types
19:28:15.464    Linting ...
19:28:15.754    Collecting page data ...
19:28:17.020 [Email] Production mode - configuring email service
19:28:17.021 [Email] SendGrid not configured
19:28:17.021 [Email] No email service configured - using console fallback
19:28:17.095 Error: Missing Supabase environment variables
19:28:17.095     at 78892 (.next/server/app/api/admin/orders/[id]/delivery-note/route.js:1:1816)
19:28:17.096     at t (.next/server/webpack-runtime.js:1:143)
19:28:17.096     at t (.next/server/app/api/admin/orders/[id]/delivery-note/route.js:1:4056)
19:28:17.096     at <unknown> (.next/server/app/api/admin/orders/[id]/delivery-note/route.js:1:4108)
19:28:17.096     at t.X (.next/server/webpack-runtime.js:1:2214)
19:28:17.096     at <unknown> (.next/server/app/api/admin/orders/[id]/delivery-note/route.js:1:4069)
19:28:17.096     at Object.<anonymous> (.next/server/app/api/admin/orders/[id]/delivery-note/route.js:1:4136)
19:28:17.098 
19:28:17.098 > Build error occurred
19:28:17.101 [Error: Failed to collect page data for /api/admin/orders/[id]/delivery-note] {
19:28:17.101   type: 'Error'
19:28:17.101 }
19:28:17.134 Error: Command "npm run build" exited with 1