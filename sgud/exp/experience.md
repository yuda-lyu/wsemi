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

2026-11-03(ws286e)再整理: 本檔原約 31.9KB,將 2026-11-02 之 4 節(約 15.2KB)抽出至 `sgud/exp/experience_20261103.md`(節號與標題不變、內容逐字搬移),本檔只留 ws286c 起之節.需要時調閱該檔.被抽出之節:

- 第二批第 2 輪「DOM 類、`_optNum` 退役、`fsTask`」＋ws272b 回報後續 6 項＋sgud 拆檔(2026-11-02,主控任務 20261102123434,ws272c)
- 第二批第 3 輪「interp1、arrGroupByMaxmin、arrLookupByMaxmin、strTruncate＋domFadeIn」(2026-11-02,主控任務 20261102171617,ws271)
- 非計算類函數必須參數遇非預期:第一類 4 個函數(2026-11-02,主控任務 20261031121854,ws286a)
- 非計算類函數必須參數遇非預期:第二批 `getTimeRange`＋字串／日期子類 4 個函數＋`cfilesize`(2026-11-02,主控任務 20261031121854,ws286b)

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

## 陣列與結構子類:必須參數無效即 throw、空資料照常(2026-11-03,主控任務 20261031121854,ws286e)

- **型別檢測通過後仍留 `isearr` 守門,以免改動未列之合法呼叫**: `arrReverse`／`arrSep`／`matat` 原以 `isearr` 一次擋空陣列與非陣列;改為先 `isarr` throw、(`arrSep`／`matat` 再驗其餘必須參數)、最後才 `if (!isearr(x)) return []`——空陣列與僅含單一廣義無效元素(`[null]`、`['']`、`[{}]`、`[[]]`)之陣列維持 `[]`.`arrReverse([null])` 回 `[]` 而 `([null, null])` 回 `[null, null]` 是靜默丟資料的既有怪行為,不在使用者所列表,依「與表衝突或判不了者不改」只列需裁示(HEAD 實測見 `ws286e-evidence/5-rows-head.log`).
- **舊行為可能藏在子行程 runner**: `arrSep` 整數寫法無效改 throw 後,`test/tools/intInputHangRunner.mjs` 之 `() => ({ ret: arrSep(arr8, Infinity) })` 沒有 try,throw 會讓子行程崩潰;須同改成 `tryThrow` 並更新 `intInputHang.test.mjs` 期望.改回傳為 throw 時,`Grep` 被測函數名於 `test/tools/` 也要查,不只看 `test/*.test.mjs`.
- **逐參數「先型別、再元素」的檢測順序要寫成測試**: `matConcat`／`matat`／`ltdtpull` 兩個以上參數都無效時回報最前者;變異以「只在另一參數為陣列時才檢這個參數」之條件式擊殺(顛倒順序不必搬動整塊程式).`every(x, isarr)`／`every(x, isobj)` 之 lodash 版把陣列空洞當 `undefined`,測試補 `[[1], , [3]]`.
- **共用載具已有就重用**: `test/tools/diffInputKit.mjs` 之 `NON_ARR`(21)、`NON_OBJ_ELEM`(20)、`LEAK`、`throwsMsg`、`throwsMsgNoLeak`;`NON_ARR` 不含陣列,可直接當「元素非陣列」值表;`NON_OBJ_ELEM` 含陣列,不能當 `matConcat` 的非陣列元素表.
- **測試鎖排隊與背景時限**: 本機 `--lock` 遇他套件 `--lock-exclusive` 排在前面時,排隊可超過 10 分鐘;前景 10 分鐘轉背景後,預設再給 10 分鐘即被終止(連排隊項一起消失).排隊的指令必須 `run_in_background` 並明給 `timeout`(≥ 預估排隊＋執行),且把「受影響測試」與「變異」合併成**一個** wrapper 腳本(`tmp/<輪>/run-all.mjs`,各階段完整輸出寫 `tmp/` 檔、stdout 只印摘要)只排一次;分兩次排會各等一輪.被我 `TaskStop` 的排隊項若在 `locks/queue` 留下死 pid 檔,`quiet-run --release-stale --cwd <repo>` 不會清它,等管理端略過即可,不要手動刪.
- **環境小陷阱**: 此 bash 的 `grep -c $'\r'` 把 `$'\r'` 展成空字串而計全部行,不能用來判 CRLF,改用 `git ls-files --eol`;`grep -E` 搜含括號的測試標題要改 `grep -F`(`(opt not given)` 被當群組,誤報 0 紅).
- **前後差分以「規格寫成函數」判受影響域**: `3-diff.mjs` 每列由同一種子生出 HEAD 用與工作樹用兩份獨立物件圖,生成器同時回傳預測(`same` 或 `m`=預期 throw 訊息);有效域逐列比 HEAD(含 `ltdtpull` 的 `result === ltdtAll` 身分),受影響域比預測訊息.

