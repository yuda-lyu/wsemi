# 規則帳本

本檔為套件設計與開發階段之規則帳本,為要求程式碼須長成什麼樣,或由規格產出之測試(項目/說明/流程)有哪些,包含軸、單一擁有者、已知限制、破壞性變更紀錄,以及對應是哪些測試檔案或指令等,由agent自行編列、擴充與維護.

## 索引(哪類查哪檔)

2026-10-28(wsemi-run08)依全域設定§14整理: 本檔原約 301.4KB,現依類型拆為下列各檔(同目錄);各節之節號與標題不變、內容逐字搬移,既有引用(如 `sgud/rule/rulebook.md R-FIND-01`)改至下表所列之檔查閱.新增條目時附於相近類型之檔,並同步更新本索引.

2026-10-29(wsemi-run10)再整理(各檔約 30KB 以上者): `rulebook_fs.md` 之 R-DL-VERIFY-01 移至 `rulebook_dl.md`、R-BIN-ENSURE-01 移至 `rulebook_bin.md`;`rulebook_timer.md` 之 R-TRACE-01 移至 `rulebook_trace.md`;`rulebook_breaking.md` 之第 1～38 項(2026-10-16 至 2026-10-21)抽至 `rulebook_breaking_20261021.md`(同一節標題、項號不變).節號與標題不變、內容逐字搬移.單節即逾 30KB 之 R-FIND-01、R-ORMSTR-01 與約 30KB 之 `rulebook_exec.md`(二節)未拆.

2026-11-02(ws272c)再整理(依全域設定 §14,各檔約 30KB 以上者): `rulebook_judge_sites.md`(原約 81.2KB)依類型拆為 `_inv_a`(§1~§5)、`_inv_b`(§6、§7、耦合摘要)、`_r1`(第一批、發布 A、ws270 處置結果)、`_r2`(ws272a、ws272b 處置結果)四檔,主檔只留標題、〈共通說明〉(風險代號)與索引;ws272c 起之處置結果節附於新檔 `_r2c`.`rulebook_breaking.md`(原約 49.4KB)依項號拆為 `rulebook_breaking_39to44.md`、`rulebook_breaking_45to51.md`、`rulebook_breaking_52on.md`(第 52 項起,新增之項附於此檔),主檔只留索引.節號與標題不變、內容逐字搬移(僅檔內指向兩檔特定節或項之引用同步改指新檔).

