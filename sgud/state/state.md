# 狀態

本檔記 wsemi 各功能之**現況**(做到哪裡、對應之規則帳本條目與測試檔、已知缺口與待辦、最近一次驗證之版本);只記現況、不寫過程(過程見 `sgud/exp/experience.md`).

本檔 2026-10-28 新建;此前各功能之現況未逐一盤點入檔,以 `sgud/rule/rulebook.md` 各條目之「站點全集」「測試」「已知限制」「變更紀錄」為準.之後完成一項功能或結束一輪工作時於此增列或更新.

## 索引(哪類查哪檔)

### ws719 修正輪(2026-11-29,排程第 719 項;package.json version 1.9.83 之工作樹,未提交未發布)之現況:

- `sgud/state/state_檔案同步.md`(新增): `fsSyncFolder` 之反斜線轉換依平台、差異同步之落點核對(R-FS-SYNC-PATH-01)、測試與對拍數字、已知缺口;接續輪 ws719b(同日,同一版發布)增目標內連結與整份複製來源連結之拒收(R-FS-SYNC-LINK-01).

### wsr1 修正輪(2026-11-27,主控任務 20261127030143;package.json version 1.9.81 之工作樹,未提交未發布)之現況分在下列各檔,驗證數字(全套、發布包配置、變異、複審)見本輪報告與各檔:

- `sgud/state/state_時間判斷與轉換.md`(新增): 第 428 項判斷與轉換不經本機時間往返,同批小項(包裝物件、`getltdtkeys`).
- `sgud/state/state_診斷與遮罩_第2輪.md`(置於該檔最前): 第 650 項遮罩器內建 JSON 跳脫形、第 621 項之核實與 `UND_ERR_SOCKS`.
- `sgud/state/state_瀏覽器函數.md`(置於該檔最前): 第 647 項 `domDragPreview` 補回 canvas 與 select、`_domCloneFix`.
- `sgud/state/state_事件派發.md`(新增): 第 599 項② R-EVEM-RAW-01 之 21 站判定與 5＋2 站待辦.
- `sgud/state/state_測試.md`(置於該檔最前): 第 599 項③ R-JUDGE-SOURCE-01 守門測試.
- 文件整理: 第 599 項① `sgud/rule/rulebook_data.md` 依類型拆為本檔＋`rulebook_excel.md`＋`rulebook_filetype.md`;經驗檔 `sgud/exp/experience.md` 之 2026-11-12～11-25 之 17 節抽至 `experience_20261127.md`;破壞性變更紀錄另開 `rulebook_breaking_84on.md`(第 84 項).

### wsr2 修正輪(2026-11-27,主控任務 20261127030143,B 輪;與 wsr1 同一次發布;package.json version 1.9.81 之工作樹,未提交未發布)之現況分在下列各檔:

- `sgud/state/state_判斷與轉型.md`(置於該檔最前): 第 663 項批 11——62 個轉型／編碼／字串／時間字串轉換類函數之 opt 讀取不拋錯、state 模式 9 站訊息固定詞彙、fs 列舉同步 6 函數讀鍵拋錯視為未給、新增對外函數 `getOptReader`(有限數字判斷不收錄)、`o2j` 取回原因範例;驗證數字(全套 34245／8／0、發布包配置同、修前紅、變異、複審)與已知缺口.
- `sgud/state/state_檔案系統列舉.md`: 已知缺口③(同步函數讀 `opt.levelLimit` 等拋錯)已處置.
- `sgud/state/state_事件派發.md`(置於該檔最前): R-EVEM-RAW-01 之 7 站(未套 5＋部分 2)處置落實(6 站經 `evEmit`、1 站刻意不套)、規則 2 涵蓋 Promise 鏈與 microtask.
- `sgud/state/state_診斷與遮罩_第2輪.md`: `ERR_SSL_PROTOCOL_ERROR` 已移除(NODE 集合限以 Node 或 undici 實證之代碼).
- `sgud/state/state_測試.md`(置於該檔最前): R-C1-HOSTILE-01 之 AST 守門(`optReadScan`).
- 文件整理(A 輪需裁示 ⑤): `sgud/state/state_dom與資料.md`(約 37.9KB)依功能類型拆為本檔＋`state_結構函數.md`＋`state_非計算類函數參數.md`;`sgud/rule/rulebook_diag.md`(單節 R-DIAG-01,約 52.7KB)依規則類型拆為本檔(規則 1~12)＋`rulebook_diag_ext.md`(規則 13~22、盤點、限制)＋`rulebook_diag_log.md`(測試、變更紀錄);節號與標題不變、內容逐字搬移,逐行驗證缺 0(`state_dom與資料` 非空 77 行、`rulebook_diag` 非空 60 行,新增之行僅標頭與說明).破壞性變更紀錄第 85 項附於 `rulebook_breaking_84on.md`.

