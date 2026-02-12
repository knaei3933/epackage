05:59:05.920 Running build in Washington, D.C., USA (East) – iad1
05:59:05.921 Build machine configuration: 2 cores, 8 GB
05:59:06.111 Cloning github.com/knaei3933/epackage (Branch: main, Commit: df1a5e6)
05:59:18.622 Cloning completed: 12.511s
05:59:19.045 Restored build cache from previous deployment (A1ZGNdKWWdXRBbvJxLWFAVLjQ7xh)
05:59:19.462 Running "vercel build"
05:59:20.043 Vercel CLI 50.15.1
05:59:20.644 Running "install" command: `npm install`...
05:59:26.759 
05:59:26.760 up to date, audited 1390 packages in 6s
05:59:26.760 
05:59:26.762 236 packages are looking for funding
05:59:26.762   run `npm fund` for details
05:59:26.849 
05:59:26.850 26 vulnerabilities (4 moderate, 21 high, 1 critical)
05:59:26.850 
05:59:26.851 To address issues that do not require attention, run:
05:59:26.851   npm audit fix
05:59:26.851 
05:59:26.852 To address all issues (including breaking changes), run:
05:59:26.852   npm audit fix --force
05:59:26.853 
05:59:26.853 Run `npm audit` for details.
05:59:26.891 Detected Next.js version: 16.0.11
05:59:26.892 Running "npm run build"
05:59:26.991 
05:59:26.992 > epackage-lab-web@0.1.0 build
05:59:26.992 > next build --webpack
05:59:26.992 
05:59:27.265 [baseline-browser-mapping] The data in this module is over two months old.  To ensure accurate Baseline data, please update: `npm i baseline-browser-mapping@latest -D`
05:59:28.075    ▲ Next.js 16.0.11 (webpack)
05:59:28.075 
05:59:28.083  ⚠ The "middleware" file convention is deprecated. Please use "proxy" instead. Learn more: https://nextjs.org/docs/messages/middleware-to-proxy
05:59:28.166    Creating an optimized production build ...
05:59:28.361 [baseline-browser-mapping] The data in this module is over two months old.  To ensure accurate Baseline data, please update: `npm i baseline-browser-mapping@latest -D`
05:59:50.738  ⚠ Compiled with warnings in 21.0s
05:59:50.739 
05:59:50.740 ./node_modules/handlebars/lib/index.js
05:59:50.740 require.extensions is not supported by webpack. Use a loader instead.
05:59:50.740 
05:59:50.740 Import trace for requested module:
05:59:50.740 ./node_modules/handlebars/lib/index.js
05:59:50.741 ./src/app/api/contract/pdf/route.ts
05:59:50.741 
05:59:50.741 ./node_modules/handlebars/lib/index.js
05:59:50.741 require.extensions is not supported by webpack. Use a loader instead.
05:59:50.741 
05:59:50.741 Import trace for requested module:
05:59:50.741 ./node_modules/handlebars/lib/index.js
05:59:50.741 ./src/app/api/contract/pdf/route.ts
05:59:50.741 
05:59:50.741 ./node_modules/handlebars/lib/index.js
05:59:50.741 require.extensions is not supported by webpack. Use a loader instead.
05:59:50.741 
05:59:50.741 Import trace for requested module:
05:59:50.741 ./node_modules/handlebars/lib/index.js
05:59:50.742 ./src/app/api/contract/pdf/route.ts
05:59:50.742 
05:59:51.033 [baseline-browser-mapping] The data in this module is over two months old.  To ensure accurate Baseline data, please update: `npm i baseline-browser-mapping@latest -D`
05:59:53.467 [baseline-browser-mapping] The data in this module is over two months old.  To ensure accurate Baseline data, please update: `npm i baseline-browser-mapping@latest -D`
06:00:02.035 <w> [webpack.cache.PackFileCacheStrategy] Skipped not serializable cache item 'Compilation/modules|/vercel/path0/node_modules/next/dist/build/webpack/loaders/css-loader/src/index.js??ruleSet[1].rules[15].oneOf[10].use[2]!/vercel/path0/node_modules/next/dist/build/webpack/loaders/postcss-loader/src/index.js??ruleSet[1].rules[15].oneOf[10].use[3]!/vercel/path0/src/app/globals.css': No serializer registered for Warning
06:00:02.035 <w> while serializing webpack/lib/cache/PackFileCacheStrategy.PackContentItems -> webpack/lib/NormalModule -> Array { 1 items } -> webpack/lib/ModuleWarning -> Warning
06:00:02.084  ⚠ Compiled with warnings in 7.5s
06:00:02.084 
06:00:02.085 ./src/app/globals.css.webpack[javascript/auto]!=!./node_modules/next/dist/build/webpack/loaders/css-loader/src/index.js??ruleSet[1].rules[15].oneOf[10].use[2]!./node_modules/next/dist/build/webpack/loaders/postcss-loader/src/index.js??ruleSet[1].rules[15].oneOf[10].use[3]!./src/app/globals.css
06:00:02.085 Warning
06:00:02.085 
06:00:02.085 (837:5) autoprefixer: Replace color-adjust to print-color-adjust. The color-adjust shorthand is currently deprecated.
06:00:02.085 
06:00:02.085 Import trace for requested module:
06:00:02.085 ./src/app/globals.css.webpack[javascript/auto]!=!./node_modules/next/dist/build/webpack/loaders/css-loader/src/index.js??ruleSet[1].rules[15].oneOf[10].use[2]!./node_modules/next/dist/build/webpack/loaders/postcss-loader/src/index.js??ruleSet[1].rules[15].oneOf[10].use[3]!./src/app/globals.css
06:00:02.086 ./src/app/globals.css
06:00:02.086 
06:00:02.143  ✓ Compiled successfully in 29.5s
06:00:02.146    Skipping validation of types
06:00:02.206    Collecting page data using 1 worker ...
06:00:02.973 [baseline-browser-mapping] The data in this module is over two months old.  To ensure accurate Baseline data, please update: `npm i baseline-browser-mapping@latest -D`
06:00:03.307 [Email] Production mode - configuring email service
06:00:03.308 [Email] SendGrid not configured
06:00:03.309 [Email] No email service configured - using console fallback
06:00:03.448 [EpackMailer] No SMTP configured - using console fallback
06:00:03.994 [createServiceClient] Credentials not configured, using mock client
06:00:04.542 [AccountDeletionEmail] Configuring email service
06:00:04.543 [AccountDeletionEmail] SendGrid not configured
06:00:04.544 [AccountDeletionEmail] No email service configured - using console fallback
06:00:05.041  ⚠ Using edge runtime on a page currently disables static generation for that page
06:00:15.322    Generating static pages using 1 worker (0/83) ...
06:00:15.784 [baseline-browser-mapping] The data in this module is over two months old.  To ensure accurate Baseline data, please update: `npm i baseline-browser-mapping@latest -D`
06:00:16.394 [supabase-browser] Credentials not configured, returning mock client
06:00:16.395  ⨯ useSearchParams() should be wrapped in a suspense boundary at page "/404". Read more: https://nextjs.org/docs/messages/missing-suspense-with-csr-bailout
06:00:16.396     at S (/vercel/path0/.next/server/chunks/4388.js:2:2111)
06:00:16.396     at p (/vercel/path0/.next/server/chunks/4388.js:7:141014)
06:00:16.396     at k (/vercel/path0/.next/server/chunks/256.js:247:29607)
06:00:16.397     at ar (/vercel/path0/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:2:84366)
06:00:16.397     at aa (/vercel/path0/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:2:86185)
06:00:16.398     at aa (/vercel/path0/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:2:104714)
06:00:16.398     at as (/vercel/path0/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:2:107952)
06:00:16.398     at ak (/vercel/path0/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:2:118035)
06:00:16.399     at /vercel/path0/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:2:79040
06:00:16.399     at node:internal/process/task_queues:149:7
06:00:16.399 Error occurred prerendering page "/_not-found". Read more: https://nextjs.org/docs/messages/prerender-error
06:00:16.399 Export encountered an error on /_not-found/page: /_not-found, exiting the build.
06:00:16.402  ⨯ Next.js build worker exited with code: 1 and signal: null
06:00:16.466 Error: Command "npm run build" exited with 1