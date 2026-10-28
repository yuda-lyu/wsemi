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

## 帶期望雜湊之下載 `fsDownloadFileVerify` 之實作與測試(2026-10-28,第 148 項前半 wsemi-run01)

- **串流錯誤之歸屬**: `pipeline` 因來源(網路)錯誤銷毀寫入端時,寫入端也會 emit **同一個**錯誤物件;只以「帶 `syscall`」判為磁碟錯誤會把某些網路錯誤誤歸 E_FS.作法: 在 pipeline 中間之 async generator 內 `catch` 記下來源錯誤,寫入端 `error` 監聽器只收「帶 syscall 且不是來源錯誤」者.
- **`createWriteStream` 可同步拋出**(路徑含 NUL 等,`ERR_INVALID_ARG_VALUE` 無 syscall),不另包就被 tagErr 歸成網路錯誤;「暫存檔可能已建立」旗標要在它回傳之後才設,否則清理時對不存在(或無效)之路徑 unlink 失敗而偽報殘留.
- **`getFileName('a/')` 回 `'a'`**(會去掉結尾分隔符),不能用它判「路徑是資料夾」;改以 `/[\\/]$/` 判.
- **伺服器以「第 n 次請求之行為表」驅動**(`plans[key] = ['bad','ok']`),每案用不同網址鍵並計數請求次數: 「不重試」以伺服器只收到 1 次斷言,「共用」以多個呼叫只收到 1 次斷言;比只看結果更能抓錯誤分類之變異.
- **「提前中止」之驗法**: 伺服器先送一小段、延遲 5 秒才送完,斷言 3 秒內以 E_SIZE_MISMATCH 結束;**「下載途中正式檔不存在」**: 伺服器送一半後停 400ms,測試於中途檢查正式檔不存在且同資料夾有 1 個 `.part`.
- **「計時器不撐住行程」之驗法**: 子行程(`test/tools/dlVerifyChild.mjs`)呼叫一次後印結果,父測試以 `spawnSync` 之耗時判定;預設停滯 30 秒/整體 600 秒之計時器未清時子行程不會在數秒內結束(變異 M24 據此轉紅).
- **停滯計時「收到資料即重設」需專案**: 停滯與整體逾時之失敗案在拿掉 `touch()` 時仍綠(停滯本來就會發生);須另有「分塊持續到達、總時長大於 stallMs」之成功案才抓得到(寫第一版測試後依變異清單預判而補).
- **變異直接改 repo 內 src 檔**(每項 try/finally 還原、全部結束後 sha256 回驗)可行,但執行期間不得編輯該檔(會被下一項之還原覆蓋);較安全仍是前輪之副本法.
- **外審副本放在 repo 之 `tmp/` 下**,Node 往上層解析即可用 repo 之 `node_modules`,不必複製;副本內測試埠改另一組(8812–8814),避免與自己並行之測試互搶.派 Codex 跑本機 HTTP 測試時另開 `sandbox_workspace_write.network_access=true`.
- **盤點同類站點會找出派工未列者**: 「下載執行檔」之站點除派工所列 3 個套件,另有 6 個套件以 `fsDownloadFile` 下載 exe 不驗、3 個 w-scan-* 下載 GitHub 最新 release 工具未見驗證(R-DL-VERIFY-01 站點全集).
- **自寫第一版仍漏之類別(terra 第 1 輪 27 條、0 誤報)**: ①**所有權不可由錯誤碼推定**——以「createWriteStream 回傳即算已建立」「ws 錯誤碼 EEXIST 才算碰撞」判斷暫存檔歸屬,會在開檔失敗時刪他方之檔、在寫入錯誤時漏報殘留;改為 `openSync(…, 'wx')` 同步建立成功才算本次之檔,寫入串流以該 fd 建立;更名成功後舊暫存名即不屬於本次.②**只傳 signal 不等於有界**: 傳入之 fetch/串流可不響應中止,`await res.body.cancel()` 可永不落定;每個 await 都要和計時器競速(guard),丟棄本體不等待.③**await 之後的相對路徑會依新 cwd 解析**: 入口同步(首個 await 前)以 realpathSync 固定絕對路徑.④`getPathParent` 會壓掉 UNC 之 `\\`.⑤共用下載要比對「會改變結果之選項」,共用者之時限要各自計.⑥錯誤歸屬改「最先出錯之一端」(src/ws 各掛 error 監聽器),不以 syscall 有無判定.
- **以外審前版本配新測試跑一次**(`tmp/wsemi-run01/redOld.mjs`: 複製 src 全份到 tmp、換回外審前之 Core、cwd 設副本)即得修前紅;懸置類案例會吃滿 mocha 之逾時並使行程不結束,spawnSync 要設上限.
- **變異存活即測試缺口**: 第 2 輪 54 項中 3 項存活——寫入端「不回呼 write」但仍響應 destroy 時 pipeline 自己會因 signal 落定,測不到 guard;需要「連 destroy 都不完成」之寫入端.結束時 abort 請求被 dropBody 之 cancel 掩蓋,需要「標頭處理拋錯、本體尚未交出」之路徑.fd 是否關閉於 Windows 看不出(POSIX 刪除語意使 unlink 照樣成功),改以 closeSync 之呼叫紀錄斷言.
- **外審中途額度用盡時仍可回收其工作**: terra 第 2 輪 7 分鐘即 `usage_limit_exceeded`(Codex session jsonl 之 `task_complete.error`;dispatch 結果只有 exit 1),未寫報告;但其產出目錄留有探測與變異腳本、session jsonl 有中途訊息.以其產出目錄為 cwd 逐一實跑探測(`node out2/probe-round2.mjs <mode>`)即得 11 個屬實問題——最有價值的是 Windows 專屬路徑形狀: 磁碟相對 `C:a.bin`(自行切分路徑時會把冒號留在檔名,成為 NTFS 替代資料流並建出名為 `C` 之檔)、磁碟根 `mkdirSync('C:\\',{recursive:true})` 實回 EPERM.
- **「pipeline 完成」之後仍在跑之計時器會篡改錯誤歸屬**: 停滯/整體計時器若到 finally 才清,重讀暫存檔或等寫入端關閉期間觸發,`tagErr` 以中止原因(E_TIMEOUT)取代真正的磁碟錯誤並重試;網路階段一結束就停計時器,之後之等待各自設上限.
- **共用鍵改含換行等分隔字元之拼接會撞鍵**: 直接用絕對路徑當鍵(分隔符不可能出現在檔名中),比自訂分隔字元安全.
- **變異樣式要隨碼更新**: 同一行碼被複製到第二處(`clearTimeout(timerTotal)` 於 stop 與 close)時舊變異樣式命中 2 次而未套用,腳本須檢查「恰命中 1 次」並報出,不可默默略過.

