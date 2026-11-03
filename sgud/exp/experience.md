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

2026-11-02(ws286b)再整理: 本檔原約 33.0KB,將 2026-11-02 之 4 節(約 16.8KB)抽出至既有之 `sgud/exp/experience_20261102.md`(附於該檔末,節號與標題不變、內容逐字搬移),本檔只留 ws272c 起之節.需要時調閱該檔.被抽出之節:

- 整理 sgud 與 4 項待辦:偶發多一筆 timer、全套案數不一、UMD 晚載入、fs 無效路徑(2026-11-02,主控任務 20261102014123,ws265)
- 已知缺陷先修:7 個函數之整數輸入(2026-11-02,主控任務 20261102112347,ws270)
- 第二批第 2 輪「計時與流程類」19 個函數(2026-11-02,主控任務 20261102123434,ws272a)
- 第二批第 2 輪「字串、陣列、數值、編碼類」19 個函數＋3 項缺陷(2026-11-02,主控任務 20261102123434,ws272b)

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

## 非計算類函數必須參數遇非預期:第一類 4 個函數(2026-11-02,主控任務 20261031121854,ws286a)

- **回傳 Promise 之函數包著會拋錯的子呼叫,要逐站看「是不是 async」**: `domShowInputAndGetFiles` 不是 async(回傳 `genPm()`),`domAppend` 改拋錯後會變**同步丟出**且已先 `domRemove` 掉前次呼叫之 input(副作用先於檢測);`domConvertToPic`／`domVirtualCreate` 是 async,拋錯自動變 reject、但 reject 值形式要對齊各函數既有慣例(前者字串、後者 Error).不要只因「async 就自動合規」略過:`domVirtualCreate` 原本 `domPrepend` 回字串被忽略,`fun` 會對未接上頁面之元素執行並回傳結果(靜默錯結果),改拋錯後才變成明確失敗.
- **失敗路徑之清理要用 `finally`,且清理本身不得覆蓋原結果／原錯誤**: `copyStrToClipboard` 原碼三個失敗 `return` 都在 `removeChild` 之前,textarea 殘留於頁面.改 `try/finally` 後,若頁面腳本在複製當下已自行移除 textarea,真 DOM 之 `removeChild` 會拋 `NotFoundError` 並覆蓋原錯誤;故 `finally` 內再包一層吞錯(同 `domVirtualCreate` 之寫法),並以測試載具之「嚴格 removeChild」(非子節點即拋)+`env.onCopy` 於複製當下移除元素之案釘住(變異 M16 殺死).
- **假 DOM 載具要補到「能區分對錯」的語義**: `fakeDom.mjs` 之 `removeChild` 對非子節點靜默、無 `insertAdjacentHTML`／`firstChild`;在 `test/tools/domEditKit.mjs` 於該次 `mkFakeDom` 產生之 `Ele` 類別(per-call,不污染他檔)補上: 以標記子節點代表字串插入(可驗 `beforeend`／`afterbegin` 位置)、嚴格 `removeChild`、`select()` 受 `focusOnSelect` 控制(模擬鎖定焦點區域)、`execCommand` 記錄「呼叫當下焦點元素之 `value`／是否在頁面中」(端到端不變式:複製當下 textarea 持有焦點且 value 即輸入字串)、`env.ops` 記錄寫入操作(無效輸入須為 0).
- **真瀏覽器補證(假 DOM 驗不到的語義)**: 借 w-aggrid-vue 之 playwright(同 `experience_20261028.md` 作法),`page.route` 供 `src/` 與 `node_modules/`、import map 對應 `lodash-es/` 與 `@zumer/snapdom`.坑: ① `navigator.clipboard` 在 `http://` 非安全環境為 `undefined`,origin 改 `https://wsemi.test`(route 攔截不需網路)並 `grantPermissions(['clipboard-read','clipboard-write'])`;② Windows 剪貼簿把 `\n` 正規化為 `\r\n`,比對前還原;③ 取不到焦點可用 `inert` 父層真實重現(`select()` 不聚焦);④ 「無 body」可真實重現: `document.body.remove()` 後 `querySelector('body')` 為 `null`;⑤ headless Chromium 即使無使用者手勢 `execCommand('copy')` 仍回 `true`,故「回 false」路徑只能靠假 DOM 與變異覆蓋.
- **變異在 `tmp` 內 src 副本進行,不動 repo 之 src**: 複製 `src/`(全部,使相對匯入照常)與 `test/tools/` 與要驗的測試檔到 `tmp/ws286a/mut/`,從 repo 根以 `node mocha.js tmp/ws286a/mut/test/...` 執行(裸套件沿父層 `node_modules` 解析);行程被終止也不會留下被變異之 repo 檔.工作樹 src 為 CRLF(`i/lf w/crlf`),`read` 時先轉 LF 再套比對字串(含 `\n` 者命中 0 次的坑見本檔 ws270、ws272a 各節);每項斷言命中恰一次,否則拋錯而非靜默跳過.`domPrepend` 之 `'afterbegin'` 在同一行出現兩次(程式與註解),樣式要含 `insertAdjacentHTML(` 前綴.
- **排鎖等待**: 本輪某次 `--lock` 等了 5m56s(他套件佔鎖),把多個瀏覽器檢查合成單一腳本一次取鎖;改檔後若要重跑,先把可能的小修(如剪貼簿 CRLF)一次改完再排鎖.
- **EOL**: 本輪 `src` 改動皆用 Edit(單處多行 `new_string` 仍保持純 CRLF,`git ls-files --eol` 7 檔皆 `w/crlf`、無 `mixed`);帳本與 sgud 檔多行追加改用 `tmp/ws286a/appendDocs.mjs`(依檔案 EOL 轉換,寫後驗無混行尾).`rulebook_judge_sites_r2c.md` 為 LF、其餘帳本與 `state*.md`、`experience.md` 為 CRLF,不可一概而論.

