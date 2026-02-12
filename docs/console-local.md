
> epackage-lab-web@0.1.0 build
> next build

▲ Next.js 16.1.6 (Turbopack)
- Environments: .env.local, .env

⚠ The "middleware" file convention is deprecated. Please use "proxy" instead. Learn more: https://nextjs.org/docs/messages/middleware-to-proxy
  Creating an optimized production build ...
Turbopack build encountered 1 warnings:
./src/app/api/admin/email/send/route.ts:473:14
Next.js can't recognize the exported `config` field in route. Page config in `config` is deprecated and ignored, use individual exports instead.
[0m [90m 471 |[39m [90m * エラーハンドリング設定[39m
 [90m 472 |[39m [90m */[39m
[31m[1m>[22m[39m[90m 473 |[39m [36mexport[39m [36mconst[39m config [33m=[39m {
 [90m     |[39m              [31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m
 [90m 474 |[39m   api[33m:[39m {
 [90m 475 |[39m     bodyParser[33m:[39m [36mtrue[39m[33m,[39m
 [90m 476 |[39m   }[33m,[39m[0m

The exported configuration object in a source file needs to have a very specific format from which some properties can be statically parsed at compiled-time.

https://nextjs.org/docs/app/api-reference/file-conventions/route-segment-config



> Build error occurred
Error: Turbopack build failed with 8 errors:
./src/app/member/quotations/[id]/page.tsx:33:1
Export InvoiceDownloadButton doesn't exist in target module
[0m [90m 31 |[39m [36mimport[39m { generateQuotePDF[33m,[39m type [33mQuoteData[39m } [36mfrom[39m [32m'@/lib/pdf-generator'[39m[33m;[39m
 [90m 32 |[39m [36mimport[39m { translateBagType[33m,[39m translateMaterialType } [36mfrom[39m [32m'@/constants/enToJa'[39m[33m;[39m
[31m[1m>[22m[39m[90m 33 |[39m [36mimport[39m { [33mBankInfoCard[39m[33m,[39m [33mInvoiceDownloadButton[39m } [36mfrom[39m [32m'@/components/quote'[39m[33m;[39m
 [90m    |[39m [31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m
 [90m 34 |[39m [36mimport[39m { getMaterialSpecification } [36mfrom[39m [32m'@/lib/unified-pricing-engine'[39m[33m;[39m
 [90m 35 |[39m [36mimport[39m type { [33mQuotation[39m } [36mfrom[39m [32m'@/types/dashboard'[39m[33m;[39m
 [90m 36 |[39m[0m

The export InvoiceDownloadButton was not found in module [project]/src/components/quote/shared/index.ts [app-client] (ecmascript).
The module has no exports at all.
All exports of the module are statically known (It doesn't have dynamic exports). So it's known statically that the requested export doesn't exist.

Import traces:
  Client Component Browser:
    ./src/app/member/quotations/[id]/page.tsx [Client Component Browser]
    ./src/app/member/quotations/[id]/page.tsx [Server Component]

  Client Component SSR:
    ./src/app/member/quotations/[id]/page.tsx [Client Component SSR]
    ./src/app/member/quotations/[id]/page.tsx [Server Component]


./src/app/member/quotations/[id]/page.tsx:33:1
Export InvoiceDownloadButton doesn't exist in target module
[0m [90m 31 |[39m [36mimport[39m { generateQuotePDF[33m,[39m type [33mQuoteData[39m } [36mfrom[39m [32m'@/lib/pdf-generator'[39m[33m;[39m
 [90m 32 |[39m [36mimport[39m { translateBagType[33m,[39m translateMaterialType } [36mfrom[39m [32m'@/constants/enToJa'[39m[33m;[39m
[31m[1m>[22m[39m[90m 33 |[39m [36mimport[39m { [33mBankInfoCard[39m[33m,[39m [33mInvoiceDownloadButton[39m } [36mfrom[39m [32m'@/components/quote'[39m[33m;[39m
 [90m    |[39m [31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m
 [90m 34 |[39m [36mimport[39m { getMaterialSpecification } [36mfrom[39m [32m'@/lib/unified-pricing-engine'[39m[33m;[39m
 [90m 35 |[39m [36mimport[39m type { [33mQuotation[39m } [36mfrom[39m [32m'@/types/dashboard'[39m[33m;[39m
 [90m 36 |[39m[0m

The export InvoiceDownloadButton was not found in module [project]/src/components/quote/shared/index.ts [app-ssr] (ecmascript).
The module has no exports at all.
All exports of the module are statically known (It doesn't have dynamic exports). So it's known statically that the requested export doesn't exist.

Import traces:
  Client Component Browser:
    ./src/app/member/quotations/[id]/page.tsx [Client Component Browser]
    ./src/app/member/quotations/[id]/page.tsx [Server Component]

  Client Component SSR:
    ./src/app/member/quotations/[id]/page.tsx [Client Component SSR]
    ./src/app/member/quotations/[id]/page.tsx [Server Component]


./src/components/quote/index.ts:46:1
Export InvoiceDownloadButton doesn't exist in target module
[0m [90m 44 |[39m [90m// Shared - UI Components[39m
 [90m 45 |[39m [36mexport[39m { [33mResponsiveStepIndicators[39m[33m,[39m [33mKeyboardShortcutsHint[39m[33m,[39m [33mErrorToast[39m } [36mfrom[39m [32m'./shared'[39m
[31m[1m>[22m[39m[90m 46 |[39m [36mexport[39m { [33mOrderConfirmationModal[39m[33m,[39m [33mDetailedOptionModal[39m[33m,[39m [33mBankInfoCard[39m[33m,[39m [33mInvoiceDownloadButton[39m[33m,[39m [33mDataImportStatusPanel[39m } [36mfrom[39m [32m'./shared'[39m
 [90m    |[39m [31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m
 [90m 47 |[39m [36mexport[39m { [33mDataTemplateGuide[39m } [36mfrom[39m [32m'./shared'[39m
 [90m 48 |[39m
 [90m 49 |[39m [90m// Shared - Analytics & Recommendations[39m[0m

The export InvoiceDownloadButton was not found in module [project]/src/components/quote/shared/index.ts [app-client] (ecmascript).
The module has no exports at all.
All exports of the module are statically known (It doesn't have dynamic exports). So it's known statically that the requested export doesn't exist.

Import traces:
  Client Component Browser:
    ./src/components/quote/index.ts [Client Component Browser]
    ./src/app/member/quotations/[id]/page.tsx [Client Component Browser]
    ./src/app/member/quotations/[id]/page.tsx [Server Component]

  Client Component SSR:
    ./src/components/quote/index.ts [Client Component SSR]
    ./src/app/member/quotations/[id]/page.tsx [Client Component SSR]
    ./src/app/member/quotations/[id]/page.tsx [Server Component]


./src/components/quote/index.ts:46:1
Export InvoiceDownloadButton doesn't exist in target module
[0m [90m 44 |[39m [90m// Shared - UI Components[39m
 [90m 45 |[39m [36mexport[39m { [33mResponsiveStepIndicators[39m[33m,[39m [33mKeyboardShortcutsHint[39m[33m,[39m [33mErrorToast[39m } [36mfrom[39m [32m'./shared'[39m
[31m[1m>[22m[39m[90m 46 |[39m [36mexport[39m { [33mOrderConfirmationModal[39m[33m,[39m [33mDetailedOptionModal[39m[33m,[39m [33mBankInfoCard[39m[33m,[39m [33mInvoiceDownloadButton[39m[33m,[39m [33mDataImportStatusPanel[39m } [36mfrom[39m [32m'./shared'[39m
 [90m    |[39m [31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m
 [90m 47 |[39m [36mexport[39m { [33mDataTemplateGuide[39m } [36mfrom[39m [32m'./shared'[39m
 [90m 48 |[39m
 [90m 49 |[39m [90m// Shared - Analytics & Recommendations[39m[0m

The export InvoiceDownloadButton was not found in module [project]/src/components/quote/shared/index.ts [app-ssr] (ecmascript).
The module has no exports at all.
All exports of the module are statically known (It doesn't have dynamic exports). So it's known statically that the requested export doesn't exist.

Import traces:
  Client Component Browser:
    ./src/components/quote/index.ts [Client Component Browser]
    ./src/app/member/quotations/[id]/page.tsx [Client Component Browser]
    ./src/app/member/quotations/[id]/page.tsx [Server Component]

  Client Component SSR:
    ./src/components/quote/index.ts [Client Component SSR]
    ./src/app/member/quotations/[id]/page.tsx [Client Component SSR]
    ./src/app/member/quotations/[id]/page.tsx [Server Component]


./src/components/quote/wizards/ImprovedQuotingWizard.tsx:56:1
Export OrderSummarySection doesn't exist in target module
[0m [90m 54 |[39m [36mimport[39m { [33mUnifiedSKUQuantityStep[39m } [36mfrom[39m [32m'../steps'[39m[33m;[39m
 [90m 55 |[39m [36mimport[39m { [33mParallelProductionOptions[39m[33m,[39m [33mEconomicQuantityProposal[39m } [36mfrom[39m [32m'../shared'[39m[33m;[39m
[31m[1m>[22m[39m[90m 56 |[39m [36mimport[39m { [33mOrderSummarySection[39m } [36mfrom[39m [32m'../shared'[39m[33m;[39m
 [90m    |[39m [31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m
 [90m 57 |[39m [36mimport[39m { [33mQuantityOptionsGrid[39m } [36mfrom[39m [32m'../selectors'[39m[33m;[39m
 [90m 58 |[39m [36mimport[39m { pouchCostCalculator } [36mfrom[39m [32m'@/lib/pouch-cost-calculator'[39m[33m;[39m
 [90m 59 |[39m [36mimport[39m type { [33mParallelProductionOption[39m[33m,[39m [33mEconomicQuantitySuggestionData[39m } [36mfrom[39m [32m'../shared'[39m[33m;[39m[0m

The export OrderSummarySection was not found in module [project]/src/components/quote/shared/index.ts [app-client] (ecmascript).
The module has no exports at all.
All exports of the module are statically known (It doesn't have dynamic exports). So it's known statically that the requested export doesn't exist.

Import traces:
  #1 [Client Component Browser]:
    ./src/components/quote/wizards/ImprovedQuotingWizard.tsx [Client Component Browser]
    ./src/app/quote-simulator/page.tsx [Client Component Browser]
    ./src/app/quote-simulator/page.tsx [Server Component]

  #2 [Client Component Browser]:
    ./src/components/quote/wizards/ImprovedQuotingWizard.tsx [Client Component Browser]
    ./src/components/quote/wizards/index.ts [Client Component Browser]
    ./src/components/quote/index.ts [Client Component Browser]
    ./src/app/member/quotations/[id]/page.tsx [Client Component Browser]
    ./src/app/member/quotations/[id]/page.tsx [Server Component]

  #3 [Client Component SSR]:
    ./src/components/quote/wizards/ImprovedQuotingWizard.tsx [Client Component SSR]
    ./src/components/quote/wizards/index.ts [Client Component SSR]
    ./src/components/quote/index.ts [Client Component SSR]
    ./src/app/member/quotations/[id]/page.tsx [Client Component SSR]
    ./src/app/member/quotations/[id]/page.tsx [Server Component]


./src/components/quote/wizards/ImprovedQuotingWizard.tsx:56:1
Export OrderSummarySection doesn't exist in target module
[0m [90m 54 |[39m [36mimport[39m { [33mUnifiedSKUQuantityStep[39m } [36mfrom[39m [32m'../steps'[39m[33m;[39m
 [90m 55 |[39m [36mimport[39m { [33mParallelProductionOptions[39m[33m,[39m [33mEconomicQuantityProposal[39m } [36mfrom[39m [32m'../shared'[39m[33m;[39m
[31m[1m>[22m[39m[90m 56 |[39m [36mimport[39m { [33mOrderSummarySection[39m } [36mfrom[39m [32m'../shared'[39m[33m;[39m
 [90m    |[39m [31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m
 [90m 57 |[39m [36mimport[39m { [33mQuantityOptionsGrid[39m } [36mfrom[39m [32m'../selectors'[39m[33m;[39m
 [90m 58 |[39m [36mimport[39m { pouchCostCalculator } [36mfrom[39m [32m'@/lib/pouch-cost-calculator'[39m[33m;[39m
 [90m 59 |[39m [36mimport[39m type { [33mParallelProductionOption[39m[33m,[39m [33mEconomicQuantitySuggestionData[39m } [36mfrom[39m [32m'../shared'[39m[33m;[39m[0m

The export OrderSummarySection was not found in module [project]/src/components/quote/shared/index.ts [app-ssr] (ecmascript).
The module has no exports at all.
All exports of the module are statically known (It doesn't have dynamic exports). So it's known statically that the requested export doesn't exist.

Import traces:
  #1 [Client Component Browser]:
    ./src/components/quote/wizards/ImprovedQuotingWizard.tsx [Client Component Browser]
    ./src/app/quote-simulator/page.tsx [Client Component Browser]
    ./src/app/quote-simulator/page.tsx [Server Component]

  #2 [Client Component Browser]:
    ./src/components/quote/wizards/ImprovedQuotingWizard.tsx [Client Component Browser]
    ./src/components/quote/wizards/index.ts [Client Component Browser]
    ./src/components/quote/index.ts [Client Component Browser]
    ./src/app/member/quotations/[id]/page.tsx [Client Component Browser]
    ./src/app/member/quotations/[id]/page.tsx [Server Component]

  #3 [Client Component SSR]:
    ./src/components/quote/wizards/ImprovedQuotingWizard.tsx [Client Component SSR]
    ./src/components/quote/wizards/index.ts [Client Component SSR]
    ./src/components/quote/index.ts [Client Component SSR]
    ./src/app/member/quotations/[id]/page.tsx [Client Component SSR]
    ./src/app/member/quotations/[id]/page.tsx [Server Component]


./src/components/quote/wizards/ImprovedQuotingWizard.tsx:54:1
Export UnifiedSKUQuantityStep doesn't exist in target module
[0m [90m 52 |[39m [36mimport[39m { useKeyboardNavigation } [36mfrom[39m [32m'../shared/useKeyboardNavigation'[39m[33m;[39m
 [90m 53 |[39m [36mimport[39m { [33mResponsiveStepIndicators[39m } [36mfrom[39m [32m'../shared/ResponsiveStepIndicators'[39m[33m;[39m
[31m[1m>[22m[39m[90m 54 |[39m [36mimport[39m { [33mUnifiedSKUQuantityStep[39m } [36mfrom[39m [32m'../steps'[39m[33m;[39m
 [90m    |[39m [31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m
 [90m 55 |[39m [36mimport[39m { [33mParallelProductionOptions[39m[33m,[39m [33mEconomicQuantityProposal[39m } [36mfrom[39m [32m'../shared'[39m[33m;[39m
 [90m 56 |[39m [36mimport[39m { [33mOrderSummarySection[39m } [36mfrom[39m [32m'../shared'[39m[33m;[39m
 [90m 57 |[39m [36mimport[39m { [33mQuantityOptionsGrid[39m } [36mfrom[39m [32m'../selectors'[39m[33m;[39m[0m

The export UnifiedSKUQuantityStep was not found in module [project]/src/components/quote/steps/index.ts [app-client] (ecmascript).
The module has no exports at all.
All exports of the module are statically known (It doesn't have dynamic exports). So it's known statically that the requested export doesn't exist.

Import traces:
  #1 [Client Component Browser]:
    ./src/components/quote/wizards/ImprovedQuotingWizard.tsx [Client Component Browser]
    ./src/app/quote-simulator/page.tsx [Client Component Browser]
    ./src/app/quote-simulator/page.tsx [Server Component]

  #2 [Client Component Browser]:
    ./src/components/quote/wizards/ImprovedQuotingWizard.tsx [Client Component Browser]
    ./src/components/quote/wizards/index.ts [Client Component Browser]
    ./src/components/quote/index.ts [Client Component Browser]
    ./src/app/member/quotations/[id]/page.tsx [Client Component Browser]
    ./src/app/member/quotations/[id]/page.tsx [Server Component]

  #3 [Client Component SSR]:
    ./src/components/quote/wizards/ImprovedQuotingWizard.tsx [Client Component SSR]
    ./src/components/quote/wizards/index.ts [Client Component SSR]
    ./src/components/quote/index.ts [Client Component SSR]
    ./src/app/member/quotations/[id]/page.tsx [Client Component SSR]
    ./src/app/member/quotations/[id]/page.tsx [Server Component]


./src/components/quote/wizards/ImprovedQuotingWizard.tsx:54:1
Export UnifiedSKUQuantityStep doesn't exist in target module
[0m [90m 52 |[39m [36mimport[39m { useKeyboardNavigation } [36mfrom[39m [32m'../shared/useKeyboardNavigation'[39m[33m;[39m
 [90m 53 |[39m [36mimport[39m { [33mResponsiveStepIndicators[39m } [36mfrom[39m [32m'../shared/ResponsiveStepIndicators'[39m[33m;[39m
[31m[1m>[22m[39m[90m 54 |[39m [36mimport[39m { [33mUnifiedSKUQuantityStep[39m } [36mfrom[39m [32m'../steps'[39m[33m;[39m
 [90m    |[39m [31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m
 [90m 55 |[39m [36mimport[39m { [33mParallelProductionOptions[39m[33m,[39m [33mEconomicQuantityProposal[39m } [36mfrom[39m [32m'../shared'[39m[33m;[39m
 [90m 56 |[39m [36mimport[39m { [33mOrderSummarySection[39m } [36mfrom[39m [32m'../shared'[39m[33m;[39m
 [90m 57 |[39m [36mimport[39m { [33mQuantityOptionsGrid[39m } [36mfrom[39m [32m'../selectors'[39m[33m;[39m[0m

The export UnifiedSKUQuantityStep was not found in module [project]/src/components/quote/steps/index.ts [app-ssr] (ecmascript).
The module has no exports at all.
All exports of the module are statically known (It doesn't have dynamic exports). So it's known statically that the requested export doesn't exist.

Import traces:
  #1 [Client Component Browser]:
    ./src/components/quote/wizards/ImprovedQuotingWizard.tsx [Client Component Browser]
    ./src/app/quote-simulator/page.tsx [Client Component Browser]
    ./src/app/quote-simulator/page.tsx [Server Component]

  #2 [Client Component Browser]:
    ./src/components/quote/wizards/ImprovedQuotingWizard.tsx [Client Component Browser]
    ./src/components/quote/wizards/index.ts [Client Component Browser]
    ./src/components/quote/index.ts [Client Component Browser]
    ./src/app/member/quotations/[id]/page.tsx [Client Component Browser]
    ./src/app/member/quotations/[id]/page.tsx [Server Component]

  #3 [Client Component SSR]:
    ./src/components/quote/wizards/ImprovedQuotingWizard.tsx [Client Component SSR]
    ./src/components/quote/wizards/index.ts [Client Component SSR]
    ./src/components/quote/index.ts [Client Component SSR]
    ./src/app/member/quotations/[id]/page.tsx [Client Component SSR]
    ./src/app/member/quotations/[id]/page.tsx [Server Component]


    at <unknown> (./src/app/member/quotations/[id]/page.tsx:33:1)
    at <unknown> (./src/app/member/quotations/[id]/page.tsx:33:1)
    at <unknown> (./src/components/quote/index.ts:46:1)
    at <unknown> (./src/components/quote/index.ts:46:1)
    at <unknown> (./src/components/quote/wizards/ImprovedQuotingWizard.tsx:56:1)
    at <unknown> (./src/components/quote/wizards/ImprovedQuotingWizard.tsx:56:1)
    at <unknown> (./src/components/quote/wizards/ImprovedQuotingWizard.tsx:54:1)
    at <unknown> (./src/components/quote/wizards/ImprovedQuotingWizard.tsx:54:1)