| 類 | 檔 | 條目 | 約 KB |
|---|---|---|---|
| 計時器、佇列與 Promise 流程 | `sgud/rule/rulebook_timer.md` | R-TIMER-RELEASE-01、R-PM-SETTLE-01 | 20.9 |
| 計時器相關函數之觀察回調 | `sgud/rule/rulebook_trace.md` | R-TRACE-01 | 24.6 |
| 檔案系統(含 `fsWriteTextAtomic` 原子寫檔) | `sgud/rule/rulebook_fs.md` | R-FS-RESULT-01、R-FS-REJECT-01、R-FS-EVEM-NAME-01、R-FS-ATOMIC-01 | 約 28 |
| 顯式時區時鐘 `genClockTZ` | `sgud/rule/rulebook_clock.md` | R-CLOCK-01 | 約 6 |
| 結果走 JSON 檔之 CLI 執行 `execCliJsonFile` 與失敗摘要 `execCliFailDetail` | `sgud/rule/rulebook_execfile.md` | R-EXEC-JSONFILE-01 | 約 7 |
| 帶期望雜湊之下載 | `sgud/rule/rulebook_dl.md` | R-DL-VERIFY-01 | 23.2 |
| 外部執行檔取得 | `sgud/rule/rulebook_bin.md` | R-BIN-ENSURE-01 | 25.0 |
| 執行外部程序與編碼 | `sgud/rule/rulebook_exec.md` | R-EXEC-FAIL-01、R-CODEC-ERR-01 | 30.6 |
| XSS 偵測與清洗 | `sgud/rule/rulebook_xss.md` | R-XSS-01、R-XSS-WALK-01 | 19.7 |
| 物件迭代與鍵表 | `sgud/rule/rulebook_obj.md` | R-KEYMAP-01、R-OBJ-ITER-01 | 24.1 |
| 資料與型別判定、格式轉換 | `sgud/rule/rulebook_data.md` | R-EXCEL-READ-01、R-UTF8-01、R-ENV-01、R-WRAPPER-01、R-FILETYPE-01 | 24.3 |
| w-orm 系列條件(find)之形狀檢核 | `sgud/rule/rulebook_orm-find.md` | R-FIND-01 | 38.5 |
| w-orm 系列字串良構 | `sgud/rule/rulebook_orm-str.md` | R-ORMSTR-01 | 36.9 |
| SQL 族後端共用之方言中立條件 IR | `sgud/rule/rulebook_orm-lower.md` | R-LOWER-01 | 18.7 |
| 診斷輸出與遮罩(含規則 14 通報站點經 getDiag、規則 15 形狀摘要 getDiagShape;單節,未拆) | `sgud/rule/rulebook_diag.md` | R-DIAG-01 | 38.5 |
| 查詢埠之監聽者 | `sgud/rule/rulebook_port.md` | R-PORT-PIDS-01 | 9.0 |
| fs 路徑參數無效(非字串、空字串、含 NUL)之處置: 依失敗通道回報、不帶值、與不存在分開(第 216 項①) | `sgud/rule/rulebook_fspath.md` | R-FS-INVALID-PATH-01 | 約 8 |
| `fsWatchFolder` 被監看資料夾本身消失之 `unlinkDir` 一次消失只派發一次(第 238 項) | `sgud/rule/rulebook_watch.md` | R-WATCH-ROOT-ONCE-01 | 約 4 |
| UMD 版 external(ua-parser-js、xss)晚載入須可用(第 258 項) | `sgud/rule/rulebook_umd.md` | R-UMD-EXTERNAL-01 | 約 4 |
| 測試檔結構: 測試檔互不 import、工具檔頂層不註冊 describe(第 254 項) | `sgud/rule/rulebook_test.md` | R-TEST-STRUCT-01 | 約 4 |
| 判斷類專用函數 `isenum`／`iseint`、`preciseNum` 精度,及既有函數改用第一批 | `sgud/rule/rulebook_judge.md` | R-ENUM-01、R-PRECISE-01、R-ENUM-CALLERS-01 | 約 24 |
| 判斷類專用函數之改用站點全集(排程第 221 項輸入;217 站點、符合 191)——主檔只留〈共通說明〉(風險代號)與本類之索引(2026-11-02 ws272c 拆為下列 5 檔,原約 81.2KB) | `sgud/rule/rulebook_judge_sites.md` | 標題、〈共通說明〉、索引 | 約 6.2 |
| 同上——§1~§5(計時毫秒、埠號、索引、個數、位元) | `sgud/rule/rulebook_judge_sites_inv_a.md` | R-ENUM-01 之站點全集(§1~§5) | 21.8 |
| 同上——§6 一般數值運算、§7 不符合、耦合與缺陷 | `sgud/rule/rulebook_judge_sites_inv_b.md` | R-ENUM-01 之站點全集(§6、§7、耦合摘要) | 18.4 |
| 同上——處置結果:第 221 項第一批、第二批第一級發布 A、已知缺陷先修(ws270,7 個函數) | `sgud/rule/rulebook_judge_sites_r1.md` | R-ENUM-CALLERS-01 之已套／未套、R-OPT-VAL-01 之已套／未套(發布 A)、ws270 處置結果 | 16.8 |
| 同上——處置結果:第 221 項第 2 輪 ws272a(計時與流程類 19 個函數)、ws272b(字串、陣列、數值、編碼類 19 個函數＋3 項缺陷) | `sgud/rule/rulebook_judge_sites_r2.md` | ws272a、ws272b 處置結果 | 22.2 |
| 同上——處置結果:第 221 項第 2 輪 ws272c(`_optNum` 退役、DOM 類、`fsTask`、ws272b 回報後續 6 項)、第 3 輪 ws271(`interp1`、`arrGroupByMaxmin`、`arrLookupByMaxmin`、`strTruncate`、`domFadeIn`);第 221 項 §11 第 6 項 ws286a(DOM 4 個函數與 3 個呼叫端)、ws286b(`getTimeRange`、`rep`、`replaceObj`、`replacePlus`、`sepInt`、`cfilesize`);此檔已逾 30KB,其後新增節另開 `rulebook_judge_sites_r2d.md` | `sgud/rule/rulebook_judge_sites_r2c.md` | ws272c、ws271、ws286a、ws286b 處置結果 | 33.8 |
| 同上——處置結果:第 221 項 §11 第 6 項 ws286c(差異比對子類 `strDiff`、`strDiffToHtml`、`arrDiff`、`matDiff`、`ltdtDiff` 與內部呼叫鏈逐站確認)、ws286d(空資料不是失敗:`arrAdd`／`arrMulti`／`arrAccum` 空進空出、`arrProduct` 任一邊為空即 throw、5 個轉換函數狀態模式、`getCsvStrFromData([])`;更正第 15 項「空陣列亦 throw」);新增之處置結果節附於此檔(逾 30KB 時再抽出新檔) | `sgud/rule/rulebook_judge_sites_r2d.md` | ws286c、ws286d 處置結果 | 21.2 |
| opt 類數值參數非預期之輸入改用預設(含超出範圍)、`opt.debug` 警告、廣義數字陣列之 `opt.base`、`preciseNum` 整數路徑、`arrFilterByENum`(第 221 項第二批第一級發布 A;ws270、ws272a、ws272b 起納入含 `Infinity` 邊界或有下游站點之函數) | `sgud/rule/rulebook_optval.md` | R-OPT-VAL-01 | 約 21 |
| 破壞性變更紀錄——主檔只留標題、說明與依項號之索引(2026-11-02 ws272c 拆為下列 4 檔,原約 49.4KB;ws286b 起第 57 項後另開第 5 檔) | `sgud/rule/rulebook_breaking.md` | 破壞性變更紀錄(索引) | 約 1.1 |
| 破壞性變更紀錄(第 1～38 項) | `sgud/rule/rulebook_breaking_20261021.md` | 破壞性變更紀錄 | 28.2 |
| 破壞性變更紀錄(第 39～44 項) | `sgud/rule/rulebook_breaking_39to44.md` | 破壞性變更紀錄 | 12.2 |
| 破壞性變更紀錄(第 45～51 項) | `sgud/rule/rulebook_breaking_45to51.md` | 破壞性變更紀錄 | 23.4 |
| 破壞性變更紀錄(第 52～56 項;第 52 項為 ws270、第 53 項為 ws272a、第 54 項為 ws272b、第 55 項為 ws272c、第 56 項為 ws271) | `sgud/rule/rulebook_breaking_52on.md` | 破壞性變更紀錄 | 23.9 |
| 破壞性變更紀錄(第 57 項起;第 57 項為 ws286a、第 58 項為 ws286b、第 59 項為 ws286c、第 60 項為 ws286d;新增之項附於此檔) | `sgud/rule/rulebook_breaking_57on.md` | 破壞性變更紀錄 | 14.0 |