## `fsDownloadFileVerify` 第三方完整複核與修正之經驗(2026-10-28,wsemi-run03)

- **額度用盡的訊息要看 Codex session 的 `task_complete.error`**: 10:53 派 terra 單問探測 4 秒即 exit 1,`result.json` 只有 stderr 前 1000 字元(全是提示詞回顯);真正原因在 `~/.codex/sessions/<日期>/rollout-*.jsonl`(`usage_limit_exceeded`,`try again at 10:56 AM`)。重置時刻前先等(Bash 迴圈 `until [ "$(date +%H%M)" -ge 1057 ]` 以 `run_in_background` 或 Monitor),重置後 27 秒的單問探測(讀第 33 行＋寫檔,canary 原文讀回)通過才派正式。派工腳本以 `node dispatch.mjs probe|main` 同檔兩用,探測與正式共用同一組限制句。
- **terra max 完整審 1100 行＋100 案: 22 分 42 秒、310,878 tokens、新問題 24 條**(掛 `sandbox_workspace_write.network_access=true` 才能跑本機 HTTP 測試)。提示詞要求「探測與變異輸出存檔於產出目錄」後,它交出可直接重跑的 `probes/*.mjs`、`mutations/M*/mocha.log`、`prove-*.mjs`;**收回後逐支自行重跑(11 支探測全數重現),再讀碼確認**,比只讀報告可靠。處置表逐條「核對」也有價值: 它把 run02 自稱「等價變異」的 O10 以 heap 實測(30000 個目的地 0.95 MB 對 8.80 MB)推翻。
- **「純記憶體、無外部可觀察結果」不等於等價變異**: 長駐行程下就是洩漏。要測模組私有表而不改 src: 測試內暫時攔截 `Map.prototype.set`(finally 還原),以鍵含唯一標記且值為陣列辨識出模組內的 `_inflight`,落定後斷言其 `size` 為 0。
- **「檢查之值即使用之值」之一類: 包裝物件**。`new String(hashA)` 可覆寫 `toLowerCase` 使檢查 A 卻以 B 驗證並發布;`new Number` 的 `valueOf` 每次回不同值;`new String(path)` 的 `slice` 在檢查後改指另一檔;`new Boolean(false)` 為 truthy 而 `isbol` 回 true。作法: 入口一次以 `String/Number/Boolean.prototype.valueOf.call` 解包(取內部槽,不呼叫物件自身方法;非包裝物件會拋 TypeError 而原樣回傳),其後全用解包值。測試把會被誤用的方法全換成「呼叫即拋」,成功即證明從未被呼叫(比比對結果更能抓全)。
- **錯誤身分不可由 `code` 判定**: 傳入之 fs getter、fetch、串流可拋帶 `E_NETWORK`、`E_FS` 等同名 code 之外部錯誤,依 code 判定會漏出原錯誤或顛倒磁碟/網路分類與重試。改為 `mkErr` 登記進模組內 `WeakSet`、`isOwnErr = WeakSet.has`(不讀屬性、不會拋錯,也順帶取代 `codeOf` 式的 try)。
- **先出錯之一端要鎖定**: 某端先出錯後立即 `req.stop(5000)` 停停滯/整體計時,否則其後關閉較慢時晚到之計時中止以 `reason` 取代真因(E_FS 變 E_TIMEOUT 而重試磁碟故障)。停計時會使「傳入之 pipeline 不落定」時 guard 永不落定,故同時設 5 秒保底 `ac.abort()`(不寫入 `reason`)。保底計時器要在 `close()` 清除,否則多撐行程 5 秒——以子行程案(`dlVerifyChild.mjs cut`: 送一點本體後斷線,來源端先出錯)量行程結束時間才抓得到,變異「保底計時器不清」據此轉紅。
- **`waitClose` 只聽 `close` 事件會誤判**: `fs.createWriteStream(p, { emitClose: false })` 的真實串流已關閉(`ws.closed === true`)但永不發 `close`;改為事件＋每 20ms 輪詢 `closed`。連帶「失敗清理不重複等待」需讓測試用的串流 `destroy` **不呼叫 cb**(`fs.close(fd, () => {})`),`closed` 才恆為 false;若 destroy 會呼叫 cb,第二次等待因輪詢立即返回,測不出重複等待(變異 K25 初跑存活,改測試後轉紅)。
- **已收到回應但失敗於交出本體之前**,傳入之 fetch 不理 signal 時本體不會被取消: `finally` 對 `res !== null && !bodyTaken` 者 `dropBody`。同一處使「回傳 Node Readable 本體」之 `fromWeb` TypeError 不必另行 cancel(多餘之顯式 `dropBody` 已移除,變異才不存活)。
- **多餘碼與變異存活**: `stopped` 旗標(防 stop 後 touch 再起計時)實際無路徑可達(出錯後 `check` 不再被呼叫),無法以測試殺掉的變異＝多餘碼,移除;`close()` 內 `ac.abort()` 在 H12 修後與 `dropBody`、串流銷毀重疊,變異存活屬等價(保留作第二道防線)。
- **共用條件加「方法身分」後,舊的「不同模組物件」測試失去鑑別力**: 測試用的替身模組方法是新函數,方法身分不同而不共用,物件身分比較被遮住(O03 存活);需另補「另一個物件、同一組方法函數」(`{ createHash: crypto.createHash }`)之案。
- **數值字串**: wsemi 通則「數值輸入支援字串型數字」不必擴及十六進位、指數、小數: `'0.999…9'`→1、`'1e-324'`→0 皆轉數字後失真。位元組數只接受十進位整數字串(`/^\s*\d+\s*$/` 且轉數字後為安全整數),`Number.isSafeInteger` 對十進位數字串是精確判定(≥2^53 者必四捨五入到 ≥2^53)。
- **Windows 11(26300)保留裝置名不是問題**: 自行探測 `nul`、`con`、`aux`、`com1`、`CON.txt`、結尾點/空白之檔名,皆當一般檔案寫入且內容正確(不需特別處理)。
- **審查者的嚴重度偏高**: 24 條中多數「高」只能由傳入元件或包裝物件觸發;分級以「一般呼叫路徑可達與否」為準。駁回理由皆記於 R-DL-VERIFY-01 已知限制(F5 窗口、F25、P4、Q2、Q3、R1、G8)。
- **完整變異重跑用 3~4 個副本並行**(各自測試埠 8860+3k,`--bail`): 129 項約 9 分鐘;腳本檢查「恰命中 1 次」並印出 NOT-APPLIED。eslint 對新測試的 `object-curly-newline`/`object-property-newline` 用 `npx eslint --fix` 修,`no-new-wrappers`、`no-extend-native` 以檔首 `/* eslint-disable … -- 理由 */` 處理(repo 慣例見 `chkOrmData.test.mjs`)。