## Windows 查埠改以 OS API(GetExtendedTcpTable),Get-NetTCPConnection 為退回(2026-11-05,主控任務 20261105072000,wu312)

- **耗時隨 TCP 列數,不隨查詢範圍**: `Get-NetTCPConnection -LocalPort` 先列舉全表再篩,1.2 萬列時 11.4～16.5 秒,連線少時 1.0～2.4 秒;OS API 0.4～1.3 秒不隨列數增加.量測要**同一時段新舊交錯**(`tmp/wu312/benchCompare.mjs`),並自建負載才複現:`loadConns.mjs` 起 `listen({ backlog: 8192 })` 伺服端並分批 100 條連線(失敗重試),3500 條已建立(7 千列)＋4500 條立即關閉(TIME_WAIT)得總列數約 1.2 萬;預設 backlog 與一次開 100 條以上會漏連(第一次只得 808＋960).負載行程只結束自己的 PID,關閉後 TIME_WAIT 約 2 分鐘自行消退.
- **PowerShell 5.1 的 Add-Type**: 編譯在 `%TEMP%` 產 `<亂碼>.0.cs/.cmdline/.dll/.err/.out/.tmp`,正常結束自行清掉(私有 TEMP 夾驗 0 遺留);被 SIGKILL 於編譯中途則 6 檔遺留且無 csc.exe 孤兒.`-EncodedCommand` 長度:2.6 KB 腳本→6888 字元(CreateProcess 上限 32767,經 cmd.exe 為 8191),新增 C# 要留意仍 < 8191.把 `TEMP`/`TMP` 設到不存在之夾 Add-Type 仍成功(退用他處),故驗遺留檔須指向存在之私有夾.中文路徑之 TEMP 亦可編譯.
- **`Write-Output 'a' + $b` 的陷阱**: 命令模式下 `+` 與 `$b` 是另外兩個引數,不是串接;須 `Write-Output ('a' + $b)`.
- **受限語言模式(CLM)的真實測法**: `__PSLockdownPolicy=4` 於 Windows 11 build 26300 無效(`$ExecutionContext.SessionState.LanguageMode` 仍 FullLanguage、Add-Type 可用),不可當作已驗.可行手段: 在同一 PowerShell 內先(完整語言模式)把腳本文字解 base64 存變數並 `Import-Module NetTCPIP`,再 `$ExecutionContext.SessionState.LanguageMode = 'ConstrainedLanguage'`,最後 `Invoke-Expression $s`;未先載入 NetTCPIP 則 cmdlet 自動載入被擋(`CouldNotAutoloadMatchingModule`).此為真實 CLM 引擎(Add-Type 被拒),系統層級政策(WDAC/AppLocker)仍未實測.
- **新舊查法比對要在同一 PowerShell 行程內依序 A=新→B=舊→C=新**(`compareAll.mjs`):A△C 為期間變動,不計入差異.新查法的出貨 C# 只改兩處(去埠過濾、輸出實際本地埠)即可全表傾印,位移與位元組序邏輯為出貨原碼.發現**舊查法之幽靈列**(對外連線之客端埠多一筆遠端萬用、埠 0 的列;`netstat` 無、`connect` 得 ECONNREFUSED),差異判斷要用「獨立證據」(netstat、真 connect、自建真監聽者對照組),不能只看兩者誰多誰少.
- **僅綁定未 listen 之 socket**: netstat 與 `GetExtendedTcpTable` 皆無,只有 Get-NetTCPConnection(NSI 提供者)有;換資料來源前要用此類 socket 實測(PowerShell `Socket.Bind` 不 listen),舊註解「僅綁定亦會列入」在 OS API 路徑不成立.
- **變異測試改碼檔的安全作法**: `mutate.mjs` 備份原檔與 sha256、每變異驗 `from` 恰一次、`finally` 與 SIGINT 還原並驗雜湊;變異期間不得跑其他匯入該檔的腳本(會讀到變異碼),也不得編輯 src 與測試.以 `process.execPath + mocha.js` 起 mocha,不經 shell(`--grep` 的 `|` 會被 cmd 當管線).背景 `cmd &` 會使 run_in_background 的工作立即「完成」,實際仍在跑,要看 quiet-run 的 log 判斷.
- **測試輔助**: 子行程以 stdout 一行一 JSON 通知就緒與事件(`test/tools/portPidsChild.mjs`),客端連線狀態以兩端事件同步(伺服端 `allowHalfOpen: true` 才能製造 FIN_WAIT_2／CLOSE_WAIT;TIME_WAIT 須客端先關、伺服端再 `end()`).
