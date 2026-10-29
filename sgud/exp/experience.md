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
