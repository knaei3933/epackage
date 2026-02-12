05:55:24.454 Running build in Washington, D.C., USA (East) – iad1
05:55:24.454 Build machine configuration: 2 cores, 8 GB
05:55:24.566 Cloning github.com/knaei3933/epackage (Branch: main, Commit: 7e6df3f)
05:55:37.374 Cloning completed: 12.807s
05:55:37.819 Restored build cache from previous deployment (ESHCgNUcb6M8a6WFS53hJcoSdY69)
05:55:38.177 Running "vercel build"
05:55:38.810 Vercel CLI 50.15.1
05:55:39.320 Running "install" command: `npm install`...
05:55:44.992 
05:55:44.993 up to date, audited 1390 packages in 5s
05:55:44.993 
05:55:44.995 236 packages are looking for funding
05:55:44.995   run `npm fund` for details
05:55:45.076 
05:55:45.077 26 vulnerabilities (4 moderate, 21 high, 1 critical)
05:55:45.077 
05:55:45.078 To address issues that do not require attention, run:
05:55:45.078   npm audit fix
05:55:45.079 
05:55:45.079 To address all issues (including breaking changes), run:
05:55:45.080   npm audit fix --force
05:55:45.080 
05:55:45.080 Run `npm audit` for details.
05:55:45.116 Detected Next.js version: 16.0.11
05:55:45.116 Running "npm run build"
05:55:45.208 
05:55:45.208 > epackage-lab-web@0.1.0 build
05:55:45.208 > next build --webpack
05:55:45.208 
05:55:45.459 [baseline-browser-mapping] The data in this module is over two months old.  To ensure accurate Baseline data, please update: `npm i baseline-browser-mapping@latest -D`
05:55:46.172    ▲ Next.js 16.0.11 (webpack)
05:55:46.173 
05:55:46.180  ⚠ The "middleware" file convention is deprecated. Please use "proxy" instead. Learn more: https://nextjs.org/docs/messages/middleware-to-proxy
05:55:46.282    Creating an optimized production build ...
05:55:46.478 [baseline-browser-mapping] The data in this module is over two months old.  To ensure accurate Baseline data, please update: `npm i baseline-browser-mapping@latest -D`
05:56:07.513  ⚠ Compiled with warnings in 19.9s
05:56:07.513 
05:56:07.513 ./node_modules/handlebars/lib/index.js
05:56:07.514 require.extensions is not supported by webpack. Use a loader instead.
05:56:07.514 
05:56:07.515 Import trace for requested module:
05:56:07.515 ./node_modules/handlebars/lib/index.js
05:56:07.515 ./src/app/api/contract/pdf/route.ts
05:56:07.515 
05:56:07.516 ./node_modules/handlebars/lib/index.js
05:56:07.516 require.extensions is not supported by webpack. Use a loader instead.
05:56:07.516 
05:56:07.516 Import trace for requested module:
05:56:07.516 ./node_modules/handlebars/lib/index.js
05:56:07.517 ./src/app/api/contract/pdf/route.ts
05:56:07.517 
05:56:07.517 ./node_modules/handlebars/lib/index.js
05:56:07.517 require.extensions is not supported by webpack. Use a loader instead.
05:56:07.517 
05:56:07.518 Import trace for requested module:
05:56:07.518 ./node_modules/handlebars/lib/index.js
05:56:07.518 ./src/app/api/contract/pdf/route.ts
05:56:07.518 
05:56:07.790 [baseline-browser-mapping] The data in this module is over two months old.  To ensure accurate Baseline data, please update: `npm i baseline-browser-mapping@latest -D`
05:56:10.107 [baseline-browser-mapping] The data in this module is over two months old.  To ensure accurate Baseline data, please update: `npm i baseline-browser-mapping@latest -D`
05:56:18.155 <w> [webpack.cache.PackFileCacheStrategy] Skipped not serializable cache item 'Compilation/modules|/vercel/path0/node_modules/next/dist/build/webpack/loaders/css-loader/src/index.js??ruleSet[1].rules[15].oneOf[10].use[2]!/vercel/path0/node_modules/next/dist/build/webpack/loaders/postcss-loader/src/index.js??ruleSet[1].rules[15].oneOf[10].use[3]!/vercel/path0/src/app/globals.css': No serializer registered for Warning
05:56:18.156 <w> while serializing webpack/lib/cache/PackFileCacheStrategy.PackContentItems -> webpack/lib/NormalModule -> Array { 1 items } -> webpack/lib/ModuleWarning -> Warning
05:56:19.229  ⚠ Compiled with warnings in 8.0s
05:56:19.229 
05:56:19.231 ./src/app/globals.css.webpack[javascript/auto]!=!./node_modules/next/dist/build/webpack/loaders/css-loader/src/index.js??ruleSet[1].rules[15].oneOf[10].use[2]!./node_modules/next/dist/build/webpack/loaders/postcss-loader/src/index.js??ruleSet[1].rules[15].oneOf[10].use[3]!./src/app/globals.css
05:56:19.231 Warning
05:56:19.232 
05:56:19.232 (837:5) autoprefixer: Replace color-adjust to print-color-adjust. The color-adjust shorthand is currently deprecated.
05:56:19.232 
05:56:19.232 Import trace for requested module:
05:56:19.232 ./src/app/globals.css.webpack[javascript/auto]!=!./node_modules/next/dist/build/webpack/loaders/css-loader/src/index.js??ruleSet[1].rules[15].oneOf[10].use[2]!./node_modules/next/dist/build/webpack/loaders/postcss-loader/src/index.js??ruleSet[1].rules[15].oneOf[10].use[3]!./src/app/globals.css
05:56:19.233 ./src/app/globals.css
05:56:19.233 
05:56:19.284  ✓ Compiled successfully in 28.8s
05:56:19.286    Skipping validation of types
05:56:19.342    Collecting page data using 1 worker ...
05:56:20.016 [baseline-browser-mapping] The data in this module is over two months old.  To ensure accurate Baseline data, please update: `npm i baseline-browser-mapping@latest -D`
05:56:20.268 [Email] Production mode - configuring email service
05:56:20.270 [Email] SendGrid not configured
05:56:20.270 [Email] No email service configured - using console fallback
05:56:20.406 [EpackMailer] No SMTP configured - using console fallback
05:56:20.638 [createServiceClient] Credentials not configured, using mock client
05:56:21.182 [AccountDeletionEmail] Configuring email service
05:56:21.182 [AccountDeletionEmail] SendGrid not configured
05:56:21.182 [AccountDeletionEmail] No email service configured - using console fallback
05:56:21.810  ⚠ Using edge runtime on a page currently disables static generation for that page
05:56:30.848    Generating static pages using 1 worker (0/83) ...
05:56:31.327 [baseline-browser-mapping] The data in this module is over two months old.  To ensure accurate Baseline data, please update: `npm i baseline-browser-mapping@latest -D`
05:56:32.118 [supabase-browser] Credentials not configured, returning mock client
05:56:32.250    Generating static pages using 1 worker (20/83) 
05:56:33.357    Generating static pages using 1 worker (41/83) 
05:56:33.935    Generating static pages using 1 worker (62/83) 
05:56:34.212 [RBAC] getRBACContext() called
05:56:34.212 [RBAC] No runtime context (missing env vars), returning null context
05:56:34.213 [requireAuth] No RBAC context found, throwing AuthRequiredError
05:56:34.213 [getDefaultPostProcessingOptions] Selected defaults: [
05:56:34.213   'zipper-yes',
05:56:34.213   'glossy',
05:56:34.213   'notch-yes',
05:56:34.214   'hang-hole-6mm',
05:56:34.214   'corner-round',
05:56:34.214   'valve-no',
05:56:34.214   'top-open',
05:56:34.214   'sealing-width-5mm'
05:56:34.215 ]
05:56:34.215 [QuoteContext] initialState created: {
05:56:34.215   materialWidth: 590,
05:56:34.215   filmLayers: [
05:56:34.215     { materialId: 'PET', thickness: 12 },
05:56:34.217     { materialId: 'AL', thickness: 7 },
05:56:34.217     { materialId: 'PET', thickness: 12 },
05:56:34.217     { materialId: 'LLDPE', thickness: 70 }
05:56:34.217   ],
05:56:34.218   filmLayersCount: 4
05:56:34.218 }
05:56:34.219 [createServiceClient] Credentials not configured, using mock client
05:56:34.219 [getFeaturedProducts] Error fetching products: { message: 'Not configured', code: 'CONFIG_ERROR' }
05:56:34.219 [createServiceClient] Credentials not configured, using mock client
05:56:34.219 [getLatestAnnouncements] Error fetching announcements: { message: 'Not configured', code: 'CONFIG_ERROR' }
05:56:34.407  ✓ Generating static pages using 1 worker (83/83) in 3.6s
05:56:37.278    Finalizing page optimization ...
05:56:37.280    Collecting build traces ...
05:57:01.404 
05:57:01.411 Route (app)                                              Revalidate  Expire
05:57:01.413 ┌ ○ /                                                            5m      1y
05:57:01.413 ├ ○ /_not-found
05:57:01.413 ├ ƒ /about
05:57:01.414 ├ ƒ /admin/approvals
05:57:01.414 ├ ○ /admin/contracts
05:57:01.414 ├ ƒ /admin/contracts/[id]
05:57:01.414 ├ ○ /admin/coupons
05:57:01.414 ├ ƒ /admin/customers
05:57:01.415 ├ ƒ /admin/customers/documents
05:57:01.415 ├ ○ /admin/customers/management
05:57:01.415 ├ ƒ /admin/customers/orders
05:57:01.415 ├ ƒ /admin/customers/orders/[id]
05:57:01.415 ├ ƒ /admin/customers/profile
05:57:01.416 ├ ƒ /admin/customers/support
05:57:01.416 ├ ƒ /admin/dashboard
05:57:01.416 ├ ○ /admin/notifications
05:57:01.416 ├ ƒ /admin/orders
05:57:01.416 ├ ƒ /admin/orders/[id]
05:57:01.417 ├ ƒ /admin/orders/[id]/correction-upload
05:57:01.417 ├ ƒ /admin/orders/[id]/payment-confirmation
05:57:01.417 ├ ƒ /admin/production/[id]
05:57:01.419 ├ ƒ /admin/quotations
05:57:01.419 ├ ○ /admin/settings
05:57:01.419 ├ ○ /admin/settings/customers
05:57:01.419 ├ ○ /admin/shipments
05:57:01.420 ├ ƒ /admin/shipments/[id]
05:57:01.420 ├ ○ /admin/shipping
05:57:01.420 ├ ƒ /api/admin/approve-member
05:57:01.420 ├ ƒ /api/admin/contracts/[contractId]/download
05:57:01.420 ├ ƒ /api/admin/contracts/[contractId]/send-signature
05:57:01.421 ├ ƒ /api/admin/contracts/request-signature
05:57:01.421 ├ ƒ /api/admin/contracts/send-reminder
05:57:01.421 ├ ƒ /api/admin/contracts/workflow
05:57:01.421 ├ ƒ /api/admin/convert-to-order
05:57:01.422 ├ ƒ /api/admin/coupons
05:57:01.422 ├ ƒ /api/admin/coupons/%5Bid%5D
05:57:01.422 ├ ƒ /api/admin/customers/[id]
05:57:01.423 ├ ƒ /api/admin/customers/[id]/contact-history
05:57:01.423 ├ ƒ /api/admin/customers/management
05:57:01.423 ├ ƒ /api/admin/customers/management/export
05:57:01.424 ├ ƒ /api/admin/dashboard/statistics
05:57:01.424 ├ ƒ /api/admin/dashboard/unified-stats
05:57:01.424 ├ ƒ /api/admin/delivery/tracking/[orderId]
05:57:01.424 ├ ƒ /api/admin/email/send
05:57:01.425 ├ ƒ /api/admin/generate-work-order
05:57:01.425 ├ ƒ /api/admin/inventory/adjust
05:57:01.426 ├ ƒ /api/admin/inventory/history/[productId]
05:57:01.426 ├ ƒ /api/admin/inventory/items
05:57:01.426 ├ ƒ /api/admin/inventory/receipts
05:57:01.426 ├ ƒ /api/admin/inventory/record-entry
05:57:01.427 ├ ƒ /api/admin/inventory/update
05:57:01.427 ├ ƒ /api/admin/notifications
05:57:01.427 ├ ƒ /api/admin/notifications/[id]
05:57:01.427 ├ ƒ /api/admin/notifications/[id]/read
05:57:01.428 ├ ƒ /api/admin/notifications/create
05:57:01.432 ├ ƒ /api/admin/notifications/unread-count
05:57:01.432 ├ ƒ /api/admin/orders
05:57:01.432 ├ ƒ /api/admin/orders/[id]/apply-discount
05:57:01.432 ├ ƒ /api/admin/orders/[id]/billing-address
05:57:01.432 ├ ƒ /api/admin/orders/[id]/cancellation
05:57:01.432 ├ ƒ /api/admin/orders/[id]/comments
05:57:01.432 ├ ƒ /api/admin/orders/[id]/correction
05:57:01.432 ├ ƒ /api/admin/orders/[id]/correction/[revisionId]
05:57:01.432 ├ ƒ /api/admin/orders/[id]/data-receipt
05:57:01.432 ├ ƒ /api/admin/orders/[id]/delivery-address
05:57:01.432 ├ ƒ /api/admin/orders/[id]/delivery-note
05:57:01.432 ├ ƒ /api/admin/orders/[id]/files/[fileId]/download
05:57:01.432 ├ ƒ /api/admin/orders/[id]/items
05:57:01.432 ├ ƒ /api/admin/orders/[id]/korea-send-status
05:57:01.432 ├ ƒ /api/admin/orders/[id]/notes
05:57:01.432 ├ ƒ /api/admin/orders/[id]/payment-confirmation
05:57:01.432 ├ ƒ /api/admin/orders/[id]/send-to-korea
05:57:01.432 ├ ƒ /api/admin/orders/[id]/shipping-info
05:57:01.432 ├ ƒ /api/admin/orders/[id]/specification-change
05:57:01.432 ├ ƒ /api/admin/orders/[id]/start-production
05:57:01.432 ├ ƒ /api/admin/orders/[id]/status
05:57:01.432 ├ ƒ /api/admin/orders/[id]/status-history
05:57:01.432 ├ ƒ /api/admin/orders/bulk-status
05:57:01.432 ├ ƒ /api/admin/orders/statistics
05:57:01.432 ├ ƒ /api/admin/performance/metrics
05:57:01.432 ├ ƒ /api/admin/production-jobs/[id]
05:57:01.432 ├ ƒ /api/admin/production/[orderId]
05:57:01.432 ├ ƒ /api/admin/production/jobs
05:57:01.432 ├ ƒ /api/admin/production/jobs/[id]
05:57:01.432 ├ ƒ /api/admin/production/update-status
05:57:01.432 ├ ƒ /api/admin/quotations
05:57:01.433 ├ ƒ /api/admin/quotations/[id]
05:57:01.433 ├ ƒ /api/admin/quotations/[id]/cost-breakdown
05:57:01.433 ├ ƒ /api/admin/quotations/[id]/export
05:57:01.433 ├ ƒ /api/admin/settings
05:57:01.433 ├ ƒ /api/admin/settings/%5Bkey%5D
05:57:01.433 ├ ƒ /api/admin/settings/cache/invalidate
05:57:01.433 ├ ƒ /api/admin/settings/customer-markup
05:57:01.433 ├ ƒ /api/admin/settings/customer-markup/%5Bid%5D
05:57:01.433 ├ ƒ /api/admin/settings/designer-emails
05:57:01.433 ├ ƒ /api/admin/shipments/[id]/tracking
05:57:01.433 ├ ƒ /api/admin/shipping/deliveries/complete
05:57:01.434 ├ ƒ /api/admin/shipping/shipments
05:57:01.434 ├ ƒ /api/admin/shipping/tracking
05:57:01.434 ├ ƒ /api/admin/shipping/tracking/[id]
05:57:01.434 ├ ƒ /api/admin/test-email
05:57:01.434 ├ ƒ /api/admin/users
05:57:01.434 ├ ƒ /api/admin/users/[id]/addresses
05:57:01.434 ├ ƒ /api/admin/users/[id]/approve
05:57:01.434 ├ ƒ /api/admin/users/approve
05:57:01.434 ├ ƒ /api/admin/users/pending
05:57:01.434 ├ ƒ /api/admin/users/reject
05:57:01.434 ├ ƒ /api/ai-parser/approve
05:57:01.434 ├ ƒ /api/ai-parser/extract
05:57:01.435 ├ ƒ /api/ai-parser/reprocess
05:57:01.435 ├ ƒ /api/ai-parser/upload
05:57:01.435 ├ ƒ /api/ai-parser/validate
05:57:01.435 ├ ƒ /api/ai/parse
05:57:01.435 ├ ƒ /api/ai/review
05:57:01.435 ├ ƒ /api/ai/specs
05:57:01.435 ├ ƒ /api/analytics/vitals
05:57:01.435 ├ ƒ /api/auth/current-user
05:57:01.436 ├ ƒ /api/auth/forgot-password
05:57:01.436 ├ ƒ /api/auth/register
05:57:01.436 ├ ƒ /api/auth/register/create-profile
05:57:01.436 ├ ƒ /api/auth/reset-password
05:57:01.436 ├ ƒ /api/auth/session
05:57:01.436 ├ ƒ /api/auth/signin
05:57:01.436 ├ ƒ /api/auth/signout
05:57:01.436 ├ ƒ /api/auth/verify-email
05:57:01.437 ├ ƒ /api/b2b/ai-extraction/upload
05:57:01.437 ├ ƒ /api/b2b/files/upload
05:57:01.437 ├ ƒ /api/comparison/save
05:57:01.437 ├ ƒ /api/contact
05:57:01.449 ├ ƒ /api/contract/pdf
05:57:01.450 ├ ƒ /api/contract/timestamp
05:57:01.450 ├ ƒ /api/contract/timestamp/validate
05:57:01.450 ├ ƒ /api/contract/workflow/action
05:57:01.450 ├ ƒ /api/contracts
05:57:01.450 ├ ƒ /api/coupons/validate
05:57:01.450 ├ ƒ /api/cron/archive-orders
05:57:01.450 ├ ƒ /api/debug/auth
05:57:01.450 ├ ƒ /api/dev/apply-migration
05:57:01.450 ├ ƒ /api/dev/set-admin
05:57:01.450 ├ ƒ /api/download/templates/[category]
05:57:01.450 ├ ƒ /api/download/templates/excel
05:57:01.450 ├ ƒ /api/download/templates/pdf
05:57:01.450 ├ ƒ /api/errors/log
05:57:01.450 ├ ƒ /api/files/validate
05:57:01.450 ├ ƒ /api/member/addresses/billing
05:57:01.451 ├ ƒ /api/member/addresses/billing/[id]
05:57:01.451 ├ ƒ /api/member/addresses/delivery
05:57:01.451 ├ ƒ /api/member/addresses/delivery/[id]
05:57:01.451 ├ ƒ /api/member/ai-extraction/approve
05:57:01.451 ├ ƒ /api/member/ai-extraction/status
05:57:01.451 ├ ƒ /api/member/ai-extraction/upload
05:57:01.451 ├ ƒ /api/member/auth/resend-verification
05:57:01.451 ├ ƒ /api/member/auth/verify-email
05:57:01.452 ├ ƒ /api/member/certificates/generate
05:57:01.452 ├ ƒ /api/member/dashboard
05:57:01.452 ├ ƒ /api/member/dashboard/stats
05:57:01.452 ├ ƒ /api/member/dashboard/unified-stats
05:57:01.452 ├ ƒ /api/member/delete-account
05:57:01.452 ├ ƒ /api/member/documents
05:57:01.452 ├ ƒ /api/member/documents/[id]/download
05:57:01.452 ├ ƒ /api/member/documents/history
05:57:01.452 ├ ƒ /api/member/files/[id]/extract
05:57:01.452 ├ ƒ /api/member/files/upload
05:57:01.452 ├ ƒ /api/member/hanko/upload
05:57:01.452 ├ ƒ /api/member/inquiries
05:57:01.452 ├ ƒ /api/member/invites/accept
05:57:01.452 ├ ƒ /api/member/invites/send
05:57:01.452 ├ ƒ /api/member/invoices
05:57:01.452 ├ ƒ /api/member/invoices/[invoiceId]/download
05:57:01.452 ├ ƒ /api/member/korea/corrections
05:57:01.452 ├ ƒ /api/member/korea/corrections/[id]/upload
05:57:01.452 ├ ƒ /api/member/korea/send-data
05:57:01.452 ├ ƒ /api/member/notifications
05:57:01.452 ├ ƒ /api/member/notifications/[id]
05:57:01.452 ├ ƒ /api/member/notifications/[id]/read
05:57:01.452 ├ ƒ /api/member/notifications/delete-all
05:57:01.453 ├ ƒ /api/member/notifications/mark-all-read
05:57:01.453 ├ ƒ /api/member/orders
05:57:01.453 ├ ƒ /api/member/orders/[id]
05:57:01.453 ├ ƒ /api/member/orders/[id]/apply-coupon
05:57:01.453 ├ ƒ /api/member/orders/[id]/approvals
05:57:01.453 ├ ƒ /api/member/orders/[id]/approvals/[requestId]
05:57:01.453 ├ ƒ /api/member/orders/[id]/approve-modification
05:57:01.453 ├ ƒ /api/member/orders/[id]/billing-address
05:57:01.453 ├ ƒ /api/member/orders/[id]/comments
05:57:01.453 ├ ƒ /api/member/orders/[id]/comments/[commentId]
05:57:01.453 ├ ƒ /api/member/orders/[id]/data-receipt
05:57:01.453 ├ ƒ /api/member/orders/[id]/data-receipt/files/[fileId]
05:57:01.453 ├ ƒ /api/member/orders/[id]/delivery-address
05:57:01.453 ├ ƒ /api/member/orders/[id]/design-revisions
05:57:01.453 ├ ƒ /api/member/orders/[id]/production-data
05:57:01.453 ├ ƒ /api/member/orders/[id]/production-logs
05:57:01.453 ├ ƒ /api/member/orders/[id]/request-cancellation
05:57:01.453 ├ ƒ /api/member/orders/[id]/spec-approval
05:57:01.453 ├ ƒ /api/member/orders/[id]/specification-change
05:57:01.453 ├ ƒ /api/member/orders/[id]/status-history
05:57:01.453 ├ ƒ /api/member/orders/[id]/tracking
05:57:01.453 ├ ƒ /api/member/orders/confirm
05:57:01.453 ├ ƒ /api/member/quotations
05:57:01.453 ├ ƒ /api/member/quotations/[id]
05:57:01.453 ├ ƒ /api/member/quotations/[id]/approve
05:57:01.453 ├ ƒ /api/member/quotations/[id]/confirm-payment
05:57:01.453 ├ ƒ /api/member/quotations/[id]/convert
05:57:01.453 ├ ƒ /api/member/quotations/[id]/export
05:57:01.453 ├ ƒ /api/member/quotations/[id]/invoice
05:57:01.453 ├ ƒ /api/member/quotations/[id]/save-pdf
05:57:01.453 ├ ƒ /api/member/samples
05:57:01.453 ├ ƒ /api/member/settings
05:57:01.453 ├ ƒ /api/member/shipments
05:57:01.453 ├ ƒ /api/member/spec-sheets/[id]/approve
05:57:01.453 ├ ƒ /api/member/spec-sheets/[id]/reject
05:57:01.453 ├ ƒ /api/member/spec-sheets/generate
05:57:01.454 ├ ƒ /api/member/status
05:57:01.454 ├ ƒ /api/member/stock-in
05:57:01.454 ├ ƒ /api/member/work-orders
05:57:01.454 ├ ƒ /api/notes
05:57:01.454 ├ ƒ /api/notes/[id]
05:57:01.455 ├ ƒ /api/notifications
05:57:01.455 ├ ƒ /api/notifications/[id]
05:57:01.455 ├ ƒ /api/notifications/[id]/read
05:57:01.455 ├ ƒ /api/notifications/mark-all-read
05:57:01.455 ├ ƒ /api/notifications/unread-count
05:57:01.455 ├ ƒ /api/orders
05:57:01.455 ├ ƒ /api/orders/[id]
05:57:01.455 ├ ƒ /api/orders/[id]/cancel
05:57:01.455 ├ ƒ /api/orders/[id]/status
05:57:01.455 ├ ƒ /api/orders/cancel
05:57:01.456 ├ ƒ /api/orders/create
05:57:01.456 ├ ƒ /api/orders/receive
05:57:01.456 ├ ƒ /api/orders/reorder
05:57:01.456 ├ ƒ /api/orders/update
05:57:01.456 ├ ƒ /api/payments/confirm
05:57:01.456 ├ ƒ /api/premium-content/download
05:57:01.456 ├ ƒ /api/products
05:57:01.456 ├ ƒ /api/products/categories
05:57:01.456 ├ ƒ /api/products/filter
05:57:01.456 ├ ƒ /api/products/search
05:57:01.456 ├ ƒ /api/profile
05:57:01.456 ├ ƒ /api/profile/[id]
05:57:01.456 ├ ƒ /api/quotation
05:57:01.456 ├ ƒ /api/quotation/pdf
05:57:01.456 ├ ƒ /api/quotations/guest-save
05:57:01.456 ├ ƒ /api/quotations/save
05:57:01.456 ├ ƒ /api/quotes/excel
05:57:01.456 ├ ƒ /api/quotes/pdf
05:57:01.456 ├ ƒ /api/quotitions/[id]/confirm-transfer
05:57:01.456 ├ ƒ /api/registry/corporate-number
05:57:01.456 ├ ƒ /api/registry/postal-code
05:57:01.456 ├ ƒ /api/revalidate
05:57:01.456 ├ ƒ /api/samples
05:57:01.456 ├ ƒ /api/samples/request
05:57:01.456 ├ ƒ /api/settings
05:57:01.456 ├ ƒ /api/shipments
05:57:01.456 ├ ƒ /api/shipments/[id]
05:57:01.456 ├ ƒ /api/shipments/[id]/[trackingId]/update-tracking
05:57:01.457 ├ ƒ /api/shipments/[id]/label
05:57:01.457 ├ ƒ /api/shipments/[id]/schedule-pickup
05:57:01.457 ├ ƒ /api/shipments/[id]/track
05:57:01.457 ├ ƒ /api/shipments/bulk-create
05:57:01.457 ├ ƒ /api/shipments/create
05:57:01.457 ├ ƒ /api/shipments/tracking
05:57:01.457 ├ ƒ /api/signature/cancel
05:57:01.457 ├ ƒ /api/signature/local/save
05:57:01.457 ├ ƒ /api/signature/send
05:57:01.457 ├ ƒ /api/signature/status/[id]
05:57:01.458 ├ ƒ /api/signature/webhook
05:57:01.458 ├ ƒ /api/specsheet/approval
05:57:01.458 ├ ƒ /api/specsheet/pdf
05:57:01.458 ├ ƒ /api/specsheet/versions
05:57:01.458 ├ ƒ /api/supabase-mcp/execute
05:57:01.458 ├ ƒ /api/templates
05:57:01.458 ├ ƒ /archives
05:57:01.458 ├ ƒ /auth/error
05:57:01.458 ├ ƒ /auth/forgot-password
05:57:01.458 ├ ƒ /auth/pending
05:57:01.458 ├ ○ /auth/register
05:57:01.458 ├ ○ /auth/reset-password
05:57:01.459 ├ ○ /auth/signin
05:57:01.459 ├ ƒ /auth/signin/form-post
05:57:01.459 ├ ○ /auth/signout
05:57:01.459 ├ ○ /auth/suspended
05:57:01.459 ├ ○ /cart
05:57:01.459 ├ ○ /catalog
05:57:01.459 ├ ● /catalog/[slug]
05:57:01.459 │ ├ /catalog/three-seal-001
05:57:01.459 │ ├ /catalog/stand-pouch-001
05:57:01.460 │ ├ /catalog/box-pouch-001
05:57:01.460 │ └ [+3 more paths]
05:57:01.460 ├ ○ /compare
05:57:01.460 ├ ○ /compare/shared
05:57:01.460 ├ ○ /contact
05:57:01.460 ├ ○ /contact/thank-you
05:57:01.460 ├ ○ /csr
05:57:01.460 ├ ○ /data-templates
05:57:01.460 ├ ○ /design-system
05:57:01.460 ├ ○ /flow
05:57:01.460 ├ ○ /guide
05:57:01.460 ├ ○ /guide/color
05:57:01.460 ├ ○ /guide/environmentaldisplay
05:57:01.460 ├ ○ /guide/image
05:57:01.460 ├ ○ /guide/shirohan
05:57:01.460 ├ ○ /guide/size
05:57:01.460 ├ ƒ /industry/cosmetics
05:57:01.460 ├ ƒ /industry/electronics
05:57:01.460 ├ ƒ /industry/food-manufacturing
05:57:01.461 ├ ƒ /industry/pharmaceutical
05:57:01.461 ├ ○ /inquiry/detailed
05:57:01.461 ├ ○ /legal
05:57:01.461 ├ ○ /member/billing-addresses
05:57:01.461 ├ ○ /member/contracts
05:57:01.461 ├ ƒ /member/dashboard
05:57:01.462 ├ ○ /member/deliveries
05:57:01.462 ├ ○ /member/edit
05:57:01.462 ├ ○ /member/inquiries
05:57:01.462 ├ ○ /member/invoices
05:57:01.462 ├ ○ /member/notifications
05:57:01.462 ├ ƒ /member/orders
05:57:01.462 ├ ƒ /member/orders/[id]
05:57:01.462 ├ ƒ /member/orders/[id]/confirmation
05:57:01.463 ├ ƒ /member/orders/[id]/data-receipt
05:57:01.463 ├ ƒ /member/orders/[id]/preparation
05:57:01.463 ├ ƒ /member/orders/[id]/spec-approval
05:57:01.463 ├ ○ /member/orders/history
05:57:01.463 ├ ○ /member/orders/new
05:57:01.463 ├ ○ /member/orders/reorder
05:57:01.463 ├ ○ /member/profile
05:57:01.463 ├ ○ /member/quotations
05:57:01.463 ├ ƒ /member/quotations/[id]
05:57:01.463 ├ ƒ /member/quotations/[id]/confirm
05:57:01.463 ├ ○ /member/quotations/request
05:57:01.463 ├ ○ /member/samples
05:57:01.463 ├ ○ /member/settings
05:57:01.463 ├ ○ /members
05:57:01.463 ├ ƒ /news
05:57:01.463 ├ ○ /premium-content
05:57:01.463 ├ ○ /pricing
05:57:01.463 ├ ○ /print
05:57:01.464 ├ ○ /privacy
05:57:01.464 ├ ○ /profile
05:57:01.464 ├ ○ /quote-simulator
05:57:01.464 ├ ○ /robots.txt
05:57:01.464 ├ ○ /samples
05:57:01.464 ├ ○ /samples/thank-you
05:57:01.464 ├ ○ /service
05:57:01.464 ├ ○ /sitemap.xml
05:57:01.464 └ ○ /terms
05:57:01.464 
05:57:01.464 
05:57:01.464 ƒ Proxy (Middleware)
05:57:01.464 
05:57:01.467 ○  (Static)   prerendered as static content
05:57:01.467 ●  (SSG)      prerendered as static HTML (uses generateStaticParams)
05:57:01.467 ƒ  (Dynamic)  server-rendered on demand
05:57:01.467 
05:57:02.103 Traced Next.js server files in: 70.63ms
05:57:03.788 Created all serverless functions in: 1.685s
05:57:04.029 Collected static files (public/, static/, .next/static): 70.716ms
05:57:04.854 Build Completed in /vercel/output [1m]
05:57:05.566 Deploying outputs...