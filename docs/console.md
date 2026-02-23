12:20:39.700 Running build in Washington, D.C., USA (East) – iad1
12:20:39.700 Build machine configuration: 2 cores, 8 GB
12:20:39.897 Cloning github.com/knaei3933/epackage (Branch: main, Commit: 85a2d6e)
12:20:39.898 Previous build caches not available.
12:20:42.370 Cloning completed: 2.473s
12:20:42.814 Found .vercelignore
12:20:42.859 Removed 13 ignored files defined in .vercelignore
12:20:42.859   /public/templates/template-box.ai
12:20:42.860   /public/templates/template-flat_3_side.ai
12:20:42.860   /public/templates/template-roll_film.ai
12:20:42.860   /public/templates/template-spout_pouch.ai
12:20:42.861   /public/templates/template-stand_up.ai
12:20:42.861   /src/app/archives/page.tsx
12:20:42.861   /src/components/archives/ArchiveDetailModal.tsx
12:20:42.862   /src/components/archives/ArchiveFilters.tsx
12:20:42.862   /src/components/archives/ArchiveGrid.tsx
12:20:42.862   /src/components/archives/ArchivePage.tsx
12:20:43.304 Running "vercel build"
12:20:43.907 Vercel CLI 50.22.0
12:20:44.512 Installing dependencies...
12:20:49.023 npm warn deprecated scmp@2.1.0: Just use Node.js's crypto.timingSafeEqual()
12:20:49.100 npm warn deprecated rimraf@2.7.1: Rimraf versions prior to v4 are no longer supported
12:20:50.303 npm warn deprecated lodash.isequal@4.5.0: This package is deprecated. Use require('node:util').isDeepStrictEqual instead.
12:20:50.735 npm warn deprecated inflight@1.0.6: This module is not supported, and leaks memory. Do not use it. Check out lru-cache if you want a good and tested way to coalesce async requests by a key value, which is much more comprehensive and powerful.
12:20:52.628 npm warn deprecated fstream@1.0.12: This package is no longer supported.
12:20:52.715 npm warn deprecated node-domexception@1.0.0: Use your platform's native DOMException instead
12:20:53.262 npm warn deprecated @supabase/auth-helpers-shared@0.7.0: This package is now deprecated - please use the @supabase/ssr package instead.
12:20:54.693 npm warn deprecated @supabase/auth-helpers-nextjs@0.10.0: This package is now deprecated - please use the @supabase/ssr package instead.
12:20:55.856 npm warn deprecated glob@7.2.3: Glob versions prior to v9 are no longer supported
12:20:55.984 npm warn deprecated glob@7.2.3: Glob versions prior to v9 are no longer supported
12:20:56.018 npm warn deprecated glob@7.2.3: Glob versions prior to v9 are no longer supported
12:20:56.699 npm warn deprecated glob@7.2.3: Glob versions prior to v9 are no longer supported
12:21:00.016 npm warn deprecated @mswjs/data@0.16.2: Package no longer supported. Contact Support at https://www.npmjs.com/support for more info.
12:21:17.708 
12:21:17.709 added 1516 packages in 33s
12:21:17.709 
12:21:17.709 314 packages are looking for funding
12:21:17.710   run `npm fund` for details
12:21:17.818 Detected Next.js version: 16.0.11
12:21:17.832 Running "npm run build"
12:21:17.927 
12:21:17.927 > epackage-lab-web@0.1.0 build
12:21:17.927 > next build --webpack
12:21:17.928 
12:21:18.145 [baseline-browser-mapping] The data in this module is over two months old.  To ensure accurate Baseline data, please update: `npm i baseline-browser-mapping@latest -D`
12:21:18.721 Attention: Next.js now collects completely anonymous telemetry regarding usage.
12:21:18.722 This information is used to shape Next.js' roadmap and prioritize features.
12:21:18.722 You can learn more, including how to opt-out if you'd not like to participate in this anonymous program, by visiting the following URL:
12:21:18.722 https://nextjs.org/telemetry
12:21:18.722 
12:21:18.736    ▲ Next.js 16.0.11 (webpack)
12:21:18.736 
12:21:18.745  ⚠ The "middleware" file convention is deprecated. Please use "proxy" instead. Learn more: https://nextjs.org/docs/messages/middleware-to-proxy
12:21:18.826    Creating an optimized production build ...
12:21:19.024 [baseline-browser-mapping] The data in this module is over two months old.  To ensure accurate Baseline data, please update: `npm i baseline-browser-mapping@latest -D`
12:22:08.738  ⚠ Compiled with warnings in 48s
12:22:08.739 
12:22:08.739 ./node_modules/handlebars/lib/index.js
12:22:08.740 require.extensions is not supported by webpack. Use a loader instead.
12:22:08.740 
12:22:08.740 Import trace for requested module:
12:22:08.740 ./node_modules/handlebars/lib/index.js
12:22:08.740 ./src/lib/pdf/specSheetPdfGenerator.ts
12:22:08.740 ./src/app/api/member/spec-sheets/generate/route.ts
12:22:08.741 
12:22:08.741 ./node_modules/handlebars/lib/index.js
12:22:08.741 require.extensions is not supported by webpack. Use a loader instead.
12:22:08.741 
12:22:08.741 Import trace for requested module:
12:22:08.742 ./node_modules/handlebars/lib/index.js
12:22:08.742 ./src/lib/pdf/specSheetPdfGenerator.ts
12:22:08.742 ./src/app/api/member/spec-sheets/generate/route.ts
12:22:08.742 
12:22:08.742 ./node_modules/handlebars/lib/index.js
12:22:08.743 require.extensions is not supported by webpack. Use a loader instead.
12:22:08.743 
12:22:08.743 Import trace for requested module:
12:22:08.743 ./node_modules/handlebars/lib/index.js
12:22:08.744 ./src/lib/pdf/specSheetPdfGenerator.ts
12:22:08.744 ./src/app/api/member/spec-sheets/generate/route.ts
12:22:08.744 
12:22:08.744 ./src/app/blog/[slug]/page.tsx
12:22:08.744 Attempted import error: 'seoUtils' is not exported from '@/lib/blog/seo' (imported as 'seoUtils').
12:22:08.745 
12:22:08.745 Import trace for requested module:
12:22:08.745 ./src/app/blog/[slug]/page.tsx
12:22:08.745 
12:22:08.746 ./src/app/blog/[slug]/page.tsx
12:22:08.746 Attempted import error: 'seoUtils' is not exported from '@/lib/blog/seo' (imported as 'seoUtils').
12:22:08.746 
12:22:08.746 Import trace for requested module:
12:22:08.746 ./src/app/blog/[slug]/page.tsx
12:22:08.747 
12:22:09.111 [baseline-browser-mapping] The data in this module is over two months old.  To ensure accurate Baseline data, please update: `npm i baseline-browser-mapping@latest -D`
12:22:14.158 <w> [webpack.cache.PackFileCacheStrategy] Serializing big strings (130kiB) impacts deserialization performance (consider using Buffer instead and decode when needed)
12:22:14.593  ⚠ Compiled with warnings in 4.3s
12:22:14.593 
12:22:14.594 ./node_modules/@supabase/realtime-js/dist/module/lib/websocket-factory.js
12:22:14.594 A Node.js API is used (process.versions at line: 39) which is not supported in the Edge Runtime.
12:22:14.594 Learn more: https://nextjs.org/docs/api-reference/edge-runtime
12:22:14.594 
12:22:14.595 Import trace for requested module:
12:22:14.595 ./node_modules/@supabase/realtime-js/dist/module/lib/websocket-factory.js
12:22:14.600 ./node_modules/@supabase/realtime-js/dist/module/index.js
12:22:14.600 ./node_modules/@supabase/supabase-js/dist/index.mjs
12:22:14.600 ./node_modules/@supabase/ssr/dist/module/createServerClient.js
12:22:14.601 ./node_modules/@supabase/ssr/dist/module/index.js
12:22:14.601 
12:22:14.601 ./node_modules/@supabase/supabase-js/dist/index.mjs
12:22:14.602 A Node.js API is used (process.version at line: 395) which is not supported in the Edge Runtime.
12:22:14.602 Learn more: https://nextjs.org/docs/api-reference/edge-runtime
12:22:14.602 
12:22:14.602 Import trace for requested module:
12:22:14.603 ./node_modules/@supabase/supabase-js/dist/index.mjs
12:22:14.603 ./node_modules/@supabase/ssr/dist/module/createServerClient.js
12:22:14.603 ./node_modules/@supabase/ssr/dist/module/index.js
12:22:14.611 
12:22:14.873 [baseline-browser-mapping] The data in this module is over two months old.  To ensure accurate Baseline data, please update: `npm i baseline-browser-mapping@latest -D`
12:22:36.477 <w> [webpack.cache.PackFileCacheStrategy] Skipped not serializable cache item 'Compilation/modules|/vercel/path0/node_modules/next/dist/build/webpack/loaders/css-loader/src/index.js??ruleSet[1].rules[15].oneOf[10].use[2]!/vercel/path0/node_modules/next/dist/build/webpack/loaders/postcss-loader/src/index.js??ruleSet[1].rules[15].oneOf[10].use[3]!/vercel/path0/src/app/globals.css': No serializer registered for Warning
12:22:36.477 <w> while serializing webpack/lib/cache/PackFileCacheStrategy.PackContentItems -> webpack/lib/NormalModule -> Array { 1 items } -> webpack/lib/ModuleWarning -> Warning
12:22:38.366  ⚠ Compiled with warnings in 22.3s
12:22:38.366 
12:22:38.366 ./src/app/globals.css.webpack[javascript/auto]!=!./node_modules/next/dist/build/webpack/loaders/css-loader/src/index.js??ruleSet[1].rules[15].oneOf[10].use[2]!./node_modules/next/dist/build/webpack/loaders/postcss-loader/src/index.js??ruleSet[1].rules[15].oneOf[10].use[3]!./src/app/globals.css
12:22:38.367 Warning
12:22:38.368 
12:22:38.368 (899:5) autoprefixer: Replace color-adjust to print-color-adjust. The color-adjust shorthand is currently deprecated.
12:22:38.368 
12:22:38.368 Import trace for requested module:
12:22:38.368 ./src/app/globals.css.webpack[javascript/auto]!=!./node_modules/next/dist/build/webpack/loaders/css-loader/src/index.js??ruleSet[1].rules[15].oneOf[10].use[2]!./node_modules/next/dist/build/webpack/loaders/postcss-loader/src/index.js??ruleSet[1].rules[15].oneOf[10].use[3]!./src/app/globals.css
12:22:38.368 ./src/app/globals.css
12:22:38.368 
12:22:38.459  ✓ Compiled successfully in 75s
12:22:38.462    Skipping validation of types
12:22:38.523    Collecting page data using 1 worker ...
12:22:39.368 [baseline-browser-mapping] The data in this module is over two months old.  To ensure accurate Baseline data, please update: `npm i baseline-browser-mapping@latest -D`
12:22:39.599 [Email] SendGrid not configured
12:22:39.600 [Email] No email service configured - using console fallback
12:22:39.806 [EpackMailer] No SMTP configured - using console fallback
12:22:40.359 [createServiceClient] Credentials not configured, using mock client
12:22:40.655 [AccountDeletionEmail] SendGrid not configured
12:22:40.656 [AccountDeletionEmail] No email service configured - using console fallback
12:22:41.435  ⚠ Using edge runtime on a page currently disables static generation for that page
12:22:41.792 [createServiceClient] Credentials not configured, using mock client
12:22:41.793 [getTagsWithCounts] Error: { message: 'Not configured', code: 'CONFIG_ERROR' }
12:22:41.872 Error: Failed to collect configuration for /
12:22:41.872     at ignore-listed frames {
12:22:41.872   [cause]: Error: Missing Supabase environment variables
12:22:41.873       at 79933 (.next/server/app/page.js:16:79718)
12:22:41.873       at k (.next/server/webpack-runtime.js:1:159)
12:22:41.873       at <unknown> (.next/server/app/page.js:1:4612)
12:22:41.873       at k.a (.next/server/webpack-runtime.js:1:721)
12:22:41.874       at 4494 (.next/server/app/page.js:1:4474)
12:22:41.874       at k (.next/server/webpack-runtime.js:1:159)
12:22:41.874 }
12:22:42.379 
12:22:42.380 > Build error occurred
12:22:42.384 Error: Failed to collect page data for /
12:22:42.384     at ignore-listed frames {
12:22:42.384   type: 'Error'
12:22:42.385 }
12:22:42.422 Error: Command "npm run build" exited with 1