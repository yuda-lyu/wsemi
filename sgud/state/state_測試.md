# 狀態(測試)

本檔自 `sgud/state/state.md` 之索引分出(2026-11-02 ws265 新增類型): 測試檔結構與全套穩定性之現況;索引見 `sgud/state/state.md`.

## R-CATCH-TEXT-01、R-EXEC-WINHIDE-01 之守門(排程第 676、681 項;主控任務 20261127121903 wsr3,2026-11-27;package.json version 1.9.82 之工作樹,未提交未發布)

- **已建**: ①`test/tools/catchErrTextScan.mjs`(`scanCatchErrText`,acorn: catch 內對 catch 參數之 `.toString`／`.message`、`String()`、樣板字串嵌入、`+` 串接;自測 12 案)＋`test/catchErrText676.test.mjs` 之全庫掃描(掃描檔數 > 400,結果須恰為 4 個允許站點之各檔數);②`test/tools/catchSiteKit.mjs`(逐站故障注入: 於 try 內內建函數之第一次呼叫拋出一次、全域類別 `Proxy` 拋出一次、分離之 buffer,及 src 鏡像複本內相依模組換為呼叫即拋之替身);③`test/tools/cpHideScan.mjs`(`scanCpHide`: 對 `child_process` 之 7 個函數之呼叫是否帶 `windowsHide: true` 字面值,自測 7 案)＋`test/execProcessKillPid681.test.mjs` 之全庫各檔站點數釘住(共 9 處);④`test/tools/killWinRunner.mjs`(攔截 `child_process` 與 `process.kill` 之子行程執行器,替身恆不呼叫真實函數).
- **盲點**: 掃描器皆為 AST 且不抓「先別名再轉／呼叫」、動態鍵、`eval`;`cpHideScan` 不含注入之 `spawn`(`fsEnsureBinsCore`、`execCliCore` 之參數,已人工核對).
- **驗證**: 現行 src 通過;修前鏡像根(`WSEMI_ERR676_SRC`、`WSEMI_KILL681_SRC` 等環境變數指向修前 src)之紅數見各規則之〈測試〉.

## R-C1-HOSTILE-01 之守門(opt 讀取與 state 訊息;排程第 663 項;主控任務 20261127030143 wsr2,2026-11-27;package.json version 1.9.81 之工作樹,未提交未發布)

- **已建**: `test/optHostile663.test.mjs` 之 AST 守門 ＋ 掃描器 `test/tools/optReadScan.mjs`(acorn,不計註解與字串): `scanOptReads`(對 `opt` 之直接讀取: `get(opt, 'k')`／`opt.k`／`opt['k']`／`opt?.k`／解構,6 正例 3 反例之盲點自測)與 `scanErrEcho`(`retError(…errToStr(…)…)`,4 正例 4 反例).守門三則: ①62 個目標函數不得直接讀 `opt` 且須匯入 `_pickOpt`;②全庫讀 `returnWithStateAndMsg` 之檔(目前 58)皆匯入 `_pickOpt`;③全庫無 `retError(…errToStr(…)…)`.已知盲點: 先別名再讀、動態鍵之鍵名;`err.toString()` 站點不計.規則見 `sgud/rule/rulebook_judge_nothrow.md` R-C1-HOSTILE-01 規則 6.
- **驗證**: 現行 src 通過;修前鏡像根三則皆紅(第三則列出 `retError(…errToStr(…)…)` 共 9 站: `ab2u8arr.mjs:56`、`str2obj.mjs:98`、`stru8arr2obj.mjs:85`、`:175`、`timemsTZ2expire.mjs:222`、`timemsTZ2past.mjs:217`、`timeTZ2expire.mjs:118`、`timeTZ2past.mjs:118`、`u8arr2obj.mjs:186`;第二則列出 58 檔中 57 檔未匯入 `_pickOpt`〔`cint` 已有〕);變異 `X03`～`X13`(各取一函數改回直接讀)、`X14`～`X20`(固定訊息改回原樣轉出)皆被殺.

## R-JUDGE-SOURCE-01 之守門測試(排程第 599 項③;主控任務 20261127030143 wsr1,2026-11-27;package.json version 1.9.81 之工作樹,未提交未發布)

