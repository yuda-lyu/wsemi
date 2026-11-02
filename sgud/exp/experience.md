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

## fsEnsureBins 支援壓縮檔類型 tgz(2026-11-01,主控任務 20261031175415,wsemi-tgz,Gitea #32)

- **文件先寫「想當然」再實測就會錯**: JSDoc 初稿寫「成員路徑須與壓縮檔內逐字相同、不含 `./`」,隨後以 probe 對 System32 `tar.exe`(bsdtar)與 Git 的 GNU tar 1.35 各跑同一組形狀才發現: bsdtar 會把 `./build/x` 與 `build/x` 視為同一成員,**GNU tar 不會**(`Not found in archive`);兩者對 `..`／絕對路徑項在「只列出特定成員」時皆不寫出暫存夾外;宣告 tgz 而內容為 zip 時 bsdtar 照解、GNU tar 失敗.做法: 手寫 ustar＋`zlib.gzipSync` 的產生器 `test/tools/tgzStore.mjs`(資料夾、符號連結、硬連結、`..`、絕對路徑、`./` 前綴、重複項皆可產),探測腳本放 `./tmp`,先看實測再寫 JSDoc／帳本.
- **issue 所述數量要以實測為準**: Gitea #32 稱 43 個 dll,官方資產實為 44 個(49 項＝canvas.node＋44 dll＋4 建置中繼檔＋2 資料夾項).夾具由 `./tmp` 腳本自實際解出之檔產生(`test/tools/canvasNapiWin32X64.mjs`),不手抄 45 行雜湊.
- **修前紅要誠實**: 新測試對 HEAD 之 src 46 failing,但「成員路徑含 `..`／絕對路徑」等 E_MANIFEST 案修前紅是因 `type: 'tgz'` 先被拒(field 不同),並非路徑檢核本身缺漏;這類案的保護力以變異證明(放寬 `isBinRel` 的 M21、M22 被擊殺).不要把這類紅算成「抓到缺陷」.
- **等價變異與冗餘檢查**: `assembled.type` 先查「在 ARCH_TYPES 內」再查「等於 extract.type」,前者冗餘(變異存活,只差錯誤訊息);合併為單一等式檢查(訊息以 `must be '<extract.type>'` 起頭,相容舊字串)後全擊殺.
- **路徑穿越案要能真的失敗**: 檔案組之解出夾為 `<暫存>/a0/x`(單一檔為 `<暫存>/x`),`..` 往上 1 層仍在暫存夾內(事後被刪,偵測不到),要用 3～4 層才落在快取夾／套件根;斷言用「套件根下無含 escape 之項目」＋上層夾具根.證明斷言非空轉: 沙箱變異 M24(`tar -x -P` 不限成員,測試副本先移除絕對路徑項以免寫到磁碟根)被單一檔與檔案組兩案擊殺.sonnet 審查者即指出初版檔案組案只檢查了夾具根與其上一層而空轉.
- **spawn 記錄要排除 ENOENT 嘗試**: 非 Windows 的 `tarProgs` 為 `['bsdtar','tar']`,無 bsdtar 時先 spawn 一次失敗才換 `tar`;測試記錄 `calls.length` 時於 `error`(ENOENT)移除該筆,否則「一次 tar 取多個成員」之斷言在 Linux 變 2.
- **tgz 無法跳讀**: 成員多而分批(`ARGS_CAP` 6000 字元)時每批各自自頭解壓縮;w-canvas 的 45 個成員約 1.5 KB 一批完成.
- **變異做法**: 沙箱副本 `./tmp/wsemi-tgz/mut/`(`fs.cpSync` src＋複製測試與工具,不動 repo 檔)、單一驅動腳本包在一次 `--lock`(24 項約 1 分 40 秒);需改測試副本的變異以 `[label, file, from, to, patchTest]` 第五欄處理.修前紅用 `git archive HEAD src` 解到 `./tmp/wsemi-tgz/orig/`,測試副本放 `orig/test/`,從 repo 根執行 mocha(測試用 `path.resolve('./test/_tmp/…')` 仍落在 repo 根)——不需 stash／checkout.
- **誤用 heredoc 被守門擋下**: 命令中多寫了無用的 `cat >/dev/null <<'EOF'`,被「bash-heredoc」守門擋下(無副作用,已改以 Grep 讀取);多行內容一律 Write／Edit.

