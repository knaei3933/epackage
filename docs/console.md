04:50:41.580 Running build in Washington, D.C., USA (East) – iad1
04:50:41.581 Build machine configuration: 2 cores, 8 GB
04:50:41.688 Cloning github.com/knaei3933/epackage (Branch: main, Commit: 5aa5425)
04:50:41.689 Previous build caches not available.
04:50:52.975 Cloning completed: 11.287s
04:50:53.951 Running "vercel build"
04:50:54.605 Vercel CLI 50.15.1
04:50:55.167 Running "install" command: `npm install`...
04:50:59.303 npm warn deprecated scmp@2.1.0: Just use Node.js's crypto.timingSafeEqual()
04:50:59.353 npm warn deprecated rimraf@2.7.1: Rimraf versions prior to v4 are no longer supported
04:51:00.455 npm warn deprecated lodash.isequal@4.5.0: This package is deprecated. Use require('node:util').isDeepStrictEqual instead.
04:51:00.958 npm warn deprecated inflight@1.0.6: This module is not supported, and leaks memory. Do not use it. Check out lru-cache if you want a good and tested way to coalesce async requests by a key value, which is much more comprehensive and powerful.
04:51:02.462 npm warn deprecated node-domexception@1.0.0: Use your platform's native DOMException instead
04:51:02.508 npm warn deprecated fstream@1.0.12: This package is no longer supported.
04:51:03.521 npm warn deprecated @supabase/auth-helpers-shared@0.7.0: This package is now deprecated - please use the @supabase/ssr package instead.
04:51:04.182 npm warn deprecated @supabase/auth-helpers-nextjs@0.10.0: This package is now deprecated - please use the @supabase/ssr package instead.
04:51:06.527 npm warn deprecated glob@7.2.3: Glob versions prior to v9 are no longer supported
04:51:06.661 npm warn deprecated glob@7.2.3: Glob versions prior to v9 are no longer supported
04:51:06.771 npm warn deprecated glob@7.2.3: Glob versions prior to v9 are no longer supported
04:51:07.728 npm warn deprecated glob@7.2.3: Glob versions prior to v9 are no longer supported
04:51:10.759 npm warn deprecated @mswjs/data@0.16.2: Package no longer supported. Contact Support at https://www.npmjs.com/support for more info.
04:51:31.772 npm warn deprecated next@15.1.6: This version has a security vulnerability. Please upgrade to a patched version. See https://nextjs.org/blog/CVE-2025-66478 for more details.
04:51:33.169 
04:51:33.170 added 1398 packages, and audited 1399 packages in 38s
04:51:33.170 
04:51:33.170 241 packages are looking for funding
04:51:33.171   run `npm fund` for details
04:51:33.325 
04:51:33.325 26 vulnerabilities (3 moderate, 21 high, 2 critical)
04:51:33.325 
04:51:33.326 To address issues that do not require attention, run:
04:51:33.326   npm audit fix
04:51:33.326 
04:51:33.326 To address all issues (including breaking changes), run:
04:51:33.326   npm audit fix --force
04:51:33.326 
04:51:33.326 Run `npm audit` for details.
04:51:33.521 Detected Next.js version: 15.1.6
04:51:33.522 Running "npm run build"
04:51:33.628 
04:51:33.629 > epackage-lab-web@0.1.0 build
04:51:33.629 > next build
04:51:33.629 
04:51:34.200 Attention: Next.js now collects completely anonymous telemetry regarding usage.
04:51:34.200 This information is used to shape Next.js' roadmap and prioritize features.
04:51:34.200 You can learn more, including how to opt-out if you'd not like to participate in this anonymous program, by visiting the following URL:
04:51:34.200 https://nextjs.org/telemetry
04:51:34.200 
04:51:34.267    ▲ Next.js 15.1.6
04:51:34.267 
04:51:34.315    Creating an optimized production build ...
04:52:21.268  ⚠ Compiled with warnings
04:52:21.269 
04:52:21.269 ./node_modules/handlebars/lib/index.js
04:52:21.269 require.extensions is not supported by webpack. Use a loader instead.
04:52:21.269 
04:52:21.269 Import trace for requested module:
04:52:21.270 ./node_modules/handlebars/lib/index.js
04:52:21.270 ./src/app/api/contract/pdf/route.ts
04:52:21.270 
04:52:21.270 ./node_modules/handlebars/lib/index.js
04:52:21.270 require.extensions is not supported by webpack. Use a loader instead.
04:52:21.270 
04:52:21.270 Import trace for requested module:
04:52:21.270 ./node_modules/handlebars/lib/index.js
04:52:21.270 ./src/app/api/contract/pdf/route.ts
04:52:21.270 
04:52:21.270 ./node_modules/handlebars/lib/index.js
04:52:21.270 require.extensions is not supported by webpack. Use a loader instead.
04:52:21.271 
04:52:21.271 Import trace for requested module:
04:52:21.271 ./node_modules/handlebars/lib/index.js
04:52:21.271 ./src/app/api/contract/pdf/route.ts
04:52:21.272 
04:52:26.484 <w> [webpack.cache.PackFileCacheStrategy] Serializing big strings (130kiB) impacts deserialization performance (consider using Buffer instead and decode when needed)
04:52:26.813  ⚠ Compiled with warnings
04:52:26.814 
04:52:26.814 ./node_modules/@supabase/realtime-js/dist/module/lib/websocket-factory.js
04:52:26.814 A Node.js API is used (process.versions at line: 39) which is not supported in the Edge Runtime.
04:52:26.814 Learn more: https://nextjs.org/docs/api-reference/edge-runtime
04:52:26.814 
04:52:26.814 Import trace for requested module:
04:52:26.814 ./node_modules/@supabase/realtime-js/dist/module/lib/websocket-factory.js
04:52:26.814 ./node_modules/@supabase/realtime-js/dist/module/index.js
04:52:26.814 ./node_modules/@supabase/supabase-js/dist/index.mjs
04:52:26.814 ./node_modules/@supabase/ssr/dist/module/createBrowserClient.js
04:52:26.814 ./node_modules/@supabase/ssr/dist/module/index.js
04:52:26.814 
04:52:26.814 ./node_modules/@supabase/supabase-js/dist/index.mjs
04:52:26.814 A Node.js API is used (process.version at line: 395) which is not supported in the Edge Runtime.
04:52:26.814 Learn more: https://nextjs.org/docs/api-reference/edge-runtime
04:52:26.814 
04:52:26.814 Import trace for requested module:
04:52:26.815 ./node_modules/@supabase/supabase-js/dist/index.mjs
04:52:26.815 ./node_modules/@supabase/ssr/dist/module/createBrowserClient.js
04:52:26.815 ./node_modules/@supabase/ssr/dist/module/index.js
04:52:26.815 
04:52:50.063 <w> [webpack.cache.PackFileCacheStrategy] Skipped not serializable cache item 'Compilation/modules|/vercel/path0/node_modules/next/dist/build/webpack/loaders/css-loader/src/index.js??ruleSet[1].rules[13].oneOf[10].use[2]!/vercel/path0/node_modules/next/dist/build/webpack/loaders/postcss-loader/src/index.js??ruleSet[1].rules[13].oneOf[10].use[3]!/vercel/path0/src/app/globals.css': No serializer registered for Warning
04:52:50.064 <w> while serializing webpack/lib/cache/PackFileCacheStrategy.PackContentItems -> webpack/lib/NormalModule -> Array { 1 items } -> webpack/lib/ModuleWarning -> Warning
04:52:51.974  ⚠ Compiled with warnings
04:52:51.975 
04:52:51.975 ./src/app/globals.css.webpack[javascript/auto]!=!./node_modules/next/dist/build/webpack/loaders/css-loader/src/index.js??ruleSet[1].rules[13].oneOf[10].use[2]!./node_modules/next/dist/build/webpack/loaders/postcss-loader/src/index.js??ruleSet[1].rules[13].oneOf[10].use[3]!./src/app/globals.css
04:52:51.976 Warning
04:52:51.976 
04:52:51.976 (837:5) autoprefixer: Replace color-adjust to print-color-adjust. The color-adjust shorthand is currently deprecated.
04:52:51.977 
04:52:51.977 Import trace for requested module:
04:52:51.977 ./src/app/globals.css.webpack[javascript/auto]!=!./node_modules/next/dist/build/webpack/loaders/css-loader/src/index.js??ruleSet[1].rules[13].oneOf[10].use[2]!./node_modules/next/dist/build/webpack/loaders/postcss-loader/src/index.js??ruleSet[1].rules[13].oneOf[10].use[3]!./src/app/globals.css
04:52:51.978 ./src/app/globals.css
04:52:51.978 
04:52:52.085  ✓ Compiled successfully
04:52:52.088    Skipping validation of types
04:52:52.088    Linting ...
04:52:52.357    Collecting page data ...
04:52:53.760 [Email] Production mode - configuring email service
04:52:53.761 [Email] SendGrid not configured
04:52:53.761 [Email] No email service configured - using console fallback
04:52:53.906 [EpackMailer] No SMTP configured - using console fallback
04:52:54.408 [createServiceClient] Credentials not configured, using mock client
04:52:55.039 [AccountDeletionEmail] Configuring email service
04:52:55.040 [AccountDeletionEmail] SendGrid not configured
04:52:55.041 [AccountDeletionEmail] No email service configured - using console fallback
04:52:55.313  ⚠ Using edge runtime on a page currently disables static generation for that page
04:53:04.245    Generating static pages (0/84) ...
04:53:05.217 [supabase-browser] Credentials not configured, returning mock client
04:53:05.217 [AuthProvider] useSearchParams not available, using empty: Error: Bail out to client-side rendering: useSearchParams()
04:53:05.217     at a (.next/server/chunks/6821.js:1:17081)
04:53:05.217     at d (.next/server/chunks/6821.js:1:33677)
04:53:05.217     at <unknown> (.next/server/chunks/1653.js:247:80510)
04:53:05.217     at d (.next/server/chunks/1653.js:247:80473) {
04:53:05.217   reason: 'useSearchParams()',
04:53:05.217   digest: 'BAILOUT_TO_CLIENT_SIDE_RENDERING'
04:53:05.217 }
04:53:05.217 [AuthProvider] useSearchParams not available, using empty: Error: Bail out to client-side rendering: useSearchParams()
04:53:05.217     at a (.next/server/chunks/6821.js:1:17081)
04:53:05.218     at d (.next/server/chunks/6821.js:1:33677)
04:53:05.218     at <unknown> (.next/server/chunks/1653.js:247:80510)
04:53:05.218     at d (.next/server/chunks/1653.js:247:80473) {
04:53:05.218   reason: 'useSearchParams()',
04:53:05.219   digest: 'BAILOUT_TO_CLIENT_SIDE_RENDERING'
04:53:05.219 }
04:53:05.219 [AuthProvider] useSearchParams not available, using empty: Error: Bail out to client-side rendering: useSearchParams()
04:53:05.219     at a (.next/server/chunks/6821.js:1:17081)
04:53:05.219     at d (.next/server/chunks/6821.js:1:33677)
04:53:05.219     at <unknown> (.next/server/chunks/1653.js:247:80510)
04:53:05.219     at d (.next/server/chunks/1653.js:247:80473) {
04:53:05.219   reason: 'useSearchParams()',
04:53:05.219   digest: 'BAILOUT_TO_CLIENT_SIDE_RENDERING'
04:53:05.219 }
04:53:05.837    Generating static pages (21/84) 
04:53:05.915 [AuthProvider] useSearchParams not available, using empty: Error: Bail out to client-side rendering: useSearchParams()
04:53:05.916     at a (.next/server/chunks/6821.js:1:17081)
04:53:05.917     at d (.next/server/chunks/6821.js:1:33677)
04:53:05.917     at <unknown> (.next/server/chunks/1653.js:247:80510)
04:53:05.917     at d (.next/server/chunks/1653.js:247:80473) {
04:53:05.918   reason: 'useSearchParams()',
04:53:05.918   digest: 'BAILOUT_TO_CLIENT_SIDE_RENDERING'
04:53:05.918 }
04:53:05.918 [AuthProvider] useSearchParams not available, using empty: Error: Bail out to client-side rendering: useSearchParams()
04:53:05.919     at a (.next/server/chunks/6821.js:1:17081)
04:53:05.919     at d (.next/server/chunks/6821.js:1:33677)
04:53:05.919     at <unknown> (.next/server/chunks/1653.js:247:80510)
04:53:05.919     at d (.next/server/chunks/1653.js:247:80473) {
04:53:05.920   reason: 'useSearchParams()',
04:53:05.920   digest: 'BAILOUT_TO_CLIENT_SIDE_RENDERING'
04:53:05.923 }
04:53:05.923 [AuthProvider] useSearchParams not available, using empty: Error: Bail out to client-side rendering: useSearchParams()
04:53:05.923     at a (.next/server/chunks/6821.js:1:17081)
04:53:05.924     at d (.next/server/chunks/6821.js:1:33677)
04:53:05.924     at <unknown> (.next/server/chunks/1653.js:247:80510)
04:53:05.924     at d (.next/server/chunks/1653.js:247:80473) {
04:53:05.924   reason: 'useSearchParams()',
04:53:05.924   digest: 'BAILOUT_TO_CLIENT_SIDE_RENDERING'
04:53:05.924 }
04:53:05.925 [AuthProvider] useSearchParams not available, using empty: Error: Bail out to client-side rendering: useSearchParams()
04:53:05.925     at a (.next/server/chunks/6821.js:1:17081)
04:53:05.925     at d (.next/server/chunks/6821.js:1:33677)
04:53:05.925     at <unknown> (.next/server/chunks/1653.js:247:80510)
04:53:05.925     at d (.next/server/chunks/1653.js:247:80473) {
04:53:05.925   reason: 'useSearchParams()',
04:53:05.925   digest: 'BAILOUT_TO_CLIENT_SIDE_RENDERING'
04:53:05.925 }
04:53:05.925 [AuthProvider] useSearchParams not available, using empty: Error: Bail out to client-side rendering: useSearchParams()
04:53:05.925     at a (.next/server/chunks/6821.js:1:17081)
04:53:05.925     at d (.next/server/chunks/6821.js:1:33677)
04:53:05.925     at <unknown> (.next/server/chunks/1653.js:247:80510)
04:53:05.925     at d (.next/server/chunks/1653.js:247:80473) {
04:53:05.925   reason: 'useSearchParams()',
04:53:05.925   digest: 'BAILOUT_TO_CLIENT_SIDE_RENDERING'
04:53:05.925 }
04:53:05.925 [AuthProvider] useSearchParams not available, using empty: Error: Bail out to client-side rendering: useSearchParams()
04:53:05.925     at a (.next/server/chunks/6821.js:1:17081)
04:53:05.925     at d (.next/server/chunks/6821.js:1:33677)
04:53:05.926     at <unknown> (.next/server/chunks/1653.js:247:80510)
04:53:05.926     at d (.next/server/chunks/1653.js:247:80473) {
04:53:05.926   reason: 'useSearchParams()',
04:53:05.926   digest: 'BAILOUT_TO_CLIENT_SIDE_RENDERING'
04:53:05.926 }
04:53:05.926 [AuthProvider] useSearchParams not available, using empty: Error: Bail out to client-side rendering: useSearchParams()
04:53:05.926     at a (.next/server/chunks/6821.js:1:17081)
04:53:05.926     at d (.next/server/chunks/6821.js:1:33677)
04:53:05.926     at <unknown> (.next/server/chunks/1653.js:247:80510)
04:53:05.926     at d (.next/server/chunks/1653.js:247:80473) {
04:53:05.926   reason: 'useSearchParams()',
04:53:05.927   digest: 'BAILOUT_TO_CLIENT_SIDE_RENDERING'
04:53:05.927 }
04:53:05.927 [AuthProvider] useSearchParams not available, using empty: Error: Bail out to client-side rendering: useSearchParams()
04:53:05.927     at a (.next/server/chunks/6821.js:1:17081)
04:53:05.928     at d (.next/server/chunks/6821.js:1:33677)
04:53:05.928     at <unknown> (.next/server/chunks/1653.js:247:80510)
04:53:05.928     at d (.next/server/chunks/1653.js:247:80473) {
04:53:05.928   reason: 'useSearchParams()',
04:53:05.929   digest: 'BAILOUT_TO_CLIENT_SIDE_RENDERING'
04:53:05.929 }
04:53:05.929 [AuthProvider] useSearchParams not available, using empty: Error: Bail out to client-side rendering: useSearchParams()
04:53:05.929     at a (.next/server/chunks/6821.js:1:17081)
04:53:05.930     at d (.next/server/chunks/6821.js:1:33677)
04:53:05.930     at <unknown> (.next/server/chunks/1653.js:247:80510)
04:53:05.930     at d (.next/server/chunks/1653.js:247:80473) {
04:53:05.930   reason: 'useSearchParams()',
04:53:05.931   digest: 'BAILOUT_TO_CLIENT_SIDE_RENDERING'
04:53:05.931 }
04:53:05.931 [AuthProvider] useSearchParams not available, using empty: Error: Bail out to client-side rendering: useSearchParams()
04:53:05.931     at a (.next/server/chunks/6821.js:1:17081)
04:53:05.932     at d (.next/server/chunks/6821.js:1:33677)
04:53:05.932     at <unknown> (.next/server/chunks/1653.js:247:80510)
04:53:05.932     at d (.next/server/chunks/1653.js:247:80473) {
04:53:05.934   reason: 'useSearchParams()',
04:53:05.934   digest: 'BAILOUT_TO_CLIENT_SIDE_RENDERING'
04:53:05.934 }
04:53:05.935 [AuthProvider] useSearchParams not available, using empty: Error: Bail out to client-side rendering: useSearchParams()
04:53:05.935     at a (.next/server/chunks/6821.js:1:17081)
04:53:05.935     at d (.next/server/chunks/6821.js:1:33677)
04:53:05.935     at <unknown> (.next/server/chunks/1653.js:247:80510)
04:53:05.936     at d (.next/server/chunks/1653.js:247:80473) {
04:53:05.936   reason: 'useSearchParams()',
04:53:05.936   digest: 'BAILOUT_TO_CLIENT_SIDE_RENDERING'
04:53:05.937 }
04:53:05.937 [AuthProvider] useSearchParams not available, using empty: Error: Bail out to client-side rendering: useSearchParams()
04:53:05.937     at a (.next/server/chunks/6821.js:1:17081)
04:53:05.937     at d (.next/server/chunks/6821.js:1:33677)
04:53:05.938     at <unknown> (.next/server/chunks/1653.js:247:80510)
04:53:05.938     at d (.next/server/chunks/1653.js:247:80473) {
04:53:05.941   reason: 'useSearchParams()',
04:53:05.941   digest: 'BAILOUT_TO_CLIENT_SIDE_RENDERING'
04:53:05.942 }
04:53:05.942 [createServiceClient] Credentials not configured, using mock client
04:53:05.942 [getFeaturedProducts] Unexpected error: TypeError: t.from(...).select is not a function
04:53:05.942     at s.revalidate (.next/server/app/page.js:15:44140)
04:53:05.942     at <unknown> (.next/server/chunks/1482.js:1:7519)
04:53:05.942     at async d (.next/server/app/page.js:15:37724)
04:53:05.945 [createServiceClient] Credentials not configured, using mock client
04:53:05.945 [getLatestAnnouncements] Unexpected error: TypeError: t.from(...).select is not a function
04:53:05.945     at l.revalidate (.next/server/app/page.js:15:44577)
04:53:05.946     at <unknown> (.next/server/chunks/1482.js:1:7519)
04:53:05.946     at async d (.next/server/app/page.js:15:37724)
04:53:05.946 [AuthProvider] useSearchParams not available, using empty: Error: Bail out to client-side rendering: useSearchParams()
04:53:05.946     at a (.next/server/chunks/6821.js:1:17081)
04:53:05.946     at d (.next/server/chunks/6821.js:1:33677)
04:53:05.947     at <unknown> (.next/server/chunks/1653.js:247:80510)
04:53:05.947     at d (.next/server/chunks/1653.js:247:80473) {
04:53:05.947   reason: 'useSearchParams()',
04:53:05.947   digest: 'BAILOUT_TO_CLIENT_SIDE_RENDERING'
04:53:05.948 }
04:53:05.948 [AuthProvider] useSearchParams not available, using empty: Error: Bail out to client-side rendering: useSearchParams()
04:53:05.948     at a (.next/server/chunks/6821.js:1:17081)
04:53:05.948     at d (.next/server/chunks/6821.js:1:33677)
04:53:05.949     at <unknown> (.next/server/chunks/1653.js:247:80510)
04:53:05.949     at d (.next/server/chunks/1653.js:247:80473) {
04:53:05.949   reason: 'useSearchParams()',
04:53:05.952   digest: 'BAILOUT_TO_CLIENT_SIDE_RENDERING'
04:53:05.953 }
04:53:05.953 [AuthProvider] useSearchParams not available, using empty: Error: Bail out to client-side rendering: useSearchParams()
04:53:05.953     at a (.next/server/chunks/6821.js:1:17081)
04:53:05.953     at d (.next/server/chunks/6821.js:1:33677)
04:53:05.954     at <unknown> (.next/server/chunks/1653.js:247:80510)
04:53:05.954     at d (.next/server/chunks/1653.js:247:80473) {
04:53:05.954   reason: 'useSearchParams()',
04:53:05.954   digest: 'BAILOUT_TO_CLIENT_SIDE_RENDERING'
04:53:05.955 }
04:53:05.957 [Catalog] CatalogClient component rendering
04:53:05.957 [Catalog] State: { isLoading: true, productsLength: 0, filteredLength: 0 }
04:53:05.958 [getDefaultPostProcessingOptions] Selected defaults: [
04:53:05.958   'zipper-yes',
04:53:05.958   'glossy',
04:53:05.958   'notch-yes',
04:53:05.958   'hang-hole-6mm',
04:53:05.959   'corner-round',
04:53:05.959   'valve-no',
04:53:05.960   'top-open',
04:53:05.961   'sealing-width-5mm'
04:53:05.961 ]
04:53:05.961 [QuoteContext] initialState created: {
04:53:05.961   materialWidth: 590,
04:53:05.961   filmLayers: [
04:53:05.962     { materialId: 'PET', thickness: 12 },
04:53:05.962     { materialId: 'AL', thickness: 7 },
04:53:05.962     { materialId: 'PET', thickness: 12 },
04:53:05.962     { materialId: 'LLDPE', thickness: 70 }
04:53:05.962   ],
04:53:05.963   filmLayersCount: 4
04:53:05.963 }
04:53:06.072 [AuthProvider] useSearchParams not available, using empty: Error: Bail out to client-side rendering: useSearchParams()
04:53:06.073     at a (.next/server/chunks/6821.js:1:17081)
04:53:06.073     at d (.next/server/chunks/6821.js:1:33677)
04:53:06.074     at <unknown> (.next/server/chunks/1653.js:247:80510)
04:53:06.074     at d (.next/server/chunks/1653.js:247:80473) {
04:53:06.074   reason: 'useSearchParams()',
04:53:06.074   digest: 'BAILOUT_TO_CLIENT_SIDE_RENDERING'
04:53:06.075 }
04:53:06.075 [AuthProvider] useSearchParams not available, using empty: Error: Bail out to client-side rendering: useSearchParams()
04:53:06.075     at a (.next/server/chunks/6821.js:1:17081)
04:53:06.075     at d (.next/server/chunks/6821.js:1:33677)
04:53:06.075     at <unknown> (.next/server/chunks/1653.js:247:80510)
04:53:06.075     at d (.next/server/chunks/1653.js:247:80473) {
04:53:06.075   reason: 'useSearchParams()',
04:53:06.076   digest: 'BAILOUT_TO_CLIENT_SIDE_RENDERING'
04:53:06.076 }
04:53:06.076 [AuthProvider] useSearchParams not available, using empty: Error: Bail out to client-side rendering: useSearchParams()
04:53:06.076     at a (.next/server/chunks/6821.js:1:17081)
04:53:06.076     at d (.next/server/chunks/6821.js:1:33677)
04:53:06.076     at <unknown> (.next/server/chunks/1653.js:247:80510)
04:53:06.076     at d (.next/server/chunks/1653.js:247:80473) {
04:53:06.076   reason: 'useSearchParams()',
04:53:06.076   digest: 'BAILOUT_TO_CLIENT_SIDE_RENDERING'
04:53:06.076 }
04:53:06.076 [AuthProvider] useSearchParams not available, using empty: Error: Bail out to client-side rendering: useSearchParams()
04:53:06.076     at a (.next/server/chunks/6821.js:1:17081)
04:53:06.076     at d (.next/server/chunks/6821.js:1:33677)
04:53:06.076     at <unknown> (.next/server/chunks/1653.js:247:80510)
04:53:06.076     at d (.next/server/chunks/1653.js:247:80473) {
04:53:06.076   reason: 'useSearchParams()',
04:53:06.076   digest: 'BAILOUT_TO_CLIENT_SIDE_RENDERING'
04:53:06.076 }
04:53:06.076 [AuthProvider] useSearchParams not available, using empty: Error: Bail out to client-side rendering: useSearchParams()
04:53:06.076     at a (.next/server/chunks/6821.js:1:17081)
04:53:06.076     at d (.next/server/chunks/6821.js:1:33677)
04:53:06.076     at <unknown> (.next/server/chunks/1653.js:247:80510)
04:53:06.077     at d (.next/server/chunks/1653.js:247:80473) {
04:53:06.077   reason: 'useSearchParams()',
04:53:06.077   digest: 'BAILOUT_TO_CLIENT_SIDE_RENDERING'
04:53:06.077 }
04:53:06.077 [AuthProvider] useSearchParams not available, using empty: Error: Bail out to client-side rendering: useSearchParams()
04:53:06.077     at a (.next/server/chunks/6821.js:1:17081)
04:53:06.077     at d (.next/server/chunks/6821.js:1:33677)
04:53:06.077     at <unknown> (.next/server/chunks/1653.js:247:80510)
04:53:06.077     at d (.next/server/chunks/1653.js:247:80473) {
04:53:06.077   reason: 'useSearchParams()',
04:53:06.077   digest: 'BAILOUT_TO_CLIENT_SIDE_RENDERING'
04:53:06.077 }
04:53:06.263 [AuthProvider] useSearchParams not available, using empty: Error: Bail out to client-side rendering: useSearchParams()
04:53:06.264     at a (.next/server/chunks/6821.js:1:17081)
04:53:06.264     at d (.next/server/chunks/6821.js:1:33677)
04:53:06.264     at <unknown> (.next/server/chunks/1653.js:247:80510)
04:53:06.265     at d (.next/server/chunks/1653.js:247:80473) {
04:53:06.265   reason: 'useSearchParams()',
04:53:06.265   digest: 'BAILOUT_TO_CLIENT_SIDE_RENDERING'
04:53:06.266 }
04:53:06.266 [AuthProvider] useSearchParams not available, using empty: Error: Bail out to client-side rendering: useSearchParams()
04:53:06.266     at a (.next/server/chunks/6821.js:1:17081)
04:53:06.267     at d (.next/server/chunks/6821.js:1:33677)
04:53:06.267     at <unknown> (.next/server/chunks/1653.js:247:80510)
04:53:06.267     at d (.next/server/chunks/1653.js:247:80473) {
04:53:06.267   reason: 'useSearchParams()',
04:53:06.268   digest: 'BAILOUT_TO_CLIENT_SIDE_RENDERING'
04:53:06.268 }
04:53:06.268 [AuthProvider] useSearchParams not available, using empty: Error: Bail out to client-side rendering: useSearchParams()
04:53:06.268     at a (.next/server/chunks/6821.js:1:17081)
04:53:06.269     at d (.next/server/chunks/6821.js:1:33677)
04:53:06.269     at <unknown> (.next/server/chunks/1653.js:247:80510)
04:53:06.269     at d (.next/server/chunks/1653.js:247:80473) {
04:53:06.270   reason: 'useSearchParams()',
04:53:06.270   digest: 'BAILOUT_TO_CLIENT_SIDE_RENDERING'
04:53:06.270 }
04:53:06.270 [AuthProvider] useSearchParams not available, using empty: Error: Bail out to client-side rendering: useSearchParams()
04:53:06.270     at a (.next/server/chunks/6821.js:1:17081)
04:53:06.270     at d (.next/server/chunks/6821.js:1:33677)
04:53:06.270     at <unknown> (.next/server/chunks/1653.js:247:80510)
04:53:06.270     at d (.next/server/chunks/1653.js:247:80473) {
04:53:06.270   reason: 'useSearchParams()',
04:53:06.270   digest: 'BAILOUT_TO_CLIENT_SIDE_RENDERING'
04:53:06.271 }
04:53:06.271 [AuthProvider] useSearchParams not available, using empty: Error: Bail out to client-side rendering: useSearchParams()
04:53:06.271     at a (.next/server/chunks/6821.js:1:17081)
04:53:06.271     at d (.next/server/chunks/6821.js:1:33677)
04:53:06.271     at <unknown> (.next/server/chunks/1653.js:247:80510)
04:53:06.271     at d (.next/server/chunks/1653.js:247:80473) {
04:53:06.271   reason: 'useSearchParams()',
04:53:06.271   digest: 'BAILOUT_TO_CLIENT_SIDE_RENDERING'
04:53:06.271 }
04:53:06.481 [AuthProvider] useSearchParams not available, using empty: Error: Bail out to client-side rendering: useSearchParams()
04:53:06.482     at a (.next/server/chunks/6821.js:1:17081)
04:53:06.483     at d (.next/server/chunks/6821.js:1:33677)
04:53:06.483     at <unknown> (.next/server/chunks/1653.js:247:80510)
04:53:06.483     at d (.next/server/chunks/1653.js:247:80473) {
04:53:06.484   reason: 'useSearchParams()',
04:53:06.484   digest: 'BAILOUT_TO_CLIENT_SIDE_RENDERING'
04:53:06.484 }
04:53:06.484 [AuthProvider] useSearchParams not available, using empty: Error: Bail out to client-side rendering: useSearchParams()
04:53:06.485     at a (.next/server/chunks/6821.js:1:17081)
04:53:06.485     at d (.next/server/chunks/6821.js:1:33677)
04:53:06.485     at <unknown> (.next/server/chunks/1653.js:247:80510)
04:53:06.485     at d (.next/server/chunks/1653.js:247:80473) {
04:53:06.486   reason: 'useSearchParams()',
04:53:06.486   digest: 'BAILOUT_TO_CLIENT_SIDE_RENDERING'
04:53:06.486 }
04:53:06.486 [AuthProvider] useSearchParams not available, using empty: Error: Bail out to client-side rendering: useSearchParams()
04:53:06.487     at a (.next/server/chunks/6821.js:1:17081)
04:53:06.487     at d (.next/server/chunks/6821.js:1:33677)
04:53:06.487     at <unknown> (.next/server/chunks/1653.js:247:80510)
04:53:06.487     at d (.next/server/chunks/1653.js:247:80473) {
04:53:06.488   reason: 'useSearchParams()',
04:53:06.488   digest: 'BAILOUT_TO_CLIENT_SIDE_RENDERING'
04:53:06.488 }
04:53:06.489 [AuthProvider] useSearchParams not available, using empty: Error: Bail out to client-side rendering: useSearchParams()
04:53:06.489     at a (.next/server/chunks/6821.js:1:17081)
04:53:06.489     at d (.next/server/chunks/6821.js:1:33677)
04:53:06.489     at <unknown> (.next/server/chunks/1653.js:247:80510)
04:53:06.489     at d (.next/server/chunks/1653.js:247:80473) {
04:53:06.490   reason: 'useSearchParams()',
04:53:06.490   digest: 'BAILOUT_TO_CLIENT_SIDE_RENDERING'
04:53:06.490 }
04:53:06.490 [AuthProvider] useSearchParams not available, using empty: Error: Bail out to client-side rendering: useSearchParams()
04:53:06.491     at a (.next/server/chunks/6821.js:1:17081)
04:53:06.491     at d (.next/server/chunks/6821.js:1:33677)
04:53:06.492     at <unknown> (.next/server/chunks/1653.js:247:80510)
04:53:06.492     at d (.next/server/chunks/1653.js:247:80473) {
04:53:06.493   reason: 'useSearchParams()',
04:53:06.493   digest: 'BAILOUT_TO_CLIENT_SIDE_RENDERING'
04:53:06.493 }
04:53:06.568    Generating static pages (42/84) 
04:53:06.709 [AuthProvider] useSearchParams not available, using empty: Error: Bail out to client-side rendering: useSearchParams()
04:53:06.709     at a (.next/server/chunks/6821.js:1:17081)
04:53:06.710     at d (.next/server/chunks/6821.js:1:33677)
04:53:06.710     at <unknown> (.next/server/chunks/1653.js:247:80510)
04:53:06.710     at d (.next/server/chunks/1653.js:247:80473) {
04:53:06.712   reason: 'useSearchParams()',
04:53:06.712   digest: 'BAILOUT_TO_CLIENT_SIDE_RENDERING'
04:53:06.713 }
04:53:06.713 [AuthProvider] useSearchParams not available, using empty: Error: Bail out to client-side rendering: useSearchParams()
04:53:06.713     at a (.next/server/chunks/6821.js:1:17081)
04:53:06.713     at d (.next/server/chunks/6821.js:1:33677)
04:53:06.713     at <unknown> (.next/server/chunks/1653.js:247:80510)
04:53:06.714     at d (.next/server/chunks/1653.js:247:80473) {
04:53:06.714   reason: 'useSearchParams()',
04:53:06.714   digest: 'BAILOUT_TO_CLIENT_SIDE_RENDERING'
04:53:06.714 }
04:53:06.715 [AuthProvider] useSearchParams not available, using empty: Error: Bail out to client-side rendering: useSearchParams()
04:53:06.715     at a (.next/server/chunks/6821.js:1:17081)
04:53:06.715     at d (.next/server/chunks/6821.js:1:33677)
04:53:06.715     at <unknown> (.next/server/chunks/1653.js:247:80510)
04:53:06.716     at d (.next/server/chunks/1653.js:247:80473) {
04:53:06.716   reason: 'useSearchParams()',
04:53:06.716   digest: 'BAILOUT_TO_CLIENT_SIDE_RENDERING'
04:53:06.716 }
04:53:06.716 [AuthProvider] useSearchParams not available, using empty: Error: Bail out to client-side rendering: useSearchParams()
04:53:06.717     at a (.next/server/chunks/6821.js:1:17081)
04:53:06.717     at d (.next/server/chunks/6821.js:1:33677)
04:53:06.717     at <unknown> (.next/server/chunks/1653.js:247:80510)
04:53:06.717     at d (.next/server/chunks/1653.js:247:80473) {
04:53:06.717   reason: 'useSearchParams()',
04:53:06.718   digest: 'BAILOUT_TO_CLIENT_SIDE_RENDERING'
04:53:06.718 }
04:53:06.718 [AuthProvider] useSearchParams not available, using empty: Error: Bail out to client-side rendering: useSearchParams()
04:53:06.718     at a (.next/server/chunks/6821.js:1:17081)
04:53:06.719     at d (.next/server/chunks/6821.js:1:33677)
04:53:06.719     at <unknown> (.next/server/chunks/1653.js:247:80510)
04:53:06.719     at d (.next/server/chunks/1653.js:247:80473) {
04:53:06.719   reason: 'useSearchParams()',
04:53:06.720   digest: 'BAILOUT_TO_CLIENT_SIDE_RENDERING'
04:53:06.720 }
04:53:06.720 [AuthProvider] useSearchParams not available, using empty: Error: Bail out to client-side rendering: useSearchParams()
04:53:06.720     at a (.next/server/chunks/6821.js:1:17081)
04:53:06.720     at d (.next/server/chunks/6821.js:1:33677)
04:53:06.721     at <unknown> (.next/server/chunks/1653.js:247:80510)
04:53:06.721     at d (.next/server/chunks/1653.js:247:80473) {
04:53:06.721   reason: 'useSearchParams()',
04:53:06.721   digest: 'BAILOUT_TO_CLIENT_SIDE_RENDERING'
04:53:06.721 }
04:53:06.935 [AuthProvider] useSearchParams not available, using empty: Error: Bail out to client-side rendering: useSearchParams()
04:53:06.935     at a (.next/server/chunks/6821.js:1:17081)
04:53:06.935     at d (.next/server/chunks/6821.js:1:33677)
04:53:06.935     at <unknown> (.next/server/chunks/1653.js:247:80510)
04:53:06.935     at d (.next/server/chunks/1653.js:247:80473) {
04:53:06.935   reason: 'useSearchParams()',
04:53:06.935   digest: 'BAILOUT_TO_CLIENT_SIDE_RENDERING'
04:53:06.935 }
04:53:06.935 [AuthProvider] useSearchParams not available, using empty: Error: Bail out to client-side rendering: useSearchParams()
04:53:06.935     at a (.next/server/chunks/6821.js:1:17081)
04:53:06.936     at d (.next/server/chunks/6821.js:1:33677)
04:53:06.936     at <unknown> (.next/server/chunks/1653.js:247:80510)
04:53:06.936     at d (.next/server/chunks/1653.js:247:80473) {
04:53:06.936   reason: 'useSearchParams()',
04:53:06.936   digest: 'BAILOUT_TO_CLIENT_SIDE_RENDERING'
04:53:06.936 }
04:53:06.936 [AuthProvider] useSearchParams not available, using empty: Error: Bail out to client-side rendering: useSearchParams()
04:53:06.937     at a (.next/server/chunks/6821.js:1:17081)
04:53:06.937     at d (.next/server/chunks/6821.js:1:33677)
04:53:06.937     at <unknown> (.next/server/chunks/1653.js:247:80510)
04:53:06.937     at d (.next/server/chunks/1653.js:247:80473) {
04:53:06.938   reason: 'useSearchParams()',
04:53:06.938   digest: 'BAILOUT_TO_CLIENT_SIDE_RENDERING'
04:53:06.938 }
04:53:06.938 [AuthProvider] useSearchParams not available, using empty: Error: Bail out to client-side rendering: useSearchParams()
04:53:06.939     at a (.next/server/chunks/6821.js:1:17081)
04:53:06.939     at d (.next/server/chunks/6821.js:1:33677)
04:53:06.939     at <unknown> (.next/server/chunks/1653.js:247:80510)
04:53:06.939     at d (.next/server/chunks/1653.js:247:80473) {
04:53:06.940   reason: 'useSearchParams()',
04:53:06.940   digest: 'BAILOUT_TO_CLIENT_SIDE_RENDERING'
04:53:06.940 }
04:53:06.940 [AuthProvider] useSearchParams not available, using empty: Error: Bail out to client-side rendering: useSearchParams()
04:53:06.941     at a (.next/server/chunks/6821.js:1:17081)
04:53:06.941     at d (.next/server/chunks/6821.js:1:33677)
04:53:06.941     at <unknown> (.next/server/chunks/1653.js:247:80510)
04:53:06.941     at d (.next/server/chunks/1653.js:247:80473) {
04:53:06.942   reason: 'useSearchParams()',
04:53:06.942   digest: 'BAILOUT_TO_CLIENT_SIDE_RENDERING'
04:53:06.942 }
04:53:06.942 [AuthProvider] useSearchParams not available, using empty: Error: Bail out to client-side rendering: useSearchParams()
04:53:06.943     at a (.next/server/chunks/6821.js:1:17081)
04:53:06.943     at d (.next/server/chunks/6821.js:1:33677)
04:53:06.943     at <unknown> (.next/server/chunks/1653.js:247:80510)
04:53:06.944     at d (.next/server/chunks/1653.js:247:80473) {
04:53:06.944   reason: 'useSearchParams()',
04:53:06.944   digest: 'BAILOUT_TO_CLIENT_SIDE_RENDERING'
04:53:06.944 }
04:53:06.945 [AuthProvider] useSearchParams not available, using empty: Error: Bail out to client-side rendering: useSearchParams()
04:53:06.945     at a (.next/server/chunks/6821.js:1:17081)
04:53:06.945     at d (.next/server/chunks/6821.js:1:33677)
04:53:06.945     at <unknown> (.next/server/chunks/1653.js:247:80510)
04:53:06.946     at d (.next/server/chunks/1653.js:247:80473) {
04:53:06.946   reason: 'useSearchParams()',
04:53:06.946   digest: 'BAILOUT_TO_CLIENT_SIDE_RENDERING'
04:53:06.947 }
04:53:07.214 [AuthProvider] useSearchParams not available, using empty: Error: Bail out to client-side rendering: useSearchParams()
04:53:07.218     at a (.next/server/chunks/6821.js:1:17081)
04:53:07.219     at d (.next/server/chunks/6821.js:1:33677)
04:53:07.219     at <unknown> (.next/server/chunks/1653.js:247:80510)
04:53:07.220     at d (.next/server/chunks/1653.js:247:80473) {
04:53:07.220   reason: 'useSearchParams()',
04:53:07.220   digest: 'BAILOUT_TO_CLIENT_SIDE_RENDERING'
04:53:07.220 }
04:53:07.221 [AuthProvider] useSearchParams not available, using empty: Error: Bail out to client-side rendering: useSearchParams()
04:53:07.221     at a (.next/server/chunks/6821.js:1:17081)
04:53:07.221     at d (.next/server/chunks/6821.js:1:33677)
04:53:07.222     at <unknown> (.next/server/chunks/1653.js:247:80510)
04:53:07.222     at d (.next/server/chunks/1653.js:247:80473) {
04:53:07.222   reason: 'useSearchParams()',
04:53:07.223   digest: 'BAILOUT_TO_CLIENT_SIDE_RENDERING'
04:53:07.223 }
04:53:07.223 [AuthProvider] useSearchParams not available, using empty: Error: Bail out to client-side rendering: useSearchParams()
04:53:07.223     at a (.next/server/chunks/6821.js:1:17081)
04:53:07.224     at d (.next/server/chunks/6821.js:1:33677)
04:53:07.224     at <unknown> (.next/server/chunks/1653.js:247:80510)
04:53:07.224     at d (.next/server/chunks/1653.js:247:80473) {
04:53:07.224   reason: 'useSearchParams()',
04:53:07.225   digest: 'BAILOUT_TO_CLIENT_SIDE_RENDERING'
04:53:07.225 }
04:53:07.225 [AuthProvider] useSearchParams not available, using empty: Error: Bail out to client-side rendering: useSearchParams()
04:53:07.225     at a (.next/server/chunks/6821.js:1:17081)
04:53:07.226     at d (.next/server/chunks/6821.js:1:33677)
04:53:07.226     at <unknown> (.next/server/chunks/1653.js:247:80510)
04:53:07.226     at d (.next/server/chunks/1653.js:247:80473) {
04:53:07.226   reason: 'useSearchParams()',
04:53:07.227   digest: 'BAILOUT_TO_CLIENT_SIDE_RENDERING'
04:53:07.227 }
04:53:07.227 [AuthProvider] useSearchParams not available, using empty: Error: Bail out to client-side rendering: useSearchParams()
04:53:07.228     at a (.next/server/chunks/6821.js:1:17081)
04:53:07.228     at d (.next/server/chunks/6821.js:1:33677)
04:53:07.228     at <unknown> (.next/server/chunks/1653.js:247:80510)
04:53:07.228     at d (.next/server/chunks/1653.js:247:80473) {
04:53:07.229   reason: 'useSearchParams()',
04:53:07.229   digest: 'BAILOUT_TO_CLIENT_SIDE_RENDERING'
04:53:07.229 }
04:53:07.229 [AuthProvider] useSearchParams not available, using empty: Error: Bail out to client-side rendering: useSearchParams()
04:53:07.230     at a (.next/server/chunks/6821.js:1:17081)
04:53:07.230     at d (.next/server/chunks/6821.js:1:33677)
04:53:07.230     at <unknown> (.next/server/chunks/1653.js:247:80510)
04:53:07.230     at d (.next/server/chunks/1653.js:247:80473) {
04:53:07.231   reason: 'useSearchParams()',
04:53:07.231   digest: 'BAILOUT_TO_CLIENT_SIDE_RENDERING'
04:53:07.231 }
04:53:07.231 [AuthProvider] useSearchParams not available, using empty: Error: Bail out to client-side rendering: useSearchParams()
04:53:07.232     at a (.next/server/chunks/6821.js:1:17081)
04:53:07.232     at d (.next/server/chunks/6821.js:1:33677)
04:53:07.232     at <unknown> (.next/server/chunks/1653.js:247:80510)
04:53:07.232     at d (.next/server/chunks/1653.js:247:80473) {
04:53:07.233   reason: 'useSearchParams()',
04:53:07.233   digest: 'BAILOUT_TO_CLIENT_SIDE_RENDERING'
04:53:07.233 }
04:53:07.233 [AuthProvider] useSearchParams not available, using empty: Error: Bail out to client-side rendering: useSearchParams()
04:53:07.234     at a (.next/server/chunks/6821.js:1:17081)
04:53:07.234     at d (.next/server/chunks/6821.js:1:33677)
04:53:07.234     at <unknown> (.next/server/chunks/1653.js:247:80510)
04:53:07.240     at d (.next/server/chunks/1653.js:247:80473) {
04:53:07.240   reason: 'useSearchParams()',
04:53:07.240   digest: 'BAILOUT_TO_CLIENT_SIDE_RENDERING'
04:53:07.241 }
04:53:07.243    Generating static pages (63/84) 
04:53:07.530 [RBAC] getRBACContext() called
04:53:07.536 [RBAC] No runtime context (missing env vars), returning null context
04:53:07.536 [requireAuth] No RBAC context found, throwing AuthRequiredError
04:53:07.536 [AuthProvider] useSearchParams not available, using empty: Error: Bail out to client-side rendering: useSearchParams()
04:53:07.536     at a (.next/server/chunks/6821.js:1:17081)
04:53:07.536     at d (.next/server/chunks/6821.js:1:33677)
04:53:07.536     at <unknown> (.next/server/chunks/1653.js:247:80510)
04:53:07.536     at d (.next/server/chunks/1653.js:247:80473) {
04:53:07.536   reason: 'useSearchParams()',
04:53:07.536   digest: 'BAILOUT_TO_CLIENT_SIDE_RENDERING'
04:53:07.536 }
04:53:07.536 [AuthProvider] useSearchParams not available, using empty: Error: Bail out to client-side rendering: useSearchParams()
04:53:07.536     at a (.next/server/chunks/6821.js:1:17081)
04:53:07.538     at d (.next/server/chunks/6821.js:1:33677)
04:53:07.538     at <unknown> (.next/server/chunks/1653.js:247:80510)
04:53:07.538     at d (.next/server/chunks/1653.js:247:80473) {
04:53:07.539   reason: 'useSearchParams()',
04:53:07.539   digest: 'BAILOUT_TO_CLIENT_SIDE_RENDERING'
04:53:07.539 }
04:53:07.540 [AuthProvider] useSearchParams not available, using empty: Error: Bail out to client-side rendering: useSearchParams()
04:53:07.540     at a (.next/server/chunks/6821.js:1:17081)
04:53:07.540     at d (.next/server/chunks/6821.js:1:33677)
04:53:07.540     at <unknown> (.next/server/chunks/1653.js:247:80510)
04:53:07.540     at d (.next/server/chunks/1653.js:247:80473) {
04:53:07.541   reason: 'useSearchParams()',
04:53:07.541   digest: 'BAILOUT_TO_CLIENT_SIDE_RENDERING'
04:53:07.541 }
04:53:07.541 [AuthProvider] useSearchParams not available, using empty: Error: Bail out to client-side rendering: useSearchParams()
04:53:07.541     at a (.next/server/chunks/6821.js:1:17081)
04:53:07.541     at d (.next/server/chunks/6821.js:1:33677)
04:53:07.542     at <unknown> (.next/server/chunks/1653.js:247:80510)
04:53:07.542     at d (.next/server/chunks/1653.js:247:80473) {
04:53:07.542   reason: 'useSearchParams()',
04:53:07.542   digest: 'BAILOUT_TO_CLIENT_SIDE_RENDERING'
04:53:07.542 }
04:53:07.542 [AuthProvider] useSearchParams not available, using empty: Error: Bail out to client-side rendering: useSearchParams()
04:53:07.542     at a (.next/server/chunks/6821.js:1:17081)
04:53:07.542     at d (.next/server/chunks/6821.js:1:33677)
04:53:07.542     at <unknown> (.next/server/chunks/1653.js:247:80510)
04:53:07.542     at d (.next/server/chunks/1653.js:247:80473) {
04:53:07.542   reason: 'useSearchParams()',
04:53:07.543   digest: 'BAILOUT_TO_CLIENT_SIDE_RENDERING'
04:53:07.543 }
04:53:07.543 [AuthProvider] useSearchParams not available, using empty: Error: Bail out to client-side rendering: useSearchParams()
04:53:07.543     at a (.next/server/chunks/6821.js:1:17081)
04:53:07.543     at d (.next/server/chunks/6821.js:1:33677)
04:53:07.543     at <unknown> (.next/server/chunks/1653.js:247:80510)
04:53:07.543     at d (.next/server/chunks/1653.js:247:80473) {
04:53:07.543   reason: 'useSearchParams()',
04:53:07.543   digest: 'BAILOUT_TO_CLIENT_SIDE_RENDERING'
04:53:07.543 }
04:53:07.543 [AuthProvider] useSearchParams not available, using empty: Error: Bail out to client-side rendering: useSearchParams()
04:53:07.543     at a (.next/server/chunks/6821.js:1:17081)
04:53:07.543     at d (.next/server/chunks/6821.js:1:33677)
04:53:07.543     at <unknown> (.next/server/chunks/1653.js:247:80510)
04:53:07.543     at d (.next/server/chunks/1653.js:247:80473) {
04:53:07.543   reason: 'useSearchParams()',
04:53:07.543   digest: 'BAILOUT_TO_CLIENT_SIDE_RENDERING'
04:53:07.543 }
04:53:07.543 [AuthProvider] useSearchParams not available, using empty: Error: Bail out to client-side rendering: useSearchParams()
04:53:07.543     at a (.next/server/chunks/6821.js:1:17081)
04:53:07.543     at d (.next/server/chunks/6821.js:1:33677)
04:53:07.543     at <unknown> (.next/server/chunks/1653.js:247:80510)
04:53:07.543     at d (.next/server/chunks/1653.js:247:80473) {
04:53:07.543   reason: 'useSearchParams()',
04:53:07.543   digest: 'BAILOUT_TO_CLIENT_SIDE_RENDERING'
04:53:07.543 }
04:53:07.543 [AuthProvider] useSearchParams not available, using empty: Error: Bail out to client-side rendering: useSearchParams()
04:53:07.543     at a (.next/server/chunks/6821.js:1:17081)
04:53:07.544     at d (.next/server/chunks/6821.js:1:33677)
04:53:07.544     at <unknown> (.next/server/chunks/1653.js:247:80510)
04:53:07.544     at d (.next/server/chunks/1653.js:247:80473) {
04:53:07.544   reason: 'useSearchParams()',
04:53:07.544   digest: 'BAILOUT_TO_CLIENT_SIDE_RENDERING'
04:53:07.544 }
04:53:07.758  ✓ Generating static pages (84/84)
04:53:07.759 [AuthProvider] useSearchParams not available, using empty: Error: Bail out to client-side rendering: useSearchParams()
04:53:07.759     at a (.next/server/chunks/6821.js:1:17081)
04:53:07.759     at d (.next/server/chunks/6821.js:1:33677)
04:53:07.760     at <unknown> (.next/server/chunks/1653.js:247:80510)
04:53:07.760     at d (.next/server/chunks/1653.js:247:80473) {
04:53:07.760   reason: 'useSearchParams()',
04:53:07.761   digest: 'BAILOUT_TO_CLIENT_SIDE_RENDERING'
04:53:07.761 }
04:53:07.761 [AuthProvider] useSearchParams not available, using empty: Error: Bail out to client-side rendering: useSearchParams()
04:53:07.762     at a (.next/server/chunks/6821.js:1:17081)
04:53:07.762     at d (.next/server/chunks/6821.js:1:33677)
04:53:07.762     at <unknown> (.next/server/chunks/1653.js:247:80510)
04:53:07.762     at d (.next/server/chunks/1653.js:247:80473) {
04:53:07.762   reason: 'useSearchParams()',
04:53:07.763   digest: 'BAILOUT_TO_CLIENT_SIDE_RENDERING'
04:53:07.763 }
04:53:07.763 [AuthProvider] useSearchParams not available, using empty: Error: Bail out to client-side rendering: useSearchParams()
04:53:07.763     at a (.next/server/chunks/6821.js:1:17081)
04:53:07.763     at d (.next/server/chunks/6821.js:1:33677)
04:53:07.763     at <unknown> (.next/server/chunks/1653.js:247:80510)
04:53:07.763     at d (.next/server/chunks/1653.js:247:80473) {
04:53:07.763   reason: 'useSearchParams()',
04:53:07.763   digest: 'BAILOUT_TO_CLIENT_SIDE_RENDERING'
04:53:07.764 }
04:53:07.764 [AuthProvider] useSearchParams not available, using empty: Error: Bail out to client-side rendering: useSearchParams()
04:53:07.764     at a (.next/server/chunks/6821.js:1:17081)
04:53:07.764     at d (.next/server/chunks/6821.js:1:33677)
04:53:07.764     at <unknown> (.next/server/chunks/1653.js:247:80510)
04:53:07.764     at d (.next/server/chunks/1653.js:247:80473) {
04:53:07.764   reason: 'useSearchParams()',
04:53:07.764   digest: 'BAILOUT_TO_CLIENT_SIDE_RENDERING'
04:53:07.764 }
04:53:09.829    Finalizing page optimization ...
04:53:09.834    Collecting build traces ...
04:53:30.239 
04:53:30.260 Route (app)                                              Size     First Load JS
04:53:30.260 ┌ ○ /                                                    48.1 kB         264 kB
04:53:30.260 ├ ○ /_not-found                                          722 B           107 kB
04:53:30.261 ├ ƒ /about                                               203 B           110 kB
04:53:30.261 ├ ƒ /admin/approvals                                     5.13 kB         189 kB
04:53:30.261 ├ ○ /admin/contracts                                     6.18 kB         195 kB
04:53:30.262 ├ ƒ /admin/contracts/[id]                                7.38 kB         122 kB
04:53:30.262 ├ ○ /admin/coupons                                       4.47 kB         111 kB
04:53:30.262 ├ ƒ /admin/customers                                     2.24 kB         130 kB
04:53:30.262 ├ ƒ /admin/customers/documents                           203 B           110 kB
04:53:30.262 ├ ○ /admin/customers/management                          22.6 kB         184 kB
04:53:30.262 ├ ƒ /admin/customers/orders                              2.24 kB         130 kB
04:53:30.262 ├ ƒ /admin/customers/orders/[id]                         210 B           128 kB
04:53:30.263 ├ ƒ /admin/customers/profile                             351 B           106 kB
04:53:30.263 ├ ƒ /admin/customers/support                             203 B           110 kB
04:53:30.263 ├ ƒ /admin/dashboard                                     118 kB          360 kB
04:53:30.263 ├ ○ /admin/notifications                                 4.66 kB         111 kB
04:53:30.263 ├ ƒ /admin/orders                                        8.67 kB         183 kB
04:53:30.263 ├ ƒ /admin/orders/[id]                                   20.8 kB         331 kB
04:53:30.264 ├ ƒ /admin/orders/[id]/correction-upload                 7.91 kB         122 kB
04:53:30.264 ├ ƒ /admin/orders/[id]/payment-confirmation              8.96 kB         172 kB
04:53:30.264 ├ ƒ /admin/production/[id]                               5.6 kB          190 kB
04:53:30.264 ├ ƒ /admin/quotations                                    9.65 kB         252 kB
04:53:30.264 ├ ○ /admin/settings                                      9.43 kB         162 kB
04:53:30.264 ├ ○ /admin/settings/customers                            2.81 kB         109 kB
04:53:30.264 ├ ○ /admin/shipments                                     14.5 kB         132 kB
04:53:30.264 ├ ƒ /admin/shipments/[id]                                6.06 kB         170 kB
04:53:30.264 ├ ○ /admin/shipping                                      5.03 kB         244 kB
04:53:30.265 ├ ƒ /api/admin/approve-member                            722 B           107 kB
04:53:30.265 ├ ƒ /api/admin/contracts/[contractId]/download           722 B           107 kB
04:53:30.265 ├ ƒ /api/admin/contracts/[contractId]/send-signature     722 B           107 kB
04:53:30.265 ├ ƒ /api/admin/contracts/request-signature               722 B           107 kB
04:53:30.265 ├ ƒ /api/admin/contracts/send-reminder                   722 B           107 kB
04:53:30.265 ├ ƒ /api/admin/contracts/workflow                        722 B           107 kB
04:53:30.265 ├ ƒ /api/admin/convert-to-order                          722 B           107 kB
04:53:30.265 ├ ƒ /api/admin/coupons                                   722 B           107 kB
04:53:30.265 ├ ƒ /api/admin/coupons/%5Bid%5D                          722 B           107 kB
04:53:30.265 ├ ƒ /api/admin/customers/[id]                            722 B           107 kB
04:53:30.265 ├ ƒ /api/admin/customers/[id]/contact-history            722 B           107 kB
04:53:30.265 ├ ƒ /api/admin/customers/management                      722 B           107 kB
04:53:30.265 ├ ƒ /api/admin/customers/management/export               722 B           107 kB
04:53:30.265 ├ ƒ /api/admin/dashboard/statistics                      722 B           107 kB
04:53:30.265 ├ ƒ /api/admin/dashboard/unified-stats                   722 B           107 kB
04:53:30.266 ├ ƒ /api/admin/delivery/tracking/[orderId]               722 B           107 kB
04:53:30.266 ├ ƒ /api/admin/email/send                                722 B           107 kB
04:53:30.266 ├ ƒ /api/admin/generate-work-order                       722 B           107 kB
04:53:30.266 ├ ƒ /api/admin/inventory/adjust                          722 B           107 kB
04:53:30.266 ├ ƒ /api/admin/inventory/history/[productId]             722 B           107 kB
04:53:30.266 ├ ƒ /api/admin/inventory/items                           722 B           107 kB
04:53:30.266 ├ ƒ /api/admin/inventory/receipts                        722 B           107 kB
04:53:30.266 ├ ƒ /api/admin/inventory/record-entry                    722 B           107 kB
04:53:30.266 ├ ƒ /api/admin/inventory/update                          722 B           107 kB
04:53:30.266 ├ ƒ /api/admin/notifications                             722 B           107 kB
04:53:30.266 ├ ƒ /api/admin/notifications/[id]                        722 B           107 kB
04:53:30.266 ├ ƒ /api/admin/notifications/[id]/read                   722 B           107 kB
04:53:30.266 ├ ƒ /api/admin/notifications/create                      722 B           107 kB
04:53:30.266 ├ ƒ /api/admin/notifications/unread-count                722 B           107 kB
04:53:30.266 ├ ƒ /api/admin/orders                                    722 B           107 kB
04:53:30.266 ├ ƒ /api/admin/orders/[id]/apply-discount                722 B           107 kB
04:53:30.266 ├ ƒ /api/admin/orders/[id]/billing-address               722 B           107 kB
04:53:30.266 ├ ƒ /api/admin/orders/[id]/cancellation                  722 B           107 kB
04:53:30.267 ├ ƒ /api/admin/orders/[id]/comments                      722 B           107 kB
04:53:30.267 ├ ƒ /api/admin/orders/[id]/correction                    722 B           107 kB
04:53:30.269 ├ ƒ /api/admin/orders/[id]/correction/[revisionId]       722 B           107 kB
04:53:30.269 ├ ƒ /api/admin/orders/[id]/data-receipt                  722 B           107 kB
04:53:30.269 ├ ƒ /api/admin/orders/[id]/delivery-address              722 B           107 kB
04:53:30.272 ├ ƒ /api/admin/orders/[id]/delivery-note                 722 B           107 kB
04:53:30.272 ├ ƒ /api/admin/orders/[id]/files/[fileId]/download       722 B           107 kB
04:53:30.272 ├ ƒ /api/admin/orders/[id]/items                         722 B           107 kB
04:53:30.272 ├ ƒ /api/admin/orders/[id]/korea-send-status             722 B           107 kB
04:53:30.272 ├ ƒ /api/admin/orders/[id]/notes                         722 B           107 kB
04:53:30.273 ├ ƒ /api/admin/orders/[id]/payment-confirmation          722 B           107 kB
04:53:30.273 ├ ƒ /api/admin/orders/[id]/send-to-korea                 722 B           107 kB
04:53:30.273 ├ ƒ /api/admin/orders/[id]/shipping-info                 722 B           107 kB
04:53:30.273 ├ ƒ /api/admin/orders/[id]/specification-change          722 B           107 kB
04:53:30.273 ├ ƒ /api/admin/orders/[id]/start-production              722 B           107 kB
04:53:30.274 ├ ƒ /api/admin/orders/[id]/status                        722 B           107 kB
04:53:30.274 ├ ƒ /api/admin/orders/[id]/status-history                722 B           107 kB
04:53:30.274 ├ ƒ /api/admin/orders/bulk-status                        722 B           107 kB
04:53:30.274 ├ ƒ /api/admin/orders/statistics                         722 B           107 kB
04:53:30.274 ├ ƒ /api/admin/performance/metrics                       722 B           107 kB
04:53:30.276 ├ ƒ /api/admin/production-jobs/[id]                      722 B           107 kB
04:53:30.276 ├ ƒ /api/admin/production/[orderId]                      722 B           107 kB
04:53:30.276 ├ ƒ /api/admin/production/jobs                           722 B           107 kB
04:53:30.277 ├ ƒ /api/admin/production/jobs/[id]                      722 B           107 kB
04:53:30.277 ├ ƒ /api/admin/production/update-status                  722 B           107 kB
04:53:30.277 ├ ƒ /api/admin/quotations                                722 B           107 kB
04:53:30.277 ├ ƒ /api/admin/quotations/[id]                           722 B           107 kB
04:53:30.277 ├ ƒ /api/admin/quotations/[id]/cost-breakdown            722 B           107 kB
04:53:30.278 ├ ƒ /api/admin/quotations/[id]/export                    722 B           107 kB
04:53:30.278 ├ ƒ /api/admin/settings                                  722 B           107 kB
04:53:30.278 ├ ƒ /api/admin/settings/%5Bkey%5D                        722 B           107 kB
04:53:30.278 ├ ƒ /api/admin/settings/cache/invalidate                 722 B           107 kB
04:53:30.278 ├ ƒ /api/admin/settings/customer-markup                  722 B           107 kB
04:53:30.279 ├ ƒ /api/admin/settings/customer-markup/%5Bid%5D         722 B           107 kB
04:53:30.279 ├ ƒ /api/admin/settings/designer-emails                  722 B           107 kB
04:53:30.279 ├ ƒ /api/admin/shipments/[id]/tracking                   722 B           107 kB
04:53:30.279 ├ ƒ /api/admin/shipping/deliveries/complete              722 B           107 kB
04:53:30.279 ├ ƒ /api/admin/shipping/shipments                        722 B           107 kB
04:53:30.280 ├ ƒ /api/admin/shipping/tracking                         722 B           107 kB
04:53:30.280 ├ ƒ /api/admin/shipping/tracking/[id]                    722 B           107 kB
04:53:30.280 ├ ƒ /api/admin/test-email                                722 B           107 kB
04:53:30.280 ├ ƒ /api/admin/users                                     722 B           107 kB
04:53:30.280 ├ ƒ /api/admin/users/[id]/addresses                      722 B           107 kB
04:53:30.280 ├ ƒ /api/admin/users/[id]/approve                        722 B           107 kB
04:53:30.281 ├ ƒ /api/admin/users/approve                             722 B           107 kB
04:53:30.281 ├ ƒ /api/admin/users/pending                             722 B           107 kB
04:53:30.281 ├ ƒ /api/admin/users/reject                              722 B           107 kB
04:53:30.281 ├ ƒ /api/ai-parser/approve                               722 B           107 kB
04:53:30.281 ├ ƒ /api/ai-parser/extract                               722 B           107 kB
04:53:30.281 ├ ƒ /api/ai-parser/reprocess                             722 B           107 kB
04:53:30.281 ├ ƒ /api/ai-parser/upload                                722 B           107 kB
04:53:30.281 ├ ƒ /api/ai-parser/validate                              722 B           107 kB
04:53:30.281 ├ ƒ /api/ai/parse                                        722 B           107 kB
04:53:30.282 ├ ƒ /api/ai/review                                       722 B           107 kB
04:53:30.282 ├ ƒ /api/ai/specs                                        722 B           107 kB
04:53:30.282 ├ ƒ /api/analytics/vitals                                722 B           107 kB
04:53:30.282 ├ ƒ /api/auth/current-user                               722 B           107 kB
04:53:30.282 ├ ƒ /api/auth/forgot-password                            722 B           107 kB
04:53:30.282 ├ ƒ /api/auth/register                                   722 B           107 kB
04:53:30.282 ├ ƒ /api/auth/register/create-profile                    722 B           107 kB
04:53:30.282 ├ ƒ /api/auth/reset-password                             722 B           107 kB
04:53:30.282 ├ ƒ /api/auth/session                                    722 B           107 kB
04:53:30.283 ├ ƒ /api/auth/signin                                     722 B           107 kB
04:53:30.283 ├ ƒ /api/auth/signout                                    722 B           107 kB
04:53:30.283 ├ ƒ /api/auth/verify-email                               722 B           107 kB
04:53:30.283 ├ ƒ /api/b2b/ai-extraction/upload                        722 B           107 kB
04:53:30.283 ├ ƒ /api/b2b/files/upload                                722 B           107 kB
04:53:30.283 ├ ƒ /api/comparison/save                                 722 B           107 kB
04:53:30.283 ├ ƒ /api/contact                                         722 B           107 kB
04:53:30.283 ├ ƒ /api/contract/pdf                                    722 B           107 kB
04:53:30.283 ├ ƒ /api/contract/timestamp                              722 B           107 kB
04:53:30.283 ├ ƒ /api/contract/timestamp/validate                     722 B           107 kB
04:53:30.284 ├ ƒ /api/contract/workflow/action                        722 B           107 kB
04:53:30.284 ├ ƒ /api/contracts                                       722 B           107 kB
04:53:30.284 ├ ƒ /api/coupons/validate                                722 B           107 kB
04:53:30.284 ├ ƒ /api/cron/archive-orders                             722 B           107 kB
04:53:30.284 ├ ƒ /api/debug/auth                                      722 B           107 kB
04:53:30.284 ├ ƒ /api/dev/apply-migration                             722 B           107 kB
04:53:30.284 ├ ƒ /api/dev/set-admin                                   722 B           107 kB
04:53:30.284 ├ ● /api/download/templates/[category]                   722 B           107 kB
04:53:30.284 ├   ├ /api/download/templates/flat_3_side
04:53:30.285 ├   ├ /api/download/templates/stand_up
04:53:30.285 ├   ├ /api/download/templates/box
04:53:30.285 ├   └ [+4 more paths]
04:53:30.285 ├ ƒ /api/download/templates/excel                        722 B           107 kB
04:53:30.285 ├ ƒ /api/download/templates/pdf                          722 B           107 kB
04:53:30.285 ├ ƒ /api/errors/log                                      722 B           107 kB
04:53:30.285 ├ ƒ /api/files/validate                                  722 B           107 kB
04:53:30.285 ├ ƒ /api/member/addresses/billing                        722 B           107 kB
04:53:30.285 ├ ƒ /api/member/addresses/billing/[id]                   722 B           107 kB
04:53:30.286 ├ ƒ /api/member/addresses/delivery                       722 B           107 kB
04:53:30.286 ├ ƒ /api/member/addresses/delivery/[id]                  722 B           107 kB
04:53:30.286 ├ ƒ /api/member/ai-extraction/approve                    722 B           107 kB
04:53:30.286 ├ ƒ /api/member/ai-extraction/status                     722 B           107 kB
04:53:30.286 ├ ƒ /api/member/ai-extraction/upload                     722 B           107 kB
04:53:30.286 ├ ƒ /api/member/auth/resend-verification                 722 B           107 kB
04:53:30.286 ├ ƒ /api/member/auth/verify-email                        722 B           107 kB
04:53:30.286 ├ ƒ /api/member/certificates/generate                    722 B           107 kB
04:53:30.286 ├ ƒ /api/member/dashboard                                722 B           107 kB
04:53:30.287 ├ ƒ /api/member/dashboard/stats                          722 B           107 kB
04:53:30.287 ├ ƒ /api/member/dashboard/unified-stats                  722 B           107 kB
04:53:30.287 ├ ƒ /api/member/delete-account                           722 B           107 kB
04:53:30.287 ├ ƒ /api/member/documents                                722 B           107 kB
04:53:30.287 ├ ƒ /api/member/documents/[id]/download                  722 B           107 kB
04:53:30.287 ├ ƒ /api/member/documents/history                        722 B           107 kB
04:53:30.287 ├ ƒ /api/member/files/[id]/extract                       722 B           107 kB
04:53:30.287 ├ ƒ /api/member/files/upload                             722 B           107 kB
04:53:30.287 ├ ƒ /api/member/hanko/upload                             722 B           107 kB
04:53:30.288 ├ ƒ /api/member/inquiries                                722 B           107 kB
04:53:30.288 ├ ƒ /api/member/invites/accept                           722 B           107 kB
04:53:30.288 ├ ƒ /api/member/invites/send                             722 B           107 kB
04:53:30.288 ├ ƒ /api/member/invoices                                 722 B           107 kB
04:53:30.288 ├ ƒ /api/member/invoices/[invoiceId]/download            722 B           107 kB
04:53:30.288 ├ ƒ /api/member/korea/corrections                        722 B           107 kB
04:53:30.288 ├ ƒ /api/member/korea/corrections/[id]/upload            722 B           107 kB
04:53:30.288 ├ ƒ /api/member/korea/send-data                          722 B           107 kB
04:53:30.288 ├ ƒ /api/member/notifications                            722 B           107 kB
04:53:30.289 ├ ƒ /api/member/notifications/[id]                       722 B           107 kB
04:53:30.289 ├ ƒ /api/member/notifications/[id]/read                  722 B           107 kB
04:53:30.289 ├ ƒ /api/member/notifications/delete-all                 722 B           107 kB
04:53:30.289 ├ ƒ /api/member/notifications/mark-all-read              722 B           107 kB
04:53:30.289 ├ ƒ /api/member/orders                                   722 B           107 kB
04:53:30.289 ├ ƒ /api/member/orders/[id]                              722 B           107 kB
04:53:30.289 ├ ƒ /api/member/orders/[id]/apply-coupon                 722 B           107 kB
04:53:30.289 ├ ƒ /api/member/orders/[id]/approvals                    722 B           107 kB
04:53:30.289 ├ ƒ /api/member/orders/[id]/approvals/[requestId]        722 B           107 kB
04:53:30.290 ├ ƒ /api/member/orders/[id]/approve-modification         722 B           107 kB
04:53:30.290 ├ ƒ /api/member/orders/[id]/billing-address              722 B           107 kB
04:53:30.290 ├ ƒ /api/member/orders/[id]/comments                     722 B           107 kB
04:53:30.290 ├ ƒ /api/member/orders/[id]/comments/[commentId]         722 B           107 kB
04:53:30.290 ├ ƒ /api/member/orders/[id]/data-receipt                 722 B           107 kB
04:53:30.290 ├ ƒ /api/member/orders/[id]/data-receipt/files/[fileId]  722 B           107 kB
04:53:30.290 ├ ƒ /api/member/orders/[id]/delivery-address             722 B           107 kB
04:53:30.290 ├ ƒ /api/member/orders/[id]/design-revisions             722 B           107 kB
04:53:30.290 ├ ƒ /api/member/orders/[id]/production-data              722 B           107 kB
04:53:30.290 ├ ƒ /api/member/orders/[id]/production-logs              722 B           107 kB
04:53:30.291 ├ ƒ /api/member/orders/[id]/request-cancellation         722 B           107 kB
04:53:30.291 ├ ƒ /api/member/orders/[id]/spec-approval                722 B           107 kB
04:53:30.291 ├ ƒ /api/member/orders/[id]/specification-change         722 B           107 kB
04:53:30.291 ├ ƒ /api/member/orders/[id]/status-history               722 B           107 kB
04:53:30.291 ├ ƒ /api/member/orders/[id]/tracking                     722 B           107 kB
04:53:30.291 ├ ƒ /api/member/orders/confirm                           722 B           107 kB
04:53:30.291 ├ ƒ /api/member/quotations                               722 B           107 kB
04:53:30.291 ├ ƒ /api/member/quotations/[id]                          722 B           107 kB
04:53:30.291 ├ ƒ /api/member/quotations/[id]/approve                  722 B           107 kB
04:53:30.292 ├ ƒ /api/member/quotations/[id]/confirm-payment          722 B           107 kB
04:53:30.292 ├ ƒ /api/member/quotations/[id]/convert                  722 B           107 kB
04:53:30.293 ├ ƒ /api/member/quotations/[id]/export                   722 B           107 kB
04:53:30.293 ├ ƒ /api/member/quotations/[id]/invoice                  722 B           107 kB
04:53:30.294 ├ ƒ /api/member/quotations/[id]/save-pdf                 722 B           107 kB
04:53:30.294 ├ ƒ /api/member/samples                                  722 B           107 kB
04:53:30.294 ├ ƒ /api/member/settings                                 722 B           107 kB
04:53:30.294 ├ ƒ /api/member/shipments                                722 B           107 kB
04:53:30.294 ├ ƒ /api/member/spec-sheets/[id]/approve                 722 B           107 kB
04:53:30.295 ├ ƒ /api/member/spec-sheets/[id]/reject                  722 B           107 kB
04:53:30.301 ├ ƒ /api/member/spec-sheets/generate                     722 B           107 kB
04:53:30.301 ├ ƒ /api/member/status                                   722 B           107 kB
04:53:30.301 ├ ƒ /api/member/stock-in                                 722 B           107 kB
04:53:30.301 ├ ƒ /api/member/work-orders                              722 B           107 kB
04:53:30.301 ├ ƒ /api/notes                                           722 B           107 kB
04:53:30.301 ├ ƒ /api/notes/[id]                                      722 B           107 kB
04:53:30.301 ├ ƒ /api/notifications                                   722 B           107 kB
04:53:30.301 ├ ƒ /api/notifications/[id]                              722 B           107 kB
04:53:30.301 ├ ƒ /api/notifications/[id]/read                         722 B           107 kB
04:53:30.301 ├ ƒ /api/notifications/mark-all-read                     722 B           107 kB
04:53:30.301 ├ ƒ /api/notifications/unread-count                      722 B           107 kB
04:53:30.301 ├ ƒ /api/orders                                          722 B           107 kB
04:53:30.301 ├ ƒ /api/orders/[id]                                     722 B           107 kB
04:53:30.301 ├ ƒ /api/orders/[id]/cancel                              722 B           107 kB
04:53:30.301 ├ ƒ /api/orders/[id]/status                              722 B           107 kB
04:53:30.301 ├ ƒ /api/orders/cancel                                   722 B           107 kB
04:53:30.301 ├ ƒ /api/orders/create                                   722 B           107 kB
04:53:30.301 ├ ƒ /api/orders/receive                                  722 B           107 kB
04:53:30.301 ├ ƒ /api/orders/reorder                                  722 B           107 kB
04:53:30.301 ├ ƒ /api/orders/update                                   722 B           107 kB
04:53:30.301 ├ ƒ /api/payments/confirm                                722 B           107 kB
04:53:30.301 ├ ƒ /api/premium-content/download                        722 B           107 kB
04:53:30.301 ├ ƒ /api/products                                        722 B           107 kB
04:53:30.301 ├ ƒ /api/products/categories                             722 B           107 kB
04:53:30.301 ├ ƒ /api/products/filter                                 722 B           107 kB
04:53:30.301 ├ ƒ /api/products/search                                 722 B           107 kB
04:53:30.301 ├ ƒ /api/profile                                         722 B           107 kB
04:53:30.301 ├ ƒ /api/profile/[id]                                    722 B           107 kB
04:53:30.301 ├ ƒ /api/quotation                                       722 B           107 kB
04:53:30.301 ├ ƒ /api/quotation/pdf                                   722 B           107 kB
04:53:30.301 ├ ƒ /api/quotations/guest-save                           722 B           107 kB
04:53:30.301 ├ ƒ /api/quotations/save                                 722 B           107 kB
04:53:30.302 ├ ƒ /api/quotes/excel                                    722 B           107 kB
04:53:30.302 ├ ƒ /api/quotes/pdf                                      722 B           107 kB
04:53:30.302 ├ ƒ /api/quotitions/[id]/confirm-transfer                722 B           107 kB
04:53:30.302 ├ ƒ /api/registry/corporate-number                       722 B           107 kB
04:53:30.302 ├ ƒ /api/registry/postal-code                            722 B           107 kB
04:53:30.302 ├ ƒ /api/revalidate                                      722 B           107 kB
04:53:30.302 ├ ƒ /api/samples                                         722 B           107 kB
04:53:30.302 ├ ƒ /api/samples/request                                 722 B           107 kB
04:53:30.302 ├ ƒ /api/settings                                        722 B           107 kB
04:53:30.302 ├ ƒ /api/shipments                                       722 B           107 kB
04:53:30.302 ├ ƒ /api/shipments/[id]                                  722 B           107 kB
04:53:30.302 ├ ƒ /api/shipments/[id]/[trackingId]/update-tracking     722 B           107 kB
04:53:30.302 ├ ƒ /api/shipments/[id]/label                            722 B           107 kB
04:53:30.302 ├ ƒ /api/shipments/[id]/schedule-pickup                  722 B           107 kB
04:53:30.302 ├ ƒ /api/shipments/[id]/track                            722 B           107 kB
04:53:30.302 ├ ƒ /api/shipments/bulk-create                           722 B           107 kB
04:53:30.302 ├ ƒ /api/shipments/create                                722 B           107 kB
04:53:30.302 ├ ƒ /api/shipments/tracking                              722 B           107 kB
04:53:30.302 ├ ƒ /api/signature/cancel                                722 B           107 kB
04:53:30.302 ├ ƒ /api/signature/local/save                            722 B           107 kB
04:53:30.302 ├ ƒ /api/signature/send                                  722 B           107 kB
04:53:30.302 ├ ƒ /api/signature/status/[id]                           722 B           107 kB
04:53:30.302 ├ ƒ /api/signature/webhook                               722 B           107 kB
04:53:30.302 ├ ƒ /api/specsheet/approval                              722 B           107 kB
04:53:30.302 ├ ƒ /api/specsheet/pdf                                   722 B           107 kB
04:53:30.302 ├ ƒ /api/specsheet/versions                              722 B           107 kB
04:53:30.302 ├ ƒ /api/supabase-mcp/execute                            722 B           107 kB
04:53:30.302 ├ ƒ /api/templates                                       722 B           107 kB
04:53:30.302 ├ ƒ /archives                                            8.45 kB         175 kB
04:53:30.302 ├ ƒ /auth/error                                          203 B           110 kB
04:53:30.303 ├ ƒ /auth/forgot-password                                2.99 kB         216 kB
04:53:30.303 ├ ƒ /auth/pending                                        2.68 kB         162 kB
04:53:30.303 ├ ○ /auth/register                                       1.73 kB         221 kB
04:53:30.303 ├ ○ /auth/reset-password                                 3.38 kB         216 kB
04:53:30.303 ├ ○ /auth/signin                                         4.37 kB         217 kB
04:53:30.303 ├ ƒ /auth/signin/form-post                               722 B           107 kB
04:53:30.303 ├ ○ /auth/signout                                        1.48 kB         160 kB
04:53:30.303 ├ ○ /auth/suspended                                      203 B           110 kB
04:53:30.303 ├ ○ /cart                                                7.99 kB         171 kB
04:53:30.303 ├ ○ /catalog                                             15 kB           185 kB
04:53:30.303 ├ ● /catalog/[slug]                                      8.15 kB         194 kB
04:53:30.304 ├   ├ /catalog/three-seal-001
04:53:30.304 ├   ├ /catalog/stand-pouch-001
04:53:30.304 ├   ├ /catalog/box-pouch-001
04:53:30.304 ├   └ [+3 more paths]
04:53:30.304 ├ ○ /compare                                             8.51 kB         168 kB
04:53:30.304 ├ ○ /compare/shared                                      722 B           107 kB
04:53:30.304 ├ ○ /contact                                             7.37 kB         148 kB
04:53:30.304 ├ ○ /contact/thank-you                                   203 B           110 kB
04:53:30.304 ├ ○ /csr                                                 722 B           107 kB
04:53:30.304 ├ ○ /data-templates                                      5.63 kB         181 kB
04:53:30.304 ├ ○ /design-system                                       7.42 kB         192 kB
04:53:30.304 ├ ○ /flow                                                3.02 kB         178 kB
04:53:30.304 ├ ○ /guide                                               684 B           157 kB
04:53:30.304 ├ ○ /guide/color                                         1.9 kB          108 kB
04:53:30.304 ├ ○ /guide/environmentaldisplay                          1.9 kB          108 kB
04:53:30.304 ├ ○ /guide/image                                         1.9 kB          108 kB
04:53:30.304 ├ ○ /guide/shirohan                                      1.9 kB          108 kB
04:53:30.304 ├ ○ /guide/size                                          1.9 kB          108 kB
04:53:30.304 ├ ƒ /industry/cosmetics                                  4.33 kB         147 kB
04:53:30.304 ├ ƒ /industry/electronics                                4.58 kB         147 kB
04:53:30.304 ├ ƒ /industry/food-manufacturing                         3.29 kB         146 kB
04:53:30.304 ├ ƒ /industry/pharmaceutical                             4.79 kB         147 kB
04:53:30.304 ├ ○ /inquiry/detailed                                    15.9 kB         198 kB
04:53:30.304 ├ ○ /legal                                               722 B           107 kB
04:53:30.304 ├ ○ /member/billing-addresses                            3.76 kB         190 kB
04:53:30.306 ├ ○ /member/contracts                                    6.05 kB         190 kB
04:53:30.306 ├ ƒ /member/dashboard                                    8.65 kB         273 kB
04:53:30.306 ├ ○ /member/deliveries                                   5.48 kB         190 kB
04:53:30.306 ├ ○ /member/edit                                         5.2 kB          242 kB
04:53:30.306 ├ ○ /member/inquiries                                    4.07 kB         252 kB
04:53:30.306 ├ ○ /member/invoices                                     4.07 kB         252 kB
04:53:30.307 ├ ○ /member/notifications                                4.92 kB         249 kB
04:53:30.307 ├ ƒ /member/orders                                       5.39 kB         276 kB
04:53:30.307 ├ ƒ /member/orders/[id]                                  3.2 kB          291 kB
04:53:30.307 ├ ƒ /member/orders/[id]/confirmation                     5.67 kB         120 kB
04:53:30.307 ├ ƒ /member/orders/[id]/data-receipt                     9.37 kB         124 kB
04:53:30.307 ├ ƒ /member/orders/[id]/preparation                      5.43 kB         190 kB
04:53:30.307 ├ ƒ /member/orders/[id]/spec-approval                    4.66 kB         123 kB
04:53:30.307 ├ ○ /member/orders/history                               587 B           107 kB
04:53:30.307 ├ ○ /member/orders/new                                   722 B           107 kB
04:53:30.307 ├ ○ /member/orders/reorder                               722 B           107 kB
04:53:30.307 ├ ○ /member/profile                                      5.5 kB          256 kB
04:53:30.307 ├ ○ /member/quotations                                   13.8 kB         488 kB
04:53:30.307 ├ ƒ /member/quotations/[id]                              53.8 kB         564 kB
04:53:30.307 ├ ƒ /member/quotations/[id]/confirm                      8.28 kB         148 kB
04:53:30.307 ├ ○ /member/quotations/request                           12.5 kB         246 kB
04:53:30.307 ├ ○ /member/samples                                      3.79 kB         188 kB
04:53:30.307 ├ ○ /member/settings                                     5.6 kB          243 kB
04:53:30.307 ├ ○ /members                                             6.79 kB         178 kB
04:53:30.307 ├ ƒ /news                                                8.04 kB         168 kB
04:53:30.307 ├ ○ /premium-content                                     6.85 kB         188 kB
04:53:30.307 ├ ○ /pricing                                             513 B           107 kB
04:53:30.307 ├ ○ /print                                               216 B           175 kB
04:53:30.307 ├ ○ /privacy                                             722 B           107 kB
04:53:30.307 ├ ○ /profile                                             8.31 kB         175 kB
04:53:30.307 ├ ○ /quote-simulator                                     5.4 kB          211 kB
04:53:30.307 ├ ○ /robots.txt                                          0 B                0 B
04:53:30.307 ├ ○ /samples                                             12.7 kB         203 kB
04:53:30.307 ├ ○ /samples/thank-you                                   203 B           110 kB
04:53:30.307 ├ ○ /service                                             5.83 kB         166 kB
04:53:30.307 ├ ○ /sitemap.xml                                         0 B                0 B
04:53:30.308 └ ○ /terms                                               722 B           107 kB
04:53:30.308 + First Load JS shared by all                            106 kB
04:53:30.308   ├ chunks/1517-c2153894501a72e4.js                      50.7 kB
04:53:30.308   ├ chunks/4bd1b696-2ed65f1fcfc9c19e.js                  53 kB
04:53:30.308   └ other shared chunks (total)                          2.37 kB
04:53:30.308 
04:53:30.308 
04:53:30.308 ƒ Middleware                                             79.1 kB
04:53:30.317 
04:53:30.317 ○  (Static)   prerendered as static content
04:53:30.317 ●  (SSG)      prerendered as static HTML (uses generateStaticParams)
04:53:30.317 ƒ  (Dynamic)  server-rendered on demand
04:53:30.317 
04:53:31.013 Traced Next.js server files in: 183.201ms
04:53:32.504 Created all serverless functions in: 1.491s
04:53:32.746 Collected static files (public/, static/, .next/static): 74.601ms
04:53:33.335 Build Completed in /vercel/output [3m]
04:53:34.005 Error: Vulnerable version of Next.js detected, please update immediately. Learn More: https://vercel.link/CVE-2025-66478