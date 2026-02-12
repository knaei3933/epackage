04:44:37.568 Running build in Washington, D.C., USA (East) – iad1
04:44:37.569 Build machine configuration: 2 cores, 8 GB
04:44:37.702 Cloning github.com/knaei3933/epackage (Branch: main, Commit: cb4499e)
04:44:37.703 Previous build caches not available.
04:44:48.857 Cloning completed: 11.154s
04:44:49.732 Running "vercel build"
04:44:50.327 Vercel CLI 50.15.1
04:44:50.913 Running "install" command: `npm install`...
04:44:55.225 npm warn deprecated scmp@2.1.0: Just use Node.js's crypto.timingSafeEqual()
04:44:55.337 npm warn deprecated rimraf@2.7.1: Rimraf versions prior to v4 are no longer supported
04:44:56.518 npm warn deprecated lodash.isequal@4.5.0: This package is deprecated. Use require('node:util').isDeepStrictEqual instead.
04:44:57.000 npm warn deprecated inflight@1.0.6: This module is not supported, and leaks memory. Do not use it. Check out lru-cache if you want a good and tested way to coalesce async requests by a key value, which is much more comprehensive and powerful.
04:44:58.660 npm warn deprecated fstream@1.0.12: This package is no longer supported.
04:44:58.784 npm warn deprecated node-domexception@1.0.0: Use your platform's native DOMException instead
04:44:59.659 npm warn deprecated @supabase/auth-helpers-shared@0.7.0: This package is now deprecated - please use the @supabase/ssr package instead.
04:45:00.750 npm warn deprecated @supabase/auth-helpers-nextjs@0.10.0: This package is now deprecated - please use the @supabase/ssr package instead.
04:45:02.458 npm warn deprecated glob@7.2.3: Glob versions prior to v9 are no longer supported
04:45:02.735 npm warn deprecated glob@7.2.3: Glob versions prior to v9 are no longer supported
04:45:02.813 npm warn deprecated glob@7.2.3: Glob versions prior to v9 are no longer supported
04:45:03.704 npm warn deprecated glob@7.2.3: Glob versions prior to v9 are no longer supported
04:45:06.987 npm warn deprecated @mswjs/data@0.16.2: Package no longer supported. Contact Support at https://www.npmjs.com/support for more info.
04:45:28.515 npm warn deprecated next@15.1.6: This version has a security vulnerability. Please upgrade to a patched version. See https://nextjs.org/blog/CVE-2025-66478 for more details.
04:45:29.998 
04:45:29.999 added 1398 packages, and audited 1399 packages in 39s
04:45:29.999 
04:45:30.000 241 packages are looking for funding
04:45:30.000   run `npm fund` for details
04:45:30.134 
04:45:30.135 26 vulnerabilities (3 moderate, 21 high, 2 critical)
04:45:30.135 
04:45:30.135 To address issues that do not require attention, run:
04:45:30.136   npm audit fix
04:45:30.136 
04:45:30.136 To address all issues (including breaking changes), run:
04:45:30.136   npm audit fix --force
04:45:30.137 
04:45:30.137 Run `npm audit` for details.
04:45:30.244 Detected Next.js version: 15.1.6
04:45:30.245 Running "npm run build"
04:45:30.346 
04:45:30.347 > epackage-lab-web@0.1.0 build
04:45:30.347 > next build
04:45:30.347 
04:45:30.929 Attention: Next.js now collects completely anonymous telemetry regarding usage.
04:45:30.929 This information is used to shape Next.js' roadmap and prioritize features.
04:45:30.930 You can learn more, including how to opt-out if you'd not like to participate in this anonymous program, by visiting the following URL:
04:45:30.930 https://nextjs.org/telemetry
04:45:30.930 
04:45:30.994    ▲ Next.js 15.1.6
04:45:30.995 
04:45:31.041    Creating an optimized production build ...
04:46:13.733  ⚠ Compiled with warnings
04:46:13.734 
04:46:13.734 ./node_modules/handlebars/lib/index.js
04:46:13.735 require.extensions is not supported by webpack. Use a loader instead.
04:46:13.735 
04:46:13.735 Import trace for requested module:
04:46:13.735 ./node_modules/handlebars/lib/index.js
04:46:13.735 ./src/app/api/contract/pdf/route.ts
04:46:13.735 
04:46:13.735 ./node_modules/handlebars/lib/index.js
04:46:13.736 require.extensions is not supported by webpack. Use a loader instead.
04:46:13.736 
04:46:13.736 Import trace for requested module:
04:46:13.736 ./node_modules/handlebars/lib/index.js
04:46:13.736 ./src/app/api/contract/pdf/route.ts
04:46:13.736 
04:46:13.736 ./node_modules/handlebars/lib/index.js
04:46:13.736 require.extensions is not supported by webpack. Use a loader instead.
04:46:13.736 
04:46:13.736 Import trace for requested module:
04:46:13.736 ./node_modules/handlebars/lib/index.js
04:46:13.737 ./src/app/api/contract/pdf/route.ts
04:46:13.737 
04:46:19.111 <w> [webpack.cache.PackFileCacheStrategy] Serializing big strings (130kiB) impacts deserialization performance (consider using Buffer instead and decode when needed)
04:46:19.469  ⚠ Compiled with warnings
04:46:19.469 
04:46:19.470 ./node_modules/@supabase/realtime-js/dist/module/lib/websocket-factory.js
04:46:19.470 A Node.js API is used (process.versions at line: 39) which is not supported in the Edge Runtime.
04:46:19.471 Learn more: https://nextjs.org/docs/api-reference/edge-runtime
04:46:19.471 
04:46:19.471 Import trace for requested module:
04:46:19.471 ./node_modules/@supabase/realtime-js/dist/module/lib/websocket-factory.js
04:46:19.472 ./node_modules/@supabase/realtime-js/dist/module/index.js
04:46:19.472 ./node_modules/@supabase/supabase-js/dist/index.mjs
04:46:19.472 ./node_modules/@supabase/ssr/dist/module/createBrowserClient.js
04:46:19.472 ./node_modules/@supabase/ssr/dist/module/index.js
04:46:19.472 
04:46:19.473 ./node_modules/@supabase/supabase-js/dist/index.mjs
04:46:19.473 A Node.js API is used (process.version at line: 395) which is not supported in the Edge Runtime.
04:46:19.473 Learn more: https://nextjs.org/docs/api-reference/edge-runtime
04:46:19.473 
04:46:19.473 Import trace for requested module:
04:46:19.473 ./node_modules/@supabase/supabase-js/dist/index.mjs
04:46:19.473 ./node_modules/@supabase/ssr/dist/module/createBrowserClient.js
04:46:19.474 ./node_modules/@supabase/ssr/dist/module/index.js
04:46:19.474 
04:46:42.584 <w> [webpack.cache.PackFileCacheStrategy] Skipped not serializable cache item 'Compilation/modules|/vercel/path0/node_modules/next/dist/build/webpack/loaders/css-loader/src/index.js??ruleSet[1].rules[13].oneOf[10].use[2]!/vercel/path0/node_modules/next/dist/build/webpack/loaders/postcss-loader/src/index.js??ruleSet[1].rules[13].oneOf[10].use[3]!/vercel/path0/src/app/globals.css': No serializer registered for Warning
04:46:42.584 <w> while serializing webpack/lib/cache/PackFileCacheStrategy.PackContentItems -> webpack/lib/NormalModule -> Array { 1 items } -> webpack/lib/ModuleWarning -> Warning
04:46:44.948  ⚠ Compiled with warnings
04:46:44.949 
04:46:44.949 ./src/app/globals.css.webpack[javascript/auto]!=!./node_modules/next/dist/build/webpack/loaders/css-loader/src/index.js??ruleSet[1].rules[13].oneOf[10].use[2]!./node_modules/next/dist/build/webpack/loaders/postcss-loader/src/index.js??ruleSet[1].rules[13].oneOf[10].use[3]!./src/app/globals.css
04:46:44.950 Warning
04:46:44.950 
04:46:44.950 (837:5) autoprefixer: Replace color-adjust to print-color-adjust. The color-adjust shorthand is currently deprecated.
04:46:44.950 
04:46:44.951 Import trace for requested module:
04:46:44.951 ./src/app/globals.css.webpack[javascript/auto]!=!./node_modules/next/dist/build/webpack/loaders/css-loader/src/index.js??ruleSet[1].rules[13].oneOf[10].use[2]!./node_modules/next/dist/build/webpack/loaders/postcss-loader/src/index.js??ruleSet[1].rules[13].oneOf[10].use[3]!./src/app/globals.css
04:46:44.951 ./src/app/globals.css
04:46:44.951 
04:46:45.061  ✓ Compiled successfully
04:46:45.063    Skipping validation of types
04:46:45.064    Linting ...
04:46:45.339    Collecting page data ...
04:46:46.794 [Email] Production mode - configuring email service
04:46:46.795 [Email] SendGrid not configured
04:46:46.795 [Email] No email service configured - using console fallback
04:46:46.932 [EpackMailer] No SMTP configured - using console fallback
04:46:47.382 [createServiceClient] Credentials not configured, using mock client
04:46:47.977 [AccountDeletionEmail] Configuring email service
04:46:47.978 [AccountDeletionEmail] SendGrid not configured
04:46:47.978 [AccountDeletionEmail] No email service configured - using console fallback
04:46:48.419  ⚠ Using edge runtime on a page currently disables static generation for that page
04:46:57.373    Generating static pages (0/84) ...
04:46:58.268 [supabase-browser] Credentials not configured, returning mock client
04:46:58.269 [AuthProvider] useSearchParams not available, using empty: Error: Bail out to client-side rendering: useSearchParams()
04:46:58.269     at a (.next/server/chunks/6821.js:1:17081)
04:46:58.270     at d (.next/server/chunks/6821.js:1:33677)
04:46:58.271     at <unknown> (.next/server/chunks/1653.js:247:80510)
04:46:58.271     at d (.next/server/chunks/1653.js:247:80473) {
04:46:58.271   reason: 'useSearchParams()',
04:46:58.272   digest: 'BAILOUT_TO_CLIENT_SIDE_RENDERING'
04:46:58.272 }
04:46:58.790 [AuthProvider] useSearchParams not available, using empty: Error: Bail out to client-side rendering: useSearchParams()
04:46:58.790     at a (.next/server/chunks/6821.js:1:17081)
04:46:58.790     at d (.next/server/chunks/6821.js:1:33677)
04:46:58.790     at <unknown> (.next/server/chunks/1653.js:247:80510)
04:46:58.790     at d (.next/server/chunks/1653.js:247:80473) {
04:46:58.790   reason: 'useSearchParams()',
04:46:58.790   digest: 'BAILOUT_TO_CLIENT_SIDE_RENDERING'
04:46:58.790 }
04:46:58.790 [AuthProvider] useSearchParams not available, using empty: Error: Bail out to client-side rendering: useSearchParams()
04:46:58.790     at a (.next/server/chunks/6821.js:1:17081)
04:46:58.790     at d (.next/server/chunks/6821.js:1:33677)
04:46:58.791     at <unknown> (.next/server/chunks/1653.js:247:80510)
04:46:58.791     at d (.next/server/chunks/1653.js:247:80473) {
04:46:58.791   reason: 'useSearchParams()',
04:46:58.791   digest: 'BAILOUT_TO_CLIENT_SIDE_RENDERING'
04:46:58.792 }
04:46:58.792 [AuthProvider] useSearchParams not available, using empty: Error: Bail out to client-side rendering: useSearchParams()
04:46:58.792     at a (.next/server/chunks/6821.js:1:17081)
04:46:58.793     at d (.next/server/chunks/6821.js:1:33677)
04:46:58.793     at <unknown> (.next/server/chunks/1653.js:247:80510)
04:46:58.793     at d (.next/server/chunks/1653.js:247:80473) {
04:46:58.793   reason: 'useSearchParams()',
04:46:58.793   digest: 'BAILOUT_TO_CLIENT_SIDE_RENDERING'
04:46:58.793 }
04:46:58.794 [Catalog] CatalogClient component rendering
04:46:58.794 [Catalog] State: { isLoading: true, productsLength: 0, filteredLength: 0 }
04:46:58.962 [AuthProvider] useSearchParams not available, using empty: Error: Bail out to client-side rendering: useSearchParams()
04:46:58.967     at a (.next/server/chunks/6821.js:1:17081)
04:46:58.968     at d (.next/server/chunks/6821.js:1:33677)
04:46:58.968     at <unknown> (.next/server/chunks/1653.js:247:80510)
04:46:58.969     at d (.next/server/chunks/1653.js:247:80473) {
04:46:58.969   reason: 'useSearchParams()',
04:46:58.970   digest: 'BAILOUT_TO_CLIENT_SIDE_RENDERING'
04:46:58.970 }
04:46:58.970 [AuthProvider] useSearchParams not available, using empty: Error: Bail out to client-side rendering: useSearchParams()
04:46:58.971     at a (.next/server/chunks/6821.js:1:17081)
04:46:58.971     at d (.next/server/chunks/6821.js:1:33677)
04:46:58.972     at <unknown> (.next/server/chunks/1653.js:247:80510)
04:46:58.972     at d (.next/server/chunks/1653.js:247:80473) {
04:46:58.972   reason: 'useSearchParams()',
04:46:58.973   digest: 'BAILOUT_TO_CLIENT_SIDE_RENDERING'
04:46:58.973 }
04:46:59.200 [AuthProvider] useSearchParams not available, using empty: Error: Bail out to client-side rendering: useSearchParams()
04:46:59.200     at a (.next/server/chunks/6821.js:1:17081)
04:46:59.201     at d (.next/server/chunks/6821.js:1:33677)
04:46:59.201     at <unknown> (.next/server/chunks/1653.js:247:80510)
04:46:59.202     at d (.next/server/chunks/1653.js:247:80473) {
04:46:59.202   reason: 'useSearchParams()',
04:46:59.202   digest: 'BAILOUT_TO_CLIENT_SIDE_RENDERING'
04:46:59.203 }
04:46:59.204 [AuthProvider] useSearchParams not available, using empty: Error: Bail out to client-side rendering: useSearchParams()
04:46:59.204     at a (.next/server/chunks/6821.js:1:17081)
04:46:59.204     at d (.next/server/chunks/6821.js:1:33677)
04:46:59.205     at <unknown> (.next/server/chunks/1653.js:247:80510)
04:46:59.205     at d (.next/server/chunks/1653.js:247:80473) {
04:46:59.205   reason: 'useSearchParams()',
04:46:59.206   digest: 'BAILOUT_TO_CLIENT_SIDE_RENDERING'
04:46:59.206 }
04:46:59.207 [AuthProvider] useSearchParams not available, using empty: Error: Bail out to client-side rendering: useSearchParams()
04:46:59.207     at a (.next/server/chunks/6821.js:1:17081)
04:46:59.207     at d (.next/server/chunks/6821.js:1:33677)
04:46:59.208     at <unknown> (.next/server/chunks/1653.js:247:80510)
04:46:59.208     at d (.next/server/chunks/1653.js:247:80473) {
04:46:59.208   reason: 'useSearchParams()',
04:46:59.209   digest: 'BAILOUT_TO_CLIENT_SIDE_RENDERING'
04:46:59.209 }
04:46:59.209 [AuthProvider] useSearchParams not available, using empty: Error: Bail out to client-side rendering: useSearchParams()
04:46:59.210     at a (.next/server/chunks/6821.js:1:17081)
04:46:59.210     at d (.next/server/chunks/6821.js:1:33677)
04:46:59.210     at <unknown> (.next/server/chunks/1653.js:247:80510)
04:46:59.211     at d (.next/server/chunks/1653.js:247:80473) {
04:46:59.211   reason: 'useSearchParams()',
04:46:59.211   digest: 'BAILOUT_TO_CLIENT_SIDE_RENDERING'
04:46:59.212 }
04:46:59.212 [AuthProvider] useSearchParams not available, using empty: Error: Bail out to client-side rendering: useSearchParams()
04:46:59.212     at a (.next/server/chunks/6821.js:1:17081)
04:46:59.213     at d (.next/server/chunks/6821.js:1:33677)
04:46:59.217     at <unknown> (.next/server/chunks/1653.js:247:80510)
04:46:59.217     at d (.next/server/chunks/1653.js:247:80473) {
04:46:59.218   reason: 'useSearchParams()',
04:46:59.218   digest: 'BAILOUT_TO_CLIENT_SIDE_RENDERING'
04:46:59.218 }
04:46:59.218 [AuthProvider] useSearchParams not available, using empty: Error: Bail out to client-side rendering: useSearchParams()
04:46:59.218     at a (.next/server/chunks/6821.js:1:17081)
04:46:59.219     at d (.next/server/chunks/6821.js:1:33677)
04:46:59.219     at <unknown> (.next/server/chunks/1653.js:247:80510)
04:46:59.219     at d (.next/server/chunks/1653.js:247:80473) {
04:46:59.219   reason: 'useSearchParams()',
04:46:59.219   digest: 'BAILOUT_TO_CLIENT_SIDE_RENDERING'
04:46:59.219 }
04:46:59.220    Generating static pages (21/84) 
04:46:59.299 [getDefaultPostProcessingOptions] Selected defaults: [
04:46:59.299   'zipper-yes',
04:46:59.300   'glossy',
04:46:59.300   'notch-yes',
04:46:59.300   'hang-hole-6mm',
04:46:59.300   'corner-round',
04:46:59.301   'valve-no',
04:46:59.301   'top-open',
04:46:59.301   'sealing-width-5mm'
04:46:59.301 ]
04:46:59.302 [QuoteContext] initialState created: {
04:46:59.302   materialWidth: 590,
04:46:59.302   filmLayers: [
04:46:59.302     { materialId: 'PET', thickness: 12 },
04:46:59.302     { materialId: 'AL', thickness: 7 },
04:46:59.303     { materialId: 'PET', thickness: 12 },
04:46:59.303     { materialId: 'LLDPE', thickness: 70 }
04:46:59.303   ],
04:46:59.303   filmLayersCount: 4
04:46:59.304 }
04:46:59.387 [AuthProvider] useSearchParams not available, using empty: Error: Bail out to client-side rendering: useSearchParams()
04:46:59.388     at a (.next/server/chunks/6821.js:1:17081)
04:46:59.388     at d (.next/server/chunks/6821.js:1:33677)
04:46:59.388     at <unknown> (.next/server/chunks/1653.js:247:80510)
04:46:59.388     at d (.next/server/chunks/1653.js:247:80473) {
04:46:59.389   reason: 'useSearchParams()',
04:46:59.389   digest: 'BAILOUT_TO_CLIENT_SIDE_RENDERING'
04:46:59.389 }
04:46:59.389 [AuthProvider] useSearchParams not available, using empty: Error: Bail out to client-side rendering: useSearchParams()
04:46:59.394     at a (.next/server/chunks/6821.js:1:17081)
04:46:59.395     at d (.next/server/chunks/6821.js:1:33677)
04:46:59.395     at <unknown> (.next/server/chunks/1653.js:247:80510)
04:46:59.395     at d (.next/server/chunks/1653.js:247:80473) {
04:46:59.396   reason: 'useSearchParams()',
04:46:59.396   digest: 'BAILOUT_TO_CLIENT_SIDE_RENDERING'
04:46:59.396 }
04:46:59.396 [AuthProvider] useSearchParams not available, using empty: Error: Bail out to client-side rendering: useSearchParams()
04:46:59.397     at a (.next/server/chunks/6821.js:1:17081)
04:46:59.397     at d (.next/server/chunks/6821.js:1:33677)
04:46:59.397     at <unknown> (.next/server/chunks/1653.js:247:80510)
04:46:59.397     at d (.next/server/chunks/1653.js:247:80473) {
04:46:59.397   reason: 'useSearchParams()',
04:46:59.398   digest: 'BAILOUT_TO_CLIENT_SIDE_RENDERING'
04:46:59.398 }
04:46:59.398 [createServiceClient] Credentials not configured, using mock client
04:46:59.398 [getFeaturedProducts] Unexpected error: TypeError: t.from(...).select is not a function
04:46:59.399     at s.revalidate (.next/server/app/page.js:15:44140)
04:46:59.399     at <unknown> (.next/server/chunks/1482.js:1:7519)
04:46:59.399     at async d (.next/server/app/page.js:15:37724)
04:46:59.399 [createServiceClient] Credentials not configured, using mock client
04:46:59.400 [getLatestAnnouncements] Unexpected error: TypeError: t.from(...).select is not a function
04:46:59.400     at l.revalidate (.next/server/app/page.js:15:44577)
04:46:59.400     at <unknown> (.next/server/chunks/1482.js:1:7519)
04:46:59.402     at async d (.next/server/app/page.js:15:37724)
04:46:59.402 [AuthProvider] useSearchParams not available, using empty: Error: Bail out to client-side rendering: useSearchParams()
04:46:59.403     at a (.next/server/chunks/6821.js:1:17081)
04:46:59.403     at d (.next/server/chunks/6821.js:1:33677)
04:46:59.403     at <unknown> (.next/server/chunks/1653.js:247:80510)
04:46:59.404     at d (.next/server/chunks/1653.js:247:80473) {
04:46:59.405   reason: 'useSearchParams()',
04:46:59.405   digest: 'BAILOUT_TO_CLIENT_SIDE_RENDERING'
04:46:59.405 }
04:46:59.650 [AuthProvider] useSearchParams not available, using empty: Error: Bail out to client-side rendering: useSearchParams()
04:46:59.650     at a (.next/server/chunks/6821.js:1:17081)
04:46:59.651     at d (.next/server/chunks/6821.js:1:33677)
04:46:59.651     at <unknown> (.next/server/chunks/1653.js:247:80510)
04:46:59.651     at d (.next/server/chunks/1653.js:247:80473) {
04:46:59.652   reason: 'useSearchParams()',
04:46:59.652   digest: 'BAILOUT_TO_CLIENT_SIDE_RENDERING'
04:46:59.653 }
04:46:59.654 [AuthProvider] useSearchParams not available, using empty: Error: Bail out to client-side rendering: useSearchParams()
04:46:59.654     at a (.next/server/chunks/6821.js:1:17081)
04:46:59.656     at d (.next/server/chunks/6821.js:1:33677)
04:46:59.656     at <unknown> (.next/server/chunks/1653.js:247:80510)
04:46:59.656     at d (.next/server/chunks/1653.js:247:80473) {
04:46:59.657   reason: 'useSearchParams()',
04:46:59.657   digest: 'BAILOUT_TO_CLIENT_SIDE_RENDERING'
04:46:59.657 }
04:46:59.657 [AuthProvider] useSearchParams not available, using empty: Error: Bail out to client-side rendering: useSearchParams()
04:46:59.658     at a (.next/server/chunks/6821.js:1:17081)
04:46:59.658     at d (.next/server/chunks/6821.js:1:33677)
04:46:59.658     at <unknown> (.next/server/chunks/1653.js:247:80510)
04:46:59.658     at d (.next/server/chunks/1653.js:247:80473) {
04:46:59.659   reason: 'useSearchParams()',
04:46:59.659   digest: 'BAILOUT_TO_CLIENT_SIDE_RENDERING'
04:46:59.659 }
04:46:59.660 [AuthProvider] useSearchParams not available, using empty: Error: Bail out to client-side rendering: useSearchParams()
04:46:59.660     at a (.next/server/chunks/6821.js:1:17081)
04:46:59.660     at d (.next/server/chunks/6821.js:1:33677)
04:46:59.661     at <unknown> (.next/server/chunks/1653.js:247:80510)
04:46:59.661     at d (.next/server/chunks/1653.js:247:80473) {
04:46:59.661   reason: 'useSearchParams()',
04:46:59.663   digest: 'BAILOUT_TO_CLIENT_SIDE_RENDERING'
04:46:59.663 }
04:46:59.663 [AuthProvider] useSearchParams not available, using empty: Error: Bail out to client-side rendering: useSearchParams()
04:46:59.663     at a (.next/server/chunks/6821.js:1:17081)
04:46:59.663     at d (.next/server/chunks/6821.js:1:33677)
04:46:59.663     at <unknown> (.next/server/chunks/1653.js:247:80510)
04:46:59.663     at d (.next/server/chunks/1653.js:247:80473) {
04:46:59.663   reason: 'useSearchParams()',
04:46:59.663   digest: 'BAILOUT_TO_CLIENT_SIDE_RENDERING'
04:46:59.663 }
04:46:59.663 [AuthProvider] useSearchParams not available, using empty: Error: Bail out to client-side rendering: useSearchParams()
04:46:59.663     at a (.next/server/chunks/6821.js:1:17081)
04:46:59.663     at d (.next/server/chunks/6821.js:1:33677)
04:46:59.663     at <unknown> (.next/server/chunks/1653.js:247:80510)
04:46:59.663     at d (.next/server/chunks/1653.js:247:80473) {
04:46:59.663   reason: 'useSearchParams()',
04:46:59.663   digest: 'BAILOUT_TO_CLIENT_SIDE_RENDERING'
04:46:59.663 }
04:46:59.663 [AuthProvider] useSearchParams not available, using empty: Error: Bail out to client-side rendering: useSearchParams()
04:46:59.663     at a (.next/server/chunks/6821.js:1:17081)
04:46:59.663     at d (.next/server/chunks/6821.js:1:33677)
04:46:59.663     at <unknown> (.next/server/chunks/1653.js:247:80510)
04:46:59.663     at d (.next/server/chunks/1653.js:247:80473) {
04:46:59.663   reason: 'useSearchParams()',
04:46:59.663   digest: 'BAILOUT_TO_CLIENT_SIDE_RENDERING'
04:46:59.663 }
04:46:59.663 [AuthProvider] useSearchParams not available, using empty: Error: Bail out to client-side rendering: useSearchParams()
04:46:59.663     at a (.next/server/chunks/6821.js:1:17081)
04:46:59.664     at d (.next/server/chunks/6821.js:1:33677)
04:46:59.664     at <unknown> (.next/server/chunks/1653.js:247:80510)
04:46:59.664     at d (.next/server/chunks/1653.js:247:80473) {
04:46:59.664   reason: 'useSearchParams()',
04:46:59.664   digest: 'BAILOUT_TO_CLIENT_SIDE_RENDERING'
04:46:59.664 }
04:46:59.866 [AuthProvider] useSearchParams not available, using empty: Error: Bail out to client-side rendering: useSearchParams()
04:46:59.867     at a (.next/server/chunks/6821.js:1:17081)
04:46:59.867     at d (.next/server/chunks/6821.js:1:33677)
04:46:59.867     at <unknown> (.next/server/chunks/1653.js:247:80510)
04:46:59.868     at d (.next/server/chunks/1653.js:247:80473) {
04:46:59.868   reason: 'useSearchParams()',
04:46:59.868   digest: 'BAILOUT_TO_CLIENT_SIDE_RENDERING'
04:46:59.868 }
04:46:59.868 [AuthProvider] useSearchParams not available, using empty: Error: Bail out to client-side rendering: useSearchParams()
04:46:59.869     at a (.next/server/chunks/6821.js:1:17081)
04:46:59.869     at d (.next/server/chunks/6821.js:1:33677)
04:46:59.869     at <unknown> (.next/server/chunks/1653.js:247:80510)
04:46:59.869     at d (.next/server/chunks/1653.js:247:80473) {
04:46:59.869   reason: 'useSearchParams()',
04:46:59.870   digest: 'BAILOUT_TO_CLIENT_SIDE_RENDERING'
04:46:59.870 }
04:46:59.870 [AuthProvider] useSearchParams not available, using empty: Error: Bail out to client-side rendering: useSearchParams()
04:46:59.870     at a (.next/server/chunks/6821.js:1:17081)
04:46:59.870     at d (.next/server/chunks/6821.js:1:33677)
04:46:59.871     at <unknown> (.next/server/chunks/1653.js:247:80510)
04:46:59.871     at d (.next/server/chunks/1653.js:247:80473) {
04:46:59.871   reason: 'useSearchParams()',
04:46:59.871   digest: 'BAILOUT_TO_CLIENT_SIDE_RENDERING'
04:46:59.871 }
04:46:59.872 [AuthProvider] useSearchParams not available, using empty: Error: Bail out to client-side rendering: useSearchParams()
04:46:59.872     at a (.next/server/chunks/6821.js:1:17081)
04:46:59.872     at d (.next/server/chunks/6821.js:1:33677)
04:46:59.872     at <unknown> (.next/server/chunks/1653.js:247:80510)
04:46:59.872     at d (.next/server/chunks/1653.js:247:80473) {
04:46:59.873   reason: 'useSearchParams()',
04:46:59.873   digest: 'BAILOUT_TO_CLIENT_SIDE_RENDERING'
04:46:59.873 }
04:46:59.873 [AuthProvider] useSearchParams not available, using empty: Error: Bail out to client-side rendering: useSearchParams()
04:46:59.873     at a (.next/server/chunks/6821.js:1:17081)
04:46:59.874     at d (.next/server/chunks/6821.js:1:33677)
04:46:59.874     at <unknown> (.next/server/chunks/1653.js:247:80510)
04:46:59.874     at d (.next/server/chunks/1653.js:247:80473) {
04:46:59.876   reason: 'useSearchParams()',
04:46:59.876   digest: 'BAILOUT_TO_CLIENT_SIDE_RENDERING'
04:46:59.877 }
04:47:00.062 [AuthProvider] useSearchParams not available, using empty: Error: Bail out to client-side rendering: useSearchParams()
04:47:00.062     at a (.next/server/chunks/6821.js:1:17081)
04:47:00.063     at d (.next/server/chunks/6821.js:1:33677)
04:47:00.063     at <unknown> (.next/server/chunks/1653.js:247:80510)
04:47:00.063     at d (.next/server/chunks/1653.js:247:80473) {
04:47:00.063   reason: 'useSearchParams()',
04:47:00.064   digest: 'BAILOUT_TO_CLIENT_SIDE_RENDERING'
04:47:00.064 }
04:47:00.064 [AuthProvider] useSearchParams not available, using empty: Error: Bail out to client-side rendering: useSearchParams()
04:47:00.064     at a (.next/server/chunks/6821.js:1:17081)
04:47:00.064     at d (.next/server/chunks/6821.js:1:33677)
04:47:00.065     at <unknown> (.next/server/chunks/1653.js:247:80510)
04:47:00.065     at d (.next/server/chunks/1653.js:247:80473) {
04:47:00.065   reason: 'useSearchParams()',
04:47:00.065   digest: 'BAILOUT_TO_CLIENT_SIDE_RENDERING'
04:47:00.065 }
04:47:00.066 [AuthProvider] useSearchParams not available, using empty: Error: Bail out to client-side rendering: useSearchParams()
04:47:00.066     at a (.next/server/chunks/6821.js:1:17081)
04:47:00.066     at d (.next/server/chunks/6821.js:1:33677)
04:47:00.066     at <unknown> (.next/server/chunks/1653.js:247:80510)
04:47:00.067     at d (.next/server/chunks/1653.js:247:80473) {
04:47:00.067   reason: 'useSearchParams()',
04:47:00.067   digest: 'BAILOUT_TO_CLIENT_SIDE_RENDERING'
04:47:00.067 }
04:47:00.067 [AuthProvider] useSearchParams not available, using empty: Error: Bail out to client-side rendering: useSearchParams()
04:47:00.068     at a (.next/server/chunks/6821.js:1:17081)
04:47:00.068     at d (.next/server/chunks/6821.js:1:33677)
04:47:00.068     at <unknown> (.next/server/chunks/1653.js:247:80510)
04:47:00.068     at d (.next/server/chunks/1653.js:247:80473) {
04:47:00.068   reason: 'useSearchParams()',
04:47:00.069   digest: 'BAILOUT_TO_CLIENT_SIDE_RENDERING'
04:47:00.069 }
04:47:00.244    Generating static pages (42/84) 
04:47:00.417 [AuthProvider] useSearchParams not available, using empty: Error: Bail out to client-side rendering: useSearchParams()
04:47:00.418     at a (.next/server/chunks/6821.js:1:17081)
04:47:00.420     at d (.next/server/chunks/6821.js:1:33677)
04:47:00.420     at <unknown> (.next/server/chunks/1653.js:247:80510)
04:47:00.420     at d (.next/server/chunks/1653.js:247:80473) {
04:47:00.421   reason: 'useSearchParams()',
04:47:00.421   digest: 'BAILOUT_TO_CLIENT_SIDE_RENDERING'
04:47:00.421 }
04:47:00.421 [AuthProvider] useSearchParams not available, using empty: Error: Bail out to client-side rendering: useSearchParams()
04:47:00.421     at a (.next/server/chunks/6821.js:1:17081)
04:47:00.422     at d (.next/server/chunks/6821.js:1:33677)
04:47:00.422     at <unknown> (.next/server/chunks/1653.js:247:80510)
04:47:00.422     at d (.next/server/chunks/1653.js:247:80473) {
04:47:00.422   reason: 'useSearchParams()',
04:47:00.423   digest: 'BAILOUT_TO_CLIENT_SIDE_RENDERING'
04:47:00.423 }
04:47:00.423 [AuthProvider] useSearchParams not available, using empty: Error: Bail out to client-side rendering: useSearchParams()
04:47:00.423     at a (.next/server/chunks/6821.js:1:17081)
04:47:00.423     at d (.next/server/chunks/6821.js:1:33677)
04:47:00.424     at <unknown> (.next/server/chunks/1653.js:247:80510)
04:47:00.424     at d (.next/server/chunks/1653.js:247:80473) {
04:47:00.424   reason: 'useSearchParams()',
04:47:00.424   digest: 'BAILOUT_TO_CLIENT_SIDE_RENDERING'
04:47:00.424 }
04:47:00.425 [AuthProvider] useSearchParams not available, using empty: Error: Bail out to client-side rendering: useSearchParams()
04:47:00.425     at a (.next/server/chunks/6821.js:1:17081)
04:47:00.425     at d (.next/server/chunks/6821.js:1:33677)
04:47:00.425     at <unknown> (.next/server/chunks/1653.js:247:80510)
04:47:00.425     at d (.next/server/chunks/1653.js:247:80473) {
04:47:00.426   reason: 'useSearchParams()',
04:47:00.426   digest: 'BAILOUT_TO_CLIENT_SIDE_RENDERING'
04:47:00.426 }
04:47:00.426 [AuthProvider] useSearchParams not available, using empty: Error: Bail out to client-side rendering: useSearchParams()
04:47:00.426     at a (.next/server/chunks/6821.js:1:17081)
04:47:00.427     at d (.next/server/chunks/6821.js:1:33677)
04:47:00.427     at <unknown> (.next/server/chunks/1653.js:247:80510)
04:47:00.427     at d (.next/server/chunks/1653.js:247:80473) {
04:47:00.427   reason: 'useSearchParams()',
04:47:00.427   digest: 'BAILOUT_TO_CLIENT_SIDE_RENDERING'
04:47:00.428 }
04:47:00.428 [AuthProvider] useSearchParams not available, using empty: Error: Bail out to client-side rendering: useSearchParams()
04:47:00.428     at a (.next/server/chunks/6821.js:1:17081)
04:47:00.428     at d (.next/server/chunks/6821.js:1:33677)
04:47:00.428     at <unknown> (.next/server/chunks/1653.js:247:80510)
04:47:00.429     at d (.next/server/chunks/1653.js:247:80473) {
04:47:00.429   reason: 'useSearchParams()',
04:47:00.429   digest: 'BAILOUT_TO_CLIENT_SIDE_RENDERING'
04:47:00.429 }
04:47:00.429 [AuthProvider] useSearchParams not available, using empty: Error: Bail out to client-side rendering: useSearchParams()
04:47:00.430     at a (.next/server/chunks/6821.js:1:17081)
04:47:00.430     at d (.next/server/chunks/6821.js:1:33677)
04:47:00.430     at <unknown> (.next/server/chunks/1653.js:247:80510)
04:47:00.430     at d (.next/server/chunks/1653.js:247:80473) {
04:47:00.430   reason: 'useSearchParams()',
04:47:00.431   digest: 'BAILOUT_TO_CLIENT_SIDE_RENDERING'
04:47:00.431 }
04:47:00.431 [AuthProvider] useSearchParams not available, using empty: Error: Bail out to client-side rendering: useSearchParams()
04:47:00.432     at a (.next/server/chunks/6821.js:1:17081)
04:47:00.432     at d (.next/server/chunks/6821.js:1:33677)
04:47:00.432     at <unknown> (.next/server/chunks/1653.js:247:80510)
04:47:00.432     at d (.next/server/chunks/1653.js:247:80473) {
04:47:00.433   reason: 'useSearchParams()',
04:47:00.433   digest: 'BAILOUT_TO_CLIENT_SIDE_RENDERING'
04:47:00.433 }
04:47:00.606 [AuthProvider] useSearchParams not available, using empty: Error: Bail out to client-side rendering: useSearchParams()
04:47:00.607     at a (.next/server/chunks/6821.js:1:17081)
04:47:00.607     at d (.next/server/chunks/6821.js:1:33677)
04:47:00.608     at <unknown> (.next/server/chunks/1653.js:247:80510)
04:47:00.608     at d (.next/server/chunks/1653.js:247:80473) {
04:47:00.608   reason: 'useSearchParams()',
04:47:00.609   digest: 'BAILOUT_TO_CLIENT_SIDE_RENDERING'
04:47:00.609 }
04:47:00.609 [AuthProvider] useSearchParams not available, using empty: Error: Bail out to client-side rendering: useSearchParams()
04:47:00.610     at a (.next/server/chunks/6821.js:1:17081)
04:47:00.610     at d (.next/server/chunks/6821.js:1:33677)
04:47:00.610     at <unknown> (.next/server/chunks/1653.js:247:80510)
04:47:00.611     at d (.next/server/chunks/1653.js:247:80473) {
04:47:00.611   reason: 'useSearchParams()',
04:47:00.611   digest: 'BAILOUT_TO_CLIENT_SIDE_RENDERING'
04:47:00.612 }
04:47:00.616 [AuthProvider] useSearchParams not available, using empty: Error: Bail out to client-side rendering: useSearchParams()
04:47:00.616     at a (.next/server/chunks/6821.js:1:17081)
04:47:00.617     at d (.next/server/chunks/6821.js:1:33677)
04:47:00.617     at <unknown> (.next/server/chunks/1653.js:247:80510)
04:47:00.617     at d (.next/server/chunks/1653.js:247:80473) {
04:47:00.618   reason: 'useSearchParams()',
04:47:00.618   digest: 'BAILOUT_TO_CLIENT_SIDE_RENDERING'
04:47:00.618 }
04:47:00.620 [AuthProvider] useSearchParams not available, using empty: Error: Bail out to client-side rendering: useSearchParams()
04:47:00.621     at a (.next/server/chunks/6821.js:1:17081)
04:47:00.621     at d (.next/server/chunks/6821.js:1:33677)
04:47:00.622     at <unknown> (.next/server/chunks/1653.js:247:80510)
04:47:00.622     at d (.next/server/chunks/1653.js:247:80473) {
04:47:00.623   reason: 'useSearchParams()',
04:47:00.623   digest: 'BAILOUT_TO_CLIENT_SIDE_RENDERING'
04:47:00.624 }
04:47:00.625 [AuthProvider] useSearchParams not available, using empty: Error: Bail out to client-side rendering: useSearchParams()
04:47:00.625     at a (.next/server/chunks/6821.js:1:17081)
04:47:00.625     at d (.next/server/chunks/6821.js:1:33677)
04:47:00.626     at <unknown> (.next/server/chunks/1653.js:247:80510)
04:47:00.626     at d (.next/server/chunks/1653.js:247:80473) {
04:47:00.626   reason: 'useSearchParams()',
04:47:00.627   digest: 'BAILOUT_TO_CLIENT_SIDE_RENDERING'
04:47:00.627 }
04:47:00.627 [AuthProvider] useSearchParams not available, using empty: Error: Bail out to client-side rendering: useSearchParams()
04:47:00.628     at a (.next/server/chunks/6821.js:1:17081)
04:47:00.628     at d (.next/server/chunks/6821.js:1:33677)
04:47:00.628     at <unknown> (.next/server/chunks/1653.js:247:80510)
04:47:00.629     at d (.next/server/chunks/1653.js:247:80473) {
04:47:00.629   reason: 'useSearchParams()',
04:47:00.629   digest: 'BAILOUT_TO_CLIENT_SIDE_RENDERING'
04:47:00.630 }
04:47:01.042 [AuthProvider] useSearchParams not available, using empty: Error: Bail out to client-side rendering: useSearchParams()
04:47:01.044     at a (.next/server/chunks/6821.js:1:17081)
04:47:01.044     at d (.next/server/chunks/6821.js:1:33677)
04:47:01.044     at <unknown> (.next/server/chunks/1653.js:247:80510)
04:47:01.045     at d (.next/server/chunks/1653.js:247:80473) {
04:47:01.045   reason: 'useSearchParams()',
04:47:01.045   digest: 'BAILOUT_TO_CLIENT_SIDE_RENDERING'
04:47:01.046 }
04:47:01.046 [AuthProvider] useSearchParams not available, using empty: Error: Bail out to client-side rendering: useSearchParams()
04:47:01.046     at a (.next/server/chunks/6821.js:1:17081)
04:47:01.047     at d (.next/server/chunks/6821.js:1:33677)
04:47:01.047     at <unknown> (.next/server/chunks/1653.js:247:80510)
04:47:01.047     at d (.next/server/chunks/1653.js:247:80473) {
04:47:01.048   reason: 'useSearchParams()',
04:47:01.048   digest: 'BAILOUT_TO_CLIENT_SIDE_RENDERING'
04:47:01.048 }
04:47:01.049 [AuthProvider] useSearchParams not available, using empty: Error: Bail out to client-side rendering: useSearchParams()
04:47:01.049     at a (.next/server/chunks/6821.js:1:17081)
04:47:01.049     at d (.next/server/chunks/6821.js:1:33677)
04:47:01.050     at <unknown> (.next/server/chunks/1653.js:247:80510)
04:47:01.050     at d (.next/server/chunks/1653.js:247:80473) {
04:47:01.050   reason: 'useSearchParams()',
04:47:01.051   digest: 'BAILOUT_TO_CLIENT_SIDE_RENDERING'
04:47:01.051 }
04:47:01.051 [AuthProvider] useSearchParams not available, using empty: Error: Bail out to client-side rendering: useSearchParams()
04:47:01.051     at a (.next/server/chunks/6821.js:1:17081)
04:47:01.052     at d (.next/server/chunks/6821.js:1:33677)
04:47:01.052     at <unknown> (.next/server/chunks/1653.js:247:80510)
04:47:01.052     at d (.next/server/chunks/1653.js:247:80473) {
04:47:01.053   reason: 'useSearchParams()',
04:47:01.053   digest: 'BAILOUT_TO_CLIENT_SIDE_RENDERING'
04:47:01.053 }
04:47:01.053 [AuthProvider] useSearchParams not available, using empty: Error: Bail out to client-side rendering: useSearchParams()
04:47:01.054     at a (.next/server/chunks/6821.js:1:17081)
04:47:01.054     at d (.next/server/chunks/6821.js:1:33677)
04:47:01.054     at <unknown> (.next/server/chunks/1653.js:247:80510)
04:47:01.055     at d (.next/server/chunks/1653.js:247:80473) {
04:47:01.055   reason: 'useSearchParams()',
04:47:01.056   digest: 'BAILOUT_TO_CLIENT_SIDE_RENDERING'
04:47:01.056 }
04:47:01.059 [AuthProvider] useSearchParams not available, using empty: Error: Bail out to client-side rendering: useSearchParams()
04:47:01.059     at a (.next/server/chunks/6821.js:1:17081)
04:47:01.059     at d (.next/server/chunks/6821.js:1:33677)
04:47:01.059     at <unknown> (.next/server/chunks/1653.js:247:80510)
04:47:01.059     at d (.next/server/chunks/1653.js:247:80473) {
04:47:01.059   reason: 'useSearchParams()',
04:47:01.059   digest: 'BAILOUT_TO_CLIENT_SIDE_RENDERING'
04:47:01.059 }
04:47:01.059 [AuthProvider] useSearchParams not available, using empty: Error: Bail out to client-side rendering: useSearchParams()
04:47:01.059     at a (.next/server/chunks/6821.js:1:17081)
04:47:01.059     at d (.next/server/chunks/6821.js:1:33677)
04:47:01.059     at <unknown> (.next/server/chunks/1653.js:247:80510)
04:47:01.059     at d (.next/server/chunks/1653.js:247:80473) {
04:47:01.059   reason: 'useSearchParams()',
04:47:01.060   digest: 'BAILOUT_TO_CLIENT_SIDE_RENDERING'
04:47:01.060 }
04:47:01.060 [AuthProvider] useSearchParams not available, using empty: Error: Bail out to client-side rendering: useSearchParams()
04:47:01.060     at a (.next/server/chunks/6821.js:1:17081)
04:47:01.060     at d (.next/server/chunks/6821.js:1:33677)
04:47:01.060     at <unknown> (.next/server/chunks/1653.js:247:80510)
04:47:01.060     at d (.next/server/chunks/1653.js:247:80473) {
04:47:01.060   reason: 'useSearchParams()',
04:47:01.060   digest: 'BAILOUT_TO_CLIENT_SIDE_RENDERING'
04:47:01.060 }
04:47:01.060 [AuthProvider] useSearchParams not available, using empty: Error: Bail out to client-side rendering: useSearchParams()
04:47:01.060     at a (.next/server/chunks/6821.js:1:17081)
04:47:01.060     at d (.next/server/chunks/6821.js:1:33677)
04:47:01.060     at <unknown> (.next/server/chunks/1653.js:247:80510)
04:47:01.060     at d (.next/server/chunks/1653.js:247:80473) {
04:47:01.061   reason: 'useSearchParams()',
04:47:01.061   digest: 'BAILOUT_TO_CLIENT_SIDE_RENDERING'
04:47:01.061 }
04:47:01.061 [AuthProvider] useSearchParams not available, using empty: Error: Bail out to client-side rendering: useSearchParams()
04:47:01.062     at a (.next/server/chunks/6821.js:1:17081)
04:47:01.062     at d (.next/server/chunks/6821.js:1:33677)
04:47:01.062     at <unknown> (.next/server/chunks/1653.js:247:80510)
04:47:01.062     at d (.next/server/chunks/1653.js:247:80473) {
04:47:01.062   reason: 'useSearchParams()',
04:47:01.062   digest: 'BAILOUT_TO_CLIENT_SIDE_RENDERING'
04:47:01.066 }
04:47:01.069    Generating static pages (63/84) 
04:47:01.181 [RBAC] getRBACContext() called
04:47:01.181 [RBAC] No runtime context (missing env vars), returning null context
04:47:01.182 [requireAuth] No RBAC context found, throwing AuthRequiredError
04:47:01.370 [AuthProvider] useSearchParams not available, using empty: Error: Bail out to client-side rendering: useSearchParams()
04:47:01.381     at a (.next/server/chunks/6821.js:1:17081)
04:47:01.381     at d (.next/server/chunks/6821.js:1:33677)
04:47:01.381     at <unknown> (.next/server/chunks/1653.js:247:80510)
04:47:01.381     at d (.next/server/chunks/1653.js:247:80473) {
04:47:01.381   reason: 'useSearchParams()',
04:47:01.381   digest: 'BAILOUT_TO_CLIENT_SIDE_RENDERING'
04:47:01.381 }
04:47:01.381 [AuthProvider] useSearchParams not available, using empty: Error: Bail out to client-side rendering: useSearchParams()
04:47:01.381     at a (.next/server/chunks/6821.js:1:17081)
04:47:01.381     at d (.next/server/chunks/6821.js:1:33677)
04:47:01.381     at <unknown> (.next/server/chunks/1653.js:247:80510)
04:47:01.381     at d (.next/server/chunks/1653.js:247:80473) {
04:47:01.381   reason: 'useSearchParams()',
04:47:01.381   digest: 'BAILOUT_TO_CLIENT_SIDE_RENDERING'
04:47:01.381 }
04:47:01.381 [AuthProvider] useSearchParams not available, using empty: Error: Bail out to client-side rendering: useSearchParams()
04:47:01.381     at a (.next/server/chunks/6821.js:1:17081)
04:47:01.381     at d (.next/server/chunks/6821.js:1:33677)
04:47:01.381     at <unknown> (.next/server/chunks/1653.js:247:80510)
04:47:01.381     at d (.next/server/chunks/1653.js:247:80473) {
04:47:01.381   reason: 'useSearchParams()',
04:47:01.381   digest: 'BAILOUT_TO_CLIENT_SIDE_RENDERING'
04:47:01.381 }
04:47:01.381 [AuthProvider] useSearchParams not available, using empty: Error: Bail out to client-side rendering: useSearchParams()
04:47:01.381     at a (.next/server/chunks/6821.js:1:17081)
04:47:01.381     at d (.next/server/chunks/6821.js:1:33677)
04:47:01.381     at <unknown> (.next/server/chunks/1653.js:247:80510)
04:47:01.381     at d (.next/server/chunks/1653.js:247:80473) {
04:47:01.381   reason: 'useSearchParams()',
04:47:01.381   digest: 'BAILOUT_TO_CLIENT_SIDE_RENDERING'
04:47:01.381 }
04:47:01.382 [AuthProvider] useSearchParams not available, using empty: Error: Bail out to client-side rendering: useSearchParams()
04:47:01.382     at a (.next/server/chunks/6821.js:1:17081)
04:47:01.382     at d (.next/server/chunks/6821.js:1:33677)
04:47:01.382     at <unknown> (.next/server/chunks/1653.js:247:80510)
04:47:01.382     at d (.next/server/chunks/1653.js:247:80473) {
04:47:01.382   reason: 'useSearchParams()',
04:47:01.382   digest: 'BAILOUT_TO_CLIENT_SIDE_RENDERING'
04:47:01.382 }
04:47:01.382 [AuthProvider] useSearchParams not available, using empty: Error: Bail out to client-side rendering: useSearchParams()
04:47:01.382     at a (.next/server/chunks/6821.js:1:17081)
04:47:01.382     at d (.next/server/chunks/6821.js:1:33677)
04:47:01.382     at <unknown> (.next/server/chunks/1653.js:247:80510)
04:47:01.382     at d (.next/server/chunks/1653.js:247:80473) {
04:47:01.382   reason: 'useSearchParams()',
04:47:01.382   digest: 'BAILOUT_TO_CLIENT_SIDE_RENDERING'
04:47:01.382 }
04:47:01.382 [AuthProvider] useSearchParams not available, using empty: Error: Bail out to client-side rendering: useSearchParams()
04:47:01.382     at a (.next/server/chunks/6821.js:1:17081)
04:47:01.382     at d (.next/server/chunks/6821.js:1:33677)
04:47:01.382     at <unknown> (.next/server/chunks/1653.js:247:80510)
04:47:01.382     at d (.next/server/chunks/1653.js:247:80473) {
04:47:01.382   reason: 'useSearchParams()',
04:47:01.382   digest: 'BAILOUT_TO_CLIENT_SIDE_RENDERING'
04:47:01.382 }
04:47:01.508 [AuthProvider] useSearchParams not available, using empty: Error: Bail out to client-side rendering: useSearchParams()
04:47:01.509     at a (.next/server/chunks/6821.js:1:17081)
04:47:01.509     at d (.next/server/chunks/6821.js:1:33677)
04:47:01.509     at <unknown> (.next/server/chunks/1653.js:247:80510)
04:47:01.509     at d (.next/server/chunks/1653.js:247:80473) {
04:47:01.509   reason: 'useSearchParams()',
04:47:01.509   digest: 'BAILOUT_TO_CLIENT_SIDE_RENDERING'
04:47:01.509 }
04:47:01.509 [AuthProvider] useSearchParams not available, using empty: Error: Bail out to client-side rendering: useSearchParams()
04:47:01.509     at a (.next/server/chunks/6821.js:1:17081)
04:47:01.509     at d (.next/server/chunks/6821.js:1:33677)
04:47:01.509     at <unknown> (.next/server/chunks/1653.js:247:80510)
04:47:01.509     at d (.next/server/chunks/1653.js:247:80473) {
04:47:01.509   reason: 'useSearchParams()',
04:47:01.509   digest: 'BAILOUT_TO_CLIENT_SIDE_RENDERING'
04:47:01.509 }
04:47:01.509 [AuthProvider] useSearchParams not available, using empty: Error: Bail out to client-side rendering: useSearchParams()
04:47:01.509     at a (.next/server/chunks/6821.js:1:17081)
04:47:01.509     at d (.next/server/chunks/6821.js:1:33677)
04:47:01.509     at <unknown> (.next/server/chunks/1653.js:247:80510)
04:47:01.509     at d (.next/server/chunks/1653.js:247:80473) {
04:47:01.509   reason: 'useSearchParams()',
04:47:01.510   digest: 'BAILOUT_TO_CLIENT_SIDE_RENDERING'
04:47:01.510 }
04:47:01.510 [AuthProvider] useSearchParams not available, using empty: Error: Bail out to client-side rendering: useSearchParams()
04:47:01.510     at a (.next/server/chunks/6821.js:1:17081)
04:47:01.510     at d (.next/server/chunks/6821.js:1:33677)
04:47:01.510     at <unknown> (.next/server/chunks/1653.js:247:80510)
04:47:01.510     at d (.next/server/chunks/1653.js:247:80473) {
04:47:01.510   reason: 'useSearchParams()',
04:47:01.510   digest: 'BAILOUT_TO_CLIENT_SIDE_RENDERING'
04:47:01.510 }
04:47:01.511  ✓ Generating static pages (84/84)
04:47:03.395    Finalizing page optimization ...
04:47:03.395    Collecting build traces ...
04:47:23.655 
04:47:23.675 Route (app)                                              Size     First Load JS
04:47:23.676 ┌ ○ /                                                    48.1 kB         264 kB
04:47:23.677 ├ ○ /_not-found                                          722 B           107 kB
04:47:23.677 ├ ƒ /about                                               203 B           110 kB
04:47:23.677 ├ ƒ /admin/approvals                                     5.13 kB         189 kB
04:47:23.677 ├ ○ /admin/contracts                                     6.18 kB         195 kB
04:47:23.677 ├ ƒ /admin/contracts/[id]                                7.38 kB         122 kB
04:47:23.677 ├ ○ /admin/coupons                                       4.47 kB         111 kB
04:47:23.677 ├ ƒ /admin/customers                                     2.24 kB         130 kB
04:47:23.677 ├ ƒ /admin/customers/documents                           203 B           110 kB
04:47:23.678 ├ ○ /admin/customers/management                          22.6 kB         184 kB
04:47:23.678 ├ ƒ /admin/customers/orders                              2.24 kB         130 kB
04:47:23.678 ├ ƒ /admin/customers/orders/[id]                         210 B           128 kB
04:47:23.678 ├ ƒ /admin/customers/profile                             351 B           106 kB
04:47:23.678 ├ ƒ /admin/customers/support                             203 B           110 kB
04:47:23.678 ├ ƒ /admin/dashboard                                     118 kB          360 kB
04:47:23.679 ├ ○ /admin/notifications                                 4.66 kB         111 kB
04:47:23.679 ├ ƒ /admin/orders                                        8.67 kB         183 kB
04:47:23.679 ├ ƒ /admin/orders/[id]                                   20.8 kB         331 kB
04:47:23.679 ├ ƒ /admin/orders/[id]/correction-upload                 7.91 kB         122 kB
04:47:23.679 ├ ƒ /admin/orders/[id]/payment-confirmation              8.96 kB         172 kB
04:47:23.679 ├ ƒ /admin/production/[id]                               5.6 kB          190 kB
04:47:23.679 ├ ƒ /admin/quotations                                    9.65 kB         252 kB
04:47:23.680 ├ ○ /admin/settings                                      9.43 kB         162 kB
04:47:23.680 ├ ○ /admin/settings/customers                            2.81 kB         109 kB
04:47:23.680 ├ ○ /admin/shipments                                     14.5 kB         132 kB
04:47:23.680 ├ ƒ /admin/shipments/[id]                                6.06 kB         170 kB
04:47:23.680 ├ ○ /admin/shipping                                      5.03 kB         244 kB
04:47:23.680 ├ ƒ /api/admin/approve-member                            722 B           107 kB
04:47:23.680 ├ ƒ /api/admin/contracts/[contractId]/download           722 B           107 kB
04:47:23.681 ├ ƒ /api/admin/contracts/[contractId]/send-signature     722 B           107 kB
04:47:23.681 ├ ƒ /api/admin/contracts/request-signature               722 B           107 kB
04:47:23.681 ├ ƒ /api/admin/contracts/send-reminder                   722 B           107 kB
04:47:23.681 ├ ƒ /api/admin/contracts/workflow                        722 B           107 kB
04:47:23.681 ├ ƒ /api/admin/convert-to-order                          722 B           107 kB
04:47:23.681 ├ ƒ /api/admin/coupons                                   722 B           107 kB
04:47:23.681 ├ ƒ /api/admin/coupons/%5Bid%5D                          722 B           107 kB
04:47:23.681 ├ ƒ /api/admin/customers/[id]                            722 B           107 kB
04:47:23.681 ├ ƒ /api/admin/customers/[id]/contact-history            722 B           107 kB
04:47:23.681 ├ ƒ /api/admin/customers/management                      722 B           107 kB
04:47:23.681 ├ ƒ /api/admin/customers/management/export               722 B           107 kB
04:47:23.681 ├ ƒ /api/admin/dashboard/statistics                      722 B           107 kB
04:47:23.681 ├ ƒ /api/admin/dashboard/unified-stats                   722 B           107 kB
04:47:23.681 ├ ƒ /api/admin/delivery/tracking/[orderId]               722 B           107 kB
04:47:23.681 ├ ƒ /api/admin/email/send                                722 B           107 kB
04:47:23.681 ├ ƒ /api/admin/generate-work-order                       722 B           107 kB
04:47:23.681 ├ ƒ /api/admin/inventory/adjust                          722 B           107 kB
04:47:23.681 ├ ƒ /api/admin/inventory/history/[productId]             722 B           107 kB
04:47:23.681 ├ ƒ /api/admin/inventory/items                           722 B           107 kB
04:47:23.681 ├ ƒ /api/admin/inventory/receipts                        722 B           107 kB
04:47:23.682 ├ ƒ /api/admin/inventory/record-entry                    722 B           107 kB
04:47:23.682 ├ ƒ /api/admin/inventory/update                          722 B           107 kB
04:47:23.682 ├ ƒ /api/admin/notifications                             722 B           107 kB
04:47:23.682 ├ ƒ /api/admin/notifications/[id]                        722 B           107 kB
04:47:23.682 ├ ƒ /api/admin/notifications/[id]/read                   722 B           107 kB
04:47:23.682 ├ ƒ /api/admin/notifications/create                      722 B           107 kB
04:47:23.682 ├ ƒ /api/admin/notifications/unread-count                722 B           107 kB
04:47:23.682 ├ ƒ /api/admin/orders                                    722 B           107 kB
04:47:23.682 ├ ƒ /api/admin/orders/[id]/apply-discount                722 B           107 kB
04:47:23.682 ├ ƒ /api/admin/orders/[id]/billing-address               722 B           107 kB
04:47:23.682 ├ ƒ /api/admin/orders/[id]/cancellation                  722 B           107 kB
04:47:23.684 ├ ƒ /api/admin/orders/[id]/comments                      722 B           107 kB
04:47:23.684 ├ ƒ /api/admin/orders/[id]/correction                    722 B           107 kB
04:47:23.684 ├ ƒ /api/admin/orders/[id]/correction/[revisionId]       722 B           107 kB
04:47:23.684 ├ ƒ /api/admin/orders/[id]/data-receipt                  722 B           107 kB
04:47:23.684 ├ ƒ /api/admin/orders/[id]/delivery-address              722 B           107 kB
04:47:23.690 ├ ƒ /api/admin/orders/[id]/delivery-note                 722 B           107 kB
04:47:23.690 ├ ƒ /api/admin/orders/[id]/files/[fileId]/download       722 B           107 kB
04:47:23.690 ├ ƒ /api/admin/orders/[id]/items                         722 B           107 kB
04:47:23.690 ├ ƒ /api/admin/orders/[id]/korea-send-status             722 B           107 kB
04:47:23.690 ├ ƒ /api/admin/orders/[id]/notes                         722 B           107 kB
04:47:23.690 ├ ƒ /api/admin/orders/[id]/payment-confirmation          722 B           107 kB
04:47:23.690 ├ ƒ /api/admin/orders/[id]/send-to-korea                 722 B           107 kB
04:47:23.691 ├ ƒ /api/admin/orders/[id]/shipping-info                 722 B           107 kB
04:47:23.691 ├ ƒ /api/admin/orders/[id]/specification-change          722 B           107 kB
04:47:23.691 ├ ƒ /api/admin/orders/[id]/start-production              722 B           107 kB
04:47:23.691 ├ ƒ /api/admin/orders/[id]/status                        722 B           107 kB
04:47:23.692 ├ ƒ /api/admin/orders/[id]/status-history                722 B           107 kB
04:47:23.692 ├ ƒ /api/admin/orders/bulk-status                        722 B           107 kB
04:47:23.692 ├ ƒ /api/admin/orders/statistics                         722 B           107 kB
04:47:23.694 ├ ƒ /api/admin/performance/metrics                       722 B           107 kB
04:47:23.694 ├ ƒ /api/admin/production-jobs/[id]                      722 B           107 kB
04:47:23.694 ├ ƒ /api/admin/production/[orderId]                      722 B           107 kB
04:47:23.696 ├ ƒ /api/admin/production/jobs                           722 B           107 kB
04:47:23.696 ├ ƒ /api/admin/production/jobs/[id]                      722 B           107 kB
04:47:23.696 ├ ƒ /api/admin/production/update-status                  722 B           107 kB
04:47:23.696 ├ ƒ /api/admin/quotations                                722 B           107 kB
04:47:23.697 ├ ƒ /api/admin/quotations/[id]                           722 B           107 kB
04:47:23.697 ├ ƒ /api/admin/quotations/[id]/cost-breakdown            722 B           107 kB
04:47:23.697 ├ ƒ /api/admin/quotations/[id]/export                    722 B           107 kB
04:47:23.697 ├ ƒ /api/admin/settings                                  722 B           107 kB
04:47:23.697 ├ ƒ /api/admin/settings/%5Bkey%5D                        722 B           107 kB
04:47:23.698 ├ ƒ /api/admin/settings/cache/invalidate                 722 B           107 kB
04:47:23.698 ├ ƒ /api/admin/settings/customer-markup                  722 B           107 kB
04:47:23.698 ├ ƒ /api/admin/settings/customer-markup/%5Bid%5D         722 B           107 kB
04:47:23.698 ├ ƒ /api/admin/settings/designer-emails                  722 B           107 kB
04:47:23.698 ├ ƒ /api/admin/shipments/[id]/tracking                   722 B           107 kB
04:47:23.698 ├ ƒ /api/admin/shipping/deliveries/complete              722 B           107 kB
04:47:23.698 ├ ƒ /api/admin/shipping/shipments                        722 B           107 kB
04:47:23.698 ├ ƒ /api/admin/shipping/tracking                         722 B           107 kB
04:47:23.698 ├ ƒ /api/admin/shipping/tracking/[id]                    722 B           107 kB
04:47:23.698 ├ ƒ /api/admin/test-email                                722 B           107 kB
04:47:23.698 ├ ƒ /api/admin/users                                     722 B           107 kB
04:47:23.698 ├ ƒ /api/admin/users/[id]/addresses                      722 B           107 kB
04:47:23.698 ├ ƒ /api/admin/users/[id]/approve                        722 B           107 kB
04:47:23.698 ├ ƒ /api/admin/users/approve                             722 B           107 kB
04:47:23.698 ├ ƒ /api/admin/users/pending                             722 B           107 kB
04:47:23.698 ├ ƒ /api/admin/users/reject                              722 B           107 kB
04:47:23.698 ├ ƒ /api/ai-parser/approve                               722 B           107 kB
04:47:23.698 ├ ƒ /api/ai-parser/extract                               722 B           107 kB
04:47:23.698 ├ ƒ /api/ai-parser/reprocess                             722 B           107 kB
04:47:23.698 ├ ƒ /api/ai-parser/upload                                722 B           107 kB
04:47:23.698 ├ ƒ /api/ai-parser/validate                              722 B           107 kB
04:47:23.698 ├ ƒ /api/ai/parse                                        722 B           107 kB
04:47:23.698 ├ ƒ /api/ai/review                                       722 B           107 kB
04:47:23.698 ├ ƒ /api/ai/specs                                        722 B           107 kB
04:47:23.698 ├ ƒ /api/analytics/vitals                                722 B           107 kB
04:47:23.699 ├ ƒ /api/auth/current-user                               722 B           107 kB
04:47:23.699 ├ ƒ /api/auth/forgot-password                            722 B           107 kB
04:47:23.699 ├ ƒ /api/auth/register                                   722 B           107 kB
04:47:23.699 ├ ƒ /api/auth/register/create-profile                    722 B           107 kB
04:47:23.699 ├ ƒ /api/auth/reset-password                             722 B           107 kB
04:47:23.699 ├ ƒ /api/auth/session                                    722 B           107 kB
04:47:23.699 ├ ƒ /api/auth/signin                                     722 B           107 kB
04:47:23.699 ├ ƒ /api/auth/signout                                    722 B           107 kB
04:47:23.699 ├ ƒ /api/auth/verify-email                               722 B           107 kB
04:47:23.699 ├ ƒ /api/b2b/ai-extraction/upload                        722 B           107 kB
04:47:23.699 ├ ƒ /api/b2b/files/upload                                722 B           107 kB
04:47:23.699 ├ ƒ /api/comparison/save                                 722 B           107 kB
04:47:23.699 ├ ƒ /api/contact                                         722 B           107 kB
04:47:23.699 ├ ƒ /api/contract/pdf                                    722 B           107 kB
04:47:23.699 ├ ƒ /api/contract/timestamp                              722 B           107 kB
04:47:23.699 ├ ƒ /api/contract/timestamp/validate                     722 B           107 kB
04:47:23.699 ├ ƒ /api/contract/workflow/action                        722 B           107 kB
04:47:23.699 ├ ƒ /api/contracts                                       722 B           107 kB
04:47:23.699 ├ ƒ /api/coupons/validate                                722 B           107 kB
04:47:23.699 ├ ƒ /api/cron/archive-orders                             722 B           107 kB
04:47:23.699 ├ ƒ /api/debug/auth                                      722 B           107 kB
04:47:23.700 ├ ƒ /api/dev/apply-migration                             722 B           107 kB
04:47:23.700 ├ ƒ /api/dev/set-admin                                   722 B           107 kB
04:47:23.700 ├ ● /api/download/templates/[category]                   722 B           107 kB
04:47:23.700 ├   ├ /api/download/templates/flat_3_side
04:47:23.700 ├   ├ /api/download/templates/stand_up
04:47:23.700 ├   ├ /api/download/templates/box
04:47:23.701 ├   └ [+4 more paths]
04:47:23.701 ├ ƒ /api/download/templates/excel                        722 B           107 kB
04:47:23.701 ├ ƒ /api/download/templates/pdf                          722 B           107 kB
04:47:23.701 ├ ƒ /api/errors/log                                      722 B           107 kB
04:47:23.701 ├ ƒ /api/files/validate                                  722 B           107 kB
04:47:23.701 ├ ƒ /api/member/addresses/billing                        722 B           107 kB
04:47:23.701 ├ ƒ /api/member/addresses/billing/[id]                   722 B           107 kB
04:47:23.701 ├ ƒ /api/member/addresses/delivery                       722 B           107 kB
04:47:23.701 ├ ƒ /api/member/addresses/delivery/[id]                  722 B           107 kB
04:47:23.701 ├ ƒ /api/member/ai-extraction/approve                    722 B           107 kB
04:47:23.701 ├ ƒ /api/member/ai-extraction/status                     722 B           107 kB
04:47:23.701 ├ ƒ /api/member/ai-extraction/upload                     722 B           107 kB
04:47:23.701 ├ ƒ /api/member/auth/resend-verification                 722 B           107 kB
04:47:23.701 ├ ƒ /api/member/auth/verify-email                        722 B           107 kB
04:47:23.701 ├ ƒ /api/member/certificates/generate                    722 B           107 kB
04:47:23.701 ├ ƒ /api/member/dashboard                                722 B           107 kB
04:47:23.701 ├ ƒ /api/member/dashboard/stats                          722 B           107 kB
04:47:23.701 ├ ƒ /api/member/dashboard/unified-stats                  722 B           107 kB
04:47:23.701 ├ ƒ /api/member/delete-account                           722 B           107 kB
04:47:23.701 ├ ƒ /api/member/documents                                722 B           107 kB
04:47:23.701 ├ ƒ /api/member/documents/[id]/download                  722 B           107 kB
04:47:23.701 ├ ƒ /api/member/documents/history                        722 B           107 kB
04:47:23.701 ├ ƒ /api/member/files/[id]/extract                       722 B           107 kB
04:47:23.701 ├ ƒ /api/member/files/upload                             722 B           107 kB
04:47:23.701 ├ ƒ /api/member/hanko/upload                             722 B           107 kB
04:47:23.701 ├ ƒ /api/member/inquiries                                722 B           107 kB
04:47:23.701 ├ ƒ /api/member/invites/accept                           722 B           107 kB
04:47:23.701 ├ ƒ /api/member/invites/send                             722 B           107 kB
04:47:23.701 ├ ƒ /api/member/invoices                                 722 B           107 kB
04:47:23.701 ├ ƒ /api/member/invoices/[invoiceId]/download            722 B           107 kB
04:47:23.701 ├ ƒ /api/member/korea/corrections                        722 B           107 kB
04:47:23.701 ├ ƒ /api/member/korea/corrections/[id]/upload            722 B           107 kB
04:47:23.701 ├ ƒ /api/member/korea/send-data                          722 B           107 kB
04:47:23.701 ├ ƒ /api/member/notifications                            722 B           107 kB
04:47:23.701 ├ ƒ /api/member/notifications/[id]                       722 B           107 kB
04:47:23.701 ├ ƒ /api/member/notifications/[id]/read                  722 B           107 kB
04:47:23.701 ├ ƒ /api/member/notifications/delete-all                 722 B           107 kB
04:47:23.701 ├ ƒ /api/member/notifications/mark-all-read              722 B           107 kB
04:47:23.702 ├ ƒ /api/member/orders                                   722 B           107 kB
04:47:23.702 ├ ƒ /api/member/orders/[id]                              722 B           107 kB
04:47:23.702 ├ ƒ /api/member/orders/[id]/apply-coupon                 722 B           107 kB
04:47:23.702 ├ ƒ /api/member/orders/[id]/approvals                    722 B           107 kB
04:47:23.702 ├ ƒ /api/member/orders/[id]/approvals/[requestId]        722 B           107 kB
04:47:23.702 ├ ƒ /api/member/orders/[id]/approve-modification         722 B           107 kB
04:47:23.703 ├ ƒ /api/member/orders/[id]/billing-address              722 B           107 kB
04:47:23.703 ├ ƒ /api/member/orders/[id]/comments                     722 B           107 kB
04:47:23.703 ├ ƒ /api/member/orders/[id]/comments/[commentId]         722 B           107 kB
04:47:23.703 ├ ƒ /api/member/orders/[id]/data-receipt                 722 B           107 kB
04:47:23.703 ├ ƒ /api/member/orders/[id]/data-receipt/files/[fileId]  722 B           107 kB
04:47:23.703 ├ ƒ /api/member/orders/[id]/delivery-address             722 B           107 kB
04:47:23.703 ├ ƒ /api/member/orders/[id]/design-revisions             722 B           107 kB
04:47:23.703 ├ ƒ /api/member/orders/[id]/production-data              722 B           107 kB
04:47:23.703 ├ ƒ /api/member/orders/[id]/production-logs              722 B           107 kB
04:47:23.703 ├ ƒ /api/member/orders/[id]/request-cancellation         722 B           107 kB
04:47:23.703 ├ ƒ /api/member/orders/[id]/spec-approval                722 B           107 kB
04:47:23.703 ├ ƒ /api/member/orders/[id]/specification-change         722 B           107 kB
04:47:23.703 ├ ƒ /api/member/orders/[id]/status-history               722 B           107 kB
04:47:23.703 ├ ƒ /api/member/orders/[id]/tracking                     722 B           107 kB
04:47:23.703 ├ ƒ /api/member/orders/confirm                           722 B           107 kB
04:47:23.703 ├ ƒ /api/member/quotations                               722 B           107 kB
04:47:23.703 ├ ƒ /api/member/quotations/[id]                          722 B           107 kB
04:47:23.703 ├ ƒ /api/member/quotations/[id]/approve                  722 B           107 kB
04:47:23.703 ├ ƒ /api/member/quotations/[id]/confirm-payment          722 B           107 kB
04:47:23.704 ├ ƒ /api/member/quotations/[id]/convert                  722 B           107 kB
04:47:23.704 ├ ƒ /api/member/quotations/[id]/export                   722 B           107 kB
04:47:23.704 ├ ƒ /api/member/quotations/[id]/invoice                  722 B           107 kB
04:47:23.705 ├ ƒ /api/member/quotations/[id]/save-pdf                 722 B           107 kB
04:47:23.705 ├ ƒ /api/member/samples                                  722 B           107 kB
04:47:23.706 ├ ƒ /api/member/settings                                 722 B           107 kB
04:47:23.706 ├ ƒ /api/member/shipments                                722 B           107 kB
04:47:23.706 ├ ƒ /api/member/spec-sheets/[id]/approve                 722 B           107 kB
04:47:23.706 ├ ƒ /api/member/spec-sheets/[id]/reject                  722 B           107 kB
04:47:23.706 ├ ƒ /api/member/spec-sheets/generate                     722 B           107 kB
04:47:23.706 ├ ƒ /api/member/status                                   722 B           107 kB
04:47:23.706 ├ ƒ /api/member/stock-in                                 722 B           107 kB
04:47:23.706 ├ ƒ /api/member/work-orders                              722 B           107 kB
04:47:23.706 ├ ƒ /api/notes                                           722 B           107 kB
04:47:23.706 ├ ƒ /api/notes/[id]                                      722 B           107 kB
04:47:23.706 ├ ƒ /api/notifications                                   722 B           107 kB
04:47:23.706 ├ ƒ /api/notifications/[id]                              722 B           107 kB
04:47:23.706 ├ ƒ /api/notifications/[id]/read                         722 B           107 kB
04:47:23.706 ├ ƒ /api/notifications/mark-all-read                     722 B           107 kB
04:47:23.706 ├ ƒ /api/notifications/unread-count                      722 B           107 kB
04:47:23.706 ├ ƒ /api/orders                                          722 B           107 kB
04:47:23.706 ├ ƒ /api/orders/[id]                                     722 B           107 kB
04:47:23.706 ├ ƒ /api/orders/[id]/cancel                              722 B           107 kB
04:47:23.706 ├ ƒ /api/orders/[id]/status                              722 B           107 kB
04:47:23.706 ├ ƒ /api/orders/cancel                                   722 B           107 kB
04:47:23.706 ├ ƒ /api/orders/create                                   722 B           107 kB
04:47:23.706 ├ ƒ /api/orders/receive                                  722 B           107 kB
04:47:23.706 ├ ƒ /api/orders/reorder                                  722 B           107 kB
04:47:23.706 ├ ƒ /api/orders/update                                   722 B           107 kB
04:47:23.706 ├ ƒ /api/payments/confirm                                722 B           107 kB
04:47:23.706 ├ ƒ /api/premium-content/download                        722 B           107 kB
04:47:23.706 ├ ƒ /api/products                                        722 B           107 kB
04:47:23.706 ├ ƒ /api/products/categories                             722 B           107 kB
04:47:23.706 ├ ƒ /api/products/filter                                 722 B           107 kB
04:47:23.706 ├ ƒ /api/products/search                                 722 B           107 kB
04:47:23.707 ├ ƒ /api/profile                                         722 B           107 kB
04:47:23.707 ├ ƒ /api/profile/[id]                                    722 B           107 kB
04:47:23.707 ├ ƒ /api/quotation                                       722 B           107 kB
04:47:23.707 ├ ƒ /api/quotation/pdf                                   722 B           107 kB
04:47:23.707 ├ ƒ /api/quotations/guest-save                           722 B           107 kB
04:47:23.707 ├ ƒ /api/quotations/save                                 722 B           107 kB
04:47:23.707 ├ ƒ /api/quotes/excel                                    722 B           107 kB
04:47:23.707 ├ ƒ /api/quotes/pdf                                      722 B           107 kB
04:47:23.707 ├ ƒ /api/quotitions/[id]/confirm-transfer                722 B           107 kB
04:47:23.707 ├ ƒ /api/registry/corporate-number                       722 B           107 kB
04:47:23.707 ├ ƒ /api/registry/postal-code                            722 B           107 kB
04:47:23.707 ├ ƒ /api/revalidate                                      722 B           107 kB
04:47:23.707 ├ ƒ /api/samples                                         722 B           107 kB
04:47:23.707 ├ ƒ /api/samples/request                                 722 B           107 kB
04:47:23.707 ├ ƒ /api/settings                                        722 B           107 kB
04:47:23.707 ├ ƒ /api/shipments                                       722 B           107 kB
04:47:23.707 ├ ƒ /api/shipments/[id]                                  722 B           107 kB
04:47:23.707 ├ ƒ /api/shipments/[id]/[trackingId]/update-tracking     722 B           107 kB
04:47:23.707 ├ ƒ /api/shipments/[id]/label                            722 B           107 kB
04:47:23.707 ├ ƒ /api/shipments/[id]/schedule-pickup                  722 B           107 kB
04:47:23.707 ├ ƒ /api/shipments/[id]/track                            722 B           107 kB
04:47:23.707 ├ ƒ /api/shipments/bulk-create                           722 B           107 kB
04:47:23.707 ├ ƒ /api/shipments/create                                722 B           107 kB
04:47:23.709 ├ ƒ /api/shipments/tracking                              722 B           107 kB
04:47:23.709 ├ ƒ /api/signature/cancel                                722 B           107 kB
04:47:23.709 ├ ƒ /api/signature/local/save                            722 B           107 kB
04:47:23.709 ├ ƒ /api/signature/send                                  722 B           107 kB
04:47:23.709 ├ ƒ /api/signature/status/[id]                           722 B           107 kB
04:47:23.709 ├ ƒ /api/signature/webhook                               722 B           107 kB
04:47:23.709 ├ ƒ /api/specsheet/approval                              722 B           107 kB
04:47:23.709 ├ ƒ /api/specsheet/pdf                                   722 B           107 kB
04:47:23.709 ├ ƒ /api/specsheet/versions                              722 B           107 kB
04:47:23.709 ├ ƒ /api/supabase-mcp/execute                            722 B           107 kB
04:47:23.709 ├ ƒ /api/templates                                       722 B           107 kB
04:47:23.709 ├ ƒ /archives                                            8.45 kB         175 kB
04:47:23.709 ├ ƒ /auth/error                                          203 B           110 kB
04:47:23.709 ├ ƒ /auth/forgot-password                                2.99 kB         216 kB
04:47:23.709 ├ ƒ /auth/pending                                        2.68 kB         162 kB
04:47:23.709 ├ ○ /auth/register                                       1.73 kB         221 kB
04:47:23.709 ├ ○ /auth/reset-password                                 3.38 kB         216 kB
04:47:23.709 ├ ○ /auth/signin                                         4.37 kB         217 kB
04:47:23.709 ├ ƒ /auth/signin/form-post                               722 B           107 kB
04:47:23.709 ├ ○ /auth/signout                                        1.48 kB         160 kB
04:47:23.709 ├ ○ /auth/suspended                                      203 B           110 kB
04:47:23.709 ├ ○ /cart                                                7.99 kB         171 kB
04:47:23.709 ├ ○ /catalog                                             15 kB           185 kB
04:47:23.709 ├ ● /catalog/[slug]                                      8.15 kB         194 kB
04:47:23.709 ├   ├ /catalog/three-seal-001
04:47:23.709 ├   ├ /catalog/stand-pouch-001
04:47:23.709 ├   ├ /catalog/box-pouch-001
04:47:23.709 ├   └ [+3 more paths]
04:47:23.709 ├ ○ /compare                                             8.51 kB         168 kB
04:47:23.709 ├ ○ /compare/shared                                      722 B           107 kB
04:47:23.709 ├ ○ /contact                                             7.37 kB         148 kB
04:47:23.709 ├ ○ /contact/thank-you                                   203 B           110 kB
04:47:23.709 ├ ○ /csr                                                 722 B           107 kB
04:47:23.709 ├ ○ /data-templates                                      5.63 kB         181 kB
04:47:23.709 ├ ○ /design-system                                       7.42 kB         192 kB
04:47:23.709 ├ ○ /flow                                                3.02 kB         178 kB
04:47:23.709 ├ ○ /guide                                               684 B           157 kB
04:47:23.710 ├ ○ /guide/color                                         1.9 kB          108 kB
04:47:23.710 ├ ○ /guide/environmentaldisplay                          1.9 kB          108 kB
04:47:23.710 ├ ○ /guide/image                                         1.9 kB          108 kB
04:47:23.710 ├ ○ /guide/shirohan                                      1.9 kB          108 kB
04:47:23.710 ├ ○ /guide/size                                          1.9 kB          108 kB
04:47:23.710 ├ ƒ /industry/cosmetics                                  4.33 kB         147 kB
04:47:23.710 ├ ƒ /industry/electronics                                4.58 kB         147 kB
04:47:23.710 ├ ƒ /industry/food-manufacturing                         3.29 kB         146 kB
04:47:23.710 ├ ƒ /industry/pharmaceutical                             4.79 kB         147 kB
04:47:23.710 ├ ○ /inquiry/detailed                                    15.9 kB         198 kB
04:47:23.710 ├ ○ /legal                                               722 B           107 kB
04:47:23.710 ├ ○ /member/billing-addresses                            3.76 kB         190 kB
04:47:23.710 ├ ○ /member/contracts                                    6.05 kB         190 kB
04:47:23.711 ├ ƒ /member/dashboard                                    8.65 kB         273 kB
04:47:23.711 ├ ○ /member/deliveries                                   5.48 kB         190 kB
04:47:23.711 ├ ○ /member/edit                                         5.2 kB          242 kB
04:47:23.711 ├ ○ /member/inquiries                                    4.07 kB         252 kB
04:47:23.711 ├ ○ /member/invoices                                     4.07 kB         252 kB
04:47:23.711 ├ ○ /member/notifications                                4.92 kB         249 kB
04:47:23.711 ├ ƒ /member/orders                                       5.39 kB         276 kB
04:47:23.711 ├ ƒ /member/orders/[id]                                  3.2 kB          291 kB
04:47:23.711 ├ ƒ /member/orders/[id]/confirmation                     5.67 kB         120 kB
04:47:23.711 ├ ƒ /member/orders/[id]/data-receipt                     9.37 kB         124 kB
04:47:23.711 ├ ƒ /member/orders/[id]/preparation                      5.43 kB         190 kB
04:47:23.711 ├ ƒ /member/orders/[id]/spec-approval                    4.66 kB         123 kB
04:47:23.712 ├ ○ /member/orders/history                               587 B           107 kB
04:47:23.712 ├ ○ /member/orders/new                                   722 B           107 kB
04:47:23.712 ├ ○ /member/orders/reorder                               722 B           107 kB
04:47:23.712 ├ ○ /member/profile                                      5.5 kB          256 kB
04:47:23.712 ├ ○ /member/quotations                                   13.8 kB         488 kB
04:47:23.712 ├ ƒ /member/quotations/[id]                              53.8 kB         564 kB
04:47:23.712 ├ ƒ /member/quotations/[id]/confirm                      8.28 kB         148 kB
04:47:23.712 ├ ○ /member/quotations/request                           12.5 kB         246 kB
04:47:23.712 ├ ○ /member/samples                                      3.79 kB         188 kB
04:47:23.712 ├ ○ /member/settings                                     5.6 kB          243 kB
04:47:23.712 ├ ○ /members                                             6.79 kB         178 kB
04:47:23.712 ├ ƒ /news                                                8.04 kB         168 kB
04:47:23.712 ├ ○ /premium-content                                     6.85 kB         188 kB
04:47:23.712 ├ ○ /pricing                                             513 B           107 kB
04:47:23.712 ├ ○ /print                                               216 B           175 kB
04:47:23.712 ├ ○ /privacy                                             722 B           107 kB
04:47:23.712 ├ ○ /profile                                             8.31 kB         175 kB
04:47:23.712 ├ ○ /quote-simulator                                     5.4 kB          211 kB
04:47:23.712 ├ ○ /robots.txt                                          0 B                0 B
04:47:23.712 ├ ○ /samples                                             12.7 kB         203 kB
04:47:23.712 ├ ○ /samples/thank-you                                   203 B           110 kB
04:47:23.712 ├ ○ /service                                             5.83 kB         166 kB
04:47:23.712 ├ ○ /sitemap.xml                                         0 B                0 B
04:47:23.712 └ ○ /terms                                               722 B           107 kB
04:47:23.712 + First Load JS shared by all                            106 kB
04:47:23.712   ├ chunks/1517-c2153894501a72e4.js                      50.7 kB
04:47:23.712   ├ chunks/4bd1b696-2ed65f1fcfc9c19e.js                  53 kB
04:47:23.712   └ other shared chunks (total)                          2.37 kB
04:47:23.712 
04:47:23.712 
04:47:23.712 ƒ Middleware                                             79.1 kB
04:47:23.726 
04:47:23.726 ○  (Static)   prerendered as static content
04:47:23.726 ●  (SSG)      prerendered as static HTML (uses generateStaticParams)
04:47:23.726 ƒ  (Dynamic)  server-rendered on demand
04:47:23.726 
04:47:24.356 Traced Next.js server files in: 150.193ms
04:47:25.851 Created all serverless functions in: 1.495s
04:47:26.094 Collected static files (public/, static/, .next/static): 74.68ms
04:47:26.744 Build Completed in /vercel/output [3m]
04:47:27.364 Error: Vulnerable version of Next.js detected, please update immediately. Learn More: https://vercel.link/CVE-2025-66478