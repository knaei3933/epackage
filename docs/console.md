18:59:47.766 Running build in Washington, D.C., USA (East) – iad1
18:59:47.766 Build machine configuration: 2 cores, 8 GB
18:59:47.916 Cloning github.com/knaei3933/epackage (Branch: main, Commit: e543ba8)
18:59:47.917 Previous build caches not available.
18:59:59.181 Cloning completed: 11.265s
19:00:00.019 Running "vercel build"
19:00:00.611 Vercel CLI 50.15.1
19:00:01.141 Running "install" command: `npm install`...
19:00:05.451 npm warn deprecated scmp@2.1.0: Just use Node.js's crypto.timingSafeEqual()
19:00:05.458 npm warn deprecated rimraf@2.7.1: Rimraf versions prior to v4 are no longer supported
19:00:06.283 npm warn deprecated lodash.isequal@4.5.0: This package is deprecated. Use require('node:util').isDeepStrictEqual instead.
19:00:06.674 npm warn deprecated inflight@1.0.6: This module is not supported, and leaks memory. Do not use it. Check out lru-cache if you want a good and tested way to coalesce async requests by a key value, which is much more comprehensive and powerful.
19:00:08.465 npm warn deprecated fstream@1.0.12: This package is no longer supported.
19:00:08.886 npm warn deprecated node-domexception@1.0.0: Use your platform's native DOMException instead
19:00:08.984 npm warn deprecated @supabase/auth-helpers-shared@0.7.0: This package is now deprecated - please use the @supabase/ssr package instead.
19:00:10.511 npm warn deprecated @supabase/auth-helpers-nextjs@0.10.0: This package is now deprecated - please use the @supabase/ssr package instead.
19:00:11.334 npm warn deprecated glob@7.2.3: Glob versions prior to v9 are no longer supported
19:00:11.580 npm warn deprecated glob@7.2.3: Glob versions prior to v9 are no longer supported
19:00:11.584 npm warn deprecated glob@7.2.3: Glob versions prior to v9 are no longer supported
19:00:12.302 npm warn deprecated glob@7.2.3: Glob versions prior to v9 are no longer supported
19:00:15.446 npm warn deprecated @mswjs/data@0.16.2: Package no longer supported. Contact Support at https://www.npmjs.com/support for more info.
19:00:35.379 npm warn deprecated next@15.1.6: This version has a security vulnerability. Please upgrade to a patched version. See https://nextjs.org/blog/CVE-2025-66478 for more details.
19:00:36.225 
19:00:36.226 added 1398 packages, and audited 1399 packages in 35s
19:00:36.226 
19:00:36.226 241 packages are looking for funding
19:00:36.227   run `npm fund` for details
19:00:36.354 
19:00:36.355 26 vulnerabilities (3 moderate, 21 high, 2 critical)
19:00:36.355 
19:00:36.355 To address issues that do not require attention, run:
19:00:36.356   npm audit fix
19:00:36.356 
19:00:36.356 To address all issues (including breaking changes), run:
19:00:36.356   npm audit fix --force
19:00:36.356 
19:00:36.357 Run `npm audit` for details.
19:00:36.416 Detected Next.js version: 15.1.6
19:00:36.417 Running "npm run build"
19:00:36.509 
19:00:36.513 > epackage-lab-web@0.1.0 build
19:00:36.513 > next build
19:00:36.513 
19:00:37.057 Attention: Next.js now collects completely anonymous telemetry regarding usage.
19:00:37.058 This information is used to shape Next.js' roadmap and prioritize features.
19:00:37.059 You can learn more, including how to opt-out if you'd not like to participate in this anonymous program, by visiting the following URL:
19:00:37.059 https://nextjs.org/telemetry
19:00:37.059 
19:00:37.120    ▲ Next.js 15.1.6
19:00:37.121 
19:00:37.165    Creating an optimized production build ...
19:01:15.847  ⚠ Compiled with warnings
19:01:15.848 
19:01:15.848 ./src/components/industry/IndustrySolutionTemplate.tsx
19:01:15.848 Attempted import error: 'IndustryNavigation' is not exported from '@/components/industry/IndustryNavigation' (imported as 'IndustryNavigation').
19:01:15.848 
19:01:15.849 Import trace for requested module:
19:01:15.849 ./src/components/industry/IndustrySolutionTemplate.tsx
19:01:15.849 
19:01:15.849 ./node_modules/handlebars/lib/index.js
19:01:15.849 require.extensions is not supported by webpack. Use a loader instead.
19:01:15.849 
19:01:15.849 Import trace for requested module:
19:01:15.849 ./node_modules/handlebars/lib/index.js
19:01:15.850 ./src/app/api/contract/pdf/route.ts
19:01:15.850 
19:01:15.850 ./node_modules/handlebars/lib/index.js
19:01:15.850 require.extensions is not supported by webpack. Use a loader instead.
19:01:15.850 
19:01:15.851 Import trace for requested module:
19:01:15.851 ./node_modules/handlebars/lib/index.js
19:01:15.851 ./src/app/api/contract/pdf/route.ts
19:01:15.851 
19:01:15.851 ./node_modules/handlebars/lib/index.js
19:01:15.851 require.extensions is not supported by webpack. Use a loader instead.
19:01:15.852 
19:01:15.852 Import trace for requested module:
19:01:15.852 ./node_modules/handlebars/lib/index.js
19:01:15.852 ./src/app/api/contract/pdf/route.ts
19:01:15.852 
19:01:15.853 ./src/app/admin/approvals/page.tsx
19:01:15.853 Attempted import error: 'FullPageSpinner' is not exported from '@/components/ui' (imported as 'FullPageSpinner').
19:01:15.853 
19:01:15.853 Import trace for requested module:
19:01:15.853 ./src/app/admin/approvals/page.tsx
19:01:15.853 
19:01:15.854 ./src/app/admin/dashboard/page.tsx
19:01:15.854 Attempted import error: 'FullPageSpinner' is not exported from '@/components/ui' (imported as 'FullPageSpinner').
19:01:15.854 
19:01:15.854 Import trace for requested module:
19:01:15.854 ./src/app/admin/dashboard/page.tsx
19:01:15.855 
19:01:15.855 ./src/app/admin/orders/page.tsx
19:01:15.855 Attempted import error: 'FullPageSpinner' is not exported from '@/components/ui' (imported as 'FullPageSpinner').
19:01:15.855 
19:01:15.855 Import trace for requested module:
19:01:15.855 ./src/app/admin/orders/page.tsx
19:01:15.856 
19:01:15.856 ./src/app/admin/quotations/page.tsx
19:01:15.856 Attempted import error: 'FullPageSpinner' is not exported from '@/components/ui' (imported as 'FullPageSpinner').
19:01:15.856 
19:01:15.860 Import trace for requested module:
19:01:15.860 ./src/app/admin/quotations/page.tsx
19:01:15.860 
19:01:15.861 ./src/app/member/orders/[id]/page.tsx
19:01:15.861 Attempted import error: 'FullPageSpinner' is not exported from '@/components/ui' (imported as 'FullPageSpinner').
19:01:15.861 
19:01:15.861 Import trace for requested module:
19:01:15.861 ./src/app/member/orders/[id]/page.tsx
19:01:15.861 
19:01:15.862 ./src/app/member/orders/[id]/preparation/page.tsx
19:01:15.862 Attempted import error: 'FullPageSpinner' is not exported from '@/components/ui' (imported as 'FullPageSpinner').
19:01:15.862 
19:01:15.862 Import trace for requested module:
19:01:15.863 ./src/app/member/orders/[id]/preparation/page.tsx
19:01:15.863 
19:01:20.503 <w> [webpack.cache.PackFileCacheStrategy] Serializing big strings (130kiB) impacts deserialization performance (consider using Buffer instead and decode when needed)
19:01:20.819  ⚠ Compiled with warnings
19:01:20.820 
19:01:20.820 ./node_modules/@supabase/realtime-js/dist/module/lib/websocket-factory.js
19:01:20.821 A Node.js API is used (process.versions at line: 39) which is not supported in the Edge Runtime.
19:01:20.821 Learn more: https://nextjs.org/docs/api-reference/edge-runtime
19:01:20.821 
19:01:20.821 Import trace for requested module:
19:01:20.822 ./node_modules/@supabase/realtime-js/dist/module/lib/websocket-factory.js
19:01:20.822 ./node_modules/@supabase/realtime-js/dist/module/index.js
19:01:20.822 ./node_modules/@supabase/supabase-js/dist/index.mjs
19:01:20.822 ./node_modules/@supabase/ssr/dist/module/createBrowserClient.js
19:01:20.823 ./node_modules/@supabase/ssr/dist/module/index.js
19:01:20.823 
19:01:20.823 ./node_modules/@supabase/supabase-js/dist/index.mjs
19:01:20.823 A Node.js API is used (process.version at line: 395) which is not supported in the Edge Runtime.
19:01:20.823 Learn more: https://nextjs.org/docs/api-reference/edge-runtime
19:01:20.824 
19:01:20.824 Import trace for requested module:
19:01:20.824 ./node_modules/@supabase/supabase-js/dist/index.mjs
19:01:20.824 ./node_modules/@supabase/ssr/dist/module/createBrowserClient.js
19:01:20.825 ./node_modules/@supabase/ssr/dist/module/index.js
19:01:20.825 
19:01:42.171 <w> [webpack.cache.PackFileCacheStrategy] Skipped not serializable cache item 'Compilation/modules|/vercel/path0/node_modules/next/dist/build/webpack/loaders/css-loader/src/index.js??ruleSet[1].rules[13].oneOf[10].use[2]!/vercel/path0/node_modules/next/dist/build/webpack/loaders/postcss-loader/src/index.js??ruleSet[1].rules[13].oneOf[10].use[3]!/vercel/path0/src/app/globals.css': No serializer registered for Warning
19:01:42.171 <w> while serializing webpack/lib/cache/PackFileCacheStrategy.PackContentItems -> webpack/lib/NormalModule -> Array { 1 items } -> webpack/lib/ModuleWarning -> Warning
19:01:43.904  ⚠ Compiled with warnings
19:01:43.905 
19:01:43.906 ./src/app/globals.css.webpack[javascript/auto]!=!./node_modules/next/dist/build/webpack/loaders/css-loader/src/index.js??ruleSet[1].rules[13].oneOf[10].use[2]!./node_modules/next/dist/build/webpack/loaders/postcss-loader/src/index.js??ruleSet[1].rules[13].oneOf[10].use[3]!./src/app/globals.css
19:01:43.906 Warning
19:01:43.907 
19:01:43.907 (837:5) autoprefixer: Replace color-adjust to print-color-adjust. The color-adjust shorthand is currently deprecated.
19:01:43.908 
19:01:43.909 Import trace for requested module:
19:01:43.909 ./src/app/globals.css.webpack[javascript/auto]!=!./node_modules/next/dist/build/webpack/loaders/css-loader/src/index.js??ruleSet[1].rules[13].oneOf[10].use[2]!./node_modules/next/dist/build/webpack/loaders/postcss-loader/src/index.js??ruleSet[1].rules[13].oneOf[10].use[3]!./src/app/globals.css
19:01:43.909 ./src/app/globals.css
19:01:43.909 
19:01:43.910 ./src/components/industry/IndustrySolutionTemplate.tsx
19:01:43.910 Attempted import error: 'IndustryNavigation' is not exported from '@/components/industry/IndustryNavigation' (imported as 'IndustryNavigation').
19:01:43.910 
19:01:43.914 Import trace for requested module:
19:01:43.914 ./src/components/industry/IndustrySolutionTemplate.tsx
19:01:43.914 
19:01:44.021  ✓ Compiled successfully
19:01:44.055    Skipping validation of types
19:01:44.055    Linting ...
19:01:44.329    Collecting page data ...
19:01:45.555 Error: Missing Supabase environment variables
19:01:45.555     at 67629 (.next/server/app/api/admin/dashboard/unified-stats/route.js:1:5167)
19:01:45.556     at t (.next/server/webpack-runtime.js:1:143)
19:01:45.557     at <unknown> (.next/server/app/api/admin/dashboard/unified-stats/route.js:1:4253)
19:01:45.557     at t.a (.next/server/webpack-runtime.js:1:918)
19:01:45.557     at 8864 (.next/server/app/api/admin/dashboard/unified-stats/route.js:1:4178)
19:01:45.557     at t (.next/server/webpack-runtime.js:1:143)
19:01:45.557     at <unknown> (.next/server/app/api/admin/dashboard/unified-stats/route.js:1:910)
19:01:45.558     at t.a (.next/server/webpack-runtime.js:1:918)
19:01:45.558     at 37681 (.next/server/app/api/admin/dashboard/unified-stats/route.js:1:731)
19:01:45.558     at t (.next/server/webpack-runtime.js:1:143)
19:01:45.558     at r (.next/server/app/api/admin/dashboard/unified-stats/route.js:1:6670)
19:01:45.559     at <unknown> (.next/server/app/api/admin/dashboard/unified-stats/route.js:1:6716)
19:01:45.559     at t.X (.next/server/webpack-runtime.js:1:2214)
19:01:45.559     at <unknown> (.next/server/app/api/admin/dashboard/unified-stats/route.js:1:6683)
19:01:45.559     at Object.<anonymous> (.next/server/app/api/admin/dashboard/unified-stats/route.js:1:6744)
19:01:45.560 
19:01:45.560 > Build error occurred
19:01:45.562 [Error: Failed to collect page data for /api/admin/dashboard/unified-stats] {
19:01:45.562   type: 'Error'
19:01:45.563 }
19:01:45.588 Error: Command "npm run build" exited with 1