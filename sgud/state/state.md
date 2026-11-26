# 狀態

本檔記 wsemi 各功能之**現況**(做到哪裡、對應之規則帳本條目與測試檔、已知缺口與待辦、最近一次驗證之版本);只記現況、不寫過程(過程見 `sgud/exp/experience.md`).

本檔 2026-10-28 新建;此前各功能之現況未逐一盤點入檔,以 `sgud/rule/rulebook.md` 各條目之「站點全集」「測試」「已知限制」「變更紀錄」為準.之後完成一項功能或結束一輪工作時於此增列或更新.

## 索引(哪類查哪檔)

### `sgud/state/state_外部程序與檔案_第2輪.md`(外部程序與檔案,第 2 輪起;約 5KB;新增於 2026-11-24)

查: `fsEnsureBins` 之跨程序只取得一次(鎖之位置與格式、等候、接手、上限、事件、測試、已知缺口)、離線試取清除之競態與無主暫存之清除、取得預算函數 `fsEnsureBinsBudget` 與其並行最壞選項 `opt.concurrent`、`fsDownloadFileVerify` 之 Node 內建 fetch 已知限制.所含節:

- `fsEnsureBinsBudget` 之並行最壞選項 `opt.concurrent`、`fsDownloadFileVerify` 之 Node 內建 fetch 已知限制(排程第 634 項②④;t642,2026-11-25)〔本節於 2026-11-25 新增,置於該檔最前〕
- `fsEnsureBins` 離線試取清除之競態、無主暫存之清除、取得預算函數(排程第 639 項、第 634 項①③;twsm3,2026-11-25)〔本節於 2026-11-25 新增,置於該檔次位〕

- `fsEnsureBins` 跨程序只取得一次(排程第 632 項;twsm2,2026-11-24)〔本節於 2026-11-24 新增〕

### `sgud/state/state_診斷與遮罩_第2輪.md`(診斷輸出與遮罩,第 2 輪起;約 5KB;新增於 2026-11-24)

查: 串流遮罩器 `genDiagStreamMasker`、`maskDiagCtrl`、`maskDiagToken`、`pickDiagOpt` 之新增,`getDiag` 之 warn、行內摘要格式、`maskDiagText.credPatterns`、`downloadExcelFileFromData` 經 getDiag 出口,收錄判定(含 `logKey` 不收)、全庫 console 之 AST 盤點、驗證數字、待裁示與使用端改用清單.所含節:

- 收尾輪:控制字元單一規則之補齊、常駐路徑之記錄經 getDiag、除錯殘留(主控裁定;twsm1b,2026-11-24;twsm1c 續:監看之監聽器拋錯通報與 fsEvem/fsTaskCp 之轉傳)〔本節於 2026-11-24 新增,置於該檔最前〕
- 串流遮罩器、收錄評估與診斷輸出之擴充(排程第 486、610 項;twsm1,2026-11-24)〔本節於 2026-11-24 新增〕

2026-11-02(ws265)依全域設定§14整理: 本檔原約 53.7KB(13 節),依功能類型拆為下列 5 檔(含同日新增之 `state_測試.md`),各節之節號與標題不變、內容逐字搬移;本檔只留索引.完成一項功能或結束一輪工作時,把現況寫入對應類型檔(無對應類型者新增 `state_<類型>.md` 並於下列增列),不再寫回本檔.2026-11-02(ws272c)另把 `state_數值與判斷.md` 之第 2 輪三節(ws272a、ws272b、ws272c)抽至 `state_數值與判斷_第2輪.md`(原檔約 31.3KB),現共 6 檔.

### `sgud/state/state_訊息格式與可讀性探針.md`(失敗訊息格式 V19／V20 與共用可讀性探針;約 6KB;新增於 2026-11-19)

查: 輸入無效之失敗訊息一律 `invalid <名稱>: must …` 且不帶輸入值(約 170 個對外函數)、移除帶值之 console、fs 系參數名 `pah` 更正為 `fp`／`fd`、`domIsStable.timeDiff` 負數改用預設、JSDoc `@param` 與簽名之全庫斷言、共用可讀性探針 `chkReadable` 之現況:驗證數字(全套／修前紅／變異)、獨立複審之處置、已知缺口與待裁示、下游固定舊行為(排程第 492 項第 9 批、第 558 項).所含節:

