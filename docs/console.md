forward-logs-shared.ts:95 Download the React DevTools for a better development experience: https://react.dev/link/react-devtools
forward-logs-shared.ts:95 [HMR] connected
intercept-console-error.ts:42 ./02.Homepage_Dev/02.epac_homepagever1.1/src/app/api/member/inquiries/route.ts:71:30
Ecmascript file had an error
  69 |     }
  70 |
> 71 |     const { data: inquiries, error } = await query;
     |                              ^^^^^
  72 |
  73 |     if (error) {
  74 |       console.error('Inquiries fetch error:', error);

the name `error` is defined multiple times
error @ intercept-console-error.ts:42
handleErrors @ hot-reloader-app.tsx:234
processMessage @ hot-reloader-app.tsx:329
handleMessage @ web-socket.ts:107
intercept-console-error.ts:42 ./02.Homepage_Dev/02.epac_homepagever1.1/src/app/api/member/inquiries/route.ts:55:11
Ecmascript file had an error
  53 |     const type = searchParams.get('type');
  54 |
> 55 |     const supabase = createServiceClient();
     |           ^^^^^^^^
  56 |
  57 |     let query = supabase
  58 |       .from('inquiries')

the name `supabase` is defined multiple times
error @ intercept-console-error.ts:42
handleErrors @ hot-reloader-app.tsx:234
processMessage @ hot-reloader-app.tsx:329
handleMessage @ web-socket.ts:107
intercept-console-error.ts:42 ./02.Homepage_Dev/02.epac_homepagever1.1/src/app/api/member/inquiries/route.ts:71:30
Ecmascript file had an error
  69 |     }
  70 |
