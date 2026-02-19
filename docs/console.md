main-app.js?v=1771529907405:1094 Download the React DevTools for a better development experience: https://react.dev/link/react-devtools
rbac-helpers.ts:319  Server  [RBAC] getRBACContext() called
rbac-helpers.ts:320  Server  [RBAC] Environment: Object
rbac-helpers.ts:321  Server  [RBAC] Call stack:     at getRBACContext (webpack-internal:///(rsc)/./src/lib/rbac/rbac-helpers.ts:283:23)
    at requireAdminAuth (webpack-internal:///(rsc)/./src/app/admin/loader.ts:33:97)
    at OrderDetailContent (webpack-internal:///(rsc)/./src/app/admin/orders/[id]/page.tsx:37:86)
rbac-helpers.ts:374  Server  [RBAC] Checking middleware headers...
rbac-helpers.ts:381  Server  [RBAC] All available headers: Array(32)
rbac-helpers.ts:387  Server  [RBAC] Middleware headers found: Object
rbac-helpers.ts:397  Server  [RBAC] Found auth in middleware headers: Object
rbac-helpers.ts:256  Server  [RBAC] Using default permissions for role: admin
page.tsx:190  Server  [AdminOrderDetailPage] Order data: ORD-2026-MLT0HA71 (1 items)
forward-logs-shared.js:28 [HMR] connected
C:\Users\kanei\claudecode\02.Homepage_Dev\02.epac_homepagever1.1\src\contexts\AuthContext.tsx:197 [AuthContext] Initializing auth context...
C:\Users\kanei\claudecode\02.Homepage_Dev\02.epac_homepagever1.1\src\contexts\AuthContext.tsx:123 [AuthContext] Fetching session from /api/auth/current-user... Object
C:\Users\kanei\claudecode\02.Homepage_Dev\02.epac_homepagever1.1\src\contexts\AuthContext.tsx:148 [AuthContext] Session updated successfully Object
forward-logs-shared.js:28 [Fast Refresh] rebuilding
forward-logs-shared.js:28 [Fast Refresh] done in 683ms
forward-logs-shared.js:28 [Fast Refresh] rebuilding
forward-logs-shared.js:28 [Fast Refresh] done in 440ms
forward-logs-shared.js:28 [DataReceiptSection] Starting download: /api/admin/orders/87615c70-bd89-411f-aaf9-9611e72d13a3/files/fbf44668-0263-41c6-b262-0bbb8bfd6a85/download
forward-logs-shared.js:28 [Fast Refresh] rebuilding
forward-logs-shared.js:28 [Fast Refresh] done in 494ms
87615c70-bd89-411f-aaf9-9611e72d13a3:1 Access to fetch at 'https://ijlgpzjdfipzmjvawofp.supabase.co/storage/v1/object/public/production-files/1AMMb_2c7e8nt0c2au-Ez4Qdw6snP8VBW' (redirected from 'http://localhost:3000/api/admin/orders/87615c70-bd89-411f-aaf9-9611e72d13a3/files/fbf44668-0263-41c6-b262-0bbb8bfd6a85/download') from origin 'http://localhost:3000' has been blocked by CORS policy: The value of the 'Access-Control-Allow-Origin' header in the response must not be the wildcard '*' when the request's credentials mode is 'include'.
ijlgpzjdfipzmjvawofp.supabase.co/storage/v1/object/public/production-files/1AMMb_2c7e8nt0c2au-Ez4Qdw6snP8VBW:1  Failed to load resource: net::ERR_FAILED
C:\Users\kanei\claudecode\02.Homepage_Dev\02.epac_homepagever1.1\src\components\admin\DataAndCorrectionManagementTab\DataReceiptSection.tsx:139 [DataReceiptSection] Failed to download file: TypeError: Failed to fetch
    at handleDownload (C:\Users\kanei\claudecode\02.Homepage_Dev\02.epac_homepagever1.1\src\components\admin\DataAndCorrectionManagementTab\DataReceiptSection.tsx:76:30)
    at onClick (C:\Users\kanei\claudecode\02.Homepage_Dev\02.epac_homepagever1.1\src\components\admin\DataAndCorrectionManagementTab\DataReceiptSection.tsx:221:34)
    at executeDispatch (react-dom-client.development.js:20544:9)
    at runWithFiberInDEV (react-dom-client.development.js:987:30)
    at processDispatchQueue (react-dom-client.development.js:20594:19)
    at eval (react-dom-client.development.js:21165:9)
    at batchedUpdates$1 (react-dom-client.development.js:3378:40)
    at dispatchEventForPluginEventSystem (react-dom-client.development.js:20748:7)
    at dispatchEvent (react-dom-client.development.js:25694:11)
    at dispatchDiscreteEvent (react-dom-client.development.js:25662:11)
error @ intercept-console-error.js:52
handleDownload @ C:\Users\kanei\claudecode\02.Homepage_Dev\02.epac_homepagever1.1\src\components\admin\DataAndCorrectionManagementTab\DataReceiptSection.tsx:139