## 自 srcRunner 移入 4 件:顯式時區時鐘、結果走 JSON 檔之 CLI 執行、原子寫檔、失敗摘要(2026-11-01,主控任務 20261101152333,wsemi41,Gitea #41)

- **dayjs `tz()` 在「系統時區夏令轉換間隙」差 1 小時,且偏移標示不變**: dayjs timezone 外掛把目標時區之牆鐘當**系統本地時間**重新解析,牆鐘落在系統時區不存在的那一小時(`TZ=America/Los_Angeles` 於 2026-03-07T18:00Z 起一小時,Taipei 得 `…030000` 應為 `…020000`,`iso8` 仍標 `+08:00`)即偏移 1 小時.原 srcRunner 即用此法(隨件帶入的缺陷).初版我也照用,是獨立審查者(sonnet)以 `Date.parse(iso8())` 逐 5 分鐘對照實際瞬間才抓到(27 組情境);改為 `Intl.DateTimeFormat.formatToParts` 取欄位＋「牆鐘視為 UTC 減實際時刻」算偏移,不經任何本地時間解析.**測試設計教訓**: 只驗「`Date.parse(iso8)` 等於實際瞬間」仍殺不掉「以本地時間解析牆鐘」的變體(它自洽地改標偏移為 `+09:00`,瞬間仍對),須再加**無夏令時區的固定偏移對照**(Taipei `+08:00`、Kolkata `+05:30`、UTC `+00:00`)——變異 G22 起初存活即此.
- **審查者找到的 5 個真缺陷,都不在我列的輸入空間內**(測試全綠時仍存在): 純檔名 `'bare.txt'`(`getPathParent` 回 `''`,`mkdir('')` 失敗;`fsWriteTextCore` 忽略建夾結果所以沒事)、直接上層為 junction／符號連結(`fsIsFolderCore` 用 lstat 對連結回 false,`fsCreateFolderCore` 又因 `statSync` 為真而回「已存在」)、相對 `outputPath` 搭配 `opt.cwd`(子進程寫在 cwd 下而本進程讀自己的 cwd)、`opt` 不可讀時 reject(與 execCli 之 R-EXEC-FAIL-01 規則 13 不一致)、系統夏令間隙.往後寫檔案類函數的輸入空間表**路徑形狀軸**須含: 純檔名／`./`相對／絕對／含空白中文／直接上層為連結／父層為檔案／極長檔名;且「相對路徑 × cwd」「建夾邏輯」不要自己重造,用 `mkdirSync(recursive)`(已存在之資料夾與連結不報錯).
- **測試只驗 `String` 包裝物件／已撤銷 Proxy 的一半**: `isestr` 收 `new String`、`isestr(revokedProxy)` 會拋;傳給 spawn／檔案路徑者改 `typeof v === 'string'`(dspec S1),測試表加 `Object('x')` 與 `Proxy.revocable` 後 `revoke()`;測試訊息組字時別對已撤銷 Proxy 呼叫 `String(v)`(我自己的斷言訊息就因此拋 TypeError,改 `typeof v`).`new String(...)` 被 eslint `no-new-wrappers` 擋,用 `Object('x')`.
- **半行補回報的時機要用事件順序而非時間斷言**: 重試時某次嘗試殘留之無換行半行,初版掛在下一次嘗試的 `attempt` 事件才補回報(實測 `retryDelayMs:1500` 時延 1.5 秒),改掛 `settle`.測試把 `onProgress` 與 `onTrace` 的呼叫寫進同一條時間線陣列,斷言 `line:[p] first-half` 的位置在 `trace:retry` 之前、`trace:settle` 之前(內部補回報先於使用者的 `onTrace`).
- **per-stream 吞錯變異要各自一案**: `onProgress` 拋錯應原樣重拋為未捕捉例外;子行程案只讓 stdout 側或只讓 stderr 側拋錯(`progressThrowsOut`／`progressThrowsErr` 兩案),否則兩側同拋時「吞掉其中一側」的變異(J16、J20)因另一側仍拋而存活——初版即 J16 存活.
- **小睡類退避的測試**: 注入 fs 使 rename 恆拋 `EBUSY`,以 `onTrace` 的 `retry` 事件之 `ms` 欄位斷言 50／100／150;「確實睡了」只能斷言下界(`hrtime` 量得 ≥ 145 ms,留 5 ms 計時粒度,負載只會拉長不會縮短),沒有這案時「退避不睡」(`Atomics.wait` 換成 `void ms`)的變異會存活.
- **「寫到一半中止」要用真行程驗**: 子行程 runner 注入的 `writeFileSync` 寫前半內容後 `process.exit(7)`: 原子版目標檔仍是完整舊內容(暫存檔殘留 1 個,JSDoc 已載),對照組 `fsWriteTextCore` 同樣注入則目標檔只剩前半(`'NEW-'`).兩案成對才證明測試鑑別得出原子性.
- **修前紅對全新函數的意義**: 新函數對 HEAD 之 src 只是「模組不存在」(整檔載入失敗),不證明測試鑑別力;鑑別力以沙箱變異(`tmp/wsemi41/mutate.mjs`,每項 `[find, replace]` 須恰出現 1 次否則 BAD-PATTERN)證明,並刻意列出等價存活者(`Math.round`→`Math.floor` 因已取整秒而等價;切行器新段無換行提早返回只影響效能;最後補回報為 settle 之保險).沙箱放 repo 的 `./tmp/` 下即可由父層解析 `node_modules`,**不需 junction**.
- **工具坑**: Bash 守門擋 `cd`(連 `cd /dev/null` 都擋);`decision-log.mjs` 的任務資料夾引數在 Bash 雙引號內寫反斜線會被吃掉,改用正斜線 `C:/opensrcOper/dnow/...`;`eslint --fix` 只對本輪新檔使用(`object-curly-newline`、`object-property-newline` 會把密集斷言展開),`src/index.mjs` 的 `eol-last` 是產生器既有輸出;`git status` 的亂碼檔名 `建議wsemi調整.md` 是主控放入之建議檔(未追蹤),不動.