> 71 |     const { data: inquiries, error } = await query;
     |                              ^^^^^
  72 |
  73 |     if (error) {
  74 |       console.error('Inquiries fetch error:', error);

the name `error` is defined multiple times
error @ intercept-console-error.ts:42
handleErrors @ hot-reloader-app.tsx:234
processMessage @ hot-reloader-app.tsx:329
handleMessage @ web-socket.ts:107
intercept-console-error.ts:42 ./02.Homepage_Dev/02.epac_homepagever1.1/src/app/api/member/inquiries/route.ts:55:11
Ecmascript file had an error
  53 |     const type = searchParams.get('type');
  54 |
> 55 |     const supabase = createServiceClient();
     |           ^^^^^^^^
  56 |
  57 |     let query = supabase
  58 |       .from('inquiries')

the name `supabase` is defined multiple times
error @ intercept-console-error.ts:42
handleErrors @ hot-reloader-app.tsx:234
processMessage @ hot-reloader-app.tsx:329
handleMessage @ web-socket.ts:107
AuthContext.tsx:164 [AuthContext] Initializing auth context...
AuthContext.tsx:117 [AuthContext] Fetching session from /api/auth/current-user...
AuthContext.tsx:119  GET http://localhost:3000/api/auth/current-user 500 (Internal Server Error)
AuthProvider.useCallback[fetchSessionAndUpdateState] @ AuthContext.tsx:119
AuthProvider.useEffect.getInitialSession @ AuthContext.tsx:173
AuthProvider.useEffect @ AuthContext.tsx:189
react_stack_bottom_frame @ react-dom-client.development.js:28123
runWithFiberInDEV @ react-dom-client.development.js:986
commitHookEffectListMount @ react-dom-client.development.js:13692
commitHookPassiveMountEffects @ react-dom-client.development.js:13779
commitPassiveMountOnFiber @ react-dom-client.development.js:16733
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16678
commitPassiveMountOnFiber @ react-dom-client.development.js:17010
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16678
commitPassiveMountOnFiber @ react-dom-client.development.js:16725
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16678
commitPassiveMountOnFiber @ react-dom-client.development.js:17010
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16678
commitPassiveMountOnFiber @ react-dom-client.development.js:17010
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16678
commitPassiveMountOnFiber @ react-dom-client.development.js:17010
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16678
commitPassiveMountOnFiber @ react-dom-client.development.js:16725
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16678
commitPassiveMountOnFiber @ react-dom-client.development.js:16725
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16678
commitPassiveMountOnFiber @ react-dom-client.development.js:16753
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16678
commitPassiveMountOnFiber @ react-dom-client.development.js:16725
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16678
commitPassiveMountOnFiber @ react-dom-client.development.js:16753
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16678
commitPassiveMountOnFiber @ react-dom-client.development.js:16725
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16678
commitPassiveMountOnFiber @ react-dom-client.development.js:16725
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16678
commitPassiveMountOnFiber @ react-dom-client.development.js:16753
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16678
commitPassiveMountOnFiber @ react-dom-client.development.js:16725
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16678
commitPassiveMountOnFiber @ react-dom-client.development.js:17010
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16678
commitPassiveMountOnFiber @ react-dom-client.development.js:17010
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16678
commitPassiveMountOnFiber @ react-dom-client.development.js:17010
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16678
commitPassiveMountOnFiber @ react-dom-client.development.js:17010
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16678
commitPassiveMountOnFiber @ react-dom-client.development.js:17010
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16678
commitPassiveMountOnFiber @ react-dom-client.development.js:17010
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16678
commitPassiveMountOnFiber @ react-dom-client.development.js:17010
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16678
commitPassiveMountOnFiber @ react-dom-client.development.js:16725
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16678
commitPassiveMountOnFiber @ react-dom-client.development.js:16753
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16678
commitPassiveMountOnFiber @ react-dom-client.development.js:16725
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16678
commitPassiveMountOnFiber @ react-dom-client.development.js:16725
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16678
commitPassiveMountOnFiber @ react-dom-client.development.js:16725
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16678
commitPassiveMountOnFiber @ react-dom-client.development.js:17010
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16678
commitPassiveMountOnFiber @ react-dom-client.development.js:16725
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16678
commitPassiveMountOnFiber @ react-dom-client.development.js:16725
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16678
commitPassiveMountOnFiber @ react-dom-client.development.js:17010
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16678
commitPassiveMountOnFiber @ react-dom-client.development.js:17010
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16678
commitPassiveMountOnFiber @ react-dom-client.development.js:16768
flushPassiveEffects @ react-dom-client.development.js:19859
flushPendingEffects @ react-dom-client.development.js:19785
performSyncWorkOnRoot @ react-dom-client.development.js:20396
flushSyncWorkAcrossRoots_impl @ react-dom-client.development.js:20241
flushSpawnedWork @ react-dom-client.development.js:19752
commitRoot @ react-dom-client.development.js:19335
commitRootWhenReady @ react-dom-client.development.js:18178
performWorkOnRoot @ react-dom-client.development.js:18054
performWorkOnRootViaSchedulerTask @ react-dom-client.development.js:20384
performWorkUntilDeadline @ scheduler.development.js:45
"use client"
RootLayout @ layout.tsx:151
initializeElement @ react-server-dom-turbopack-client.browser.development.js:1941
(anonymous) @ react-server-dom-turbopack-client.browser.development.js:4623
initializeModelChunk @ react-server-dom-turbopack-client.browser.development.js:1828
getOutlinedModel @ react-server-dom-turbopack-client.browser.development.js:2337
parseModelString @ react-server-dom-turbopack-client.browser.development.js:2729
(anonymous) @ react-server-dom-turbopack-client.browser.development.js:4554
initializeModelChunk @ react-server-dom-turbopack-client.browser.development.js:1828
resolveModelChunk @ react-server-dom-turbopack-client.browser.development.js:1672
processFullStringRow @ react-server-dom-turbopack-client.browser.development.js:4442
processFullBinaryRow @ react-server-dom-turbopack-client.browser.development.js:4300
processBinaryChunk @ react-server-dom-turbopack-client.browser.development.js:4523
progress @ react-server-dom-turbopack-client.browser.development.js:4799
<RootLayout>
initializeFakeTask @ react-server-dom-turbopack-client.browser.development.js:3390
initializeDebugInfo @ react-server-dom-turbopack-client.browser.development.js:3415
initializeDebugChunk @ react-server-dom-turbopack-client.browser.development.js:1772
processFullStringRow @ react-server-dom-turbopack-client.browser.development.js:4389
processFullBinaryRow @ react-server-dom-turbopack-client.browser.development.js:4300
processBinaryChunk @ react-server-dom-turbopack-client.browser.development.js:4523
progress @ react-server-dom-turbopack-client.browser.development.js:4799
"use server"
ResponseInstance @ react-server-dom-turbopack-client.browser.development.js:2784
createResponseFromOptions @ react-server-dom-turbopack-client.browser.development.js:4660
exports.createFromReadableStream @ react-server-dom-turbopack-client.browser.development.js:5064
module evaluation @ app-index.tsx:211
(anonymous) @ dev-base.ts:244
runModuleExecutionHooks @ dev-base.ts:278
instantiateModule @ dev-base.ts:238
getOrInstantiateModuleFromParent @ dev-base.ts:162
commonJsRequire @ runtime-utils.ts:389
(anonymous) @ app-next-turbopack.ts:11
(anonymous) @ app-bootstrap.ts:79
loadScriptsInSequence @ app-bootstrap.ts:23
appBootstrap @ app-bootstrap.ts:61
module evaluation @ app-next-turbopack.ts:10
(anonymous) @ dev-base.ts:244
runModuleExecutionHooks @ dev-base.ts:278
instantiateModule @ dev-base.ts:238
getOrInstantiateRuntimeModule @ dev-base.ts:128
registerChunk @ runtime-backend-dom.ts:57
await in registerChunk
registerChunk @ dev-base.ts:1149
(anonymous) @ dev-backend-dom.ts:126
(anonymous) @ dev-backend-dom.ts:126
AuthContext.tsx:141 [AuthContext] Session fetch failed: 500
warn @ forward-logs-shared.ts:95
AuthProvider.useCallback[fetchSessionAndUpdateState] @ AuthContext.tsx:141
await in AuthProvider.useCallback[fetchSessionAndUpdateState]
AuthProvider.useEffect.getInitialSession @ AuthContext.tsx:173
AuthProvider.useEffect @ AuthContext.tsx:189
react_stack_bottom_frame @ react-dom-client.development.js:28123
runWithFiberInDEV @ react-dom-client.development.js:986
commitHookEffectListMount @ react-dom-client.development.js:13692
commitHookPassiveMountEffects @ react-dom-client.development.js:13779
commitPassiveMountOnFiber @ react-dom-client.development.js:16733
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16678
commitPassiveMountOnFiber @ react-dom-client.development.js:17010
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16678
commitPassiveMountOnFiber @ react-dom-client.development.js:16725
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16678
commitPassiveMountOnFiber @ react-dom-client.development.js:17010
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16678
commitPassiveMountOnFiber @ react-dom-client.development.js:17010
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16678
commitPassiveMountOnFiber @ react-dom-client.development.js:17010
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16678
commitPassiveMountOnFiber @ react-dom-client.development.js:16725
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16678
commitPassiveMountOnFiber @ react-dom-client.development.js:16725
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16678
commitPassiveMountOnFiber @ react-dom-client.development.js:16753
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16678
commitPassiveMountOnFiber @ react-dom-client.development.js:16725
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16678
commitPassiveMountOnFiber @ react-dom-client.development.js:16753
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16678
commitPassiveMountOnFiber @ react-dom-client.development.js:16725
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16678
commitPassiveMountOnFiber @ react-dom-client.development.js:16725
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16678
commitPassiveMountOnFiber @ react-dom-client.development.js:16753
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16678
commitPassiveMountOnFiber @ react-dom-client.development.js:16725
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16678
commitPassiveMountOnFiber @ react-dom-client.development.js:17010
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16678
commitPassiveMountOnFiber @ react-dom-client.development.js:17010
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16678
commitPassiveMountOnFiber @ react-dom-client.development.js:17010
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16678
commitPassiveMountOnFiber @ react-dom-client.development.js:17010
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16678
commitPassiveMountOnFiber @ react-dom-client.development.js:17010
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16678
commitPassiveMountOnFiber @ react-dom-client.development.js:17010
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16678
commitPassiveMountOnFiber @ react-dom-client.development.js:17010
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16678
commitPassiveMountOnFiber @ react-dom-client.development.js:16725
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16678
commitPassiveMountOnFiber @ react-dom-client.development.js:16753
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16678
commitPassiveMountOnFiber @ react-dom-client.development.js:16725
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16678
commitPassiveMountOnFiber @ react-dom-client.development.js:16725
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16678
commitPassiveMountOnFiber @ react-dom-client.development.js:16725
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16678
commitPassiveMountOnFiber @ react-dom-client.development.js:17010
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16678
commitPassiveMountOnFiber @ react-dom-client.development.js:16725
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16678
commitPassiveMountOnFiber @ react-dom-client.development.js:16725
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16678
commitPassiveMountOnFiber @ react-dom-client.development.js:17010
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16678
commitPassiveMountOnFiber @ react-dom-client.development.js:17010
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16678
commitPassiveMountOnFiber @ react-dom-client.development.js:16768
flushPassiveEffects @ react-dom-client.development.js:19859
flushPendingEffects @ react-dom-client.development.js:19785
performSyncWorkOnRoot @ react-dom-client.development.js:20396
flushSyncWorkAcrossRoots_impl @ react-dom-client.development.js:20241
flushSpawnedWork @ react-dom-client.development.js:19752
commitRoot @ react-dom-client.development.js:19335
commitRootWhenReady @ react-dom-client.development.js:18178
performWorkOnRoot @ react-dom-client.development.js:18054
performWorkOnRootViaSchedulerTask @ react-dom-client.development.js:20384
performWorkUntilDeadline @ scheduler.development.js:45
"use client"
RootLayout @ layout.tsx:151
initializeElement @ react-server-dom-turbopack-client.browser.development.js:1941
(anonymous) @ react-server-dom-turbopack-client.browser.development.js:4623
initializeModelChunk @ react-server-dom-turbopack-client.browser.development.js:1828
getOutlinedModel @ react-server-dom-turbopack-client.browser.development.js:2337
parseModelString @ react-server-dom-turbopack-client.browser.development.js:2729
(anonymous) @ react-server-dom-turbopack-client.browser.development.js:4554
initializeModelChunk @ react-server-dom-turbopack-client.browser.development.js:1828
resolveModelChunk @ react-server-dom-turbopack-client.browser.development.js:1672
processFullStringRow @ react-server-dom-turbopack-client.browser.development.js:4442
processFullBinaryRow @ react-server-dom-turbopack-client.browser.development.js:4300
processBinaryChunk @ react-server-dom-turbopack-client.browser.development.js:4523
progress @ react-server-dom-turbopack-client.browser.development.js:4799
<RootLayout>
initializeFakeTask @ react-server-dom-turbopack-client.browser.development.js:3390
initializeDebugInfo @ react-server-dom-turbopack-client.browser.development.js:3415
initializeDebugChunk @ react-server-dom-turbopack-client.browser.development.js:1772
processFullStringRow @ react-server-dom-turbopack-client.browser.development.js:4389
processFullBinaryRow @ react-server-dom-turbopack-client.browser.development.js:4300
processBinaryChunk @ react-server-dom-turbopack-client.browser.development.js:4523
progress @ react-server-dom-turbopack-client.browser.development.js:4799
"use server"
ResponseInstance @ react-server-dom-turbopack-client.browser.development.js:2784
createResponseFromOptions @ react-server-dom-turbopack-client.browser.development.js:4660
exports.createFromReadableStream @ react-server-dom-turbopack-client.browser.development.js:5064
module evaluation @ app-index.tsx:211
(anonymous) @ dev-base.ts:244
runModuleExecutionHooks @ dev-base.ts:278
instantiateModule @ dev-base.ts:238
getOrInstantiateModuleFromParent @ dev-base.ts:162
commonJsRequire @ runtime-utils.ts:389
(anonymous) @ app-next-turbopack.ts:11
(anonymous) @ app-bootstrap.ts:79
loadScriptsInSequence @ app-bootstrap.ts:23
appBootstrap @ app-bootstrap.ts:61
module evaluation @ app-next-turbopack.ts:10
(anonymous) @ dev-base.ts:244
runModuleExecutionHooks @ dev-base.ts:278
instantiateModule @ dev-base.ts:238
getOrInstantiateRuntimeModule @ dev-base.ts:128
registerChunk @ runtime-backend-dom.ts:57
await in registerChunk
registerChunk @ dev-base.ts:1149
(anonymous) @ dev-backend-dom.ts:126
(anonymous) @ dev-backend-dom.ts:126
intercept-console-error.ts:42 ./02.Homepage_Dev/02.epac_homepagever1.1/src/app/api/member/inquiries/route.ts:71:30
Ecmascript file had an error
  69 |     }
  70 |
> 71 |     const { data: inquiries, error } = await query;
     |                              ^^^^^
  72 |
  73 |     if (error) {
  74 |       console.error('Inquiries fetch error:', error);

the name `error` is defined multiple times
error @ intercept-console-error.ts:42
handleErrors @ hot-reloader-app.tsx:234
processMessage @ hot-reloader-app.tsx:329
handleMessage @ web-socket.ts:107
intercept-console-error.ts:42 ./02.Homepage_Dev/02.epac_homepagever1.1/src/app/api/member/inquiries/route.ts:55:11
Ecmascript file had an error
  53 |     const type = searchParams.get('type');
  54 |
> 55 |     const supabase = createServiceClient();
     |           ^^^^^^^^
  56 |
  57 |     let query = supabase
  58 |       .from('inquiries')

the name `supabase` is defined multiple times
error @ intercept-console-error.ts:42
handleErrors @ hot-reloader-app.tsx:234
processMessage @ hot-reloader-app.tsx:329
handleMessage @ web-socket.ts:107
forward-logs-shared.ts:95 [Fast Refresh] rebuilding
