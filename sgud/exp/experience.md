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
- 自執行殼移入 4 件:顯式時區時鐘、結果走 JSON 檔之 CLI 執行、原子寫檔、失敗摘要(2026-11-01,主控任務 20261101152333,wsemi41,Gitea #41)
- wsemi41b 修正輪:對照原測試修三處「推定」(2026-11-01,主控任務 20261101152333)
- 移除全部 *Dyn 函數(2026-11-01,主控任務 20261101202155,wsemi-rmdyn,Gitea #44)

2026-11-02(ws286b)再整理: 本檔原約 33.0KB,將 2026-11-02 之 4 節(約 16.8KB)抽出至既有之 `sgud/exp/experience_20261102.md`(附於該檔末,節號與標題不變、內容逐字搬移),本檔只留 ws272c 起之節.需要時調閱該檔.被抽出之節:

- 整理 sgud 與 4 項待辦:偶發多一筆 timer、全套案數不一、UMD 晚載入、fs 無效路徑(2026-11-02,主控任務 20261102014123,ws265)
- 已知缺陷先修:7 個函數之整數輸入(2026-11-02,主控任務 20261102112347,ws270)
- 第二批第 2 輪「計時與流程類」19 個函數(2026-11-02,主控任務 20261102123434,ws272a)
- 第二批第 2 輪「字串、陣列、數值、編碼類」19 個函數＋3 項缺陷(2026-11-02,主控任務 20261102123434,ws272b)

2026-11-03(ws286e)再整理: 本檔原約 31.9KB,將 2026-11-02 之 4 節(約 15.2KB)抽出至 `sgud/exp/experience_20261103.md`(節號與標題不變、內容逐字搬移),本檔只留 ws286c 起之節.需要時調閱該檔.被抽出之節:

- 第二批第 2 輪「DOM 類、`_optNum` 退役、`fsTask`」＋ws272b 回報後續 6 項＋sgud 拆檔(2026-11-02,主控任務 20261102123434,ws272c)
- 第二批第 3 輪「interp1、arrGroupByMaxmin、arrLookupByMaxmin、strTruncate＋domFadeIn」(2026-11-02,主控任務 20261102171617,ws271)
- 非計算類函數必須參數遇非預期:第一類 4 個函數(2026-11-02,主控任務 20261031121854,ws286a)
- 非計算類函數必須參數遇非預期:第二批 `getTimeRange`＋字串／日期子類 4 個函數＋`cfilesize`(2026-11-02,主控任務 20261031121854,ws286b)

2026-11-12(ws430)再整理: 本檔原約 38.1KB,將 2026-11-03 至 2026-11-09 之 7 節(約 24.0KB)抽出至 `sgud/exp/experience_20261112.md`(節號與標題不變、內容逐字搬移),本檔只留 2026-11-12 起之節.被抽出之節:

- 非計算類函數必須參數遇非預期:差異比對子類 `strDiff`／`strDiffToHtml`／`arrDiff`／`matDiff`／`ltdtDiff`(2026-11-03,主控任務 20261031121854,ws286c)
- 空資料不是失敗:向量處理空進空出、`arrProduct` 任一邊為空即 throw、轉換函數狀態模式、`getCsvStrFromData([])`(2026-11-03,主控任務 20261031121854,ws286d)
- 陣列與結構子類:必須參數無效即 throw、空資料照常(2026-11-03,主控任務 20261031121854,ws286e)
- Windows 查埠改以 OS API(GetExtendedTcpTable),Get-NetTCPConnection 為退回(2026-11-05,主控任務 20261105072000,wu312)
- 查埠腳本由 Add-Type 改 Reflection.Emit(2026-11-05,主控任務 20261105072000,wu316)
- fsDownloadFileVerify 假時鐘案偶發紅:虛擬時間追過真實 I/O(2026-11-07,主控任務 20261107181536,ws314)
- 外部依賴跨主版號升級(chokidar 6、he 2):先差分實測再改測試,錯誤之平台假設不等於放寬(2026-11-09,主控任務 20261109223142,ws01)

2026-11-22(自 Claude Code 自動記憶提取)補入: 2026-09-01 至 2026-10-13 初期工作之經驗(原僅存於依資料夾路徑存放之自動記憶,路徑更名即失聯)新建 `sgud/exp/experience_20261122.md`,本檔其餘各節不動.該檔之節:

- 事件派發之定案與「連續補丁」之教訓(2026-09-07 至 2026-09-13)
- fsMergeFilesCore 失敗路徑重寫(2026-09-07)
- 下載與外部程序輸出解碼(2026-09-13)
- execCliCore／execCliSession／execCliJsonRpc／strCompareForVersion 之提案審查(2026-09-05)
- cache() 改版:共用 in-flight promise(2026-09-01)
- domDragBarAndScroll 兩輪與改建於 domDragPointer(2026-09-22)
- domDetect 改 ResizeObserver、擴充與 toleranceBounce(2026-09-25 至 2026-09-30)
- dom 偵測器與 domDrag 重構(2026-09-27)
- domIsStable 誤判修正(2026-09-14)
- isEmail 重寫(2026-09-15)
- isblob 收 File 與 UMD 之 diff2html 判定(2026-09-18)

## 假時鐘案的「推進終點」與效能時限案的「量 CPU 不量牆鐘」(2026-11-12,主控任務 20261112065727,ws290)

- **ws314 的盤點漏了兩處**: 當時結論「其餘 `advanceUntil` 站點都是預期計時器觸發或被測碼無待完成之真實 I/O」不成立——停滯案(`stallMs` 判停滯後)與 5 秒 fallback 案,計時器觸發後仍有真實 I/O(中止後關閉寫入串流、移除暫存檔),而它們以 `settle` 為推進終點、以虛擬上限(2000／8000ms)判定 `advanced`,與真實 I/O 賽跑.盤點不要靠讀碼推論「哪裡沒有真實 I/O」,改用**注入真實 I/O 完成延遲**確定性掃全檔(`node --import` 預載模組把 `fs` 回呼式方法之回呼延後 D ms;同步方法不受影響): 修前 D≤3ms 綠、D=5ms 起紅,全檔 D=20ms 紅 2 案;修後 D=80ms 全檔 0 紅.注入法不需獨佔鎖、數秒到兩分鐘一輪,遠勝負載試驗(修前修後皆 0 紅,無從分辨).
- **修法**: 預期計時器觸發之路徑,推進到該計時器之事件(`timeout`／`abort`)即停,其後以 `settle` 事件為同步點(`slowout2` 案原已如此);預期成功之路徑不推進(ws314 dripok).
- **效能上限類改量 CPU 時間**: 100 萬節點環 `clearXSS`,無負載牆鐘 1.6~1.9s、CPU 2.9~3.5s(**CPU 大於牆鐘**,GC 等執行緒並行),6 個低優先權 CPU 壓力行程下牆鐘 2.4~3.3s、CPU 3.8~4.8s(CPU 只膨脹約 25%,牆鐘膨脹約 70%);限值訂 12s(負載下最大值之 2.5 倍).不能直接把 `5000` 從牆鐘換成 CPU 值(CPU 本就達 3~5s).變異: 子行程 `Atomics.wait` 阻塞 6s(不耗 CPU)舊牆鐘斷言紅、新斷言綠.
- **負載試驗工具的限制**: `loadTrial --lag`(忙等阻塞事件迴圈)對「單一同步呼叫跑數秒」之子行程無效(`setInterval` 在同步區間內不會觸發);`loadTrial` 以 `--cwd` 指向 `git archive HEAD src test` 解出之快照,可在工作樹繼續編輯時同時量「修前」基準(快照放 `./tmp/`,內無目錄連結).Git Bash 下 `mocha --grep "/regex/"` 之前導斜線被轉成 `C:/Program Files/Git/…`(MSYS 路徑轉換),改用不含斜線之子字串(中文子字串可用).
- **外審採計**: sonnet 獨立審 4 點,屬實 2 點(matDiff JSDoc 把檢測序寫成「各自陣列、各列」與實作〔四段〕不符,已修;`removeTemp` 以假計時器 `sleep` 重試〔EBUSY／EPERM／EACCES〕於假時鐘停推後會懸置,與既有 `slowout2` 案同,列已知缺口),1 點(`iseobj` 的 `for…in` 含繼承可列舉鍵與 `getltdtkeys` 自有鍵不一致)為既有不一致、依使用者指定之 `iseobj` 未收緊,列需裁示.

## 依類別統一無效輸入之處置:探針全格比對、修前副本、規格例與既有裁定衝突(2026-11-12,主控任務 20261112065727,ws426)

- **類別級裁示先以探針全格盤點,再動碼**: 對類別內每個函數之每個位置參數代入同一組 13 種無效值(`undefined`、`null`、`''`、`'x'`、`123`、`-1`、`1.5`、`Infinity`、`NaN`、`true`、`{}`、`[]`、函數),回傳歸類為空值／原值(與某輸入深等)／拋錯／其他,另攔 console 計數;修前修後各存一份 JSON 逐格比對.非隨機函數之差異格恰為預期改變之格,即「沒有改到不該改的」之證據;隨機函數只比類別.「回原值」一欄直接列出 Q1-c 要改之站點(`arrInsert`／`arrPull`／`arrPullAt` 之次參數),比讀碼快且不漏.
- **修前紅不 stash 不 checkout**: 工作樹另有前一輪之未提交改動時,把 `src`、`test` 整份複製到 `./tmp/<案>/before/`,只把本輪改動之 src 檔以 `git show HEAD:<檔>` 覆回(前一輪改動之檔保留工作樹版),刪掉本輪新增之內部檔;副本在 repo 內,`node_modules` 由上層解析,測試以相對路徑 import 而自動指向副本之 src.變異驗證同法(副本內逐一植入、跑後還原並比對內容).
- **規格之例可能來自過期之「現況」欄**: Q1-c 之例 `strTruncate('abc', -1)` → `''` 取自規格 §5.3 C5 之現況欄(第 271 項前寫的「回原字串」),而 `strTruncate` 之 `maxLen` 已於 11-02 由使用者定為必須參數並拋錯、下游已先改.照例改會推翻已實作之裁定;先讀現行程式碼與 §11 之既有裁定,衝突者維持既有裁定並列需裁示,不自行取捨.
- **範圍參數之 `null`**: 隨機系 JSDoc 範例與既有測試皆以 `pseudoRandomIntRange(null, null, 123)` 取預設範圍;改為「無效即拋錯」時 `null` 仍依 §1 選填鍵之定義視為未給,否則既有範例與呼叫端一併壞掉.
- **表驅動建構器換用時之案數差**: `defineOptParam` 之無效清單 `INVALID` 含 `null`、`undefined` 兩項,與其「未給」案重複;新建構器濾掉後每個參數少 2 案.全套案數差要能逐項算出(本輪 +25 新檔、−40＝20 參數 × 2),不能只看 0 failing.

## 字串取代之取代值字面化:先找「補償者」、盤點用 AST、不為求全紅而改測法(2026-11-12,主控任務 20261112065727,wsrep)

- **修被別處補償的缺陷,先找補償者**: `replace` 之 `$` 展開早被 `replaceObj`(預先把 value 之 `$` 逸出為 `$$`)與 `replacePlus`(函式回傳)各自繞開(ws286b,見 `experience_20261103.md` 該節「不改 `replace`〔範圍外〕」).改 `replace` 本身後,`replaceObj` 之逸出反成錯誤來源(每個 `$` 變 `$$`),須同輪移除.盤點不只列「有缺陷的站點」,也列「為繞開缺陷而寫的補償站點」——此例以「取代值為含 `$` 之字面常數(`'$$$$'`)」的掃描分類現形;只改 `replace` 而保留 `replaceObj` 之逸出時(變異 M7)共 16 案紅(含掃描測試 2 案,其餘 14 案為 `replaceObj` 既有案).
- **盤點用 AST,不用 Grep 行數**: Grep 69 行含 JSDoc 範例與註解 6 行,且單行多呼叫(`getDiagSecrets.mjs:177` 三個);以 `@babel/parser`(estree 外掛,同 `bigintLiteralScan.mjs`)分類第 2 引數(不含 `$` 字面／含 `$` 字面／函式／其餘)得 67 站點.「刻意含 `$` 之全集」釘進測試(新增含 `$` 之字面取代值或變數取代值即紅),掃描器本身另附正反例(註解、字串內文字不計;optional call、computed 成員、鏈式皆計).
- **`$<x>`、`$1` 於字串 pattern 修前亦字面**(字串 pattern 無捕獲群):派工書要求「各一案修前紅」,實測只有 `$&`、`$'`、`` $` ``、`$$` 四者能紅(新增 11 案中修前 9 案紅),其餘兩案為日後改用正規式之守門;如實回報,不為了「全紅」而改測法.
- **結構釘住不綁實作形式**: 第一版測試釘「`replace.mjs` 恰有一個 `replaceAll` 函式站點」,等價變異(改 `split/join`)被誤殺;改為只釘規則(無 `dynamic` 站點)與行為,等價變異存活.
- **變異於 `src` 副本**: 副本放 `./tmp/<案>/mut/{src,test}`(`test/tools` 一併複製),測試以相對路徑 import 自動指向副本,`@babel/parser` 與其他依賴由上層 `node_modules` 解析;mocha 以絕對路徑 `node_modules/mocha/bin/mocha.js` 由腳本 `spawnSync`(`windowsHide`),整支腳本經 `quiet-run --lock` 執行一次(約 1 分鐘).`to` 字串含 `$` 時以函式形式 `text.replace(from, () => to)` 取代,否則變異文字本身被展開(正是本規則所防之事).
- **eslint `no-template-curly-in-string`**: 測試內以一般引號字串寫含 `${r}` 之樣板字串原始碼會被擋,改 `'…$' + '{r}…'` 拆開(同 `_srcBigIntLiteral.test.mjs` 作法).

## 結構運算與參數定義:盤點之「被吞」須以實呼叫核實、判定原則優先於前批回退、修前紅以 HEAD 副本跑同批測試、不能直接跑之變異(2026-11-19,主控任務 20261116102625,ws492h)

- **盤點報告之「單一空元素被吞」須逐函數實呼叫核實,不照單全收**: 報告列 18 函數,實呼叫 18 × 6 種(`[null]`、`[undefined]`、`['']`、`[{}]`、`[[]]`、`[NaN]`)與多個空元素比對後,`addExcelWorksheetFromData`、`arrInsert`、`flattenTree`、`objSortByKeys`、`treeToFilepath` 原即不被吞(盤點之探測因另一參數無效而得同結果,或已於前批改);另 `binstr`、`arrLookupByMaxmin` 之結果與 `[x, x]` 相同(元素無效而非被當空陣列),測試以「與兩個同種元素結果相同」鎖定,不硬斷言「保留」.探針腳本以 `[]` 與 `[x]` 與 `[x, x]` 三列並排,一眼分出.
- **`treeObj` 從未拋錯**: 規格列「原拋錯 12 個」含 `treeObj`,實呼叫其 `data` 為任意值(傳入 hook,不拋錯);列規格與實況之差於報告,不為「符合清單」而改程式.`arrFind` 純量自動轉陣列為 JSDoc 明載之收法,逐字適用會改有效輸入之結果,列待裁示而不改.
- **「第 1 參數無效先回空、不檢查次參數」讀法**: 規格字面「一律回空結果、不拋錯;次參數依既有裁定」,取最小改動——於既有第 1 參數檢測處把 `throw` 換成 `return`(順序不變);兩者皆無效時回空.另一讀法(先檢次參數再回空)會使 `arrSep('x', 0)` 拋錯而與「一律」字面不合.
- **判定原則優先於前批之 K3 回退**: 第 221 項第 5 項「簽名預設或 JSDoc `[]` 才算 opt,程式碼回退不單獨作依據」——`domCompareText.title`(無預設、JSDoc 未標可選)批 4 以 K3 回退 `'Text'`,依原則為必須參數;我初版反向把 JSDoc 改成 `[title='Text']`(正是原則禁止之以回退為依據),sonnet 複審指出後改為拋錯.判 opt 與否先看簽名與 JSDoc,不看函數體.
- **修前紅以 HEAD 副本跑「同批之新與改測試」**: `git archive HEAD src | tar -x -C ./tmp/<任務>/head` 後 `cp -r test ./tmp/<任務>/head/test`(帶 `test/tools/`),以 `npx mocha ./tmp/<任務>/head/test/<檔>…` 一次跑 18 檔,得 2095 案中 686 紅(同檔對新碼 0 紅);不必逐檔另備副本.
- **變異不可直接跑會使被測函數無窮迴圈或巨量配置者**: `arrSep` 拿掉 `use: 'count'`／`min: 1`、`color.spread*` 拿掉個數上限,測試內之 `4294967296` 輸入會使變異版迴圈或配置數十億個空陣列;改變異「預設值」(`num = 1` → `2`)、「守門」(`if (false)`)或單行回退(`return [rgba]`),先確認每個變異之最壞輸入有限.
- **等價變異要列**: `arrSort` 之 `vall.length === 0` 捷徑拿掉後,空陣列仍經後續流程回 `[]`(`every` 對空陣列為真、`orderInds([])` 為 `[]`),結果同,為等價;報告列「48 擊殺、1 等價」,不為擊殺它而補無鑑別力之斷言.
- **測試不納入尚未裁定之議題**: `isestr(new String('x'))` 目前為 `true`(包裝物件政策屬 W-20 另批),本批之 `domCompareText.title` 案不含包裝物件,以免日後 W-20 改動時此案無謂失敗.
- **Edit 於 CRLF 工作樹**: 以 Edit 改過之檔變 `w/lf`(`git ls-files --eol` 見),`git diff` 不受影響(autocrlf);變異腳本之比對字串仍只取單行片段.

## 計時與流程函數之函數參數檢測:已撤銷 Proxy 使 isfun 拋錯、檢測須先於 opt 警告、以替身計數驗「不啟動」、事件迴圈一輪驗「不排隊」(2026-11-18,主控任務 20261116102625,ws492g)

- **`isfun`(lodash `isFunction`)對已撤銷之 Proxy 拋 `TypeError`,而 `typeof` 仍為 `'function'`(函數 Proxy)**: 實測 HEAD 之 `pmQueue` 以已撤銷 Proxy 為任務時,佇列監聽器內 `isfun` 拋錯,該任務與其後任務永不 settle 並產生 unhandledRejection;`pmThrottle` 之 `run` 同步外拋;`pmMap`／`pmSeries` 同步外拋.故以 reject 或建構通道回報之函數,函數判定須經 try 包裝(內部 `src/_isFunSafe.mjs`),不可直接用 `isfun`;`isfun` 本身不改(裁示 10).測試值軸須含「已撤銷之物件 Proxy」與「已撤銷之函數 Proxy」兩項(`test/tools/caseKit.mjs` 之 `nonFunValues()`),只有 `undefined`、`null`、數字、字串者測不到此路徑.
- **`fun` 之檢測須置於 `optVal`(opt 解析)之前**: `optVal` 於 `opt.debug: true` 且 `interval` 等鍵無效時會輸出警告,是副作用;「先於任何副作用」之測試以「`fun` 無效且 `interval: 'abc'`、`debug: true`、`funLog` 收集」驗 `warns` 為空,並以變異把檢測移到 `optVal` 之後(ST4、SI4、CB4)確認轉紅.警告每行程每鍵只輸出一次(去重),故陽性對照(有效 `fun` 時應收到 1 則警告)須與 12 個無效案同處一個子行程且**排在其後**(無效案本就不警告,不消耗去重額度),順序顛倒會使對照假紅.
- **「不啟動計時器」以替身計數驗,不以等待驗**: `getGlobal()` 於 Node 取得 `global`,測試於呼叫前後把 `globalThis.setTimeout` 換成計數替身(`finally` 還原),無效 `fun` 時計數為 0,有效 `fun` 時為 1(陽性對照);另掛 `onTrace` 收集事件(應為空)與 `console.log` 攔截(應為空).到期時才變為無法判定為函數者(建立後撤銷之 Proxy)之防禦路徑另以 `hpTraceRunner` 之 `*RevokedAfterStart` 以事件同步驗.
- **「不排入該 key 之佇列」以事件迴圈一輪驗**: `pmKeyMutex` 之同 key 前一任務停在 gate(未放行)時呼叫非函數,以 `await new Promise((r) => setImmediate(r))` 讓出一輪後即須已 reject(若被排隊則須等 gate 放行),再放行並確認其後同 key 任務之順序;不用 `delay(N)` 後斷言.
- **`importResources` 之驗證**: 「先於任何載入」以最小 DOM 替身之 `head.childNodes.length` 差判定(陣列 `['a1.css', 5]` 之 `'a1.css'` 亦不載入),「不登記載入狀態」以其後同一路徑之有效呼叫仍新增 1 個節點判定;「不改寫呼叫端輸入」以凍結之陣列與物件(修前於嚴格模式拋錯)與呼叫前後 `JSON.stringify` 相同兩法同驗.舊行為以 `git archive HEAD` 副本實測(`importResources(['abc.css'])` 後輸入變 `[{"path":"abc.css","type":"css"}]`;`{ path: 5 }` 之訊息為 `invalid pathItem.type: unknow`),帳本之舊行為敘述以此為準,不憑讀碼.
- **變異腳本再犯 CRLF 陷阱**: 多行 `find` 於 CRLF 檔(工作樹混有 CRLF 與 LF,`git config core.autocrlf` 為 true)得 0 次;本輪腳本把「`from` 非恰好 1 次」記為 `skipped` 而不算擊殺,故 3 項被略過可見,改為依檔之換行轉換後重跑補齊(46 項全擊殺);腳本若把「找不到」當成功植入則會假報擊殺.
- **自派之 sonnet 子代理遇週額度上限(HTTP 429)時只回部分輸出甚至無輸出**: 下游盤點與獨立複審兩個子代理皆於起步後數十秒中止;盤點改由主責 agent 自行以 Grep 完成(呼叫站點少,逐站讀碼可行),獨立複審無法執行,報告須如實列為「未執行」而不以自審代替.
- **(ws492g2 修正輪,2026-11-18)「入口通過檢測、其後才失效」是另一條路徑,既有 `revokedFn()`(建立即撤銷)測不到**: 入口檢測只保證「當下為函數」,其後仍有執行點(`pmThrottle` 之計時器回呼、`importResources` 之 `load` 事件回呼)再用到該值;凡「入口驗一次、之後於回呼內再用」之函數,回呼內須再經 `isFunSafe`,且該回呼若為計時器或事件回呼,外拋會變成 unhandledRejection／未捕捉例外而非呼叫端可接之錯誤(`pmThrottle` 更使 `running` 停在 `true`、計時器不停,其後任務永不 settle).測試須「撤銷前有效」之函數 Proxy(`test/tools/caseKit.mjs` 之 `revocableFn()`),呼叫後立即 `revoke()`,於回呼觸發前撤銷;以觀察回調事件(`onTrace` 之 `done`、`stop`)同步,牆鐘逾時只作懸置之兜底,且懸置時提前返回以免後續案例逾子行程時限.
- **(ws492g2)V19 訊息之名稱須等於實際參數名,以 `Function.prototype.toString` 取參數名與訊息名稱比對**即可鎖住(不必另寫字面比對),參數改名時只改一處即不會漏;變異「參數名改回 `func`」「參數名改 `fn`」「訊息名稱改 `func`」皆能擊殺.
- **(ws492g2)判準一致要連引擎之「可呼叫」一併對齊**: `pmChain` 原把元素交給 `then`,以引擎之可呼叫為準,async generator 函數(`isfun` 為 `false`)與已撤銷之函數 Proxy(`isfun` 拋錯)與同族(`pmMap`／`pmSeries`／`pmQueue`)判準不同;改以 `isFunSafe` 判定後,測試把原本「排除這兩值之 `continue`」移除、12 值全測,並加斷言鎖定值集合含此兩值,免日後再被排除.下游 `pmChain(` 站點以 Grep 盤點為 0(同名區域變數與打包產物不計).

## 外部程序三函數之輸入檢測:殺程序類之測試先攔截再談修前紅、替身要含載入時被取走之 API、變異腳本之陷阱(2026-11-18,主控任務 20261116102625,ws492f)

- **不可逆動作函數之測試,修前紅亦須先攔截**: 被測函數之動作是殺程序(`execProcessKillPid`),修前之碼對 `null`／`''`／`[]`／`0` 會真的呼叫 `taskkill /pid 0`(POSIX 為殺行程群組),故「無效 pid 先於殺程序」之測試與修前紅一律在子行程以替身取代 `child_process.spawn/exec/execFile/…` 與 `process.kill`(`test/tools/execArgGuardRunner.mjs`),替身只記錄、不呼叫真實函數;以**記錄為空**判定而不是看結果字串.替身須於載入被測模組**之前**掛上: `tree-kill` 於載入時即 `var spawn = childProcess.spawn; var exec = childProcess.exec`,事後改 `cp.exec` 無效;故 runner 以動態 `import()` 載入 src.真的殺程序之案只對測試自己起之子進程,且修前亦不含「Number() 會轉成別人 pid」之值(`null`、`''`、`[]`、`5n`、`0`、負數).
- **陽性對照使「0 次」不空洞**: 每個替身另有直接呼叫之對照案(`stubControl`),有效輸入各模式恰好 1 次呼叫(`procOk`);獨立複審指出三處原漏洞: ①POSIX 之 `ps`／`pgrep` 替身若回離開碼 0 且無輸出,tree-kill 內部對 `''.match()` 之 null 呼叫 `forEach` 而崩潰,須回離開碼 1(無子行程);②同步版(`spawnSync`、`execSync`、`execFileSync`)與 `fork` 亦須攔截,否則「替身不可能真建立程序」之宣稱不成立;③win32 上 tree-kill 走 `exec`,`process.kill` 之替身無陽性對照,故另加直接呼叫.
- **`isarr` 與 `isstr` 不可作入口檢測**: `isarr` 以 `Object.prototype.toString.call(v) === '[object Array]'` 判定,`{ [Symbol.toStringTag]: 'Array', length: 0 }` 為 true(迴圈不執行即被當空參數放行);`isstr` 為 lodash `isString`,`new String('x')` 為 true.入口檢測用 `Array.isArray` 與 `typeof v === 'string'`;被檢測之容器只讀一次(`let n = args.length`、`let v = args[i]`)並以快照使用,測試以「第二次讀取即回 `undefined` 之 Proxy」驗讀取次數.
- **node 對 spawn 之 args 元素一律轉字串**(實測 spawn／execFile／exec 三模式皆然): `undefined`、`null`、`true`、`{}` 變 `'undefined'`、`'null'`、`'true'`、`'[object Object]'` 照常傳給程式;exec 模式 `prog: ''` 時 `args[0]` 成為被執行之指令(`execProcess('', ['x'], { mode: 'exec' })` 執行 `x`).故「檢測之值即使用之值」須於入口把元素種類宣告為字串或有限數字並轉成快照.
- **`iseint(v, { use: 'int32', min: 1 })` 即 pid 之判定**: `' 12 '`、`'+5'`、`'1.0'`、`'4.2e5'` 為 true,`'0x10'`、`'12abc'`、全形數字、`0`、`-0`、`1.5`、`2147483648`、`4294967294`、`2 ** 53`、`1e21`、`5n`、`Symbol`、包裝物件、`{ valueOf }`、`[5]` 為 false;上限取 int32 之理由: POSIX `pid_t` 為 int,`4294967294` 經 int 轉換環繞為 -2(`kill(-2)` 殺行程群組 2).
- **變異腳本三陷阱**: ①工作樹之檔可能混有 CRLF 與 LF(`git ls-files --eol` 之 `w/crlf`、`w/lf`;`src/execProcess.mjs` 為 CRLF),多行 `find` 須依目標檔之換行轉換,否則靜默 `FIND_COUNT_0`;②植入後若使被測碼 spawn 出「等 stdin 之 `node`」(`list = []` 時 `node` 無參數進入 REPL),`mocha --bail` 結束後該子行程仍持句柄而 mocha 不退出,`spawnSync` 之 timeout 兜底(600 秒)後視為擊殺並標註;③先跑一次「未變異之副本」對照(`BASELINE PASS`),否則副本壞掉會使 30 毫秒即「全擊殺」而不自知.存活變異 P13(數字元素不轉字串)為等價(node 與 `[].join` 皆自行轉字串,無可觀察差),P24(字串型 args 於 exec 不視為指令列)為既有測試缺口,補「`-p 1+1` 原樣串接、`['-p', '1 + 1']` 加引號」一案後擊殺.
- **既有測試依賴舊契約者,先列後改**: 20 案失敗皆為訊息字面或 onTrace 之 `reason`(`'codeCmd'` 移除、含 NUL 之 args 由 `'spawn'` 改 `'args'`);`execFailRunner` 之 `procThrownValues`／`inputUnreadableProc` 之 prog 為 Proxy 者由 `spawn[UNKNOWN]:` 改 `invalid prog`(prog 須為原始字串,不再觸及其內容).下游盤點發現使用端 w-data-mseed 之測試比對 `cwd is not an existing folder: <cwd>` 與替身之原生訊息,故 cwd 說明本批不去值.

## DOM 與下載函數之輸入檢測:契約先行、假 DOM 仿原生語義、修前紅逐檔執行、真 Chromium 並排(2026-11-18,主控任務 20261116102625,ws492e)

- **假 DOM 之 `querySelector` 要仿原生之「字串強制轉型＋語法錯誤拋 `SyntaxError` 且訊息含選擇器全文」**(`test/tools/domArgKit.mjs` 之 `mkQueryEnv`),測試才能證明「檢測先於呼叫原生 API」:`domFind(null)` 在真瀏覽器不拋錯而得 `null`(`'null'` 被當標籤名)、`domFind(5)` 拋 `SyntaxError`,以呼叫記錄斷言「無效輸入時原生 API 呼叫數為 0」比只驗回傳值可靠.
- **`Blob.text()` 去 BOM、`mock.timers` 對負數與超限延遲一律當 1 毫秒**:前者使「含 BOM 之下載」案同綠,後者使「非預期延遲改預設」之序列比對抓不到夾限變異;各以 `arrayBuffer()` 位元組解碼、包裝 `globalThis.setTimeout` 觀察引數處理(見 feedback 2026-11-18).
- **修前紅逐檔以獨立 mocha 行程執行**: 合跑時舊碼於計時器回呼拋未捕捉例外會中止整批(首次只跑到 268 案);腳本 `runEach` 對每檔 `spawnSync` 並彙整 passing／failing,另留 `--exit`.`domShowInputDatatime` 之舊碼仍中止於第 12 案,屬舊碼缺陷之證據而非測試問題.
- **真 Chromium 並排載入修前／修後之 `src`**: 本機 http 伺服器供 `/new/`、`/old/`(`git archive HEAD src`)與 `/nm/`(`node_modules`),import map 對應 `lodash-es/`、`he`、`seamless-scroll-polyfill`;`eventemitter3`(CJS 之 `index.mjs` 轉出 `index.js`)與 `dayjs` 於瀏覽器無法直接載入,以最小替身供應(只供載入,不用其行為),替身會污染用到它之修前列(`domShowInputDatatime` 修前列即因 `d.isValid` 缺而非真缺陷,報告不採).下載以 Playwright 之 `download` 事件取檔名與位元組,`page.evaluate` 之字串形式避免函式序列化問題.
- **變異存活要先判是否等價,再決定補案或不補**: `domAlert` 之 `sget(opt, 'textColor', '#000')` 預設值被 `sstyle` 之預設蓋過而等價(不補);`domScrollIntoView` 拿掉 `isOptObj` 因 `read` 對非物件恆回 `undefined` 而等價於僅在「帶屬性之陣列與函數」時可區分,補該案後擊殺;`delay` 之夾限變異則須觀察交給 `setTimeout` 之引數才抓得到.
- **契約文件作為審查提示詞**: 把「兩條通則＋逐函數契約＋審查重點」寫成單檔 `contract.md` 並附新舊碼副本供審查者唯讀,內部獨立複審(sonnet 子代理)129 次工具呼叫、約 8 分鐘提出 8 條,6 條屬實;其中最有價值者為「既有測試未隨 JSDoc 更新而全套會紅」(未於單檔運行時發現,全套才現形)——**改 JSDoc 型別前先 Grep 測試是否以 `indexOf('@returns {…}')` 斷言 JSDoc 字面**(`test/jsdocFixes.test.mjs`).
- **下游盤點兩次**: ①呼叫站點(函數名 `\(` 之 Grep,含 `.vue`),逐站判斷引數來源與是否用回傳值;②舊訊息字面對 `src/` 與 `test/` 各 Grep 一次,命中須判斷是否同形之自撰字串(`'invalid filename'`、`'data is not an array'` 於他套件為各自撰寫).

## 瀏覽器函數之假 DOM 單元測試與真 Chromium 並排驗證、opt 改 iseint 之觀察法(2026-11-12,主控任務 20261112220545,ws430)

- **假 DOM 斷言要與 DOM 建構方式無關**: `domAlert` 由「整段 `innerHTML`」改為 `createElement` 建外框與按鈕;若斷言讀「元素之 style 屬性」,修前版(只有 innerHTML 字串)之紅是因結構不同而非行為不同.改為收集「元素 style 屬性＋各元素 `innerHTML` 內之 `style="…"`」後去空白比對(`test/domAlert.test.mjs` 之 `styleTexts`),修前紅之原因即為 D5 之值(如 `padding:5px 0px 0px 0px`).結構本身(✕ 是否為可綁事件之元素)另以 D7 案斷言.
- **模組層狀態之函數每案載入新模組實例**: `domAlert` 有模組層佇列與 `timer`;`mock.timers.reset()` 丟掉其計時器後 `timer` 仍非 null,下一案不再建計時器.以 `import('../src/domAlert.mjs?ws430=' + n)` 每案取新實例(相依模組共用),互不影響;修前版之 NaN 永不關閉也不會拖累後續案.
- **`mock.timers` 之單次大步推進不會依序觸發推進期間才建立之計時器**: `domFadeIn` 於事件當下 `setTimeout` 再 `setInterval`,`tick(700)` 一次後透明度未變;改每 10ms `tick` 一次即正常.事件前已存在之計時器(`domAlert` 之偵測 `setInterval`)一次大步推進無妨.
- **以 Promise 狀態追蹤做事件同步**: `track(p)` 於建立時掛 `then` 記狀態、`flush()` 只跑微任務;按 ✕(同步派送 click)後 flush 即可判定是否已 resolve,不推進時間、修前不懸置(`test/tools/browserFakeKit.mjs`).
- **真 Chromium 並排比對修前修後**: 起本機 http 伺服器(`listen(0)`),頁面以 import map 對 `lodash-es/`,同時供 `/src/`(本輪)與 `/old/src/`(`git archive HEAD` 解出之修前 src),同一瀏覽器兩個 context 各載一版,比較 `getBoundingClientRect`、`getComputedStyle` 與元素截圖之逐像素差(頁內以 canvas 解 PNG 計數,免 pngjs).嚴格 CSP(`script-src 'self' 'nonce-…'`;import map 帶 nonce)下行內事件屬性被擋,可直接重現修前 ✕ 失效.
- **Playwright 之 `page.evaluate` 帶使用者啟用**,headless shell 即使不加 `--disable-popup-blocking`、等 6 秒使啟用過期仍不攔 `window.open`;本機只有 headless shell(完整版 chromium 未安裝),「被攔截回 null」無法以真瀏覽器重現,只能以假 `window.open` 回 null 之單元測試覆蓋.`page.clock.install()` 可驗 `revokeObjectURL` 之延遲(59 秒仍可 fetch、60 秒後失敗、已載入分頁內容仍在、重新整理 `ERR_FILE_NOT_FOUND`).
- **opt 改 iseint 之觀察法**: 能於短時間觀察者以子行程之 `onTrace` 事件斷言(`retry` 之 ms、`stop`／`kill` 之 ms、`full` 之 size、`done` 之 n);只在很久之後才可觀察者(逾時 120 秒、不限時)以 `opt.debug` 警告斷言所採預設(警告與取值同一 `optVal` 路徑).`maxRetries: Infinity` 之修前紅會無限重試:測試以「第 2 次嘗試事件或 done 先到者」resolve,修前副本跑 mocha 加 `--exit`.
- **前批「本批不改」之鎖定案**: `isenumCallersRound.test.mjs` 鎖「dig 之 idig 本批不改」、`execCliSession.test.mjs` 鎖「stderrKeep 收包裝物件」;本批規格改變時全套才紅,屬規格改變而非退化,改寫預期並於註解寫明出處(規格項、帳本條號).動工前可先以 `Grep` 搜 `unchanged in this batch`、`Number wrapper` 類字樣預找.
- **判型不可信 `Object.prototype.toString` 之標籤**(外審 terra 指出,屬實): `{ [Symbol.toStringTag]: 'ArrayBuffer' }` 可通過 `isblob`／`isu8arr`／`isstr` 式之標籤判定,`toString` 亦會叫用被檢測值之 `@@toStringTag` 存取器(拋錯之 getter、已撤銷之 Proxy 直接外洩錯誤).入口之品牌判定改用內建存取器之內部槽檢查(`Blob.prototype.size`、`ArrayBuffer.prototype.byteLength`〔SharedArrayBuffer 拋錯〕、`detached`、`ArrayBuffer.isView`＋`%TypedArray%.prototype.buffer`、`%TypedArray%.prototype[@@toStringTag]`),字串用 `typeof`;跨 realm(iframe、`vm.createContext`)之真物件照常可用(`src/_browserData.mjs`).`ArrayBuffer.isView` 對 SharedArrayBuffer 為底之檢視亦為 true,而瀏覽器 `new Blob([view])` 對其拋 TypeError——只看 `isView` 不夠.
- **複核又抓到之三點**(第二次外審,屬實): ①以 `isobj`(標籤)判「opt 是否為物件」會把帶自訂 `Symbol.toStringTag` 之一般物件誤判為非物件而丟掉其設定——修前直接讀鍵者改為判型時,判型本身不可依標籤,用 `typeof`＋`Array.isArray`(包 try);②新語言特性(`ArrayBuffer.prototype.detached`)不可當唯一判據,無者要有退路(零長度再以 `new Uint8Array(v)` 是否拋錯判分離);③Node 之 `Blob.prototype.size` 以屬性(`kHandle`)判定,Proxy 與以真 Blob 為原型之物件可通過——Node 與瀏覽器之「內建存取器」品牌強度不同,測試在 Node 綠不代表瀏覽器語意,反之亦然.另:「存取器之讀取次數」測試要直接傳入帶存取器之物件,物件展開(`{ ...opt }`)本身就會讀一次.
- **外審探到之「只驗警告」缺口**: 以 `opt.debug` 警告驗逾時預設,變異「保留警告、仍用舊夾限值」照樣全綠;改以側錄 `globalThis.setTimeout` 之毫秒參數直接驗交給計時器之值(mocha 自身於載入時已取 `setTimeout` 參照,不受側錄影響).
- **工作樹為 CRLF(autocrlf=true,索引 LF)**: Write 寫出之檔為 LF(提交時正規化,無妨),以腳本拼接既有 CRLF 檔時須以 `/\r?\n/` 切行並依原檔換行接回,否則定位字串比對不到.

## 逐函數裁定之實作:修前行為先實測、字面需求之歧義、寫檔工具吃掉跳脫字元、變異找出漏格(2026-11-14,主控任務 20261114175457,ws430b)

- **「修前」敘述一律以 HEAD 副本實測**: 破壞性變更帳本寫「由 X → Y」時,X 憑讀碼推論常不準——`composeToTree([{id:1},{}])` 修前 `{}` 是照常成為頂層節點(不是拋錯或略過)、`1` 與 `'1'` 修前是把 `parentId: 1` 之子節點掛到 `'1'` 下(kp 以物件鍵共用)、`arrFilterByKeywords` 之陣列元素 `['abc']` 修前會匹配(`Array#indexOf`)而數字元素拋 TypeError.以 `git archive HEAD src` 之副本寫探針實跑後才寫入帳本.
- **一條規則被實作兩次時,變異會等價存活**: `composeToTree` 之孤兒在「頂層判定」與「循環斷開之防護分支(找不到父即以自身為頂層)」兩處都會被置頂,拿掉前者之變異結果不變;同理 `ltdt2vrtsable` 之缺欄檢查被「格非物件」檢查覆蓋,只有「繼承而來之欄」才分得開.寫變異前先想「另一條路是否會補上」,補一個只有該條路能處理之案(繼承欄、`''` 之 id 與 parentId).
- **Write 工具把 `　` 寫成真正的全形空白**: 正規式 `/[ 　]/` 與 JSDoc 範例之 `'abc　def'` 落地後是不可見字元,eslint `no-irregular-whitespace` 擋下(字串內不擋,但仍不可讀).改以 `String.fromCharCode(0x3000)` 組成(src 之 `RE_SEP`、測試之 `fw`),寫完以 `grep -c $'\xe3\x80\x80'` 回驗.
- **裁定表字面之歧義照字面實作並列需確認**: `+a b`「含全部必要關鍵字者才命中;權重依一般關鍵字計算」——含必要者命中而一般關鍵字一個都沒含時權重為 0(`{ hasKeyword: true, weight: 0 }`);另一讀法「仍須含一般關鍵字」與字面不符.照字面做、JSDoc 範例寫明、報告列待主控確認,不自行另定.
- **測試改寫之判準**: 既有測試之期望值與裁定衝突者(如 `ltdtmerge` 以 lodash merge 為對照之 400 組隨機差分、鎖「繼承鍵亦合併」兩案)改寫時,對照器本身依裁定調整(陣列來源列視為 `undefined` 再交 lodash merge),而不是刪掉差分案;改寫處註明裁定表節號.全套才紅之「乙 未改變者之守門」(`invalidInputQ1`)同樣屬規格改變.
- **外審額度**: 本輪 Codex 帳號(terra)、Argon、agy 之 Claude/GPT 組皆已用盡,依序改派 agy `gemini-4-hydrogen-high`;查額度用 `quota-agy.mjs`,Codex 則以最小探測之 stderr(`You've hit your usage limit … try again at …`)判定.

## 換底層演算法而保留結果:抽出單一擁有者、修前副本差分、範例輸出以實跑重產、時區測試以子行程設 TZ(2026-11-15,主控任務 20261115170127,ws430c/ws430c2)

- **要保留「語意」時先找出語意藏在哪**: `arrDiff` 之矩陣模式原把儲存格串成 `欄位指標∶值⟋`,modify 列再以 `arrDiff1D` 逐格比對——欄位指標是比對鍵的一部分,改用 `diffArrays` 時若只比值,JSDoc 範例之 `dfs` 會由 8 格變 9 格(刪 123、加 45.6 被拆開).格之鍵改為 `[欄位指標, 文字]` 後 `dfs` 逐一相同.判斷依據是修前副本與新碼對 11003 組隨機輸入(值不含分隔字元)之 `dfs` 差分為 0,而不是讀碼推論.
- **把配對演算法原樣抽出、兩邊共用**: `strDiff` 之「先刪後增配對為 modify」抽為 `_diffPair`(含原 `k += ic + 1` 之跳行),以 Write 寫腳本只改 `src/strDiff.mjs` 之該段(標記字串須唯一),`strDiff` 結果於差分中亦 0 處不同.不要在 `arrDiff` 另寫一份近似版本.
- **JSDoc 範例輸出以實跑重產**: 寫一支腳本把 `@example` 去掉 ` * ` 前綴後執行,依呼叫行把輸出對應到其後之 `// =>` 區塊;先只列差異(此即「dfs 不變」之證據:`dfs` 區塊 0 處改變,只有 `diff` 區塊與一處 `0 df [` 筆誤),確認後才寫回.巢狀深之輸出用 `console.dir(x, { depth: null })`,否則 Node 預設深度 2 印出 `[Array]`.
- **時區測試以 node 子行程設定 TZ**: Git Bash 之 `TZ=America/New_York node …` 會把帶 `/` 之 TZ 丟掉(`process.env.TZ` 為 undefined,只有 `TZ=UTC` 有效);改由測試以 `spawnSync(process.execPath, [runner], { env: { ...process.env, TZ } })` 執行,Windows 之 Node 對 IANA 名稱生效(Asia/Taipei 1979-07-01 00:00～00:59、America/New_York 2026-03-08 02:00～02:59 為夏令空窗).
- **被取代之依賴可能承載別的契約**: `istimeTZ` 改為不經 dayjs 驗證後,`timemsTZ2past` 於 dayjs 不可用時由「拋 `invalid dayjs`」變為「回 `時間轉換失敗`」——原拋錯其實來自 `istimemsTZ` 之 dayjs 呼叫(其自身之 `isfun(ot)` 守門已是死碼).全套之 `dateYear0000` 案抓到;以 `_dayjs.assertDayjs` 保留修前之失敗形式.
- **修好判斷函數不代表下游轉換也正確**: `istimeTZ` 改接受空窗內之時刻後,`timeTZ2hour` 等仍以本機時間解析去除時區之字串,轉出差 1 小時(修前此類輸入回 `''`).裁定「不改」所依之前提(「改為正常轉換」)不成立時,照裁定不改並列待裁,不自行擴大修改範圍.
- **外審抓到的是「裁定未列之種類」**: terra 15 條中 6 條為「裁定表未列之輸入種類被順手改掉」(單獨之包裝物件、BigInt／Symbol 候選、BigInt 鍵、無效時區後綴),另 2 條為以 lodash 改寫成原生寫法時引入之差異(呼叫輸入陣列之 `slice`／`reduce`／`map` 可被遮蔽;檢查與使用為兩次讀取).改寫結構函數時:輸入陣列一律以索引讀一次存快照、只操作快照;依型別分流時先列「修前每種型別之結果」再對照裁定逐種決定,裁定未列者以修前副本實測保留.
- **lodash `range(a, b)` 於 a > b 時反向**: `arrAt` 修前 `iend` 小於 `istart` 並非一律回 `[]`(`iend === istart - 1` 為 `[]`、更小時反向取得),紅測之案若選 `iend === istart - 2` 會修前亦綠;以修前副本實測後改用差距 3 以上之案.


## 第 492 項第 8 批 ws492i(判斷與轉型,2026-11-19)

- **把底層判型由 `Object.prototype.toString.call` 改 `typeof` 後,既有測試之「靠拋錯進入 catch」會整批失效**: `timeTZ2past` 等 4 函數之測試以「`tNow` 之 `Symbol.toStringTag` getter 拋出指定值」逼 `isestr`(經 `Object.prototype.toString.call`)拋錯、進入 `catch` 驗 `_errToStr`;`typeof` 不觸及物件,該 `catch` 於呼叫端給定之值已不可達,28 案假紅.改法不是補一個新的拋錯入口,而是改斷言「函數不讀物件內容(getter 計數為 0)、結果同非字串 `tNow`」.凡測試以「讓某底層判斷函數拋錯」為手段者,底層判型改寫時須一併盤點(Grep 測試中之 `Symbol.toStringTag`、`Proxy.revocable`、`get [Symbol`).
- **判斷函數不拋錯會連動「以拋錯作為失敗訊號」之呼叫端**: 已撤銷之 Proxy 原使 `isobj`／`isstr`／`isfun` 拋 `TypeError`,exec 系(`execCli`、`execCliSession`、`execCliJsonRpc`、`execCliJsonFile`、`execProcess`)與 `pmMap`／`pmSeries`、`fsMergeFiles` 恰以該拋錯為「不可讀」之偵測,修後改視為非預期型別而依 K3 視為未給(照常執行)或以固定字串回報.這是裁定③之必然後果,不是缺陷;但屬行為變更,須列入破壞性變更與報告之待裁示.判別法: 全套跑完後,失敗案之共同點為「`<revoked>`」字樣者即此類.
- **變異證明須含「函數變異 × 全部相關測試檔」**: 首輪對轉型函數之變異(`cint` 去拆包)存活,因變異只配了 `cint` 自己之測試檔,而逐格鎖定拆包之測試在 `isstr.test.mjs`〈包裝物件全表〉;配測試檔時把全表檔一併納入,並對每個轉型函數補自有之包裝物件案.另兩個存活者為等價變異(`isstr0` 於 `isstr` 守門後之 `instanceof String` 分支不可達;`pmThrottle` 入口以 `typeof` 取代 `isfun` 時,執行點之 `isfun` 再驗得同一結果)——判斷存活者時先查是否可達與是否有第二道檢查.
- **修前紅用「HEAD 之 `src` ＋現行測試」逐檔跑**(`git archive HEAD src` 解到 `./tmp/`,測試檔與 `test/tools` 複製過去,`node mocha.js --no-parallel <檔>`,以 `node_modules` 逐層向上解析不需連結);新增之內部模組(`_unbox`)於 HEAD 為載入失敗亦算紅,另 1 檔(`isintMathDefinition`)為「核實不改」故修前亦綠,屬預期,報告須分開寫.
- **下游盤點之「固定舊行為」不能只 Grep `new String(`**: 建構式字面於 `src` 命中 0 行,真正受影響者是 `isestr(opt.*)` 守門後再往下走之分支(`w-orm-*` 建構子、`w-dispatch-ai` 之旗標與金鑰篩選),需沿資料流追;兩個子代理(一個專查 `cbol`／`isDate`、一個專查包裝物件與固定舊行為)各約 6~24 分鐘,與實作並行以背景方式派出、以檔案存在輪詢.
- **`Number.isNaN(v)` 取代 `v !== v`**: 專案之 eslint `no-self-compare` 會擋後者;前者不轉型,對包裝物件與已撤銷之 Proxy 皆為 `false`、不觸發陷阱.

## 串流遮罩器與收錄評估:切點避整段命中、以舊實作接同一份測試、寫檔工具又改了跳脫字元(2026-11-24,主控任務 20261124085531,twsm1)

- **長文字分段遮罩,切點要避「整段命中範圍」而非「遮罩區間」**: 鍵值對、Bearer、網址帳密之遮罩區間只含值,切點若只避遮罩區間會落在鍵與值之間(`token=` | `VVV…`),後段無鍵而不被遮.在 `_diagKit.mjs` 之 `addPairs`／`addUrlCred`／`addPatterns` 加選用之 `ext` 收整段範圍(鍵起、scheme 起、整個 regex 命中),同一次掃描同時得到遮罩區間與整段範圍,規則仍單一實作.此錯是自寫之長列測試在推演期望值時發現,不是跑出來的——寫長列測試時先手算每一段之切點.
- **網址帳密之 @ 在窗外**: 掃到窗尾仍未遇空白、`/`、`?`、`#` 者,其 @ 可能在窗外;列為延伸至窗尾之整段範圍,由「延伸至窗尾即 fail-closed」收尾(獨立複審 A1).
- **與塊之切法無關**之作法: 逐列各自遮罩(不把多列合成一塊遮,否則引號值跨列時輸出隨切塊而異);長列只在窗內文字到齊時才切(窗長固定、不看當下緩衝長度);含換行之已知秘密之列尾,等其後「最長含換行秘密長度−1」字元到齊再判.測試以「全部兩刀切法」「隨機文字×隨機切塊」與「逐列 maskDiagText」比對.
- **以舊實作接同一份規格測試**,作為「兩份既有實作之差異」之證據: 把使用端之邏輯逐字抄成同一 API 之轉接器,放在 `./tmp/` 之 `src` 副本中跑新測試檔,紅之案即差異(本輪 25 案中 15 紅;並以探測腳本量出超長憑證值 44007 字元明文、跨塊 UTF-8 變 U+FFFD).
- **測試之斷言訊息會先求值**: `assert.strict.deepStrictEqual(實際, 期望, JSON.stringify(o))` 之第三引數於呼叫前即求值,`JSON.stringify` 會執行 `o` 之可列舉存取器——「存取器不得被執行」之案因此自己把計數器加 1 而紅.此類案之訊息只用固定字串或索引.
- **寫檔工具又把 `\uXXXX` 改成字面字元**(既有經驗 2026-10-06、10-10 已記): 本輪 JSDoc 範例之 `\u202e` 與測試字串之 `\u202e`、`\u2066`、`\u00ad`、`\u2028` 被寫成字面字元(字面之雙向覆寫與 U+2028 進了原始碼;eslint 之 `no-multi-str` 只抓到 U+2028).凡寫入含控制或格式字元跳脫之檔,寫完即以「逐字元檢查 Unicode 類別 Cc、Cf、Zl、Zp(換行、歸位、定位除外)」掃一次,有則以腳本改回跳脫(腳本內以 `String.fromCharCode(92)` 組反斜線,避免同一問題).
- **結構守門測試**: `test/chkOrmStr.test.mjs` 之「孤立代理判定單一出處」會把任何含代理碼元十六進位字面值之新 `src` 檔判紅;只為「切點不切開代理對」者改委派 `_diagKit.mjs` 之 `splitsPair`(與 `cutAt` 同一允許清單之理由),不必改守門清單.
- **發布包解開之全套**: 發布包不含 `node_modules`,裸名匯入會向上解析到本庫之 `node_modules`,但以明確之 `node_modules/<套件>/…` 路徑讀檔之測試(`getUserAgentUmd`、`evem`)會紅;於解開之套件根建目錄連接點指向本庫之 `node_modules` 後全綠,結束前以 `rmdir` 拆除連接點並回驗目標完好,再清 `./tmp/`.
- **收錄評估先盤使用端**: 派唯讀子代理掃各自有套件之 `src`、`server`,列各寫一份之實作、字樣是否一致、測試資料;權杖遮罩之四份測資彼此矛盾(C1 一份釘住不換、一份釘住要換),「與四份逐字相同」只能在共同測資上成立,矛盾之列須列待裁示,不可為湊齊而選某一份之字元範圍.

## 收尾輪:變異要有對照組、「不可觸發」先實測、零 import 模組之同一規則、Edit 之錨點亦被改寫跳脫(2026-11-24,主控任務 20261124085531,twsm1b)

- **變異跑器要先跑一次未植入變異之副本作對照組**: 副本位於 `./tmp` 時,依呼叫端位置之案(`test/fsSrlog.test.mjs` 斷言 `'[/test/fsSrlog.test.mjs:27:9]'`)於副本必敗;只看「失敗數 > 0」會把每個 fsSrlog 之變異都判為擊殺.改為「失敗之標題不在對照組之失敗集合內才算擊殺」後,原判擊殺之一項實為存活.
- **自認「不可觸發」之路徑先寫探測**: fsSrlog 之呼叫端位置解碼失敗,原以為 file URL 之 `%` 皆經編碼而不可能;實測呼叫端函數名為 `'file:%zz'`(物件之方法名)時,堆疊行之第一個含 `file:` 之字樣即該函數名,`decodeURIComponent` 拋 URIError——可觸發,補案後該變異轉紅.
- **計數斷言擋不住內容之退化**: setIntervalHp 之「建立後才撤銷之 fun 每次到期皆記錄」案只斷言記錄筆數,把診斷出口改回 `console.log(err)` 之變異因捕捉器同收兩個通道而存活;補斷言記錄之內容(固定詞彙 label 與安全摘要)後擊殺.
- **零 import 之模組(R-LOWER-01 L8)不能引用共用之正規式**: `lowerFind`／`lowerFindEq` 改用與 `_diagKit` 之 `RE_CTL` 相同之字面值,另以測試讀兩份原始碼核對 source 與 flags 相同,取代引用.
- **Edit 工具之 old_string 內含反斜線 u 加四位十六進位之跳脫時亦會被轉成字面字元而比對失敗**(本輪 `normLabel` 之正規式含 U+2028/2029 之跳脫);改以 Write 寫小腳本、以 `String.fromCharCode(92)` 組反斜線再取代,並先核對錨點恰出現一次.測試中需要這類字元時一律寫 `String.fromCodePoint(0x202e)`,不寫跳脫字串,免得寫檔時被轉.
- **計時器之 fun 拋錯改經 getDiag 後,既有子行程執行器只攔 console.log**: 記錄改寫 console.error 後計數變 0 而紅;執行器之捕捉改收兩個通道、純物件以 JSON 記(`safeStr` 對物件只回 `<object>`,看不出安全摘要之內容).
- **(twsm1c)同一包裝套到多個 evEmit 站點,逐站各寫一個只有它擋得住之變異**: fsWatchFile 之 change、error 兩站與 fsWatchFolder 之資料夾消失、change、error 三站各一;error 站以「error 監聽器本身拋錯」觸發(evEmit 對 'error' 事件之監聽器拋錯走診斷出口),資料夾消失站以假 watcher 加刪除資料夾觸發;`test/tools/fsWatchKit.mjs` 之 `withFakeChokidar` 讓 all、error 之送出與 unwatch/close 之失敗皆決定性(直接改假 watcher 實例之方法,不必改 FSWatcher 原型).
- **變異錨點勿跨行**: 工作樹中部分 src 為 CRLF(`fsWatchFolder.mjs`、`fsEvem.mjs`),以 `\n` 串接之多行錨點計數為 0;跑器照規則報錨點失敗而非略過,改單行且唯一之錨點(必要時含行首縮排以區分同字串之他站).

## 跨程序鎖:資料夾＋更名放入、接手標記、真多程序測試以子行程事件同步、複審抓到之讀取錯誤誤判(2026-11-24,主控任務 20261124223109,twsm2)

- **原子建立且他方看到即已含紀錄**: 先建暫存資料夾寫好 `owner.json`,再一次 `renameSync` 為鎖資料夾;目錄更名到已存在之(非空)目錄於 Windows 為 EPERM、POSIX 為 ENOTEMPTY/EEXIST,皆當「占用」.以 `openSync('wx')` 之鎖檔則有「已建而未寫」之窗,讀者須另設寬限.釋放不就地 `rmSync(L, recursive)`(遞迴刪除期間他方放入之新鎖會被刪),改更名移走後再刪,並核對所移走者之 token.
- **接手只一方**: 以「鎖身分(token)之雜湊」為名排他建立接手標記,持標記後再讀一次仍同一鎖才更名移走、核對後刪;只用「更名移走＋核對＋移回」者,多個等候者同時判定死鎖時,移回前之空窗可讓第三方建鎖而並存.
- **讀取錯誤不得當成「紀錄無法解析」**(複審 D1): `readFileSync` 之 EMFILE、EIO 等若歸入無法解析,持續時連接手前之再讀、移走後之核對都讀不到而判為同一鎖,存活之鎖被刪;只有 `SyntaxError`／欄位不符才算無法解析,其餘一律稍後再讀.**Windows 防毒短暫占用剛建之資料夾**(複審 D2): 建立之更名重試以時間(10 秒)而非次數為限.
- **真多程序測試之同步**: 子行程逐行印出 `EV <onTrace事件 JSON>`,父行程以 `traceRec` 接收並等「n-1 個子行程 lock-wait start」＋伺服器端「閘門路徑之請求已到達」才放行閘門;離線鏡像之持鎖者不發 download 事件,故不以「一個 download」為同步點.被終止之持鎖者以 `cp.kill()`(Windows 為 TerminateProcess)後鎖留原處,其餘等候者恰一個 `lock-takeover`(dead).
- **同程序內兩次呼叫經同一把鎖**: 以不同之下載選項(如 `retryDelayMs` 10／11)使 `ensureEntry` 不共用同一次取得;手工建立之鎖以本測試行程之 pid 當「存活之他方」.原有「不共用者各自下載 3 次」之測試與新規則衝突,依規則改為斷言請求 1 次(破壞性變更).
- **真實 fetch 失敗之 cause.code(Node v24、undici 7.30)**: 連上即斷為 ECONNRESET(非 UND_ERR_SOCKET);已收標頭而本體中途斷為 `TypeError('terminated')`＋`UND_ERR_SOCKET`;標頭逾 16KB 為 `UND_ERR_HEADERS_OVERFLOW`;本體短於 content-length 為 `UND_ERR_RES_CONTENT_LENGTH_MISMATCH`;https 連 http 服務為 `ERR_SSL_WRONG_VERSION_NUMBER`;標頭／本體逾時要 undici 套件之 `Agent({ headersTimeout })`(內建 fetch 預設 300 秒;其計時粒度約 1 秒,200ms 之設定實耗約 2.5 秒);Windows 本機連無人監聽之埠約 9ms 即拒絕,連線逾時無法本機重現.
- **終止持鎖者後不得再讀鎖之狀態**: 「終止持鎖子行程 → await 其 close → 讀 owner.json 核對 pid」於整檔連跑 20 次中 1 次紅(單案連跑 30 次皆綠;當次失敗訊息未留,原因為推定,改後整檔連跑 40 次見 twsm2 報告): 等候者每 ≤1 秒輪詢,持有者一結束即可能被接手,`close` 事件到達測試行程之前後鎖已換人或不存在.持有者之核對須在終止之前(持鎖期間);終止後只斷言最終結果(接手次數、下載次數、皆成功).連跑腳本須記失敗訊息全文(初版只記案名,無從確認哪一條斷言).
- **修前紅用 HEAD 副本**: `git archive HEAD src test package.json | tar -x -C ./tmp/<案>/head`,疊上新測試檔,以 `quiet-run --cwd <副本>` 跑;副本在 repo 之 `./tmp` 下,裸名匯入向上解析到 repo 之 `node_modules`(不必建連接點).

## 清除與鎖之競態:不持鎖之清除、事件閘門決定性重現、建夾兩步之 ENOENT(2026-11-25,主控任務 20261124223109,twsm3)

- **「記下開始時不存在之夾、失敗時刪其中為空者」不持鎖即不安全**: 空夾不等於無人使用——他程序之下載核心建夾之後、收到回應標頭才建暫存檔,其間夾為空;他程序建鎖時「建快取根→建暫存夾」兩步之間快取根亦為空.判準: 只清本次可能建立者(離線且無鏡像者不建任何夾即不清),共用單位之夾只在持該單位之鎖時清,共用之上層只刪空夾且所有「建夾後於其內建物」之兩步遇 ENOENT 重建再試(同等保證).同一 sha256 而不同檔名之兩單位共用 `<sha256>` 夾而鎖不同——以鎖保護清除時,先問「此夾是否只屬這把鎖」.
- **以事件閘門決定性構造跨程序交錯**(不加壓、不延時): 子行程在 onTrace 事件(如 `offline`)或包裝之 fs 方法(`rmdirSync`／`mkdirSync` 之前或後、限定完全相同之路徑)處同步寫出 `GATE <id>`(`fs.writeSync(1, …)`,免事件迴圈停住後 stdout 未送出)再以 `Atomics.wait` 輪詢標記檔停住;父行程等 `GATE` 行與伺服器之請求到達(持有者之夾為空之時點)後才建標記檔放行.同一路徑可能被刪兩次(持鎖時與結束時)者,每次各一個閘門,父行程以「到閘門或已結束」先到者分支,使「釋放後才刪」之變異亦決定性現形.
- **下載核心之最終錯誤包兩層**: `fsDownloadFileVerifyCore` 之最終錯誤 E_FS 之 `cause` 為末次嘗試之錯誤(E_FS,step download),其 `cause` 才是帶原始 code(ENOENT)之固定詞彙 Error;判定時要走兩層.
- **變異存活之區辨**(技能 §10.1): 「不在本程序清除」之第一道(mayTidy)被「建快取根之兩步重建再試」掩護而存活,補「離線無鏡像之 B 不得動他程序剛建之快取根(tidy n=0、快取根仍在)」之案才轉紅;「只在持鎖時清」與「結束時再清一次」區辨要靠對同一夾之第 2 次刪除另設閘門.

## 升 `@zumer/snapdom` 3.7.6 → 3.8.0:本庫測不到它,以真瀏覽器冒煙代驗(2026-11-25,主控外部依賴每日檢查)

- **測試缺口**: `domConvertToPic`(唯一用 snapdom 者)之 `test/domConvertToPic.test.mjs` 實無內容(import 被註解),全套測不到 snapdom;下游使用者亦無測試 ⇒ 主控排程立項補真瀏覽器之行為測試.
- **升前代驗**: 以本庫 `toolg/gDistRollup.mjs` 建兩版 UMD,於 headless Chromium 對 28 種代表性輸出比對(文字與中文字型、CSS 背景邊框、內嵌 SVG、`<img>`、捲動容器、表單、scale／jpeg／svg、自訂字型、並行呼叫、DPR 2):24～25 個逐位元組相同;穩定差異 3 案皆新版較貼近 DOM(`<canvas>`、`<iframe>` 之外框尺寸;SVG 輸出少內聯預設值、光柵化後像素相同);壞圖(404)之首次呼叫高度兩版皆在兩值間飄(既有競態).
- **既有缺陷(與版本無關)**: `<canvas>` 之**內容**兩版皆截不到(輸出為空白框)——使用端以 canvas 繪製之圖表截圖本就空白.

## `domConvertToPic` 修正與真瀏覽器測試:先並排實證成因、猜測要驗、尺寸判準用版面真值(2026-11-25,主控任務 20261125225421,t642)

- **成因一律以「原元素直交 snapdom」對「經本函數」並排實證**(同頁、同元素、同選項,以頁面內 `analyzePic` 量區塊平均色與尺寸):canvas 為空白時,直交可截到、經本函數不行 ⇒ 缺陷在本函數之 `cloneNode`,不在 snapdom.**派工書之推測要驗**: 主控推測「表單現值(input／textarea／checked)皆被 cloneNode 漏掉」不成立——Chromium 之 `cloneNode` 依 HTML 規格之 cloning steps 複製 input／textarea 之值與核取狀態,只有單選 `<select>` 之選取與 canvas 位圖遺失;複選 select 之選取 snapdom 本就不呈現(輸出像素與有無選取相同),不必處理.
- **壞圖尺寸之判準是版面真值,不是「看起來完整」**: 前一輪冒煙把 57 當「底緣被裁」、82 當「完整」,方向相反——原元素失敗後之 `getBoundingClientRect().height`(43)加外距 14 才是 57;82 是複本 `<img>` 仍在載入、以 `width`／`height` 屬性之盒(68)排版時被量到.實測複本放入後 `complete === false`、約 2 ms 後 `error`;snapdom 前處理在同頁第 2 次起較快,量測恆落在 2 ms 之內(第 2 次起恆為失敗前版面,**確定性**),首次呼叫只約 4/30 落在其內(**機率性**).故測試之確定性紅用「同頁第 2 次起」,首次呼叫之 10 個新頁面為機率性紅(修前每輪約 76%).
- **首次呼叫之競態無法以延遲 404 決定性重現**: 複本 `<img>` 之失敗走瀏覽器記憶體快取之失敗結果(不再發請求),被延遲的是 snapdom 自己之 `fetch`;曾寫「延遲複本請求」之案,修前亦綠,屬無鑑別力,已刪.
- **等圖片之細節**: 只等 `complete === false` 者(已完成者如無 `src` 之 `<img>` 不再觸發事件,全等會空等至上限——首輪變異「不過濾 complete」存活,補「無 src 之 img」案才被殺);複本置於頁面頂端,遠離視窗之 `loading="lazy"` 圖不會觸發載入,不改 eager 則每次呼叫空等 5081 ms(改後 64 ms);snapdom 自身對圖片之 `fetch` 有約 3 秒逾時,故「永不載入」案須 lazy＋伺服端不回應才走得到本函數之上限(約 8 秒,測試中唯一慢案).
- **獨立複審(sonnet,唯讀)抓到修前即有之副作用**: 同名(無表單)之單選鈕,複本放入頁面後與原件同組,複本之已勾選鈕使原件之勾選被取消——呼叫後頁面之單選狀態被改.以「複本內 radio 改用專用名稱」修,測試含並行呼叫與元素本身為 radio.**經驗**: 「複製再放回同一文件」之作法,凡「依名稱或 id 成組／唯一」之表單狀態(radio 群組、`id` 重複、`label for`)都要想一遍是否改到原件.
- **真瀏覽器測試基建之取捨**: wsemi 為 Level 3,不得依賴 w-playwright／w-package-tools-e2e,故以外部套件 `playwright-core`(devDependencies,精確版同 w-playwright)自建最小版;載入原始碼用 `page.route` 虛擬主機＋import map(不開埠、不依賴 `./dist`);瀏覽器已安裝者直接啟動,缺才以 CLI 安裝(Playwright 自身之 `__dirlock` 序列化並行安裝);取不到即拋錯不 skip.`/node_modules/` 之檔須以 Node 解析慣例向上找套件資料夾(發布包解開之目錄之相依在其上層),否則發布包配置下頁面載入失敗.
- **夾具陷阱**: `display:inline-block` 之外層放在區塊父層下,複本之絕對定位外層會含一行基線留白(輸出高度多 4 px);夾具改 `display:block;width:fit-content`.輸出尺寸含元素外距(既有行為;外層為絕對定位之區塊格式化脈絡,子元素外距不外溢)——已入 JSDoc 與測試.被污染(tainted)之 canvas: snapdom 於其四周畫 1px 灰框、框內空白,與原元素直交相同,不 reject.
- **修前紅與變異之作法**: 以環境變數取代頁面載入之被測檔(`WSEMI_DOMCONVERTTOPIC_SRC`),修前版本與各單點變異檔皆用同一機制,不動 repo 內檔案;變異腳本以 Write 寫成檔、比對錨點須唯一(Windows 工作樹為 CRLF,錨點比對前先正規化換行).
- **未獨立重現之限制**: undici 於 `Connection: close`＋大本體＋背壓之崩潰,實作端以 64 MB 本體、每 4 MB 延遲 20 ms 之純 fetch 試一次未崩潰;文字依主控查證載入 JSDoc／README,不寫成自己實測.
- **eslint**: `operator-linebreak` 要求 `+` 在行尾(`npx eslint --fix` 可修);`no-new-wrappers` 擋 `new Boolean`,測包裝布林改 `Object(true)`;`brace-style` 擋單行 `{ get() { throw … } }`.

## 輸入不可讀之固定詞彙、判型改內部槽之連鎖、複審抓到之快照漏洞(2026-11-26,ws492k,排程第 492 項第 10 批)

- **訊息改固定詞彙不等於消除外露**: 把 `catch` 內之 `${e.code}: ${msg}` 改成固定字串後,獨立複審另找到三條路徑仍把呼叫端所拋之文字帶出——①快照只複製參照,args 元素或 env 值之 `toString` 拋錯留到 spawn 時才由 node 原樣拋出;②`obj2u8arr` 自己之合併步驟 catch 仍 `errToStr(err)`;③`execCliJsonFile` 之 `JSON parse failed: ${原生訊息}` 帶絕對路徑與內容片段.作法:快照時即轉字串(`String(v)`,Symbol 原樣交 node 以免靜默改變失敗行為),轉換拋錯以標記錯誤(WeakMap 記固定訊息,不用 `instanceof`:已撤銷之 Proxy 於 catch 內 `instanceof` 會再拋)回報;改一個站點後,同函數家族之其餘 catch 與出口逐一核對.
- **偽造標籤之類陣列物件作快照來源要有上限**: `isarr` 仍以標籤判型,`{ length: 1e9, [Symbol.toStringTag]: 'Array' }` 通過後逐元素讀取會耗盡記憶體;`snapArgs` 設個數上限 1e6(命令列長度遠先受限),並以「首元素存取器計數為 0」斷言上限先於讀取(只斷言錯誤訊息時,移除上限之變異會因記憶體耗盡被 try 吞掉而存活).
- **判型改內部槽後,以「偽造標籤之 Proxy」觸發防禦性 catch 之測試全部不可達**: `ab2u8arr`、`u8arr2obj`、`obj2u8arr` 之夾具原以 `Proxy(ArrayBuffer)` 並於 `get` 陷阱回標籤通過 `isab`,改內部槽後被固定訊息拒絕(陷阱計數 0).改以真實例加自有存取器(`Object.defineProperty(u8a, 'buffer', { get() { throw v } })`)或暫換全域 `Uint8Array` 為 Proxy(只對首引數為 ArrayBuffer 者拋出,其餘 `Reflect.construct`),斷言於還原全域之後才做.
- **`chkReadable.ownKeys` 有界**: 型別陣列、DataView、String 包裝物件之索引鍵為虛擬,`Reflect.ownKeys` 會一次配置全部索引字串;以 `ArrayBuffer.isView` 與 `String.prototype.valueOf` 內部槽判定後不列舉(原型鏈上亦同);Proxy 包裝者無從先行得知大小,照常經陷阱.證明「不列舉」不實際耗盡記憶體: 載入前換掉 `Reflect.ownKeys` 為記錄者(`import('…?x=n')` 載入新實例),斷言未以該物件呼叫.沿原型鏈之讀取量含 `Object.prototype` 之 12 個自有鍵,`maxReads` 測試須用 `Object.create(null)` 之物件.
- **下游盤點之結論決定「停於該函數」**: 依任務書先盤下游再改;子代理(只給契約,不給結論)讀出 `isarr`(標籤讀取拋錯之陣列 Proxy 判 `false` 為 w-orm-* 寫入守門所依賴)與 `isobj`(偽造 `'Object'` 標籤者於 w-serv-orm 仍被掃描)有依賴現行語意者,故本批只改 `isnull`／`isundefined`／`isbigint`／`isab`／`isu8arr`／`isu16arr`;`Proxy(ArrayBuffer)` 舊判 `true` 為唯一意外之連帶(內部槽不認 Proxy).
- **轉型函數 opt 取快照**: `_pickOpt(opt, keys)` 每鍵讀一次、拋錯視為未給,`debug`／`funLog` 以快照上之惰性存取器讀取(不改變「只有非預期輸入才讀 debug」之時序);測試以「業務鍵全有效時 `debug` getter 讀取數為 0」鎖定.另以小腳本把惡意值逐位置餵入全部同類函數,一次得 36 個 opt 讀取類同形缺陷(另 10 個為必須參數依設計拋錯;列待裁示,不擴大本批).
- **變異腳本**: 錨點用單行字串(多行錨點遇縮排與換行差異即 `ANCHOR-FAIL`);改完碼後重跑全部變異;等價變異逐項寫理由(條件式賦值對 `get(…, 預設)` 無差別).`git status`／`diff` 對 CRLF 工作樹之警告無害.

## 位置參數改 opt 之遷移期防護、對外函數只讀必要之鍵、內部呼叫端之變異缺口(2026-11-26,t667,排程第 667 項)

- **遷移期防護要看「舊簽章全部之位置」而非只看被改之那一個**: 舊 `(fd, levelLimit, opt)` 改為 `(fd, opt)` 後,第 2 參數非物件即拋錯只攔得下數字寫法;舊寫法 `fn(fd, null, { type })` 之第 2 參數為 `null`／`undefined` 視為未給,第 3 參數(舊 opt)被靜默忽略.故一併要求第 3 個引數有給即報錯(訊息 `invalid arguments: must be fd and opt only`);簽章不增參數,以 `arguments[2]` 取得——`test/jsdocFixes.test.mjs` 全庫斷言 `@param` 頂層名稱與簽名一致,多一個具名參數就得在對外 JSDoc 宣告一個不該存在之參數.檢測順序固定 fd → 第 2 參數 → 第 3 個引數,各以一案鎖定.
- **對外函數須自行檢測,不把原值交 Core 代報**: 草案之作法是第 2 參數非物件時把原值原樣交 Core 報錯;一旦對外函數另重組傳給 Core 之物件(只取必要之鍵),原值不會到達 Core,且第 3 個引數 Core 也看不到.故 5 個對外函數與 5 個 Core 各自呼叫 `chkFsLevelOpt(fd, opt, arguments[2])`,每處以變異(拿掉檢查、不檢第 3 個引數)各驗一次.
- **對外函數以 `{ ...opt, path, fs }` 展開整個 opt 有三個副作用**(獨立複審抓到): ①讀走全部鍵,含 `debug` 存取器(有效值時應為 0 次);②使用者自帶之內部鍵 `optDbg` 被帶入,可控制警告出口;③只展開自有鍵,類別實例之原型上存取器 `levelLimit` 漏掉而變窮舉全部,與 Core 直呼不一致.改為 `{ path, fs, levelLimit: get(opt, 'levelLimit'), optDbg: opt }`(屬性讀取一次,opt 本身作 `optDbg` 惰性轉交);`get` 對 `null` 回 `undefined`,免得 `opt.levelLimit` 於 `opt = null` 時拋 TypeError.`*WithHash*` 兩個仍以 `mergeInject` 展開(既有寫法,至多讀一次).
- **內部呼叫端之變異常在既有測試下存活**: `fsSyncFolderCore` 對來源端與目標端各列舉一次,既有測試只讓目標端為空,把目標端改限 1 層之變異存活;補「目標端深層檔內容相異被覆蓋、深層多出檔被移除」一案後才被擊殺.凡成對之呼叫站點,各植一變異.
- **預設由 1 層改窮舉之函數,以「深於第 1 層之夾具＋逐層相異之名稱」測**: 夾具檔名含層級(`f1`～`f5`),期望名單由夾具資料表以 `level <= lv` 過濾產生,並在案內斷言「窮舉全部與第 1 層之結果相異」(鑑別力前提),免得夾具退化後預設改回 1 層仍綠.
- **`toolfp` 之 bundle 對物件之第 2 參數視為無效層數而取 1 層**: 現行(修前原始碼所建)bundle 遇 `fn(fd, { levelLimit: 2 })` 仍只列第 1 層(忽略 opt),換新 bundle 前下游改寫為 opt 寫法不會報錯但層數被忽略;新 bundle 於鏡像根以 `toolfp/gDistRollup.mjs` 同一設定建置後實探,`arguments[2]` 經壓縮仍有效(數字第 2 參數拋 `invalid opt: must be an object`、`fn(fd, null, {})` 拋 `invalid arguments: must be fd and opt only`).
- **修前紅與變異皆於 `./tmp/` 之鏡像根跑**: 修前基準以 `git ls-files -z -- src test package.json | tar --null -T - -cf - | tar -xf - -C <鏡像>` 自工作樹取原位元組(CRLF 工作樹不用 `git archive`),`quiet-run --lock --cwd <鏡像> --log <路徑>` 以鏡像根為工作目錄(相依由上層 `node_modules` 解析,不建連結);新測試 89 案於修前版 1 passing／88 failing(唯一綠者為「Core 缺注入相依仍報錯」之行為保持案).帶 CR 之差異附件以 `git apply -p1` 於 CRLF 工作樹可乾淨套用;Edit 工具之多行錨點會保持 CRLF.

## 使用端草案之核實與 `opt` 擴充:空表頭欄位保留 `keepEmptyHeader`(2026-11-26,t670,排程第 670 項,Gitea #221)

- **草案之套用與換行**: 附件差異帶 CR(src、test 為 CRLF),`patch -p1 --binary --dry-run` 於工作樹乾跑成功後才套用;同一差異內 `test/tools/buildXlsx.mjs` 與 `sgud/rule/*.md` 之工作樹為 LF,各檔照其原換行.**判換行一律 `git ls-files --eol`(`w/crlf`、`w/lf`)**,本輪誤以 `grep -c $'\r$'` 判,同一檔兩次呼叫得 634 與 0(`$'\r$'` 引號展開於此 Bash 下不穩),改以 `tr -cd '\r' < 檔 | wc -c` 對照 `tr -cd '\n'` 位元組數才定論;`core.autocrlf=true` 使 `git show HEAD:檔` 為 LF 之 blob,與工作樹不逐位相同,修前基準勿以它與工作樹 `cmp`.
- **成因核實而非採信**: hucre 讀合併儲存格,範圍內非左上角之儲存格為 `null`(`sheet.merges` 另載範圍,本函數未用),與未合併之空白表頭無異,故 `to_ltdt` 之「`null` 表頭即跳過」把被合併之欄整欄丟棄;改用 hucre 之同一提交(`697311c68`,2026-08-17,version 1.8.73)之前,`git show 697311c68^:src/getDataFromExcelFileU8Arr.mjs` 可見 ltdt 以 `sheet_to_json(ws)` 預設選項讀取,`__EMPTY` 系命名即來自該預設;本庫已無 xlsx,SheetJS 對重複表頭之後綴行為(`a_1`、`a_1_1`)只能引使用端之提報,未重現.
- **資料列比表頭列寬時之語意**(獨立複審指出、補案): hucre 回稠密矩形,表頭列補 `null`,故超出表頭列之欄位亦為空表頭;`false` 時整欄丟棄(修改前即如此)、`true` 時命名保留.規則 6 與 JSDoc 皆已載明,不另開例外.
- **新增案之鑑別力來源**: 使用端草案 15 案外補 6 案——無空表頭時為無作用(含真實表頭恰為 `__EMPTY`)、無列或只有表頭列之分頁、12 欄空白表頭跨兩位數序號且真實表頭占 `__EMPTY_10`、資料列比表頭列寬、碰撞只對同一分頁之真實表頭、不改寫呼叫端 opt(凍結物件);變異「碰撞檢查只做前 4 個序號」只有跨兩位數序號案擊殺(草案之碰撞案序號皆小於 4);變異「碰撞集合跨分頁共用」於同行程內因前案污染而被其他案擊殺,仍補「同一分頁」專案使鑑別不依賴案之順序.改前舊測試檔只擊殺「預設改 true」「一律命名」兩項,其餘變異皆存活,證明新增案確為補洞.
- **合成資料須各欄逐筆相異**(複審指出): 草案之跨欄夾具有一欄三列皆 `'-'`、且兩欄之數值重疊(1.5、3),改為逐欄逐列相異之通用字詞(`id`/`span`/`val`,值 `r1`、`10`、`a1`、`1.5`、`7` 等),領域用詞(孔號、深度)亦一併去除.
- **變異腳本須防同步無窮迴圈**: 命名函數之 `do…while (used.has(k))` 遇「命名恒為 `__EMPTY`」之變異而真實表頭已有 `__EMPTY` 時進入同步無窮迴圈,mocha `--timeout` 不能中斷,整批靠 `spawnSync` 之行程逾時(本輪設 180 秒)收掉,判定為逾時而非擊殺、耗 3 分鐘;改為同時拆除迴圈條件(`while (false)`)後變異可終止,新測試擊殺 12 案.凡把迴圈條件改恒真之變異都須如此設計,逾時獨立判為未判定、不當擊殺.
- **名稱格式與序號易錯處**: `n === 0 ? '__EMPTY' : \`__EMPTY_${n}\``,首個無序號;序號只增不減、被真實表頭占用者跳過而不回補;期望值以字面寫死,不以同一算式產生(否則算式錯時期望亦錯).