## `fsDownloadFileVerify` 補第三方複核之經驗(2026-10-28,wsemi-run02)

- **外審兩個遞補皆未產出報告,但仍可回收**: agy `claude-opus-5-5-high` 於 11 分 50 秒時 exit 3、stderr `RESOURCE_EXHAUSTED (code 429) … Resets in 4h47m59s`(派前 `quota-agy` 顯示 3p-5h 0%、3p-weekly 0%;**12 分鐘內 3p-5h 到 100%、3p-weekly 到 50.95%**——同帳號其他 session 若同時用 Claude/GPT 組亦計入,無法區分,但單一長審足以用滿 5 小時額度);產出目錄遺留 3 支探測腳本(未存輸出)與 1 支 13 項隔離變異腳本(只存了輸出的一部分,且為 UTF-16)。**遺留腳本需自行實跑才有結論**: 把腳本複製到自己的暫存夾、改埠、改 import 為相對路徑(絕對 Windows 路徑不能直接 `import`,要 file URL)後執行,得 14 個探測結果。agy `gemini-3.8-flash-high` 則在探測(讀第 33 行＋寫檔,15 秒)通過、正式派工後 10 分 50 秒 stdout 0 位元組、CPU 幾乎不動、無子行程(對照 opus 1 分鐘內就有輸出)——判為服務無回應,依守則 `taskkill /F /T /PID <dispatch node>` 並以 PID 回驗 agy 同時消失。
- **13 個隔離變異全存活 = 測試保護力缺口**(run01 的 66/66 只涵蓋自己想到的變異): 共用條件逐項(網址、fetch、fs、crypto/Readable、size)、fs 方法於呼叫時取出、size 超過安全整數、EACCES 重試、identity 編碼、寫入串流關閉順序、磁碟根(`/x.bin` 的資料夾為 `/` 而非 `.`)、catch 內銷毀串流、更名失敗比對空檔。補案要點: ①共用條件**每一項各一案**(只用「全拿掉」的變異看不出單項遺漏); ②「關閉順序」要讓 pipeline 於 finish 就落定而 close 遲到——`fs.createWriteStream(p, { fd, autoClose: false })` 並自行於 finish 後 300ms `destroy()`(預設 autoClose 時 pipeline 會等 close,看不出差別); ③`ws.destroyed` 比檔案是否存在更能斷言 fd 已關(POSIX 下 unlink 不受開啟中 fd 影響); ④「rename 前的瞬間 `ws.closed`」在傳入的 `renameSync` 內記錄。
- **等價變異要明說**: 「共用表鍵永不刪除」(空陣列留在 Map)只有記憶體差異,無外部可觀察行為,不入測試而入已知限制,避免為了湊全紅寫出測內部狀態之指紋測試。
- **呼叫端傳入之函數用 `ctx.fn(...)` 呼叫會洩漏內部脈絡**: `this` 變成 ctx,函數內 `this.fpAbs = '…'` 可使驗證後更名至他處(實測 `bExists:true`)。一律先取出成區域變數再呼叫(`let fn = ctx.expFn; fn(…)`)使 `this` 為 undefined;測試用一般 `function`(非箭頭)記錄 `this`。
- **`get(err, 'code')` 對傳入元件所拋值不安全**: lodash `get` 不吞 getter 拋出的例外,更名/刪除/開檔三站點的 catch 內讀 code 即漏出原錯誤(最終錯誤 `code undefined, step unknown`,刪不掉的暫存檔未列入 leftovers)。同類站點全掃(`get\((err|lastErr)…'code'`)後統一改 `codeOf`。入口 `buildCtx` 的同類問題 run01 已修,但**修一處不等於掃全**。
- **路徑切分要依平台**: 只認 `/` 的 POSIX 與認 `/`、`\` 的 Windows 不同;原碼不分平台把 POSIX 的 `my\tool.bin` 切到資料夾 `my`。測試用 `Object.defineProperty(process, 'platform', { value: 'linux' })` 在 Windows 上模擬並於 finally 還原(實測可行);原本只在 Windows 才有意義的 UNC 案改成僅 Windows 執行。
- **確定性的錯誤也被當暫時性重試**: 全域 fetch 拒收帶帳密網址、回傳 Node Readable 本體的 fetch 都以 TypeError 歸 E_NETWORK 並重試 3 次,且前者把帳密原樣寫進訊息。能在入口判定者一律入口 E_ARG(帳密、`.`/`..`/冒號檔名),訊息中的網址遮蔽 `scheme://***@`。
- **變異腳本不要讓 quiet-run 的逾時殺掉**: 93 項約 55 分鐘(含 N 項),`quiet-run --timeout 3300` 在 N10 被殺、結果 JSON 只在結尾寫;逾時前的結果仍在 quiet-run 的 log(每項一行 JSON)。腳本應每項即時寫入結果檔;`quiet-run` 傳空字串參數會被丟掉(`mutate.mjs "" all` 變成 `mutate.mjs all`),要用具名參數或 `all` 旗標。
- **測試鎖會排隊很久**: 等待 3 分 00 秒、2 分 20 秒、超過 10 分鐘不等;前景 Bash 逾 10 分鐘會被移到背景,**背景再逾 10 分鐘會被殺**(排隊中之 quiet-run 隨之消失),要等長鎖的指令一開始就用 `run_in_background` 並給 `timeout: 7200000`。

