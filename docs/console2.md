16:59:31.367 Running build in Washington, D.C., USA (East) – iad1
16:59:31.367 Build machine configuration: 2 cores, 8 GB
16:59:31.502 Cloning github.com/knaei3933/epackage (Branch: main, Commit: 9af3456)
16:59:36.377 Cloning completed: 4.874s
16:59:37.303 Found .vercelignore
16:59:37.334 Removed 13 ignored files defined in .vercelignore
16:59:37.334   /public/templates/template-box.ai
16:59:37.334   /public/templates/template-flat_3_side.ai
16:59:37.334   /public/templates/template-roll_film.ai
16:59:37.334   /public/templates/template-spout_pouch.ai
16:59:37.335   /public/templates/template-stand_up.ai
16:59:37.335   /src/app/archives/page.tsx
16:59:37.335   /src/components/archives/ArchiveDetailModal.tsx
16:59:37.335   /src/components/archives/ArchiveFilters.tsx
16:59:37.335   /src/components/archives/ArchiveGrid.tsx
16:59:37.335   /src/components/archives/ArchivePage.tsx
16:59:37.420 Restored build cache from previous deployment (CLDovKV2R4EntygQW2LRKvC6WY4w)
16:59:38.892 Running "vercel build"
16:59:39.461 Vercel CLI 50.23.2
16:59:39.985 Installing dependencies...
16:59:42.484 
16:59:42.485 up to date in 2s
16:59:42.485 
16:59:42.486 315 packages are looking for funding
16:59:42.486   run `npm fund` for details
16:59:42.516 Detected Next.js version: 16.0.11
16:59:42.524 Running "npm run build"
16:59:42.625 
16:59:42.626 > epackage-lab-web@0.1.0 build
16:59:42.626 > next build --webpack
16:59:42.626 
16:59:42.896 [baseline-browser-mapping] The data in this module is over two months old.  To ensure accurate Baseline data, please update: `npm i baseline-browser-mapping@latest -D`
16:59:43.692    ▲ Next.js 16.0.11 (webpack)
16:59:43.694 
16:59:43.703  ⚠ The "middleware" file convention is deprecated. Please use "proxy" instead. Learn more: https://nextjs.org/docs/messages/middleware-to-proxy
16:59:43.814    Creating an optimized production build ...
16:59:44.033 [baseline-browser-mapping] The data in this module is over two months old.  To ensure accurate Baseline data, please update: `npm i baseline-browser-mapping@latest -D`
17:00:18.494  ⚠ Compiled with warnings in 33.0s
17:00:18.495 
17:00:18.496 ./node_modules/handlebars/lib/index.js
17:00:18.497 require.extensions is not supported by webpack. Use a loader instead.
17:00:18.497 
17:00:18.497 Import trace for requested module:
17:00:18.497 ./node_modules/handlebars/lib/index.js
17:00:18.498 ./src/lib/pdf/specSheetPdfGenerator.ts
17:00:18.498 ./src/app/api/specsheet/pdf/route.ts
17:00:18.498 
17:00:18.498 ./node_modules/handlebars/lib/index.js
17:00:18.498 require.extensions is not supported by webpack. Use a loader instead.
17:00:18.499 
17:00:18.499 Import trace for requested module:
17:00:18.499 ./node_modules/handlebars/lib/index.js
17:00:18.499 ./src/lib/pdf/specSheetPdfGenerator.ts
17:00:18.500 ./src/app/api/specsheet/pdf/route.ts
17:00:18.500 
17:00:18.500 ./node_modules/handlebars/lib/index.js
17:00:18.500 require.extensions is not supported by webpack. Use a loader instead.
17:00:18.500 
17:00:18.500 Import trace for requested module:
17:00:18.501 ./node_modules/handlebars/lib/index.js
17:00:18.501 ./src/lib/pdf/specSheetPdfGenerator.ts
17:00:18.501 ./src/app/api/specsheet/pdf/route.ts
17:00:18.501 
17:00:18.838 [baseline-browser-mapping] The data in this module is over two months old.  To ensure accurate Baseline data, please update: `npm i baseline-browser-mapping@latest -D`
17:00:22.210 [baseline-browser-mapping] The data in this module is over two months old.  To ensure accurate Baseline data, please update: `npm i baseline-browser-mapping@latest -D`
17:00:31.536 <w> [webpack.cache.PackFileCacheStrategy] Skipped not serializable cache item 'Compilation/modules|/vercel/path0/node_modules/next/dist/build/webpack/loaders/css-loader/src/index.js??ruleSet[1].rules[15].oneOf[10].use[2]!/vercel/path0/node_modules/next/dist/build/webpack/loaders/postcss-loader/src/index.js??ruleSet[1].rules[15].oneOf[10].use[3]!/vercel/path0/src/app/globals.css': No serializer registered for Warning
17:00:31.537 <w> while serializing webpack/lib/cache/PackFileCacheStrategy.PackContentItems -> webpack/lib/NormalModule -> Array { 1 items } -> webpack/lib/ModuleWarning -> Warning
17:00:31.608  ⚠ Compiled with warnings in 8.1s
17:00:31.608 
17:00:31.608 ./src/app/globals.css.webpack[javascript/auto]!=!./node_modules/next/dist/build/webpack/loaders/css-loader/src/index.js??ruleSet[1].rules[15].oneOf[10].use[2]!./node_modules/next/dist/build/webpack/loaders/postcss-loader/src/index.js??ruleSet[1].rules[15].oneOf[10].use[3]!./src/app/globals.css
17:00:31.609 Warning
17:00:31.609 
17:00:31.609 (1109:5) autoprefixer: Replace color-adjust to print-color-adjust. The color-adjust shorthand is currently deprecated.
17:00:31.609 
17:00:31.609 Import trace for requested module:
17:00:31.609 ./src/app/globals.css.webpack[javascript/auto]!=!./node_modules/next/dist/build/webpack/loaders/css-loader/src/index.js??ruleSet[1].rules[15].oneOf[10].use[2]!./node_modules/next/dist/build/webpack/loaders/postcss-loader/src/index.js??ruleSet[1].rules[15].oneOf[10].use[3]!./src/app/globals.css
17:00:31.609 ./src/app/globals.css
17:00:31.609 
17:00:31.675  ✓ Compiled successfully in 43s
17:00:31.689    Skipping validation of types
17:00:31.774    Collecting page data using 1 worker ...
17:00:32.423 [baseline-browser-mapping] The data in this module is over two months old.  To ensure accurate Baseline data, please update: `npm i baseline-browser-mapping@latest -D`
17:00:32.952 [Email] SendGrid not configured
17:00:32.953 [Email] No email service configured - using console fallback
17:00:34.530 [AccountDeletionEmail] SendGrid not configured
17:00:34.530 [AccountDeletionEmail] No email service configured - using console fallback
17:00:35.508  ⚠ Using edge runtime on a page currently disables static generation for that page
17:00:46.604    Generating static pages using 1 worker (0/119) ...
17:00:47.080 [baseline-browser-mapping] The data in this module is over two months old.  To ensure accurate Baseline data, please update: `npm i baseline-browser-mapping@latest -D`
17:00:55.553    Generating static pages using 1 worker (29/119) 
17:00:55.554    Generating static pages using 1 worker (59/119) 
17:00:55.554    Generating static pages using 1 worker (89/119) 
17:00:55.555  ✓ Generating static pages using 1 worker (119/119) in 9.0s
17:00:57.987 [getAuthenticatedUser] Error: Error: Dynamic server usage: Route / couldn't be rendered statically because it used `cookies`. See more info here: https://nextjs.org/docs/messages/dynamic-server-error
17:00:57.988     at x (.next/server/chunks/134.js:12:9265)
17:00:57.988     at n (.next/server/chunks/5573.js:1:9582)
17:00:57.989     at h (.next/server/app/page.js:16:80524)
17:00:57.989     at async i (.next/server/app/page.js:16:80657)
17:00:57.989     at async m (.next/server/app/page.js:1:5266) {
17:00:57.990   description: "Route / couldn't be rendered statically because it used `cookies`. See more info here: https://nextjs.org/docs/messages/dynamic-server-error",
17:00:57.990   digest: 'DYNAMIC_SERVER_USAGE'
17:00:57.990 }
17:01:01.547    Finalizing page optimization ...
17:01:01.548    Collecting build traces ...
17:01:27.777 
17:01:27.785 Route (app)
17:01:27.785 ┌ ƒ /
17:01:27.785 ├ ○ /_not-found
17:01:27.785 ├ ○ /about
17:01:27.785 ├ ○ /admin
17:01:27.785 ├ ƒ /admin/approvals
17:01:27.785 ├ ○ /admin/blog
17:01:27.785 ├ ○ /admin/contracts
17:01:27.785 ├ ƒ /admin/contracts/[id]
17:01:27.785 ├ ○ /admin/coupons
17:01:27.785 ├ ƒ /admin/customers
17:01:27.785 ├ ƒ /admin/customers/documents
17:01:27.785 ├ ○ /admin/customers/management
17:01:27.785 ├ ƒ /admin/customers/orders
17:01:27.786 ├ ƒ /admin/customers/orders/[id]
17:01:27.788 ├ ƒ /admin/customers/profile
17:01:27.788 ├ ƒ /admin/customers/support
17:01:27.788 ├ ƒ /admin/dashboard
17:01:27.788 ├ ○ /admin/leads
17:01:27.788 ├ ○ /admin/notifications
17:01:27.788 ├ ƒ /admin/orders
17:01:27.788 ├ ƒ /admin/orders/[id]
17:01:27.788 ├ ƒ /admin/orders/[id]/correction-upload
17:01:27.788 ├ ƒ /admin/orders/[id]/payment-confirmation
17:01:27.788 ├ ƒ /admin/quotations
17:01:27.789 ├ ○ /admin/settings
17:01:27.789 ├ ○ /admin/settings/customers
17:01:27.789 ├ ○ /admin/settings/google-drive
17:01:27.789 ├ ○ /admin/shipments
17:01:27.789 ├ ƒ /admin/shipments/[id]
17:01:27.789 ├ ○ /admin/shipping
17:01:27.789 ├ ƒ /api/admin/approvals
17:01:27.789 ├ ƒ /api/admin/approve-member
17:01:27.789 ├ ƒ /api/admin/blog
17:01:27.789 ├ ƒ /api/admin/blog/[id]
17:01:27.789 ├ ƒ /api/admin/blog/upload-image
17:01:27.789 ├ ƒ /api/admin/contracts
17:01:27.789 ├ ƒ /api/admin/contracts/[contractId]/download
17:01:27.789 ├ ƒ /api/admin/contracts/[contractId]/send-signature
17:01:27.789 ├ ƒ /api/admin/contracts/request-signature
17:01:27.789 ├ ƒ /api/admin/contracts/send-reminder
17:01:27.789 ├ ƒ /api/admin/contracts/workflow
17:01:27.789 ├ ƒ /api/admin/convert-to-order
17:01:27.789 ├ ƒ /api/admin/coupons
17:01:27.790 ├ ƒ /api/admin/coupons/%5Bid%5D
17:01:27.790 ├ ƒ /api/admin/customers/[id]
17:01:27.790 ├ ƒ /api/admin/customers/[id]/contact-history
17:01:27.790 ├ ƒ /api/admin/customers/management
17:01:27.790 ├ ƒ /api/admin/customers/management/export
17:01:27.790 ├ ƒ /api/admin/dashboard/statistics
17:01:27.790 ├ ƒ /api/admin/dashboard/unified-stats
17:01:27.790 ├ ƒ /api/admin/delivery/tracking/[orderId]
17:01:27.790 ├ ƒ /api/admin/email/send
17:01:27.790 ├ ƒ /api/admin/generate-work-order
17:01:27.790 ├ ƒ /api/admin/google-drive/status
17:01:27.791 ├ ƒ /api/admin/leads
17:01:27.791 ├ ƒ /api/admin/notifications
17:01:27.791 ├ ƒ /api/admin/notifications/[id]
17:01:27.792 ├ ƒ /api/admin/notifications/[id]/read
17:01:27.792 ├ ƒ /api/admin/notifications/create
17:01:27.792 ├ ƒ /api/admin/notifications/unread-count
17:01:27.792 ├ ƒ /api/admin/orders
17:01:27.793 ├ ƒ /api/admin/orders/[id]/apply-discount
17:01:27.793 ├ ƒ /api/admin/orders/[id]/billing-address
17:01:27.793 ├ ƒ /api/admin/orders/[id]/cancellation
17:01:27.793 ├ ƒ /api/admin/orders/[id]/comments
17:01:27.794 ├ ƒ /api/admin/orders/[id]/correction
17:01:27.794 ├ ƒ /api/admin/orders/[id]/correction/[revisionId]
17:01:27.794 ├ ƒ /api/admin/orders/[id]/correction/[revisionId]/preview
17:01:27.795 ├ ƒ /api/admin/orders/[id]/data-receipt
17:01:27.795 ├ ƒ /api/admin/orders/[id]/delivery-address
17:01:27.795 ├ ƒ /api/admin/orders/[id]/delivery-note
17:01:27.796 ├ ƒ /api/admin/orders/[id]/files/[fileId]/download
17:01:27.796 ├ ƒ /api/admin/orders/[id]/items
17:01:27.796 ├ ƒ /api/admin/orders/[id]/korea-send-status
17:01:27.796 ├ ƒ /api/admin/orders/[id]/notes
17:01:27.797 ├ ƒ /api/admin/orders/[id]/notify-designer-data-upload
17:01:27.797 ├ ƒ /api/admin/orders/[id]/notify-designer-rejection
17:01:27.797 ├ ƒ /api/admin/orders/[id]/payment-confirmation
17:01:27.797 ├ ƒ /api/admin/orders/[id]/send-to-korea
17:01:27.797 ├ ƒ /api/admin/orders/[id]/shipping-info
17:01:27.797 ├ ƒ /api/admin/orders/[id]/specification-change
17:01:27.798 ├ ƒ /api/admin/orders/[id]/start-production
17:01:27.798 ├ ƒ /api/admin/orders/[id]/status
17:01:27.799 ├ ƒ /api/admin/orders/[id]/status-history
17:01:27.799 ├ ƒ /api/admin/orders/[id]/upload-token
17:01:27.799 ├ ƒ /api/admin/orders/bulk-status
17:01:27.799 ├ ƒ /api/admin/orders/statistics
17:01:27.800 ├ ƒ /api/admin/performance/metrics
17:01:27.800 ├ ƒ /api/admin/production-jobs/[id]
17:01:27.800 ├ ƒ /api/admin/quotations
17:01:27.800 ├ ƒ /api/admin/quotations/[id]
17:01:27.801 ├ ƒ /api/admin/quotations/[id]/cost-breakdown
17:01:27.801 ├ ƒ /api/admin/quotations/[id]/export
17:01:27.801 ├ ƒ /api/admin/settings
17:01:27.801 ├ ƒ /api/admin/settings/[category]/[key]
17:01:27.801 ├ ƒ /api/admin/settings/cache/invalidate
17:01:27.802 ├ ƒ /api/admin/settings/customer-markup
17:01:27.802 ├ ƒ /api/admin/settings/designer-emails
17:01:27.802 ├ ƒ /api/admin/settings/email-config
17:01:27.802 ├ ƒ /api/admin/shipments
17:01:27.802 ├ ƒ /api/admin/shipments/[id]/tracking
17:01:27.802 ├ ƒ /api/admin/shipping/deliveries/complete
17:01:27.803 ├ ƒ /api/admin/shipping/shipments
17:01:27.803 ├ ƒ /api/admin/shipping/tracking
17:01:27.803 ├ ƒ /api/admin/shipping/tracking/[id]
17:01:27.803 ├ ƒ /api/admin/test-email
17:01:27.803 ├ ƒ /api/admin/users
17:01:27.804 ├ ƒ /api/admin/users/[id]/addresses
17:01:27.804 ├ ƒ /api/admin/users/[id]/approve
17:01:27.805 ├ ƒ /api/admin/users/approve
17:01:27.806 ├ ƒ /api/admin/users/pending
17:01:27.806 ├ ƒ /api/admin/users/reject
17:01:27.806 ├ ƒ /api/ai-parser/approve
17:01:27.807 ├ ƒ /api/ai-parser/extract
17:01:27.807 ├ ƒ /api/ai-parser/reprocess
17:01:27.807 ├ ƒ /api/ai-parser/upload
17:01:27.807 ├ ƒ /api/ai-parser/validate
17:01:27.808 ├ ƒ /api/ai/parse
17:01:27.808 ├ ƒ /api/ai/review
17:01:27.808 ├ ƒ /api/ai/specs
17:01:27.809 ├ ƒ /api/analytics/vitals
17:01:27.809 ├ ƒ /api/auth/current-user
17:01:27.809 ├ ƒ /api/auth/forgot-password
17:01:27.809 ├ ƒ /api/auth/google
17:01:27.810 ├ ƒ /api/auth/google/callback
17:01:27.810 ├ ƒ /api/auth/register
17:01:27.810 ├ ƒ /api/auth/register/create-profile
17:01:27.811 ├ ƒ /api/auth/reset-password
17:01:27.811 ├ ƒ /api/auth/session
17:01:27.811 ├ ƒ /api/auth/signin
17:01:27.812 ├ ƒ /api/auth/signout
17:01:27.812 ├ ƒ /api/auth/verify-email
17:01:27.812 ├ ƒ /api/b2b/ai-extraction/upload
17:01:27.813 ├ ƒ /api/b2b/files/upload
17:01:27.813 ├ ƒ /api/comparison/save
17:01:27.813 ├ ƒ /api/contact
17:01:27.814 ├ ƒ /api/contract/pdf
17:01:27.814 ├ ƒ /api/contract/timestamp
17:01:27.814 ├ ƒ /api/contract/timestamp/validate
17:01:27.815 ├ ƒ /api/contract/workflow/action
17:01:27.815 ├ ƒ /api/contracts
17:01:27.815 ├ ƒ /api/coupons/validate
17:01:27.815 ├ ƒ /api/cron/archive-orders
17:01:27.816 ├ ƒ /api/debug/auth
17:01:27.816 ├ ƒ /api/debug/files-table
17:01:27.816 ├ ƒ /api/debug/google-status
17:01:27.817 ├ ƒ /api/debug/token-status
17:01:27.817 ├ ƒ /api/designer/download-file/[fileId]
17:01:27.817 ├ ƒ /api/designer/orders
17:01:27.818 ├ ƒ /api/designer/orders/[id]
17:01:27.818 ├ ƒ /api/designer/orders/[id]/correction
17:01:27.818 ├ ƒ /api/designer/orders/[id]/correction/[revisionId]/preview
17:01:27.819 ├ ƒ /api/designer/orders/[id]/revisions
17:01:27.819 ├ ƒ /api/dev/apply-migration
17:01:27.819 ├ ƒ /api/dev/set-admin
17:01:27.819 ├ ƒ /api/download/templates/[category]
17:01:27.820 ├ ƒ /api/download/templates/excel
17:01:27.820 ├ ƒ /api/download/templates/pdf
17:01:27.820 ├ ƒ /api/errors/log
17:01:27.821 ├ ƒ /api/files/validate
17:01:27.821 ├ ƒ /api/internal/translate-comment
17:01:27.821 ├ ƒ /api/member/addresses/billing
17:01:27.821 ├ ƒ /api/member/addresses/billing/[id]
17:01:27.822 ├ ƒ /api/member/addresses/delivery
17:01:27.822 ├ ƒ /api/member/addresses/delivery/[id]
17:01:27.822 ├ ƒ /api/member/ai-extraction/approve
17:01:27.822 ├ ƒ /api/member/ai-extraction/status
17:01:27.823 ├ ƒ /api/member/ai-extraction/upload
17:01:27.823 ├ ƒ /api/member/auth/resend-verification
17:01:27.823 ├ ƒ /api/member/auth/verify-email
17:01:27.824 ├ ƒ /api/member/certificates/generate
17:01:27.824 ├ ƒ /api/member/dashboard
17:01:27.824 ├ ƒ /api/member/dashboard/stats
17:01:27.824 ├ ƒ /api/member/dashboard/unified-stats
17:01:27.825 ├ ƒ /api/member/delete-account
17:01:27.825 ├ ƒ /api/member/documents
17:01:27.825 ├ ƒ /api/member/documents/[id]/download
17:01:27.825 ├ ƒ /api/member/documents/history
17:01:27.826 ├ ƒ /api/member/files/[id]/extract
17:01:27.826 ├ ƒ /api/member/files/upload
17:01:27.826 ├ ƒ /api/member/hanko/upload
17:01:27.827 ├ ƒ /api/member/inquiries
17:01:27.827 ├ ƒ /api/member/invites/accept
17:01:27.827 ├ ƒ /api/member/invites/send
17:01:27.827 ├ ƒ /api/member/invoices
17:01:27.828 ├ ƒ /api/member/invoices/[invoiceId]/download
17:01:27.828 ├ ƒ /api/member/korea/corrections
17:01:27.828 ├ ƒ /api/member/korea/corrections/[id]/upload
17:01:27.828 ├ ƒ /api/member/korea/send-data
17:01:27.829 ├ ƒ /api/member/notifications
17:01:27.829 ├ ƒ /api/member/notifications/[id]
17:01:27.829 ├ ƒ /api/member/notifications/[id]/read
17:01:27.830 ├ ƒ /api/member/notifications/delete-all
17:01:27.830 ├ ƒ /api/member/notifications/mark-all-read
17:01:27.830 ├ ƒ /api/member/orders
17:01:27.830 ├ ƒ /api/member/orders/[id]
17:01:27.831 ├ ƒ /api/member/orders/[id]/apply-coupon
17:01:27.831 ├ ƒ /api/member/orders/[id]/approvals
17:01:27.831 ├ ƒ /api/member/orders/[id]/approvals/[requestId]
17:01:27.832 ├ ƒ /api/member/orders/[id]/approve-modification
17:01:27.832 ├ ƒ /api/member/orders/[id]/billing-address
17:01:27.832 ├ ƒ /api/member/orders/[id]/comments
17:01:27.832 ├ ƒ /api/member/orders/[id]/comments/[commentId]
17:01:27.834 ├ ƒ /api/member/orders/[id]/data-receipt
17:01:27.834 ├ ƒ /api/member/orders/[id]/data-receipt/files/[fileId]
17:01:27.834 ├ ƒ /api/member/orders/[id]/delivery-address
17:01:27.834 ├ ƒ /api/member/orders/[id]/design-revisions
17:01:27.835 ├ ƒ /api/member/orders/[id]/design-revisions/[revisionId]/retry-translation
17:01:27.835 ├ ƒ /api/member/orders/[id]/items
17:01:27.835 ├ ƒ /api/member/orders/[id]/production-data
17:01:27.835 ├ ƒ /api/member/orders/[id]/production-logs
17:01:27.836 ├ ƒ /api/member/orders/[id]/request-cancellation
17:01:27.836 ├ ƒ /api/member/orders/[id]/resubmit-file
17:01:27.836 ├ ƒ /api/member/orders/[id]/revision-history
17:01:27.837 ├ ƒ /api/member/orders/[id]/spec-approval
17:01:27.838 ├ ƒ /api/member/orders/[id]/specification-change
17:01:27.838 ├ ƒ /api/member/orders/[id]/status-history
17:01:27.838 ├ ƒ /api/member/orders/[id]/tracking
17:01:27.838 ├ ƒ /api/member/orders/[id]/upload-file
17:01:27.839 ├ ƒ /api/member/orders/confirm
17:01:27.839 ├ ƒ /api/member/quotations
17:01:27.839 ├ ƒ /api/member/quotations/[id]
17:01:27.840 ├ ƒ /api/member/quotations/[id]/approve
17:01:27.840 ├ ƒ /api/member/quotations/[id]/confirm-payment
17:01:27.840 ├ ƒ /api/member/quotations/[id]/convert
17:01:27.840 ├ ƒ /api/member/quotations/[id]/export
17:01:27.841 ├ ƒ /api/member/quotations/[id]/invoice
17:01:27.841 ├ ƒ /api/member/quotations/[id]/save-pdf
17:01:27.841 ├ ƒ /api/member/samples
17:01:27.841 ├ ƒ /api/member/settings
17:01:27.842 ├ ƒ /api/member/shipments
17:01:27.842 ├ ƒ /api/member/spec-sheets/[id]/approve
17:01:27.842 ├ ƒ /api/member/spec-sheets/[id]/reject
17:01:27.842 ├ ƒ /api/member/spec-sheets/generate
17:01:27.843 ├ ƒ /api/member/status
17:01:27.843 ├ ƒ /api/member/stock-in
17:01:27.843 ├ ƒ /api/member/work-orders
17:01:27.843 ├ ƒ /api/notes
17:01:27.844 ├ ƒ /api/notes/[id]
17:01:27.844 ├ ƒ /api/notifications
17:01:27.844 ├ ƒ /api/notifications/[id]
17:01:27.845 ├ ƒ /api/notifications/[id]/read
17:01:27.845 ├ ƒ /api/notifications/mark-all-read
17:01:27.845 ├ ƒ /api/notifications/unread-count
17:01:27.845 ├ ƒ /api/orders
17:01:27.846 ├ ƒ /api/orders/[id]
17:01:27.846 ├ ƒ /api/orders/[id]/cancel
17:01:27.846 ├ ƒ /api/orders/[id]/status
17:01:27.846 ├ ƒ /api/orders/cancel
17:01:27.847 ├ ƒ /api/orders/create
17:01:27.847 ├ ƒ /api/orders/receive
17:01:27.847 ├ ƒ /api/orders/reorder
17:01:27.847 ├ ƒ /api/orders/update
17:01:27.848 ├ ƒ /api/payments/confirm
17:01:27.848 ├ ƒ /api/premium-content/download
17:01:27.848 ├ ƒ /api/pricing/settings
17:01:27.849 ├ ƒ /api/products
17:01:27.849 ├ ƒ /api/products/categories
17:01:27.849 ├ ƒ /api/products/filter
17:01:27.849 ├ ƒ /api/products/search
17:01:27.850 ├ ƒ /api/profile
17:01:27.850 ├ ƒ /api/profile/[id]
17:01:27.850 ├ ƒ /api/quotation
17:01:27.850 ├ ƒ /api/quotation/pdf
17:01:27.851 ├ ƒ /api/quotations/guest-save
17:01:27.851 ├ ƒ /api/quotations/save
17:01:27.851 ├ ƒ /api/quotes/excel
17:01:27.851 ├ ƒ /api/quotes/pdf
17:01:27.852 ├ ƒ /api/quotitions/[id]/confirm-transfer
17:01:27.852 ├ ƒ /api/registry/corporate
17:01:27.852 ├ ƒ /api/registry/corporate-number
17:01:27.853 ├ ƒ /api/registry/debug
17:01:27.853 ├ ƒ /api/registry/postal-code
17:01:27.853 ├ ƒ /api/registry/search
17:01:27.853 ├ ƒ /api/registry/test
17:01:27.854 ├ ƒ /api/revalidate
17:01:27.854 ├ ƒ /api/samples
17:01:27.854 ├ ƒ /api/samples/request
17:01:27.854 ├ ƒ /api/settings
17:01:27.855 ├ ƒ /api/shipments
17:01:27.855 ├ ƒ /api/shipments/[id]
17:01:27.855 ├ ƒ /api/shipments/[id]/[trackingId]/update-tracking
17:01:27.855 ├ ƒ /api/shipments/[id]/label
17:01:27.856 ├ ƒ /api/shipments/[id]/schedule-pickup
17:01:27.856 ├ ƒ /api/shipments/[id]/track
17:01:27.856 ├ ƒ /api/shipments/bulk-create
17:01:27.857 ├ ƒ /api/shipments/create
17:01:27.857 ├ ƒ /api/shipments/tracking
17:01:27.857 ├ ƒ /api/signature/cancel
17:01:27.857 ├ ƒ /api/signature/local/save
17:01:27.858 ├ ƒ /api/signature/send
17:01:27.858 ├ ƒ /api/signature/status/[id]
17:01:27.858 ├ ƒ /api/signature/webhook
17:01:27.858 ├ ƒ /api/specsheet/approval
17:01:27.859 ├ ƒ /api/specsheet/pdf
17:01:27.859 ├ ƒ /api/specsheet/versions
17:01:27.859 ├ ƒ /api/supabase-mcp/execute
17:01:27.859 ├ ƒ /api/templates
17:01:27.860 ├ ƒ /api/translate
17:01:27.860 ├ ƒ /api/translate/status
17:01:27.860 ├ ƒ /api/upload-to-drive
17:01:27.861 ├ ƒ /api/upload/[token]
17:01:27.861 ├ ƒ /api/upload/[token]/comments
17:01:27.861 ├ ƒ /api/upload/[token]/validate
17:01:27.861 ├ ƒ /api/user/markup-rate
17:01:27.862 ├ ƒ /auth
17:01:27.862 ├ ƒ /auth/error
17:01:27.862 ├ ƒ /auth/forgot-password
17:01:27.862 ├ ƒ /auth/pending
17:01:27.863 ├ ○ /auth/register
17:01:27.863 ├ ○ /auth/reset-password
17:01:27.863 ├ ○ /auth/signin
17:01:27.864 ├ ƒ /auth/signin/form-post
17:01:27.864 ├ ○ /auth/signout
17:01:27.864 ├ ○ /auth/suspended
17:01:27.864 ├ ƒ /blog
17:01:27.865 ├ ● /blog/[slug]
17:01:27.865 ├ ƒ /blog/category/[category]
17:01:27.865 ├ ƒ /blog/rss.xml
17:01:27.865 ├ ● /blog/tag/[tag]
17:01:27.866 │ ├ /blog/tag/%E3%83%91%E3%83%83%E3%82%B1%E3%83%BC%E3%82%B8
17:01:27.866 │ ├ /blog/tag/%E8%A3%BD%E5%93%81%E7%B4%B9%E4%BB%8B
17:01:27.866 │ ├ /blog/tag/%E5%AE%9F%E8%B7%B5%E7%9A%84%E3%83%8E%E3%82%A6%E3%83%8F%E3%82%A6
17:01:27.867 │ └ [+17 more paths]
17:01:27.867 ├ ○ /cart
17:01:27.867 ├ ○ /catalog
17:01:27.867 ├ ● /catalog/[slug]
17:01:27.868 │ ├ /catalog/three-seal-001
17:01:27.868 │ ├ /catalog/stand-pouch-001
17:01:27.868 │ ├ /catalog/box-pouch-001
17:01:27.868 │ └ [+3 more paths]
17:01:27.868 ├ ○ /compare
17:01:27.869 ├ ○ /compare/shared
17:01:27.869 ├ ○ /contact
17:01:27.869 ├ ○ /contact/thank-you
17:01:27.869 ├ ○ /csr
17:01:27.869 ├ ○ /data-templates
17:01:27.869 ├ ○ /design-system
17:01:27.870 ├ ƒ /designer
17:01:27.870 ├ ƒ /designer-order
17:01:27.870 ├ ƒ /designer-order/[token]
17:01:27.870 ├ ƒ /designer-order/invalid
17:01:27.870 ├ ƒ /designer/login
17:01:27.870 ├ ƒ /designer/orders/[id]
17:01:27.871 ├ ○ /flow
17:01:27.871 ├ ○ /guide
17:01:27.871 ├ ○ /guide/color
17:01:27.871 ├ ○ /guide/environmentaldisplay
17:01:27.871 ├ ○ /guide/image
17:01:27.871 ├ ○ /guide/shirohan
17:01:27.872 ├ ○ /guide/size
17:01:27.872 ├ ○ /industry/cosmetics
17:01:27.873 ├ ○ /industry/electronics
17:01:27.873 ├ ○ /industry/food-manufacturing
17:01:27.873 ├ ○ /industry/pharmaceutical
17:01:27.874 ├ ○ /inquiry/detailed
17:01:27.874 ├ ○ /legal
17:01:27.874 ├ ƒ /member
17:01:27.874 ├ ○ /member/billing-addresses
17:01:27.875 ├ ○ /member/contracts
17:01:27.875 ├ ƒ /member/dashboard
17:01:27.875 ├ ○ /member/deliveries
17:01:27.876 ├ ƒ /member/edit
17:01:27.876 ├ ○ /member/inquiries
17:01:27.876 ├ ƒ /member/invoices
17:01:27.876 ├ ○ /member/notifications
17:01:27.877 ├ ƒ /member/orders
17:01:27.877 ├ ƒ /member/orders/[id]
17:01:27.877 ├ ƒ /member/orders/[id]/confirmation
17:01:27.878 ├ ƒ /member/orders/[id]/data-receipt
17:01:27.878 ├ ƒ /member/orders/[id]/preparation
17:01:27.878 ├ ƒ /member/orders/[id]/spec-approval
17:01:27.878 ├ ○ /member/orders/history
17:01:27.879 ├ ○ /member/orders/new
17:01:27.879 ├ ○ /member/orders/reorder
17:01:27.879 ├ ƒ /member/profile
17:01:27.880 ├ ƒ /member/quotations
17:01:27.880 ├ ƒ /member/quotations/[id]
17:01:27.880 ├ ƒ /member/quotations/[id]/confirm
17:01:27.881 ├ ○ /member/quotations/request
17:01:27.881 ├ ○ /member/samples
17:01:27.881 ├ ƒ /member/settings
17:01:27.881 ├ ○ /members
17:01:27.882 ├ ƒ /news
17:01:27.882 ├ ○ /premium-content
17:01:27.882 ├ ○ /pricing
17:01:27.883 ├ ○ /print
17:01:27.883 ├ ○ /privacy
17:01:27.883 ├ ○ /profile
17:01:27.883 ├ ○ /quote-simulator
17:01:27.884 ├ ○ /robots.txt
17:01:27.884 ├ ○ /samples
17:01:27.884 ├ ○ /samples/thank-you
17:01:27.885 ├ ○ /service
17:01:27.885 ├ ƒ /sitemap.xml
17:01:27.885 ├ ○ /terms
17:01:27.885 ├ ƒ /upload/[token]
17:01:27.886 └ ○ /upload/invalid
17:01:27.886 
17:01:27.886 
17:01:27.886 ƒ Proxy (Middleware)
17:01:27.887 
17:01:27.892 ○  (Static)   prerendered as static content
17:01:27.893 ●  (SSG)      prerendered as static HTML (uses generateStaticParams)
17:01:27.893 ƒ  (Dynamic)  server-rendered on demand
17:01:27.893 
17:01:28.724 Traced Next.js server files in: 62.376ms
17:01:30.370 Created all serverless functions in: 1.645s
17:01:30.627 Collected static files (public/, static/, .next/static): 77.116ms
17:01:31.728 Build Completed in /vercel/output [2m]
17:01:32.602 Deploying outputs...
17:01:50.183 Deployment completed
17:01:51.263 Creating build cache...
17:02:34.555 Created build cache: 43s
17:02:34.556 Uploading build cache [510.86 MB]
17:02:41.580 Build cache uploaded: 7.025s