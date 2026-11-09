# 狀態(外部依賴升版)

只記現況、不寫過程(過程見 `sgud/exp/experience.md`).

## 外部依賴跨主版號升級: chokidar 5→6、he 1→2(R-DEP-MAJOR-01;主控任務 20261109223142 ws01,2026-11-09;package.json version 1.9.53 之工作樹,未提交未發布)〔本節於 2026-11-09 新增,置於該檔最前〕

- **現況(已實作)**: `package.json` 宣告 `chokidar ^6.0.0`、`he ^2.0.0`(`package-lock.json` 同步;其頂層 `version` 由 1.9.52 對齊為 1.9.53 係 npm 依 `package.json` 既有版號同步,非本輪改版號);未新增 `engines`;README〈Installation〉補一句 Node.js >= 22.22 之需求.
- **src 改動**: `src/fsWatchFile.mjs:162-163`、`src/fsWatchFolder.mjs:238-239`(`pollingInterval`／`pollingBinaryInterval`);`src/htmlEncode.mjs:2,32`、`src/htmlDecode.mjs:2,32`(具名匯入).站點全集與處置見 `sgud/rule/rulebook_deps.md`.
- **規則帳本對應**: R-DEP-MAJOR-01 → `sgud/rule/rulebook_deps.md`.
- **測試檔**: `test/htmlEncode.test.mjs`(+6 案)、`test/htmlDecode.test.mjs`(+9 案)、`test/fsWatchFolder.test.mjs`(+1 真 chokidar 案、假 chokidar 案增斷言、1 案之錯誤平台假設修正)、`test/fsWatchFile.test.mjs`(+1 真 chokidar 案)、`test/evemSafe.test.mjs`(EPERM 案改 `polling: true`)、`test/optValG2fsWatch.test.mjs`／`test/tools/optValG5Kit.mjs`(觀察欄位改新名)、`test/tools/fsWatchKit.mjs`(`withSpyChokidar`、假 watcher 擬終結態).
- **驗證(2026-11-09)**: 全套 `npm test` 29956 passing、8 pending(皆為既有之平台／線上／已知限制案)、0 failing;建置驗證(暫存副本,不動 `toolg/`、`dist/`): `node ./toolg/gDistRollup.mjs` 成功,產出 `wsemi.umd.js` 1,405,883 bytes(現行 `dist/` 為 1,394,604 bytes),he 已打包(無 `require('he')`)、chokidar 保持 external;瀏覽器式沙箱(vm,無 require/module)與 Node CJS 兩條載入路徑之 `htmlEncode`／`htmlDecode`／`fsWatchFolder` 皆通過.
- **已知缺口與待辦**: ①真瀏覽器(Chromium)未驗,只以 vm 沙箱驗證 UMD(本機 `node_modules` 無 playwright);he 2 要求 `Object.hasOwn`(Chrome 93／Firefox 92／Safari 15.4 以上;現行 UMD 已含另一處 `Object.hasOwn`).②chokidar 6 之行為差分(Windows 原生監看: 被監看資料夾本身消失多由 chokidar 先回報、拒絕存取之子資料夾不再回報 EPERM)已寫入 R-DEP-MAJOR-01,下游若依賴原行為須知.③`dist/`、版號、發布不屬本輪.