## R-SCOPE-01 收錄判準:函數須符合其一才收進 wsemi(使用者 2026-11-01)

- **規則**:新增函數(或擴充既有函數之語意)須符合其一:①兩個以上自有套件實際共用(附使用端 `file:line` 全集);②基於本套件既有函數或家族之延伸(附延伸自何者,例:`fsWriteText` 加原子寫入、`execCli` 家族加結果走檔案之變體);③與領域無關之常見處理函數,且本套件無等價者(附 `Grep src/` 之查核).
- **不收**:單一套件專用者;帶領域語意者(AI、管線、抓取、資料庫、通知通道,歸 w-dispatch-ai、w-data-pipeline、w-fetch-web、w-orm-* 等);行程層政策與設定載入慣例(屬應用層);與既有函數重複者(改用既有).
- **處置**:收件(含主控轉交之建議)先判本條;不符者回覆理由與建議落點,不實作.已收而事後僅剩單一使用端者不主動移出,但不再擴充其語意.
- **why**:使用者:「否則就會變成一堆下游自有套件把函數往wsemi塞, 這樣wsemi就會變大雜燴」.跨套件全文見主控 `C:\opensrcOper\dspec\wsemi收錄原則.md`.
- **已收清單**(依本條判定後收錄者,附依據;新增時附於此):
  - 2026-11-01 wsemi41(Gitea #41,tai-kns-trade 自 srcRunner 抽提,主控裁定): ①`genClockTZ`(顯式時區時鐘;②延伸 `now2str` 家族＋①w-dispatch-ai 要求注入之 `stamp`／`getDate`、w-data-pipeline #39 `createLogger`;`createTime` 之預設時區 `'Asia/Taipei'` **不收**,屬專案群慣例)→ `rulebook_clock.md` R-CLOCK-01.②`execCliJsonFile`(結果走 JSON 檔之 CLI 執行;②`execCli` 家族之變體＋①w-knowledge-capture、tai-news-ai;逐行切分器 `_makeLineEmitter` 為**內部模組不匯出**,單一使用端)→ `rulebook_execfile.md` R-EXEC-JSONFILE-01.③`fsWriteTextAtomic`／`fsWriteTextAtomicCore`(原子寫檔;②延伸 `fsWriteText`＋①5 個使用端;**採信封式**,`fsWriteText` 不改)→ `rulebook_fs.md` R-FS-ATOMIC-01.④`execCliFailDetail`(`execCli` 結果之失敗摘要;②＋①三個自有套件使用)→ `rulebook_execfile.md`.**不收**(同案已裁): `readJson`／`writeJson`(與 `fsReadJson`／`fsWriteJson` 重複)、`queueAge`、`firstLineClamp`(單一套件專用).

各條目全標題:

- `破壞性變更紀錄` → `rulebook_breaking.md`(索引)、`rulebook_breaking_20261021.md`(第 1～38 項)、`rulebook_breaking_39to44.md`(第 39～44 項)、`rulebook_breaking_45to51.md`(第 45～51 項)、`rulebook_breaking_52on.md`(第 52～56 項)、`rulebook_breaking_57on.md`(第 57 項起): 破壞性變更紀錄(2026-10-16,第 39 項,主控 run01 複審裁示)
- `R-BIN-ENSURE-01` → `rulebook_bin.md`: R-BIN-ENSURE-01 外部執行檔之取得一律經 `fsEnsureBins`(清單校驗、快取→鏡像→GitHub、離線)
- `R-CLOCK-01` → `rulebook_clock.md`: R-CLOCK-01 需以指定時區取「現在」者一律經 `genClockTZ`:時間欄位取自 Intl、不隨系統時區、不改全域物件、無預設時區
- `R-CODEC-ERR-01` → `rulebook_exec.md`: R-CODEC-ERR-01 codec 之錯誤值轉換與失敗回報:只轉真 Error、catch 不外拋
- `R-DIAG-01` → `rulebook_diag.md`: R-DIAG-01 診斷輸出與遮罩一律經 wsemi 之共用函數(單一實作、預設不輸出資料值、對外錯誤值不含憑證、永不拋錯且有界、一份共用語料)
- `R-DL-VERIFY-01` → `rulebook_dl.md`: R-DL-VERIFY-01 下載執行檔或二進位資產一律經 `fsDownloadFileVerify` 驗證 SHA-256(與大小)
- `R-ENUM-01` → `rulebook_judge.md`(站點全集另見 `rulebook_judge_sites_inv_a.md`、`rulebook_judge_sites_inv_b.md`,索引見 `rulebook_judge_sites.md`): R-ENUM-01 計算類函數判定數字／整數參數一律經 `isenum`／`iseint`(判斷類、單一擁有者、`opt.use` 範圍表單一來源 `_numRange`、opt 無效必拋且不帶值)
- `R-ENUM-CALLERS-01` → `rulebook_judge.md`(已套／未套站點見 `rulebook_judge_sites_r1.md` 〈第 221 項第一批處置結果〉): R-ENUM-CALLERS-01 排程第 221 項第一批:24 個既有函數(三角 9、round/ceil/floor、dig 系、judge/preciseNum/estimateTicks/color、arrAdd/arrMulti/arrMax/arrMin)之數字／整數判定改經 `isenum`／`iseint`,失敗通道不變(null／''／throw),陣列計算非有效數字以預設值 0／1,arrMax/arrMin 無有效數字 throw
- `R-ENV-01` → `rulebook_data.md`: R-ENV-01 環境判斷函數(回布林)於非目標環境回 false、不拋錯
- `R-EXCEL-READ-01` → `rulebook_data.md`: R-EXCEL-READ-01 讀取Excel之值:提取原值轉字串
- `R-EXEC-FAIL-01` → `rulebook_exec.md`: R-EXEC-FAIL-01 執行外部程序之失敗回報:字串或結果物件、不含參數與環境變數之值、不崩潰
- `R-EXEC-JSONFILE-01` → `rulebook_execfile.md`: R-EXEC-JSONFILE-01 結果走 JSON 檔之 CLI 執行一律經 `execCliJsonFile`;失敗摘要經 `execCliFailDetail`:失敗以結構化物件回報、必須參數缺漏 reject、半行不黏連、相對輸出路徑與子進程一致
- `R-FILETYPE-01` → `rulebook_data.md`: R-FILETYPE-01 getFileType 副檔名對照表: 鍵為小寫副檔名、比對不分大小寫、新增項目附於表尾、既有項目逐項不變
- `R-FIND-01` → `rulebook_orm-find.md`: R-FIND-01 w-orm 系列條件(find)之形狀檢核: 單一擁有者 `cvOrmFind`、白名單、fail-closed、檢查之值即使用之值
- `R-FS-ATOMIC-01` → `rulebook_fs.md`: R-FS-ATOMIC-01 需「寫到一半中止不留半份」之文字檔寫入經 `fsWriteTextAtomic`:暫存檔加 rename、占用類錯誤重試、信封式回報、任何失敗路徑不留暫存檔
- `R-FS-EVEM-NAME-01` → `rulebook_fs.md`: R-FS-EVEM-NAME-01 fsEvem 之事件名稱即事件檔案檔名: 須為單一安全檔名,寫入不得離開事件資料夾,含 `.` 之名稱原樣送達
- `R-FS-REJECT-01` → `rulebook_fs.md`: R-FS-REJECT-01 fs 系回傳 Promise 者: 拒絕值一律為字串、不同步拋出、失敗不偽成功、不懸置、不殘留資源
- `R-FS-RESULT-01` → `rulebook_fs.md`: R-FS-RESULT-01 fs 結果物件之形狀與文件;逐項刪除不跟隨連結
- `R-KEYMAP-01` → `rulebook_obj.md`: R-KEYMAP-01 以呼叫端字串為鍵之長期內部表須用無原型物件
- `R-LOWER-01` → `rulebook_orm-lower.md`: R-LOWER-01 SQL 族後端共用之方言中立條件 IR: 單一擁有者 `lowerFind` / `lowerFindEq`、契約案例表 `_lowerFindCases`、IR 快照 `_lowerFindSnapshots`
- `R-OBJ-ITER-01` → `rulebook_obj.md`: R-OBJ-ITER-01 迭代使用端傳入之物件:只依自有可列舉字串鍵,`length` 鍵不得使走訪改成陣列樣
- `R-OPT-VAL-01` → `rulebook_optval.md`(已套／未套站點見 `rulebook_judge_sites_r1.md` 末節〈第 221 項第二批第一級發布 A 處置結果〉): R-OPT-VAL-01 opt 類數值參數遇非預期之輸入(含超出範圍)視為未給、改用預設(共用 `_optVal.mjs`、`opt.debug` 警告固定詞彙不含值),必須參數才報錯;廣義數字陣列 `opt.base` 與每陣列至少 1 個有效數字(尾端 `undefined`／`null` 視為未給 opt);`preciseNum` 整數路徑;`arrFilterByENum`;`setTimeoutHp`／`setIntervalHp` 之 `interval` 用 `positive` 不設上限;發布 A 只含下游 0 站點之函數,ws270(7 個)、ws272a(計時與流程類 19 個,判準:交給原生計時器者 `use:'timer'`、只與時間差比較者不設上限)、ws272b(字串、陣列、數值、編碼類 19 個;`bufWrite` 照 IEEE754 原樣編碼、成功回 `true`)與 ws272c(`_optNum` 退役〔6 個呼叫端 19 處,`inf:'keep'` 移除〕、DOM 類 9 個、`fsTask`、ws272b 回報後續 6 項;`Infinity` 一律非預期)續納入
- `R-ORMSTR-01` → `rulebook_orm-str.md`: R-ORMSTR-01 w-orm 系列字串良構: 單一擁有者 `chkOrmStr` / `chkOrmData`、契約案例表 `_cvOrmStrCases`、只因良構性拒收
- `R-PORT-PIDS-01` → `rulebook_port.md`: R-PORT-PIDS-01 查詢「誰在監聽某 TCP 埠」一律經 `execProcessPortPids`／`execProcessPortPidsSync`: 不依狀態欄、Windows 以 Get-NetTCPConnection 備援、失敗與無人嚴格分開
- `R-PRECISE-01` → `rulebook_judge.md`: R-PRECISE-01 `preciseNum` 以 decimal.js 之 12 位有效數字(`PRECISE_DIGITS`;使用者 2026-10-31 由 15 位改定)取代固定 `eps = 1e-9`(小數值不歸零;整數路徑不變〔**第 221 項第二批第一級發布 A 起整數路徑改為保留全部位數並正規化,見 R-OPT-VAL-01 規則 11**〕;`judge`、`estimateTicks` 隨之)
- `R-PM-SETTLE-01` → `rulebook_timer.md`: R-PM-SETTLE-01 以呼叫端函數或 Promise 之結果決定流程者:必定 settle、不產生未處理之 rejection/例外、佇列必定續行、失敗路徑必清理且可重試
- `R-TIMER-RELEASE-01` → `rulebook_timer.md`: R-TIMER-RELEASE-01 回傳事件物件且持有重複計時器者須可釋放
- `R-TRACE-01` → `rulebook_trace.md`: R-TRACE-01 計時器相關函數之觀察回調(opt.onTrace)與其測試: 以事件同步、斷言語意,不以延時偵測
- `R-UTF8-01` → `rulebook_data.md`: R-UTF8-01 字串與 Uint8Array 之 UTF-8 互轉:原生、失敗不失真
- `R-WRAPPER-01` → `rulebook_data.md`: R-WRAPPER-01 包裝物件(new String/Number/Boolean)之值判定
- `R-XSS-01` → `rulebook_xss.md`: R-XSS-01 js-xss 之取得與設定單一出處;偵測回報清洗會轉義或刪除之可疑項目
- `R-XSS-WALK-01` → `rulebook_xss.md`: R-XSS-WALK-01 clearXSS 之走訪: 顯式堆疊、來源物件只處理一次、複製後依終態清除、型別處置表
