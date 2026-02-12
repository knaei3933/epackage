05:52:22.279 Running build in Washington, D.C., USA (East) – iad1
05:52:22.279 Build machine configuration: 2 cores, 8 GB
05:52:22.455 Cloning github.com/knaei3933/epackage (Branch: main, Commit: 15b1a20)
05:52:35.232 Cloning completed: 12.777s
05:52:35.670 Restored build cache from previous deployment (ESHCgNUcb6M8a6WFS53hJcoSdY69)
05:52:36.935 Running "vercel build"
05:52:37.546 Vercel CLI 50.15.1
05:52:38.128 Running "install" command: `npm install`...
05:52:45.300 
05:52:45.302 up to date, audited 1390 packages in 7s
05:52:45.304 
05:52:45.304 236 packages are looking for funding
05:52:45.304   run `npm fund` for details
05:52:45.388 
05:52:45.389 26 vulnerabilities (4 moderate, 21 high, 1 critical)
05:52:45.389 
05:52:45.390 To address issues that do not require attention, run:
05:52:45.390   npm audit fix
05:52:45.390 
05:52:45.391 To address all issues (including breaking changes), run:
05:52:45.391   npm audit fix --force
05:52:45.391 
05:52:45.392 Run `npm audit` for details.
05:52:45.428 Detected Next.js version: 16.0.11
05:52:45.429 Running "npm run build"
05:52:45.522 
05:52:45.523 > epackage-lab-web@0.1.0 build
05:52:45.523 > next build --webpack
05:52:45.523 
05:52:45.776 [baseline-browser-mapping] The data in this module is over two months old.  To ensure accurate Baseline data, please update: `npm i baseline-browser-mapping@latest -D`
05:52:46.503    ▲ Next.js 16.0.11 (webpack)
05:52:46.503 
05:52:46.510  ⚠ The "middleware" file convention is deprecated. Please use "proxy" instead. Learn more: https://nextjs.org/docs/messages/middleware-to-proxy
05:52:46.589    Creating an optimized production build ...
05:52:46.784 [baseline-browser-mapping] The data in this module is over two months old.  To ensure accurate Baseline data, please update: `npm i baseline-browser-mapping@latest -D`
05:53:08.622  ⚠ Compiled with warnings in 20.6s
05:53:08.622 
05:53:08.625 ./node_modules/handlebars/lib/index.js
05:53:08.626 require.extensions is not supported by webpack. Use a loader instead.
05:53:08.626 
05:53:08.626 Import trace for requested module:
05:53:08.626 ./node_modules/handlebars/lib/index.js
05:53:08.627 ./src/app/api/contract/pdf/route.ts
05:53:08.627 
05:53:08.627 ./node_modules/handlebars/lib/index.js
05:53:08.627 require.extensions is not supported by webpack. Use a loader instead.
05:53:08.627 
05:53:08.627 Import trace for requested module:
05:53:08.627 ./node_modules/handlebars/lib/index.js
05:53:08.627 ./src/app/api/contract/pdf/route.ts
05:53:08.627 
05:53:08.628 ./node_modules/handlebars/lib/index.js
05:53:08.628 require.extensions is not supported by webpack. Use a loader instead.
05:53:08.628 
05:53:08.628 Import trace for requested module:
05:53:08.628 ./node_modules/handlebars/lib/index.js
05:53:08.628 ./src/app/api/contract/pdf/route.ts
05:53:08.628 
05:53:08.915 [baseline-browser-mapping] The data in this module is over two months old.  To ensure accurate Baseline data, please update: `npm i baseline-browser-mapping@latest -D`
05:53:11.146 [baseline-browser-mapping] The data in this module is over two months old.  To ensure accurate Baseline data, please update: `npm i baseline-browser-mapping@latest -D`
05:53:17.438  ✓ Compiled successfully in 26.6s
05:53:17.441    Skipping validation of types
05:53:17.499    Collecting page data using 1 worker ...
05:53:18.242 [baseline-browser-mapping] The data in this module is over two months old.  To ensure accurate Baseline data, please update: `npm i baseline-browser-mapping@latest -D`
05:53:18.565 [Email] Production mode - configuring email service
05:53:18.566 [Email] SendGrid not configured
05:53:18.567 [Email] No email service configured - using console fallback
05:53:18.739 [EpackMailer] No SMTP configured - using console fallback
05:53:19.243 [createServiceClient] Credentials not configured, using mock client
05:53:19.792 [AccountDeletionEmail] Configuring email service
05:53:19.794 [AccountDeletionEmail] SendGrid not configured
05:53:19.794 [AccountDeletionEmail] No email service configured - using console fallback
05:53:20.201  ⚠ Using edge runtime on a page currently disables static generation for that page
05:53:29.256    Generating static pages using 1 worker (0/83) ...
05:53:29.695 [baseline-browser-mapping] The data in this module is over two months old.  To ensure accurate Baseline data, please update: `npm i baseline-browser-mapping@latest -D`
05:53:30.055 [supabase-browser] Credentials not configured, returning mock client
05:53:30.056  ⨯ useSearchParams() should be wrapped in a suspense boundary at page "/404". Read more: https://nextjs.org/docs/messages/missing-suspense-with-csr-bailout
05:53:30.056     at S (/vercel/path0/.next/server/chunks/4388.js:2:2111)
05:53:30.056     at p (/vercel/path0/.next/server/chunks/4388.js:7:141014)
05:53:30.057     at k (/vercel/path0/.next/server/chunks/256.js:247:29607)
05:53:30.057     at ar (/vercel/path0/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:2:84366)
05:53:30.057     at aa (/vercel/path0/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:2:86185)
05:53:30.059     at aa (/vercel/path0/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:2:104714)
05:53:30.060     at as (/vercel/path0/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:2:107952)
05:53:30.060     at ak (/vercel/path0/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:2:118035)
05:53:30.060     at /vercel/path0/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:2:79040
05:53:30.060     at node:internal/process/task_queues:149:7
05:53:30.060 Error occurred prerendering page "/_not-found". Read more: https://nextjs.org/docs/messages/prerender-error
05:53:30.061 Export encountered an error on /_not-found/page: /_not-found, exiting the build.
05:53:30.064  ⨯ Next.js build worker exited with code: 1 and signal: null
05:53:30.121 Error: Command "npm run build" exited with 1