- 第 492 項第 10 批(上):第 559 項 exec 家族輸入不可讀改 V19 固定詞彙與 args／env 入口快照、command 含 NUL 入口擋下、`getObjSize` 無原型物件、V20 已知缺口(清單未知鍵名、Excel 寫檔器、`o2j` 族、`fsReadJson`、`execCliJsonFile` 結果檔)、`chkReadable.ownKeys` 讀 Symbol 描述子且有界(ws492k,2026-11-26)〔本節於 2026-11-26 新增,置於該檔最前〕
- 第 492 項第 9 批:訊息格式與文件、第 558 項共用可讀性探針(ws492j,2026-11-19)〔本節於 2026-11-19 新增〕

### `sgud/state/state_判斷與轉型.md`(判斷與轉型;約 5KB;新增於 2026-11-19)

查: 判斷函數只收原始值(包裝物件一律 `false`,轉型函數 `cdbl`／`cint`／`cstr`／`cbol` 照舊拆包)、判斷函數不拋錯(`_tagOf`、`isfun` 不拋錯、`_isFunSafe` 已移除)、`cbol` 依 B2、`isDate` 收嚴、`cint` JSDoc 之現況:驗證數字(全套／HEAD 基準／修前紅／變異)、獨立複審之處置、已知缺口與待裁示、下游固定舊行為(排程第 492 項第 8 批).所含節:

- 第 492 項第 10 批(下):第 551 項轉型函數對惡意值不拋錯(`cstr`／`cint`／`isUserPw`)、第 552 項判型改語言原生或內部槽(`isnull`／`isundefined`／`isbigint`／`isab`／`isu8arr`／`isu16arr`;`isarr`／`isobj`／`isblob`／`isfile` 停於該函數待裁示)(ws492k,2026-11-26)〔本節於 2026-11-26 新增,置於該檔最前〕
- 第 492 項第 8 批:判斷與轉型(ws492i,2026-11-19)〔本節於 2026-11-19 新增〕

### `sgud/state/state_結構運算與參數定義.md`(結構運算與參數定義;約 6KB;新增於 2026-11-19)

查: C7 結構運算第 1 參數無效回輸出型別之空結果(11 函數)、單一空元素之陣列視為一個元素(18 函數)、`arrSep` 只收設定物件、範圍型 opt 超出範圍改預設與帶預設值之位置參數視同 opt(N-B 19 列)、W-06 簽名／JSDoc／行為一致(`domCompareText.title`、`execCliJsonRpc.requests`)之現況:驗證數字(修前紅／變異／全套)、獨立複審之處置、已知缺口與待裁示(排程第 492 項第 7 批).所含節:

- 第 492 項第 7 批:結構運算與參數定義(ws492h,2026-11-19)〔本節於 2026-11-19 新增〕

### `sgud/state/state_計時與流程函數參數檢測.md`(計時與流程函數之函數參數檢測、`importResources` 之 `pathItems` 檢測;約 4KB;新增於 2026-11-18)

查: `setTimeoutHp`／`setIntervalHp`／`cacheBd`／`pmHook`／`pmHookReject`(`fun` 無效同步拋、先於副作用)、`pmQueue`／`pmThrottle`／`pmKeyMutex`(任務無效 reject 固定字串、不排隊)、`pmChain`／`pmMap`／`pmSeries`(視為未給)、`importResources`(進入時驗證並複製、不改寫輸入)之現況(ws492g 當時;`_isFunSafe` 已於 ws492i 移除,見 `state_判斷與轉型.md`):內部 `_isFunSafe`、修前紅／變異驗證數字、獨立複審未執行之原因、已知缺口與待裁示(排程第 492 項第 6 批).所含節:

- 第 492 項第 6 批:計時與流程(ws492g,2026-11-18;ws492g2 修正輪同日續改:`pmThrottle` 執行點再驗、`importResources` 載入事件內判定與 V19 訊息、`pmChain` 判準一致)〔本節於 2026-11-18 新增〕