## 非計算類函數必須參數遇非預期:第二批 `getTimeRange`＋字串／日期子類 4 個函數＋`cfilesize`(2026-11-02,主控任務 20261031121854,ws286b)

- **「取代字串」是否為普通文字,要實測 `replaceAll` 的取代字串**: `String.prototype.replaceAll(字串, 字串)` 即使 pattern 為字串,取代字串仍解讀 `$&`、`` $` ``、`$'`、`$$`(`$1`、`$<a>` 無捕獲群時照字面);實測 `replace('a-b', 'a', '$&$&')` 得 `'aa-b'`.wsemi 的 `replace` 直接用它,故 `replaceObj` 在本函數內先把 value 的 `$` 逸出為 `$$`(`v.replaceAll('$', '$$$$')`:取代字串 `'$$$$'` 輸出兩個 `$`),`replacePlus` 則以函式回傳 `r`(`String.replace(rex, () => r)`);不改 `replace`(範圍外).
- **打開死碼會連帶改變既有行為,先列「被死碼遮住的行為」**: `replaceObj` 原轉換迴圈算完未存回,所以任何非字串 value(數字、`null`、布林)都使結果為 `''`、而物件／陣列 value 仍會因 `JSON.stringify` 求值而拋 `TypeError`(循環參照、巢狀 BigInt).改為實際使用後,前者變成有意義的轉換,後者的 `TypeError` 仍在(測試鎖定,沿用);值改為「單趟讀一次、先轉換全部再取代」,使 getter 讀取恰一次(K4/V11)且循環值於任何取代前即拋錯.`length` 鍵系列測試原預期 `''`(數字 length 使結果為空)全部要重算:以 `c` 含文字 `'length'` 的案(`replaceObj('length abc', { length: 3, a: 'x' })` → `'3 xbc'`)才能區分「length 當一般鍵」與「陣列樣迭代」.
- **重寫鎖定舊行為的大測試檔,先逐條盤出「釘住的舊期望」**: `replaceObj.test.mjs` 449 行,舊期望 `''` 散在頂層案、亂數差分 oracle、length 鍵表、子行程表(`objIterG3Runner` 之 `len`／`tag`／`keys` 結果)四處;獨立 oracle(`expected`)改為回傳 `{ err }` 或字串,亂數 400 案同時驗 throw 與結果,並保留「與修前演算法相同」的差分但限縮到有效字典(全字串值、無空鍵、值不含 `$`).子行程 `keys` 案的讀取次數由「1~2」收緊為恰 1.
- **正規表示式字元類別逸出與 ESLint**: `not` 進 `[^…]` 前要逸出 `\ ] [ ^ -`(`-` 不逸出會把 `'1-3'` 當範圍);`u` 旗標下類別內 `\-` 合法,lodash `escapeRegExp` 的輸出(`\^ \$ \\ \. \* \+ \? \( \) \[ \] \{ \} \|`)亦皆合法.ESLint `no-useless-escape` 對類別內的 `\[` 報錯,寫成 `/[\\\][^-]/g`(類別含 `\\`、`\]`、`[`、`^`、`-`).非 BMP 的 `not`(`'😀'`)在無 `u` 旗標下會把代理對拆成兩個單元,誤擋共用高代理的 `'😁'`;`u` 旗標後以字元為單位(變異 P10 擊殺).
- **派工書的對照列未必有鑑別力,補一列**: `replacePlus('x]y-z', 'x', 'z', ']', 'R')` 修前也是 `'x]y-z'`(原因不同:`[^]]*` 是「任一字元 `[^]`」接 `]*`);補列 `replacePlus('xy-z', 'x', 'z', ']', 'R')`:修前 `'xy-z'`、修後 `'R'` 才能區分.凡派工書的「改為」值與修前實測相同者,都要自己再造一列會分開的.
- **變異腳本**: 沿用 ws286a 作法(`tmp/ws286b/mut/` 的 src／test 副本,工作樹 src 為 CRLF 先轉 LF,每個樣式命中恰一次否則拋錯);不做「移除 `sepInt` 的 `n` 檢測」變異——`n` 為 `Infinity` 時迴圈不終止(`intInputHang` 才有子行程逾時防護),改成「`n` 無效回 `[]`」;「值轉換與取代合併為同一趟」為等價變異(循環參照拋錯時不論順序都不回傳),已丟棄.每個測試檔分別 spawn mocha、`--reporter json --reporter-option output=`,彙總紅案.
- **案數核對**: `git archive HEAD` 解出舊 src／舊測試到 `tmp`,`mocha --dry-run --reporter json` 計舊／新案數(7 檔 275 → 562,+287);舊測試對舊 src 載入需 `../src` 指向舊副本,故副本內 `test/` 與 `src/` 同層.
- **sgud 整理**: `experience.md` 逾 30KB,依 §14 把 2026-11-02 起之 ws265／ws270／ws272a／ws272b 四節抽至既有之 `experience_20261102.md`(依抽出日期命名,該檔原有 2026-10-30~31 之 6 節),本檔留 ws272c 起之節;腳本驗「搬移前後每一行(多重集合,空行除外)皆在」缺漏 0.

