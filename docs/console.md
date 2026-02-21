main-app.js?v=1771655520395:1094 Download the React DevTools for a better development experience: https://react.dev/link/react-devtools
dashboard.ts:256  Server  [requireAuth] START: Authentication check initiated
dashboard.ts:264  Server  [requireAuth] Importing getRBACContext...
dashboard.ts:266  Server  [requireAuth] Calling getRBACContext()...
rbac-helpers.ts:319  Server  [RBAC] getRBACContext() called
rbac-helpers.ts:320  Server  [RBAC] Environment: Object
rbac-helpers.ts:321  Server  [RBAC] Call stack:     at getRBACContext (webpack-internal:///(rsc)/./src/lib/rbac/rbac-helpers.ts:283:23)
    at requireAuth (webpack-internal:///(rsc)/./src/lib/dashboard.ts:158:29)
    at async OrderDetailContent (webpack-internal:///(rsc)/./src/app/member/orders/[id]/page.tsx:49:5)
rbac-helpers.ts:374  Server  [RBAC] Checking middleware headers...
rbac-helpers.ts:381  Server  [RBAC] All available headers: Array(32)
rbac-helpers.ts:387  Server  [RBAC] Middleware headers found: Object
rbac-helpers.ts:397  Server  [RBAC] Found auth in middleware headers: Object
rbac-helpers.ts:256  Server  [RBAC] Using default permissions for role: admin
dashboard.ts:268  Server  [requireAuth] getRBACContext returned: CONTEXT Object
dashboard.ts:279  Server  [requireAuth] Got user from RBAC context: 54fd7b31-b805-43cf-b92e-898ddd066875 Role: admin Status: ACTIVE
dashboard.ts:433  Server  [getCurrentUserId] Server-side: Found user ID from headers: 54fd7b31-b805-43cf-b92e-898ddd066875
dashboard.ts:433  Server  [getCurrentUserId] Server-side: Found user ID from headers: 54fd7b31-b805-43cf-b92e-898ddd066875
forward-logs-shared.js:28 [HMR] connected
C:\Users\kanei\claudecode\02.Homepage_Dev\02.epac_homepagever1.1\src\contexts\AuthContext.tsx:197 [AuthContext] Initializing auth context...
C:\Users\kanei\claudecode\02.Homepage_Dev\02.epac_homepagever1.1\src\contexts\AuthContext.tsx:123 [AuthContext] Fetching session from /api/auth/current-user... Object
C:\Users\kanei\claudecode\02.Homepage_Dev\02.epac_homepagever1.1\src\contexts\AuthContext.tsx:148 [AuthContext] Session updated successfully Object