## wsemi41b 修正輪:對照原測試修三處「推定」(2026-11-01,主控任務 20261101152333)

- **「推定」寫進報告等於把核對工作丟給主控**: wsemi41 對建議檔未載之邊界(行尾 `\r` 還是 `trim()`、截斷是否補刪節號、`attempts` 為 0 是否顯示)都以「推定」處置並列待裁示,主控把 srcRunner 原測試逐字移植成 `verify.mjs` 一跑即 12 案 9 過 3 敗,三處推定全錯,而答案原本就在 `C:\opensrcOper\srcRunner` 的原碼與原測試(該夾被 git 排除,Grep／Glob 會略過,須 Read 帶絕對路徑或 Bash grep 指定目錄).往後**移入既有函數時,凡想寫「推定」之處,先到原專案原測試找斷言**(`attempts` 零值那條在另一個模組之測試 `unit-runner.test.mjs:377` 與 `core/ai/caller.mjs:96`,不在 `cliFailDetail` 自己的測試內,要以欄位名稱全專案 grep),找不到才列待裁示.
- **逐字移植原測試入本套件測試**: 保留輸入與期望值逐字、僅換函數名與路徑,並在 `it` 標題標原檔行號;與自寫之語意案並存.這批案在修前寫法下即紅(3 條對應 verify 三敗),等於「修前紅」有了真依據,而非只證模組不存在.
- **切行器 trim 放在 `deliver` 單一處**: `emit` 與 `flush` 共用,故「flush 內另行去 `\r` 再交 `deliver`」是**等價變異**(`deliver` 本就 trim);有鑑別力之 flush 變異須繞過 `deliver`(直接 `onLine(rest)`),否則會誤判為存活.前綴比對改用 trim 後字串後,縮排之前綴行會被收進(回報時已去縮排),前綴自身含前導空白者永不符——兩者都以案固定.
- **`strTruncate` 以 UTF-16 碼元計**(`strleft` 用 `substring`),委派後 `n` 落在代理對中間會切成半個字元(修前自寫碼點截斷不會).測試不寫死此瑕疵: 以 `strTruncate(壓平後, n)` 為預期(同函數即契約)加幾條字面錨定(`'中文錯誤訊息'` n=4 → `中文錯誤...`、`'😀😀'` n=4 恰不超長),並於 JSDoc／帳本載明限制.
- **全套 `npm test` 的通過數偶有 ±3 浮動**(同一碼連跑兩次 22914／22917,皆 0 failing;差的 3 案為 `blob2*` 家族之 `need test in browser`、`should reject with invalid bb…`、`should reject with no window…`,與本案無關);比對兩份 log 之法: 去掉 `(NNNms)` 後以 `✔` 行集合做差(`tmp/wsemi41b/difflogs.mjs`).報告以兩次數字並陳,不挑一次.
- **守門仍擋 `cd`**: 本輪又兩次(`cd /c/…`、`cd /dev/null`)被「bash-cd」擋下;要在特定目錄跑 `npx eslint` 等,直接在 repo 根下以相對路徑執行即可(工作目錄本就是 repo 根).

