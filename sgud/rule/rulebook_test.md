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

## R-TEST-BROWSER-01 真瀏覽器行為測試之基建: playwright-core(devDependencies)＋`test/tools/browserKit.mjs`,不依賴 `./dist`、不比標準圖

- **依據**: 排程第 642 項(2026-11-25): `domConvertToPic` 之測試原為空殼(`import` 被註解、只斷言 `1 === 1`),snapdom 升版無任何自動化保護.限制: wsemi 為 Level 3,**不得依賴 w-playwright(Level 3)或 w-package-tools-e2e(Level 4)**(依賴即須升 Level 而連帶全庫改名);故以外部套件 `playwright-core` 自建最小基建.
- **規則**:
  1. **依賴**: `package.json` 之 `devDependencies` 有 `playwright-core`(版本取同 w-playwright 所依者之同一範圍,現為 `1.65.1` 精確版);`dependencies` 不增.
  2. **瀏覽器之取得**(`browserKit.launchBrowser`): 先直接啟動 Playwright 受管之 headless shell,已安裝者不下載;錯誤訊息為 `Executable doesn't exist` 時才以 `playwright-core/cli.js install --no-remove --only-shell chromium` 安裝(子行程 `windowsHide: true`,`process.execPath` 執行,逾 `INSTALL_TIMEOUT`〔10 分鐘〕結束整個子行程樹並拋錯),裝完再啟動一次.**並行安裝由 Playwright 自身之目錄鎖序列化**(瀏覽器目錄內 `__dirlock`,`registry.install` 取鎖,重試約 10 分鐘;`playwright-core/lib/coreBundle.js` 之 `install`),共用其瀏覽器快取、不另設鎖.**取不到瀏覽器(離線、安裝失敗)即拋錯(fail-closed),不 skip**——skip 會使 passing 靜默少案而失去保護;離線環境預先安裝或設 `PLAYWRIGHT_BROWSERS_PATH`.不依 `dspec` 外部執行檔規格之 `fsEnsureBins`(該規格明列 playwright 受管瀏覽器為例外,由 playwright 統一處理).
  3. **頁面載入 wsemi 原始碼**: `page.route` 供應虛擬主機 `http://wsemi.test/` 之 `/src/*`、`/node_modules/*`(讀本庫實檔,限此二前綴並擋路徑跳脫)＋ import map 解析 `@zumer/snapdom`、`lodash-es`(新增 src 之裸模組相依時須補 `IMPORT_MAP`),模組以 `window.mods[名稱]`(命名空間)暴露;**不開埠、不連網、不依賴 `./dist`、不寫入本庫任何檔案**.跨源資源用另一虛擬主機 `CROSS_HOST`(`opt.crossRoutes`).
  4. **斷言為行為量測,不比標準圖**: 輸出尺寸、指定區塊之平均色與非白像素數、原始 RGBA 之透明度、同次執行內兩輸出之像素雜湊是否相同(`analyzePic`);snapdom 升版之反鋸齒差異不應使測試轉紅.
  5. **修前紅驗證**: `openPage` 之 `opts.overrides` 可以他檔取代某路徑之內容;`test/domConvertToPic.test.mjs` 讀環境變數 `WSEMI_DOMCONVERTTOPIC_SRC`(指向改前之 `domConvertToPic.mjs`)即改載該檔,供修前紅與變異驗證;未設時載本庫現檔.`snapdomFailStub.mjs` 以同法取代 snapdom 使截圖必定失敗.
  6. **清理**: 每案之 context 於 `afterEach` 關閉,瀏覽器於 `after` 關閉;結束後無遺留之 chrome／node 行程(實查).
- **盤點**: `Grep "browserKit" test/`(現只有 `test/domConvertToPic.test.mjs`);新增真瀏覽器測試檔沿用本基建,不另寫一份.
- **已知限制**: 首次取得瀏覽器須連網(Playwright 之 CDN);全套之 `--parallel` 下僅此一檔起瀏覽器.
- **變更紀錄**: 2026-11-25(t642)新增本規則.