### `sgud/state/state_外部程序三函數輸入檢測.md`(外部程序三函數之輸入檢測;約 5KB;新增於 2026-11-18)

查: `execProcess`(`prog`、`args`、`opt.codeCmd`、原生錯誤固定詞彙)、`execProcessKillPid`(`pid` 1~2147483647、0 與負數先於殺程序拒絕)、`execJsCode`(`fpJsCode`、`opt` 直通)之輸入檢測現況:子行程攔截替身之驗法、修前紅／變異／全套之驗證數字、獨立複審、已知缺口與待裁示(排程第 492 項第 5 批).所含節:

- 第 492 項第 5 批:外部程序(ws492f,2026-11-18)〔本節於 2026-11-18 新增〕

### `sgud/state/state_dom與下載輸入檢測.md`(DOM 與下載函數之輸入檢測;約 7KB;新增於 2026-11-18)

查: 30 個 DOM 與下載函數(`domFind`／`domRemove`／`domTriggerEvent`／`domTooltip`／`domAlert`／`domScroll*`／`domFade*`／`downloadFileFrom*`／`downloadExcelFileFromData`／`files2data`／`color` 等)之輸入檢測現況:改畫面者同步拋固定訊息、查詢類回空、opt 逐鍵檢測、下載族同一通道、修前紅／變異／真 Chromium 並排之驗證數字、外審用盡與內部複審、已知缺口(排程第 492 項第 4 批).所含節:

- 第 492 項第 4 批:DOM 與下載(ws492e,2026-11-18)〔本節於 2026-11-18 新增〕

### `sgud/state/state_檔案系統安全opt與訊息.md`(fs 之安全相關 opt、錯誤訊息不帶值、原生錯誤固定詞彙;約 5KB;新增於 2026-11-17)

查: 雜湊 `type`／`typeHash` fail-closed、`fsEnsureBins`／`fsDownloadFileVerify` 之安全相關 opt、fs 系訊息不回顯路徑／網址／輸入值、Node 原生錯誤固定詞彙、對外 12 函數之注入鍵 `undefined` 取內建之現況(排程第 492 項第 3 批).所含節:

- fs 之安全相關 opt 與訊息(排程第 492 項第 3 批;ws492d,2026-11-17)〔本節於 2026-11-17 新增〕

### `sgud/state/state_瀏覽器函數.md`(開分頁與彈窗訊息、`domConvertToPic`;約 5KB;新增於 2026-11-12)

查: `browserView` 系、`openLink`、`domAlert` 之現況(規格第 199 項 C18);`domConvertToPic` 之 canvas 內容、壞圖首次呼叫輸出高度、select 選取、單選鈕副作用、殘留節點(排程第 642 項).所含節:

- `domConvertToPic`: canvas 內容、壞圖首次呼叫輸出高度、select 選取、單選鈕副作用、殘留節點(排程第 642 項;t642,2026-11-25)〔本節於 2026-11-25 新增,置於該檔最前〕
- 規格第 199 項 C18:`browserView` 系、`openLink`、`domAlert`(排程第 430 項第一批;ws430,2026-11-12)〔本節於 2026-11-12 新增〕

### `sgud/state/state_相依套件.md`(外部依賴升版;約 2.5KB)

查: 外部依賴跨主版號升級之現況與驗證(2026-11-09 新增).所含節:

- 外部依賴跨主版號升級: chokidar 5→6、he 1→2(R-DEP-MAJOR-01;主控任務 20261109223142 ws01,2026-11-09;package.json version 1.9.53 之工作樹,未提交未發布)〔本節於 2026-11-09 新增,置於該檔最前〕

### `sgud/state/state_數值與判斷_第2輪.md`(數值與判斷,第 2 輪起;約 16.7KB)

查: 排程第 221 項第二批第 2 輪(第 272 項)ws272a、ws272b、ws272c 之現況(2026-11-02 ws272c 自 `state_數值與判斷.md` 抽出,逐字搬移),及第 3 輪(第 271 項)ws271 之現況(2026-11-02 新增,置於該檔最前).所含節:

