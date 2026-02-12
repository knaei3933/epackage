19:09:05.320 Running build in Washington, D.C., USA (East) – iad1
19:09:05.321 Build machine configuration: 2 cores, 8 GB
19:09:05.434 Cloning github.com/knaei3933/epackage (Branch: main, Commit: 43cc972)
19:09:05.435 Previous build caches not available.
19:09:16.867 Cloning completed: 11.433s
19:09:17.747 Running "vercel build"
19:09:18.377 Vercel CLI 50.15.1
19:09:18.958 Running "install" command: `npm install`...
19:09:23.532 npm warn deprecated scmp@2.1.0: Just use Node.js's crypto.timingSafeEqual()
19:09:23.595 npm warn deprecated rimraf@2.7.1: Rimraf versions prior to v4 are no longer supported
19:09:24.497 npm warn deprecated lodash.isequal@4.5.0: This package is deprecated. Use require('node:util').isDeepStrictEqual instead.
19:09:24.938 npm warn deprecated inflight@1.0.6: This module is not supported, and leaks memory. Do not use it. Check out lru-cache if you want a good and tested way to coalesce async requests by a key value, which is much more comprehensive and powerful.
19:09:27.038 npm warn deprecated fstream@1.0.12: This package is no longer supported.
19:09:27.326 npm warn deprecated @supabase/auth-helpers-shared@0.7.0: This package is now deprecated - please use the @supabase/ssr package instead.
19:09:27.981 npm warn deprecated node-domexception@1.0.0: Use your platform's native DOMException instead
19:09:29.536 npm warn deprecated @supabase/auth-helpers-nextjs@0.10.0: This package is now deprecated - please use the @supabase/ssr package instead.
19:09:30.289 npm warn deprecated glob@7.2.3: Glob versions prior to v9 are no longer supported
19:09:30.588 npm warn deprecated glob@7.2.3: Glob versions prior to v9 are no longer supported
19:09:30.589 npm warn deprecated glob@7.2.3: Glob versions prior to v9 are no longer supported
19:09:31.404 npm warn deprecated glob@7.2.3: Glob versions prior to v9 are no longer supported
19:09:35.168 npm warn deprecated @mswjs/data@0.16.2: Package no longer supported. Contact Support at https://www.npmjs.com/support for more info.
19:09:57.206 npm warn deprecated next@15.1.6: This version has a security vulnerability. Please upgrade to a patched version. See https://nextjs.org/blog/CVE-2025-66478 for more details.
19:09:58.143 
19:09:58.144 added 1398 packages, and audited 1399 packages in 39s
19:09:58.144 
19:09:58.145 241 packages are looking for funding
19:09:58.146   run `npm fund` for details
19:09:58.281 
19:09:58.281 26 vulnerabilities (3 moderate, 21 high, 2 critical)
19:09:58.282 
19:09:58.282 To address issues that do not require attention, run:
19:09:58.283   npm audit fix
19:09:58.283 
19:09:58.283 To address all issues (including breaking changes), run:
19:09:58.283   npm audit fix --force
19:09:58.284 
19:09:58.284 Run `npm audit` for details.
19:09:58.350 Detected Next.js version: 15.1.6
19:09:58.351 Running "npm run build"
19:09:58.464 
19:09:58.465 > epackage-lab-web@0.1.0 build
19:09:58.465 > next build
19:09:58.465 
19:09:59.064 Attention: Next.js now collects completely anonymous telemetry regarding usage.
19:09:59.064 This information is used to shape Next.js' roadmap and prioritize features.
19:09:59.065 You can learn more, including how to opt-out if you'd not like to participate in this anonymous program, by visiting the following URL:
19:09:59.065 https://nextjs.org/telemetry
19:09:59.065 
19:09:59.136    ▲ Next.js 15.1.6
19:09:59.137 
19:09:59.185    Creating an optimized production build ...
19:10:41.527  ⚠ Compiled with warnings
19:10:41.528 
19:10:41.529 ./src/components/industry/IndustrySolutionTemplate.tsx
19:10:41.529 Attempted import error: 'IndustryNavigation' is not exported from '@/components/industry/IndustryNavigation' (imported as 'IndustryNavigation').
19:10:41.529 
19:10:41.530 Import trace for requested module:
19:10:41.530 ./src/components/industry/IndustrySolutionTemplate.tsx
19:10:41.530 
19:10:41.531 ./node_modules/handlebars/lib/index.js
19:10:41.531 require.extensions is not supported by webpack. Use a loader instead.
19:10:41.531 
19:10:41.532 Import trace for requested module:
19:10:41.532 ./node_modules/handlebars/lib/index.js
19:10:41.532 ./src/app/api/contract/pdf/route.ts
19:10:41.533 
19:10:41.533 ./node_modules/handlebars/lib/index.js
19:10:41.533 require.extensions is not supported by webpack. Use a loader instead.
19:10:41.533 
19:10:41.534 Import trace for requested module:
19:10:41.534 ./node_modules/handlebars/lib/index.js
19:10:41.534 ./src/app/api/contract/pdf/route.ts
19:10:41.535 
19:10:41.535 ./node_modules/handlebars/lib/index.js
19:10:41.535 require.extensions is not supported by webpack. Use a loader instead.
19:10:41.536 
19:10:41.536 Import trace for requested module:
19:10:41.536 ./node_modules/handlebars/lib/index.js
19:10:41.536 ./src/app/api/contract/pdf/route.ts
19:10:41.537 
19:10:41.537 ./src/app/admin/approvals/page.tsx
19:10:41.537 Attempted import error: 'FullPageSpinner' is not exported from '@/components/ui' (imported as 'FullPageSpinner').
19:10:41.538 
19:10:41.538 Import trace for requested module:
19:10:41.538 ./src/app/admin/approvals/page.tsx
19:10:41.539 
19:10:41.539 ./src/app/admin/dashboard/page.tsx
19:10:41.539 Attempted import error: 'FullPageSpinner' is not exported from '@/components/ui' (imported as 'FullPageSpinner').
19:10:41.540 
19:10:41.540 Import trace for requested module:
19:10:41.540 ./src/app/admin/dashboard/page.tsx
19:10:41.541 
19:10:41.541 ./src/app/admin/orders/page.tsx
19:10:41.541 Attempted import error: 'FullPageSpinner' is not exported from '@/components/ui' (imported as 'FullPageSpinner').
19:10:41.542 
19:10:41.542 Import trace for requested module:
19:10:41.542 ./src/app/admin/orders/page.tsx
19:10:41.543 
19:10:41.543 ./src/app/admin/quotations/page.tsx
19:10:41.543 Attempted import error: 'FullPageSpinner' is not exported from '@/components/ui' (imported as 'FullPageSpinner').
19:10:41.544 
19:10:41.544 Import trace for requested module:
19:10:41.544 ./src/app/admin/quotations/page.tsx
19:10:41.545 
19:10:41.545 ./src/app/member/orders/[id]/page.tsx
19:10:41.545 Attempted import error: 'FullPageSpinner' is not exported from '@/components/ui' (imported as 'FullPageSpinner').
19:10:41.546 
19:10:41.546 Import trace for requested module:
19:10:41.546 ./src/app/member/orders/[id]/page.tsx
19:10:41.547 
19:10:41.547 ./src/app/member/orders/[id]/preparation/page.tsx
19:10:41.547 Attempted import error: 'FullPageSpinner' is not exported from '@/components/ui' (imported as 'FullPageSpinner').
19:10:41.547 
19:10:41.548 Import trace for requested module:
19:10:41.548 ./src/app/member/orders/[id]/preparation/page.tsx
19:10:41.549 
19:10:46.698 <w> [webpack.cache.PackFileCacheStrategy] Serializing big strings (130kiB) impacts deserialization performance (consider using Buffer instead and decode when needed)
19:10:47.043  ⚠ Compiled with warnings
19:10:47.044 
19:10:47.045 ./node_modules/@supabase/realtime-js/dist/module/lib/websocket-factory.js
19:10:47.045 A Node.js API is used (process.versions at line: 39) which is not supported in the Edge Runtime.
19:10:47.045 Learn more: https://nextjs.org/docs/api-reference/edge-runtime
19:10:47.045 
19:10:47.045 Import trace for requested module:
19:10:47.046 ./node_modules/@supabase/realtime-js/dist/module/lib/websocket-factory.js
19:10:47.046 ./node_modules/@supabase/realtime-js/dist/module/index.js
19:10:47.046 ./node_modules/@supabase/supabase-js/dist/index.mjs
19:10:47.046 ./node_modules/@supabase/ssr/dist/module/createBrowserClient.js
19:10:47.047 ./node_modules/@supabase/ssr/dist/module/index.js
19:10:47.047 
19:10:47.047 ./node_modules/@supabase/supabase-js/dist/index.mjs
19:10:47.047 A Node.js API is used (process.version at line: 395) which is not supported in the Edge Runtime.
19:10:47.047 Learn more: https://nextjs.org/docs/api-reference/edge-runtime
19:10:47.047 
19:10:47.047 Import trace for requested module:
19:10:47.048 ./node_modules/@supabase/supabase-js/dist/index.mjs
19:10:47.048 ./node_modules/@supabase/ssr/dist/module/createBrowserClient.js
19:10:47.048 ./node_modules/@supabase/ssr/dist/module/index.js
19:10:47.048 
19:11:10.408 <w> [webpack.cache.PackFileCacheStrategy] Skipped not serializable cache item 'Compilation/modules|/vercel/path0/node_modules/next/dist/build/webpack/loaders/css-loader/src/index.js??ruleSet[1].rules[13].oneOf[10].use[2]!/vercel/path0/node_modules/next/dist/build/webpack/loaders/postcss-loader/src/index.js??ruleSet[1].rules[13].oneOf[10].use[3]!/vercel/path0/src/app/globals.css': No serializer registered for Warning
19:11:10.409 <w> while serializing webpack/lib/cache/PackFileCacheStrategy.PackContentItems -> webpack/lib/NormalModule -> Array { 1 items } -> webpack/lib/ModuleWarning -> Warning
19:11:12.316  ⚠ Compiled with warnings
19:11:12.316 
19:11:12.316 ./src/app/globals.css.webpack[javascript/auto]!=!./node_modules/next/dist/build/webpack/loaders/css-loader/src/index.js??ruleSet[1].rules[13].oneOf[10].use[2]!./node_modules/next/dist/build/webpack/loaders/postcss-loader/src/index.js??ruleSet[1].rules[13].oneOf[10].use[3]!./src/app/globals.css
19:11:12.316 Warning
19:11:12.316 
19:11:12.317 (837:5) autoprefixer: Replace color-adjust to print-color-adjust. The color-adjust shorthand is currently deprecated.
19:11:12.317 
19:11:12.317 Import trace for requested module:
19:11:12.317 ./src/app/globals.css.webpack[javascript/auto]!=!./node_modules/next/dist/build/webpack/loaders/css-loader/src/index.js??ruleSet[1].rules[13].oneOf[10].use[2]!./node_modules/next/dist/build/webpack/loaders/postcss-loader/src/index.js??ruleSet[1].rules[13].oneOf[10].use[3]!./src/app/globals.css
19:11:12.317 ./src/app/globals.css
19:11:12.317 
19:11:12.317 ./src/components/industry/IndustrySolutionTemplate.tsx
19:11:12.317 Attempted import error: 'IndustryNavigation' is not exported from '@/components/industry/IndustryNavigation' (imported as 'IndustryNavigation').
19:11:12.317 
19:11:12.317 Import trace for requested module:
19:11:12.317 ./src/components/industry/IndustrySolutionTemplate.tsx
19:11:12.317 
19:11:12.406  ✓ Compiled successfully
19:11:12.409    Skipping validation of types
19:11:12.409    Linting ...
19:11:12.694    Collecting page data ...
19:11:13.903 Error: Missing Supabase environment variables
19:11:13.904     at 67629 (.next/server/app/api/admin/dashboard/unified-stats/route.js:1:5177)
19:11:13.904     at t (.next/server/webpack-runtime.js:1:143)
19:11:13.904     at <unknown> (.next/server/app/api/admin/dashboard/unified-stats/route.js:1:4263)
19:11:13.904     at t.a (.next/server/webpack-runtime.js:1:918)
19:11:13.905     at 8864 (.next/server/app/api/admin/dashboard/unified-stats/route.js:1:4188)
19:11:13.905     at t (.next/server/webpack-runtime.js:1:143)
19:11:13.905     at <unknown> (.next/server/app/api/admin/dashboard/unified-stats/route.js:1:910)
19:11:13.905     at t.a (.next/server/webpack-runtime.js:1:918)
19:11:13.906     at 80320 (.next/server/app/api/admin/dashboard/unified-stats/route.js:1:731)
19:11:13.906     at t (.next/server/webpack-runtime.js:1:143)
19:11:13.906     at r (.next/server/app/api/admin/dashboard/unified-stats/route.js:1:6680)
19:11:13.906     at <unknown> (.next/server/app/api/admin/dashboard/unified-stats/route.js:1:6726)
19:11:13.906     at t.X (.next/server/webpack-runtime.js:1:2214)
19:11:13.907     at <unknown> (.next/server/app/api/admin/dashboard/unified-stats/route.js:1:6693)
19:11:13.910     at Object.<anonymous> (.next/server/app/api/admin/dashboard/unified-stats/route.js:1:6754)
19:11:13.910 
19:11:13.911 > Build error occurred
19:11:13.912 [Error: Failed to collect page data for /api/admin/dashboard/unified-stats] {
19:11:13.912   type: 'Error'
19:11:13.913 }
19:11:13.943 Error: Command "npm run build" exited with 1