## 共用外部執行檔取得 `fsEnsureBins` 之實作與外審(2026-10-28,wsemi-run04)

- **Windows 內建 tar.exe(bsdtar)解 zip 時,參數一律用相對 ASCII 路徑並以 `cwd` 指定工作夾**: repo 路徑含中文,把非 ASCII 絕對路徑經命令列交給原生程式有編碼風險;改為 `spawn(tar, ['-x','-f','archive/x.zip','-C','x','--',member], { cwd: 暫存夾 })` 實測正常.不可經 PATH 找 `tar`(Git Bash 之 GNU tar 不能解 zip),Windows 用 `<SystemRoot>\System32\tar.exe`.
- **`isestr`/`isbol` 接受包裝物件**(`new String`、`new Boolean`): 以它們檢核「之後要交給 regex、split、spawn」的值,檢查之值可能不是使用之值(terra 實測自訂 `Symbol.toPrimitive` 使檢核通過之成員在 tar 參數變為 `-P`,解出到工作夾外).安全相關之字串與布林一律 `typeof v === 'string'` / `typeof v === 'boolean'`.
- **快取校驗之行程內記憶**: 只比檔案識別不夠,須連同本次期望之 sha256 與 size;雜湊後須再比一次識別(雜湊期間被換掉);取得放入後不要立即記憶(放入至記錄之間可被換掉),下次使用時校驗一次即可.Windows 時鐘粒度約 15 ms,同一行程內緊接之改寫可能不變更 mtime,測試「竄改後重取」要以 `utimesSync` 明確改時間戳.
- **「最近一次成功」之主幹清單副本不可作為退路**: 放在可寫之快取夾,能寫者可同改副本與執行檔,使 D4 之竄改偵測失效(terra H5 實測).只作紀錄.
- **npm 12 之 `npm pack --dry-run --json` 輸出改為以套件名為鍵之物件**(npm 11 以前為陣列),讀取須兩者皆可.
- **外審者在其副本跑我的測試,可在我等鎖期間先得到基準結果**: 本輪兩槽測試鎖被他套件占用逾 1 小時,terra 第 1 輪之基準(111 passing、3 failing)指出 3 個測試本身之錯,在我取得鎖前即已修正;外審之 `out/probes/*.log` 為 UTF-16(PowerShell 重導),以 `Buffer#toString('utf16le')` 讀.
- **mocha 不加 `--exit` 時,測試內未清除之長計時器會撐住行程**: 舊碼之解壓逾時 10 分鐘固定常數,修前紅與相關變異會等滿該計時器才結束;時限改為依 `opt.totalMs` 後測試可在數秒內驗逾時.變異腳本一律加 `--exit` 與單項上限(同步無限迴圈之變異只能由外部終止).
- **Windows 之 `fs.Stats.ino` 超過 2^53**(實測約 6e16): 以數值運算偽造「識別改變」(`ino + 1`)會因浮點精度而不變;測試改動 `mtimeMs`.以 `dev:ino:size:mtimeMs:ctimeMs` 組合判定識別時,ino 之精度損失由其他欄位補足.
- **兩輪外審之安排**: 第 1 輪於等鎖期間先派(外審者在其副本跑我的測試,提早得到基準結果),第 2 輪專審修正本身;第 2 輪找出 18 條修正之缺口(零進度寫入無限迴圈、微任務競態、方法快照等),可見修正量大時單輪外審不足.