- 已裁定未落實之 `objSortByKeys`、`treeToFilepath`、`arr2dt`,`pseudoRandomIntsNdpRange` 之值域,JSDoc 文字修正(排程第 492 項第 1 批;ws492b,2026-11-16)〔本節於 2026-11-16 新增,置於該檔最前,在下一節之前〕
- 對外入口之數值參數改 `isenum`＋`cdbl`:`domIsClientXYIn`、`domGetBoudRectRefSelf`、`interp1`(stairs)之 `xMin`／`xMax`(排程第 492 項;ws492a,2026-11-16)〔本節於 2026-11-16 新增,置於該檔最前〕
- 規格第 199 項 Q1-h:`cdbl`／`isint` 家族之文件與測試鎖定、opt 數值改 `iseint` 14 站(排程第 430 項第一批;ws430,2026-11-12)〔本節於 2026-11-12 新增,置於該檔最前〕
- 第二批第 3 輪 ws271「`interp1`、`arrGroupByMaxmin`、`arrLookupByMaxmin`、`strTruncate`＋`domFadeIn` 對齊」(排程第 221 項第二批第 271 項之第 3 輪〔第三級,下游已先行改〕;主控任務 20261102171617 ws271,2026-11-02;package.json version 1.9.44 之工作樹,未提交未發布)〔本節於 2026-11-02 新增,置於該檔最前〕

- 第二批第 2 輪 ws272c「DOM 類、`_optNum` 退役、`fsTask`」＋ws272b 回報後續 6 項＋sgud 大檔拆分(排程第 221 項第二批第 272 項之第 2 輪第 3 批〔最末批〕;主控任務 20261102123434 ws272c,2026-11-02;package.json version 1.9.43 之工作樹,未提交未發布)〔本節於 2026-11-02 新增,置於該檔最前〕
- 第二批第 2 輪 ws272b「字串、陣列、數值、編碼類」19 個函數＋ws270 回報 3 項缺陷(涉及 `bufRead`、`addMonth`、六個 `is*`)＋`pmTimeout` 訊息(排程第 221 項第二批第 272 項之第 2 輪第 2 批;主控任務 20261102123434 ws272b,2026-11-02;package.json version 1.9.43 之工作樹,未提交未發布)〔本節於 2026-11-02 新增,置於該檔最前〕
- 第二批第 2 輪 ws272a「計時與流程類」19 個函數(排程第 221 項第二批第 272 項之第 2 輪第 1 批;主控任務 20261102123434 ws272a,2026-11-02;package.json version 1.9.43 之工作樹,未提交未發布)〔本節於 2026-11-02 新增,置於該檔最前〕

### `sgud/state/state_數值與判斷.md`(數值與判斷;約 19.4KB)

查: opt 類數值參數之預設與警告、`isenum`／`iseint`、`preciseNum` 與其呼叫端改用.所含節:

- 已知缺陷先修:`sepInt`／`getFileBasicHash`／`getFileXxHash`／`strmid`／`arrSep`／`addMonth`／`bufRead`(排程第 221 項第二批之「已知缺陷先修」;主控任務 20261102112347 ws270,2026-11-02;package.json version 1.9.42 之工作樹,未提交未發布)〔本節於 2026-11-02 新增,置於該檔最前〕
- opt 類數值參數非預期之輸入改用預設、`opt.debug`、廣義數字陣列 `opt.base`、`preciseNum` 整數路徑、`arrFilterByENum`——第一級發布 A(排程第 221 項第二批;主控任務 20261031121854 wsemiA／wsemiA2,2026-10-31／11-01;package.json version 1.9.36 之工作樹,未提交未發布)
- 既有函數改用 `isenum`／`iseint` 第一批(排程第 221 項;主控任務 20261031121854 wsemi221a,2026-10-31;package.json version 1.9.35 之工作樹,未提交未發布)
- 專用判斷函數 `isenum`／`iseint` 與 `preciseNum` 精度(主控任務 20261031121854 wsemieff,2026-10-31;package.json version 1.9.34 之工作樹,未提交未發布)

