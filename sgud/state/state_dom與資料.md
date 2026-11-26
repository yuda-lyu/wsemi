# 狀態(dom 與資料處理)

本檔自 `sgud/state/state.md` 依功能類型拆出(2026-11-02 ws265 依全域設定§14整理;原約 53.7KB):各節之節號與標題不變、內容逐字搬移;索引見 `sgud/state/state.md`.

2026-11-27(wsr2,排程第 663 項 B 輪)依功能類型再拆(原約 37.9KB): 結構函數之各節移至 `sgud/state/state_結構函數.md`、非計算類函數必須參數與同步工具函數遇無效輸入之各節移至 `sgud/state/state_非計算類函數參數.md`;節號與標題不變、內容逐字搬移,本檔留字串取代之取代值字面化、getUserAgent 之 UMD 晚載入、移除全部 *Dyn 函數.


## 字串取代之取代值字面化:`replace` 之 `r` 為字面文字、`replaceObj` 不再預先逸出 `$`(排程第 427 項之 wsemi 部分;主控任務 20261112065727 wsrep,2026-11-12;package.json version 1.9.57 之工作樹,未提交未發布)〔本節於 2026-11-12 新增,置於該檔最前〕

- 現況(已實作): ①`replace(c, t, r)`(`src/replace.mjs:43`)以 `replaceAll(t, () => String(r))` 取代,`t`、`r` 皆為字面文字,`r` 內 `$&`、`$'`、`` $` ``、`$$`、`$<x>`、`$1` 原樣輸出;JSDoc 寫明並加例 `replace('價格{p}', '{p}', '$&5')` → `'價格$&5'`.②`replaceObj`(原 `src/replaceObj.mjs:87`)移除 value 之 `$` 逸出(`replace` 已字面,逸出會使 `$` 變 `$$`),對外行為不變.③`src/` 全庫 67 站點盤點(AST 掃描): 取代值為變數者 0(修前僅 `replace` 一處)、函式回傳 6、字面常數 54、刻意之 `$` 樣式 7(正規式捕獲群或 `$&`).
- 規則: R-REPLACE-LITERAL-01(`sgud/rule/rulebook_replace.md`);破壞性變更紀錄第 64 項,見 `sgud/rule/rulebook_breaking_57on.md`.
- 測試: `replace.test.mjs` 17 → 28 案;新檔 `replaceLiteralSites.test.mjs`(7 案,AST 掃描 `src/` 全站點並釘住刻意之 `$` 樣式全集)與 `test/tools/replaceSiteScan.mjs`;`replaceObj.test.mjs`(143 案,含 `$` 值案)未改而全綠.
- 驗證(2026-11-12): 修前 `replace.test.mjs` 新增 11 案中 9 案紅(`$<x>`、`$1` 兩案修前亦綠: 字串 pattern 無捕獲群,屬日後改用正規式之守門);變異 10 項全部殺死、2 項等價變異存活(省略 `String(r)`、改 `split/join`);全套 `npm test` 29971 passing、8 pending、0 failing(ws426 收尾 29953／8,差 +18＝新增 11＋7);eslint 改動檔 0 error;未派第三方外審(派工書未列).
- 已知缺口與待辦: ①下游盤點與連動由主控安排(主控已盤點,無依賴展開者);②README 無〈Breaking changes〉節,條文見破壞性變更紀錄第 64 項;③`rulebook_judge_sites_r2c.md` 之 ws286b 處置結果仍載「`replace` 未改」,已於 R-REPLACE-LITERAL-01〈取代紀錄〉註明自 ws427 起失效;④掃描只涵蓋 `src/*.mjs`(`toolg`、`toolparfor`、`toolfp` 之原始碼不在本規則範圍).

## getUserAgent 之 UMD 晚載入(R-UMD-EXTERNAL-01;排程第 258 項;主控任務 20261102014123 ws265,2026-11-02;package.json version 1.9.40 之工作樹,未提交未發布)

- 現況(已實作): `getUserAgent` 於呼叫時才取 `UAParser`(先 `try` 取 import 進來者,再 `get(getGlobal(), 'UAParser', null)`,皆非函數拋 `Error('invalid UAParser, g.UAParser, use script for import')`),UMD 之 ua-parser-js script 可先於或晚於 wsemi 載入;皆未載入時錯誤由 `TypeError` 改為上述 `Error`.README 之 ua-parser-js 說明改為「前後皆可」.`dist/` 未重建(發布管線產物).
- 規則: `sgud/rule/rulebook_umd.md` R-UMD-EXTERNAL-01;破壞性變更第 51 項.
- 測試: `test/getUserAgentUmd.test.mjs`(9 案;以 `w-package-tools` 之 `rollupFile` 回傳程式碼模式於記憶體打包、`vm` 新環境載入真實 ua-parser-js UMD 依各順序測試,含全域污染防護案);原 `test/getUserAgent.test.mjs` 未改.
- 驗證(2026-11-02): 修前 8 案中 6 案紅(含 `Cannot read properties of undefined (reading 'UAParser')`);修後綠;變異 U1~U8 擊殺 7,存活 1 為等價(不還原 `stackTraceLimit`,mocha 內該值恆 Infinity);全套 3 次綠.注意: 該測試之打包會換掉 `Error.prepareStackTrace`,已於測試內還原(見 R-TEST-STRUCT-01 規則 4).
- 待辦: 發布時 `dist/` 由管線重產;使用端 README 載入順序說明已更新.

## 移除全部 *Dyn 函數(使用者 2026-11-01 裁示;Gitea #44;主控任務 20261101202155 wsemi-rmdyn,2026-11-01;package.json version 1.9.39 之工作樹,未提交未發布)

- 現況(已實作): 刪除 8 個 *Dyn 函數——`clearXSSDyn`、`detectXSSDyn`、`getUserAgentDyn`、`domRenderMarkdownMindDyn`(原以 `importResources` 自 jsDelivr 載入釘版第三方)與 `domConvertToPicDyn`、`domShowImagesDyn`、`downloadExcelFileFromDataDyn`、`getDataFromExcelFileU8ArrDyn`(轉呼叫之保留函數),連同 7 個測試檔(10 案)、5 個範例頁;`src/index.mjs` 以 `toolg/gPackageIndex.mjs` 重產(481→473 個匯出,僅少該 8 個);README 刪 5 個範例連結並改 3 則 Note.wsemi 內已無任何執行期自 CDN 載入第三方之函數.`docs/`、`dist/` 為發布管線產物,未手改(仍含 *Dyn,發布時重產).
- `domRenderMarkdownMind`: **不改為打包 markmap**(主控任務書定);JSDoc 與 README 明寫須由使用端先載入(全域 `markmap`).評估(官方預建檔實測,見主控任務 `agent-out/wsemi-rmdyn-修正報告.md`): d3@7.8.3＋markmap-view@0.14.4＋markmap-lib@0.14.4 共 429,955 位元組(gzip 143,491),現行 `dist/wsemi.umd.js` 為 1,364,805(gzip 436,290),打包約增 31.5%(gzip 增 32.9%;d3 取全量,為上限值,樹搖後未實測),npm 相依亦增;依任務書判斷,與 wsemi 收錄原則(R-SCOPE-01 ③與領域無關之常見處理函數;不收帶領域語意者)之定位不合.
- `_filterXSS` 之全域回找(`g.filterXSS`、`g.xss`): 經查**非 Dyn 專用**,保留(先載 wsemi 後載 xss 時非 Dyn 之 `clearXSS`／`detectXSS` 仰賴它,實測見 R-XSS-01 規則 1);僅改 `src/_filterXSS.mjs` 與 `test/_filterXSS.test.mjs` 各一處註解.
- 規則: 破壞性變更紀錄第 48 項(含使用端改名對照);`sgud/rule/rulebook_xss.md` R-XSS-01、`rulebook_data.md` R-EXCEL-READ-01(2026-11-27 移至 `rulebook_excel.md`)、`rulebook_trace.md` R-TRACE-01(刻意不套清單)已更正現況;各帳本「變更紀錄」之歷史條目保留原文.
- 驗證(2026-11-01 最終碼): 全套 `npm test`(quiet-run --lock)**22907 passing／6 pending／0 failing**(exit 0);移除前同工作樹基線 22917,差恰為刪除之 10 案(`need test in browser` 5、`downloadExcelFileFromDataDyn` 2、`getDataFromExcelFileU8ArrDyn` 3),前後 ✔ 行多重集合差僅此 10 案,餘為標題含執行當下時間戳或 AES 密文而每次不同者;`clearXSS`／`detectXSS`／`_filterXSS` 三測試檔斷言未改;`src/index.mjs` 靜態檢查(匯出消失者恰為該 8 個、無懸空相對匯入);eslint 改動檔 0 error;**未經第三方外審**.
- 待辦(不在 wsemi): 專案方依移除發布之留言改名並關閉 #44;w-ui-dwload `src/WUiDwload.mjs:329` 之 `html2picDyn` 註解字樣由該套件順手更正;w-component-vue 之 *Dyn 組件由另一 agent 同步移除.