## 計時器相關函數之觀察回調(opt.onTrace)試行與負載試驗(2026-10-28,wsemi-run06)

- **「單獨重跑 5 次皆過」不代表穩定**: 主控全套失敗之 domDetect 輪詢案單獨跑皆過,但以 8 個 CPU 壓力行程(=邏輯核數)跑同一批 7 檔 10 次,domDetect 有 10 案失敗(最高 6/10).負載試驗才是判準;試驗數據與執行器用法見 R-TRACE-01 與主控任務 20261028054319 `agent-out/wsemi-run06-修正報告.md`.
- **失敗之機制是「兩跳之鏈」對「一段固定等待」**: 定期量測(setInterval)量到變化後再以 setTimeout(1) 延後發出,`await sleep(30)` 名義上夠(5ms 間隔),但 Windows 計時器刻度約 15.6ms、負載下回呼延後,取樣與發出可晚於 sleep 結束,測試即提早改下一步狀態而少一筆.節流、防抖之窗口讀值同理.
- **以觀察回調同步之要點**: ①紀錄器之 `wait` 先查已收到之事件再等(sync 模式之 emit 可早於等待者登記);②以序號對應「判定」與「結果」(domDetect 之 check.seq 對 emit/skip.seq),不以「下一個 emit」——被略過者無 emit;③測試同步改狀態後,「此後下一次取樣」必讀到新狀態;④Node 於各計時器回呼之間排空 microtask,等待者於事件所在之回呼結束後、下一個計時器前續行,故斷言不受負載影響.
- **假環境之兩個 ResizeObserver(兩盒)使 `fireRO` 一次產生兩次 check**: 第二次常為「不變化」;以事件序列斷言時須計入,且「等第一個 changed:false 之 check」會誤中第二盒之回報.
- **假時鐘**: Node 24 之 `node:test` `mock.timers`(apis 含 Date)可於 mocha 內使用,lodash throttle/debounce 經全域 `Date.now`/`setTimeout` 亦受控;以逐 1ms tick 加真實 setImmediate 讓出推進.用假時鐘之測試須於 finally 還原,且先清除被測之計時器再還原.
- **否定斷言不必改**: 「已停止、不得量測」之觀察窗在負載下只會漏抓不會誤判(B 類);改為以「停止」事件斷言停止本身,觀察窗保留.
- **子行程之看門狗改以事件判定懸置**: `settleTrace(p, tr, lateTick(n))`——已過應 settle 之週期仍有 tick 即 pending;原牆鐘 800ms 看門狗於負載下會把正常之慢輪判為 pending.
- **盤點 count 不等於站點數**: `setTimeout|setInterval` 於 src 共 218 處,其中 158 處在 JSDoc 範例;站點全集須逐處排除範例與註解(實為 60 處/32 檔).
- **以 `git archive` 副本跑舊版**: 副本放 repo 之 `./tmp/` 內,其 `node_modules` 往上解析可用;全套並行時少數測試因副本路徑而失敗(evem 測試 import node_modules 之相對路徑、lowerFind 產生器檢查、契約案例表),屬副本環境,非計時問題,比較時排除.
- **run05 之半成品**: 以「等待條件+計時器先後語意」同步(callCounter、refTicks),方向被使用者改為觀察回調而中止;還原以 Write 之腳本讀 `git show HEAD:<檔>` 寫回(不得 checkout),`git diff --stat` 無差異即還原完成.