- **已建**: `test/judgeSourceGuard.test.mjs`(2 案)＋掃描器 `test/tools/judgeSourceScan.mjs`(acorn,不計註解與字串;26 正例 10 反例之盲點自測,含獨立複審所補之彙整模組 `lang.js`／`lodash.default.js`、獨立套件 `lodash.isfunction`、require 類呼叫;掃描檔數 ≥500;允許站點釘住 `{ 'isfun.mjs': ['isFunction'] }`).規則見 `sgud/rule/rulebook_data.md` R-JUDGE-SOURCE-01.
- **驗證**: 現行 src 通過;變異 M18(`isbol.mjs` 植入 `lodash-es/isBoolean.js`)、M19(`pmQueue.mjs` 植入 `import { isFunction } from 'lodash-es'`)皆被殺.

## 真瀏覽器行為測試之基建(R-TEST-BROWSER-01;排程第 642 項;主控任務 20261125225421 t642,2026-11-25;package.json version 1.9.77 之工作樹,未提交未發布)

- 現況(已實作): `devDependencies` 新增 `playwright-core`(精確版 `1.65.1`,同 w-playwright 所依);`test/tools/browserKit.mjs`(`launchBrowser`、`installBrowser`、`openPage`、`analyzePic`)、`test/tools/snapdomFailStub.mjs`;首個使用者 `test/domConvertToPic.test.mjs`(29 案).頁面以 `page.route` 虛擬主機載入本庫 `src` 與相依(import map),不依賴 `./dist`、不開埠、不連網;瀏覽器已安裝者直接啟動,缺才以 playwright-core 之 CLI 安裝(並行由 Playwright 之 `__dirlock` 序列化,逾 10 分鐘結束子行程樹並拋錯);取不到即拋錯(不 skip).斷言為行為量測(尺寸、區塊平均色、非白像素數、像素雜湊),不比標準圖.環境變數 `WSEMI_DOMCONVERTTOPIC_SRC` 取代被測檔,供修前紅與變異驗證.
- 限制: wsemi 為 Level 3,不得依賴 w-playwright(Level 3)與 w-package-tools-e2e(Level 4),故自建最小版,與 w-playwright 之安裝邏輯重複一份(見 `sgud/feedback/feedback.md`).
- 已知缺口與待辦: 首次取得瀏覽器須連網(Playwright CDN);離線環境預先安裝或設 `PLAYWRIGHT_BROWSERS_PATH`;其他函數之真瀏覽器測試(如 `domShowImages`、`domTooltip`)尚未補,可沿用本基建.
- 規則: `sgud/rule/rulebook_test.md` R-TEST-BROWSER-01.

## 全套案數一致與測試檔結構(R-TEST-STRUCT-01;排程第 254 項;主控任務 20261102014123 ws265,2026-11-02;package.json version 1.9.40 之工作樹,未提交未發布)

- 現況(已實作): 全套 `npm test` 之通過數不再隨 `mocha --parallel` 之檔案分派而異.成因: `test/blob2b64.test.mjs` 被 6 個測試檔 `import { getRes }`,ESM 快取使其頂層 `describe` 於各 worker 第一次載入時註冊,案數 = 25 + 3×(分到該批檔案之 worker 數 − 1)(7 檔 `--jobs N` 修前實測 25/28/…/43,修後恆 25).修正: `getRes` 移至 `test/tools/resKit.mjs`,7 個檔改 import 之;新增 `test/testStructure.test.mjs` 靜態釘住「測試檔互不 import、工具檔頂層不註冊 describe／it／hook」.規則 4: 測試不得把行程層全域(`Error.prepareStackTrace` 等)留在被改過之狀態(`getUserAgentUmd.test.mjs` 之打包曾污染同 worker 之 `maskDiagErr` capi #14,已修).
- 規則: `sgud/rule/rulebook_test.md` R-TEST-STRUCT-01(僅測試目錄,無對外行為變更).
- 測試: `test/testStructure.test.mjs`(4 案,變異 6/6 擊殺);`test/tools/resKit.mjs`.
- 驗證(2026-11-02 最終碼): 全套連跑 3 次皆 **23011 passing／6 pending／0 failing**(exit 0),各次 ✔ 行 23011、相異案名 10795,案名多重集合相同(僅 24 個標題含執行當下時間戳或 AES 密文者每次不同,標題非確定);較移除 *Dyn 後之 22907 多 104 案 = 新增 107(`fsWatchFolder` 5、`getUserAgentUmd` 9、`testStructure` 4、`fsInvalidPath` 89)減 `blob2b64` 之 3 案重複註冊 1 次(22907 為該 3 案註冊 2 次之一次).首次最終碼全套連跑 3 次中 2 次紅(`maskDiagErr` capi #14,上述污染),修後 3 次全綠.
- 待辦: 無.
