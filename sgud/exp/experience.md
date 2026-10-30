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

## 觀察回調全面套用第 2 輪(fs 系,2026-10-29,wsemi-run08)

- **真實檔案監看(chokidar)之 C 類案不能用假時鐘,改步進式**: 事件來源是作業系統與 chokidar 的穩定期(`awaitWriteFinish`),不是被測函數的計時器.做一個檔案操作→等被測函數回報已處理該操作之事件(公開事件或 onTrace 的 `emit`)→才做下一個;起始等 `ready`(fsWatchFolder/fsWatchFile 只在傳了 onTrace 時掛 chokidar `ready` 監聽器,不改原行為;fsEvem 只把內部 fsWatchFolder 的 ready 轉成自己的 ready,不轉傳事件流).效果是去掉「每 3 秒排一個操作」的固定間距假設,耗時 fsWatchFolder 33s→約 9s、fsWatchFile 15s→約 5s、fsEvem 12s→約 6s、fsTask 長流程 15s→約 4s、fsTaskCp 15s→約 5s.
- **事件欄位名不得為 `type`**: `getTrace` 以 `{ type, ...info }` 展開,同名欄位會覆蓋事件類型;chokidar 的 add/unlink 等改名 `kind`.
- **沒有計時器的函數不加 onTrace**: fsCopyFile(Core)、fsCopyFolder(Core)、fsMergeFiles(Core) 的 C 類案之固定等待(`sleep(300)`)在測試輔助行程(fsFailRunner),改為等被攔得之串流本身的 `close` 事件(`closedState`,上限用真實計時器、逾時於狀態標 `closeTimeout` 使斷言明確失敗).**錯誤假設要先驗**: 原以為弱點是「fd 關閉慢於 300ms 使 `s.fd === null` 不成立」,實驗證明 Node 在呼叫 `close()` 當下就把 fd 設 null(開檔未完成時 fd 亦為 null),舊 harness 真正的弱點是 threadpool 壅塞時 `active` 殘留 `FSReqCallback` 造成假陽性(`UV_THREADPOOL_SIZE=1` 加持續 pbkdf2 下舊版 CF02/CF11/CD02 失敗、新版 8 案全過);另持有者啟動延遲 3 秒時舊 DF03 因檔案尚不存在而 resolve、舊 DD03 偽成功(實驗腳本與結果在主控任務 `agent-out/wsemi-run08-evidence/gC-experiments/`).
- **等子行程就緒要等可觀察條件,不是固定毫秒**: DF03 輪詢直到 `busy.txt` 存在且 rename 探測得 EBUSY/EPERM(代表已被 cmd 以不共享刪除之方式持有;rename 成功則還原並續等);DD03 讓子行程先在 stdout 輸出就緒標記(子行程啟動即持有 cwd 把手).條件輪詢之上限用真實計時器.
- **Core 函數之 `getTrace(opt)` 要置於既有 try 內**: fsDeleteFileSafeCore/fsDeleteFolderSafeCore 的 opt 可為 getter 拋錯或已撤銷之 Proxy(R-FS-REJECT-01),lodash `get` 讀 `onTrace` 會拋;置於 numRetry 與 fs 讀取之後,使既有失敗路徑結果不變.
- **改造前基準太寬鬆時要加重度事件迴圈阻塞**: 本輪 10 個 fs 檔(146 案)改造前 8 壓力行程 10 次 0 次失敗、`--lag 400:1000` 10 次僅 1 次失敗(fsTask 長流程),因 chokidar 類案裕度大(穩定期約 2.1s 對 3s 間距);故另加 `--lag 1500:3000`(每 3 秒阻塞 1.5 秒)改造前後各 5 次作佐證: 改造前 18 次案失敗(5/5 次 run 皆有: fsEvem 5/5、fsTaskCp L170 5/5、fsTask L99 迴圈 8 次),改造後 0.下次先估算案的固定時刻裕度,裕度大者直接排重度阻塞,不必先跑 CPU 壓力(CPU 壓力 8 行程對 fs 類案幾乎不觸發).
- **獨佔基準與子代理排隊**: 基準 CPU 與 lag 兩段共約 53 分鐘,子代理 src 與測試約 15 分鐘寫完,其餘時間都在等鎖(本套件同時只持一槽,四位子代理的測試序列執行);下次宜先寫完作業書立即派出,並要求子代理把測試指令合併(例: 變異、舊測試對照、eslint 用一個腳本一個 quiet-run).
- **主控裁定之函數缺陷修法**(原則 14,不留相容層): pmDebounce 防抖時間自「最後一次調用」起算(執行中調用亦計入,完成時不重設),d 約 1201ms 執行(原約 1321ms);cache.update 視同 fun 已執行完成(`needExec=false`);cacheBd 以 `hasCc` 旗標判定已有快取(null 亦算);setIntervalHp/setTimeoutHp 無效 interval(非正有限數,數字字串仍有效)不啟動並 `console.log` 一次 `Error('interval is not a positive finite number')`(setIntervalHp 仍回傳無作用之停止函數,setTimeoutHp 回 null);async fun 慢於 interval 時 setIntervalHp 會重疊調用(同原生 setInterval,判為非缺陷,JSDoc 已寫明);queue 的 `message` 事件傳 `qs.slice()` 淺複製快照(各消息本身不複製).
- **sgud 整理作法**: 先把原檔複製到 `tmp/<輪>/sgud-orig/`,以腳本依 `## ` 標題切節(各節為原行之連續切片),規則帳本依類型拆 10 檔、經驗把 2026-10-21 以前 30 節抽出;驗證腳本以「標題多重集相等+依原順序重組後與原檔逐字相同」核對.腳本與輸出在主控任務 `agent-out/wsemi-run08-evidence/sgud/`.注意整理後再編輯某檔,重組比對即不再相等,故核對必須在整理當下做並留存輸出.


