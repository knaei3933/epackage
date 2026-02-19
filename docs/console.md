  GET http://localhost:3000/member/orders/87615c70-bd89-411f-aaf9-9611e72d13a3 500 (Internal Server Error)
eval @ webpack-internal:///…leware-client.js:66
processMessage @ webpack-internal:///…loader-pages.js:295
eval @ webpack-internal:///…eloader-pages.js:69
handleMessage @ webpack-internal:///…ges/websocket.js:68
main.js:1453 Download the React DevTools for a better development experience: https://react.dev/link/react-devtools
index.js:616 Uncaught ModuleBuildError: Module build failed (from ./node_modules/next/dist/build/webpack/loaders/next-swc-loader.js):
Error:   x Merge conflict marker encountered.
      ,-[C:\Users\kanei\claudecode\02.Homepage_Dev\02.epac_homepagever1.1\src\lib\unified-pricing-engine.ts:1230:1]
 1227 |     // unitPrice * totalQuantity === totalPrice を保証
 1228 |     // 100円単位で切り上げ（反り上げ）例：176930 → 177000、165042 → 165100
 1229 |     // 小数点以下を含む場合: 168400.646... → 168500
 1230 | <<<<<<< HEAD
      : ^^^^^^^
 1231 |     // 100円単位で切り上げ（反り上げ）例：176930 → 177000、165042 → 165100
 1232 |     const roundedTotalPrice = Math.ceil(totalPrice / 100) * 100;
 1232 | =======
      `----
  x Merge conflict marker encountered.
      ,-[C:\Users\kanei\claudecode\02.Homepage_Dev\02.epac_homepagever1.1\src\lib\unified-pricing-engine.ts:1233:1]
 1230 | <<<<<<< HEAD
 1231 |     // 100円単位で切り上げ（反り上げ）例：176930 → 177000、165042 → 165100
 1232 |     const roundedTotalPrice = Math.ceil(totalPrice / 100) * 100;
 1233 | =======
      : ^^^^^^^
 1234 |     // totalPrice を先に丸めてから unitPrice を計算することで、
 1235 |     // unitPrice * totalQuantity === totalPrice を保証
 1235 |     // 100円単位で切り上げ（反り上げ）例：176930 → 177000、165042 → 165100
      `----
  x Merge conflict marker encountered.
      ,-[C:\Users\kanei\claudecode\02.Homepage_Dev\02.epac_homepagever1.1\src\lib\unified-pricing-engine.ts:1240:1]
 1237 |     // 小数点以下を含む場合: 168400.646... → 168500
 1238 |     const roundedTotalPrice = Math.ceil(totalPrice / 100) * 100;
 1239 | 
 1240 | >>>>>>> feature/20260218-fix-pricing-errors
      : ^^^^^^^
 1241 |     // Security: Rounding details only logged in development
 1242 |     if (process.env.NODE_ENV === 'development') {
 1242 |       console.log('[100円丸め] 丸め前 totalPrice:', totalPrice, '(型:', typeof totalPrice, ')');
      `----
  x Merge conflict marker encountered.
      ,-[C:\Users\kanei\claudecode\02.Homepage_Dev\02.epac_homepagever1.1\src\lib\unified-pricing-engine.ts:1477:1]
 1474 |     // unitPrice * totalQuantity === totalPrice を保証
 1475 |     // 100円単位で切り上げ（反り上げ）例：176930 → 177000、165042 → 165100
 1476 |     // 小数点以下を含む場合: 168400.646... → 168500
 1477 | <<<<<<< HEAD
      : ^^^^^^^
 1478 |     // 100円単位で切り上げ（反り上げ）例：176930 → 177000、165042 → 165100
 1479 |     const roundedTotalPrice = Math.ceil(totalPrice / 100) * 100;
 1479 | =======
      `----
  x Merge conflict marker encountered.
      ,-[C:\Users\kanei\claudecode\02.Homepage_Dev\02.epac_homepagever1.1\src\lib\unified-pricing-engine.ts:1480:1]
 1477 | <<<<<<< HEAD
 1478 |     // 100円単位で切り上げ（反り上げ）例：176930 → 177000、165042 → 165100
 1479 |     const roundedTotalPrice = Math.ceil(totalPrice / 100) * 100;
 1480 | =======
      : ^^^^^^^
 1481 |     // totalPrice を先に丸めてから unitPrice を計算することで、
 1482 |     // unitPrice * totalQuantity === totalPrice を保証
 1482 |     // 100円単位で切り上げ（反り上げ）例：176930 → 177000、165042 → 165100
      `----
  x Merge conflict marker encountered.
      ,-[C:\Users\kanei\claudecode\02.Homepage_Dev\02.epac_homepagever1.1\src\lib\unified-pricing-engine.ts:1487:1]
 1484 |     // 小数点以下を含む場合: 168400.646... → 168500
 1485 |     const roundedTotalPrice = Math.ceil(totalPrice / 100) * 100;
 1486 | 
 1487 | >>>>>>> feature/20260218-fix-pricing-errors
      : ^^^^^^^
 1488 |     // Security: Rounding details only logged in development
 1489 |     if (process.env.NODE_ENV === 'development') {
 1489 |       console.log('[100円丸め] 丸め前 totalPrice:', totalPrice, '(型:', typeof totalPrice, ')');
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
__webpack_exec__ @ main.js:1568
(anonymous) @ main.js:1569
webpackJsonpCallback @ webpack.js:1
(anonymous) @ main.js:9
forward-logs-shared.js:28 [HMR] connected
pages-dev-overlay-setup.js:71 ./src/lib/unified-pricing-engine.ts
Error:   x Merge conflict marker encountered.
      ,-[C:\Users\kanei\claudecode\02.Homepage_Dev\02.epac_homepagever1.1\src\lib\unified-pricing-engine.ts:1230:1]
 1227 |     // unitPrice * totalQuantity === totalPrice を保証
 1228 |     // 100円単位で切り上げ（反り上げ）例：176930 → 177000、165042 → 165100
 1229 |     // 小数点以下を含む場合: 168400.646... → 168500
 1230 | <<<<<<< HEAD
      : ^^^^^^^
 1231 |     // 100円単位で切り上げ（反り上げ）例：176930 → 177000、165042 → 165100
 1232 |     const roundedTotalPrice = Math.ceil(totalPrice / 100) * 100;
 1232 | =======
      `----
  x Merge conflict marker encountered.
      ,-[C:\Users\kanei\claudecode\02.Homepage_Dev\02.epac_homepagever1.1\src\lib\unified-pricing-engine.ts:1233:1]
 1230 | <<<<<<< HEAD
 1231 |     // 100円単位で切り上げ（反り上げ）例：176930 → 177000、165042 → 165100
 1232 |     const roundedTotalPrice = Math.ceil(totalPrice / 100) * 100;
 1233 | =======
      : ^^^^^^^
 1234 |     // totalPrice を先に丸めてから unitPrice を計算することで、
 1235 |     // unitPrice * totalQuantity === totalPrice を保証
 1235 |     // 100円単位で切り上げ（反り上げ）例：176930 → 177000、165042 → 165100
      `----
  x Merge conflict marker encountered.
      ,-[C:\Users\kanei\claudecode\02.Homepage_Dev\02.epac_homepagever1.1\src\lib\unified-pricing-engine.ts:1240:1]
 1237 |     // 小数点以下を含む場合: 168400.646... → 168500
 1238 |     const roundedTotalPrice = Math.ceil(totalPrice / 100) * 100;
 1239 | 
 1240 | >>>>>>> feature/20260218-fix-pricing-errors
      : ^^^^^^^
 1241 |     // Security: Rounding details only logged in development
 1242 |     if (process.env.NODE_ENV === 'development') {
 1242 |       console.log('[100円丸め] 丸め前 totalPrice:', totalPrice, '(型:', typeof totalPrice, ')');
      `----
  x Merge conflict marker encountered.
      ,-[C:\Users\kanei\claudecode\02.Homepage_Dev\02.epac_homepagever1.1\src\lib\unified-pricing-engine.ts:1477:1]
 1474 |     // unitPrice * totalQuantity === totalPrice を保証
 1475 |     // 100円単位で切り上げ（反り上げ）例：176930 → 177000、165042 → 165100
 1476 |     // 小数点以下を含む場合: 168400.646... → 168500
 1477 | <<<<<<< HEAD
      : ^^^^^^^
 1478 |     // 100円単位で切り上げ（反り上げ）例：176930 → 177000、165042 → 165100
 1479 |     const roundedTotalPrice = Math.ceil(totalPrice / 100) * 100;
 1479 | =======
      `----
  x Merge conflict marker encountered.
      ,-[C:\Users\kanei\claudecode\02.Homepage_Dev\02.epac_homepagever1.1\src\lib\unified-pricing-engine.ts:1480:1]
 1477 | <<<<<<< HEAD
 1478 |     // 100円単位で切り上げ（反り上げ）例：176930 → 177000、165042 → 165100
 1479 |     const roundedTotalPrice = Math.ceil(totalPrice / 100) * 100;
 1480 | =======
      : ^^^^^^^
 1481 |     // totalPrice を先に丸めてから unitPrice を計算することで、
 1482 |     // unitPrice * totalQuantity === totalPrice を保証
 1482 |     // 100円単位で切り上げ（反り上げ）例：176930 → 177000、165042 → 165100
      `----
  x Merge conflict marker encountered.
      ,-[C:\Users\kanei\claudecode\02.Homepage_Dev\02.epac_homepagever1.1\src\lib\unified-pricing-engine.ts:1487:1]
 1484 |     // 小数点以下を含む場合: 168400.646... → 168500
 1485 |     const roundedTotalPrice = Math.ceil(totalPrice / 100) * 100;
 1486 | 
 1487 | >>>>>>> feature/20260218-fix-pricing-errors
      : ^^^^^^^
 1488 |     // Security: Rounding details only logged in development
 1489 |     if (process.env.NODE_ENV === 'development') {
 1489 |       console.log('[100円丸め] 丸め前 totalPrice:', totalPrice, '(型:', typeof totalPrice, ')');
      `----

Caused by:
    Syntax Error
nextJsHandleConsoleError @ pages-dev-overlay-setup.js:71
handleErrors @ hot-reloader-pages.js:160
processMessage @ hot-reloader-pages.js:220
eval @ hot-reloader-pages.js:69
handleMessage @ websocket.js:68
pages-dev-overlay-setup.js:71 ./node_modules/next/dist/server/app-render/manifests-singleton.js
Error: ENOENT: no such file or directory, open 'C:\Users\kanei\claudecode\02.Homepage_Dev\02.epac_homepagever1.1\node_modules\next\dist\server\app-render\manifests-singleton.js'
nextJsHandleConsoleError @ pages-dev-overlay-setup.js:71
handleErrors @ hot-reloader-pages.js:160
processMessage @ hot-reloader-pages.js:220
eval @ hot-reloader-pages.js:69
handleMessage @ websocket.js:68
pages-dev-overlay-setup.js:71 ./node_modules/fast-png/node_modules/pako/dist/pako.esm.mjs
Error: ENOENT: no such file or directory, open 'C:\Users\kanei\claudecode\02.Homepage_Dev\02.epac_homepagever1.1\node_modules\fast-png\node_modules\pako\dist\pako.esm.mjs'
nextJsHandleConsoleError @ pages-dev-overlay-setup.js:71
handleErrors @ hot-reloader-pages.js:160
processMessage @ hot-reloader-pages.js:220
eval @ hot-reloader-pages.js:69
handleMessage @ websocket.js:68