## 非計算類函數必須參數遇非預期:差異比對子類 `strDiff`／`strDiffToHtml`／`arrDiff`／`matDiff`／`ltdtDiff`(2026-11-03,主控任務 20261031121854,ws286c)

- **「與正常輸出同形的空結果」要先實測正常輸出的鍵**: 派工書要求先量;實測 4 個函數的正常輸出只有 `diff`、`dfs`,`matDiff`／`ltdtDiff` JSDoc 原寫的 `dfrs` 並不存在(`@returns` 一併更正).兩邊皆空回 `{ diff: [], dfs: [] }` 且每次新物件(測試有「改共用常數」變異擊殺:呼叫端對回傳物件 `push` 後第二次呼叫須仍為空).
- **外層對內層回傳「賦值」會遮住內層的 `{}`**: 舊 `ltdtDiff([{}], [{}])` 內層 `arrDiff` 回 `{}`,外層 `r.dfs = map(...)` 把它補成 `{ dfs: [] }`;內層改回 `{ diff: [], dfs: [] }` 後外層輸出連帶變 `{ diff: [], dfs: [] }`(是同形變更,但屬「回傳值變了」,要在逐站表寫明並鎖測試).凡內層回空物件的改動,都要順著呼叫鏈看外層是補欄位、轉型還是原樣回傳.
- **內部站點用「儀器化 HEAD 副本」實測,不靠讀碼推論**: 複製 HEAD 的 `src` 到 `tmp`,在 `strDiff` 的兩邊皆空判斷前加 `globalThis` 計數,對邊界輸入各跑一次(`tmp/ws286c/inst.mjs`,證據 `ws286c-evidence/2-*`):`arrDiff([''], [''])`、`matDiff([[]], [[]])`、`matDiff([['']], [['']])` 內部字串為 `'\n'`／`'0∶⟋\n'`,**不會**以兩個 `''` 呼叫 `strDiff`;唯一會的是矩陣某列含換行造成 modify 行對(`matDiff([['a\nz']], [['b\nz']])`,該對去掉分隔字串後兩邊皆 `[]`),而該處只讀回傳的 `.dfs`(舊 `{}` 經 `map(undefined)` 得 `[]`),最終輸出逐字相同.派工書列的「`ltdtDiff([{}], [{}])`」實測 `strDiff` 呼叫 0 次(`ltdtkeys2mat` 無鍵直接回 `[]`,`arrDiff` 頂端即返回).
- **元素檢測用 lodash `every`,不用 `Array.prototype.every`**: 前者依索引走訪、空洞當 `undefined` 而無效;後者略過空洞,`[ , { a: 1 }]` 會通過(變異 L7／L8 擊殺).`isobj`(`[object Object]`)接受 `{}` 與無原型物件;`iseobj` 拒 `{}`,若誤用則 `ltdtDiff([{}], [{}])` 會拋錯(變異 L5 擊殺).
- **`ltdtkeys2mat` 靜默回 `[]` 的陷阱未處理(範圍外)**: 它對「任一列為 `{}`(非有效物件)」整側回 `[]`,`ltdtDiff([{ a: 1 }, {}], [{ a: 1 }])` 因此顯示「新增 1 列」而非「刪除 `{}` 列」;改前即如此,`{}` 是物件故不在使用者定的「元素非物件拋錯」內,列入 r2d〈已知殘餘〉與報告需裁示,不順手改(`ltdtkeys2mat` 為共用函數且不在本輪範圍).看到「檢測通過但下游又靜默丟資料」的組合,要在報告明寫而非放行.
- **差分序列化要標出 `undefined`**: `ltdtDiff` 首列無可比對儲存格時 `dfs` 為 `[{ k: undefined }, …]`,`JSON.stringify` 會隱成 `{}`;測試期望要寫 `{ k: undefined }`(`deepStrictEqual` 區分),差分腳本的序列化加 replacer 把 `undefined`／非有限數標成記號,否則「HEAD 與修後 JSON 相同」不等於物件相同.第一次跑就是這樣紅了一案.
- **等價變異要先證明再丟**: 移除 `strDiff` 的兩邊皆空提前回傳存活,因 `Diff.diffLines('', '')` 本就回 `[]` 而得 `{ diff: [], dfs: [] }`;移除 `matDiff` 的提前回傳存活,因交給 `arrDiff` 得同結果.兩者是冗餘捷徑,以 `probe-equiv.mjs` 實測後記為等價,不為殺它而刪捷徑(保持與其他三個函數的結構一致,且「兩邊皆空改回 `{}`」的變異 S3／M3 皆殺死).
- **console 攔截**: 測試用 `countConsole` 同時換掉 `log／info／warn／error／debug` 並在 `finally` 還原,斷言 throw 過程 console 0 次;同步測試期間換掉 `console.log` 不會干擾 mocha 報告器(報告器在測試之間輸出).
- **測試尾段批次改寫**: 5 個測試檔的舊「無效輸入回 `{}`／`''`」尾段(10 案 × 5 檔)以 `tmp/ws286c/rewriteTails.mjs` 取代——以舊首案標題為 marker(須命中恰一次)截斷、串接新尾段、依各檔 EOL(CRLF)寫入、寫前備份;新尾段與共用載具 `test/tools/diffInputKit.mjs`(無效值表＋`throwsMsg`)分開寫,避免 5 檔各貼一份近似的值表.