## 觀察回調全面套用第 3 輪(最末輪: exec 系、下載/取得、dom 系,2026-10-29,wsemi-run09)

- **流程與工時**: 基準先於實作與派子代理跑完(獨佔鎖,02:13–02:57 約 44 分鐘,CPU 8 次、lag 400:1000 共 8 次、重度阻塞 1500:3000 共 4 次);之後 6 位 sonnet(xhigh)子代理並行(15~60 分鐘),主責同時處理 run08 只列不修之缺陷(含修前紅)與文件;程式碼凍結(約 04:05)後再跑改造後負載(約 45 分鐘,期間無法跑任何測試,只做文件).下次: 作業書(共通+分組)在基準等待期間寫好(本輪即如此,基準期間只做唯讀分析與作業書,不動 src/test);C 類案多於 8 件者拆兩位子代理(gC 13 案耗時約 59 分鐘,其餘 16~33 分鐘).
- **基準偏寬再現,但「stall 類」例外**: CPU 壓力 8 次 0 次案失敗;lag 400:1000 的 8 次中恰有一案 8/8 失敗(fsDownloadFileVerify `R12 should not treat a download as stalled while data keeps arriving…`),重度阻塞 3/4——停滯計時器與 I/O 同時被延遲時多數 stall/total 門檻案反而不失敗,只有「資料持續到達不得算停滯」這種需要計時器與 I/O 互相配合者現形.結論同 run08: 改善證據要靠「設計去除固定時刻假設」與耗時,不只靠失敗率.
- **事件閘門**(子行程/外部程序輸出之先後與分段): 不用子行程內 `setTimeout` 隔開輸出;子行程輸出一段後輪詢標記檔,父行程於 onTrace 之 `data` 事件見到該段才建立標記檔,使順序由因果決定(execProcess #1、#3、execCli #7);「已啟動並輸出」以 `spawn`/`data` 事件為同步點再推進假時鐘(#2).
- **Windows 樹殺測試要孫行程 detached**: 非 detached 之孫行程被 libuv 放入 KILL_ON_JOB_CLOSE 之 job,父 node 結束時孫即隨之結束,只殺父 pid 孫也會死,原案無法分辨是否真樹殺;變異「只殺該 pid」在非 detached 時存活、detached 時被擊殺.
- **假時鐘不能與真實 undici `fetch` 併用**: 前一案在假時鐘期間建立的 undici 內部計時器還原後殘留,於下一個假時鐘案中被誤清(實測後案之 600ms 總時限計時器整段不觸發).下載類時間門檻案一律改記憶體內回應(`ReadableStream` 由測試放行)加假時鐘;伺服器加 `Connection: close` 會觸發 undici `assert(!this.paused)` 使整個測試檔崩潰.
- **以 `performance.now`/`hrtime` 計時者假時鐘控制不了**(fsDownloadFileVerifyCore 之單調時鐘案 #20): 放大比例使真實耗時遠小於剩餘預算,只靠事件斷言語意.
- **無計時器之函數(execProcessKillPid)**: 其 C 類案之固定 `delay` 在測試端,改等子行程輸出就緒標記、`exit` 事件與 `process.kill(pid, 0)` 輪詢(真實計時器防懸置);src 仍加 `start`/`done`/`fail` 事件供測試與診斷,但不是為了測試硬塞計時器.
- **fsEvem 事件名稱即檔名**: 修法是驗證(單一安全檔名)而非改檔名機制——隨機檔名會讓同名事件不再覆寫同一檔、資料夾無限增長;收端改 `path.basename` 才能讓含 `.` 之名稱原樣送達;`getFileTrueName` 去掉最後一段是原缺陷根源.紅燈測試的夾具要把「逃出去的檔」限制在夾具內(`root/inner/fd`),否則修前紅燈本身會在 repo 根留下檔案.
- **fs 注入驗證只檢 `statSync`**: `fsExistsCore` 只吞 `statSync` 的錯誤,故 `fs` 為 null 時成功假象只出在 `statSync`;缺 `lstatSync`/`unlinkSync`/`rmSync` 者其 TypeError 本在 try 內以字串 reject,不需另檢(一度檢三個函數,導致既有半成品假 fs 測試失敗,縮回).
- **fsEnsureBins 離線缺檔不留空夾**: 站點是 `mkWork`(離線判定前建暫存夾)與 fsDownloadFileVerifyCore 建 `<sha256>` 夾;最小修法是離線且無鏡像者先判缺檔再建夾,有鏡像而取不到者記下「此刻尚不存在」之夾並於 reject 前由深而淺 `rmdirSync` 只清空夾.殘留: 非 `E_OFFLINE_MISSING` 之離線失敗仍留空快取根.
- **子代理管理教訓**: ①同名新工具檔會互相覆蓋(gA/gB 都建 `execTraceKit.mjs`,後者蓋掉前者)——作業書須規定工具檔名加函數前綴;②子代理以 `TaskStop` 停掉排隊中之 mocha 背景工作會留下殘留鎖(以 `quiet-run --release-stale --cwd <repo>` 回收,持有者已結束者才處理);③子代理自述曾用一次 `cd`(守門 hook 應擋,報告據實列出);④gC 耗時約 59 分鐘(其餘 16~33 分鐘),主因是 13 案各需新工具與記憶體內回應載具;子代理自述之耗時不可信,以完成通知之 duration 為準.

## 檔案組、主幹模式之退路與重取、網址判定收緊(2026-10-29,wsemi-run10)

- **raw.githubusercontent.com 之 CDN 不能以查詢字串或 no-cache 繞開**: 實測同一網址加 `?x=<亂數>` 與 `Cache-Control: no-cache`/`Pragma: no-cache` 皆 `X-Cache: HIT`、`Source-Age` 照計(快取鍵不含查詢字串);只有不同路徑(如 `refs/heads/master` 對 `master`)為 MISS,但它也會被快取 300 秒.可靠之作法是以 `api.github.com/repos/<repo>/commits/<branch>` 加 `Accept: application/vnd.github.sha` 取 40 碼提交(純文字回應,`Cache-Control: max-age=60`),再取提交之網址(內容不變、各提交為不同快取鍵).探測用 `curl -sS -o /dev/null -D -` 看 `X-Cache`、`X-Cache-Hits`、`Source-Age`.
- **Windows 之目錄更名**: `renameSync(dir, 已存在之檔)` 會直接以資料夾取代該檔(他平台失敗);`renameSync(dir, 非空資料夾)` 失敗(EPERM);連接點(junction)以 `fs.symlinkSync(target, path, 'junction')` 建立不需特權,`lstat` 為 isSymbolicLink,`renameSync` 移動的是連接點本身,`rmSync(recursive)` 不跟進其目標(已以測試鎖定:目標夾之哨兵檔不受影響).
- **整組原子發布之交錯**: 「判定不符 → 移走 → 更名」之間他方可能已放好好組或已移走壞組;外審(terra)以注入 `renameSync` 前後動作之 fs 包裝(`Object.create(fs)` 覆寫單一方法)重現 3 種交錯.修法: 移走後再校驗所移走者(好組即移回採用)、移走時 ENOENT 即重試、最終失敗時移回舊組.同法可在單一行程內確定性地測跨行程交錯,不需真多行程.
- **URL 之白名單須以原始字串判定**: `new URL` 會把空之 `?`、`#`、預設埠 `:443` 正規化掉、把反斜線當斜線、補 `https:github.com` 之斜線;只看解析後之 `search`/`hash`/`port` 會放過這些寫法.先以原始字串限定 `https://` 開頭與禁字元,再解析取路徑段.
- **chrome 免安裝版之檔名**: `Chrome-bin/` 內有 `First Run`(含空白)與中文名之 `.url` 捷徑;組內路徑白名單允許段中空白,但清單項之 `name` 不允許,故產清單之工具對組內檔用 `fsGetBinManifestEntry(fp, { name: null, path })`,並以 include 過濾排除 `.url`.chrome 138 之 Chrome-bin 共 107 檔、421 MB,8 個分割(198 MB)組合後以 tar.exe 解出約 3.5 秒、整組雜湊約 0.5 秒.
- **dll 相鄰之實證**: `mseed2ascii.exe` 自組資料夾執行 `-V` 得 `version 2.6`(離開碼 0);單獨複製一份(無相鄰 cygwin1.dll)執行得 `3221225781`(0xC0000135 STATUS_DLL_NOT_FOUND).
- **外審 terra(gpt-6.1-terra/max)**: 第 1 輪 11 分鐘、17 條,自建探測腳本(注入排程之 fs、合成 fetch)實跑重現,另做 2 個變異證明測試盲點;提示詞給輸入空間表、改動 diff、舊版副本、測試埠改 98xx 之副本,並先以輕量模型探測讀中文檔與寫檔.
- **變異實驗之腳本化**: `tmp/<run>/mutate.mjs` 於副本逐項套用(錨點須恰出現一次,否則 NOAPPLY)、跑相關 5 測試檔、還原;以 `quiet-run --lock` 包住整支腳本(一次取鎖).修碼後錨點會變,第 2 輪先更新清單.
- **測試鎖之排隊**: 他套件之獨佔(exclusive)負載試驗會連續佔兩槽並有下一個獨佔者等候(`C:/opensrcOper/tmp/locks/exclusive-pending.txt`),非獨佔之 `--lock` 須等到無等候之獨佔者,實測 06:12 起以 `--lock` 排隊逾 35 分仍未取得(其間 4 個套件之獨佔輪替),改 `--lock-exclusive` 加入獨佔之等候序列後再等 60 分 42 秒才取得.最終驗證(修前紅、變異、全套)宜寫成一支驅動腳本以一次 `--lock` 依序執行;工具呼叫之前景上限 10 分鐘,排隊之指令一律背景執行並明給長 timeout.
- **外審第 2 輪之價值**: terra 第 2 輪逐條重跑第 1 輪之探測核對修正,又找出 12 條修正本身之邊角(移回失敗、共用錯誤物件被改寫而混入他呼叫之 leftovers、`%6Daster`、大寫 scheme 被誤拒);修正後之碼宜再送一輪,不以「已依外審修正」結案.

## 診斷輸出與遮罩之共用函數(2026-10-29,diag-run02)

- **以比對式掃 `scheme://` 為平方回溯**: `/[A-Za-z][A-Za-z0-9+.-]*:\/\//g` 於 2 萬個字母(無 `://`)實測約 140 ms CPU;改以 `indexOf('://')` 後往前、往後掃描為線性.原 fsDownloadFileVerifyCore/fsEnsureBinsCore 之 maskUrl 即此型.
- **「遮後再截」會露出截點後之原文**: 先截窗(上限＋最長秘密)再遮、遮後依遮後長度截,當窗內大量命中使內容變短時,原文上限之後之內容(含窗尾被切開之秘密片段)整段輸出(外審 capi #13 實測).截點須以原文位置計.
- **對外錯誤值不可截長**: 截長使長於上限之字串(批次寫入之 `sql`)恆被判為「需處理」,所有此類錯誤失去身分.截長只屬診斷輸出.
- **V8 之 stack 於首次讀取時以當時之 message 格式化並快取**: 之後改 message 或 name,「stack 由已檢查之 name、message 組成」之前提即不成立;可安全讀取(無使用端 prepareStackTrace、name/message 為字串資料屬性)時直接讀 stack 檢查.
- **fail-closed 之粒度**: Map/Set 一律視為需處理會使每個 MongoError(自有 `errorLabelSet = new Set()`)失去身分與堆疊;應以內建迭代檢查其內容.二進位則無法以文字檢查,維持 fail-closed.
- **util.types 判型不可先看原型**: 「原型為 Object.prototype 或 null 即視為一般物件」之快路使原型被改之 Map/Error/TypedArray 被當一般物件(外審 terra #14);util 可用時一律以槽位判型,成本為每物件約 10 次原生呼叫,S09 之 200 列×100 次仍約 JSON 往返之 5～17 倍.
- **CPU 時間之計量粒度**: Windows 之 `process.cpuUsage` 約 15.6 ms 一跳,單次數毫秒之量測常為 0;相對比值類測試以同總工作量分批(如 40 次×1000 對 10 次×4000)並取 3 次之最小值,5 次重跑皆穩定.
- **外審於修正前之碼並行時**: 兩審同時派出、其一(claude-api,24 分鐘)回來時已依另一審(terra,12 分鐘)修過,須逐條判斷「已由某修正涵蓋」與「新缺陷」;本輪 capi 25 條中 6 條已被 terra 之修正涵蓋.
- **還原式變異證明修前紅**: 修外審缺陷前未保留修前副本時,以「重新引入該缺陷」之變異逐項跑新測試,擊殺即證明該測試於修正前為紅(本輪 F/G 系列).修正前先留副本(`git stash` 禁用,改 `fs.cpSync` 至 `./tmp/`)更直接.
- **主控守門 hook**: 指令中夾帶無作用之 `sed -i`(如 `sed -i.bak '' /dev/null`)亦被擋;整串指令不執行,改拆開重下.

## 診斷遮罩之發布前第三方複核(2026-10-29,diag-run03)

- **循環圖之「結果記憶」只可記不依賴進行中祖先之 false**: 對外值檢查以 memo 免平方(上輪 X32),但子物件 D 指回進行中之祖先 E 時,D 之「不需處理」只是「假設 E 不需處理」;E 隨後需處理時,副本以原參照交出 D,經 D.back 可讀回 E 之秘密(自審與 terra 皆以 4～5 種形狀重現).作法同 Tarjan 之 low-link: 記下子樹所指之最淺祖先位置,只有未指回更淺祖先者才記 false;true 恆可記.修效能缺陷時須同時跑「循環＋需處理」之語料.
- **內容快取鍵不可用分隔字元串接**: `ss.join('\u0000')` 使 `['a\0b']` 與 `['a','b']` 同鍵,後到之清單取得前者之比對器而漏遮;快取鍵一律用 `JSON.stringify` 等一對一編碼.
- **fail-closed 之全集要對齊「無法讀取」之全部來源**: 上輪只對 secrets 函數拋錯 fail-closed;外審再找出 cfg 之 getter/Proxy、函數回傳 null、清單為 Proxy、清單項為 getter、來源之 getter、with 之合併,皆被當作「空/較短之清單」而 fail-open.收斂為單一擁有者 `pickList`(＋`arrVals(…, true)`、getDiagSecrets 之不可列舉失敗標記),各出口在其 catch 一律回 fail-closed 值.判準: **讀不到 ≠ 沒有**;只有 undefined/null(未宣告)才是空清單.
- **不透明之內容(Promise、WeakMap、WeakRef、迭代器、生成器)要當作無法檢查**: 只檢查自有屬性時其內容恆為「乾淨」;util.types 無 isWeakRef,以 `WeakRef.prototype.deref` 之品牌檢查辨識.
- **函數值亦有自有屬性**: `typeof v === 'function'` 即原樣放行,會連帶放行可呼叫之 Proxy(在 Proxy 守門之前即返回).無 util 時函數之自有不可列舉 `length` 會被 kindOf 判為不攤開之節點(使每個帶回呼之錯誤失去身分),故函數不經 kindOf、只走其自有屬性.
- **測試之斷言若反映舊的 fail-open 行為**: `maskDiagCopy(x, 'not a list')` 原斷言「原樣」;依 D4 改為 `[Uncopyable]` 屬規格對齊(記入 decisions.tsv),不是遷就現狀.
- **CPU 比值測試之下限會吸收小規模之平方**: safeKeys 之 indexOf 平方於 500/5000 鍵時 b≈75 ms 仍低於 `max(a, 32 ms)×2.5`,修前不紅;放大至 1000/10000 才紅.寫比值測試要先以修前碼確認會紅.
- **修前紅之取得**: 外審派工時已凍結快照(`rv-terra/snap`),即修前之碼;以「快照 src＋本輪語料與測試」組成紅段目錄、與綠段在同一次測試鎖內依序跑(本輪 50 failing → 0).判讀器本身之修正(verify、collect)須另以快照之 `_diagCases` 跑該判讀器案.

## 診斷遮罩之發布前收斂輪(2026-10-29,diag-run04)

修正引入新缺口之型態(下游遷移與日後修改時對照;每一型皆為本輪或 run03 之修正所引入、由外審差分找出):
- **以「不記憶」修正錯誤之記憶,會把線性變成指數**: run03 為修循環之漏遮改為「依賴祖先之 false 不記」,共用且指回祖先之子物件於每條路徑重查,8 節點之小圖即耗盡節點預算而使乾淨輸入失去身分(模糊測試 3 萬圖: base 洩 1,762、run03 0 洩但多 57 個乾淨輸入被複製).正解是「暫定記憶」:記下所依賴祖先之位置與該次檢查之序號,只在該祖先之同一次檢查仍進行中時沿用,沿用時傳遞依賴;序號防止修補階段之重查誤用前一階段之暫定結果.**修記憶類缺陷一律以隨機圖做差分**(洩漏數與乾淨輸入之身分數兩個不變式同時量).
- **退路(fallback)會把「寧可多遮」改成「露出後段」**: 陣列值找不到配對之 `]` 時取第一個 `]`,使未閉合之值露出後半;退路之方向必須與 D4 一致(找不到就遮到底).
- **加速捷徑會重開已修之漏格**: 為降低無 util 時試探之成本而「只對無非索引自有鍵者試探」,使帶額外欄位之 null 原型 Map/WeakRef 不再辨識(run03 #7 之高嚴重度重開).效能修正不可縮小判型之範圍.其後改以暫設 `Error.stackTraceLimit=0` 降低例外成本,又因試探期間(無 util 之 Proxy 陷阱)使用端程式看見被改之全域狀態、其改動被還原蓋掉而再撤回;**常數倍之成本列已知限制,勝過以全域狀態換取速度**.
- **兩個方向都會被審查者列為高時,依 D4 取 fail-closed**: 不透明判定之 toStringTag 規則,放寬則宿主物件(Headers、Request 可攜帶 Authorization)原樣交出,收窄則以 defineProperty 定義標籤之一般類別被替換為 `[Object]`;前者是洩漏、後者是多遮,取後者並列已知限制交主控裁示.失敗標記同理:物件項不撞名但經 `map(String)` 即失效(fail-open),保留字串會撞名但只會多遮,取保留字串.
- **標記用 Symbol 鍵,複製即遺失**: 失敗標記放在結果物件之 Symbol 鍵上,展開、取其陣列、clone、JSON、另一份模組副本皆失效;改為陣列內之保留字串.判準:標記必須跟著「被用來比對的那份資料」走,且可序列化、跨 realm/模組.
- **為修 A 而呼叫既有之共用函數,會帶入其副作用**: 為不產生未處理之 rejection 而對捨棄之 Promise 呼叫 `_pmMarkHandled`,其 `instanceof` 走原型鏈(執行 Proxy 原型之陷阱、長鏈之成本)、`then` 讀 `constructor`(執行使用端 getter).對使用端資料呼叫共用函數前,先查其內部讀了什麼;改以「原型恰為 Promise.prototype 且無自有 constructor」之窄條件呼叫.
- **擴大判定(不透明)會吞掉一般物件**: 「原型帶 toStringTag 即不透明」把以指定定義標籤之一般類別當成宿主物件;改為只認內建形式之描述子(不可寫、不可列舉).
- **「終點」只比本 realm 之身分**: 原型鏈走訪以 `=== Object.prototype` 為終點,跨 realm 之根原型被當成宣告來源;終點要以結構辨識(isRootObjProto).
- **驗證分散在兩處會使出口不一致**: 清單之項只在建比對器時判定,getDiag 之細節走另一條路(`[Uncopyable]` 而非 `(unprintable)`);判定收斂到 `pickList` 之 `checkList` 單一擁有者.

其他:
- **Codex 內容審查**: 首派 3 分鐘即被 cyber 旗標擋下(審查者自建之探測含 `s3cret` 類字樣);提示詞加「防禦性品質審查」說明並要求測試值用中性佔位字串後,三次派工皆完成.
- **他套件長時間獨佔測試鎖時,排隊指令要 detached**: 掛在工具呼叫上之 `quiet-run --lock` 會被背景時限砍掉;以 `nohup` 排隊、輸出落檔再輪詢.
- **CPU 比值測試要先確認變異會紅**: 撇號形之陣列值,引號跨段成對而使無上限之掃描亦為線性,該案擋不住「移除上限」之變異;註解不可宣稱其驗證了上限.

## 查詢埠之監聽者(2026-10-30,主控任務 20261030064553 run01)

- **本機實測(Windows 11 26300.9818＋KB5127936,zh-TW)**: `netstat -ano` 約 25ms,但自起之監聽 0/10 列出;系統之 135、445 有列但狀態字錯(`0.0.0.0:135 0.0.0.0:0 FIN_WAIT_1`、`:445 … CLOSED`).`Get-NetTCPConnection -LocalPort` 約 0.9 秒、10/10 查到,State 為 0.故判定「監聽」只看遠端 `0.0.0.0:0`/`[::]:0`,135 仍由 netstat 查得、新起之監聽一律走備援.
- **PowerShell 之「查無」與「指令不存在」Category 相同**: 查無為 `CmdletizationQuery_NotFound_LocalPort,Get-NetTCPConnection`,指令不存在為 `CommandNotFoundException`,兩者 `CategoryInfo.Category` 皆為 `ObjectNotFound`;以 Category 判會把指令不存在當無人(fail-open),須以 FullyQualifiedErrorId 之前綴分辨.真機測試以把 cmdlet 名改錯之腳本驗證.
- **非同步版之第 2 個子指令於微任務後才組成**: 若組成時才讀 `process.env.SystemRoot`,呼叫端於呼叫後改動環境變數會使兩個子指令用不同之系統夾(測試即因「呼叫後立即還原」而走到真實 PowerShell 得 `[]`);入口讀一次存入設定.判準: 非同步流程中凡「呼叫當下之狀態」皆於入口快照.
- **spawnSync 之 timeout 須為整數**: 小數即拋 `ERR_OUT_OF_RANGE`(Node 24 實測),setTimeout 則接受小數——同一選項兩版行為分歧;入口無條件進位.
- **攔截 child_process 驗選項與子程序 pid**: 被測模組以 `cp.spawn(...)` 屬性取用時,測試可暫換 `cp.spawn`/`cp.spawnSync`(同一個 CJS 物件)記錄 options(windowsHide、shell、stdio、timeout、killSignal、maxBuffer)與 `pid`,再以 `process.kill(pid, 0)` 輪詢驗子程序已結束;比寫 pid 檔可靠(逾時短時子程序可能未及寫檔).
- **「事件於 resolve 之前通知」之驗法**: settle 事件與 resolve 同一同步段,await 後兩種順序看不出;於回調內 `util.inspect(pm).includes('<pending>')`.
- **子代理(sonnet)獨立審查**之 15 條中 1 條為當下之紅測試根因(上列 SystemRoot)、2 條為兩版分歧/TOCTOU;先跑一次再審,審查者可引 quiet-run 之 log 為旁證.

## 小輪 9 項(2026-10-30,主控任務 20261030143215 run01)

- **原型為 null 之原生 Promise 不是 thenable**: 無 `then` 可查,`Promise.resolve`／`.then` 之回傳把它當一般值;`pmSeries`、`pmMap` 依原值交出(結果陣列含該 Promise),其 rejection 不會傳到 pmSeries.品牌判定(`Promise.prototype.then.call`)仍可標記它;測試預期須寫「依原值交出且無未處理之 rejection」,不是「pmSeries reject」(首次寫錯而紅).
- **無 util 時沿原型鏈讀屬性會執行不可偵測 Proxy 之陷阱**: `markDropped` 擴充跨 realm 時改為走原型鏈找 constructor,語料 A10(`Object.create(new Proxy({}, { getPrototypeOf }))`)於無 util 環境即紅——兩環境都跑語料才抓得到;無 util 時只看值自身與其直接原型(原碼即只讀到這一層).
- **跨 realm 之內建函數以原始碼辨識**: `Function.prototype.toString.call(f)` 之 `function Promise() { [native code] }`、`function get [Symbol.species]() { [native code] }`(各內建之 species getter 原始碼相同,皆回傳 this);bound function 與 Proxy 之原始碼無名稱,class 為 `class X …`,故不會誤認.
- **Node 對不存在(或為檔案)之 cwd 一律經 `'error'` 事件回 ENOENT**(Windows,spawn/exec/execFile 三模式實測),同步 catch 不會遇到;`execSpawnError(err, { cwd })` 於兩路皆傳屬防禦(變異於同步路徑必存活,列等價).
- **變異使計時器永不停止時受測 mocha 不退出**: debounce 之「cancel 不清計時器」變異讓 mocha 寫完報告後掛住,`spawnSync` 等到逾時;變異執行器一律加 `--exit`(只看成敗,不影響判定).中途重啟取鎖鏈時,以 taskkill /T 殺自己之鏈並 `--release-stale` 回收鎖.
- **守門擋下合併指令中之一段即整條不執行**: `echo x > f; nohup bash chain.sh &` 因 echo 寫檔被擋,nohup 亦未執行;啟動背景鏈後須另行確認(看 log 或行程).
- **`monitorEventLoopDelay` 之樣本數依行程存活時間**: 數百毫秒即結束之 mocha 可能 `count` 為 0(探測檔仍寫出);負載執行器之測試只斷言探測檔存在.
- **測試負載執行器本身**: 受測之 mocha 夾具須於有限時間內自行結束(掛住之計時器 20 秒後自清),否則「不終止行程樹」類變異會留下孤兒行程;以「離開碼非 0 且行程已不存在」區分被終止與自行結束.「guard 不帶 NODE_OPTIONS」之測試須以帶 NODE_OPTIONS 之環境啟動 loadTrial 本身,否則變異存活(L7).
- **以 then 之品牌檢查判型之成本**: 對非 Promise 每次建 TypeError,10 萬個一般值約 296ms(instanceof 約 0.4ms);原始值先早退、`util.types.isPromise` 可用時先預檢.品牌判定「改寫 then 後仍用載入時之內建」須有改寫 then 之測試,否則改成呼叫時取 then 之變異存活(P4).
- **樣本須涵蓋各分類判準之單獨成立**: conns 之「含 `://` 或 `@`」樣本中含 `://` 者皆含 `@`,使「只認 @」之變異存活;補只有 `://`(`redis://…?token=`、`sqlite:///…`)之樣本.
- **子代理(sonnet)讀碼審查**於全套已綠後仍找到 8 條(中 3: 無 util 之多餘陷阱、兩個測試缺口;低 5),其中效能退化與「無 util 多一次取原型」為我自己於本輪引入——擴充判定時要以「比修前多執行了哪些使用端程式/多花多少成本」對照 HEAD.
