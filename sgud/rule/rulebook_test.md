# 規則帳本(測試檔結構)

索引見 `sgud/rule/rulebook.md`〈索引〉.全域測試規範見 skill role-coder-for-test §3、§4(共用層與輔助工具不帶 `.test.` 中綴且放 `test/tools/`).

## R-TEST-STRUCT-01 測試檔之間不得互相 import;`test/tools/` 之檔不得於載入時(頂層)註冊 describe、it、hook

- **依據**: 排程第 254 項(2026-11-02,ws265,主控任務 20261102014123):全套 `npm test` 通過數偶發少 3 案(22914／22917;皆 0 failing;缺的是 `blob2*` 家族 3 個案名各 1 次).wsemiA 報告 §5 已指出 `blob2b64.test.mjs` 被 6 個測試檔 `import`、其 `describe` 註冊 2 或 3 次(以 log 之 describe 次數得證);本輪重現並修正.
- **成因**: `test/blob2b64.test.mjs` 同時是測試檔(被 `test/*.test.mjs` 收進)與共用輔助(匯出 `getRes`,被 `blob2ab`、`blob2str`、`blob2u8arr`、`blobs2u8arrs`、`blobs2b64s`、`files2data` 六個測試檔 `import`).ESM 模組快取使一個模組在同一行程只求值一次,其頂層之 `describe('blob2b64', …)` 只在**該行程第一次載入該模組時**註冊(註冊進當時載入中之那個檔案之執行);`mocha --parallel` 把測試檔分派給 N 個 worker(預設 CPU 數減 1),**每個載入過這七個檔案任一個之 worker 各註冊並執行一次** `blob2b64` 之 3 案.故該 3 案之執行次數等於「分到這七檔之 worker 數」,隨每次全套之分派而異.
- **證據(修前,7 檔 `--parallel --jobs N`,各 5 次,腳本 `tmp/ws265/jobs-matrix.mjs`,已隨結案清除)**: 通過數 = 25 + 3×(N−1)——jobs 1→25、2→28、3→31、4→34、5→37、6→40、7→43;`--no-parallel` 為 25.修後(每種 jobs 各 5 次)一律 25.
- **規則**:
  1. 測試檔(`test/*.test.mjs`)不得 `import`(靜態、動態 `import()`、`require()`)另一個 `*.test.mjs`;共用者放 `test/tools/`(不帶 `.test.` 中綴),`getRes` 改置於 `test/tools/resKit.mjs`.
  2. `test/tools/*.mjs` 不得在頂層(第 0 欄)呼叫 `describe`／`it`／`before`／`after`／`beforeEach`／`afterEach`／`context`;須註冊者包在由測試檔呼叫之函數內(各測試檔各呼叫一次,如 `defineOptParam`、`diagSuite` 之現況).
  3. 以 `test/testStructure.test.mjs` 靜態釘住(掃 `test/` 與 `test/tools/` 全部檔案).
  4. **測試不得把行程層全域留在被改過之狀態**: 載入或執行會改動 `Error.prepareStackTrace`／`Error.stackTraceLimit`、`process` 監聽器、`globalThis` 屬性之相依(如 `w-package-tools` 之 `rollupFile` 打包會換掉 `Error.prepareStackTrace`)者,須於測試內(`before`／`finally`)先存後還原,不得靜態 `import`(載入即污染)又不還原;`mocha --parallel` 同一 worker 之後續測試會受影響(第 254 項同族,2026-11-02 `getUserAgentUmd.test.mjs` 污染 `maskDiagErr` 之 capi #14,全套連跑 3 次中 2 次紅).偵測法: 把疑似污染之測試檔與受害檔以 `mocha --no-parallel A B` 同一行程相接重現,再於子行程以 `Error.prepareStackTrace === 載入前之值` 等比對二分.
- **測試**: `test/testStructure.test.mjs`(4 案,含 pattern 之正反例);變異 6 項全擊殺(blob2ab 又 import `blob2b64.test.mjs`、工具檔頂層 `describe`／`it.skip`、pattern 不抓 `import()`／`require()`、掃描不含 `test/tools`).
- **不採**: 以測試跑 `mocha --parallel --jobs N` 驗案數恆定(測試內啟動 mocha,慢且巢狀);改以靜態結構檢查加報告內之 `--jobs` 矩陣與全套連跑證據.
- **變更紀錄**: 2026-11-02(ws265)新增本規則(僅測試目錄,無對外行為變更).