## 空資料不是失敗:向量處理空進空出、`arrProduct` 任一邊為空即 throw、轉換函數狀態模式、`getCsvStrFromData([])`(2026-11-03,主控任務 20261031121854,ws286d)

- **派工書表列與 HEAD 實測不符時,先量再依既定順序,不憑表改順序**: 表列「`arrAdd(['a'], [])`、`arrAdd([], ['a'])` 非空而無有效數字之一邊仍拋錯」,但 HEAD 實測回 `[]`(容器〔長度不同〕先於有效數字檢查,且已有測試鎖);要照表改成拋錯須動搖該順序(連帶 `arrAdd([1], [])` 與 `arrAdd([1, 2], [3])` 之一致性).維持 HEAD 並列待裁示,不自行改順序.
- **共用模組放行空陣列的位置要選對**: 空進空出放在 `reduceArrs`(`n === 0` 先於 `chkValid`)與 `arrAccum` 各自,**不改共用的 `chkValid`**——`arrNorm` 也經 `chkValid` 擋空陣列(變異 V5〔`chkValid` 對空陣列放行〕殺死 6 案)。`arrProduct` 內部呼叫 `arrMulti`,後者改成空進空出後會連帶放行 `arrProduct([], [])` 與 `([1], [])`(後者原就回 `null`),故須在 `arrProduct` 自己先以新 `chkNotEmpty` 擋(僅在全為陣列時檢查,非陣列仍交容器處置回 `null`);`errNoValid` 抽為訊息單一擁有者.
- **「空資料」只認 `isarr && length === 0`,不能用 `isearr`/`iser`**: `isearr` 把 `[{}]`、`[null]`、`['']`、`[[]]` 當無效(長度 1 但元素被視為空),這些仍是失敗;誤把判定放寬成 `isarr`(變異 C4、D4)會讓非空無效陣列被當成功/空內容.
- **型別檢測與資料有無無關(沿 `ltdtpull` 同日裁示)**: `keysmat2ltdt` 的 `keys` 檢查須先於 `mat` 為空之判定、`ltdt2vrtsable` 的 `mergerowkeys` 檢查須先於 `ltdt` 為空之判定(變異 C8、C12 以「兩區塊對調」殺死;首版變異是「刪除該檢查」,會連帶殺死其他案而不精準,改為對調才只殺目標案).副作用:`ltdt2vrtsable([], 'x', D)` 之錯誤訊息由 `invalid ltdt` 變為 `invalid mergerowkeys`(仍 error).
- **工具陷阱:Edit/Write 會把輸入中的 `\uXXXX` 轉成真實字元**: 在 JSDoc、測試中寫「反斜線 + u + feff」之跳脫序列時,檔內變成不可見的 BOM 字元(`grep -c "ufeff"` 為 0、`LC_ALL=C grep -c $'\xef\xbb\xbf'` 才查得到).改用 `String.fromCodePoint(0xfeff)`(測試)與文字描述 `BOM(U+FEFF)`(JSDoc);`\r\n`、`\n` 不受影響.寫完檔以位元組搜尋 `$'\xef\xbb\xbf'` 驗.
- **差分要先確認被比函數對自己是否決定性**: `getExcelU8ArrFromData` 輸出的 zip 含時間戳,同一輸入隔秒位元組即不同(HEAD 對 HEAD 亦然,`tmp` 內 `probe-zip-nondeterm.mjs` 證實),首次差分碰巧同一秒而 0 差異,第二次在秒界出現 1 列「差異」.改以同一支讀取器讀回內容比對;位元組比對 zip 輸出的測試皆應改比讀回內容.
- **空工作表的判定以讀回為準**: hucre 把只有空儲存格(`[[null]]`、`[[null, null]]`)的工作表讀為無列,與 `rows = []` 同為 `data: []`;差分之「受影響域」須以 HEAD 讀回 `fmt: 'array'` 長度 0 判定,不能用輸入列數.
- **舊案數計法**: `git show HEAD:test/<檔>` 輸出到 `tmp/<輪>/head/oldtest/`(旁置 `src` 為 HEAD 副本、複製 `test/tools`)後 `mocha --dry-run`,得 16 檔 1050 → 1384(+334);`git archive HEAD src` 解出 HEAD src 供修前紅與差分用,repo 工作樹與索引不動.
