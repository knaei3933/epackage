09:35:32.679 Running build in Washington, D.C., USA (East) – iad1
09:35:32.679 Build machine configuration: 2 cores, 8 GB
09:35:32.689 Cloning github.com/knaei3933/epackage (Branch: main, Commit: 039e808)
09:35:32.690 Skipping build cache, deployment was triggered without cache.
09:35:44.343 Cloning completed: 11.654s
09:35:45.244 Running "vercel build"
09:35:45.824 Vercel CLI 50.15.1
09:35:46.432 Running "install" command: `npm install`...
09:35:50.671 npm warn deprecated scmp@2.1.0: Just use Node.js's crypto.timingSafeEqual()
09:35:50.709 npm warn deprecated rimraf@2.7.1: Rimraf versions prior to v4 are no longer supported
09:35:51.821 npm warn deprecated lodash.isequal@4.5.0: This package is deprecated. Use require('node:util').isDeepStrictEqual instead.
09:35:52.249 npm warn deprecated inflight@1.0.6: This module is not supported, and leaks memory. Do not use it. Check out lru-cache if you want a good and tested way to coalesce async requests by a key value, which is much more comprehensive and powerful.
09:35:53.710 npm warn deprecated fstream@1.0.12: This package is no longer supported.
09:35:53.828 npm warn deprecated node-domexception@1.0.0: Use your platform's native DOMException instead
09:35:54.784 npm warn deprecated @supabase/auth-helpers-shared@0.7.0: This package is now deprecated - please use the @supabase/ssr package instead.
09:35:56.104 npm warn deprecated @supabase/auth-helpers-nextjs@0.10.0: This package is now deprecated - please use the @supabase/ssr package instead.
09:35:57.386 npm warn deprecated glob@7.2.3: Glob versions prior to v9 are no longer supported
09:35:57.481 npm warn deprecated glob@7.2.3: Glob versions prior to v9 are no longer supported
09:35:57.509 npm warn deprecated glob@7.2.3: Glob versions prior to v9 are no longer supported
09:35:58.257 npm warn deprecated glob@7.2.3: Glob versions prior to v9 are no longer supported
09:36:01.636 npm warn deprecated @mswjs/data@0.16.2: Package no longer supported. Contact Support at https://www.npmjs.com/support for more info.
09:36:23.299 
09:36:23.300 added 1389 packages, and audited 1390 packages in 37s
09:36:23.300 
09:36:23.300 236 packages are looking for funding
09:36:23.300   run `npm fund` for details
09:36:23.404 
09:36:23.404 26 vulnerabilities (4 moderate, 21 high, 1 critical)
09:36:23.405 
09:36:23.405 To address issues that do not require attention, run:
09:36:23.405   npm audit fix
09:36:23.405 
09:36:23.405 To address all issues (including breaking changes), run:
09:36:23.405   npm audit fix --force
09:36:23.405 
09:36:23.405 Run `npm audit` for details.
09:36:23.630 Detected Next.js version: 16.0.11
09:36:23.632 Running "npm run build"
09:36:23.739 
09:36:23.739 > epackage-lab-web@0.1.0 build
09:36:23.739 > next build --webpack
09:36:23.740 
09:36:24.039 [baseline-browser-mapping] The data in this module is over two months old.  To ensure accurate Baseline data, please update: `npm i baseline-browser-mapping@latest -D`
09:36:24.623 Attention: Next.js now collects completely anonymous telemetry regarding usage.
09:36:24.624 This information is used to shape Next.js' roadmap and prioritize features.
09:36:24.624 You can learn more, including how to opt-out if you'd not like to participate in this anonymous program, by visiting the following URL:
09:36:24.625 https://nextjs.org/telemetry
09:36:24.625 
09:36:24.636    ▲ Next.js 16.0.11 (webpack)
09:36:24.637 
09:36:24.640  ⚠ The "middleware" file convention is deprecated. Please use "proxy" instead. Learn more: https://nextjs.org/docs/messages/middleware-to-proxy
09:36:24.724    Creating an optimized production build ...
09:36:24.919 [baseline-browser-mapping] The data in this module is over two months old.  To ensure accurate Baseline data, please update: `npm i baseline-browser-mapping@latest -D`
09:37:12.841  ⚠ Compiled with warnings in 47s
09:37:12.841 
09:37:12.841 ./node_modules/handlebars/lib/index.js
09:37:12.841 require.extensions is not supported by webpack. Use a loader instead.
09:37:12.841 
09:37:12.841 Import trace for requested module:
09:37:12.842 ./node_modules/handlebars/lib/index.js
09:37:12.842 ./src/app/api/contract/pdf/route.ts
09:37:12.842 
09:37:12.842 ./node_modules/handlebars/lib/index.js
09:37:12.842 require.extensions is not supported by webpack. Use a loader instead.
09:37:12.842 
09:37:12.842 Import trace for requested module:
09:37:12.842 ./node_modules/handlebars/lib/index.js
09:37:12.842 ./src/app/api/contract/pdf/route.ts
09:37:12.842 
09:37:12.842 ./node_modules/handlebars/lib/index.js
09:37:12.842 require.extensions is not supported by webpack. Use a loader instead.
09:37:12.842 
09:37:12.842 Import trace for requested module:
09:37:12.842 ./node_modules/handlebars/lib/index.js
09:37:12.842 ./src/app/api/contract/pdf/route.ts
09:37:12.842 
09:37:13.207 [baseline-browser-mapping] The data in this module is over two months old.  To ensure accurate Baseline data, please update: `npm i baseline-browser-mapping@latest -D`
09:37:18.140 <w> [webpack.cache.PackFileCacheStrategy] Serializing big strings (130kiB) impacts deserialization performance (consider using Buffer instead and decode when needed)
09:37:18.508  ⚠ Compiled with warnings in 4.2s
09:37:18.508 
09:37:18.509 ./node_modules/@supabase/realtime-js/dist/module/lib/websocket-factory.js
09:37:18.509 A Node.js API is used (process.versions at line: 39) which is not supported in the Edge Runtime.
09:37:18.509 Learn more: https://nextjs.org/docs/api-reference/edge-runtime
09:37:18.509 
09:37:18.509 Import trace for requested module:
09:37:18.509 ./node_modules/@supabase/realtime-js/dist/module/lib/websocket-factory.js
09:37:18.509 ./node_modules/@supabase/realtime-js/dist/module/index.js
09:37:18.509 ./node_modules/@supabase/supabase-js/dist/index.mjs
09:37:18.509 ./node_modules/@supabase/ssr/dist/module/createBrowserClient.js
09:37:18.509 ./node_modules/@supabase/ssr/dist/module/index.js
09:37:18.510 
09:37:18.510 ./node_modules/@supabase/supabase-js/dist/index.mjs
09:37:18.510 A Node.js API is used (process.version at line: 395) which is not supported in the Edge Runtime.
09:37:18.510 Learn more: https://nextjs.org/docs/api-reference/edge-runtime
09:37:18.510 
09:37:18.510 Import trace for requested module:
09:37:18.510 ./node_modules/@supabase/supabase-js/dist/index.mjs
09:37:18.510 ./node_modules/@supabase/ssr/dist/module/createBrowserClient.js
09:37:18.510 ./node_modules/@supabase/ssr/dist/module/index.js
09:37:18.510 
09:37:18.786 [baseline-browser-mapping] The data in this module is over two months old.  To ensure accurate Baseline data, please update: `npm i baseline-browser-mapping@latest -D`
09:37:37.960 <w> [webpack.cache.PackFileCacheStrategy] Skipped not serializable cache item 'Compilation/modules|/vercel/path0/node_modules/next/dist/build/webpack/loaders/css-loader/src/index.js??ruleSet[1].rules[15].oneOf[10].use[2]!/vercel/path0/node_modules/next/dist/build/webpack/loaders/postcss-loader/src/index.js??ruleSet[1].rules[15].oneOf[10].use[3]!/vercel/path0/src/app/globals.css': No serializer registered for Warning
09:37:37.960 <w> while serializing webpack/lib/cache/PackFileCacheStrategy.PackContentItems -> webpack/lib/NormalModule -> Array { 1 items } -> webpack/lib/ModuleWarning -> Warning
09:37:40.259  ⚠ Compiled with warnings in 20.3s
09:37:40.259 
09:37:40.259 ./src/app/globals.css.webpack[javascript/auto]!=!./node_modules/next/dist/build/webpack/loaders/css-loader/src/index.js??ruleSet[1].rules[15].oneOf[10].use[2]!./node_modules/next/dist/build/webpack/loaders/postcss-loader/src/index.js??ruleSet[1].rules[15].oneOf[10].use[3]!./src/app/globals.css
09:37:40.259 Warning
09:37:40.259 
09:37:40.259 (837:5) autoprefixer: Replace color-adjust to print-color-adjust. The color-adjust shorthand is currently deprecated.
09:37:40.259 
09:37:40.259 Import trace for requested module:
09:37:40.259 ./src/app/globals.css.webpack[javascript/auto]!=!./node_modules/next/dist/build/webpack/loaders/css-loader/src/index.js??ruleSet[1].rules[15].oneOf[10].use[2]!./node_modules/next/dist/build/webpack/loaders/postcss-loader/src/index.js??ruleSet[1].rules[15].oneOf[10].use[3]!./src/app/globals.css
09:37:40.259 ./src/app/globals.css
09:37:40.259 
09:37:40.345  ✓ Compiled successfully in 71s
09:37:40.349    Skipping validation of types
09:37:40.409    Collecting page data using 1 worker ...
09:37:41.160 [baseline-browser-mapping] The data in this module is over two months old.  To ensure accurate Baseline data, please update: `npm i baseline-browser-mapping@latest -D`
09:37:41.371 [EpackMailer] No SMTP configured - using console fallback
09:37:41.442 [Email] Production mode - configuring email service
09:37:41.443 [Email] SendGrid not configured
09:37:41.443 [Email] No email service configured - using console fallback
09:37:43.132 [AccountDeletionEmail] Configuring email service
09:37:43.134 [AccountDeletionEmail] SendGrid not configured
09:37:43.134 [AccountDeletionEmail] No email service configured - using console fallback
09:37:43.515  ⚠ Using edge runtime on a page currently disables static generation for that page
09:37:52.953    Generating static pages using 1 worker (0/21) ...
09:37:53.428 [baseline-browser-mapping] The data in this module is over two months old.  To ensure accurate Baseline data, please update: `npm i baseline-browser-mapping@latest -D`
09:37:53.815    Generating static pages using 1 worker (5/21) 
09:37:53.816    Generating static pages using 1 worker (10/21) 
09:37:53.816    Generating static pages using 1 worker (15/21) 
09:37:53.817  ✓ Generating static pages using 1 worker (21/21) in 861.9ms
09:37:56.358    Finalizing page optimization ...
09:37:56.362    Collecting build traces ...
09:38:23.144 
09:38:23.150 Route (app)
09:38:23.151 ┌ ƒ /
09:38:23.152 ├ ƒ /_not-found
09:38:23.152 ├ ƒ /about
09:38:23.152 ├ ƒ /admin/approvals
09:38:23.152 ├ ƒ /admin/contracts
09:38:23.153 ├ ƒ /admin/contracts/[id]
09:38:23.153 ├ ƒ /admin/coupons
09:38:23.153 ├ ƒ /admin/customers
09:38:23.153 ├ ƒ /admin/customers/documents
09:38:23.153 ├ ƒ /admin/customers/management
09:38:23.153 ├ ƒ /admin/customers/orders
09:38:23.153 ├ ƒ /admin/customers/orders/[id]
09:38:23.154 ├ ƒ /admin/customers/profile
09:38:23.154 ├ ƒ /admin/customers/support
09:38:23.154 ├ ƒ /admin/dashboard
09:38:23.154 ├ ƒ /admin/notifications
09:38:23.154 ├ ƒ /admin/orders
09:38:23.154 ├ ƒ /admin/orders/[id]
09:38:23.154 ├ ƒ /admin/orders/[id]/correction-upload
09:38:23.154 ├ ƒ /admin/orders/[id]/payment-confirmation
09:38:23.154 ├ ƒ /admin/production/[id]
09:38:23.154 ├ ƒ /admin/quotations
09:38:23.154 ├ ƒ /admin/settings
09:38:23.154 ├ ƒ /admin/settings/customers
09:38:23.154 ├ ƒ /admin/shipments
09:38:23.154 ├ ƒ /admin/shipments/[id]
09:38:23.154 ├ ƒ /admin/shipping
09:38:23.154 ├ ƒ /api/admin/approve-member
09:38:23.154 ├ ƒ /api/admin/contracts/[contractId]/download
09:38:23.154 ├ ƒ /api/admin/contracts/[contractId]/send-signature
09:38:23.154 ├ ƒ /api/admin/contracts/request-signature
09:38:23.154 ├ ƒ /api/admin/contracts/send-reminder
09:38:23.154 ├ ƒ /api/admin/contracts/workflow
09:38:23.154 ├ ƒ /api/admin/convert-to-order
09:38:23.154 ├ ƒ /api/admin/coupons
09:38:23.155 ├ ƒ /api/admin/coupons/%5Bid%5D
09:38:23.155 ├ ƒ /api/admin/customers/[id]
09:38:23.155 ├ ƒ /api/admin/customers/[id]/contact-history
09:38:23.155 ├ ƒ /api/admin/customers/management
09:38:23.155 ├ ƒ /api/admin/customers/management/export
09:38:23.155 ├ ƒ /api/admin/dashboard/statistics
09:38:23.155 ├ ƒ /api/admin/dashboard/unified-stats
09:38:23.155 ├ ƒ /api/admin/delivery/tracking/[orderId]
09:38:23.155 ├ ƒ /api/admin/email/send
09:38:23.155 ├ ƒ /api/admin/generate-work-order
09:38:23.155 ├ ƒ /api/admin/inventory/adjust
09:38:23.155 ├ ƒ /api/admin/inventory/history/[productId]
09:38:23.155 ├ ƒ /api/admin/inventory/items
09:38:23.155 ├ ƒ /api/admin/inventory/receipts
09:38:23.155 ├ ƒ /api/admin/inventory/record-entry
09:38:23.155 ├ ƒ /api/admin/inventory/update
09:38:23.155 ├ ƒ /api/admin/notifications
09:38:23.155 ├ ƒ /api/admin/notifications/[id]
09:38:23.155 ├ ƒ /api/admin/notifications/[id]/read
09:38:23.155 ├ ƒ /api/admin/notifications/create
09:38:23.155 ├ ƒ /api/admin/notifications/unread-count
09:38:23.155 ├ ƒ /api/admin/orders
09:38:23.155 ├ ƒ /api/admin/orders/[id]/apply-discount
09:38:23.155 ├ ƒ /api/admin/orders/[id]/billing-address
09:38:23.155 ├ ƒ /api/admin/orders/[id]/cancellation
09:38:23.155 ├ ƒ /api/admin/orders/[id]/comments
09:38:23.155 ├ ƒ /api/admin/orders/[id]/correction
09:38:23.155 ├ ƒ /api/admin/orders/[id]/correction/[revisionId]
09:38:23.155 ├ ƒ /api/admin/orders/[id]/data-receipt
09:38:23.155 ├ ƒ /api/admin/orders/[id]/delivery-address
09:38:23.155 ├ ƒ /api/admin/orders/[id]/delivery-note
09:38:23.155 ├ ƒ /api/admin/orders/[id]/files/[fileId]/download
09:38:23.155 ├ ƒ /api/admin/orders/[id]/items
09:38:23.155 ├ ƒ /api/admin/orders/[id]/korea-send-status
09:38:23.155 ├ ƒ /api/admin/orders/[id]/notes
09:38:23.155 ├ ƒ /api/admin/orders/[id]/payment-confirmation
09:38:23.155 ├ ƒ /api/admin/orders/[id]/send-to-korea
09:38:23.155 ├ ƒ /api/admin/orders/[id]/shipping-info
09:38:23.155 ├ ƒ /api/admin/orders/[id]/specification-change
09:38:23.155 ├ ƒ /api/admin/orders/[id]/start-production
09:38:23.155 ├ ƒ /api/admin/orders/[id]/status
09:38:23.155 ├ ƒ /api/admin/orders/[id]/status-history
09:38:23.155 ├ ƒ /api/admin/orders/bulk-status
09:38:23.156 ├ ƒ /api/admin/orders/statistics
09:38:23.156 ├ ƒ /api/admin/performance/metrics
09:38:23.156 ├ ƒ /api/admin/production-jobs/[id]
09:38:23.156 ├ ƒ /api/admin/production/[orderId]
09:38:23.156 ├ ƒ /api/admin/production/jobs
09:38:23.156 ├ ƒ /api/admin/production/jobs/[id]
09:38:23.157 ├ ƒ /api/admin/production/update-status
09:38:23.157 ├ ƒ /api/admin/quotations
09:38:23.157 ├ ƒ /api/admin/quotations/[id]
09:38:23.157 ├ ƒ /api/admin/quotations/[id]/cost-breakdown
09:38:23.157 ├ ƒ /api/admin/quotations/[id]/export
09:38:23.157 ├ ƒ /api/admin/settings
09:38:23.157 ├ ƒ /api/admin/settings/%5Bkey%5D
09:38:23.157 ├ ƒ /api/admin/settings/cache/invalidate
09:38:23.157 ├ ƒ /api/admin/settings/customer-markup
09:38:23.160 ├ ƒ /api/admin/settings/customer-markup/%5Bid%5D
09:38:23.161 ├ ƒ /api/admin/settings/designer-emails
09:38:23.161 ├ ƒ /api/admin/shipments/[id]/tracking
09:38:23.161 ├ ƒ /api/admin/shipping/deliveries/complete
09:38:23.161 ├ ƒ /api/admin/shipping/shipments
09:38:23.161 ├ ƒ /api/admin/shipping/tracking
09:38:23.161 ├ ƒ /api/admin/shipping/tracking/[id]
09:38:23.161 ├ ƒ /api/admin/test-email
09:38:23.161 ├ ƒ /api/admin/users
09:38:23.161 ├ ƒ /api/admin/users/[id]/addresses
09:38:23.161 ├ ƒ /api/admin/users/[id]/approve
09:38:23.161 ├ ƒ /api/admin/users/approve
09:38:23.161 ├ ƒ /api/admin/users/pending
09:38:23.161 ├ ƒ /api/admin/users/reject
09:38:23.161 ├ ƒ /api/ai-parser/approve
09:38:23.161 ├ ƒ /api/ai-parser/extract
09:38:23.161 ├ ƒ /api/ai-parser/reprocess
09:38:23.161 ├ ƒ /api/ai-parser/upload
09:38:23.161 ├ ƒ /api/ai-parser/validate
09:38:23.161 ├ ƒ /api/ai/parse
09:38:23.162 ├ ƒ /api/ai/review
09:38:23.162 ├ ƒ /api/ai/specs
09:38:23.162 ├ ƒ /api/analytics/vitals
09:38:23.162 ├ ƒ /api/auth/current-user
09:38:23.162 ├ ƒ /api/auth/forgot-password
09:38:23.162 ├ ƒ /api/auth/register
09:38:23.162 ├ ƒ /api/auth/register/create-profile
09:38:23.162 ├ ƒ /api/auth/reset-password
09:38:23.162 ├ ƒ /api/auth/session
09:38:23.162 ├ ƒ /api/auth/signin
09:38:23.162 ├ ƒ /api/auth/signout
09:38:23.162 ├ ƒ /api/auth/verify-email
09:38:23.162 ├ ƒ /api/b2b/ai-extraction/upload
09:38:23.162 ├ ƒ /api/b2b/files/upload
09:38:23.164 ├ ƒ /api/comparison/save
09:38:23.164 ├ ƒ /api/contact
09:38:23.164 ├ ƒ /api/contract/pdf
09:38:23.164 ├ ƒ /api/contract/timestamp
09:38:23.164 ├ ƒ /api/contract/timestamp/validate
09:38:23.164 ├ ƒ /api/contract/workflow/action
09:38:23.164 ├ ƒ /api/contracts
09:38:23.164 ├ ƒ /api/coupons/validate
09:38:23.164 ├ ƒ /api/cron/archive-orders
09:38:23.164 ├ ƒ /api/debug/auth
09:38:23.164 ├ ƒ /api/dev/apply-migration
09:38:23.164 ├ ƒ /api/dev/set-admin
09:38:23.164 ├ ƒ /api/download/templates/[category]
09:38:23.164 ├ ƒ /api/download/templates/excel
09:38:23.164 ├ ƒ /api/download/templates/pdf
09:38:23.164 ├ ƒ /api/errors/log
09:38:23.164 ├ ƒ /api/files/validate
09:38:23.164 ├ ƒ /api/member/addresses/billing
09:38:23.164 ├ ƒ /api/member/addresses/billing/[id]
09:38:23.164 ├ ƒ /api/member/addresses/delivery
09:38:23.164 ├ ƒ /api/member/addresses/delivery/[id]
09:38:23.164 ├ ƒ /api/member/ai-extraction/approve
09:38:23.165 ├ ƒ /api/member/ai-extraction/status
09:38:23.165 ├ ƒ /api/member/ai-extraction/upload
09:38:23.165 ├ ƒ /api/member/auth/resend-verification
09:38:23.165 ├ ƒ /api/member/auth/verify-email
09:38:23.165 ├ ƒ /api/member/certificates/generate
09:38:23.167 ├ ƒ /api/member/dashboard
09:38:23.167 ├ ƒ /api/member/dashboard/stats
09:38:23.167 ├ ƒ /api/member/dashboard/unified-stats
09:38:23.167 ├ ƒ /api/member/delete-account
09:38:23.167 ├ ƒ /api/member/documents
09:38:23.167 ├ ƒ /api/member/documents/[id]/download
09:38:23.167 ├ ƒ /api/member/documents/history
09:38:23.167 ├ ƒ /api/member/files/[id]/extract
09:38:23.167 ├ ƒ /api/member/files/upload
09:38:23.167 ├ ƒ /api/member/hanko/upload
09:38:23.167 ├ ƒ /api/member/inquiries
09:38:23.167 ├ ƒ /api/member/invites/accept
09:38:23.167 ├ ƒ /api/member/invites/send
09:38:23.167 ├ ƒ /api/member/invoices
09:38:23.167 ├ ƒ /api/member/invoices/[invoiceId]/download
09:38:23.167 ├ ƒ /api/member/korea/corrections
09:38:23.167 ├ ƒ /api/member/korea/corrections/[id]/upload
09:38:23.167 ├ ƒ /api/member/korea/send-data
09:38:23.167 ├ ƒ /api/member/notifications
09:38:23.167 ├ ƒ /api/member/notifications/[id]
09:38:23.167 ├ ƒ /api/member/notifications/[id]/read
09:38:23.167 ├ ƒ /api/member/notifications/delete-all
09:38:23.167 ├ ƒ /api/member/notifications/mark-all-read
09:38:23.167 ├ ƒ /api/member/orders
09:38:23.167 ├ ƒ /api/member/orders/[id]
09:38:23.167 ├ ƒ /api/member/orders/[id]/apply-coupon
09:38:23.168 ├ ƒ /api/member/orders/[id]/approvals
09:38:23.168 ├ ƒ /api/member/orders/[id]/approvals/[requestId]
09:38:23.168 ├ ƒ /api/member/orders/[id]/approve-modification
09:38:23.168 ├ ƒ /api/member/orders/[id]/billing-address
09:38:23.168 ├ ƒ /api/member/orders/[id]/comments
09:38:23.168 ├ ƒ /api/member/orders/[id]/comments/[commentId]
09:38:23.168 ├ ƒ /api/member/orders/[id]/data-receipt
09:38:23.168 ├ ƒ /api/member/orders/[id]/data-receipt/files/[fileId]
09:38:23.168 ├ ƒ /api/member/orders/[id]/delivery-address
09:38:23.168 ├ ƒ /api/member/orders/[id]/design-revisions
09:38:23.168 ├ ƒ /api/member/orders/[id]/production-data
09:38:23.168 ├ ƒ /api/member/orders/[id]/production-logs
09:38:23.168 ├ ƒ /api/member/orders/[id]/request-cancellation
09:38:23.168 ├ ƒ /api/member/orders/[id]/spec-approval
09:38:23.168 ├ ƒ /api/member/orders/[id]/specification-change
09:38:23.168 ├ ƒ /api/member/orders/[id]/status-history
09:38:23.168 ├ ƒ /api/member/orders/[id]/tracking
09:38:23.168 ├ ƒ /api/member/orders/confirm
09:38:23.168 ├ ƒ /api/member/quotations
09:38:23.168 ├ ƒ /api/member/quotations/[id]
09:38:23.168 ├ ƒ /api/member/quotations/[id]/approve
09:38:23.168 ├ ƒ /api/member/quotations/[id]/confirm-payment
09:38:23.168 ├ ƒ /api/member/quotations/[id]/convert
09:38:23.168 ├ ƒ /api/member/quotations/[id]/export
09:38:23.168 ├ ƒ /api/member/quotations/[id]/invoice
09:38:23.168 ├ ƒ /api/member/quotations/[id]/save-pdf
09:38:23.168 ├ ƒ /api/member/samples
09:38:23.168 ├ ƒ /api/member/settings
09:38:23.168 ├ ƒ /api/member/shipments
09:38:23.168 ├ ƒ /api/member/spec-sheets/[id]/approve
09:38:23.169 ├ ƒ /api/member/spec-sheets/[id]/reject
09:38:23.169 ├ ƒ /api/member/spec-sheets/generate
09:38:23.169 ├ ƒ /api/member/status
09:38:23.169 ├ ƒ /api/member/stock-in
09:38:23.169 ├ ƒ /api/member/work-orders
09:38:23.169 ├ ƒ /api/notes
09:38:23.169 ├ ƒ /api/notes/[id]
09:38:23.169 ├ ƒ /api/notifications
09:38:23.169 ├ ƒ /api/notifications/[id]
09:38:23.169 ├ ƒ /api/notifications/[id]/read
09:38:23.169 ├ ƒ /api/notifications/mark-all-read
09:38:23.169 ├ ƒ /api/notifications/unread-count
09:38:23.169 ├ ƒ /api/orders
09:38:23.169 ├ ƒ /api/orders/[id]
09:38:23.169 ├ ƒ /api/orders/[id]/cancel
09:38:23.169 ├ ƒ /api/orders/[id]/status
09:38:23.169 ├ ƒ /api/orders/cancel
09:38:23.169 ├ ƒ /api/orders/create
09:38:23.169 ├ ƒ /api/orders/receive
09:38:23.169 ├ ƒ /api/orders/reorder
09:38:23.169 ├ ƒ /api/orders/update
09:38:23.169 ├ ƒ /api/payments/confirm
09:38:23.169 ├ ƒ /api/premium-content/download
09:38:23.169 ├ ƒ /api/products
09:38:23.169 ├ ƒ /api/products/categories
09:38:23.169 ├ ƒ /api/products/filter
09:38:23.169 ├ ƒ /api/products/search
09:38:23.169 ├ ƒ /api/profile
09:38:23.169 ├ ƒ /api/profile/[id]
09:38:23.169 ├ ƒ /api/quotation
09:38:23.169 ├ ƒ /api/quotation/pdf
09:38:23.170 ├ ƒ /api/quotations/guest-save
09:38:23.170 ├ ƒ /api/quotations/save
09:38:23.170 ├ ƒ /api/quotes/excel
09:38:23.170 ├ ƒ /api/quotes/pdf
09:38:23.170 ├ ƒ /api/quotitions/[id]/confirm-transfer
09:38:23.170 ├ ƒ /api/registry/corporate-number
09:38:23.170 ├ ƒ /api/registry/postal-code
09:38:23.170 ├ ƒ /api/revalidate
09:38:23.170 ├ ƒ /api/samples
09:38:23.170 ├ ƒ /api/samples/request
09:38:23.170 ├ ƒ /api/settings
09:38:23.170 ├ ƒ /api/shipments
09:38:23.170 ├ ƒ /api/shipments/[id]
09:38:23.170 ├ ƒ /api/shipments/[id]/[trackingId]/update-tracking
09:38:23.170 ├ ƒ /api/shipments/[id]/label
09:38:23.170 ├ ƒ /api/shipments/[id]/schedule-pickup
09:38:23.170 ├ ƒ /api/shipments/[id]/track
09:38:23.170 ├ ƒ /api/shipments/bulk-create
09:38:23.170 ├ ƒ /api/shipments/create
09:38:23.170 ├ ƒ /api/shipments/tracking
09:38:23.170 ├ ƒ /api/signature/cancel
09:38:23.170 ├ ƒ /api/signature/local/save
09:38:23.170 ├ ƒ /api/signature/send
09:38:23.170 ├ ƒ /api/signature/status/[id]
09:38:23.170 ├ ƒ /api/signature/webhook
09:38:23.171 ├ ƒ /api/specsheet/approval
09:38:23.171 ├ ƒ /api/specsheet/pdf
09:38:23.171 ├ ƒ /api/specsheet/versions
09:38:23.171 ├ ƒ /api/supabase-mcp/execute
09:38:23.171 ├ ƒ /api/templates
09:38:23.171 ├ ƒ /archives
09:38:23.171 ├ ƒ /auth/error
09:38:23.171 ├ ƒ /auth/forgot-password
09:38:23.171 ├ ƒ /auth/pending
09:38:23.171 ├ ƒ /auth/register
09:38:23.171 ├ ƒ /auth/reset-password
09:38:23.171 ├ ƒ /auth/signin
09:38:23.171 ├ ƒ /auth/signin/form-post
09:38:23.171 ├ ƒ /auth/signout
09:38:23.171 ├ ƒ /auth/suspended
09:38:23.171 ├ ƒ /cart
09:38:23.171 ├ ƒ /catalog
09:38:23.178 ├ ƒ /catalog/[slug]
09:38:23.178 ├ ƒ /compare
09:38:23.182 ├ ƒ /compare/shared
09:38:23.182 ├ ƒ /contact
09:38:23.183 ├ ƒ /contact/thank-you
09:38:23.183 ├ ƒ /csr
09:38:23.183 ├ ƒ /data-templates
09:38:23.184 ├ ƒ /design-system
09:38:23.184 ├ ƒ /flow
09:38:23.184 ├ ƒ /guide
09:38:23.185 ├ ƒ /guide/color
09:38:23.185 ├ ƒ /guide/environmentaldisplay
09:38:23.185 ├ ƒ /guide/image
09:38:23.185 ├ ƒ /guide/shirohan
09:38:23.186 ├ ƒ /guide/size
09:38:23.186 ├ ƒ /industry/cosmetics
09:38:23.186 ├ ƒ /industry/electronics
09:38:23.187 ├ ƒ /industry/food-manufacturing
09:38:23.187 ├ ƒ /industry/pharmaceutical
09:38:23.187 ├ ƒ /inquiry/detailed
09:38:23.188 ├ ƒ /legal
09:38:23.188 ├ ƒ /member/billing-addresses
09:38:23.188 ├ ƒ /member/contracts
09:38:23.188 ├ ƒ /member/dashboard
09:38:23.189 ├ ƒ /member/deliveries
09:38:23.189 ├ ƒ /member/edit
09:38:23.189 ├ ƒ /member/inquiries
09:38:23.190 ├ ƒ /member/invoices
09:38:23.190 ├ ƒ /member/notifications
09:38:23.190 ├ ƒ /member/orders
09:38:23.190 ├ ƒ /member/orders/[id]
09:38:23.191 ├ ƒ /member/orders/[id]/confirmation
09:38:23.191 ├ ƒ /member/orders/[id]/data-receipt
09:38:23.191 ├ ƒ /member/orders/[id]/preparation
09:38:23.192 ├ ƒ /member/orders/[id]/spec-approval
09:38:23.192 ├ ƒ /member/orders/history
09:38:23.192 ├ ƒ /member/orders/new
09:38:23.193 ├ ƒ /member/orders/reorder
09:38:23.193 ├ ƒ /member/profile
09:38:23.193 ├ ƒ /member/quotations
09:38:23.193 ├ ƒ /member/quotations/[id]
09:38:23.194 ├ ƒ /member/quotations/[id]/confirm
09:38:23.194 ├ ƒ /member/quotations/request
09:38:23.194 ├ ƒ /member/samples
09:38:23.195 ├ ƒ /member/settings
09:38:23.195 ├ ƒ /members
09:38:23.195 ├ ƒ /news
09:38:23.196 ├ ƒ /premium-content
09:38:23.196 ├ ƒ /pricing
09:38:23.196 ├ ƒ /print
09:38:23.196 ├ ƒ /privacy
09:38:23.197 ├ ƒ /profile
09:38:23.197 ├ ƒ /quote-simulator
09:38:23.197 ├ ○ /robots.txt
09:38:23.198 ├ ƒ /samples
09:38:23.198 ├ ƒ /samples/thank-you
09:38:23.198 ├ ƒ /service
09:38:23.199 ├ ○ /sitemap.xml
09:38:23.199 └ ƒ /terms
09:38:23.199 
09:38:23.199 
09:38:23.200 ƒ Proxy (Middleware)
09:38:23.208 
09:38:23.208 ○  (Static)   prerendered as static content
09:38:23.208 ƒ  (Dynamic)  server-rendered on demand
09:38:23.208 
09:38:23.740 Traced Next.js server files in: 76.661ms
09:38:25.358 Created all serverless functions in: 1.616s
09:38:25.609 Collected static files (public/, static/, .next/static): 78.255ms
09:38:26.111 Build Completed in /vercel/output [3m]
09:38:26.671 Deploying outputs...