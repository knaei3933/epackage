main-app.js?v=1771641741117:1094 Download the React DevTools for a better development experience: https://react.dev/link/react-devtools
dashboard.ts:256  Server  [requireAuth] START: Authentication check initiated
dashboard.ts:264  Server  [requireAuth] Importing getRBACContext...
dashboard.ts:266  Server  [requireAuth] Calling getRBACContext()...
rbac-helpers.ts:319  Server  [RBAC] getRBACContext() called
rbac-helpers.ts:320  Server  [RBAC] Environment: {NODE_ENV: 'development'}
rbac-helpers.ts:321  Server  [RBAC] Call stack:     at getRBACContext (webpack-internal:///(rsc)/./src/lib/rbac/rbac-helpers.ts:283:23)
    at requireAuth (webpack-internal:///(rsc)/./src/lib/dashboard.ts:158:29)
    at async OrderDetailContent (webpack-internal:///(rsc)/./src/app/member/orders/[id]/page.tsx:49:5)
rbac-helpers.ts:374  Server  [RBAC] Checking middleware headers...
rbac-helpers.ts:381  Server  [RBAC] All available headers: (34) [Array(2), Array(2), Array(2), Array(2), Array(2), Array(2), Array(2), Array(2), Array(2), Array(2), Array(2), Array(2), Array(2), Array(2), Array(2), Array(2), Array(2), Array(2), Array(2), Array(2), Array(2), Array(2), Array(2), Array(2), Array(2), Array(2), Array(2), Array(2), Array(2), Array(2), Array(2), Array(2), Array(2), Array(2), _debugInfo: Array(0)]
rbac-helpers.ts:387  Server  [RBAC] Middleware headers found: {hasUserId: true, hasUserRole: true, hasUserStatus: true, userId: '54fd7b31-b805-43cf-b92e-898ddd066875', userRole: 'ADMIN', …}
rbac-helpers.ts:397  Server  [RBAC] Found auth in middleware headers: {userId: '54fd7b31-b805-43cf-b92e-898ddd066875', userRole: 'ADMIN', userStatus: 'ACTIVE'}
rbac-helpers.ts:256  Server  [RBAC] Using default permissions for role: admin
dashboard.ts:268  Server  [requireAuth] getRBACContext returned: CONTEXT {userId: '54fd7b31-b805-43cf-b92e-898ddd066875', role: 'admin', status: 'ACTIVE', permissions: Array(37), isDevMode: false}
dashboard.ts:279  Server  [requireAuth] Got user from RBAC context: 54fd7b31-b805-43cf-b92e-898ddd066875 Role: admin Status: ACTIVE
dashboard.ts:433  Server  [getCurrentUserId] Server-side: Found user ID from headers: 54fd7b31-b805-43cf-b92e-898ddd066875
dashboard.ts:433  Server  [getCurrentUserId] Server-side: Found user ID from headers: 54fd7b31-b805-43cf-b92e-898ddd066875
forward-logs-shared.js:28 [HMR] connected
C:\Users\kanei\claudecode\02.Homepage_Dev\02.epac_homepagever1.1\src\contexts\AuthContext.tsx:197 [AuthContext] Initializing auth context...
C:\Users\kanei\claudecode\02.Homepage_Dev\02.epac_homepagever1.1\src\contexts\AuthContext.tsx:123 [AuthContext] Fetching session from /api/auth/current-user... {fetchId: 1}
C:\Users\kanei\claudecode\02.Homepage_Dev\02.epac_homepagever1.1\src\contexts\AuthContext.tsx:148 [AuthContext] Session updated successfully {fetchId: 1}
forward-logs-shared.js:28 [Fast Refresh] rebuilding
forward-logs-shared.js:28 [Fast Refresh] done in 375ms
forward-logs-shared.js:28 [Fast Refresh] rebuilding
forward-logs-shared.js:28 [Fast Refresh] done in 588ms
forward-logs-shared.js:28 [Fast Refresh] rebuilding
forward-logs-shared.js:28 [Fast Refresh] done in 453ms
dashboard.ts:256  Server  [requireAuth] START: Authentication check initiated
dashboard.ts:264  Server  [requireAuth] Importing getRBACContext...
dashboard.ts:266  Server  [requireAuth] Calling getRBACContext()...
rbac-helpers.ts:319  Server  [RBAC] getRBACContext() called
rbac-helpers.ts:320  Server  [RBAC] Environment: {NODE_ENV: 'development'}
rbac-helpers.ts:321  Server  [RBAC] Call stack:     at getRBACContext (webpack-internal:///(rsc)/./src/lib/rbac/rbac-helpers.ts:283:23)
    at requireAuth (webpack-internal:///(rsc)/./src/lib/dashboard.ts:158:29)
    at async OrderDetailContent (webpack-internal:///(rsc)/./src/app/member/orders/[id]/page.tsx:49:5)
rbac-helpers.ts:374  Server  [RBAC] Checking middleware headers...
rbac-helpers.ts:381  Server  [RBAC] All available headers: (32) [Array(2), Array(2), Array(2), Array(2), Array(2), Array(2), Array(2), Array(2), Array(2), Array(2), Array(2), Array(2), Array(2), Array(2), Array(2), Array(2), Array(2), Array(2), Array(2), Array(2), Array(2), Array(2), Array(2), Array(2), Array(2), Array(2), Array(2), Array(2), Array(2), Array(2), Array(2), Array(2), _debugInfo: Array(2)]
rbac-helpers.ts:387  Server  [RBAC] Middleware headers found: {hasUserId: true, hasUserRole: true, hasUserStatus: true, userId: '54fd7b31-b805-43cf-b92e-898ddd066875', userRole: 'ADMIN', …}
rbac-helpers.ts:397  Server  [RBAC] Found auth in middleware headers: {userId: '54fd7b31-b805-43cf-b92e-898ddd066875', userRole: 'ADMIN', userStatus: 'ACTIVE'}
rbac-helpers.ts:256  Server  [RBAC] Using default permissions for role: admin
dashboard.ts:268  Server  [requireAuth] getRBACContext returned: CONTEXT {userId: '54fd7b31-b805-43cf-b92e-898ddd066875', role: 'admin', status: 'ACTIVE', permissions: Array(37), isDevMode: false}
dashboard.ts:279  Server  [requireAuth] Got user from RBAC context: 54fd7b31-b805-43cf-b92e-898ddd066875 Role: admin Status: ACTIVE
dashboard.ts:433  Server  [getCurrentUserId] Server-side: Found user ID from headers: 54fd7b31-b805-43cf-b92e-898ddd066875
dashboard.ts:433  Server  [getCurrentUserId] Server-side: Found user ID from headers: 54fd7b31-b805-43cf-b92e-898ddd066875
forward-logs-shared.js:28 [Fast Refresh] rebuilding
forward-logs-shared.js:28 [Fast Refresh] done in 454ms
forward-logs-shared.js:28 [Fast Refresh] rebuilding
forward-logs-shared.js:28 [Fast Refresh] done in 401ms
forward-logs-shared.js:28 [Fast Refresh] rebuilding
forward-logs-shared.js:28 [Fast Refresh] done in 441ms
forward-logs-shared.js:28 [Fast Refresh] rebuilding
forward-logs-shared.js:28 [Fast Refresh] done in 765ms
dashboard.ts:256  Server  [requireAuth] START: Authentication check initiated
dashboard.ts:264  Server  [requireAuth] Importing getRBACContext...
dashboard.ts:266  Server  [requireAuth] Calling getRBACContext()...
rbac-helpers.ts:319  Server  [RBAC] getRBACContext() called
rbac-helpers.ts:320  Server  [RBAC] Environment: {NODE_ENV: 'development'}
rbac-helpers.ts:321  Server  [RBAC] Call stack:     at getRBACContext (webpack-internal:///(rsc)/./src/lib/rbac/rbac-helpers.ts:283:23)
    at requireAuth (webpack-internal:///(rsc)/./src/lib/dashboard.ts:158:29)
    at async OrderDetailContent (webpack-internal:///(rsc)/./src/app/member/orders/[id]/page.tsx:49:5)
rbac-helpers.ts:374  Server  [RBAC] Checking middleware headers...
rbac-helpers.ts:381  Server  [RBAC] All available headers: (32) [Array(2), Array(2), Array(2), Array(2), Array(2), Array(2), Array(2), Array(2), Array(2), Array(2), Array(2), Array(2), Array(2), Array(2), Array(2), Array(2), Array(2), Array(2), Array(2), Array(2), Array(2), Array(2), Array(2), Array(2), Array(2), Array(2), Array(2), Array(2), Array(2), Array(2), Array(2), Array(2), _debugInfo: Array(2)]
rbac-helpers.ts:387  Server  [RBAC] Middleware headers found: {hasUserId: true, hasUserRole: true, hasUserStatus: true, userId: '54fd7b31-b805-43cf-b92e-898ddd066875', userRole: 'ADMIN', …}
rbac-helpers.ts:397  Server  [RBAC] Found auth in middleware headers: {userId: '54fd7b31-b805-43cf-b92e-898ddd066875', userRole: 'ADMIN', userStatus: 'ACTIVE'}
rbac-helpers.ts:256  Server  [RBAC] Using default permissions for role: admin
dashboard.ts:268  Server  [requireAuth] getRBACContext returned: CONTEXT {userId: '54fd7b31-b805-43cf-b92e-898ddd066875', role: 'admin', status: 'ACTIVE', permissions: Array(37), isDevMode: false}
dashboard.ts:279  Server  [requireAuth] Got user from RBAC context: 54fd7b31-b805-43cf-b92e-898ddd066875 Role: admin Status: ACTIVE
dashboard.ts:433  Server  [getCurrentUserId] Server-side: Found user ID from headers: 54fd7b31-b805-43cf-b92e-898ddd066875
dashboard.ts:433  Server  [getCurrentUserId] Server-side: Found user ID from headers: 54fd7b31-b805-43cf-b92e-898ddd066875
preview:1  GET http://localhost:3000/api/admin/orders/ea3e05f6-9da2-4ff0-9500-7d0413e853bc/correction/406d31c8-f150-423b-adf9-ff594e2fea9d/preview net::ERR_TOO_MANY_REDIRECTS
Image
commitMount @ react-dom-client.development.js:23623
runWithFiberInDEV @ react-dom-client.development.js:987
commitHostMount @ react-dom-client.development.js:14044
commitLayoutEffectOnFiber @ react-dom-client.development.js:15102
recursivelyTraverseLayoutEffects @ react-dom-client.development.js:16371
commitLayoutEffectOnFiber @ react-dom-client.development.js:15100
recursivelyTraverseLayoutEffects @ react-dom-client.development.js:16371
commitLayoutEffectOnFiber @ react-dom-client.development.js:15100
recursivelyTraverseLayoutEffects @ react-dom-client.development.js:16371
commitLayoutEffectOnFiber @ react-dom-client.development.js:15100
recursivelyTraverseLayoutEffects @ react-dom-client.development.js:16371
commitLayoutEffectOnFiber @ react-dom-client.development.js:15100
recursivelyTraverseLayoutEffects @ react-dom-client.development.js:16371
commitLayoutEffectOnFiber @ react-dom-client.development.js:15100
recursivelyTraverseLayoutEffects @ react-dom-client.development.js:16371
commitLayoutEffectOnFiber @ react-dom-client.development.js:15205
recursivelyTraverseLayoutEffects @ react-dom-client.development.js:16371
commitLayoutEffectOnFiber @ react-dom-client.development.js:15100
recursivelyTraverseLayoutEffects @ react-dom-client.development.js:16371
commitLayoutEffectOnFiber @ react-dom-client.development.js:14984
recursivelyTraverseLayoutEffects @ react-dom-client.development.js:16371
commitLayoutEffectOnFiber @ react-dom-client.development.js:14984
recursivelyTraverseLayoutEffects @ react-dom-client.development.js:16371
commitLayoutEffectOnFiber @ react-dom-client.development.js:15100
recursivelyTraverseLayoutEffects @ react-dom-client.development.js:16371
commitLayoutEffectOnFiber @ react-dom-client.development.js:15100
recursivelyTraverseLayoutEffects @ react-dom-client.development.js:16371
commitLayoutEffectOnFiber @ react-dom-client.development.js:15205
recursivelyTraverseLayoutEffects @ react-dom-client.development.js:16371
commitLayoutEffectOnFiber @ react-dom-client.development.js:15100
recursivelyTraverseLayoutEffects @ react-dom-client.development.js:16371
commitLayoutEffectOnFiber @ react-dom-client.development.js:14984
recursivelyTraverseLayoutEffects @ react-dom-client.development.js:16371
commitLayoutEffectOnFiber @ react-dom-client.development.js:14984
recursivelyTraverseLayoutEffects @ react-dom-client.development.js:16371
commitLayoutEffectOnFiber @ react-dom-client.development.js:15100
recursivelyTraverseLayoutEffects @ react-dom-client.development.js:16371
commitLayoutEffectOnFiber @ react-dom-client.development.js:15205
recursivelyTraverseLayoutEffects @ react-dom-client.development.js:16371
commitLayoutEffectOnFiber @ react-dom-client.development.js:15100
recursivelyTraverseLayoutEffects @ react-dom-client.development.js:16371
commitLayoutEffectOnFiber @ react-dom-client.development.js:14984
recursivelyTraverseLayoutEffects @ react-dom-client.development.js:16371
commitLayoutEffectOnFiber @ react-dom-client.development.js:14984
recursivelyTraverseLayoutEffects @ react-dom-client.development.js:16371
commitLayoutEffectOnFiber @ react-dom-client.development.js:15100
recursivelyTraverseLayoutEffects @ react-dom-client.development.js:16371
commitLayoutEffectOnFiber @ react-dom-client.development.js:15192
recursivelyTraverseLayoutEffects @ react-dom-client.development.js:16371
commitLayoutEffectOnFiber @ react-dom-client.development.js:15152
recursivelyTraverseLayoutEffects @ react-dom-client.development.js:16371
commitLayoutEffectOnFiber @ react-dom-client.development.js:14984
recursivelyTraverseLayoutEffects @ react-dom-client.development.js:16371
commitLayoutEffectOnFiber @ react-dom-client.development.js:15205
recursivelyTraverseLayoutEffects @ react-dom-client.development.js:16371
commitLayoutEffectOnFiber @ react-dom-client.development.js:15205
recursivelyTraverseLayoutEffects @ react-dom-client.development.js:16371
commitLayoutEffectOnFiber @ react-dom-client.development.js:14984
recursivelyTraverseLayoutEffects @ react-dom-client.development.js:16371
commitLayoutEffectOnFiber @ react-dom-client.development.js:14989
recursivelyTraverseLayoutEffects @ react-dom-client.development.js:16371
commitLayoutEffectOnFiber @ react-dom-client.development.js:14984
recursivelyTraverseLayoutEffects @ react-dom-client.development.js:16371
commitLayoutEffectOnFiber @ react-dom-client.development.js:14984
recursivelyTraverseLayoutEffects @ react-dom-client.development.js:16371
commitLayoutEffectOnFiber @ react-dom-client.development.js:14984
recursivelyTraverseLayoutEffects @ react-dom-client.development.js:16371
commitLayoutEffectOnFiber @ react-dom-client.development.js:14984
recursivelyTraverseLayoutEffects @ react-dom-client.development.js:16371
commitLayoutEffectOnFiber @ react-dom-client.development.js:14989
recursivelyTraverseLayoutEffects @ react-dom-client.development.js:16371
commitLayoutEffectOnFiber @ react-dom-client.development.js:14984
recursivelyTraverseLayoutEffects @ react-dom-client.development.js:16371
commitLayoutEffectOnFiber @ react-dom-client.development.js:14984
recursivelyTraverseLayoutEffects @ react-dom-client.development.js:16371
commitLayoutEffectOnFiber @ react-dom-client.development.js:15205
recursivelyTraverseLayoutEffects @ react-dom-client.development.js:16371
commitLayoutEffectOnFiber @ react-dom-client.development.js:15205
recursivelyTraverseLayoutEffects @ react-dom-client.development.js:16371
commitLayoutEffectOnFiber @ react-dom-client.development.js:14984
recursivelyTraverseLayoutEffects @ react-dom-client.development.js:16371
commitLayoutEffectOnFiber @ react-dom-client.development.js:14984
recursivelyTraverseLayoutEffects @ react-dom-client.development.js:16371
commitLayoutEffectOnFiber @ react-dom-client.development.js:15205
recursivelyTraverseLayoutEffects @ react-dom-client.development.js:16371
commitLayoutEffectOnFiber @ react-dom-client.development.js:15205
recursivelyTraverseLayoutEffects @ react-dom-client.development.js:16371
commitLayoutEffectOnFiber @ react-dom-client.development.js:15205
recursivelyTraverseLayoutEffects @ react-dom-client.development.js:16371
commitLayoutEffectOnFiber @ react-dom-client.development.js:14984
recursivelyTraverseLayoutEffects @ react-dom-client.development.js:16371
commitLayoutEffectOnFiber @ react-dom-client.development.js:14989
recursivelyTraverseLayoutEffects @ react-dom-client.development.js:16371
commitLayoutEffectOnFiber @ react-dom-client.development.js:14984
recursivelyTraverseLayoutEffects @ react-dom-client.development.js:16371
commitLayoutEffectOnFiber @ react-dom-client.development.js:14984
recursivelyTraverseLayoutEffects @ react-dom-client.development.js:16371
commitLayoutEffectOnFiber @ react-dom-client.development.js:14984
recursivelyTraverseLayoutEffects @ react-dom-client.development.js:16371
commitLayoutEffectOnFiber @ react-dom-client.development.js:14984
recursivelyTraverseLayoutEffects @ react-dom-client.development.js:16371
commitLayoutEffectOnFiber @ react-dom-client.development.js:14989
recursivelyTraverseLayoutEffects @ react-dom-client.development.js:16371
commitLayoutEffectOnFiber @ react-dom-client.development.js:14984
recursivelyTraverseLayoutEffects @ react-dom-client.development.js:16371
commitLayoutEffectOnFiber @ react-dom-client.development.js:14984
recursivelyTraverseLayoutEffects @ react-dom-client.development.js:16371
commitLayoutEffectOnFiber @ react-dom-client.development.js:15205
recursivelyTraverseLayoutEffects @ react-dom-client.development.js:16371
commitLayoutEffectOnFiber @ react-dom-client.development.js:15205
recursivelyTraverseLayoutEffects @ react-dom-client.development.js:16371
commitLayoutEffectOnFiber @ react-dom-client.development.js:14984
recursivelyTraverseLayoutEffects @ react-dom-client.development.js:16371
commitLayoutEffectOnFiber @ react-dom-client.development.js:14984
recursivelyTraverseLayoutEffects @ react-dom-client.development.js:16371
commitLayoutEffectOnFiber @ react-dom-client.development.js:15205
recursivelyTraverseLayoutEffects @ react-dom-client.development.js:16371
commitLayoutEffectOnFiber @ react-dom-client.development.js:15205
recursivelyTraverseLayoutEffects @ react-dom-client.development.js:16371
commitLayoutEffectOnFiber @ react-dom-client.development.js:15205
recursivelyTraverseLayoutEffects @ react-dom-client.development.js:16371
commitLayoutEffectOnFiber @ react-dom-client.development.js:14984
recursivelyTraverseLayoutEffects @ react-dom-client.development.js:16371
commitLayoutEffectOnFiber @ react-dom-client.development.js:14989
recursivelyTraverseLayoutEffects @ react-dom-client.development.js:16371
commitLayoutEffectOnFiber @ react-dom-client.development.js:14984
recursivelyTraverseLayoutEffects @ react-dom-client.development.js:16371
commitLayoutEffectOnFiber @ react-dom-client.development.js:14984
recursivelyTraverseLayoutEffects @ react-dom-client.development.js:16371
commitLayoutEffectOnFiber @ react-dom-client.development.js:14984
recursivelyTraverseLayoutEffects @ react-dom-client.development.js:16371
commitLayoutEffectOnFiber @ react-dom-client.development.js:14989
recursivelyTraverseLayoutEffects @ react-dom-client.development.js:16371
commitLayoutEffectOnFiber @ react-dom-client.development.js:14984
recursivelyTraverseLayoutEffects @ react-dom-client.development.js:16371
commitLayoutEffectOnFiber @ react-dom-client.development.js:14989
recursivelyTraverseLayoutEffects @ react-dom-client.development.js:16371
commitLayoutEffectOnFiber @ react-dom-client.development.js:14984
recursivelyTraverseLayoutEffects @ react-dom-client.development.js:16371
commitLayoutEffectOnFiber @ react-dom-client.development.js:14984
recursivelyTraverseLayoutEffects @ react-dom-client.development.js:16371
commitLayoutEffectOnFiber @ react-dom-client.development.js:15205
recursivelyTraverseLayoutEffects @ react-dom-client.development.js:16371
commitLayoutEffectOnFiber @ react-dom-client.development.js:15205
recursivelyTraverseLayoutEffects @ react-dom-client.development.js:16371
commitLayoutEffectOnFiber @ react-dom-client.development.js:14984
recursivelyTraverseLayoutEffects @ react-dom-client.development.js:16371
commitLayoutEffectOnFiber @ react-dom-client.development.js:14984
recursivelyTraverseLayoutEffects @ react-dom-client.development.js:16371
commitLayoutEffectOnFiber @ react-dom-client.development.js:15100
recursivelyTraverseLayoutEffects @ react-dom-client.development.js:16371
commitLayoutEffectOnFiber @ react-dom-client.development.js:15100
recursivelyTraverseLayoutEffects @ react-dom-client.development.js:16371
commitLayoutEffectOnFiber @ react-dom-client.development.js:15100
recursivelyTraverseLayoutEffects @ react-dom-client.development.js:16371
commitLayoutEffectOnFiber @ react-dom-client.development.js:14989
recursivelyTraverseLayoutEffects @ react-dom-client.development.js:16371
commitLayoutEffectOnFiber @ react-dom-client.development.js:14984
recursivelyTraverseLayoutEffects @ react-dom-client.development.js:16371
commitLayoutEffectOnFiber @ react-dom-client.development.js:14984
recursivelyTraverseLayoutEffects @ react-dom-client.development.js:16371
commitLayoutEffectOnFiber @ react-dom-client.development.js:14984
recursivelyTraverseLayoutEffects @ react-dom-client.development.js:16371
commitLayoutEffectOnFiber @ react-dom-client.development.js:15205
recursivelyTraverseLayoutEffects @ react-dom-client.development.js:16371
commitLayoutEffectOnFiber @ react-dom-client.development.js:14984
recursivelyTraverseLayoutEffects @ react-dom-client.development.js:16371
commitLayoutEffectOnFiber @ react-dom-client.development.js:15205
recursivelyTraverseLayoutEffects @ react-dom-client.development.js:16371
commitLayoutEffectOnFiber @ react-dom-client.development.js:15205
recursivelyTraverseLayoutEffects @ react-dom-client.development.js:16371
commitLayoutEffectOnFiber @ react-dom-client.development.js:14984
recursivelyTraverseLayoutEffects @ react-dom-client.development.js:16371
commitLayoutEffectOnFiber @ react-dom-client.development.js:14989
recursivelyTraverseLayoutEffects @ react-dom-client.development.js:16371
commitLayoutEffectOnFiber @ react-dom-client.development.js:14984
recursivelyTraverseLayoutEffects @ react-dom-client.development.js:16371
commitLayoutEffectOnFiber @ react-dom-client.development.js:14989
recursivelyTraverseLayoutEffects @ react-dom-client.development.js:16371
commitLayoutEffectOnFiber @ react-dom-client.development.js:14984
recursivelyTraverseLayoutEffects @ react-dom-client.development.js:16371
commitLayoutEffectOnFiber @ react-dom-client.development.js:14984
recursivelyTraverseLayoutEffects @ react-dom-client.development.js:16371
commitLayoutEffectOnFiber @ react-dom-client.development.js:14989
recursivelyTraverseLayoutEffects @ react-dom-client.development.js:16371
commitLayoutEffectOnFiber @ react-dom-client.development.js:14984
recursivelyTraverseLayoutEffects @ react-dom-client.development.js:16371
commitLayoutEffectOnFiber @ react-dom-client.development.js:14989
recursivelyTraverseLayoutEffects @ react-dom-client.development.js:16371
commitLayoutEffectOnFiber @ react-dom-client.development.js:14984
recursivelyTraverseLayoutEffects @ react-dom-client.development.js:16371
commitLayoutEffectOnFiber @ react-dom-client.development.js:14984
recursivelyTraverseLayoutEffects @ react-dom-client.development.js:16371
commitLayoutEffectOnFiber @ react-dom-client.development.js:15205
recursivelyTraverseLayoutEffects @ react-dom-client.development.js:16371
commitLayoutEffectOnFiber @ react-dom-client.development.js:15205
recursivelyTraverseLayoutEffects @ react-dom-client.development.js:16371
commitLayoutEffectOnFiber @ react-dom-client.development.js:14984
recursivelyTraverseLayoutEffects @ react-dom-client.development.js:16371
commitLayoutEffectOnFiber @ react-dom-client.development.js:14984
<img>
exports.jsxDEV @ react-jsx-dev-runtime.development.js:342
eval @ C:\Users\kanei\claudecode\02.Homepage_Dev\02.epac_homepagever1.1\src\components\member\DesignRevisionsSection.tsx:466
DesignRevisionsSection @ C:\Users\kanei\claudecode\02.Homepage_Dev\02.epac_homepagever1.1\src\components\member\DesignRevisionsSection.tsx:356
react_stack_bottom_frame @ react-dom-client.development.js:28039
renderWithHooksAgain @ react-dom-client.development.js:8085
renderWithHooks @ react-dom-client.development.js:7997
updateFunctionComponent @ react-dom-client.development.js:10502
beginWork @ react-dom-client.development.js:12137
runWithFiberInDEV @ react-dom-client.development.js:987
performUnitOfWork @ react-dom-client.development.js:18998
workLoopSync @ react-dom-client.development.js:18826
renderRootSync @ react-dom-client.development.js:18807
performWorkOnRoot @ react-dom-client.development.js:17836
performSyncWorkOnRoot @ react-dom-client.development.js:20400
flushSyncWorkAcrossRoots_impl @ react-dom-client.development.js:20242
processRootScheduleInMicrotask @ react-dom-client.development.js:20281
eval @ react-dom-client.development.js:20419
