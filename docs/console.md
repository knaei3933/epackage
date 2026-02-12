21:20:35.758 Running build in Washington, D.C., USA (East) – iad1
21:20:35.759 Build machine configuration: 2 cores, 8 GB
21:20:35.970 Cloning github.com/knaei3933/epackage (Branch: main, Commit: a51b444)
21:20:35.972 Previous build caches not available.
21:20:48.384 Cloning completed: 12.413s
21:20:49.086 Running "vercel build"
21:20:49.655 Vercel CLI 50.15.1
21:20:50.204 Running "install" command: `npm install`...
21:20:55.026 npm warn deprecated scmp@2.1.0: Just use Node.js's crypto.timingSafeEqual()
21:20:55.049 npm warn deprecated rimraf@2.7.1: Rimraf versions prior to v4 are no longer supported
21:20:55.916 npm warn deprecated lodash.isequal@4.5.0: This package is deprecated. Use require('node:util').isDeepStrictEqual instead.
21:20:56.361 npm warn deprecated inflight@1.0.6: This module is not supported, and leaks memory. Do not use it. Check out lru-cache if you want a good and tested way to coalesce async requests by a key value, which is much more comprehensive and powerful.
21:20:58.443 npm warn deprecated fstream@1.0.12: This package is no longer supported.
21:20:58.757 npm warn deprecated @supabase/auth-helpers-shared@0.7.0: This package is now deprecated - please use the @supabase/ssr package instead.
21:20:59.067 npm warn deprecated node-domexception@1.0.0: Use your platform's native DOMException instead
21:21:00.673 npm warn deprecated @supabase/auth-helpers-nextjs@0.10.0: This package is now deprecated - please use the @supabase/ssr package instead.
21:21:01.568 npm warn deprecated glob@7.2.3: Glob versions prior to v9 are no longer supported
21:21:01.742 npm warn deprecated glob@7.2.3: Glob versions prior to v9 are no longer supported
21:21:01.743 npm warn deprecated glob@7.2.3: Glob versions prior to v9 are no longer supported
21:21:02.705 npm warn deprecated glob@7.2.3: Glob versions prior to v9 are no longer supported
21:21:06.191 npm warn deprecated @mswjs/data@0.16.2: Package no longer supported. Contact Support at https://www.npmjs.com/support for more info.
21:21:27.737 npm warn deprecated next@15.1.6: This version has a security vulnerability. Please upgrade to a patched version. See https://nextjs.org/blog/CVE-2025-66478 for more details.
21:21:28.645 
21:21:28.647 added 1398 packages, and audited 1399 packages in 38s
21:21:28.647 
21:21:28.647 241 packages are looking for funding
21:21:28.647   run `npm fund` for details
21:21:28.784 
21:21:28.784 26 vulnerabilities (3 moderate, 21 high, 2 critical)
21:21:28.784 
21:21:28.785 To address issues that do not require attention, run:
21:21:28.785   npm audit fix
21:21:28.785 
21:21:28.785 To address all issues (including breaking changes), run:
21:21:28.785   npm audit fix --force
21:21:28.785 
21:21:28.785 Run `npm audit` for details.
21:21:28.892 Detected Next.js version: 15.1.6
21:21:28.893 Running "npm run build"
21:21:28.995 
21:21:28.996 > epackage-lab-web@0.1.0 build
21:21:28.996 > next build
21:21:28.997 
21:21:29.587 Attention: Next.js now collects completely anonymous telemetry regarding usage.
21:21:29.587 This information is used to shape Next.js' roadmap and prioritize features.
21:21:29.588 You can learn more, including how to opt-out if you'd not like to participate in this anonymous program, by visiting the following URL:
21:21:29.589 https://nextjs.org/telemetry
21:21:29.589 
21:21:29.655    ▲ Next.js 15.1.6
21:21:29.655 
21:21:29.702    Creating an optimized production build ...
21:22:18.391 Failed to compile.
21:22:18.392 
21:22:18.393 ./src/lib/supabase.ts
21:22:18.393 Error:   [31mx[0m 'import', and 'export' cannot be used outside of module code
21:22:18.393     ,-[[36;1;4m/vercel/path0/src/lib/supabase.ts[0m:47:1]
21:22:18.394  [2m44[0m |   return serverClient
21:22:18.394  [2m45[0m | 
21:22:18.394  [2m46[0m | // Service client for admin operations (server-side only)
21:22:18.394  [2m47[0m | export const createServiceClient = () => {
21:22:18.394     : [35;1m^^^^^^[0m
21:22:18.394  [2m48[0m |     if (!supabaseUrl || !supabaseServiceKey) {
21:22:18.394  [2m49[0m |         throw new Error('Supabase service credentials not configured')
21:22:18.394  [2m50[0m |     }
21:22:18.394     `----
21:22:18.394 
21:22:18.394 Caused by:
21:22:18.394     Syntax Error
21:22:18.394 
21:22:18.394 Import trace for requested module:
21:22:18.395 ./src/lib/supabase.ts
21:22:18.395 ./src/contexts/AuthContext.tsx
21:22:18.395 
21:22:18.395 ./src/lib/supabase.ts
21:22:18.395 Error:   [31mx[0m 'import', and 'export' cannot be used outside of module code
21:22:18.395     ,-[[36;1;4m/vercel/path0/src/lib/supabase.ts[0m:47:1]
21:22:18.395  [2m44[0m |   return serverClient
21:22:18.395  [2m45[0m | 
21:22:18.395  [2m46[0m | // Service client for admin operations (server-side only)
21:22:18.395  [2m47[0m | export const createServiceClient = () => {
21:22:18.395     : [35;1m^^^^^^[0m
21:22:18.395  [2m48[0m |     if (!supabaseUrl || !supabaseServiceKey) {
21:22:18.395  [2m49[0m |         throw new Error('Supabase service credentials not configured')
21:22:18.396  [2m50[0m |     }
21:22:18.396     `----
21:22:18.396 
21:22:18.396 Caused by:
21:22:18.396     Syntax Error
21:22:18.396 
21:22:18.396 Import trace for requested module:
21:22:18.396 ./src/lib/supabase.ts
21:22:18.396 ./src/app/api/admin/approve-member/route.ts
21:22:18.396 
21:22:18.399 
21:22:18.400 > Build failed because of webpack errors
21:22:18.433 Error: Command "npm run build" exited with 1---
