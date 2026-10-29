# 累積經驗(2026-10-28 之舊經驗)

本檔自 `sgud/exp/experience.md` 抽出(2026-10-29 整理,wsemi-run10):各節之節號與標題不變、內容逐字未動;現行經驗與索引見 `sgud/exp/experience.md`.

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