### wsr3 修正輪(2026-11-27,主控任務 20261127121903;package.json version 1.9.82 之工作樹,未提交未發布)之現況分在下列各檔(驗證數字見該輪報告):

- `sgud/state/state_時間判斷與轉換.md`(置於該檔最前): 第 675 項 `getTimeBetween`／`getTimeObject` 不經本機時間(`_tz.parseWallUnit`)、`timemsTZ2past`／`expire` 之天周月年改日曆差(`_calDayDiff.mjs`)、同機制盤點(`addMonth` 窮舉無缺陷).
- `sgud/state/state_判斷與轉型.md`(置於該檔最前): 第 676 項 38 站＋`j2o` 之 catch 改固定詞彙(R-CATCH-TEXT-01,規則檔 `sgud/rule/rulebook_catch_text.md`)、5 函數之 opt 讀取不拋錯.
- `sgud/state/state_診斷與遮罩_第2輪.md`(置於該檔最前): 第 678 項遮罩器內建兩層 JSON 跳脫形(R-DIAG-01 規則 23,含評估數據與成本上限).
- `sgud/state/state_外部程序三函數輸入檢測.md`(置於該檔最前): 第 681 項 `execProcessKillPid` 於 Windows 自行 `spawn(windowsHide)`(R-EXEC-WINHIDE-01).
- `sgud/state/state_測試.md`(置於該檔最前): 第 676、681 項之守門(`catchErrTextScan`、`cpHideScan`、`catchSiteKit` 故障注入).

### `sgud/state/state_時間判斷與轉換.md`(時間字串之判斷與轉換;約 6KB;新增於 2026-11-27)

查: `istime`／`istimems`／`isday`／`ismonth`／`istimeTZ`／`istimemsTZ` 之逐欄驗證、不帶時區之 7 個轉換函數與 `getTimeRange`、`day2cht`、`domShowInputDatatime` 直接取欄位、多時區矩陣測試、差分與變異數字、已知缺口.所含節:

- 判斷與轉換不經本機時間往返(排程第 428 項;wsr1,2026-11-27)〔本節於 2026-11-27 新增〕

### `sgud/state/state_事件派發.md`(事件派發;約 2KB;新增於 2026-11-27)

查: R-EVEM-RAW-01 之直接 `.emit(` 21 站之判定與待辦.所含節:

- R-EVEM-RAW-01 之站點逐站判定(排程第 599 項②;wsr1,2026-11-27)〔本節於 2026-11-27 新增〕

### `sgud/state/state_Excel讀取.md`(讀取 Excel;約 3KB;新增於 2026-11-26)

