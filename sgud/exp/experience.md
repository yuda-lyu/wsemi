# 累積經驗

本檔為執行工作時特有之累積經驗,留給後續之嘗試、執行與判斷,由agent自行編列、擴充與維護.

## 已抽出之舊經驗(索引)

2026-10-28(wsemi-run08)依全域設定§14整理: 本檔原約 82.4KB,將 2026-10-06 至 2026-10-21 之 30 節(約 56.4KB)抽出至 `sgud/exp/experience_20261028.md`(節號與標題不變、內容逐字搬移),本檔只留 2026-10-28 起之 6 節.需要久遠經驗時調閱該檔.被抽出之節:

- 修退化先追既有原則,只補壞掉的型別(2026-10-06)
- 寫檔工具會改寫跳脫字元(2026-10-06、2026-10-10 兩次)
- 時區測試(2026-10-06)
- hucre 與測試用 xlsx(2026-10-06)
- 評估第三方「更全面」之前先讀其原始碼(2026-10-10)
- 真瀏覽器驗證之借用環境(2026-10-06)
- js-xss 之解析模型與瀏覽器不同, 以其回呼做偵測須補洞(2026-10-11)
- 驗清洗函數之安全性: 以瀏覽器解析器批次檢查, 含切兩欄拼接(2026-10-12)
- 驗「釋放後不撐住行程」之量測時點(2026-10-13)
- 會漏計時器之缺陷, 紅燈測試要能自行結束(2026-10-13)
- 執行外部程序之失敗回報: 探測與替身法(2026-10-13)
- 修前紅、修後綠之驗證法(不用 stash/checkout, 2026-10-13)
- promise 包裝與佇列之 settle 審計(2026-10-14)
- 執行外部程序之命令解析、cwd 與回調(2026-10-14)
- 比較候選修法之紀律(2026-10-14)
- 派工套用原型與審查(2026-10-14)
- 大批實作之分工與閘門(2026-10-14, run04)
- 套件升版之供應鏈檢查流程(2026-10-06)
- fs 系失敗出口之真實觸發法與探測架構(2026-10-16, run01 fs 審計)
- 另案彙整之審計(2026-10-16, run01)
- 大範圍實作之分組與第二輪補修(2026-10-16, run02)
- lodash 陣列樣迭代與帶 length 鍵之物件(2026-10-17, R-OBJ-ITER-01)
- E2 八項與第 51 項之實作(2026-10-17, run02)
- cvOrmFind 之實作、測試與外審(2026-10-17, 第33項批0)
- jsdoc 發布與 BigInt 字面值(2026-10-17, cvOrmFind 第 2 次執行)
- cvOrmFind 品牌物件檢查與 Proxy(2026-10-17,wsemi 第 1 次執行)
- clearXSS 走訪重寫與三位外審(2026-10-20,第 62 項 run02)
- getFileType 對照表擴充與不分大小寫(2026-10-20,Gitea issue #7)
- ORM 字串良構檢核(chkOrmStr/chkOrmData/案例表)之實作經驗(2026-10-20,第 66 項批 0)
- 方言中立 IR `lowerFind` 移入 wsemi 與 toctou 補案之經驗(2026-10-21,第 94 項第①步)

2026-10-29(wsemi-run10)再整理: 本檔原約 37.6KB,將 2026-10-28 之 6 節(約 26.1KB)抽出至 `sgud/exp/experience_20261029.md`(節號與標題不變、內容逐字搬移),本檔只留 2026-10-29 起之節.被抽出之節:

- 帶期望雜湊之下載 `fsDownloadFileVerify` 之實作與測試(2026-10-28,第 148 項前半 wsemi-run01)
- `fsDownloadFileVerify` 第三方完整複核與修正之經驗(2026-10-28,wsemi-run03)
- `fsDownloadFileVerify` 補第三方複核之經驗(2026-10-28,wsemi-run02)
- 共用外部執行檔取得 `fsEnsureBins` 之實作與外審(2026-10-28,wsemi-run04)
- 計時器相關函數之觀察回調(opt.onTrace)試行與負載試驗(2026-10-28,wsemi-run06)
- 觀察回調全面套用第 1 輪(dom/pm/cache 系,2026-10-28,wsemi-run07)

2026-10-31(診斷通報輪)再整理: 本檔原約 34.3KB,將 2026-10-29 之 6 節(約 22.1KB)抽出至 `sgud/exp/experience_20261031.md`(節號與標題不變、內容逐字搬移),本檔只留 2026-10-30 起之節.被抽出之節:

- 觀察回調全面套用第 2 輪(fs 系,2026-10-29,wsemi-run08)
- 觀察回調全面套用第 3 輪(最末輪: exec 系、下載/取得、dom 系,2026-10-29,wsemi-run09)
- 檔案組、主幹模式之退路與重取、網址判定收緊(2026-10-29,wsemi-run10)
- 診斷輸出與遮罩之共用函數(2026-10-29,diag-run02)
- 診斷遮罩之發布前第三方複核(2026-10-29,diag-run03)
- 診斷遮罩之發布前收斂輪(2026-10-29,diag-run04)

2026-11-02(ws265)再整理: 本檔原約 41.3KB,將 2026-10-30 至 2026-10-31 之 6 節(約 23.9KB)抽出至 `sgud/exp/experience_20261102.md`(節號與標題不變、內容逐字搬移),本檔只留 2026-11-01 起之節.被抽出之節:

- 查詢埠之監聽者(2026-10-30,主控任務 20261030064553 run01)
- 小輪 9 項(2026-10-30,主控任務 20261030143215 run01)
- 診斷通報輪(2026-10-31,主控任務 20261031121854,排程第 212、207① 項)
- 專用判斷函數 isenum／iseint 與 preciseNum 精度(2026-10-31,主控任務 20261031121854,wsemieff)
- 既有函數改用 isenum／iseint 第一批(2026-10-31,主控任務 20261031121854,wsemi221a)
- opt 類數值參數第一級發布 A:自完成版備份切分(2026-10-31,主控任務 20261031121854,wsemiA)

2026-11-02(ws272c)再整理: 本檔原約 38.7KB,將 2026-11-01 之 4 節(約 13.5KB)抽出至 `sgud/exp/experience_20261101.md`(節號與標題不變、內容逐字搬移),本檔只留 2026-11-02 起之節.需要久遠經驗時調閱該檔.被抽出之節:

- fsEnsureBins 支援壓縮檔類型 tgz(2026-11-01,主控任務 20261031175415,wsemi-tgz,Gitea #32)
- 自 srcRunner 移入 4 件:顯式時區時鐘、結果走 JSON 檔之 CLI 執行、原子寫檔、失敗摘要(2026-11-01,主控任務 20261101152333,wsemi41,Gitea #41)
- wsemi41b 修正輪:對照原測試修三處「推定」(2026-11-01,主控任務 20261101152333)
- 移除全部 *Dyn 函數(2026-11-01,主控任務 20261101202155,wsemi-rmdyn,Gitea #44)

## 整理 sgud 與 4 項待辦:偶發多一筆 timer、全套案數不一、UMD 晚載入、fs 無效路徑(2026-11-02,主控任務 20261102014123,ws265)

- **sgud 整理手法**: 以節為單位(`## ` 起算)用腳本搬移,只搬不刪;驗法為「原檔每一行(多重集合,空行除外)皆仍存在於新檔集合」缺漏 0、搬移段於新檔內逐字包含、新檔無裸 LF(原檔為 CRLF).經驗檔依日期抽出(`experience_<年月日>.md`,索引補一段)、狀態檔依功能類型拆(`state_<類型>.md`,`state.md` 只留索引);引用 `state.md` 之處(`rulebook_trace.md`)同步.教訓: 原備份先存 `./tmp/` 再改;腳本以標題比對歸類並斷言「無未歸類之節」,新增節時不會悄悄漏掉.
- **「偶發」要先量失敗率再找成因,量不到時用機制重現**: `fsWatchFolder` 之 frozen events 案單案連跑 300 次、整檔連跑 80 次、CPU 壓力 8 行程連跑 80 次(`loadTrial`)皆 0 失敗,自然重現不到(主控 10-31 記 2.5%,環境當時另有他人負載).改查主控記錄之失敗指紋 `['watcher','timer','timer']`,推得成因後以**機制**證明: ①Node 計時器之順序——`setInterval` 回呼內先被阻塞超過 interval 再建立 `setTimeout(…, 1)`,下一次 interval 先於該 timeout(實測 5/5;未阻塞時 timeout 先 5/5;原因是 interval 以回呼**開始前**之時刻重排、`setTimeout` 以**建立當下**之時刻計);②於 `onTrace` 內以 `Atomics.wait` 同步阻塞超過 `timeInterval` 一次(`fsWatchKit.blockLoop`),可重現地使下一次輪詢先於延後 1ms 之 `unWatch`,修前 3 案紅、修後綠、變異 7 項全擊殺.這是負載試驗之「事件迴圈阻塞」之精準版,斷言只看事件內容與次數.
- **`mocha --parallel` 之案數不一,先查「測試檔被別的測試檔 import」**: ESM 模組快取使被 import 之 `*.test.mjs` 頂層 `describe` 只在各 worker 行程第一次載入時註冊;案數 = 基準 + 3×(分到該批檔案之 worker 數 − 1)(7 檔 `--jobs N` 實測 25/28/31/…/43,`--no-parallel` 25).用 `--parallel --jobs N` 跑相關檔之矩陣(每 N 5 次,約 20 秒)即可證實,不必跑全套;全套連跑只作修後之一致性驗證.共用輔助放 `test/tools/`(不帶 `.test.` 中綴),以 `test/testStructure.test.mjs` 靜態掃描(含 pattern 之正反例;樣本字串以執行時組成,否則掃描會掃到自己).
- **UMD 之順序測試**: 以 `w-package-tools` 之 `rollupFile`(不給 `fdTar` 為回傳程式碼模式,`bMinify:false`、`targets:'new'`,約 3 秒)把單一 src 檔於記憶體打包成 UMD,再於 `vm.createContext` 之新環境(`self`／`window` 指向頂層物件、無 `require`／`module`)依序載入真實第三方 UMD 與該 UMD;比整包建置快且不寫 `dist/`.ua-parser-js 瀏覽器版只掛 `window.UAParser`(建構子本身無 `UAParser` 屬性),故「先載入」時 `import` 進來之屬性存取得 undefined、落到全域回找;「晚載入」時因子本身 undefined,屬性存取即拋.`getGlobal()` 於無 `self`／`window`／`global` 回 `null`,取全域屬性須用 `get`.
- **fs 無效路徑之探測法**: 對 73 個站點×84 參數位置,在**子行程之夾具資料夾(cwd)**內逐呼叫重建夾具,餵 11 種無效值,記錄回傳形態與夾具之增刪(副作用快照差);不在 mocha 行程內做,因 `''` 可能被解成工作目錄(`fsCopyFolder(src, '')` 真的把內容複製進 cwd).探得之非顯而易見缺陷: `fsReadText(0)` 讀到 stdin(數字為檔案描述子)、`fsMergeFiles` 逐片處理到無效項才發現而前面切片已被刪、`fsTask` 無效路徑仍建立 `./_tkfs`、Node 之錯誤訊息回顯輸入值(含 NUL 字串原樣).修法: 單一擁有者 `src/_chkFsPath.mjs`,各 Core 入口檢查,依各函數之失敗通道回報;測試以站點表(`test/tools/fsPathSites.mjs`)× 無效值表驅動,另以完整性案(新增 `src/fs*.mjs` 未列入站點表或排除名單即紅)防漏.
- **批次改檔之工具坑**: CRLF 檔(src 與帳本多為 CRLF,test 多為 LF)用 Edit 工具改多行會混入 LF,一律改以 `tmp/` 腳本讀入、依檔案 EOL 轉換 from／to、斷言命中恰一次、寫前驗裸 LF 為 0(`patch-fs.mjs` 等);變異驗證腳本(`mutate.mjs`)同樣依 EOL 套變異,備份後逐一還原並以內容比對回驗.長時連跑(整檔 200 次約 43 分)期間,不得改動該測試依賴圖內之 src(以 import 遞移閉包腳本列出),其餘檔可先套,依賴圖內者待連跑結束.
- **新增之測試污染同一 worker 之後續測試**: 首次最終碼全套連跑 3 次,2 次紅於既有之 `maskDiagErr` capi #14(`r === e` 而 stack 仍含秘密),單檔與 CPU 壓力皆不紅.二分: `mocha --no-parallel test/getUserAgentUmd.test.mjs test/maskDiagErr.test.mjs` 同一行程相接即可重現;對 `w-package-tools` 之各相依逐一「只靜態 import」皆不紅(0/3),在 mocha 內探測打包前後之 `Error` 全域,得「打包**執行期間** `Error.prepareStackTrace` 被換成 `stackTraceRewriter` 且不還原」(`stackTraceLimit` 於獨立 node 行程 import 後由 10 變 16,但 mocha 內本為 Infinity 而無變——我先前據此誤以為是 stackTraceLimit,變異證明該還原於 mocha 內等價).修法: 動態 import 並於打包後 `finally` 還原;加一案釘住,並寫入 R-TEST-STRUCT-01 規則 4.教訓: ①全套連跑 3 次是必要的,新增會載入重型相依或改全域之測試檔,其影響只在 `--parallel` 同一 worker 之後續檔案現形,不是單檔或壓力可測出;②判污染源以「同一行程相接 A B」重現,不要以為只有載入時之副作用——執行時之副作用要在執行後量;③探測假說(如 stackTraceLimit)要在實際之 runner(mocha)內量,獨立 node 行程之結果會誤導.

## 已知缺陷先修:7 個函數之整數輸入(2026-11-02,主控任務 20261102112347,ws270)

- **「修前紅」要對修前會卡死之輸入設防,否則紅燈那一跑就卡住**: 第一次對 HEAD 副本跑新測試,卡在 `arrSep(a8, 'Infinity')`——修前原碼於 mocha 行程內**同步**死迴圈(`for (j < 'Infinity')` 內層永不結束),mocha `--timeout` 無法中斷同步迴圈,10 分鐘未結束(`quiet-run` 轉背景).教訓: ①凡修前會不終止之輸入(`Infinity`、`'Infinity'`、超過個數上限、`chunkSize` 0／負數)**一律走子行程**(`runChildCase`＋`execArgv ['--max-old-space-size=64']`＋逾時 8 秒;無限配置者數秒內 OOM 離開碼 134,無限迴圈者被 SIGTERM),不在 mocha 行程內跑;②Blob 版雜湊之 `chunkSize` 用「記錄 `slice` 範圍之 Blob 子類＋暴走防護(slice 超過 N 次即拋錯)」作行程內觀察值,使修前之不終止成為紅燈而非卡死;③卡住時以 `TaskStop` 停背景工作後,務必另查孤兒行程(PowerShell `Get-CimInstance Win32_Process` 比對 CommandLine,**主控之 `dispatch.mjs`／`wait-runs.mjs` 行程不是自己的,不動**)並跑 `quiet-run --release-stale --cwd <套件根>` 回收測試鎖(實測回收了被中斷之持有者).
- **子行程結果用 JSON 傳遞時,`NaN`／`Infinity` 會變成 `null`,與失敗通道之 `null` 混淆**: `bufRead(b8, 0, true, Infinity, 8)` 修前回 `NaN`,序列化後成 `{ret:null}` 而讓「應回 null」之案修前亦綠(假綠);執行器對數字結果以 `serNum` 把非有限值記成字串.凡以 JSON 回傳數值之子行程案都要查這點.
- **盤點之「推導」與實測不同,要實跑**: 盤點清單對 `bufRead` 只寫「`nBytes=0`、`mLen` 過大:位移失真(推導)」,實跑得 `nBytes`／`mLen` 為 `Infinity`／`MAX_SAFE_INTEGER` 時位元組迴圈**不終止**(`mLen` 為 `Infinity` 則回 `NaN`),`offset + nBytes` 越界時回 `NaN` 或失真數值;加子行程案後才釘住.
- **等價變異要分辨,不是未擊殺就補測試**: 變異 31 項中 4 項未被擊殺皆為等價——`sepInt`／`addMonth` 之 `Number(x)` 與 `arrSep(numGroup)` 之 `Number(x)`(JS 對 `'3'`、`' 3 '`、`'1e0'` 於 `<`、`-`、`/`、`dayjs.add` 皆強制轉型,結果不可觀察;保留是為了遵守「檢測之值即使用之值」之 K4 一致寫法),`bufRead` 之 `nBytes` 個數上限(`offset + nBytes <= length` 先擋了).報告要把它們列為等價並附理由.變異腳本於 CRLF 工作樹(`git ls-files --eol` 為 i/lf、w/crlf)不可把 `\n` 寫進比對字串(命中 0 次),比對字串只取單行片段.
- **修前修後差分(L3)**: 有效輸入域(整數型、不含數字字串／Infinity／越界)以可重現亂數對 HEAD 副本與修後逐列比對,`bufRead` 用隨機位元組與隨機(offset、mLen、nBytes)版面(約 8 萬列)與 float32／float64 位元樣式(各 10 萬列,含次正規數、±Infinity、NaN),0 差異;eLen > 30 之版面(指數位數過多,位移溢位)兩版皆失真,不比對.eslint 之 `no-loss-of-precision` 會擋測試內之長小數字面值(`123456789.123456789`),改寫為可精確表示者.
- **全套案數與基準**: 修前 23011 passing／6 pending(ws265 最終碼記錄),修後 23482／6,增 471＝8 檔現有 574 案減原 103 案(6 個既有檔),與兩邊獨立計得之數相符(每次增補測試後須重核此差);全套連跑耗時僅約 2 分鐘.
- **已知殘餘**: `addMonth` 之結果年份超出 0~9999 仍輸出字串(`'10353-05'`、`'-6314-09'`);`ismonth('Invalid Date')` 為 true(`ismonth` 以 `ot(v).format(ft) === v` 判定,`'Invalid Date'` 格式化後仍等於自身);`bufRead` 之 `eLen > 30` 位移溢位.皆列待裁示,未改.

## 第二批第 2 輪「計時與流程類」19 個函數(2026-11-02,主控任務 20261102123434,ws272a)

- **「只與時間差比較」vs「交給計時器」要逐參數讀碼,不照清單抄**: 清單把 `alive.timeAlive`、`cacheSt.timeExpire` 寫成 `use:'timer'`,但讀碼知二者只與 `Date.now() - time` 比較(`t > timeAlive`),不交給 `setTimeout`/`setInterval`;若照抄,>24.8 天之值變成預設 10 秒／30 分,與意圖相反.判準同 `setTimeoutHp`(規則 8): 值進原生計時器(含 `spawnSync` 逾時、chokidar)才加 `timer` 上限.`debounce`／`pmDebounce` 之 `ms` 亦同(偵測週期固定 10／20 ms).
- **探針法(不靠真實等待)**: ①值交給計時器者: `stubTimers` 暫換 `setTimeout`/`setInterval` 記錄毫秒(`async` 函數內才建立計時器者用 `stubTimersAsync` 並 `await flush()`,flush 用模組載入時保存之真實 `setImmediate`);②只與時間差比較者: 假 `Date.now`＋**二分搜尋**求「過了多久才算超過」之最小整數(判定為 `>` 故門檻 = 值 + 1),起算時刻取正數(快取等以 truthy 判時間,0 會被當未設);③個數類: 手動呼叫攔截下來之 interval 回呼逐輪推進直到 reject,從訊息 `exceeded attemptNum[N]`／`timeout (Nms)` 讀值,或用 `mock.timers`(只換 `setTimeout`)逐 1000 ms 推進 `cacheBd` 並讀 `onTrace` 之 `poll` 事件;④並行上限: 推入 12 個任務數同時進行者(12 即 0=不限).`pmQueue` 之任務於 `message` 處理內先 `await delay(1)` 才執行,以真實 `setImmediate` flush 看不到,須以假 `setTimeout` 每輪 `tick(1)`;`queue.get()` 回傳 falsy 視為無消息,測試消息不可從 0 起.
- **內層函數再檢測會遮蔽外層規則之變異**: `pmQueue` 把已檢測之 `takeLimit` 交給 `queue`,`queue` 又檢測一次;把 `pmQueue` 之規則改為收小數,觀察到之並行上限不變(小數被內層拒為 0)而變異存活.以「`opt.debug` 時每個非預期之輸入警告恰一次」(`defineWarnEach`)殺死(外層放行則該小數不警告).凡「已有效之值再轉交下一層」者,結果類斷言抓不到外層規則,要補警告計數案.
- **修前會卡之輸入走子行程且要涵蓋「等 24.8 天」型**: 不只無限迴圈,`Infinity` 被夾成 2147483647 而「等 24.8 天」的 `delay`／`evEmitDelay`／`pmTimeout`／`fsWatchFolder` 之輪詢亦屬卡死;子行程案 14 個(`delay`、`waitFun`×2、`debounce`、`pmDebounce`、`evEmitDelay`、`pmTimeout`、`alive`、`cacheSt`、`cacheBd`〔`mock.timers` 無輪數上限〕、`fsDeleteFile/Folder`〔注入永遠 EBUSY 之 fs〕、`fsWatchFolder`〔真實 chokidar,以 `onTrace` 的 `watch` 事件為同步點〕),對 HEAD 全數逾時(SIGTERM,每案 12 秒).
- **變異腳本在 CRLF 工作樹**: 比對字串含 `\n` 者命中 0 次(`BAD-PATTERN`,不可當成存活);本輪腳本對命中次數不為 1(或未標 all)者標 BAD-PATTERN 而非跑,避免「沒套到變異卻判存活／殺死」.
- **全套案數基準**: 修前(ws270 最終碼)23482 → 修後 25045,增 1563＝新檔 1549＋14;本輪新增之測試檔暫換 `Date.now`／`setTimeout`／`mock.timers`／`globalThis.document`,一律 `finally` 還原,全套連跑 3 次(見報告)確認不污染同 worker 之後續檔.
- **工具坑**: Bash 守門連 `cd /dev/null` 也擋(習慣性手滑);`quiet-run` 的指令經 cmd 執行,`node_modules/.bin/mocha` 路徑不可用,改 `node node_modules/mocha/bin/mocha.js`.

## 第二批第 2 輪「字串、陣列、數值、編碼類」19 個函數＋3 項缺陷(2026-11-02,主控任務 20261102123434,ws272b)

- **紅燈(對修前碼)要逐檔獨立 mocha 行程,且「共用無效矩陣」不可含修前會卡死／OOM 之值**: 第一次把全部新測試一起丟給 HEAD 副本,先卡在 `bufWrite(1.5, b, 0, true, Infinity, 8)`(修前位移迴圈 `for (; mLen >= 8; … mLen -= 8)` 對 `Infinity` 永不終止,mocha 同步卡死 10 分鐘,以 `TaskStop` 停掉背景 `quiet-run`);修掉後第二次又在 `repObj({a:1}, 4294967296)` 崩潰(`FATAL ERROR: invalid table size … heap out of memory`,離開碼 134:修前 `ispint` 通過後 lodash `times` 配置 `Array(4294967295)`),整個 mocha 行程死掉而後面檔都沒跑.做法: ①任何「參數進迴圈／配置」的函數(`genID`、`rang`、`Ndp` 系、`bufWrite`、`repObj`),`Infinity`／`2**53`／4294967296 這類值一律放子行程(`runChildCase`＋`--max-old-space-size=256`＋逾時 12 秒),進程內矩陣以 `huge(v)` 濾掉;②紅燈用腳本逐檔各開一個 mocha 行程(`tmp/ws272b/runRed.mjs`),崩潰只影響該檔;③事先在 HEAD 副本用 `node` 小腳本逐值試呼叫(附逾時)比盲跑便宜.
- **清單的「無可觀察差異」要實測**: 清單稱 `arrNorm:56` 改 `isenum(r)` 無差異(「`arrProduct` 溢位時已回 null」),實測修前 `arrNorm([1e154,1e154])` 回 `Infinity`、修後 `null`——是新測試案(溢位)在紅燈跑時意外變紅才發現.凡清單標「一致性、無差異」者也寫一個會區分的案(取最大值、溢位),跑修前紅.
- **獨立對照(oracle)勝過快照**: `bufWrite` 以 Node `Buffer.write{Float,Double}{BE,LE}`、BigInt 參考編碼器(非標準尺寸)、`str2sha` 以 Node `crypto` 逐值對照.修前演算法對 20 萬個隨機單精度值皆與 Node 一致,但**恰在兩可表示值正中間**(如 `16777217`)向上捨入差 1 ulp——只有拿 Node 當對照且刻意造正中間值才現形;修法 `Math.fround`(捨入至最近偶數)後 2 的冪邊界、正中間值掃描 1.8 萬餘值全等.差分腳本若用 31 位元 LCG 產生尾數,位數少而大量落在正中間值,102 列差異全為此類(逐列以 Node 判定誰對,而不只比修前修後).
- **dayjs 與日期判斷的坑**: ①`ot(v, ft).format(ft) === v` 對無效日期恆等(`format` 回 `'Invalid Date'`),輸入恰為 `'Invalid Date'` 即 true;TZ 版去除時區後同(`'Invalid DateZ'`);修法 `isValid()`.②`'YYYY-MM'` 解析 0000~0099 年時 dayjs 依 JS `Date` 兩位數年規則對映 1900~1999,故 `ismonth('0099-12')` 為 false,但 `add(-1200, 'months')` 的**結果**可有年份 0~99 且 `format` 為 `'0000-01'`;`addMonth` 因此以 `a.year()` 判 0~9999,不以 `ismonth(結果)` 判(後者會誤殺合法結果).③`isDate` 為寬鬆判斷,V8 舊式日期解析器會忽略未知字詞(`new Date('Invalid Date.000')` 為有效日期),`isDate('Invalid Date.000')` 為 true,不屬同型缺陷.
- **等價變異分辨(84 項,擊殺 78,存活 6 皆等價)**: `arrInsert` 之 `ind = Number(ind)` 移除(`slice` 與 `>` 對數字字串強制轉型)、`arrPullAt` 陣列分支把 `index` 範圍放寬為 `safe`(lodash `pullAt` 對負數／超長索引為無動作)、`rang` 之 `rEnd = Number(rEnd)` 移除(減法強制轉型)、`bufWrite` 之 `mLen`／`nBytes` 放寬為 `safe`(後續 `mLen >= nBytes*8-1`、`offset + nBytes > length`、`eLen > 30` 三道檢查已涵蓋,縱深防禦)、`bufWrite` 之字串 `Number(value)` 移除(算術強制轉型).另:`str2sha` 的 `n = Number(n)` 不是等價——數字字串 `' 256 '` 若不取值,`haskey(kpSha, ' 256 ')` 失敗,需有「前後空白數字字串」案才殺得死;`pmTimeout` 的 `ms = Number(ms)` 為 ws272a 範圍,本輪不重做.
- **全套案數**: 25045(ws272a 最終碼)→ 26813,增 1768＝新檔 1591(`optValG6strArrNum` 958＋`bufIeee754` 474＋`isInvalidDateStr` 153＋`intInputHangG6` 6)＋既有檔增 177(字串 4 檔 +110、`rep` +31、`repObj` +25、`addMonth` +9、`pmTimeout` +2);以 `mocha --dry-run --reporter json` 對 HEAD 與工作樹逐檔計得(`tmp/ws272b/countCases.mjs`),與全套相符.
- **格式**: 新寫檔用 Write 為 LF(索引為 LF,working tree 有 `LF will be replaced by CRLF` 警告,不影響 git);Edit 改動之 CRLF 檔保留 CRLF,多行 `old_string` 可用.

## 第二批第 2 輪「DOM 類、`_optNum` 退役、`fsTask`」＋ws272b 回報後續 6 項＋sgud 拆檔(2026-11-02,主控任務 20261102123434,ws272c)

- **無法於 Node 載入之前端模組的測法(`test/tools/domStubKit.mjs`)**:`domShowImages`(viewerjs 與其 css)、`domTooltip`(tippy.js 與其 css)匯入 `.css` 在 Node 拋 `Unknown file extension`;`@zumer/snapdom` 可載入但須觀察傳入的 `scale`.作法:`node:module` 的 `register()` 註冊 resolve／load 掛鉤,**只對以 `?stub=N` 查詢字串載入的 src 模組生效**(`context.parentURL.includes('?stub=')`),`.css` 換空模組、`viewerjs`／`tippy.js`／`@zumer/snapdom`／`./domShowInputAndGetFiles.mjs` 換記錄呼叫之替身;其餘測試載入真模組不受影響,不新增依賴.**陷阱**:替身模組須在**呼叫當下**才取記錄物件(`let S = () => globalThis.__x`),若載入時取一次(`let S = globalThis.__x`),之後 `resetStub()` 換新物件即記不到(曾因此 138 案全紅).`isEle` 走 lodash `isElement`,假元素須為 class 實例(plain object 不過).
- **dayjs 兩位數年份對映**:`dayjs('0050-03-04')` 內部走 `new Date(50, 2, 4)`,JS 把 0~99 年對映為 1900~1999(得 1950),含時區後綴之 ISO 字串(`new Date('0050-…+08:00')`)則正確.不能只讓 `ismonth` 等判斷放行,否則依賴它的 20 餘個轉換函數會**靜默變成 1950**(比回 `''` 更糟);解法:單一包裝 `src/_dayjs.mjs`(年份 0000~0099 之標準寫法字串以 `Date.setFullYear`／`setHours` 建立再交 dayjs),27 個模組換 import.古年份本地時間含 LMT 偏移(Asia/Taipei 為 +08:06),測 `timemsTZ2past` 時用同一牆上時刻(中午)比較,不受主機時區使本地日期差一日之影響.預言用純整數曆法(閏年規律 0000、0400 閏、0100 非閏),不依 dayjs 與 `Date`.
- **變異證明抓到的測試缺口**(首輪 133 項存活 10,其中 3 為等價):①以 `Math.round(remainMs / 1000)` 觀察 `totalMs` 使 `600000` → `600001` 之變異存活 → 暫時凍結 `performance.now`(Core 於呼叫時取用),`remainMs` 恰等於 `totalMs`;②`rang` 的 `dx` 有限檢查被結果有效性檢查涵蓋而存活,但它擋「`num` 為 4294967295 時逐次累加至耗盡記憶體」→ 加子行程案(`intInputHangG6Runner` 的 `rang-overflow-huge-num`);③換回 `import ot from 'dayjs'` 之變異,`getTimeRange`／`timemsTZ2expire`／`getTimeObject`／`domShowInputDatatime` 存活——**兩端同在 0000~0099 年時對映一致,結果相同**,須有跨 0099／0100 邊界(或對照真實年份)之案才殺得掉.等價變異:`domTooltip` 的 `ts = Number(ts)`(`ts -= 1` 本會轉型)、`fsTask` 的 `levelLimit` 下限 1 → 0(下游 `fsTreeFolderCore` 亦把非正數視為預設 1)、`_dayjs` 缺日時預設 1 → 2(月格式與日無關).
- **修前紅取證的副本作法**:`git archive HEAD src | tar -x -C ./tmp/ws272c/head` 與 `cp -r src ./tmp/ws272c/base/src`(動工前工作樹,含 ws272a／ws272b),把 `test/tools` 與要驗的測試檔複製進副本 `test/`,以 `quiet-run --cwd <副本>` 執行(`../src` 即指向副本).mocha 失敗數超過 255 時離開碼固定 255,紅案數改由 log 的 `N) describe` 行彙總(`tmp/ws272c/tallyFail.mjs`).
- **全套約 1.5 分鐘**(`mocha --parallel`,28000 案級):本輪全套 1m36s,無排鎖等待;前輪記「排鎖等待 20~48 分」屬他套件佔鎖.改完一個大類即可跑全套,不必只靠逐檔.
- **行尾**:Edit 工具對 CRLF 檔做多行 `new_string` 會夾入裸 LF(混合行尾);本輪以 `tmp/ws272c/normEol.mjs` 於最後統一(檔內出現過 CRLF 者全轉 CRLF),並以 `git ls-files --eol` 驗無 `mixed`.sgud 拆檔用腳本讀入、依錨點行切段、寫後驗「搬移行 + 主檔保留行 = 原檔全部行」逐行相等(`tmp/ws272c/splitSgud.mjs`).

## 第二批第 3 輪「interp1、arrGroupByMaxmin、arrLookupByMaxmin、strTruncate＋domFadeIn」(2026-11-02,主控任務 20261102171617,ws271)

- **「元素以 isenum 判定」與「現況支援之未載明元素形式」要分開**: `interp1` 之 `toArrayX` 與資料點共用寫法,px 元素除數字外還收 `[x,…]`、`{keyX}`(JSDoc 未載).直接把元素換 `isenum` 會悄悄收掉這兩種形式;本輪保留形式、只把「取出之 x」交 `isenum`,並列需裁示.共用輸入矩陣 `INVALID` 內的 `[5]` 因此對 px 元素為有效(測試以 `INVALID.filter` 排除並另立案),寫新矩陣前先看矩陣內每個值在**該函數**是否真的無效.
- **有限上下限使「Infinity 值被略過」不可觀察**: 想以變異「值接受 `Infinity`」驗證 `arrGroupByMaxmin`／`arrLookupByMaxmin` 之 `isenum(value)`,變異存活——因上下限現必為有限,`Infinity <= max` 恆假,值是否接受不影響輸出(等價變異).要殺此類變異,測試案須用**落在區間內**的 isnum-only 值(`'0x3'`、`'0o3'`、`'0b11'`、`'1e-400'`、`new Number(1)`、`new String('3')`),而非 `Infinity`.凡「收緊後與另一處收緊互相遮蔽」者都要用會落入可觀察範圍之值.
- **`cloneDeep` 會讀 getter**: 驗「檢測之值即使用之值」(K4)時用 getter 首讀有效、再讀無效,但 `arrGroupByMaxmin` 之 `cloneDeep(maxmins)` 也讀一次,故不可斷言讀取次數為 1;改斷言「結果用的是檢查過的值」(逐元素不重讀).
- **多位數數字字串才能殺「字串比大小」變異**: 資料點 `x` 為 `'3'`、`'4'` 這類個位數字串時,漏掉 `Number()` 的變異(`x = x`)不可觀察(字串字典序與數值序同);改用 `'9'`、`'10'`、`'100'` 且跑 linear／stairs／blocks 三模式(stairs／blocks 直接回 `p1.y`,`y` 若為字串會原樣外露).
- **全套修前案數(不實跑)**: 用 `git archive HEAD src "test/*.test.mjs" test/tools` 解到 `./tmp/`,以 `mocha --dry-run --reporter json` 分批計案(`tmp/ws271/countCases.mjs`).`evem.test.mjs` 以相對路徑 `../node_modules/eventemitter3/index.mjs` 載入,在副本下載入失敗;**不要在副本放局部 `node_modules`(會遮蔽 `src/evem.mjs` 的裸套件解析)**,改把該檔自副本排除、案數取自現行(該檔未改).修前 28098 案 → 修後 28500(+402＝新檔 347＋`domFadeIn` 納入 55);實跑 28494 passing／6 pending／0 failing,全套 1m33s.
- **紅燈取證**: 副本 `tmp/ws271/head/{src,test/tools}`(動工前 `git archive HEAD`),新測試複製進副本 `test/`,逐檔獨立 mocha 行程(`runRed.mjs`):`optValG8level3` 347 案紅 265(interp1 97、arrGroupByMaxmin 69、arrLookupByMaxmin 68、strTruncate 31),`strTruncate.test` 紅 1,`optValG4randDomMisc` 紅 37(皆 `domFadeIn`).修前不終止之輸入(迴圈、記憶體)本輪無,故未用子行程.
- **變異證明法**: 單行比對字串(工作樹有 CRLF);命中數不為 1 者標 `BAD-PATTERN` 不跑(`I10` 因 `toArrayX` 與 `toArrayXY` 有同一行,改為只換第一處);變異後 `ReferenceError`(TDZ)使 mocha 輸出無法解析時為 `ERROR`,要改寫變異而非當作殺死.51 項: 殺死 46,存活 5 皆等價(數字字串於 `<`／`<=`／`>`／`>=` 比較時 JS 自動轉型,`Number()` 取值不可觀察,仍保留以遵守 K4 一致寫法).