## 移除全部 *Dyn 函數(2026-11-01,主控任務 20261101202155,wsemi-rmdyn,Gitea #44)

- **「這機制是否只為 X 而存在」不能只看註解自述**: `_filterXSS` 註解寫「如 clearXSSDyn、detectXSSDyn…」,但機制(執行時找全域 `filterXSS`)對非 X 的函數同樣有效.判法是在 X 之外重現使用情境、看非 X 的函數是否仍依賴它: `vm.createContext` 補 `TextEncoder` 等 Node 全域(`window`／`self` 指向 context),載現行 `dist/wsemi.umd.js` 與 `node_modules/xss/dist/xss.min.js`,三種順序實測——先 xss 後 wsemi、先 wsemi 後 xss 時 `clearXSS`／`detectXSS` 皆可用,僅 wsemi 則拋 `invalid filterXSS`;故保留.同型作法另有 `_getHtmlToText`、`_getDiff2Html`、`domRenderMarkdownMind`(`g.markmap`),皆是「UMD 外部依賴晚載入」之通則,不屬 *Dyn.**`getUserAgent` 看似同型(`UAParser || g.UAParser`)實則無效**: external 以 `e.UAParser` 屬性存取編譯,晚載入 ua-parser-js 時在取全域之前即拋 `Cannot read properties of undefined (reading 'UAParser')`(vm 實測 `umdLateUa.mjs`,既有缺陷,本輪未動,README Note 改為須先於 wsemi 載入).我初稿曾把它寫成「同型作法」,是獨立審查者(sonnet)指出並經實測才改;**判斷「同型」須實測,不能只看程式字面**.
- **Node 不能載入整份 `src/index.mjs`**(`domShowImages` 引入 `viewerjs/dist/viewer.css`,HEAD 即如此,`ERR_UNKNOWN_FILE_EXTENSION`;index 供 rollup 用): 檢查 index 以文字解析匯出表(對照 `git show HEAD:src/index.mjs`)＋檢查 src 內相對匯入之目標檔皆存在代替;掃相對匯入時 `'./src/…'` 是字串樣板內相對於 cwd 之路徑(如 `fsTaskCp`、`fsWatchFolder`),不是模組匯入,須分開解析否則誤報.
- **全套前後比對用 ✔ 行多重集合差**(去 `(NNNms)`): 證明消失者恰為刪除之測試;標題含執行當下時間戳或 AES 密文(`aes2str` 之輸入,每次加密鹽不同)的案每次不同,成對出現在「消失」與「新增」兩側,屬噪音.全套通過數基線 22917 → 22907,差 10 即 7 個 *Dyn 測試檔之案數(刪檔前先以 mocha 單跑那 7 檔取得 10).
- **CRLF 檔之多行修改**: README.md、state.md、experience.md、rulebook.md、rulebook_breaking.md、`src/index.mjs`、`src/domRenderMarkdownMind.mjs` 為 CRLF;Edit 工具單行內替換安全,多行(含換行)改以 `tmp/` 腳本讀入、斷言命中次數、寫後驗裸 LF 為 0.帳本其餘(rulebook_xss／data／trace)為 LF.
- **markmap 打包評估取「官方預建檔實測」**: 以 jsDelivr 取 d3@7.8.3(279,580 B)、markmap-view@0.14.4(23,274 B)、markmap-lib@0.14.4 browser(127,101 B),共 429,955 B(gzip 143,491)對現行 UMD 1,364,805 B(gzip 436,290),增約三成;d3 取全量為上限,樹搖後之實測需另建專案安裝相依與可用的 rollup 外掛,本輪未做.
- **工具坑**: `decision-log.mjs` 之任務資料夾在 Bash 雙引號內寫反斜線被吃掉,用正斜線; Bash 守門連 `cd .` 也擋.

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
