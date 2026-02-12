06:01:06.583 Running build in Washington, D.C., USA (East) – iad1
06:01:06.584 Build machine configuration: 2 cores, 8 GB
06:01:06.693 Cloning github.com/knaei3933/epackage (Branch: main, Commit: bf413b9)
06:01:19.459 Cloning completed: 12.765s
06:01:19.859 Restored build cache from previous deployment (A1ZGNdKWWdXRBbvJxLWFAVLjQ7xh)
06:01:20.282 Running "vercel build"
06:01:21.570 Vercel CLI 50.15.1
06:01:22.121 Running "install" command: `npm install`...
06:01:28.416 
06:01:28.418 up to date, audited 1390 packages in 6s
06:01:28.418 
06:01:28.419 236 packages are looking for funding
06:01:28.420   run `npm fund` for details
06:01:28.502 
06:01:28.503 26 vulnerabilities (4 moderate, 21 high, 1 critical)
06:01:28.503 
06:01:28.504 To address issues that do not require attention, run:
06:01:28.504   npm audit fix
06:01:28.504 
06:01:28.504 To address all issues (including breaking changes), run:
06:01:28.505   npm audit fix --force
06:01:28.505 
06:01:28.505 Run `npm audit` for details.
06:01:28.539 Detected Next.js version: 16.0.11
06:01:28.540 Running "npm run build"
06:01:28.632 
06:01:28.633 > epackage-lab-web@0.1.0 build
06:01:28.633 > next build --webpack
06:01:28.633 
06:01:28.880 [baseline-browser-mapping] The data in this module is over two months old.  To ensure accurate Baseline data, please update: `npm i baseline-browser-mapping@latest -D`
06:01:29.678    ▲ Next.js 16.0.11 (webpack)
06:01:29.679 
06:01:29.686  ⚠ The "middleware" file convention is deprecated. Please use "proxy" instead. Learn more: https://nextjs.org/docs/messages/middleware-to-proxy
06:01:29.760    Creating an optimized production build ...
06:01:29.942 [baseline-browser-mapping] The data in this module is over two months old.  To ensure accurate Baseline data, please update: `npm i baseline-browser-mapping@latest -D`
06:01:51.594  ⚠ Compiled with warnings in 20.4s
06:01:51.595 
06:01:51.595 ./node_modules/handlebars/lib/index.js
06:01:51.595 require.extensions is not supported by webpack. Use a loader instead.
06:01:51.595 
06:01:51.596 Import trace for requested module:
06:01:51.596 ./node_modules/handlebars/lib/index.js
06:01:51.601 ./src/app/api/contract/pdf/route.ts
06:01:51.602 
06:01:51.602 ./node_modules/handlebars/lib/index.js
06:01:51.602 require.extensions is not supported by webpack. Use a loader instead.
06:01:51.602 
06:01:51.603 Import trace for requested module:
06:01:51.603 ./node_modules/handlebars/lib/index.js
06:01:51.603 ./src/app/api/contract/pdf/route.ts
06:01:51.603 
06:01:51.605 ./node_modules/handlebars/lib/index.js
06:01:51.605 require.extensions is not supported by webpack. Use a loader instead.
06:01:51.606 
06:01:51.606 Import trace for requested module:
06:01:51.606 ./node_modules/handlebars/lib/index.js
06:01:51.606 ./src/app/api/contract/pdf/route.ts
06:01:51.607 
06:01:51.894 [baseline-browser-mapping] The data in this module is over two months old.  To ensure accurate Baseline data, please update: `npm i baseline-browser-mapping@latest -D`
06:01:54.171 [baseline-browser-mapping] The data in this module is over two months old.  To ensure accurate Baseline data, please update: `npm i baseline-browser-mapping@latest -D`
06:02:02.221 <w> [webpack.cache.PackFileCacheStrategy] Skipped not serializable cache item 'Compilation/modules|/vercel/path0/node_modules/next/dist/build/webpack/loaders/css-loader/src/index.js??ruleSet[1].rules[15].oneOf[10].use[2]!/vercel/path0/node_modules/next/dist/build/webpack/loaders/postcss-loader/src/index.js??ruleSet[1].rules[15].oneOf[10].use[3]!/vercel/path0/src/app/globals.css': No serializer registered for Warning
06:02:02.222 <w> while serializing webpack/lib/cache/PackFileCacheStrategy.PackContentItems -> webpack/lib/NormalModule -> Array { 1 items } -> webpack/lib/ModuleWarning -> Warning
06:02:02.266  ⚠ Compiled with warnings in 7.0s
06:02:02.266 
06:02:02.267 ./src/app/globals.css.webpack[javascript/auto]!=!./node_modules/next/dist/build/webpack/loaders/css-loader/src/index.js??ruleSet[1].rules[15].oneOf[10].use[2]!./node_modules/next/dist/build/webpack/loaders/postcss-loader/src/index.js??ruleSet[1].rules[15].oneOf[10].use[3]!./src/app/globals.css
06:02:02.267 Warning
06:02:02.267 
06:02:02.267 (837:5) autoprefixer: Replace color-adjust to print-color-adjust. The color-adjust shorthand is currently deprecated.
06:02:02.267 
06:02:02.267 Import trace for requested module:
06:02:02.269 ./src/app/globals.css.webpack[javascript/auto]!=!./node_modules/next/dist/build/webpack/loaders/css-loader/src/index.js??ruleSet[1].rules[15].oneOf[10].use[2]!./node_modules/next/dist/build/webpack/loaders/postcss-loader/src/index.js??ruleSet[1].rules[15].oneOf[10].use[3]!./src/app/globals.css
06:02:02.269 ./src/app/globals.css
06:02:02.269 
06:02:02.320  ✓ Compiled successfully in 28.3s
06:02:02.322    Skipping validation of types
06:02:02.379    Collecting page data using 1 worker ...
06:02:03.089 [baseline-browser-mapping] The data in this module is over two months old.  To ensure accurate Baseline data, please update: `npm i baseline-browser-mapping@latest -D`
06:02:03.396 [Email] Production mode - configuring email service
06:02:03.397 [Email] SendGrid not configured
06:02:03.397 [Email] No email service configured - using console fallback
06:02:03.534 [EpackMailer] No SMTP configured - using console fallback
06:02:04.047 [createServiceClient] Credentials not configured, using mock client
06:02:04.577 [AccountDeletionEmail] Configuring email service
06:02:04.578 [AccountDeletionEmail] SendGrid not configured
06:02:04.583 [AccountDeletionEmail] No email service configured - using console fallback
06:02:04.994  ⚠ Using edge runtime on a page currently disables static generation for that page
06:02:14.201    Generating static pages using 1 worker (0/21) ...
06:02:14.609 [baseline-browser-mapping] The data in this module is over two months old.  To ensure accurate Baseline data, please update: `npm i baseline-browser-mapping@latest -D`
06:02:15.174    Generating static pages using 1 worker (5/21) 
06:02:15.177    Generating static pages using 1 worker (10/21) 
06:02:15.177    Generating static pages using 1 worker (15/21) 
06:02:15.386  ✓ Generating static pages using 1 worker (21/21) in 1184.5ms
06:02:18.003    Finalizing page optimization ...
06:02:18.006    Collecting build traces ...
06:02:44.500 
06:02:44.507 Route (app)
06:02:44.507 ┌ ƒ /
06:02:44.507 ├ ƒ /_not-found
06:02:44.507 ├ ƒ /about
06:02:44.507 ├ ƒ /admin/approvals
06:02:44.507 ├ ƒ /admin/contracts
06:02:44.507 ├ ƒ /admin/contracts/[id]
06:02:44.507 ├ ƒ /admin/coupons
06:02:44.507 ├ ƒ /admin/customers
06:02:44.508 ├ ƒ /admin/customers/documents
06:02:44.508 ├ ƒ /admin/customers/management
06:02:44.508 ├ ƒ /admin/customers/orders
06:02:44.508 ├ ƒ /admin/customers/orders/[id]
06:02:44.508 ├ ƒ /admin/customers/profile
06:02:44.508 ├ ƒ /admin/customers/support
06:02:44.508 ├ ƒ /admin/dashboard
06:02:44.508 ├ ƒ /admin/notifications
06:02:44.508 ├ ƒ /admin/orders
06:02:44.508 ├ ƒ /admin/orders/[id]
06:02:44.508 ├ ƒ /admin/orders/[id]/correction-upload
06:02:44.508 ├ ƒ /admin/orders/[id]/payment-confirmation
06:02:44.508 ├ ƒ /admin/production/[id]
06:02:44.508 ├ ƒ /admin/quotations
06:02:44.508 ├ ƒ /admin/settings
06:02:44.508 ├ ƒ /admin/settings/customers
06:02:44.508 ├ ƒ /admin/shipments
06:02:44.508 ├ ƒ /admin/shipments/[id]
06:02:44.509 ├ ƒ /admin/shipping
06:02:44.509 ├ ƒ /api/admin/approve-member
06:02:44.509 ├ ƒ /api/admin/contracts/[contractId]/download
06:02:44.509 ├ ƒ /api/admin/contracts/[contractId]/send-signature
06:02:44.509 ├ ƒ /api/admin/contracts/request-signature
06:02:44.509 ├ ƒ /api/admin/contracts/send-reminder
06:02:44.509 ├ ƒ /api/admin/contracts/workflow
06:02:44.509 ├ ƒ /api/admin/convert-to-order
06:02:44.509 ├ ƒ /api/admin/coupons
06:02:44.509 ├ ƒ /api/admin/coupons/%5Bid%5D
06:02:44.509 ├ ƒ /api/admin/customers/[id]
06:02:44.509 ├ ƒ /api/admin/customers/[id]/contact-history
06:02:44.509 ├ ƒ /api/admin/customers/management
06:02:44.509 ├ ƒ /api/admin/customers/management/export
06:02:44.509 ├ ƒ /api/admin/dashboard/statistics
06:02:44.509 ├ ƒ /api/admin/dashboard/unified-stats
06:02:44.509 ├ ƒ /api/admin/delivery/tracking/[orderId]
06:02:44.509 ├ ƒ /api/admin/email/send
06:02:44.509 ├ ƒ /api/admin/generate-work-order
06:02:44.509 ├ ƒ /api/admin/inventory/adjust
06:02:44.509 ├ ƒ /api/admin/inventory/history/[productId]
06:02:44.510 ├ ƒ /api/admin/inventory/items
06:02:44.510 ├ ƒ /api/admin/inventory/receipts
06:02:44.510 ├ ƒ /api/admin/inventory/record-entry
06:02:44.510 ├ ƒ /api/admin/inventory/update
06:02:44.510 ├ ƒ /api/admin/notifications
06:02:44.510 ├ ƒ /api/admin/notifications/[id]
06:02:44.510 ├ ƒ /api/admin/notifications/[id]/read
06:02:44.510 ├ ƒ /api/admin/notifications/create
06:02:44.510 ├ ƒ /api/admin/notifications/unread-count
06:02:44.510 ├ ƒ /api/admin/orders
06:02:44.510 ├ ƒ /api/admin/orders/[id]/apply-discount
06:02:44.510 ├ ƒ /api/admin/orders/[id]/billing-address
06:02:44.510 ├ ƒ /api/admin/orders/[id]/cancellation
06:02:44.510 ├ ƒ /api/admin/orders/[id]/comments
06:02:44.510 ├ ƒ /api/admin/orders/[id]/correction
06:02:44.511 ├ ƒ /api/admin/orders/[id]/correction/[revisionId]
06:02:44.511 ├ ƒ /api/admin/orders/[id]/data-receipt
06:02:44.511 ├ ƒ /api/admin/orders/[id]/delivery-address
06:02:44.511 ├ ƒ /api/admin/orders/[id]/delivery-note
06:02:44.511 ├ ƒ /api/admin/orders/[id]/files/[fileId]/download
06:02:44.511 ├ ƒ /api/admin/orders/[id]/items
06:02:44.511 ├ ƒ /api/admin/orders/[id]/korea-send-status
06:02:44.511 ├ ƒ /api/admin/orders/[id]/notes
06:02:44.511 ├ ƒ /api/admin/orders/[id]/payment-confirmation
06:02:44.511 ├ ƒ /api/admin/orders/[id]/send-to-korea
06:02:44.512 ├ ƒ /api/admin/orders/[id]/shipping-info
06:02:44.512 ├ ƒ /api/admin/orders/[id]/specification-change
06:02:44.512 ├ ƒ /api/admin/orders/[id]/start-production
06:02:44.512 ├ ƒ /api/admin/orders/[id]/status
06:02:44.512 ├ ƒ /api/admin/orders/[id]/status-history
06:02:44.512 ├ ƒ /api/admin/orders/bulk-status
06:02:44.512 ├ ƒ /api/admin/orders/statistics
06:02:44.512 ├ ƒ /api/admin/performance/metrics
06:02:44.512 ├ ƒ /api/admin/production-jobs/[id]
06:02:44.512 ├ ƒ /api/admin/production/[orderId]
06:02:44.512 ├ ƒ /api/admin/production/jobs
06:02:44.512 ├ ƒ /api/admin/production/jobs/[id]
06:02:44.512 ├ ƒ /api/admin/production/update-status
06:02:44.512 ├ ƒ /api/admin/quotations
06:02:44.513 ├ ƒ /api/admin/quotations/[id]
06:02:44.513 ├ ƒ /api/admin/quotations/[id]/cost-breakdown
06:02:44.513 ├ ƒ /api/admin/quotations/[id]/export
06:02:44.513 ├ ƒ /api/admin/settings
06:02:44.513 ├ ƒ /api/admin/settings/%5Bkey%5D
06:02:44.515 ├ ƒ /api/admin/settings/cache/invalidate
06:02:44.515 ├ ƒ /api/admin/settings/customer-markup
06:02:44.515 ├ ƒ /api/admin/settings/customer-markup/%5Bid%5D
06:02:44.518 ├ ƒ /api/admin/settings/designer-emails
06:02:44.518 ├ ƒ /api/admin/shipments/[id]/tracking
06:02:44.518 ├ ƒ /api/admin/shipping/deliveries/complete
06:02:44.518 ├ ƒ /api/admin/shipping/shipments
06:02:44.518 ├ ƒ /api/admin/shipping/tracking
06:02:44.518 ├ ƒ /api/admin/shipping/tracking/[id]
06:02:44.518 ├ ƒ /api/admin/test-email
06:02:44.518 ├ ƒ /api/admin/users
06:02:44.518 ├ ƒ /api/admin/users/[id]/addresses
06:02:44.518 ├ ƒ /api/admin/users/[id]/approve
06:02:44.518 ├ ƒ /api/admin/users/approve
06:02:44.518 ├ ƒ /api/admin/users/pending
06:02:44.519 ├ ƒ /api/admin/users/reject
06:02:44.519 ├ ƒ /api/ai-parser/approve
06:02:44.519 ├ ƒ /api/ai-parser/extract
06:02:44.519 ├ ƒ /api/ai-parser/reprocess
06:02:44.519 ├ ƒ /api/ai-parser/upload
06:02:44.519 ├ ƒ /api/ai-parser/validate
06:02:44.519 ├ ƒ /api/ai/parse
06:02:44.519 ├ ƒ /api/ai/review
06:02:44.519 ├ ƒ /api/ai/specs
06:02:44.519 ├ ƒ /api/analytics/vitals
06:02:44.519 ├ ƒ /api/auth/current-user
06:02:44.519 ├ ƒ /api/auth/forgot-password
06:02:44.519 ├ ƒ /api/auth/register
06:02:44.519 ├ ƒ /api/auth/register/create-profile
06:02:44.519 ├ ƒ /api/auth/reset-password
06:02:44.519 ├ ƒ /api/auth/session
06:02:44.519 ├ ƒ /api/auth/signin
06:02:44.519 ├ ƒ /api/auth/signout
06:02:44.519 ├ ƒ /api/auth/verify-email
06:02:44.519 ├ ƒ /api/b2b/ai-extraction/upload
06:02:44.519 ├ ƒ /api/b2b/files/upload
06:02:44.519 ├ ƒ /api/comparison/save
06:02:44.519 ├ ƒ /api/contact
06:02:44.519 ├ ƒ /api/contract/pdf
06:02:44.519 ├ ƒ /api/contract/timestamp
06:02:44.519 ├ ƒ /api/contract/timestamp/validate
06:02:44.519 ├ ƒ /api/contract/workflow/action
06:02:44.519 ├ ƒ /api/contracts
06:02:44.520 ├ ƒ /api/coupons/validate
06:02:44.520 ├ ƒ /api/cron/archive-orders
06:02:44.520 ├ ƒ /api/debug/auth
06:02:44.520 ├ ƒ /api/dev/apply-migration
06:02:44.520 ├ ƒ /api/dev/set-admin
06:02:44.520 ├ ƒ /api/download/templates/[category]
06:02:44.520 ├ ƒ /api/download/templates/excel
06:02:44.520 ├ ƒ /api/download/templates/pdf
06:02:44.520 ├ ƒ /api/errors/log
06:02:44.520 ├ ƒ /api/files/validate
06:02:44.520 ├ ƒ /api/member/addresses/billing
06:02:44.520 ├ ƒ /api/member/addresses/billing/[id]
06:02:44.520 ├ ƒ /api/member/addresses/delivery
06:02:44.520 ├ ƒ /api/member/addresses/delivery/[id]
06:02:44.520 ├ ƒ /api/member/ai-extraction/approve
06:02:44.520 ├ ƒ /api/member/ai-extraction/status
06:02:44.520 ├ ƒ /api/member/ai-extraction/upload
06:02:44.520 ├ ƒ /api/member/auth/resend-verification
06:02:44.520 ├ ƒ /api/member/auth/verify-email
06:02:44.520 ├ ƒ /api/member/certificates/generate
06:02:44.520 ├ ƒ /api/member/dashboard
06:02:44.520 ├ ƒ /api/member/dashboard/stats
06:02:44.520 ├ ƒ /api/member/dashboard/unified-stats
06:02:44.520 ├ ƒ /api/member/delete-account
06:02:44.520 ├ ƒ /api/member/documents
06:02:44.520 ├ ƒ /api/member/documents/[id]/download
06:02:44.520 ├ ƒ /api/member/documents/history
06:02:44.520 ├ ƒ /api/member/files/[id]/extract
06:02:44.520 ├ ƒ /api/member/files/upload
06:02:44.521 ├ ƒ /api/member/hanko/upload
06:02:44.521 ├ ƒ /api/member/inquiries
06:02:44.521 ├ ƒ /api/member/invites/accept
06:02:44.521 ├ ƒ /api/member/invites/send
06:02:44.521 ├ ƒ /api/member/invoices
06:02:44.521 ├ ƒ /api/member/invoices/[invoiceId]/download
06:02:44.521 ├ ƒ /api/member/korea/corrections
06:02:44.521 ├ ƒ /api/member/korea/corrections/[id]/upload
06:02:44.521 ├ ƒ /api/member/korea/send-data
06:02:44.521 ├ ƒ /api/member/notifications
06:02:44.521 ├ ƒ /api/member/notifications/[id]
06:02:44.521 ├ ƒ /api/member/notifications/[id]/read
06:02:44.521 ├ ƒ /api/member/notifications/delete-all
06:02:44.521 ├ ƒ /api/member/notifications/mark-all-read
06:02:44.521 ├ ƒ /api/member/orders
06:02:44.521 ├ ƒ /api/member/orders/[id]
06:02:44.521 ├ ƒ /api/member/orders/[id]/apply-coupon
06:02:44.521 ├ ƒ /api/member/orders/[id]/approvals
06:02:44.521 ├ ƒ /api/member/orders/[id]/approvals/[requestId]
06:02:44.521 ├ ƒ /api/member/orders/[id]/approve-modification
06:02:44.521 ├ ƒ /api/member/orders/[id]/billing-address
06:02:44.521 ├ ƒ /api/member/orders/[id]/comments
06:02:44.521 ├ ƒ /api/member/orders/[id]/comments/[commentId]
06:02:44.521 ├ ƒ /api/member/orders/[id]/data-receipt
06:02:44.521 ├ ƒ /api/member/orders/[id]/data-receipt/files/[fileId]
06:02:44.521 ├ ƒ /api/member/orders/[id]/delivery-address
06:02:44.521 ├ ƒ /api/member/orders/[id]/design-revisions
06:02:44.521 ├ ƒ /api/member/orders/[id]/production-data
06:02:44.521 ├ ƒ /api/member/orders/[id]/production-logs
06:02:44.522 ├ ƒ /api/member/orders/[id]/request-cancellation
06:02:44.522 ├ ƒ /api/member/orders/[id]/spec-approval
06:02:44.522 ├ ƒ /api/member/orders/[id]/specification-change
06:02:44.522 ├ ƒ /api/member/orders/[id]/status-history
06:02:44.522 ├ ƒ /api/member/orders/[id]/tracking
06:02:44.522 ├ ƒ /api/member/orders/confirm
06:02:44.522 ├ ƒ /api/member/quotations
06:02:44.522 ├ ƒ /api/member/quotations/[id]
06:02:44.522 ├ ƒ /api/member/quotations/[id]/approve
06:02:44.522 ├ ƒ /api/member/quotations/[id]/confirm-payment
06:02:44.522 ├ ƒ /api/member/quotations/[id]/convert
06:02:44.522 ├ ƒ /api/member/quotations/[id]/export
06:02:44.522 ├ ƒ /api/member/quotations/[id]/invoice
06:02:44.522 ├ ƒ /api/member/quotations/[id]/save-pdf
06:02:44.522 ├ ƒ /api/member/samples
06:02:44.522 ├ ƒ /api/member/settings
06:02:44.522 ├ ƒ /api/member/shipments
06:02:44.522 ├ ƒ /api/member/spec-sheets/[id]/approve
06:02:44.522 ├ ƒ /api/member/spec-sheets/[id]/reject
06:02:44.522 ├ ƒ /api/member/spec-sheets/generate
06:02:44.523 ├ ƒ /api/member/status
06:02:44.523 ├ ƒ /api/member/stock-in
06:02:44.523 ├ ƒ /api/member/work-orders
06:02:44.523 ├ ƒ /api/notes
06:02:44.523 ├ ƒ /api/notes/[id]
06:02:44.523 ├ ƒ /api/notifications
06:02:44.523 ├ ƒ /api/notifications/[id]
06:02:44.523 ├ ƒ /api/notifications/[id]/read
06:02:44.523 ├ ƒ /api/notifications/mark-all-read
06:02:44.523 ├ ƒ /api/notifications/unread-count
06:02:44.523 ├ ƒ /api/orders
06:02:44.523 ├ ƒ /api/orders/[id]
06:02:44.523 ├ ƒ /api/orders/[id]/cancel
06:02:44.523 ├ ƒ /api/orders/[id]/status
06:02:44.523 ├ ƒ /api/orders/cancel
06:02:44.523 ├ ƒ /api/orders/create
06:02:44.523 ├ ƒ /api/orders/receive
06:02:44.523 ├ ƒ /api/orders/reorder
06:02:44.523 ├ ƒ /api/orders/update
06:02:44.523 ├ ƒ /api/payments/confirm
06:02:44.524 ├ ƒ /api/premium-content/download
06:02:44.524 ├ ƒ /api/products
06:02:44.524 ├ ƒ /api/products/categories
06:02:44.524 ├ ƒ /api/products/filter
06:02:44.524 ├ ƒ /api/products/search
06:02:44.524 ├ ƒ /api/profile
06:02:44.524 ├ ƒ /api/profile/[id]
06:02:44.524 ├ ƒ /api/quotation
06:02:44.524 ├ ƒ /api/quotation/pdf
06:02:44.524 ├ ƒ /api/quotations/guest-save
06:02:44.524 ├ ƒ /api/quotations/save
06:02:44.524 ├ ƒ /api/quotes/excel
06:02:44.524 ├ ƒ /api/quotes/pdf
06:02:44.524 ├ ƒ /api/quotitions/[id]/confirm-transfer
06:02:44.524 ├ ƒ /api/registry/corporate-number
06:02:44.524 ├ ƒ /api/registry/postal-code
06:02:44.524 ├ ƒ /api/revalidate
06:02:44.524 ├ ƒ /api/samples
06:02:44.524 ├ ƒ /api/samples/request
06:02:44.524 ├ ƒ /api/settings
06:02:44.524 ├ ƒ /api/shipments
06:02:44.524 ├ ƒ /api/shipments/[id]
06:02:44.525 ├ ƒ /api/shipments/[id]/[trackingId]/update-tracking
06:02:44.525 ├ ƒ /api/shipments/[id]/label
06:02:44.525 ├ ƒ /api/shipments/[id]/schedule-pickup
06:02:44.525 ├ ƒ /api/shipments/[id]/track
06:02:44.526 ├ ƒ /api/shipments/bulk-create
06:02:44.526 ├ ƒ /api/shipments/create
06:02:44.526 ├ ƒ /api/shipments/tracking
06:02:44.526 ├ ƒ /api/signature/cancel
06:02:44.526 ├ ƒ /api/signature/local/save
06:02:44.526 ├ ƒ /api/signature/send
06:02:44.526 ├ ƒ /api/signature/status/[id]
06:02:44.526 ├ ƒ /api/signature/webhook
06:02:44.526 ├ ƒ /api/specsheet/approval
06:02:44.526 ├ ƒ /api/specsheet/pdf
06:02:44.526 ├ ƒ /api/specsheet/versions
06:02:44.526 ├ ƒ /api/supabase-mcp/execute
06:02:44.526 ├ ƒ /api/templates
06:02:44.526 ├ ƒ /archives
06:02:44.526 ├ ƒ /auth/error
06:02:44.526 ├ ƒ /auth/forgot-password
06:02:44.526 ├ ƒ /auth/pending
06:02:44.526 ├ ƒ /auth/register
06:02:44.526 ├ ƒ /auth/reset-password
06:02:44.526 ├ ƒ /auth/signin
06:02:44.526 ├ ƒ /auth/signin/form-post
06:02:44.526 ├ ƒ /auth/signout
06:02:44.526 ├ ƒ /auth/suspended
06:02:44.526 ├ ƒ /cart
06:02:44.526 ├ ƒ /catalog
06:02:44.526 ├ ƒ /catalog/[slug]
06:02:44.526 ├ ƒ /compare
06:02:44.540 ├ ƒ /compare/shared
06:02:44.540 ├ ƒ /contact
06:02:44.540 ├ ƒ /contact/thank-you
06:02:44.541 ├ ƒ /csr
06:02:44.541 ├ ƒ /data-templates
06:02:44.541 ├ ƒ /design-system
06:02:44.541 ├ ƒ /flow
06:02:44.542 ├ ƒ /guide
06:02:44.542 ├ ƒ /guide/color
06:02:44.542 ├ ƒ /guide/environmentaldisplay
06:02:44.542 ├ ƒ /guide/image
06:02:44.542 ├ ƒ /guide/shirohan
06:02:44.543 ├ ƒ /guide/size
06:02:44.543 ├ ƒ /industry/cosmetics
06:02:44.543 ├ ƒ /industry/electronics
06:02:44.543 ├ ƒ /industry/food-manufacturing
06:02:44.544 ├ ƒ /industry/pharmaceutical
06:02:44.544 ├ ƒ /inquiry/detailed
06:02:44.544 ├ ƒ /legal
06:02:44.544 ├ ƒ /member/billing-addresses
06:02:44.545 ├ ƒ /member/contracts
06:02:44.545 ├ ƒ /member/dashboard
06:02:44.545 ├ ƒ /member/deliveries
06:02:44.545 ├ ƒ /member/edit
06:02:44.546 ├ ƒ /member/inquiries
06:02:44.546 ├ ƒ /member/invoices
06:02:44.546 ├ ƒ /member/notifications
06:02:44.546 ├ ƒ /member/orders
06:02:44.547 ├ ƒ /member/orders/[id]
06:02:44.547 ├ ƒ /member/orders/[id]/confirmation
06:02:44.547 ├ ƒ /member/orders/[id]/data-receipt
06:02:44.548 ├ ƒ /member/orders/[id]/preparation
06:02:44.548 ├ ƒ /member/orders/[id]/spec-approval
06:02:44.548 ├ ƒ /member/orders/history
06:02:44.549 ├ ƒ /member/orders/new
06:02:44.549 ├ ƒ /member/orders/reorder
06:02:44.549 ├ ƒ /member/profile
06:02:44.550 ├ ƒ /member/quotations
06:02:44.550 ├ ƒ /member/quotations/[id]
06:02:44.550 ├ ƒ /member/quotations/[id]/confirm
06:02:44.550 ├ ƒ /member/quotations/request
06:02:44.551 ├ ƒ /member/samples
06:02:44.551 ├ ƒ /member/settings
06:02:44.551 ├ ƒ /members
06:02:44.552 ├ ƒ /news
06:02:44.552 ├ ƒ /premium-content
06:02:44.552 ├ ƒ /pricing
06:02:44.553 ├ ƒ /print
06:02:44.553 ├ ƒ /privacy
06:02:44.553 ├ ƒ /profile
06:02:44.553 ├ ƒ /quote-simulator
06:02:44.553 ├ ○ /robots.txt
06:02:44.553 ├ ƒ /samples
06:02:44.554 ├ ƒ /samples/thank-you
06:02:44.554 ├ ƒ /service
06:02:44.554 ├ ○ /sitemap.xml
06:02:44.554 └ ƒ /terms
06:02:44.554 
06:02:44.554 
06:02:44.554 ƒ Proxy (Middleware)
06:02:44.562 
06:02:44.562 ○  (Static)   prerendered as static content
06:02:44.562 ƒ  (Dynamic)  server-rendered on demand
06:02:44.562 
06:02:45.080 Traced Next.js server files in: 52.454ms
06:02:46.582 Created all serverless functions in: 1.502s
06:02:46.828 Collected static files (public/, static/, .next/static): 77.446ms
06:02:47.312 Build Completed in /vercel/output [1m]
06:02:47.870 Deploying outputs...