## 觀察回調全面套用第 1 輪(dom/pm/cache 系,2026-10-28,wsemi-run07)

- **對外匯出須非底線檔名**: `toolg/gPackageIndex.mjs` 濾掉 `_` 開頭檔,故 `src/_trace.mjs` 匯出時改名 `src/getTrace.mjs`;index 於 Node 內無法整份載入(viewerjs 之 css 副檔名),測試改讀 `src/index.mjs` 文字驗匯出行.
- **派工 4 個 sonnet 子代理並行(各一組函數,約 1 小時)的做法**: 先備共通作業書(`tmp/wsemi-run07/brief-common.md`:規則、範本、變異作法、執行規範)與變異執行器 `mutate.mjs`(每組用自己的 mutRoot 名可並行),各組提示詞只列名單與案號;**子代理的 Write 被擋寫報告 .md**("Subagents should return findings as text"),報告須改文字回傳,下次作業書直接寫明.子代理收回後主控自驗: 全部測試檔同跑、舊測試(改造前,`tmp/wsemi-run07/base`)對最終 src、eslint、以 `sumMut.mjs`/`caseAttr.mjs` 彙整變異並逐案歸因.
- **獨佔負載試驗期間子代理的 `--lock` 測試排隊**(約 14~38 分鐘),子代理須先讀碼與設計,不可繞過 quiet-run;子代理 TaskStop 掉自己的 quiet-run 會留下殘留鎖,以 `quiet-run --release-stale --cwd <repo>` 回收(只回收本套件且持有者已結束者).
- **假時鐘下 `traceRec.wait` 之防懸置計時器也被取代而失效**: 缺陷版(變異)事件不來時整案懸置到 mocha 逾時,假時鐘未還原,後續案連鎖報 "MockTimers is already enabled".各組之補位: 推進後仍未完成即拋錯之 `settled()`/stuck 守門,或 `flush()`(真實 setImmediate)後斷言.根治: `timeKit.mjs` 之 wait 改用模組載入時保存之真實 `setTimeout`/`clearTimeout`(待第 2 輪前處理;本輪因 after 負載試驗進行中不得改被試檔而未改).
- **假時鐘之起算**: ①`ev.create()`(microtask 啟動第一輪)後立刻 `advance`,首個 `tick(1)` 先於該 microtask,第一輪從第 1ms 起算——先 `flush()` 再推進;②同步呼叫 waitFun 後立刻 `advance`,其 `setInterval` 建於虛擬 1ms,輪詢時刻為 21、41…(非 20、40…).
- **setIntervalHp/setTimeoutHp 以 `getTimeHp`(hrtime/performance.now)計時,mock.timers 控不到**: 不能用假時鐘,改用 onTrace 事件(fire/result)等待,子行程內等第 N 個 result 再斷言;事件欄位 `elapsed` 只可斷言下界.
- **「取樣次數比」類弱 C 案(domIsStable 403、517)**: 假時鐘下各偵測器之 round 事件逐事件相同(或次數完全相等),可取代 0.7~1.3 之比值門檻.
- **邏輯事件 vs 讓出計時器**: cache、pmQueue 之計時器只為讓出事件迴圈,原列「刻意不套」;其 C 案需要的是取值判定、任務啟停等邏輯事件,故在邏輯事件套用,事件欄位只放 key(呼叫端傳入)、序號、布林、計數,不放 fun 輸入與回傳值.
- **TTL 邊界無案抓到**: `timeDiff > timeExpired` 改 `>=` 之變異,現有輸入沒有 get 恰落在邊界;假時鐘下可補精確邊界案(未做,見 R-TRACE-01 已知限制).
- **與 JSDoc 不符之處(只列不修)**: pmDebounce 範例時間線寫 d 於 1200ms 開始執行,實作於任務完成時 `tLast = Date.now()` 重新計時,d 約 1321ms 啟動(D06 變異靠此斷言;若規格意圖是自排入起 300ms 即可執行,斷言須改);cache.update 對「已 set 未執行」之 key,首次 get 仍執行 fun 並覆寫 update 之值;cacheBd 以 `cc === null` 判無快取,fun 成功回 null 時 getFromCache 輪詢至 nMax;delay JSDoc `[ms=1]` 與程式預設 10 不符;setIntervalHp/setTimeoutHp 不驗 interval(0/負數每步到期,NaN 永不觸發);pmDebounce 之 `//clear` 區塊不可達、`tLast = tNow` 為死寫入(D05 等價變異);pmThrottle 之 `isfun(m.func)` else 分支不可達.
- **CPU 壓力不一定觸發每個 C 類案,事件迴圈阻塞才露餡**: 8 壓力行程下第 1 輪 C 類 25 案改造前僅 3 次失敗(裕度多在 100ms 以上),以 `--lag 400:1000`(每秒阻塞 400ms)則改造前 49 次案失敗、10/10 次 run 皆有(queue test1 與 cache test2/test3 各 10/10,pmQueue test1 9/10),改造後兩者皆 0.負載試驗宜併用兩種.
- **改造前基準用「動工前工作樹快照」(`git archive HEAD` 後覆蓋未提交之檔,`diff -rq --strip-trailing-cr` 驗與工作樹一致),且在派子代理之前就先跑完**: 獨佔鎖會讓子代理的 `--lock` 測試排隊,基準與實作可並行(基準只用快照,不依賴實作進度).
- **子代理收回後的驗收清單**: ①全測試檔同跑;②改造前測試對最終 src(`tmp/.../oldall`: 最終 src 副本+改造前 test 與 tools);③eslint 全檔;④逐檔 `git diff` 看 src(計數器僅 trace 時遞增、`if (trace)`、拋錯路徑的事件順序);⑤變異彙整與逐案歸因(`caseAttr.mjs` 以失敗清單計各案被幾項變異擊殺);⑥檢查變異結果檔時間是否晚於最後一次改測試/src,否則在最終碼重跑.

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
