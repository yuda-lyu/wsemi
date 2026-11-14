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
