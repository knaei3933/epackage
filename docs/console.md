settings:1  GET http://localhost:3009/admin/settings 500 (Internal Server Error)
main.js:1497 Download the React DevTools for a better development experience: https://react.dev/link/react-devtools
index.js:616 Uncaught ModuleBuildError: Module build failed (from ./node_modules/next/dist/build/webpack/loaders/next-swc-loader.js):
Error:   x Expected '</', got '}'
      ,-[C:\Users\kanei\claudecode\02.Homepage_Dev\02.epac_homepagever1.1\src\app\admin\settings\page.tsx:1973:1]
 1970 |                   </motion.div>
 1971 |                 )}
 1972 |               </div>
 1973 |             )}
      :              ^
 1974 |           </div>
 1975 |         )}
 1975 |       </div>
      `----


Caused by:
    Syntax Error
    at processResult (file://C:\Users\kanei\claudecode\02.Homepage_Dev\02.epac_homepagever1.1\node_modules\next\dist\compiled\webpack\bundle5.js:29:407096)
    at <unknown> (file://C:\Users\kanei\claudecode\02.Homepage_Dev\02.epac_homepagever1.1\node_modules\next\dist\compiled\webpack\bundle5.js:29:408891)
    at <unknown> (file://C:\Users\kanei\claudecode\02.Homepage_Dev\02.epac_homepagever1.1\node_modules\next\dist\compiled\loader-runner\LoaderRunner.js:1:8645)
    at <unknown> (file://C:\Users\kanei\claudecode\02.Homepage_Dev\02.epac_homepagever1.1\node_modules\next\dist\compiled\loader-runner\LoaderRunner.js:1:5019)
    at r.callback (file://C:\Users\kanei\claudecode\02.Homepage_Dev\02.epac_homepagever1.1\node_modules\next\dist\compiled\loader-runner\LoaderRunner.js:1:4039)
getServerError @ node-stack-frames.js:41
eval @ index.js:616
setTimeout
hydrate @ index.js:594
await in hydrate
pageBootstrap @ page-bootstrap.js:28
eval @ next-dev.js:23
Promise.then
eval @ next-dev.js:22
(pages-dir-browser)/./node_modules/next/dist/client/next-dev.js @ main.js:270
options.factory @ webpack.js:1
__webpack_require__ @ webpack.js:1
__webpack_exec__ @ main.js:1612
(anonymous) @ main.js:1613
webpackJsonpCallback @ webpack.js:1
(anonymous) @ main.js:9
forward-logs-shared.js:28 [HMR] connected
pages-dev-overlay-setup.js:71 ./src/app/admin/settings/page.tsx
Error:   x Expected '</', got '}'
      ,-[C:\Users\kanei\claudecode\02.Homepage_Dev\02.epac_homepagever1.1\src\app\admin\settings\page.tsx:1973:1]
 1970 |                   </motion.div>
 1971 |                 )}
 1972 |               </div>
 1973 |             )}
      :              ^
 1974 |           </div>
 1975 |         )}
 1975 |       </div>
      `----

Caused by:
    Syntax Error
nextJsHandleConsoleError @ pages-dev-overlay-setup.js:71
handleErrors @ hot-reloader-pages.js:160
processMessage @ hot-reloader-pages.js:220
eval @ hot-reloader-pages.js:69
handleMessage @ websocket.js:68