查: `getDataFromExcelFileU8Arr` 於 `fmt:'ltdt'` 保留表頭空白之欄位之 `opt.keepEmptyHeader`(預設 `false`、命名 `__EMPTY` 系、碰撞規則與真實表頭不改名、非布林視為未給)、對應之規則帳本條目(R-EXCEL-READ-01 規則 5、6)與測試、驗證數字、已知缺口(重複表頭另案,排程第 671 項;Gitea #221).所含節:

- `getDataFromExcelFileU8Arr` 新增 `opt.keepEmptyHeader`(排程第 670 項;t670,2026-11-26)〔本節於 2026-11-26 新增〕

### `sgud/state/state_檔案系統列舉.md`(fs 列舉函數之第 2 參數 opt;約 4KB;新增於 2026-11-26)

查: 10 個列舉函數(`fsTreeFolder`、`fsGetFilesInFolder`、`fsGetFoldersInFolder`、`fsTreeFolderWithHash`、`fsGetFilesWithHashInFolder` 及各 `*Core`)之第 2 參數由 `levelLimit` 改為 `opt`(未給 `opt.levelLimit` 即窮舉全部)、遷移期防護(第 2 參數非物件、第 3 個引數有給即報錯)、內部呼叫端與 `fsTask` 預設維持 1、驗證數字(修前紅／變異／全套／發布包配置)、`toolfp` bundle 之影響、已知缺口(排程第 667 項,Gitea #220).所含節:

- fs 列舉家族之第 2 參數由 `levelLimit` 改為 `opt`(排程第 667 項;t667,2026-11-26)〔本節於 2026-11-26 新增〕

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

### `sgud/state/state_結構函數.md`(結構函數:元素層級、儲存格文字表示法、差異比對、空資料、陣列與結構子類;約 18.4KB;2026-11-27 wsr2 自 `state_dom與資料.md` 抽出)

查: 結構函數第三批(14 函數儲存格文字表示法、arrDiff 逐格比對、帶時區時刻之驗證)、結構函數之元素層級與自有鍵(14 函數)、差異比對子類修訂、陣列與結構子類必須參數、空資料不是失敗之現況.所含節(節號與標題不變、逐字搬移):

- 結構函數第三批:14 個函數依使用者逐函數裁定、儲存格文字表示法、arrDiff 逐格比對、帶時區時刻之驗證(排程第 430 項第三批;ws430c/ws430c2,2026-11-15)
- 結構函數之元素層級與自有鍵:14 個函數依使用者逐函數裁定(R-ELEM-LEVEL-01;排程第 430 項第二批;ws430b,2026-11-14)
- 差異比對子類修訂:`ltdtDiff` 不支援空物件列、`matDiff`／`arrDiff` 錯誤訊息改 invalid 格式(排程第 290 項;ws290,2026-11-12)
- 陣列與結構子類 6 個函數 `arrFilterByENum`／`arrReverse`／`arrSep`／`matConcat`／`matat`／`ltdtpull` 必須參數無效即 throw、空資料照常(排程第 286 項;ws286e,2026-11-03)
- 空資料不是失敗:向量處理、5 個轉換函數狀態模式、`getCsvStrFromData([])`(排程第 286 項;ws286d,2026-11-03)

### `sgud/state/state_非計算類函數參數.md`(非計算類函數必須參數遇非預期、同步工具函數遇無效輸入;約 13.6KB;2026-11-27 wsr2 自 `state_dom與資料.md` 抽出)

查: 非計算類函數(差異比對 5 函數、`getTimeRange`／`rep`／`replaceObj`／`replacePlus`／`sepInt`／`cfilesize`、`domIsFocused`／`domAppend`／`domPrepend`／`copyStrToClipboard`)必須參數遇非預期之現況,及同步工具函數遇無效輸入之處置(C10、C7、C6;排程第 426 項).所含節(節號與標題不變、逐字搬移): 非計算類函數必須參數遇非預期之第一類、第二批、差異比對子類 3 節(排程第 286 項;ws286a／ws286b／ws286c,2026-11-02～03);同步工具函數遇無效輸入之處置(排程第 426 項;ws426,2026-11-12).

### `sgud/state/state_dom與資料.md`(dom 與資料處理;約 7.1KB;2026-11-27 wsr2 拆檔後,原約 37.9KB)

查: `*Dyn` 函數移除(XSS、UserAgent、dom 轉圖／看圖／Markdown 心智圖、Excel 讀寫)與其後續之瀏覽器端函數、字串取代之取代值字面化(`replace`／`replaceObj`,R-REPLACE-LITERAL-01).所含節(結構函數與非計算類函數各節已移至上列二檔):

- 字串取代之取代值字面化:`replace` 之 `r` 為字面文字、`replaceObj` 不再預先逸出 `$`、`src/` 全庫 67 站點盤點(R-REPLACE-LITERAL-01;排程第 427 項之 wsemi 部分;ws427 wsrep,2026-11-12)〔本節於 2026-11-12 新增,置於該檔最前〕

- 移除全部 *Dyn 函數(使用者 2026-11-01 裁示;Gitea #44;主控任務 20261101202155 wsemi-rmdyn,2026-11-01;package.json version 1.9.39 之工作樹,未提交未發布)
- getUserAgent 之 UMD 晚載入(R-UMD-EXTERNAL-01;排程第 258 項;ws265,2026-11-02)〔本節於 2026-11-02 新增,置於該檔最前〕