### `sgud/state/state_外部程序與檔案.md`(外部程序與檔案;約 25.8KB)

查: 外部執行檔取得與下載校驗、埠查詢、原子寫檔、結果走 JSON 檔之 CLI、`fs*` 系.所含節:

- 自執行殼移入 4 件:`genClockTZ`、`execCliJsonFile`、`fsWriteTextAtomic`／`fsWriteTextAtomicCore`、`execCliFailDetail`(Gitea #41,使用端;主控任務 20261101152333 wsemi41,2026-11-01;package.json version 1.9.38 之工作樹,未提交未發布)
- `fsEnsureBins` 壓縮檔類型支援 `'tgz'`(Gitea #32,新增自有套件 w-canvas;主控任務 20261031175415 wsemi-tgz,2026-11-01;package.json version 1.9.37 之工作樹,未提交未發布)
- 查詢埠之監聽者 `execProcessPortPids`／`execProcessPortPidsSync`(R-PORT-PIDS-01;含 wu312 改以 OS API、wu316 改 Reflection.Emit 兩段現況)
- 帶期望雜湊之下載 `fsDownloadFileVerify`(R-DL-VERIFY-01)
- 外部執行檔之取得 `fsEnsureBins` 與清單項產生 `fsGetBinManifestEntry`(R-BIN-ENSURE-01)
- fs 系 Core 注入相依 fail-closed、`levelLimit` 之 `null`、路徑型 opt 鍵、N-A 入口檢測(R-FS-DEPS-01 等;排程第 492 項第 2 批;ws492c,2026-11-17)〔本節於 2026-11-17 新增,置於該檔最前〕
- fs* 路徑參數無效之處置(R-FS-INVALID-PATH-01;排程第 265 項來源第 216 項①;ws265,2026-11-02)〔本節於 2026-11-02 新增,置於該檔次位〕

### `sgud/state/state_計時與診斷.md`(計時與診斷;約 18.6KB)

查: 計時器觀察回調 `opt.onTrace`、診斷輸出與遮罩共用函數、`debounce`／`execProcess` 等小輪項目.所含節:

- 兩處測試偶發紅之修正:fsDownloadFileVerify 停滯／fallback 案(假時鐘推進終點)、clearXSS 100 萬節點環案(牆鐘上限改量 CPU 時間)(排程第 393、349 項;ws290,2026-11-12)〔本節於 2026-11-12 新增,置於該檔最前〕
- 診斷通報輪(主控任務 20261031121854,2026-10-31;package.json version 1.9.33 之工作樹,未提交未發布)
- 小輪 run01 之 9 項(主控任務 20261030143215,2026-10-30;package.json version 1.9.32 之工作樹,未提交未發布)
- 診斷輸出與遮罩之共用函數(R-DIAG-01)
- 計時器相關函數之觀察回調 `opt.onTrace`(R-TRACE-01,試行)
- fsWatchFolder 被監看資料夾本身消失之 unlinkDir 一次消失只派發一次(R-WATCH-ROOT-ONCE-01;排程第 238 項;ws265,2026-11-02)〔本節於 2026-11-02 新增,置於該檔最前〕

### `sgud/state/state_測試.md`(測試;新增於 2026-11-02)

查: 測試檔結構(測試檔互不 import、工具檔頂層不註冊)、全套案數一致、測試不得污染行程全域;真瀏覽器行為測試之基建(playwright-core、`browserKit`).所含節:

- 真瀏覽器行為測試之基建(R-TEST-BROWSER-01;排程第 642 項;t642,2026-11-25)〔本節於 2026-11-25 新增,置於該檔最前〕
- 全套案數一致與測試檔結構(R-TEST-STRUCT-01;排程第 254 項;ws265,2026-11-02)

### `sgud/state/state_dom與資料.md`(dom 與資料處理;約 21.5KB)

查: `*Dyn` 函數移除(XSS、UserAgent、dom 轉圖／看圖／Markdown 心智圖、Excel 讀寫)與其後續之瀏覽器端函數,及 DOM 函數必須參數遇非預期之失敗通道.所含節:

- 結構函數第三批:14 個函數依使用者逐函數裁定、儲存格文字表示法、arrDiff 逐格比對、帶時區時刻之驗證(R-ELEM-LEVEL-02、R-CELL-TEXT-01、R-DIFF-PAIR-01、R-TZ-WALL-01;排程第 430 項第三批;ws430c/ws430c2,2026-11-15)〔本節於 2026-11-15 新增,置於該檔最前〕
- 結構函數之元素層級與自有鍵:14 個函數依使用者逐函數裁定(R-ELEM-LEVEL-01;排程第 430 項第二批;ws430b,2026-11-14)〔本節於 2026-11-14 新增,置於該檔最前〕

- 字串取代之取代值字面化:`replace` 之 `r` 為字面文字、`replaceObj` 不再預先逸出 `$`、`src/` 全庫 67 站點盤點(R-REPLACE-LITERAL-01;排程第 427 項之 wsemi 部分;ws427 wsrep,2026-11-12)〔本節於 2026-11-12 新增,置於該檔最前〕
- 同步工具函數遇無效輸入之處置:C10 隨機範圍無效即 throw、C7 非數值結構運算之次參數無效回空值、C6 只補文件(排程第 426 項;使用者 2026-11-12 裁示;ws426,2026-11-12)〔本節於 2026-11-12 新增,置於該檔最前〕

- 差異比對子類修訂:`ltdtDiff` 不支援空物件列、`matDiff`／`arrDiff` 錯誤訊息改 invalid 格式(排程第 290 項;使用者 2026-11-12 裁示;ws290,2026-11-12)〔本節於 2026-11-12 新增,置於該檔最前〕
- 陣列與結構子類 6 個函數 `arrFilterByENum`／`arrReverse`／`arrSep`／`matConcat`／`matat`／`ltdtpull` 必須參數無效即 throw、空資料照常(排程第 286 項〔第 221 項 §11 第 6 項〕;ws286e,2026-11-03)〔本節於 2026-11-03 新增,置於該檔最前〕
- 空資料不是失敗:向量處理 `arrAdd`／`arrMulti`／`arrAccum` 空進空出、`arrProduct` 任一邊為空即 throw、5 個轉換函數(`ltdtkeys2mat`／`ltdtkeysheads2mat`／`ltdt2vrtsable`／`mat2ltdt`／`keysmat2ltdt`)狀態模式、`getCsvStrFromData([])`(排程第 286 項〔第 221 項 §11 第 6 項〕;ws286d,2026-11-03;更正第 221 項第二批第 15 項「空陣列亦 throw」)〔本節於 2026-11-03 新增,置於該檔最前〕
- 非計算類函數必須參數遇非預期:差異比對子類 5 個函數 `strDiff`／`strDiffToHtml`／`arrDiff`／`matDiff`／`ltdtDiff`(排程第 286 項〔第 221 項 §11 第 6 項〕;ws286c,2026-11-03)〔本節於 2026-11-03 新增,置於該檔最前〕
- 非計算類函數必須參數遇非預期:第二批 `getTimeRange`／`rep`／`replaceObj`／`replacePlus`／`sepInt`／`cfilesize` 與 5 處文件修正(排程第 286 項〔第 221 項 §11 第 6 項〕;ws286b,2026-11-02)〔本節於 2026-11-02 新增,置於該檔最前〕
- 非計算類函數必須參數遇非預期:第一類 4 個函數 `domIsFocused`／`domAppend`／`domPrepend`／`copyStrToClipboard` 與三個內部呼叫端(排程第 286 項〔第 221 項 §11 第 6 項〕第一類;ws286a,2026-11-02)〔本節於 2026-11-02 新增,置於該檔最前〕
- 移除全部 *Dyn 函數(使用者 2026-11-01 裁示;Gitea #44;主控任務 20261101202155 wsemi-rmdyn,2026-11-01;package.json version 1.9.39 之工作樹,未提交未發布)
- getUserAgent 之 UMD 晚載入(R-UMD-EXTERNAL-01;排程第 258 項;ws265,2026-11-02)〔本節於 2026-11-02 新增,置於該檔最前〕
