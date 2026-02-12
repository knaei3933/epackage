04:56:23.447 Running build in Washington, D.C., USA (East) – iad1
04:56:23.448 Build machine configuration: 2 cores, 8 GB
04:56:23.561 Cloning github.com/knaei3933/epackage (Branch: main, Commit: 0aeb93e)
04:56:23.563 Previous build caches not available.
04:56:35.053 Cloning completed: 11.492s
04:56:35.793 Running "vercel build"
04:56:36.399 Vercel CLI 50.15.1
04:56:37.010 Running "install" command: `npm install`...
04:56:41.174 npm warn deprecated scmp@2.1.0: Just use Node.js's crypto.timingSafeEqual()
04:56:41.215 npm warn deprecated rimraf@2.7.1: Rimraf versions prior to v4 are no longer supported
04:56:42.272 npm warn deprecated lodash.isequal@4.5.0: This package is deprecated. Use require('node:util').isDeepStrictEqual instead.
04:56:42.910 npm warn deprecated inflight@1.0.6: This module is not supported, and leaks memory. Do not use it. Check out lru-cache if you want a good and tested way to coalesce async requests by a key value, which is much more comprehensive and powerful.
04:56:43.897 npm warn deprecated node-domexception@1.0.0: Use your platform's native DOMException instead
04:56:44.177 npm warn deprecated fstream@1.0.12: This package is no longer supported.
04:56:45.435 npm warn deprecated @supabase/auth-helpers-shared@0.7.0: This package is now deprecated - please use the @supabase/ssr package instead.
04:56:46.345 npm warn deprecated @supabase/auth-helpers-nextjs@0.10.0: This package is now deprecated - please use the @supabase/ssr package instead.
04:56:48.297 npm warn deprecated glob@7.2.3: Glob versions prior to v9 are no longer supported
04:56:48.562 npm warn deprecated glob@7.2.3: Glob versions prior to v9 are no longer supported
04:56:48.642 npm warn deprecated glob@7.2.3: Glob versions prior to v9 are no longer supported
04:56:49.389 npm warn deprecated glob@7.2.3: Glob versions prior to v9 are no longer supported
04:56:52.405 npm warn deprecated @mswjs/data@0.16.2: Package no longer supported. Contact Support at https://www.npmjs.com/support for more info.
04:57:12.899 npm warn deprecated next@15.1.6: This version has a security vulnerability. Please upgrade to a patched version. See https://nextjs.org/blog/CVE-2025-66478 for more details.
04:57:13.770 
04:57:13.771 added 1398 packages, and audited 1399 packages in 37s
04:57:13.772 
04:57:13.772 241 packages are looking for funding
04:57:13.772   run `npm fund` for details
04:57:13.903 
04:57:13.903 26 vulnerabilities (3 moderate, 21 high, 2 critical)
04:57:13.904 
04:57:13.904 To address issues that do not require attention, run:
04:57:13.904   npm audit fix
04:57:13.904 
04:57:13.904 To address all issues (including breaking changes), run:
04:57:13.904   npm audit fix --force
04:57:13.904 
04:57:13.904 Run `npm audit` for details.
04:57:13.969 Detected Next.js version: 15.1.6
04:57:13.970 Running "npm run build"
04:57:14.066 
04:57:14.066 > epackage-lab-web@0.1.0 build
04:57:14.068 > next build
04:57:14.068 
04:57:14.626 Attention: Next.js now collects completely anonymous telemetry regarding usage.
04:57:14.627 This information is used to shape Next.js' roadmap and prioritize features.
04:57:14.628 You can learn more, including how to opt-out if you'd not like to participate in this anonymous program, by visiting the following URL:
04:57:14.628 https://nextjs.org/telemetry
04:57:14.628 
04:57:14.691    ▲ Next.js 15.1.6
04:57:14.691 
04:57:14.736    Creating an optimized production build ...
04:57:56.840  ⚠ Compiled with warnings
04:57:56.840 
04:57:56.841 ./node_modules/handlebars/lib/index.js
04:57:56.841 require.extensions is not supported by webpack. Use a loader instead.
04:57:56.841 
04:57:56.841 Import trace for requested module:
04:57:56.842 ./node_modules/handlebars/lib/index.js
04:57:56.842 ./src/app/api/contract/pdf/route.ts
04:57:56.842 
04:57:56.842 ./node_modules/handlebars/lib/index.js
04:57:56.843 require.extensions is not supported by webpack. Use a loader instead.
04:57:56.843 
04:57:56.843 Import trace for requested module:
04:57:56.843 ./node_modules/handlebars/lib/index.js
04:57:56.843 ./src/app/api/contract/pdf/route.ts
04:57:56.843 
04:57:56.844 ./node_modules/handlebars/lib/index.js
04:57:56.844 require.extensions is not supported by webpack. Use a loader instead.
04:57:56.844 
04:57:56.844 Import trace for requested module:
04:57:56.845 ./node_modules/handlebars/lib/index.js
04:57:56.845 ./src/app/api/contract/pdf/route.ts
04:57:56.845 
04:58:01.793 <w> [webpack.cache.PackFileCacheStrategy] Serializing big strings (130kiB) impacts deserialization performance (consider using Buffer instead and decode when needed)
04:58:02.080  ⚠ Compiled with warnings
04:58:02.081 
04:58:02.081 ./node_modules/@supabase/realtime-js/dist/module/lib/websocket-factory.js
04:58:02.082 A Node.js API is used (process.versions at line: 39) which is not supported in the Edge Runtime.
04:58:02.082 Learn more: https://nextjs.org/docs/api-reference/edge-runtime
04:58:02.082 
04:58:02.082 Import trace for requested module:
04:58:02.082 ./node_modules/@supabase/realtime-js/dist/module/lib/websocket-factory.js
04:58:02.082 ./node_modules/@supabase/realtime-js/dist/module/index.js
04:58:02.082 ./node_modules/@supabase/supabase-js/dist/index.mjs
04:58:02.083 ./node_modules/@supabase/ssr/dist/module/createBrowserClient.js
04:58:02.083 ./node_modules/@supabase/ssr/dist/module/index.js
04:58:02.083 
04:58:02.083 ./node_modules/@supabase/supabase-js/dist/index.mjs
04:58:02.083 A Node.js API is used (process.version at line: 395) which is not supported in the Edge Runtime.
04:58:02.083 Learn more: https://nextjs.org/docs/api-reference/edge-runtime
04:58:02.083 
04:58:02.083 Import trace for requested module:
04:58:02.083 ./node_modules/@supabase/supabase-js/dist/index.mjs
04:58:02.083 ./node_modules/@supabase/ssr/dist/module/createBrowserClient.js
04:58:02.083 ./node_modules/@supabase/ssr/dist/module/index.js
04:58:02.084 
04:58:23.812 <w> [webpack.cache.PackFileCacheStrategy] Skipped not serializable cache item 'Compilation/modules|/vercel/path0/node_modules/next/dist/build/webpack/loaders/css-loader/src/index.js??ruleSet[1].rules[13].oneOf[10].use[2]!/vercel/path0/node_modules/next/dist/build/webpack/loaders/postcss-loader/src/index.js??ruleSet[1].rules[13].oneOf[10].use[3]!/vercel/path0/src/app/globals.css': No serializer registered for Warning
04:58:23.813 <w> while serializing webpack/lib/cache/PackFileCacheStrategy.PackContentItems -> webpack/lib/NormalModule -> Array { 1 items } -> webpack/lib/ModuleWarning -> Warning
04:58:26.181  ⚠ Compiled with warnings
04:58:26.182 
04:58:26.182 ./src/app/globals.css.webpack[javascript/auto]!=!./node_modules/next/dist/build/webpack/loaders/css-loader/src/index.js??ruleSet[1].rules[13].oneOf[10].use[2]!./node_modules/next/dist/build/webpack/loaders/postcss-loader/src/index.js??ruleSet[1].rules[13].oneOf[10].use[3]!./src/app/globals.css
04:58:26.183 Warning
04:58:26.183 
04:58:26.183 (837:5) autoprefixer: Replace color-adjust to print-color-adjust. The color-adjust shorthand is currently deprecated.
04:58:26.184 
04:58:26.184 Import trace for requested module:
04:58:26.184 ./src/app/globals.css.webpack[javascript/auto]!=!./node_modules/next/dist/build/webpack/loaders/css-loader/src/index.js??ruleSet[1].rules[13].oneOf[10].use[2]!./node_modules/next/dist/build/webpack/loaders/postcss-loader/src/index.js??ruleSet[1].rules[13].oneOf[10].use[3]!./src/app/globals.css
04:58:26.184 ./src/app/globals.css
04:58:26.185 
04:58:26.300  ✓ Compiled successfully
04:58:26.302    Skipping validation of types
04:58:26.302    Linting ...
04:58:26.570    Collecting page data ...
04:58:28.113 [Email] Production mode - configuring email service
04:58:28.114 [Email] SendGrid not configured
04:58:28.114 [Email] No email service configured - using console fallback
04:58:28.163 [EpackMailer] No SMTP configured - using console fallback
04:58:28.561 [createServiceClient] Credentials not configured, using mock client
04:58:29.087 [AccountDeletionEmail] Configuring email service
04:58:29.087 [AccountDeletionEmail] SendGrid not configured
04:58:29.088 [AccountDeletionEmail] No email service configured - using console fallback
04:58:29.458  ⚠ Using edge runtime on a page currently disables static generation for that page
04:58:38.122    Generating static pages (0/84) ...
04:58:39.090 [supabase-browser] Credentials not configured, returning mock client
04:58:39.091 [AuthProvider] useSearchParams not available, using empty: Error: Bail out to client-side rendering: useSearchParams()
04:58:39.092     at a (.next/server/chunks/6821.js:1:17081)
04:58:39.092     at d (.next/server/chunks/6821.js:1:33677)
04:58:39.092     at <unknown> (.next/server/chunks/1653.js:247:80510)
04:58:39.093     at d (.next/server/chunks/1653.js:247:80473) {
04:58:39.093   reason: 'useSearchParams()',
04:58:39.093   digest: 'BAILOUT_TO_CLIENT_SIDE_RENDERING'
04:58:39.093 }
04:58:39.094 [AuthProvider] useSearchParams not available, using empty: Error: Bail out to client-side rendering: useSearchParams()
04:58:39.094     at a (.next/server/chunks/6821.js:1:17081)
04:58:39.094     at d (.next/server/chunks/6821.js:1:33677)
04:58:39.095     at <unknown> (.next/server/chunks/1653.js:247:80510)
04:58:39.095     at d (.next/server/chunks/1653.js:247:80473) {
04:58:39.095   reason: 'useSearchParams()',
04:58:39.096   digest: 'BAILOUT_TO_CLIENT_SIDE_RENDERING'
04:58:39.097 }
04:58:39.097 [AuthProvider] useSearchParams not available, using empty: Error: Bail out to client-side rendering: useSearchParams()
04:58:39.098     at a (.next/server/chunks/6821.js:1:17081)
04:58:39.098     at d (.next/server/chunks/6821.js:1:33677)
04:58:39.099     at <unknown> (.next/server/chunks/1653.js:247:80510)
04:58:39.099     at d (.next/server/chunks/1653.js:247:80473) {
04:58:39.100   reason: 'useSearchParams()',
04:58:39.100   digest: 'BAILOUT_TO_CLIENT_SIDE_RENDERING'
04:58:39.100 }
04:58:39.101 [AuthProvider] useSearchParams not available, using empty: Error: Bail out to client-side rendering: useSearchParams()
04:58:39.101     at a (.next/server/chunks/6821.js:1:17081)
04:58:39.102     at d (.next/server/chunks/6821.js:1:33677)
04:58:39.102     at <unknown> (.next/server/chunks/1653.js:247:80510)
04:58:39.102     at d (.next/server/chunks/1653.js:247:80473) {
04:58:39.103   reason: 'useSearchParams()',
04:58:39.103   digest: 'BAILOUT_TO_CLIENT_SIDE_RENDERING'
04:58:39.103 }
04:58:39.104 [AuthProvider] useSearchParams not available, using empty: Error: Bail out to client-side rendering: useSearchParams()
04:58:39.104     at a (.next/server/chunks/6821.js:1:17081)
04:58:39.104     at d (.next/server/chunks/6821.js:1:33677)
04:58:39.105     at <unknown> (.next/server/chunks/1653.js:247:80510)
04:58:39.105     at d (.next/server/chunks/1653.js:247:80473) {
04:58:39.106   reason: 'useSearchParams()',
04:58:39.106   digest: 'BAILOUT_TO_CLIENT_SIDE_RENDERING'
04:58:39.106 }
04:58:39.732    Generating static pages (21/84) 
04:58:39.733 [Catalog] CatalogClient component rendering
04:58:39.734 [Catalog] State: { isLoading: true, productsLength: 0, filteredLength: 0 }
04:58:39.734 [getDefaultPostProcessingOptions] Selected defaults: [
04:58:39.734   'zipper-yes',
04:58:39.735   'glossy',
04:58:39.735   'notch-yes',
04:58:39.735   'hang-hole-6mm',
04:58:39.735   'corner-round',
04:58:39.736   'valve-no',
04:58:39.736   'top-open',
04:58:39.736   'sealing-width-5mm'
04:58:39.737 ]
04:58:39.737 [QuoteContext] initialState created: {
04:58:39.737   materialWidth: 590,
04:58:39.737   filmLayers: [
04:58:39.738     { materialId: 'PET', thickness: 12 },
04:58:39.738     { materialId: 'AL', thickness: 7 },
04:58:39.738     { materialId: 'PET', thickness: 12 },
04:58:39.738     { materialId: 'LLDPE', thickness: 70 }
04:58:39.739   ],
04:58:39.739   filmLayersCount: 4
04:58:39.739 }
04:58:39.821 [AuthProvider] useSearchParams not available, using empty: Error: Bail out to client-side rendering: useSearchParams()
04:58:39.821     at a (.next/server/chunks/6821.js:1:17081)
04:58:39.822     at d (.next/server/chunks/6821.js:1:33677)
04:58:39.822     at <unknown> (.next/server/chunks/1653.js:247:80510)
04:58:39.822     at d (.next/server/chunks/1653.js:247:80473) {
04:58:39.823   reason: 'useSearchParams()',
04:58:39.823   digest: 'BAILOUT_TO_CLIENT_SIDE_RENDERING'
04:58:39.823 }
04:58:39.823 [AuthProvider] useSearchParams not available, using empty: Error: Bail out to client-side rendering: useSearchParams()
04:58:39.824     at a (.next/server/chunks/6821.js:1:17081)
04:58:39.824     at d (.next/server/chunks/6821.js:1:33677)
04:58:39.824     at <unknown> (.next/server/chunks/1653.js:247:80510)
04:58:39.824     at d (.next/server/chunks/1653.js:247:80473) {
04:58:39.825   reason: 'useSearchParams()',
04:58:39.825   digest: 'BAILOUT_TO_CLIENT_SIDE_RENDERING'
04:58:39.825 }
04:58:39.826 [AuthProvider] useSearchParams not available, using empty: Error: Bail out to client-side rendering: useSearchParams()
04:58:39.826     at a (.next/server/chunks/6821.js:1:17081)
04:58:39.826     at d (.next/server/chunks/6821.js:1:33677)
04:58:39.826     at <unknown> (.next/server/chunks/1653.js:247:80510)
04:58:39.827     at d (.next/server/chunks/1653.js:247:80473) {
04:58:39.827   reason: 'useSearchParams()',
04:58:39.827   digest: 'BAILOUT_TO_CLIENT_SIDE_RENDERING'
04:58:39.828 }
04:58:39.828 [AuthProvider] useSearchParams not available, using empty: Error: Bail out to client-side rendering: useSearchParams()
04:58:39.828     at a (.next/server/chunks/6821.js:1:17081)
04:58:39.828     at d (.next/server/chunks/6821.js:1:33677)
04:58:39.829     at <unknown> (.next/server/chunks/1653.js:247:80510)
04:58:39.829     at d (.next/server/chunks/1653.js:247:80473) {
04:58:39.829   reason: 'useSearchParams()',
04:58:39.830   digest: 'BAILOUT_TO_CLIENT_SIDE_RENDERING'
04:58:39.830 }
04:58:39.830 [AuthProvider] useSearchParams not available, using empty: Error: Bail out to client-side rendering: useSearchParams()
04:58:39.830     at a (.next/server/chunks/6821.js:1:17081)
04:58:39.831     at d (.next/server/chunks/6821.js:1:33677)
04:58:39.831     at <unknown> (.next/server/chunks/1653.js:247:80510)
04:58:39.831     at d (.next/server/chunks/1653.js:247:80473) {
04:58:39.832   reason: 'useSearchParams()',
04:58:39.832   digest: 'BAILOUT_TO_CLIENT_SIDE_RENDERING'
04:58:39.832 }
04:58:39.832 [AuthProvider] useSearchParams not available, using empty: Error: Bail out to client-side rendering: useSearchParams()
04:58:39.833     at a (.next/server/chunks/6821.js:1:17081)
04:58:39.833     at d (.next/server/chunks/6821.js:1:33677)
04:58:39.833     at <unknown> (.next/server/chunks/1653.js:247:80510)
04:58:39.834     at d (.next/server/chunks/1653.js:247:80473) {
04:58:39.834   reason: 'useSearchParams()',
04:58:39.834   digest: 'BAILOUT_TO_CLIENT_SIDE_RENDERING'
04:58:39.834 }
04:58:39.834 [AuthProvider] useSearchParams not available, using empty: Error: Bail out to client-side rendering: useSearchParams()
04:58:39.835     at a (.next/server/chunks/6821.js:1:17081)
04:58:39.835     at d (.next/server/chunks/6821.js:1:33677)
04:58:39.835     at <unknown> (.next/server/chunks/1653.js:247:80510)
04:58:39.835     at d (.next/server/chunks/1653.js:247:80473) {
04:58:39.835   reason: 'useSearchParams()',
04:58:39.836   digest: 'BAILOUT_TO_CLIENT_SIDE_RENDERING'
04:58:39.836 }
04:58:39.836 [AuthProvider] useSearchParams not available, using empty: Error: Bail out to client-side rendering: useSearchParams()
04:58:39.837     at a (.next/server/chunks/6821.js:1:17081)
04:58:39.837     at d (.next/server/chunks/6821.js:1:33677)
04:58:39.837     at <unknown> (.next/server/chunks/1653.js:247:80510)
04:58:39.838     at d (.next/server/chunks/1653.js:247:80473) {
04:58:39.838   reason: 'useSearchParams()',
04:58:39.838   digest: 'BAILOUT_TO_CLIENT_SIDE_RENDERING'
04:58:39.839 }
04:58:39.839 [AuthProvider] useSearchParams not available, using empty: Error: Bail out to client-side rendering: useSearchParams()
04:58:39.839     at a (.next/server/chunks/6821.js:1:17081)
04:58:39.840     at d (.next/server/chunks/6821.js:1:33677)
04:58:39.840     at <unknown> (.next/server/chunks/1653.js:247:80510)
04:58:39.841     at d (.next/server/chunks/1653.js:247:80473) {
04:58:39.841   reason: 'useSearchParams()',
04:58:39.841   digest: 'BAILOUT_TO_CLIENT_SIDE_RENDERING'
04:58:39.842 }
04:58:39.842 [AuthProvider] useSearchParams not available, using empty: Error: Bail out to client-side rendering: useSearchParams()
04:58:39.842     at a (.next/server/chunks/6821.js:1:17081)
04:58:39.843     at d (.next/server/chunks/6821.js:1:33677)
04:58:39.843     at <unknown> (.next/server/chunks/1653.js:247:80510)
04:58:39.844     at d (.next/server/chunks/1653.js:247:80473) {
04:58:39.850   reason: 'useSearchParams()',
04:58:39.851   digest: 'BAILOUT_TO_CLIENT_SIDE_RENDERING'
04:58:39.851 }
04:58:39.851 [createServiceClient] Credentials not configured, using mock client
04:58:39.851 [getFeaturedProducts] Error fetching products: { message: 'Not configured', code: 'CONFIG_ERROR' }
04:58:39.851 [createServiceClient] Credentials not configured, using mock client
04:58:39.852 [getLatestAnnouncements] Error fetching announcements: { message: 'Not configured', code: 'CONFIG_ERROR' }
04:58:39.852 [AuthProvider] useSearchParams not available, using empty: Error: Bail out to client-side rendering: useSearchParams()
04:58:39.852     at a (.next/server/chunks/6821.js:1:17081)
04:58:39.852     at d (.next/server/chunks/6821.js:1:33677)
04:58:39.852     at <unknown> (.next/server/chunks/1653.js:247:80510)
04:58:39.853     at d (.next/server/chunks/1653.js:247:80473) {
04:58:39.853   reason: 'useSearchParams()',
04:58:39.853   digest: 'BAILOUT_TO_CLIENT_SIDE_RENDERING'
04:58:39.853 }
04:58:39.853 [AuthProvider] useSearchParams not available, using empty: Error: Bail out to client-side rendering: useSearchParams()
04:58:39.854     at a (.next/server/chunks/6821.js:1:17081)
04:58:39.854     at d (.next/server/chunks/6821.js:1:33677)
04:58:39.854     at <unknown> (.next/server/chunks/1653.js:247:80510)
04:58:39.854     at d (.next/server/chunks/1653.js:247:80473) {
04:58:39.854   reason: 'useSearchParams()',
04:58:39.855   digest: 'BAILOUT_TO_CLIENT_SIDE_RENDERING'
04:58:39.855 }
04:58:39.855 [AuthProvider] useSearchParams not available, using empty: Error: Bail out to client-side rendering: useSearchParams()
04:58:39.855     at a (.next/server/chunks/6821.js:1:17081)
04:58:39.855     at d (.next/server/chunks/6821.js:1:33677)
04:58:39.855     at <unknown> (.next/server/chunks/1653.js:247:80510)
04:58:39.856     at d (.next/server/chunks/1653.js:247:80473) {
04:58:39.856   reason: 'useSearchParams()',
04:58:39.856   digest: 'BAILOUT_TO_CLIENT_SIDE_RENDERING'
04:58:39.856 }
04:58:39.856 [AuthProvider] useSearchParams not available, using empty: Error: Bail out to client-side rendering: useSearchParams()
04:58:39.857     at a (.next/server/chunks/6821.js:1:17081)
04:58:39.857     at d (.next/server/chunks/6821.js:1:33677)
04:58:39.857     at <unknown> (.next/server/chunks/1653.js:247:80510)
04:58:39.857     at d (.next/server/chunks/1653.js:247:80473) {
04:58:39.857   reason: 'useSearchParams()',
04:58:39.858   digest: 'BAILOUT_TO_CLIENT_SIDE_RENDERING'
04:58:39.858 }
04:58:39.858 [AuthProvider] useSearchParams not available, using empty: Error: Bail out to client-side rendering: useSearchParams()
04:58:39.858     at a (.next/server/chunks/6821.js:1:17081)
04:58:39.858     at d (.next/server/chunks/6821.js:1:33677)
04:58:39.859     at <unknown> (.next/server/chunks/1653.js:247:80510)
04:58:39.859     at d (.next/server/chunks/1653.js:247:80473) {
04:58:39.859   reason: 'useSearchParams()',
04:58:39.859   digest: 'BAILOUT_TO_CLIENT_SIDE_RENDERING'
04:58:39.859 }
04:58:39.859 [AuthProvider] useSearchParams not available, using empty: Error: Bail out to client-side rendering: useSearchParams()
04:58:39.860     at a (.next/server/chunks/6821.js:1:17081)
04:58:39.860     at d (.next/server/chunks/6821.js:1:33677)
04:58:39.860     at <unknown> (.next/server/chunks/1653.js:247:80510)
04:58:39.860     at d (.next/server/chunks/1653.js:247:80473) {
04:58:39.860   reason: 'useSearchParams()',
04:58:39.861   digest: 'BAILOUT_TO_CLIENT_SIDE_RENDERING'
04:58:39.861 }
04:58:39.861 [AuthProvider] useSearchParams not available, using empty: Error: Bail out to client-side rendering: useSearchParams()
04:58:39.861     at a (.next/server/chunks/6821.js:1:17081)
04:58:39.861     at d (.next/server/chunks/6821.js:1:33677)
04:58:39.862     at <unknown> (.next/server/chunks/1653.js:247:80510)
04:58:39.862     at d (.next/server/chunks/1653.js:247:80473) {
04:58:39.862   reason: 'useSearchParams()',
04:58:39.862   digest: 'BAILOUT_TO_CLIENT_SIDE_RENDERING'
04:58:39.862 }
04:58:39.863 [AuthProvider] useSearchParams not available, using empty: Error: Bail out to client-side rendering: useSearchParams()
04:58:39.863     at a (.next/server/chunks/6821.js:1:17081)
04:58:39.863     at d (.next/server/chunks/6821.js:1:33677)
04:58:39.863     at <unknown> (.next/server/chunks/1653.js:247:80510)
04:58:39.863     at d (.next/server/chunks/1653.js:247:80473) {
04:58:39.863   reason: 'useSearchParams()',
04:58:39.864   digest: 'BAILOUT_TO_CLIENT_SIDE_RENDERING'
04:58:39.864 }
04:58:39.864 [AuthProvider] useSearchParams not available, using empty: Error: Bail out to client-side rendering: useSearchParams()
04:58:39.864     at a (.next/server/chunks/6821.js:1:17081)
04:58:39.864     at d (.next/server/chunks/6821.js:1:33677)
04:58:39.865     at <unknown> (.next/server/chunks/1653.js:247:80510)
04:58:39.866     at d (.next/server/chunks/1653.js:247:80473) {
04:58:39.867   reason: 'useSearchParams()',
04:58:39.867   digest: 'BAILOUT_TO_CLIENT_SIDE_RENDERING'
04:58:39.867 }
04:58:40.073 [AuthProvider] useSearchParams not available, using empty: Error: Bail out to client-side rendering: useSearchParams()
04:58:40.082     at a (.next/server/chunks/6821.js:1:17081)
04:58:40.082     at d (.next/server/chunks/6821.js:1:33677)
04:58:40.083     at <unknown> (.next/server/chunks/1653.js:247:80510)
04:58:40.083     at d (.next/server/chunks/1653.js:247:80473) {
04:58:40.083   reason: 'useSearchParams()',
04:58:40.083   digest: 'BAILOUT_TO_CLIENT_SIDE_RENDERING'
04:58:40.083 }
04:58:40.083 [AuthProvider] useSearchParams not available, using empty: Error: Bail out to client-side rendering: useSearchParams()
04:58:40.083     at a (.next/server/chunks/6821.js:1:17081)
04:58:40.083     at d (.next/server/chunks/6821.js:1:33677)
04:58:40.083     at <unknown> (.next/server/chunks/1653.js:247:80510)
04:58:40.083     at d (.next/server/chunks/1653.js:247:80473) {
04:58:40.083   reason: 'useSearchParams()',
04:58:40.083   digest: 'BAILOUT_TO_CLIENT_SIDE_RENDERING'
04:58:40.083 }
04:58:40.083 [AuthProvider] useSearchParams not available, using empty: Error: Bail out to client-side rendering: useSearchParams()
04:58:40.083     at a (.next/server/chunks/6821.js:1:17081)
04:58:40.083     at d (.next/server/chunks/6821.js:1:33677)
04:58:40.083     at <unknown> (.next/server/chunks/1653.js:247:80510)
04:58:40.083     at d (.next/server/chunks/1653.js:247:80473) {
04:58:40.083   reason: 'useSearchParams()',
04:58:40.083   digest: 'BAILOUT_TO_CLIENT_SIDE_RENDERING'
04:58:40.083 }
04:58:40.083 [AuthProvider] useSearchParams not available, using empty: Error: Bail out to client-side rendering: useSearchParams()
04:58:40.083     at a (.next/server/chunks/6821.js:1:17081)
04:58:40.083     at d (.next/server/chunks/6821.js:1:33677)
04:58:40.083     at <unknown> (.next/server/chunks/1653.js:247:80510)
04:58:40.083     at d (.next/server/chunks/1653.js:247:80473) {
04:58:40.083   reason: 'useSearchParams()',
04:58:40.083   digest: 'BAILOUT_TO_CLIENT_SIDE_RENDERING'
04:58:40.083 }
04:58:40.083 [AuthProvider] useSearchParams not available, using empty: Error: Bail out to client-side rendering: useSearchParams()
04:58:40.083     at a (.next/server/chunks/6821.js:1:17081)
04:58:40.084     at d (.next/server/chunks/6821.js:1:33677)
04:58:40.084     at <unknown> (.next/server/chunks/1653.js:247:80510)
04:58:40.084     at d (.next/server/chunks/1653.js:247:80473) {
04:58:40.084   reason: 'useSearchParams()',
04:58:40.084   digest: 'BAILOUT_TO_CLIENT_SIDE_RENDERING'
04:58:40.084 }
04:58:40.084 [AuthProvider] useSearchParams not available, using empty: Error: Bail out to client-side rendering: useSearchParams()
04:58:40.084     at a (.next/server/chunks/6821.js:1:17081)
04:58:40.084     at d (.next/server/chunks/6821.js:1:33677)
04:58:40.084     at <unknown> (.next/server/chunks/1653.js:247:80510)
04:58:40.084     at d (.next/server/chunks/1653.js:247:80473) {
04:58:40.084   reason: 'useSearchParams()',
04:58:40.084   digest: 'BAILOUT_TO_CLIENT_SIDE_RENDERING'
04:58:40.084 }
04:58:40.248 [AuthProvider] useSearchParams not available, using empty: Error: Bail out to client-side rendering: useSearchParams()
04:58:40.249     at a (.next/server/chunks/6821.js:1:17081)
04:58:40.249     at d (.next/server/chunks/6821.js:1:33677)
04:58:40.249     at <unknown> (.next/server/chunks/1653.js:247:80510)
04:58:40.249     at d (.next/server/chunks/1653.js:247:80473) {
04:58:40.249   reason: 'useSearchParams()',
04:58:40.249   digest: 'BAILOUT_TO_CLIENT_SIDE_RENDERING'
04:58:40.249 }
04:58:40.250 [AuthProvider] useSearchParams not available, using empty: Error: Bail out to client-side rendering: useSearchParams()
04:58:40.250     at a (.next/server/chunks/6821.js:1:17081)
04:58:40.250     at d (.next/server/chunks/6821.js:1:33677)
04:58:40.250     at <unknown> (.next/server/chunks/1653.js:247:80510)
04:58:40.250     at d (.next/server/chunks/1653.js:247:80473) {
04:58:40.250   reason: 'useSearchParams()',
04:58:40.250   digest: 'BAILOUT_TO_CLIENT_SIDE_RENDERING'
04:58:40.250 }
04:58:40.250 [AuthProvider] useSearchParams not available, using empty: Error: Bail out to client-side rendering: useSearchParams()
04:58:40.250     at a (.next/server/chunks/6821.js:1:17081)
04:58:40.250     at d (.next/server/chunks/6821.js:1:33677)
04:58:40.250     at <unknown> (.next/server/chunks/1653.js:247:80510)
04:58:40.250     at d (.next/server/chunks/1653.js:247:80473) {
04:58:40.250   reason: 'useSearchParams()',
04:58:40.250   digest: 'BAILOUT_TO_CLIENT_SIDE_RENDERING'
04:58:40.250 }
04:58:40.250 [AuthProvider] useSearchParams not available, using empty: Error: Bail out to client-side rendering: useSearchParams()
04:58:40.250     at a (.next/server/chunks/6821.js:1:17081)
04:58:40.250     at d (.next/server/chunks/6821.js:1:33677)
04:58:40.250     at <unknown> (.next/server/chunks/1653.js:247:80510)
04:58:40.250     at d (.next/server/chunks/1653.js:247:80473) {
04:58:40.250   reason: 'useSearchParams()',
04:58:40.251   digest: 'BAILOUT_TO_CLIENT_SIDE_RENDERING'
04:58:40.251 }
04:58:40.345    Generating static pages (42/84) 
04:58:40.440 [AuthProvider] useSearchParams not available, using empty: Error: Bail out to client-side rendering: useSearchParams()
04:58:40.440     at a (.next/server/chunks/6821.js:1:17081)
04:58:40.440     at d (.next/server/chunks/6821.js:1:33677)
04:58:40.441     at <unknown> (.next/server/chunks/1653.js:247:80510)
04:58:40.441     at d (.next/server/chunks/1653.js:247:80473) {
04:58:40.441   reason: 'useSearchParams()',
04:58:40.441   digest: 'BAILOUT_TO_CLIENT_SIDE_RENDERING'
04:58:40.441 }
04:58:40.441 [AuthProvider] useSearchParams not available, using empty: Error: Bail out to client-side rendering: useSearchParams()
04:58:40.441     at a (.next/server/chunks/6821.js:1:17081)
04:58:40.441     at d (.next/server/chunks/6821.js:1:33677)
04:58:40.441     at <unknown> (.next/server/chunks/1653.js:247:80510)
04:58:40.441     at d (.next/server/chunks/1653.js:247:80473) {
04:58:40.441   reason: 'useSearchParams()',
04:58:40.441   digest: 'BAILOUT_TO_CLIENT_SIDE_RENDERING'
04:58:40.441 }
04:58:40.441 [AuthProvider] useSearchParams not available, using empty: Error: Bail out to client-side rendering: useSearchParams()
04:58:40.441     at a (.next/server/chunks/6821.js:1:17081)
04:58:40.442     at d (.next/server/chunks/6821.js:1:33677)
04:58:40.442     at <unknown> (.next/server/chunks/1653.js:247:80510)
04:58:40.442     at d (.next/server/chunks/1653.js:247:80473) {
04:58:40.442   reason: 'useSearchParams()',
04:58:40.442   digest: 'BAILOUT_TO_CLIENT_SIDE_RENDERING'
04:58:40.442 }
04:58:40.442 [AuthProvider] useSearchParams not available, using empty: Error: Bail out to client-side rendering: useSearchParams()
04:58:40.442     at a (.next/server/chunks/6821.js:1:17081)
04:58:40.442     at d (.next/server/chunks/6821.js:1:33677)
04:58:40.442     at <unknown> (.next/server/chunks/1653.js:247:80510)
04:58:40.445     at d (.next/server/chunks/1653.js:247:80473) {
04:58:40.445   reason: 'useSearchParams()',
04:58:40.445   digest: 'BAILOUT_TO_CLIENT_SIDE_RENDERING'
04:58:40.445 }
04:58:40.446 [AuthProvider] useSearchParams not available, using empty: Error: Bail out to client-side rendering: useSearchParams()
04:58:40.446     at a (.next/server/chunks/6821.js:1:17081)
04:58:40.446     at d (.next/server/chunks/6821.js:1:33677)
04:58:40.446     at <unknown> (.next/server/chunks/1653.js:247:80510)
04:58:40.447     at d (.next/server/chunks/1653.js:247:80473) {
04:58:40.447   reason: 'useSearchParams()',
04:58:40.447   digest: 'BAILOUT_TO_CLIENT_SIDE_RENDERING'
04:58:40.447 }
04:58:40.447 [AuthProvider] useSearchParams not available, using empty: Error: Bail out to client-side rendering: useSearchParams()
04:58:40.447     at a (.next/server/chunks/6821.js:1:17081)
04:58:40.447     at d (.next/server/chunks/6821.js:1:33677)
04:58:40.447     at <unknown> (.next/server/chunks/1653.js:247:80510)
04:58:40.447     at d (.next/server/chunks/1653.js:247:80473) {
04:58:40.447   reason: 'useSearchParams()',
04:58:40.447   digest: 'BAILOUT_TO_CLIENT_SIDE_RENDERING'
04:58:40.447 }
04:58:40.697 [AuthProvider] useSearchParams not available, using empty: Error: Bail out to client-side rendering: useSearchParams()
04:58:40.697     at a (.next/server/chunks/6821.js:1:17081)
04:58:40.697     at d (.next/server/chunks/6821.js:1:33677)
04:58:40.697     at <unknown> (.next/server/chunks/1653.js:247:80510)
04:58:40.697     at d (.next/server/chunks/1653.js:247:80473) {
04:58:40.697   reason: 'useSearchParams()',
04:58:40.697   digest: 'BAILOUT_TO_CLIENT_SIDE_RENDERING'
04:58:40.697 }
04:58:40.697 [AuthProvider] useSearchParams not available, using empty: Error: Bail out to client-side rendering: useSearchParams()
04:58:40.698     at a (.next/server/chunks/6821.js:1:17081)
04:58:40.698     at d (.next/server/chunks/6821.js:1:33677)
04:58:40.698     at <unknown> (.next/server/chunks/1653.js:247:80510)
04:58:40.698     at d (.next/server/chunks/1653.js:247:80473) {
04:58:40.698   reason: 'useSearchParams()',
04:58:40.698   digest: 'BAILOUT_TO_CLIENT_SIDE_RENDERING'
04:58:40.698 }
04:58:40.698 [AuthProvider] useSearchParams not available, using empty: Error: Bail out to client-side rendering: useSearchParams()
04:58:40.698     at a (.next/server/chunks/6821.js:1:17081)
04:58:40.698     at d (.next/server/chunks/6821.js:1:33677)
04:58:40.698     at <unknown> (.next/server/chunks/1653.js:247:80510)
04:58:40.698     at d (.next/server/chunks/1653.js:247:80473) {
04:58:40.698   reason: 'useSearchParams()',
04:58:40.698   digest: 'BAILOUT_TO_CLIENT_SIDE_RENDERING'
04:58:40.698 }
04:58:40.699 [AuthProvider] useSearchParams not available, using empty: Error: Bail out to client-side rendering: useSearchParams()
04:58:40.699     at a (.next/server/chunks/6821.js:1:17081)
04:58:40.699     at d (.next/server/chunks/6821.js:1:33677)
04:58:40.699     at <unknown> (.next/server/chunks/1653.js:247:80510)
04:58:40.699     at d (.next/server/chunks/1653.js:247:80473) {
04:58:40.699   reason: 'useSearchParams()',
04:58:40.699   digest: 'BAILOUT_TO_CLIENT_SIDE_RENDERING'
04:58:40.699 }
04:58:40.699 [AuthProvider] useSearchParams not available, using empty: Error: Bail out to client-side rendering: useSearchParams()
04:58:40.699     at a (.next/server/chunks/6821.js:1:17081)
04:58:40.700     at d (.next/server/chunks/6821.js:1:33677)
04:58:40.700     at <unknown> (.next/server/chunks/1653.js:247:80510)
04:58:40.700     at d (.next/server/chunks/1653.js:247:80473) {
04:58:40.700   reason: 'useSearchParams()',
04:58:40.700   digest: 'BAILOUT_TO_CLIENT_SIDE_RENDERING'
04:58:40.700 }
04:58:40.701 [AuthProvider] useSearchParams not available, using empty: Error: Bail out to client-side rendering: useSearchParams()
04:58:40.701     at a (.next/server/chunks/6821.js:1:17081)
04:58:40.701     at d (.next/server/chunks/6821.js:1:33677)
04:58:40.701     at <unknown> (.next/server/chunks/1653.js:247:80510)
04:58:40.701     at d (.next/server/chunks/1653.js:247:80473) {
04:58:40.701   reason: 'useSearchParams()',
04:58:40.702   digest: 'BAILOUT_TO_CLIENT_SIDE_RENDERING'
04:58:40.702 }
04:58:40.702 [AuthProvider] useSearchParams not available, using empty: Error: Bail out to client-side rendering: useSearchParams()
04:58:40.702     at a (.next/server/chunks/6821.js:1:17081)
04:58:40.702     at d (.next/server/chunks/6821.js:1:33677)
04:58:40.702     at <unknown> (.next/server/chunks/1653.js:247:80510)
04:58:40.703     at d (.next/server/chunks/1653.js:247:80473) {
04:58:40.703   reason: 'useSearchParams()',
04:58:40.703   digest: 'BAILOUT_TO_CLIENT_SIDE_RENDERING'
04:58:40.703 }
04:58:40.703 [AuthProvider] useSearchParams not available, using empty: Error: Bail out to client-side rendering: useSearchParams()
04:58:40.703     at a (.next/server/chunks/6821.js:1:17081)
04:58:40.703     at d (.next/server/chunks/6821.js:1:33677)
04:58:40.704     at <unknown> (.next/server/chunks/1653.js:247:80510)
04:58:40.704     at d (.next/server/chunks/1653.js:247:80473) {
04:58:40.704   reason: 'useSearchParams()',
04:58:40.704   digest: 'BAILOUT_TO_CLIENT_SIDE_RENDERING'
04:58:40.704 }
04:58:40.898    Generating static pages (63/84) 
04:58:40.899 [AuthProvider] useSearchParams not available, using empty: Error: Bail out to client-side rendering: useSearchParams()
04:58:40.900     at a (.next/server/chunks/6821.js:1:17081)
04:58:40.900     at d (.next/server/chunks/6821.js:1:33677)
04:58:40.900     at <unknown> (.next/server/chunks/1653.js:247:80510)
04:58:40.900     at d (.next/server/chunks/1653.js:247:80473) {
04:58:40.900   reason: 'useSearchParams()',
04:58:40.900   digest: 'BAILOUT_TO_CLIENT_SIDE_RENDERING'
04:58:40.900 }
04:58:40.900 [AuthProvider] useSearchParams not available, using empty: Error: Bail out to client-side rendering: useSearchParams()
04:58:40.900     at a (.next/server/chunks/6821.js:1:17081)
04:58:40.900     at d (.next/server/chunks/6821.js:1:33677)
04:58:40.900     at <unknown> (.next/server/chunks/1653.js:247:80510)
04:58:40.900     at d (.next/server/chunks/1653.js:247:80473) {
04:58:40.900   reason: 'useSearchParams()',
04:58:40.900   digest: 'BAILOUT_TO_CLIENT_SIDE_RENDERING'
04:58:40.900 }
04:58:40.900 [AuthProvider] useSearchParams not available, using empty: Error: Bail out to client-side rendering: useSearchParams()
04:58:40.900     at a (.next/server/chunks/6821.js:1:17081)
04:58:40.900     at d (.next/server/chunks/6821.js:1:33677)
04:58:40.900     at <unknown> (.next/server/chunks/1653.js:247:80510)
04:58:40.900     at d (.next/server/chunks/1653.js:247:80473) {
04:58:40.900   reason: 'useSearchParams()',
04:58:40.900   digest: 'BAILOUT_TO_CLIENT_SIDE_RENDERING'
04:58:40.900 }
04:58:40.900 [AuthProvider] useSearchParams not available, using empty: Error: Bail out to client-side rendering: useSearchParams()
04:58:40.901     at a (.next/server/chunks/6821.js:1:17081)
04:58:40.901     at d (.next/server/chunks/6821.js:1:33677)
04:58:40.901     at <unknown> (.next/server/chunks/1653.js:247:80510)
04:58:40.901     at d (.next/server/chunks/1653.js:247:80473) {
04:58:40.901   reason: 'useSearchParams()',
04:58:40.901   digest: 'BAILOUT_TO_CLIENT_SIDE_RENDERING'
04:58:40.901 }
04:58:40.901 [AuthProvider] useSearchParams not available, using empty: Error: Bail out to client-side rendering: useSearchParams()
04:58:40.901     at a (.next/server/chunks/6821.js:1:17081)
04:58:40.901     at d (.next/server/chunks/6821.js:1:33677)
04:58:40.901     at <unknown> (.next/server/chunks/1653.js:247:80510)
04:58:40.901     at d (.next/server/chunks/1653.js:247:80473) {
04:58:40.901   reason: 'useSearchParams()',
04:58:40.901   digest: 'BAILOUT_TO_CLIENT_SIDE_RENDERING'
04:58:40.901 }
04:58:40.901 [AuthProvider] useSearchParams not available, using empty: Error: Bail out to client-side rendering: useSearchParams()
04:58:40.901     at a (.next/server/chunks/6821.js:1:17081)
04:58:40.901     at d (.next/server/chunks/6821.js:1:33677)
04:58:40.901     at <unknown> (.next/server/chunks/1653.js:247:80510)
04:58:40.902     at d (.next/server/chunks/1653.js:247:80473) {
04:58:40.902   reason: 'useSearchParams()',
04:58:40.902   digest: 'BAILOUT_TO_CLIENT_SIDE_RENDERING'
04:58:40.902 }
04:58:40.902 [AuthProvider] useSearchParams not available, using empty: Error: Bail out to client-side rendering: useSearchParams()
04:58:40.902     at a (.next/server/chunks/6821.js:1:17081)
04:58:40.902     at d (.next/server/chunks/6821.js:1:33677)
04:58:40.902     at <unknown> (.next/server/chunks/1653.js:247:80510)
04:58:40.902     at d (.next/server/chunks/1653.js:247:80473) {
04:58:40.902   reason: 'useSearchParams()',
04:58:40.902   digest: 'BAILOUT_TO_CLIENT_SIDE_RENDERING'
04:58:40.902 }
04:58:41.248 [RBAC] getRBACContext() called
04:58:41.248 [RBAC] No runtime context (missing env vars), returning null context
04:58:41.249 [requireAuth] No RBAC context found, throwing AuthRequiredError
04:58:41.249 [AuthProvider] useSearchParams not available, using empty: Error: Bail out to client-side rendering: useSearchParams()
04:58:41.249     at a (.next/server/chunks/6821.js:1:17081)
04:58:41.249     at d (.next/server/chunks/6821.js:1:33677)
04:58:41.249     at <unknown> (.next/server/chunks/1653.js:247:80510)
04:58:41.249     at d (.next/server/chunks/1653.js:247:80473) {
04:58:41.249   reason: 'useSearchParams()',
04:58:41.249   digest: 'BAILOUT_TO_CLIENT_SIDE_RENDERING'
04:58:41.249 }
04:58:41.250 [AuthProvider] useSearchParams not available, using empty: Error: Bail out to client-side rendering: useSearchParams()
04:58:41.250     at a (.next/server/chunks/6821.js:1:17081)
04:58:41.250     at d (.next/server/chunks/6821.js:1:33677)
04:58:41.250     at <unknown> (.next/server/chunks/1653.js:247:80510)
04:58:41.250     at d (.next/server/chunks/1653.js:247:80473) {
04:58:41.250   reason: 'useSearchParams()',
04:58:41.250   digest: 'BAILOUT_TO_CLIENT_SIDE_RENDERING'
04:58:41.250 }
04:58:41.250 [AuthProvider] useSearchParams not available, using empty: Error: Bail out to client-side rendering: useSearchParams()
04:58:41.250     at a (.next/server/chunks/6821.js:1:17081)
04:58:41.250     at d (.next/server/chunks/6821.js:1:33677)
04:58:41.250     at <unknown> (.next/server/chunks/1653.js:247:80510)
04:58:41.250     at d (.next/server/chunks/1653.js:247:80473) {
04:58:41.250   reason: 'useSearchParams()',
04:58:41.250   digest: 'BAILOUT_TO_CLIENT_SIDE_RENDERING'
04:58:41.250 }
04:58:41.251 [AuthProvider] useSearchParams not available, using empty: Error: Bail out to client-side rendering: useSearchParams()
04:58:41.251     at a (.next/server/chunks/6821.js:1:17081)
04:58:41.251     at d (.next/server/chunks/6821.js:1:33677)
04:58:41.251     at <unknown> (.next/server/chunks/1653.js:247:80510)
04:58:41.251     at d (.next/server/chunks/1653.js:247:80473) {
04:58:41.251   reason: 'useSearchParams()',
04:58:41.251   digest: 'BAILOUT_TO_CLIENT_SIDE_RENDERING'
04:58:41.251 }
04:58:41.251 [AuthProvider] useSearchParams not available, using empty: Error: Bail out to client-side rendering: useSearchParams()
04:58:41.251     at a (.next/server/chunks/6821.js:1:17081)
04:58:41.251     at d (.next/server/chunks/6821.js:1:33677)
04:58:41.251     at <unknown> (.next/server/chunks/1653.js:247:80510)
04:58:41.251     at d (.next/server/chunks/1653.js:247:80473) {
04:58:41.251   reason: 'useSearchParams()',
04:58:41.251   digest: 'BAILOUT_TO_CLIENT_SIDE_RENDERING'
04:58:41.251 }
04:58:41.251 [AuthProvider] useSearchParams not available, using empty: Error: Bail out to client-side rendering: useSearchParams()
04:58:41.251     at a (.next/server/chunks/6821.js:1:17081)
04:58:41.252     at d (.next/server/chunks/6821.js:1:33677)
04:58:41.252     at <unknown> (.next/server/chunks/1653.js:247:80510)
04:58:41.252     at d (.next/server/chunks/1653.js:247:80473) {
04:58:41.252   reason: 'useSearchParams()',
04:58:41.252   digest: 'BAILOUT_TO_CLIENT_SIDE_RENDERING'
04:58:41.252 }
04:58:41.252 [AuthProvider] useSearchParams not available, using empty: Error: Bail out to client-side rendering: useSearchParams()
04:58:41.252     at a (.next/server/chunks/6821.js:1:17081)
04:58:41.252     at d (.next/server/chunks/6821.js:1:33677)
04:58:41.252     at <unknown> (.next/server/chunks/1653.js:247:80510)
04:58:41.252     at d (.next/server/chunks/1653.js:247:80473) {
04:58:41.252   reason: 'useSearchParams()',
04:58:41.253   digest: 'BAILOUT_TO_CLIENT_SIDE_RENDERING'
04:58:41.253 }
04:58:41.253 [AuthProvider] useSearchParams not available, using empty: Error: Bail out to client-side rendering: useSearchParams()
04:58:41.253     at a (.next/server/chunks/6821.js:1:17081)
04:58:41.253     at d (.next/server/chunks/6821.js:1:33677)
04:58:41.253     at <unknown> (.next/server/chunks/1653.js:247:80510)
04:58:41.253     at d (.next/server/chunks/1653.js:247:80473) {
04:58:41.253   reason: 'useSearchParams()',
04:58:41.254   digest: 'BAILOUT_TO_CLIENT_SIDE_RENDERING'
04:58:41.254 }
04:58:41.254 [AuthProvider] useSearchParams not available, using empty: Error: Bail out to client-side rendering: useSearchParams()
04:58:41.254     at a (.next/server/chunks/6821.js:1:17081)
04:58:41.254     at d (.next/server/chunks/6821.js:1:33677)
04:58:41.254     at <unknown> (.next/server/chunks/1653.js:247:80510)
04:58:41.254     at d (.next/server/chunks/1653.js:247:80473) {
04:58:41.259   reason: 'useSearchParams()',
04:58:41.260   digest: 'BAILOUT_TO_CLIENT_SIDE_RENDERING'
04:58:41.260 }
04:58:41.260 [AuthProvider] useSearchParams not available, using empty: Error: Bail out to client-side rendering: useSearchParams()
04:58:41.260     at a (.next/server/chunks/6821.js:1:17081)
04:58:41.260     at d (.next/server/chunks/6821.js:1:33677)
04:58:41.260     at <unknown> (.next/server/chunks/1653.js:247:80510)
04:58:41.260     at d (.next/server/chunks/1653.js:247:80473) {
04:58:41.260   reason: 'useSearchParams()',
04:58:41.260   digest: 'BAILOUT_TO_CLIENT_SIDE_RENDERING'
04:58:41.260 }
04:58:41.442 [AuthProvider] useSearchParams not available, using empty: Error: Bail out to client-side rendering: useSearchParams()
04:58:41.442     at a (.next/server/chunks/6821.js:1:17081)
04:58:41.443     at d (.next/server/chunks/6821.js:1:33677)
04:58:41.443     at <unknown> (.next/server/chunks/1653.js:247:80510)
04:58:41.443     at d (.next/server/chunks/1653.js:247:80473) {
04:58:41.443   reason: 'useSearchParams()',
04:58:41.443   digest: 'BAILOUT_TO_CLIENT_SIDE_RENDERING'
04:58:41.443 }
04:58:41.444 [AuthProvider] useSearchParams not available, using empty: Error: Bail out to client-side rendering: useSearchParams()
04:58:41.444     at a (.next/server/chunks/6821.js:1:17081)
04:58:41.444     at d (.next/server/chunks/6821.js:1:33677)
04:58:41.444     at <unknown> (.next/server/chunks/1653.js:247:80510)
04:58:41.444     at d (.next/server/chunks/1653.js:247:80473) {
04:58:41.444   reason: 'useSearchParams()',
04:58:41.445   digest: 'BAILOUT_TO_CLIENT_SIDE_RENDERING'
04:58:41.445 }
04:58:41.445 [AuthProvider] useSearchParams not available, using empty: Error: Bail out to client-side rendering: useSearchParams()
04:58:41.445     at a (.next/server/chunks/6821.js:1:17081)
04:58:41.445     at d (.next/server/chunks/6821.js:1:33677)
04:58:41.446     at <unknown> (.next/server/chunks/1653.js:247:80510)
04:58:41.446     at d (.next/server/chunks/1653.js:247:80473) {
04:58:41.446   reason: 'useSearchParams()',
04:58:41.446   digest: 'BAILOUT_TO_CLIENT_SIDE_RENDERING'
04:58:41.446 }
04:58:41.454  ✓ Generating static pages (84/84)
04:58:43.494    Finalizing page optimization ...
04:58:43.495    Collecting build traces ...
04:59:02.643 
04:59:02.663 Route (app)                                              Size     First Load JS
04:59:02.664 ┌ ○ /                                                    48.2 kB         264 kB
04:59:02.664 ├ ○ /_not-found                                          722 B           107 kB
04:59:02.664 ├ ƒ /about                                               203 B           110 kB
04:59:02.664 ├ ƒ /admin/approvals                                     5.13 kB         189 kB
04:59:02.665 ├ ○ /admin/contracts                                     6.18 kB         195 kB
04:59:02.665 ├ ƒ /admin/contracts/[id]                                7.38 kB         122 kB
04:59:02.665 ├ ○ /admin/coupons                                       4.47 kB         111 kB
04:59:02.665 ├ ƒ /admin/customers                                     2.24 kB         130 kB
04:59:02.665 ├ ƒ /admin/customers/documents                           203 B           110 kB
04:59:02.666 ├ ○ /admin/customers/management                          22.6 kB         184 kB
04:59:02.666 ├ ƒ /admin/customers/orders                              2.24 kB         130 kB
04:59:02.666 ├ ƒ /admin/customers/orders/[id]                         210 B           128 kB
04:59:02.666 ├ ƒ /admin/customers/profile                             351 B           106 kB
04:59:02.666 ├ ƒ /admin/customers/support                             203 B           110 kB
04:59:02.666 ├ ƒ /admin/dashboard                                     118 kB          360 kB
04:59:02.667 ├ ○ /admin/notifications                                 4.66 kB         111 kB
04:59:02.667 ├ ƒ /admin/orders                                        8.67 kB         183 kB
04:59:02.667 ├ ƒ /admin/orders/[id]                                   20.8 kB         332 kB
04:59:02.667 ├ ƒ /admin/orders/[id]/correction-upload                 7.91 kB         122 kB
04:59:02.667 ├ ƒ /admin/orders/[id]/payment-confirmation              9.03 kB         173 kB
04:59:02.667 ├ ƒ /admin/production/[id]                               5.6 kB          190 kB
04:59:02.667 ├ ƒ /admin/quotations                                    9.73 kB         252 kB
04:59:02.668 ├ ○ /admin/settings                                      9.43 kB         162 kB
04:59:02.668 ├ ○ /admin/settings/customers                            2.81 kB         109 kB
04:59:02.668 ├ ○ /admin/shipments                                     14.5 kB         132 kB
04:59:02.668 ├ ƒ /admin/shipments/[id]                                6.14 kB         170 kB
04:59:02.668 ├ ○ /admin/shipping                                      5.12 kB         244 kB
04:59:02.668 ├ ƒ /api/admin/approve-member                            722 B           107 kB
04:59:02.668 ├ ƒ /api/admin/contracts/[contractId]/download           722 B           107 kB
04:59:02.669 ├ ƒ /api/admin/contracts/[contractId]/send-signature     722 B           107 kB
04:59:02.669 ├ ƒ /api/admin/contracts/request-signature               722 B           107 kB
04:59:02.669 ├ ƒ /api/admin/contracts/send-reminder                   722 B           107 kB
04:59:02.669 ├ ƒ /api/admin/contracts/workflow                        722 B           107 kB
04:59:02.669 ├ ƒ /api/admin/convert-to-order                          722 B           107 kB
04:59:02.669 ├ ƒ /api/admin/coupons                                   722 B           107 kB
04:59:02.669 ├ ƒ /api/admin/coupons/%5Bid%5D                          722 B           107 kB
04:59:02.669 ├ ƒ /api/admin/customers/[id]                            722 B           107 kB
04:59:02.669 ├ ƒ /api/admin/customers/[id]/contact-history            722 B           107 kB
04:59:02.670 ├ ƒ /api/admin/customers/management                      722 B           107 kB
04:59:02.670 ├ ƒ /api/admin/customers/management/export               722 B           107 kB
04:59:02.670 ├ ƒ /api/admin/dashboard/statistics                      722 B           107 kB
04:59:02.670 ├ ƒ /api/admin/dashboard/unified-stats                   722 B           107 kB
04:59:02.670 ├ ƒ /api/admin/delivery/tracking/[orderId]               722 B           107 kB
04:59:02.670 ├ ƒ /api/admin/email/send                                722 B           107 kB
04:59:02.670 ├ ƒ /api/admin/generate-work-order                       722 B           107 kB
04:59:02.670 ├ ƒ /api/admin/inventory/adjust                          722 B           107 kB
04:59:02.671 ├ ƒ /api/admin/inventory/history/[productId]             722 B           107 kB
04:59:02.671 ├ ƒ /api/admin/inventory/items                           722 B           107 kB
04:59:02.671 ├ ƒ /api/admin/inventory/receipts                        722 B           107 kB
04:59:02.671 ├ ƒ /api/admin/inventory/record-entry                    722 B           107 kB
04:59:02.671 ├ ƒ /api/admin/inventory/update                          722 B           107 kB
04:59:02.672 ├ ƒ /api/admin/notifications                             722 B           107 kB
04:59:02.672 ├ ƒ /api/admin/notifications/[id]                        722 B           107 kB
04:59:02.672 ├ ƒ /api/admin/notifications/[id]/read                   722 B           107 kB
04:59:02.672 ├ ƒ /api/admin/notifications/create                      722 B           107 kB
04:59:02.672 ├ ƒ /api/admin/notifications/unread-count                722 B           107 kB
04:59:02.672 ├ ƒ /api/admin/orders                                    722 B           107 kB
04:59:02.672 ├ ƒ /api/admin/orders/[id]/apply-discount                722 B           107 kB
04:59:02.673 ├ ƒ /api/admin/orders/[id]/billing-address               722 B           107 kB
04:59:02.673 ├ ƒ /api/admin/orders/[id]/cancellation                  722 B           107 kB
04:59:02.673 ├ ƒ /api/admin/orders/[id]/comments                      722 B           107 kB
04:59:02.673 ├ ƒ /api/admin/orders/[id]/correction                    722 B           107 kB
04:59:02.673 ├ ƒ /api/admin/orders/[id]/correction/[revisionId]       722 B           107 kB
04:59:02.673 ├ ƒ /api/admin/orders/[id]/data-receipt                  722 B           107 kB
04:59:02.673 ├ ƒ /api/admin/orders/[id]/delivery-address              722 B           107 kB
04:59:02.674 ├ ƒ /api/admin/orders/[id]/delivery-note                 722 B           107 kB
04:59:02.674 ├ ƒ /api/admin/orders/[id]/files/[fileId]/download       722 B           107 kB
04:59:02.674 ├ ƒ /api/admin/orders/[id]/items                         722 B           107 kB
04:59:02.674 ├ ƒ /api/admin/orders/[id]/korea-send-status             722 B           107 kB
04:59:02.674 ├ ƒ /api/admin/orders/[id]/notes                         722 B           107 kB
04:59:02.675 ├ ƒ /api/admin/orders/[id]/payment-confirmation          722 B           107 kB
04:59:02.675 ├ ƒ /api/admin/orders/[id]/send-to-korea                 722 B           107 kB
04:59:02.675 ├ ƒ /api/admin/orders/[id]/shipping-info                 722 B           107 kB
04:59:02.675 ├ ƒ /api/admin/orders/[id]/specification-change          722 B           107 kB
04:59:02.675 ├ ƒ /api/admin/orders/[id]/start-production              722 B           107 kB
04:59:02.676 ├ ƒ /api/admin/orders/[id]/status                        722 B           107 kB
04:59:02.676 ├ ƒ /api/admin/orders/[id]/status-history                722 B           107 kB
04:59:02.676 ├ ƒ /api/admin/orders/bulk-status                        722 B           107 kB
04:59:02.676 ├ ƒ /api/admin/orders/statistics                         722 B           107 kB
04:59:02.676 ├ ƒ /api/admin/performance/metrics                       722 B           107 kB
04:59:02.677 ├ ƒ /api/admin/production-jobs/[id]                      722 B           107 kB
04:59:02.677 ├ ƒ /api/admin/production/[orderId]                      722 B           107 kB
04:59:02.677 ├ ƒ /api/admin/production/jobs                           722 B           107 kB
04:59:02.677 ├ ƒ /api/admin/production/jobs/[id]                      722 B           107 kB
04:59:02.677 ├ ƒ /api/admin/production/update-status                  722 B           107 kB
04:59:02.678 ├ ƒ /api/admin/quotations                                722 B           107 kB
04:59:02.678 ├ ƒ /api/admin/quotations/[id]                           722 B           107 kB
04:59:02.678 ├ ƒ /api/admin/quotations/[id]/cost-breakdown            722 B           107 kB
04:59:02.678 ├ ƒ /api/admin/quotations/[id]/export                    722 B           107 kB
04:59:02.678 ├ ƒ /api/admin/settings                                  722 B           107 kB
04:59:02.678 ├ ƒ /api/admin/settings/%5Bkey%5D                        722 B           107 kB
04:59:02.678 ├ ƒ /api/admin/settings/cache/invalidate                 722 B           107 kB
04:59:02.678 ├ ƒ /api/admin/settings/customer-markup                  722 B           107 kB
04:59:02.679 ├ ƒ /api/admin/settings/customer-markup/%5Bid%5D         722 B           107 kB
04:59:02.679 ├ ƒ /api/admin/settings/designer-emails                  722 B           107 kB
04:59:02.679 ├ ƒ /api/admin/shipments/[id]/tracking                   722 B           107 kB
04:59:02.679 ├ ƒ /api/admin/shipping/deliveries/complete              722 B           107 kB
04:59:02.679 ├ ƒ /api/admin/shipping/shipments                        722 B           107 kB
04:59:02.679 ├ ƒ /api/admin/shipping/tracking                         722 B           107 kB
04:59:02.679 ├ ƒ /api/admin/shipping/tracking/[id]                    722 B           107 kB
04:59:02.679 ├ ƒ /api/admin/test-email                                722 B           107 kB
04:59:02.680 ├ ƒ /api/admin/users                                     722 B           107 kB
04:59:02.681 ├ ƒ /api/admin/users/[id]/addresses                      722 B           107 kB
04:59:02.681 ├ ƒ /api/admin/users/[id]/approve                        722 B           107 kB
04:59:02.681 ├ ƒ /api/admin/users/approve                             722 B           107 kB
04:59:02.681 ├ ƒ /api/admin/users/pending                             722 B           107 kB
04:59:02.681 ├ ƒ /api/admin/users/reject                              722 B           107 kB
04:59:02.681 ├ ƒ /api/ai-parser/approve                               722 B           107 kB
04:59:02.681 ├ ƒ /api/ai-parser/extract                               722 B           107 kB
04:59:02.681 ├ ƒ /api/ai-parser/reprocess                             722 B           107 kB
04:59:02.682 ├ ƒ /api/ai-parser/upload                                722 B           107 kB
04:59:02.682 ├ ƒ /api/ai-parser/validate                              722 B           107 kB
04:59:02.682 ├ ƒ /api/ai/parse                                        722 B           107 kB
04:59:02.682 ├ ƒ /api/ai/review                                       722 B           107 kB
04:59:02.682 ├ ƒ /api/ai/specs                                        722 B           107 kB
04:59:02.682 ├ ƒ /api/analytics/vitals                                722 B           107 kB
04:59:02.682 ├ ƒ /api/auth/current-user                               722 B           107 kB
04:59:02.682 ├ ƒ /api/auth/forgot-password                            722 B           107 kB
04:59:02.682 ├ ƒ /api/auth/register                                   722 B           107 kB
04:59:02.683 ├ ƒ /api/auth/register/create-profile                    722 B           107 kB
04:59:02.683 ├ ƒ /api/auth/reset-password                             722 B           107 kB
04:59:02.683 ├ ƒ /api/auth/session                                    722 B           107 kB
04:59:02.683 ├ ƒ /api/auth/signin                                     722 B           107 kB
04:59:02.683 ├ ƒ /api/auth/signout                                    722 B           107 kB
04:59:02.683 ├ ƒ /api/auth/verify-email                               722 B           107 kB
04:59:02.683 ├ ƒ /api/b2b/ai-extraction/upload                        722 B           107 kB
04:59:02.683 ├ ƒ /api/b2b/files/upload                                722 B           107 kB
04:59:02.683 ├ ƒ /api/comparison/save                                 722 B           107 kB
04:59:02.684 ├ ƒ /api/contact                                         722 B           107 kB
04:59:02.684 ├ ƒ /api/contract/pdf                                    722 B           107 kB
04:59:02.684 ├ ƒ /api/contract/timestamp                              722 B           107 kB
04:59:02.684 ├ ƒ /api/contract/timestamp/validate                     722 B           107 kB
04:59:02.684 ├ ƒ /api/contract/workflow/action                        722 B           107 kB
04:59:02.685 ├ ƒ /api/contracts                                       722 B           107 kB
04:59:02.685 ├ ƒ /api/coupons/validate                                722 B           107 kB
04:59:02.685 ├ ƒ /api/cron/archive-orders                             722 B           107 kB
04:59:02.685 ├ ƒ /api/debug/auth                                      722 B           107 kB
04:59:02.685 ├ ƒ /api/dev/apply-migration                             722 B           107 kB
04:59:02.685 ├ ƒ /api/dev/set-admin                                   722 B           107 kB
04:59:02.686 ├ ● /api/download/templates/[category]                   722 B           107 kB
04:59:02.686 ├   ├ /api/download/templates/flat_3_side
04:59:02.686 ├   ├ /api/download/templates/stand_up
04:59:02.686 ├   ├ /api/download/templates/box
04:59:02.686 ├   └ [+4 more paths]
04:59:02.686 ├ ƒ /api/download/templates/excel                        722 B           107 kB
04:59:02.687 ├ ƒ /api/download/templates/pdf                          722 B           107 kB
04:59:02.687 ├ ƒ /api/errors/log                                      722 B           107 kB
04:59:02.687 ├ ƒ /api/files/validate                                  722 B           107 kB
04:59:02.687 ├ ƒ /api/member/addresses/billing                        722 B           107 kB
04:59:02.687 ├ ƒ /api/member/addresses/billing/[id]                   722 B           107 kB
04:59:02.687 ├ ƒ /api/member/addresses/delivery                       722 B           107 kB
04:59:02.687 ├ ƒ /api/member/addresses/delivery/[id]                  722 B           107 kB
04:59:02.687 ├ ƒ /api/member/ai-extraction/approve                    722 B           107 kB
04:59:02.687 ├ ƒ /api/member/ai-extraction/status                     722 B           107 kB
04:59:02.688 ├ ƒ /api/member/ai-extraction/upload                     722 B           107 kB
04:59:02.688 ├ ƒ /api/member/auth/resend-verification                 722 B           107 kB
04:59:02.688 ├ ƒ /api/member/auth/verify-email                        722 B           107 kB
04:59:02.688 ├ ƒ /api/member/certificates/generate                    722 B           107 kB
04:59:02.688 ├ ƒ /api/member/dashboard                                722 B           107 kB
04:59:02.688 ├ ƒ /api/member/dashboard/stats                          722 B           107 kB
04:59:02.688 ├ ƒ /api/member/dashboard/unified-stats                  722 B           107 kB
04:59:02.688 ├ ƒ /api/member/delete-account                           722 B           107 kB
04:59:02.688 ├ ƒ /api/member/documents                                722 B           107 kB
04:59:02.689 ├ ƒ /api/member/documents/[id]/download                  722 B           107 kB
04:59:02.689 ├ ƒ /api/member/documents/history                        722 B           107 kB
04:59:02.689 ├ ƒ /api/member/files/[id]/extract                       722 B           107 kB
04:59:02.689 ├ ƒ /api/member/files/upload                             722 B           107 kB
04:59:02.689 ├ ƒ /api/member/hanko/upload                             722 B           107 kB
04:59:02.689 ├ ƒ /api/member/inquiries                                722 B           107 kB
04:59:02.689 ├ ƒ /api/member/invites/accept                           722 B           107 kB
04:59:02.689 ├ ƒ /api/member/invites/send                             722 B           107 kB
04:59:02.689 ├ ƒ /api/member/invoices                                 722 B           107 kB
04:59:02.690 ├ ƒ /api/member/invoices/[invoiceId]/download            722 B           107 kB
04:59:02.690 ├ ƒ /api/member/korea/corrections                        722 B           107 kB
04:59:02.690 ├ ƒ /api/member/korea/corrections/[id]/upload            722 B           107 kB
04:59:02.690 ├ ƒ /api/member/korea/send-data                          722 B           107 kB
04:59:02.690 ├ ƒ /api/member/notifications                            722 B           107 kB
04:59:02.690 ├ ƒ /api/member/notifications/[id]                       722 B           107 kB
04:59:02.690 ├ ƒ /api/member/notifications/[id]/read                  722 B           107 kB
04:59:02.690 ├ ƒ /api/member/notifications/delete-all                 722 B           107 kB
04:59:02.690 ├ ƒ /api/member/notifications/mark-all-read              722 B           107 kB
04:59:02.690 ├ ƒ /api/member/orders                                   722 B           107 kB
04:59:02.691 ├ ƒ /api/member/orders/[id]                              722 B           107 kB
04:59:02.691 ├ ƒ /api/member/orders/[id]/apply-coupon                 722 B           107 kB
04:59:02.691 ├ ƒ /api/member/orders/[id]/approvals                    722 B           107 kB
04:59:02.691 ├ ƒ /api/member/orders/[id]/approvals/[requestId]        722 B           107 kB
04:59:02.691 ├ ƒ /api/member/orders/[id]/approve-modification         722 B           107 kB
04:59:02.691 ├ ƒ /api/member/orders/[id]/billing-address              722 B           107 kB
04:59:02.691 ├ ƒ /api/member/orders/[id]/comments                     722 B           107 kB
04:59:02.691 ├ ƒ /api/member/orders/[id]/comments/[commentId]         722 B           107 kB
04:59:02.691 ├ ƒ /api/member/orders/[id]/data-receipt                 722 B           107 kB
04:59:02.691 ├ ƒ /api/member/orders/[id]/data-receipt/files/[fileId]  722 B           107 kB
04:59:02.692 ├ ƒ /api/member/orders/[id]/delivery-address             722 B           107 kB
04:59:02.692 ├ ƒ /api/member/orders/[id]/design-revisions             722 B           107 kB
04:59:02.692 ├ ƒ /api/member/orders/[id]/production-data              722 B           107 kB
04:59:02.692 ├ ƒ /api/member/orders/[id]/production-logs              722 B           107 kB
04:59:02.692 ├ ƒ /api/member/orders/[id]/request-cancellation         722 B           107 kB
04:59:02.692 ├ ƒ /api/member/orders/[id]/spec-approval                722 B           107 kB
04:59:02.692 ├ ƒ /api/member/orders/[id]/specification-change         722 B           107 kB
04:59:02.692 ├ ƒ /api/member/orders/[id]/status-history               722 B           107 kB
04:59:02.692 ├ ƒ /api/member/orders/[id]/tracking                     722 B           107 kB
04:59:02.692 ├ ƒ /api/member/orders/confirm                           722 B           107 kB
04:59:02.693 ├ ƒ /api/member/quotations                               722 B           107 kB
04:59:02.693 ├ ƒ /api/member/quotations/[id]                          722 B           107 kB
04:59:02.693 ├ ƒ /api/member/quotations/[id]/approve                  722 B           107 kB
04:59:02.693 ├ ƒ /api/member/quotations/[id]/confirm-payment          722 B           107 kB
04:59:02.693 ├ ƒ /api/member/quotations/[id]/convert                  722 B           107 kB
04:59:02.693 ├ ƒ /api/member/quotations/[id]/export                   722 B           107 kB
04:59:02.693 ├ ƒ /api/member/quotations/[id]/invoice                  722 B           107 kB
04:59:02.693 ├ ƒ /api/member/quotations/[id]/save-pdf                 722 B           107 kB
04:59:02.693 ├ ƒ /api/member/samples                                  722 B           107 kB
04:59:02.693 ├ ƒ /api/member/settings                                 722 B           107 kB
04:59:02.694 ├ ƒ /api/member/shipments                                722 B           107 kB
04:59:02.694 ├ ƒ /api/member/spec-sheets/[id]/approve                 722 B           107 kB
04:59:02.694 ├ ƒ /api/member/spec-sheets/[id]/reject                  722 B           107 kB
04:59:02.694 ├ ƒ /api/member/spec-sheets/generate                     722 B           107 kB
04:59:02.694 ├ ƒ /api/member/status                                   722 B           107 kB
04:59:02.694 ├ ƒ /api/member/stock-in                                 722 B           107 kB
04:59:02.694 ├ ƒ /api/member/work-orders                              722 B           107 kB
04:59:02.694 ├ ƒ /api/notes                                           722 B           107 kB
04:59:02.694 ├ ƒ /api/notes/[id]                                      722 B           107 kB
04:59:02.694 ├ ƒ /api/notifications                                   722 B           107 kB
04:59:02.694 ├ ƒ /api/notifications/[id]                              722 B           107 kB
04:59:02.695 ├ ƒ /api/notifications/[id]/read                         722 B           107 kB
04:59:02.695 ├ ƒ /api/notifications/mark-all-read                     722 B           107 kB
04:59:02.695 ├ ƒ /api/notifications/unread-count                      722 B           107 kB
04:59:02.695 ├ ƒ /api/orders                                          722 B           107 kB
04:59:02.695 ├ ƒ /api/orders/[id]                                     722 B           107 kB
04:59:02.695 ├ ƒ /api/orders/[id]/cancel                              722 B           107 kB
04:59:02.695 ├ ƒ /api/orders/[id]/status                              722 B           107 kB
04:59:02.695 ├ ƒ /api/orders/cancel                                   722 B           107 kB
04:59:02.695 ├ ƒ /api/orders/create                                   722 B           107 kB
04:59:02.695 ├ ƒ /api/orders/receive                                  722 B           107 kB
04:59:02.695 ├ ƒ /api/orders/reorder                                  722 B           107 kB
04:59:02.696 ├ ƒ /api/orders/update                                   722 B           107 kB
04:59:02.696 ├ ƒ /api/payments/confirm                                722 B           107 kB
04:59:02.696 ├ ƒ /api/premium-content/download                        722 B           107 kB
04:59:02.696 ├ ƒ /api/products                                        722 B           107 kB
04:59:02.696 ├ ƒ /api/products/categories                             722 B           107 kB
04:59:02.697 ├ ƒ /api/products/filter                                 722 B           107 kB
04:59:02.697 ├ ƒ /api/products/search                                 722 B           107 kB
04:59:02.697 ├ ƒ /api/profile                                         722 B           107 kB
04:59:02.697 ├ ƒ /api/profile/[id]                                    722 B           107 kB
04:59:02.697 ├ ƒ /api/quotation                                       722 B           107 kB
04:59:02.697 ├ ƒ /api/quotation/pdf                                   722 B           107 kB
04:59:02.698 ├ ƒ /api/quotations/guest-save                           722 B           107 kB
04:59:02.698 ├ ƒ /api/quotations/save                                 722 B           107 kB
04:59:02.698 ├ ƒ /api/quotes/excel                                    722 B           107 kB
04:59:02.698 ├ ƒ /api/quotes/pdf                                      722 B           107 kB
04:59:02.698 ├ ƒ /api/quotitions/[id]/confirm-transfer                722 B           107 kB
04:59:02.698 ├ ƒ /api/registry/corporate-number                       722 B           107 kB
04:59:02.698 ├ ƒ /api/registry/postal-code                            722 B           107 kB
04:59:02.699 ├ ƒ /api/revalidate                                      722 B           107 kB
04:59:02.699 ├ ƒ /api/samples                                         722 B           107 kB
04:59:02.699 ├ ƒ /api/samples/request                                 722 B           107 kB
04:59:02.699 ├ ƒ /api/settings                                        722 B           107 kB
04:59:02.699 ├ ƒ /api/shipments                                       722 B           107 kB
04:59:02.699 ├ ƒ /api/shipments/[id]                                  722 B           107 kB
04:59:02.699 ├ ƒ /api/shipments/[id]/[trackingId]/update-tracking     722 B           107 kB
04:59:02.700 ├ ƒ /api/shipments/[id]/label                            722 B           107 kB
04:59:02.700 ├ ƒ /api/shipments/[id]/schedule-pickup                  722 B           107 kB
04:59:02.700 ├ ƒ /api/shipments/[id]/track                            722 B           107 kB
04:59:02.700 ├ ƒ /api/shipments/bulk-create                           722 B           107 kB
04:59:02.700 ├ ƒ /api/shipments/create                                722 B           107 kB
04:59:02.700 ├ ƒ /api/shipments/tracking                              722 B           107 kB
04:59:02.701 ├ ƒ /api/signature/cancel                                722 B           107 kB
04:59:02.701 ├ ƒ /api/signature/local/save                            722 B           107 kB
04:59:02.702 ├ ƒ /api/signature/send                                  722 B           107 kB
04:59:02.702 ├ ƒ /api/signature/status/[id]                           722 B           107 kB
04:59:02.702 ├ ƒ /api/signature/webhook                               722 B           107 kB
04:59:02.702 ├ ƒ /api/specsheet/approval                              722 B           107 kB
04:59:02.703 ├ ƒ /api/specsheet/pdf                                   722 B           107 kB
04:59:02.703 ├ ƒ /api/specsheet/versions                              722 B           107 kB
04:59:02.703 ├ ƒ /api/supabase-mcp/execute                            722 B           107 kB
04:59:02.703 ├ ƒ /api/templates                                       722 B           107 kB
04:59:02.703 ├ ƒ /archives                                            8.45 kB         175 kB
04:59:02.703 ├ ƒ /auth/error                                          203 B           110 kB
04:59:02.704 ├ ƒ /auth/forgot-password                                2.99 kB         216 kB
04:59:02.704 ├ ƒ /auth/pending                                        2.68 kB         162 kB
04:59:02.704 ├ ○ /auth/register                                       1.73 kB         221 kB
04:59:02.705 ├ ○ /auth/reset-password                                 3.38 kB         216 kB
04:59:02.705 ├ ○ /auth/signin                                         4.37 kB         217 kB
04:59:02.705 ├ ƒ /auth/signin/form-post                               722 B           107 kB
04:59:02.705 ├ ○ /auth/signout                                        1.48 kB         161 kB
04:59:02.705 ├ ○ /auth/suspended                                      203 B           110 kB
04:59:02.705 ├ ○ /cart                                                7.99 kB         171 kB
04:59:02.705 ├ ○ /catalog                                             15 kB           185 kB
04:59:02.706 ├ ● /catalog/[slug]                                      8.15 kB         194 kB
04:59:02.706 ├   ├ /catalog/three-seal-001
04:59:02.706 ├   ├ /catalog/stand-pouch-001
04:59:02.706 ├   ├ /catalog/box-pouch-001
04:59:02.706 ├   └ [+3 more paths]
04:59:02.706 ├ ○ /compare                                             8.51 kB         168 kB
04:59:02.707 ├ ○ /compare/shared                                      722 B           107 kB
04:59:02.707 ├ ○ /contact                                             7.37 kB         148 kB
04:59:02.707 ├ ○ /contact/thank-you                                   203 B           110 kB
04:59:02.707 ├ ○ /csr                                                 722 B           107 kB
04:59:02.707 ├ ○ /data-templates                                      5.63 kB         181 kB
04:59:02.707 ├ ○ /design-system                                       7.42 kB         192 kB
04:59:02.707 ├ ○ /flow                                                3.02 kB         178 kB
04:59:02.707 ├ ○ /guide                                               684 B           157 kB
04:59:02.707 ├ ○ /guide/color                                         1.9 kB          108 kB
04:59:02.707 ├ ○ /guide/environmentaldisplay                          1.9 kB          108 kB
04:59:02.707 ├ ○ /guide/image                                         1.9 kB          108 kB
04:59:02.708 ├ ○ /guide/shirohan                                      1.9 kB          108 kB
04:59:02.708 ├ ○ /guide/size                                          1.9 kB          108 kB
04:59:02.708 ├ ƒ /industry/cosmetics                                  4.33 kB         147 kB
04:59:02.708 ├ ƒ /industry/electronics                                4.58 kB         147 kB
04:59:02.708 ├ ƒ /industry/food-manufacturing                         3.29 kB         146 kB
04:59:02.710 ├ ƒ /industry/pharmaceutical                             4.79 kB         147 kB
04:59:02.711 ├ ○ /inquiry/detailed                                    15.9 kB         198 kB
04:59:02.711 ├ ○ /legal                                               722 B           107 kB
04:59:02.711 ├ ○ /member/billing-addresses                            3.76 kB         190 kB
04:59:02.711 ├ ○ /member/contracts                                    6.05 kB         190 kB
04:59:02.711 ├ ƒ /member/dashboard                                    8.65 kB         273 kB
04:59:02.712 ├ ○ /member/deliveries                                   5.48 kB         190 kB
04:59:02.712 ├ ○ /member/edit                                         5.2 kB          242 kB
04:59:02.712 ├ ○ /member/inquiries                                    4.07 kB         252 kB
04:59:02.712 ├ ○ /member/invoices                                     4.07 kB         252 kB
04:59:02.712 ├ ○ /member/notifications                                4.92 kB         249 kB
04:59:02.713 ├ ƒ /member/orders                                       5.39 kB         276 kB
04:59:02.713 ├ ƒ /member/orders/[id]                                  3.2 kB          291 kB
04:59:02.713 ├ ƒ /member/orders/[id]/confirmation                     5.67 kB         120 kB
04:59:02.713 ├ ƒ /member/orders/[id]/data-receipt                     9.37 kB         124 kB
04:59:02.713 ├ ƒ /member/orders/[id]/preparation                      5.43 kB         190 kB
04:59:02.714 ├ ƒ /member/orders/[id]/spec-approval                    4.66 kB         123 kB
04:59:02.714 ├ ○ /member/orders/history                               587 B           107 kB
04:59:02.714 ├ ○ /member/orders/new                                   722 B           107 kB
04:59:02.714 ├ ○ /member/orders/reorder                               722 B           107 kB
04:59:02.714 ├ ○ /member/profile                                      5.5 kB          256 kB
04:59:02.715 ├ ○ /member/quotations                                   13.8 kB         488 kB
04:59:02.715 ├ ƒ /member/quotations/[id]                              53.8 kB         564 kB
04:59:02.715 ├ ƒ /member/quotations/[id]/confirm                      8.28 kB         148 kB
04:59:02.715 ├ ○ /member/quotations/request                           12.6 kB         246 kB
04:59:02.715 ├ ○ /member/samples                                      3.79 kB         188 kB
04:59:02.716 ├ ○ /member/settings                                     5.6 kB          243 kB
04:59:02.716 ├ ○ /members                                             6.79 kB         178 kB
04:59:02.716 ├ ƒ /news                                                8.04 kB         168 kB
04:59:02.716 ├ ○ /premium-content                                     6.85 kB         188 kB
04:59:02.716 ├ ○ /pricing                                             513 B           107 kB
04:59:02.717 ├ ○ /print                                               216 B           175 kB
04:59:02.717 ├ ○ /privacy                                             722 B           107 kB
04:59:02.717 ├ ○ /profile                                             8.31 kB         175 kB
04:59:02.717 ├ ○ /quote-simulator                                     5.4 kB          211 kB
04:59:02.717 ├ ○ /robots.txt                                          0 B                0 B
04:59:02.717 ├ ○ /samples                                             12.8 kB         203 kB
04:59:02.718 ├ ○ /samples/thank-you                                   203 B           110 kB
04:59:02.718 ├ ○ /service                                             5.83 kB         166 kB
04:59:02.718 ├ ○ /sitemap.xml                                         0 B                0 B
04:59:02.718 └ ○ /terms                                               722 B           107 kB
04:59:02.718 + First Load JS shared by all                            106 kB
04:59:02.719   ├ chunks/1517-c2153894501a72e4.js                      50.7 kB
04:59:02.719   ├ chunks/4bd1b696-2ed65f1fcfc9c19e.js                  53 kB
04:59:02.719   └ other shared chunks (total)                          2.38 kB
04:59:02.719 
04:59:02.719 
04:59:02.720 ƒ Middleware                                             79.1 kB
04:59:02.724 
04:59:02.724 ○  (Static)   prerendered as static content
04:59:02.724 ●  (SSG)      prerendered as static HTML (uses generateStaticParams)
04:59:02.724 ƒ  (Dynamic)  server-rendered on demand
04:59:02.724 
04:59:03.356 Traced Next.js server files in: 113.483ms
04:59:04.846 Created all serverless functions in: 1.488s
04:59:05.085 Collected static files (public/, static/, .next/static): 75.807ms
04:59:05.711 Build Completed in /vercel/output [2m]
04:59:06.298 Error: Vulnerable version of Next.js detected, please update immediately. Learn More: https://vercel.link/CVE-2025-66478