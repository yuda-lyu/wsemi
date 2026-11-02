# 累積經驗(2026-11-01)

本檔自 `sgud/exp/experience.md` 抽出(2026-11-02 ws272c 依全域設定§14整理;原約 38.7KB):2026-11-01 之 4 節(約 13.5KB)逐字搬移、節號與標題不變;本檔以外之現行經驗見 `sgud/exp/experience.md`.

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

