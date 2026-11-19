# 規則帳本

本檔為套件設計與開發階段之規則帳本,為要求程式碼須長成什麼樣,或由規格產出之測試(項目/說明/流程)有哪些,包含軸、單一擁有者、已知限制、破壞性變更紀錄,以及對應是哪些測試檔案或指令等,由agent自行編列、擴充與維護.

## 索引(哪類查哪檔)

2026-10-28(wsemi-run08)依全域設定§14整理: 本檔原約 301.4KB,現依類型拆為下列各檔(同目錄);各節之節號與標題不變、內容逐字搬移,既有引用(如 `sgud/rule/rulebook.md R-FIND-01`)改至下表所列之檔查閱.新增條目時附於相近類型之檔,並同步更新本索引.

2026-10-29(wsemi-run10)再整理(各檔約 30KB 以上者): `rulebook_fs.md` 之 R-DL-VERIFY-01 移至 `rulebook_dl.md`、R-BIN-ENSURE-01 移至 `rulebook_bin.md`;`rulebook_timer.md` 之 R-TRACE-01 移至 `rulebook_trace.md`;`rulebook_breaking.md` 之第 1～38 項(2026-10-16 至 2026-10-21)抽至 `rulebook_breaking_20261021.md`(同一節標題、項號不變).節號與標題不變、內容逐字搬移.單節即逾 30KB 之 R-FIND-01、R-ORMSTR-01 與約 30KB 之 `rulebook_exec.md`(二節)未拆.

2026-11-02(ws272c)再整理(依全域設定 §14,各檔約 30KB 以上者): `rulebook_judge_sites.md`(原約 81.2KB)依類型拆為 `_inv_a`(§1~§5)、`_inv_b`(§6、§7、耦合摘要)、`_r1`(第一批、發布 A、ws270 處置結果)、`_r2`(ws272a、ws272b 處置結果)四檔,主檔只留標題、〈共通說明〉(風險代號)與索引;ws272c 起之處置結果節附於新檔 `_r2c`.`rulebook_breaking.md`(原約 49.4KB)依項號拆為 `rulebook_breaking_39to44.md`、`rulebook_breaking_45to51.md`、`rulebook_breaking_52on.md`(第 52 項起,新增之項附於此檔),主檔只留索引.節號與標題不變、內容逐字搬移(僅檔內指向兩檔特定節或項之引用同步改指新檔).

| 類 | 檔 | 條目 | 約 KB |
|---|---|---|---|
| 輸入無效之失敗訊息格式(V19,第 492 項第 9 批 ws492j,2026-11-19: `invalid <名稱>: must …`、不帶輸入值、描述詞彙表、轉交前綴為合規、fs 系參數名 `pah` 更正為 `fp`／`fd`)與共用可讀性探針 `chkReadable`(第 558 項:可讀回 `''`、不可讀回固定原因字串、永不拋錯、不呼叫存取器與 `toJSON`、讀取範圍與判斷函數同源) | `sgud/rule/rulebook_msg.md` | R-MSG-V19-01、R-READABLE-01 | 約 11 |
| 計時器、佇列與 Promise 流程(含第 492 項第 6 批 ws492g,2026-11-18: 計時與流程函數之函數參數三種處理、`importResources` 之 `pathItems` 檢測) | `sgud/rule/rulebook_timer.md` | R-TIMER-RELEASE-01、R-PM-SETTLE-01、R-PM-ARG-01 | 約 30 |
| 計時器相關函數之觀察回調 | `sgud/rule/rulebook_trace.md` | R-TRACE-01 | 24.6 |
| 安全相關 opt 為 K3 之例外(雜湊演算法、`fsEnsureBins`／`fsDownloadFileVerify` 之 offline、mirror、fetch、names 等)、fs 系錯誤訊息不回顯路徑／網址／輸入值、Node 原生錯誤固定詞彙加錯誤碼(第 492 項第 3 批 ws492d,2026-11-17) | `sgud/rule/rulebook_secopt.md` | R-HASH-TYPE-01、R-SEC-OPT-01、R-FS-ERRMSG-01、R-FS-MSG-V20-01 | 約 17 |
| DOM 與下載函數之輸入檢測:改畫面者同步拋固定訊息、查詢類回空、回 Promise 者 reject;opt 逐鍵檢測(`domAlert` 樣式字串 opt 與 `type`、`domScroll*`、`domFade*`);下載族同一通道;`color` 之 `amount`／`w1`／`w2` 與訊息不帶值(第 492 項第 4 批 ws492e,2026-11-18) | `sgud/rule/rulebook_domarg.md` | R-DOM-ARG-01、R-DOM-OPT-01、R-DL-ARG-01、R-COLOR-ARG-01 | 約 14 |
| 執行外部程序三函數之輸入檢測:`execProcess` 之 `prog`(三模式一致,exec 不再轉型)與 `args`、`opt.codeCmd` 依 K3、原生錯誤固定詞彙;`execProcessKillPid` 之 `pid` 須 1~2147483647 之整數(0、負數 fail-closed 先於殺程序);`execJsCode` 之 `fpJsCode` 與 `opt` 直通(第 492 項第 5 批 ws492f,2026-11-18) | `sgud/rule/rulebook_execarg.md` | R-EXEC-ARG-01 | 約 10 |
| 檔案系統(含 `fsWriteTextAtomic` 原子寫檔) | `sgud/rule/rulebook_fs.md` | R-FS-RESULT-01、R-FS-REJECT-01、R-FS-EVEM-NAME-01、R-FS-ATOMIC-01 | 約 28 |
| 顯式時區時鐘 `genClockTZ` | `sgud/rule/rulebook_clock.md` | R-CLOCK-01 | 約 6 |
| 結果走 JSON 檔之 CLI 執行 `execCliJsonFile` 與失敗摘要 `execCliFailDetail` | `sgud/rule/rulebook_execfile.md` | R-EXEC-JSONFILE-01 | 約 7 |
| 帶期望雜湊之下載 | `sgud/rule/rulebook_dl.md` | R-DL-VERIFY-01 | 23.2 |
| 外部執行檔取得 | `sgud/rule/rulebook_bin.md` | R-BIN-ENSURE-01 | 25.0 |
| 執行外部程序與編碼 | `sgud/rule/rulebook_exec.md` | R-EXEC-FAIL-01、R-CODEC-ERR-01 | 30.6 |
| XSS 偵測與清洗 | `sgud/rule/rulebook_xss.md` | R-XSS-01、R-XSS-WALK-01 | 19.7 |
| 物件迭代與鍵表 | `sgud/rule/rulebook_obj.md` | R-KEYMAP-01、R-OBJ-ITER-01 | 24.1 |
| 資料與型別判定、格式轉換 | `sgud/rule/rulebook_data.md` | R-EXCEL-READ-01、R-UTF8-01、R-ENV-01、R-WRAPPER-01(ws492i 起: 判斷函數只收原始值、轉型函數照舊拆包)、R-FILETYPE-01 | 約 26 |
| w-orm 系列條件(find)之形狀檢核 | `sgud/rule/rulebook_orm-find.md` | R-FIND-01 | 38.5 |
| w-orm 系列字串良構 | `sgud/rule/rulebook_orm-str.md` | R-ORMSTR-01 | 36.9 |
| SQL 族後端共用之方言中立條件 IR | `sgud/rule/rulebook_orm-lower.md` | R-LOWER-01 | 18.7 |
| 診斷輸出與遮罩(含規則 14 通報站點經 getDiag、規則 15 形狀摘要 getDiagShape;單節,未拆) | `sgud/rule/rulebook_diag.md` | R-DIAG-01 | 38.5 |
| 查詢埠之監聽者 | `sgud/rule/rulebook_port.md` | R-PORT-PIDS-01 | 16.0 |
| 字串取代之取代值須字面化: `replace`／`replaceAll` 站點全集(`$&`、`$'`、`` $` ``、`$$` 不得被展開;2026-11-12 ws427 wsrep 新增) | `sgud/rule/rulebook_replace.md` | R-REPLACE-LITERAL-01 | 約 8 |
| fs 路徑參數無效(非字串、空字串、含 NUL)之處置: 依失敗通道回報、不帶值、與不存在分開(第 216 項①) | `sgud/rule/rulebook_fspath.md` | R-FS-INVALID-PATH-01 | 約 8 |
| fs 系 Core 缺注入相依(fs、path、crypto、Readable、pipeline)依家族通道 fail-closed、對外函數注入鍵 undefined 取內建;`levelLimit` 之 `null` 取預設 1;路徑型 opt 鍵非預期取預設;N-A 之 fs 函數入口檢測(第 492 項第 2 批 ws492c,2026-11-17) | `sgud/rule/rulebook_fsdeps.md` | R-FS-DEPS-01、R-LEVEL-LIMIT-01、R-FS-OPT-PATH-01、R-FS-ENTRY-CHECK-01 | 約 12 |
| `fsWatchFolder` 被監看資料夾本身消失之 `unlinkDir` 一次消失只派發一次(第 238 項) | `sgud/rule/rulebook_watch.md` | R-WATCH-ROOT-ONCE-01 | 約 4 |
| 外部依賴跨主版號升級: chokidar 6、he 2 之使用處全集、新舊差分、`close()` 後不沿用、UMD 打包驗證(2026-11-09 ws01) | `sgud/rule/rulebook_deps.md` | R-DEP-MAJOR-01 | 約 7 |
| UMD 版 external(ua-parser-js、xss)晚載入須可用(第 258 項) | `sgud/rule/rulebook_umd.md` | R-UMD-EXTERNAL-01 | 約 4 |
| 測試檔結構: 測試檔互不 import、工具檔頂層不註冊 describe(第 254 項) | `sgud/rule/rulebook_test.md` | R-TEST-STRUCT-01 | 約 4 |
| 判斷函數不拋錯(惡意值集、`_tagOf`、`isfun` 不拋錯而移除 `_isFunSafe`)、C1／C2 之定義(`cbol` 依 B2、`isDate` 收嚴、`cint` JSDoc;第 492 項第 8 批 ws492i,2026-11-19);包裝物件之處理見 `rulebook_data.md` R-WRAPPER-01(同批改寫) | `sgud/rule/rulebook_judge_nothrow.md` | R-JUDGE-NOTHROW-01、R-C1C2-DEF-01 | 約 9 |
| 判斷類專用函數 `isenum`／`iseint`、`preciseNum` 精度,及既有函數改用第一批 | `sgud/rule/rulebook_judge.md` | R-ENUM-01、R-PRECISE-01、R-ENUM-CALLERS-01 | 約 24 |
| 判斷類專用函數之改用站點全集(排程第 221 項輸入;217 站點、符合 191)——主檔只留〈共通說明〉(風險代號)與本類之索引(2026-11-02 ws272c 拆為下列 5 檔,原約 81.2KB) | `sgud/rule/rulebook_judge_sites.md` | 標題、〈共通說明〉、索引 | 約 6.2 |
| 同上——§1~§5(計時毫秒、埠號、索引、個數、位元) | `sgud/rule/rulebook_judge_sites_inv_a.md` | R-ENUM-01 之站點全集(§1~§5) | 21.8 |
| 同上——§6 一般數值運算、§7 不符合、耦合與缺陷 | `sgud/rule/rulebook_judge_sites_inv_b.md` | R-ENUM-01 之站點全集(§6、§7、耦合摘要) | 18.4 |
| 同上——處置結果:第 221 項第一批、第二批第一級發布 A、已知缺陷先修(ws270,7 個函數) | `sgud/rule/rulebook_judge_sites_r1.md` | R-ENUM-CALLERS-01 之已套／未套、R-OPT-VAL-01 之已套／未套(發布 A)、ws270 處置結果 | 16.8 |
| 同上——處置結果:第 221 項第 2 輪 ws272a(計時與流程類 19 個函數)、ws272b(字串、陣列、數值、編碼類 19 個函數＋3 項缺陷) | `sgud/rule/rulebook_judge_sites_r2.md` | ws272a、ws272b 處置結果 | 22.2 |
| 同上——處置結果:第 221 項第 2 輪 ws272c(`_optNum` 退役、DOM 類、`fsTask`、ws272b 回報後續 6 項)、第 3 輪 ws271(`interp1`、`arrGroupByMaxmin`、`arrLookupByMaxmin`、`strTruncate`、`domFadeIn`);第 221 項 §11 第 6 項 ws286a(DOM 4 個函數與 3 個呼叫端)、ws286b(`getTimeRange`、`rep`、`replaceObj`、`replacePlus`、`sepInt`、`cfilesize`);此檔已逾 30KB,其後新增節另開 `rulebook_judge_sites_r2d.md` | `sgud/rule/rulebook_judge_sites_r2c.md` | ws272c、ws271、ws286a、ws286b 處置結果 | 33.8 |
| 同上——處置結果:第 221 項 §11 第 6 項 ws286c(差異比對子類 `strDiff`、`strDiffToHtml`、`arrDiff`、`matDiff`、`ltdtDiff` 與內部呼叫鏈逐站確認)、ws286d(空資料不是失敗:`arrAdd`／`arrMulti`／`arrAccum` 空進空出、`arrProduct` 任一邊為空即 throw、5 個轉換函數狀態模式、`getCsvStrFromData([])`;更正第 15 項「空陣列亦 throw」)、ws286e(陣列與結構子類 `arrFilterByENum`、`arrReverse`、`arrSep`、`matConcat`、`matat`、`ltdtpull` 必須參數無效即 throw、空資料照常);此檔 ws286e 後已逾 30KB,其後新增之處置結果節另開 `rulebook_judge_sites_r2e.md` | `sgud/rule/rulebook_judge_sites_r2d.md` | ws286c、ws286d、ws286e 處置結果 | 31.9 |
| 同上——處置結果:第 426 項 ws426(R-SYNC-INVALID-01,同步工具函數遇無效輸入之處置:C10 隨機範圍無效即 throw、C7 非數值結構運算之次參數無效回空值不回原值、C6 只補「失敗之辨識」文件;2026-11-12 新開);第 430 項 ws430(opt 數值改 `iseint` 14 站:`execCli` 4、`execCliJsonRpc` 1、`execCliSession` 4、`fsTreeFolderCore` 1、`isUserPw` 3、`dig` 1,逐站舊 → 新,R-OPT-VAL-01) | `sgud/rule/rulebook_judge_sites_r2e.md` | ws426、ws430 處置結果;第 492 項 ws492a(對外入口之數值參數以 `isenum` 判定、通過即 `cdbl` 轉型:`domIsClientXYIn` 無效回 `false`、`domGetBoudRectRefSelf`、`interp1` 之 stairs `xMin`／`xMax`,R-ENTRY-CONVERT-01,2026-11-16);第 492 項 ws492b(已裁定未落實:`objSortByKeys`、`treeToFilepath`、`arr2dt`,`pseudoRandomIntsNdpRange` 值域,JSDoc 文字修正,R-ENTRY-THROW-01、R-RANGE-VALUE-01,2026-11-16) | 約 33 |
| 開分頁類函數(`browserView` 系、`openLink`)與彈窗訊息 `domAlert`: 無效即同步拋錯且先於副作用、開不成即拋錯、Blob 網址延遲 60 秒釋放、協定與類型不設白名單而以文件載明責任;`domAlert` 之 D1～D7(2026-11-12 ws430 新增) | `sgud/rule/rulebook_browser.md` | R-BROWSER-OPEN-01、R-DOMALERT-01 | 約 8 |
| opt 類數值參數非預期之輸入改用預設(含超出範圍)、`opt.debug` 警告、廣義數字陣列之 `opt.base`、`preciseNum` 整數路徑、`arrFilterByENum`(第 221 項第二批第一級發布 A;ws270、ws272a、ws272b 起納入含 `Infinity` 邊界或有下游站點之函數) | `sgud/rule/rulebook_optval.md` | R-OPT-VAL-01 | 約 21 |
| 破壞性變更紀錄——主檔只留標題、說明與依項號之索引(2026-11-02 ws272c 拆為下列 4 檔,原約 49.4KB;ws286b 起第 57 項後另開第 5 檔) | `sgud/rule/rulebook_breaking.md` | 破壞性變更紀錄(索引) | 約 1.1 |
| 破壞性變更紀錄(第 1～38 項) | `sgud/rule/rulebook_breaking_20261021.md` | 破壞性變更紀錄 | 28.2 |
| 破壞性變更紀錄(第 39～44 項) | `sgud/rule/rulebook_breaking_39to44.md` | 破壞性變更紀錄 | 12.2 |
| 破壞性變更紀錄(第 45～51 項) | `sgud/rule/rulebook_breaking_45to51.md` | 破壞性變更紀錄 | 23.4 |
| 破壞性變更紀錄(第 52～56 項;第 52 項為 ws270、第 53 項為 ws272a、第 54 項為 ws272b、第 55 項為 ws272c、第 56 項為 ws271) | `sgud/rule/rulebook_breaking_52on.md` | 破壞性變更紀錄 | 23.9 |
| 破壞性變更紀錄(第 57～64 項;第 57 項為 ws286a、第 58 項為 ws286b、第 59 項為 ws286c、第 60 項為 ws286d、第 61 項為 ws286e、第 62 項為 ws290、第 63 項為 ws426、第 64 項為 ws427;第 64 項後封存) | `sgud/rule/rulebook_breaking_57on.md` | 破壞性變更紀錄 | 約 26 |
| 破壞性變更紀錄(第 65 項起;第 65 項為 ws430、第 66 項為 ws430b、第 67 項為 ws430c、第 68 項為 ws492a、第 69 項為 ws492b;新增之項附於此檔) | `sgud/rule/rulebook_breaking_65on.md` | 破壞性變更紀錄 | 約 15 |
| 結構函數之元素層級與自有鍵: 參數層回空結果、元素層依用途拋錯或佔位、鍵只看自有可列舉字串鍵、欄位名正規化、函數值視為 null、長度不符之 `opt.debug` 提示(排程第 430 項第二批 14 個函數;2026-11-14 ws430b 新增) | `sgud/rule/rulebook_elem.md` | R-ELEM-LEVEL-01 | 約 10 |
| 結構函數第三批: 列之訊息指出 row[i]、單一空元素不當空陣列、中性可設定之預設值(`opt.empty`／`opt.emptyHead`)、範圍參數;儲存格文字表示法單一擁有者 `_cellText`;差異比對之 modify 配對單一擁有者 `_diffPair`(arrDiff 逐格比對);帶時區時刻依其時區驗證(排程第 430 項第三批 14 個函數;2026-11-15 ws430c 新增) | `sgud/rule/rulebook_elem_b3.md` | R-ELEM-LEVEL-02、R-CELL-TEXT-01、R-DIFF-PAIR-01、R-TZ-WALL-01 | 約 12 |
| 結構運算與參數定義(排程第 492 項第 7 批 ws492h,2026-11-19): C7 第 1 參數型別不對回輸出型別之空結果、單一空元素視為一個元素(18 函數)、`arrSep` 只收設定物件、範圍型 opt 超出範圍改預設與帶預設值之位置參數視同 opt(N-B 19 列處置表)、W-06 簽名／JSDoc／行為一致 | `sgud/rule/rulebook_struct7.md` | R-STRUCT-ARG1-01、R-ELEM-LEVEL-03、R-ARRSEP-OBJ-01、R-OPT-RANGE-01 | 約 12 |

## R-SCOPE-01 收錄判準:函數須符合其一才收進 wsemi(使用者 2026-11-01)

- **規則**:新增函數(或擴充既有函數之語意)須符合其一:①兩個以上自有套件實際共用(附使用端 `file:line` 全集);②基於本套件既有函數或家族之延伸(附延伸自何者,例:`fsWriteText` 加原子寫入、`execCli` 家族加結果走檔案之變體);③與領域無關之常見處理函數,且本套件無等價者(附 `Grep src/` 之查核).
- **不收**:單一套件專用者;帶領域語意者(AI、管線、抓取、資料庫、通知通道,歸 w-dispatch-ai、w-data-pipeline、w-fetch-web、w-orm-* 等);行程層政策與設定載入慣例(屬應用層);與既有函數重複者(改用既有).
- **處置**:收件(含主控轉交之建議)先判本條;不符者回覆理由與建議落點,不實作.已收而事後僅剩單一使用端者不主動移出,但不再擴充其語意.
- **why**:使用者:「否則就會變成一堆下游自有套件把函數往wsemi塞, 這樣wsemi就會變大雜燴」.跨套件全文見主控 `C:\opensrcOper\dspec\wsemi收錄原則.md`.
- **已收清單**(依本條判定後收錄者,附依據;新增時附於此):
  - 2026-11-01 wsemi41(Gitea #41,使用端自執行殼抽提,主控裁定): ①`genClockTZ`(顯式時區時鐘;②延伸 `now2str` 家族＋①w-dispatch-ai 要求注入之 `stamp`／`getDate`、w-data-pipeline #39 `createLogger`;`createTime` 之預設時區 `'Asia/Taipei'` **不收**,屬專案群慣例)→ `rulebook_clock.md` R-CLOCK-01.②`execCliJsonFile`(結果走 JSON 檔之 CLI 執行;②`execCli` 家族之變體＋①w-knowledge-capture、使用端;逐行切分器 `_makeLineEmitter` 為**內部模組不匯出**,單一使用端)→ `rulebook_execfile.md` R-EXEC-JSONFILE-01.③`fsWriteTextAtomic`／`fsWriteTextAtomicCore`(原子寫檔;②延伸 `fsWriteText`＋①5 個使用端;**採信封式**,`fsWriteText` 不改)→ `rulebook_fs.md` R-FS-ATOMIC-01.④`execCliFailDetail`(`execCli` 結果之失敗摘要;②＋①三個自有套件使用)→ `rulebook_execfile.md`.**不收**(同案已裁): `readJson`／`writeJson`(與 `fsReadJson`／`fsWriteJson` 重複)、`queueAge`、`firstLineClamp`(單一套件專用).

各條目全標題:

- `破壞性變更紀錄` → `rulebook_breaking.md`(索引)、`rulebook_breaking_20261021.md`(第 1～38 項)、`rulebook_breaking_39to44.md`(第 39～44 項)、`rulebook_breaking_45to51.md`(第 45～51 項)、`rulebook_breaking_52on.md`(第 52～56 項)、`rulebook_breaking_57on.md`(第 57 項起): 破壞性變更紀錄(2026-10-16,第 39 項,主控 run01 複審裁示)
- `R-BIN-ENSURE-01` → `rulebook_bin.md`: R-BIN-ENSURE-01 外部執行檔之取得一律經 `fsEnsureBins`(清單校驗、快取→鏡像→GitHub、離線)
- `R-BROWSER-OPEN-01` → `rulebook_browser.md`: R-BROWSER-OPEN-01 開分頁類函數(`browserView` 系、`openLink`):無效即同步拋錯且先於副作用、開不成即拋錯、Blob 網址延遲釋放、協定與類型不設白名單而以文件載明責任
- `R-DOMALERT-01` → `rulebook_browser.md`: R-DOMALERT-01 `domAlert` 之輸入、關閉與事件綁定(D1～D7)
- `R-CLOCK-01` → `rulebook_clock.md`: R-CLOCK-01 需以指定時區取「現在」者一律經 `genClockTZ`:時間欄位取自 Intl、不隨系統時區、不改全域物件、無預設時區
- `R-CODEC-ERR-01` → `rulebook_exec.md`: R-CODEC-ERR-01 codec 之錯誤值轉換與失敗回報:只轉真 Error、catch 不外拋
- `R-DIAG-01` → `rulebook_diag.md`: R-DIAG-01 診斷輸出與遮罩一律經 wsemi 之共用函數(單一實作、預設不輸出資料值、對外錯誤值不含憑證、永不拋錯且有界、一份共用語料)
- `R-DEP-MAJOR-01` → `rulebook_deps.md`: R-DEP-MAJOR-01 外部依賴跨主版號升級: 使用處全集、新舊差分、`close()` 後不沿用(每次新建 watcher)、he 具名匯入、UMD 打包驗證
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
- `R-ELEM-LEVEL-01` → `rulebook_elem.md`: R-ELEM-LEVEL-01 結構函數:參數層回空結果、元素層依用途拋錯或佔位、鍵只看自有可列舉字串鍵(`__proto__` 經 `_setOwnKey`)、欄位名經 `_normKey`、函數值視為 null、長度不符之 `opt.debug` 提示(排程第 430 項第二批 14 個函數,ws430b)
- `R-ELEM-LEVEL-02` → `rulebook_elem_b3.md`: R-ELEM-LEVEL-02 結構函數第三批:列之訊息指出位置、單一空元素不當空陣列、欄位鍵經 `_normKey.field`、只讀自有可列舉同名欄位、中性可設定之預設值(`_cellText.readFill`)、函數值視為 null、長度不符之 `opt.debug`、範圍參數(排程第 430 項第三批 14 個函數,ws430c)
- `R-CELL-TEXT-01` → `rulebook_elem_b3.md`: R-CELL-TEXT-01 儲存格之文字表示法單一擁有者 `_cellText`(`ltdtkeys2mat` 與 `arrDiff` 共用;鍵排序後之 JSON `stableStringify` 與 `ltdtDiffByKey` 共用)
- `R-DIFF-PAIR-01` → `rulebook_elem_b3.md`: R-DIFF-PAIR-01 差異比對之「先刪後增配對為 modify」單一擁有者 `_diffPair`(`strDiff` 與 `arrDiff` 共用;arrDiff 以 diffArrays 逐元素、逐列再逐格)
- `R-TZ-WALL-01` → `rulebook_elem_b3.md`: R-TZ-WALL-01 帶時區之時刻依其時區之固定偏移逐欄驗證(`istimeTZ`、`istimemsTZ`;`_tz.isWallTime`),不經本機時間往返比對
- `R-ENTRY-CONVERT-01` → `rulebook_judge_sites_r2e.md`(〈第 492 項 ws492a 處置結果〉): R-ENTRY-CONVERT-01 對外入口之數值參數(必須參數或 opt 鍵)以 `isenum`(整數 `iseint`)判定,通過即 `cdbl`(`cint`)轉型後使用、取值只讀一次;內部已必為數值者(瀏覽器事件屬性、已轉型之值、依型別分流)可用 lodash／原生判斷不改;回布林者無效回 `false`,opt 無效視為未給,訊息不帶值(使用者 2026-11-16;`domIsClientXYIn`、`domGetBoudRectRefSelf`、`interp1` stairs 之 `xMin`／`xMax`)
- `R-ENTRY-THROW-01` → `rulebook_judge_sites_r2e.md`(〈第 492 項 ws492b 處置結果〉): R-ENTRY-THROW-01 必須參數為陣列或物件者無效即同步拋 `invalid <名稱>: must be <種類>`(不帶值,元素帶索引),空陣列／空物件合法;真陣列以 `Array.isArray` 判定(R-OBJ-ITER-01 規則 2);opt 非一般物件視為未給、布林鍵只有 `true` 生效;鍵只看自有可列舉字串鍵(使用者 2026-11-03「都A」;`objSortByKeys`、`treeToFilepath`)
- `R-RANGE-VALUE-01` → `rulebook_judge_sites_r2e.md`(〈第 492 項 ws492b 處置結果〉): R-RANGE-VALUE-01 回傳「範圍內之值」之函數,值域須為 `[vstart, vend]`;`pseudoRandomIntsNdpRange` 排序用之值不含 `vstart`,取 `n` 個後加 `vstart`(`vstart=0` 時與修前逐位相同)
- `R-FS-DEPS-01` → `rulebook_fsdeps.md`: R-FS-DEPS-01 fs 系 Core 缺注入相依(fs、path、crypto、Readable、pipeline)依家族通道 fail-closed(不回成功、不動檔案、訊息 `invalid opt.<名>: must be …` 不帶值,單一擁有者 `_chkFsDeps`),判斷類 Core 同步拋錯不回 false;對外函數(`fsDeleteFileSafe`、`fsDeleteFolderSafe`、`fsDownloadFileVerify`,第 492 項第 3 批另加 12 個: `fsEnsureBins`、`fsCreateFile`、`fsCopyFile`、`fsCopyFolder`、`fsMergeFiles`、`fsGetFileHash`、`fsGetFileBasicHash`、`fsGetFileXxHash`、`fsGetFolderBasicHash`、`fsGetFilesWithHashInFolder`、`fsTreeFolderWithHash`、`fsSyncFolder`,單一擁有者 `_mergeInject`)注入鍵 undefined 取 Node 內建
- `R-LEVEL-LIMIT-01` → `rulebook_fsdeps.md`: R-LEVEL-LIMIT-01 `levelLimit` 之 `null` 依 K3 取預設 1(fs 列舉家族 10 函數與 `fsTask`),無窮遍歷給 `4294967295`
- `R-FS-OPT-PATH-01` → `rulebook_fsdeps.md`: R-FS-OPT-PATH-01 路徑型 opt 鍵(`fsSrlog.fdLog`、`fsTask.fdStorage`、`fsEvem.fd`)非字串、空字串、含 NUL 取預設;`fsTask` 紀錄資料夾無法使用即建構時拋錯
- `R-FS-ENTRY-CHECK-01` → `rulebook_fsdeps.md`: R-FS-ENTRY-CHECK-01 N-A 之 fs 函數入口檢測先於副作用(`fsCreateFileCore` data、`fsWriteText(Core)` c、`fsDownloadFileCore` urlIn/fpOut、`fsEnsureBins` manifest 路徑與 pkgRoot、`fsGetBinManifestEntry` fp、判斷類非字串路徑回 false)
- `R-HASH-TYPE-01` → `rulebook_secopt.md`: R-HASH-TYPE-01 雜湊演算法 `opt.type`／`opt.typeHash` 為安全相關 opt,給了而無效即拒絕(不改用預設;`crypto.getHashes()` 成員、`xxhash64` 依路徑,不經物件鍵查找),入口先於任何 IO,同一函數所有路徑一致;單一擁有者 `_chkHashType`(第 492 項第 3 批 ws492d)
- `R-SEC-OPT-01` → `rulebook_secopt.md`: R-SEC-OPT-01 `fsEnsureBins(Core)`／`fsDownloadFileVerify(Core)` 之安全相關 opt(offline、mirror、fetch、names、floatingManifestUrl、期望值、包裝物件)給了而無效即 E_ARG,`names: []` 合法,非安全 opt(cacheDir、onProgress、布林旗標)依 K3 取預設
- `R-FS-ERRMSG-01` → `rulebook_secopt.md`: R-FS-ERRMSG-01 Node 原生錯誤(帶 code 之真 Error,不含 `E_` 起頭者)一律改固定詞彙加錯誤碼 `operation failed (code X)`,各通道(結果物件新建 Error、字串 reject、同步拋出、cause);單一擁有者 `_fsErrMsg`
- `R-FS-MSG-V20-01` → `rulebook_secopt.md`: R-FS-MSG-V20-01 fs 系錯誤訊息、console、reject 不回顯路徑、網址、輸入值(V19 `invalid <名>: must be <種類>`);成功訊息不變;結構欄位(url、fp、expected、actual、leftovers、missing)保留
- `R-DOM-ARG-01` → `rulebook_domarg.md`: R-DOM-ARG-01 DOM 函數輸入檢測通則:改畫面、觸發事件、掛載監聽者者同步拋固定訊息(V19、不帶值、先於任何改動);查詢類回 `false`／`null`／`[]`;回 Promise 者 reject 固定字串;數值檢測通過即轉型;站點全集 19 函數(第 492 項第 4 批 ws492e)
- `R-DOM-OPT-01` → `rulebook_domarg.md`: R-DOM-OPT-01 opt 逐鍵檢測:`domAlert` 四個樣式字串 opt(只認原始字串、空字串合法)與 `type`(自有鍵)、`domScrollIntoView`／`domScrollTo`(列舉與數值鍵、不直通未知鍵、單一擁有者 `_scrollOpt`)、`domFadeIn`／`domFadeOut` 之 `delay`／`opacityIni`(不夾限)
- `R-DL-ARG-01` → `rulebook_domarg.md`: R-DL-ARG-01 下載族(`downloadFileFromB64`／`Blob`／`Text`／`U8Arr`)同一通道,輸入無效同步拋固定訊息,先於環境檢查;`withBOM` 非布林取預設;`downloadExcelFileFromData` 走 `{ error }` 通道、含 NUL 之檔名與寫檔失敗固定詞彙
- `R-COLOR-ARG-01` → `rulebook_domarg.md`: R-COLOR-ARG-01 `color` 之 `amount`／`w1`／`w2` 須為 0~1 之有效數字(單一擁有者 `toRatio`)、顏色無效之訊息與 console 不回顯輸入、`num`／`fmtOutput` 訊息 V19、`interp` 內部權重不檢測
- `R-EXEC-ARG-01` → `rulebook_execarg.md`: R-EXEC-ARG-01 外部程序三函數之輸入檢測:`execProcess.prog` 非空原始字串且不含 NUL(三模式一致,exec 不再把非字串轉成指令)、`args` 元素為字串或有限數字、先於任何子程序之建立(含 chcp);`opt.codeCmd` 不支援依 K3 取預設;`execProcessKillPid.pid` 須 1~2147483647 之整數(0、負數、環繞值先於殺程序拒絕);`execJsCode.fpJsCode` 固定訊息與「不存在」分開、`opt` 整份直通;驗法為子行程攔截替身(`test/tools/execArgGuardRunner.mjs`,第 492 項第 5 批 ws492f)
- `R-EXEC-FAIL-01` 規則 15 → `rulebook_exec.md`: `execProcess` 無法啟動子進程之原生錯誤(帶錯誤碼)改固定詞彙 `spawn[ENOENT]:\noperation failed (code ENOENT)`(`execSpawnError` 之 `opt.fixed`;`execCli` 系不傳,行為不變)
- `R-STRUCT-ARG1-01` → `rulebook_struct7.md`: R-STRUCT-ARG1-01 C7 結構運算之第 1 參數型別不對,一律回輸出型別之空結果、不拋錯,且先於次參數檢測(次參數與元素層依各函數既有裁定仍拋;`arrDiff`／`arrFilterByENum`／`arrReverse`／`arrSep`／`ltdtDiff`／`ltdtpull`／`matConcat`／`matDiff`／`matat`／`objSortByKeys`／`treeToFilepath`;ws492h)
- `R-ELEM-LEVEL-03` → `rulebook_struct7.md`: R-ELEM-LEVEL-03 單一空元素之陣列(`[null]`、`['']`、`[{}]` 等)視為一個元素,參數層一律 `isarr`＋長度,不得以 `isearr` 當空陣列(18 函數之逐函數處置;ws492h)
- `R-ARRSEP-OBJ-01` → `rulebook_struct7.md`: R-ARRSEP-OBJ-01 `arrSep` 之 `opt` 只收設定物件,舊式整數寫法移除,`numCount`／`numGroup` 二擇一必給(ws492h)
- `R-OPT-RANGE-01` → `rulebook_struct7.md`: R-OPT-RANGE-01 範圍型 opt 超出範圍改預設(`domDrag.timeDragStartDelay`、`domConvertToPic.scale`、`color.spread*` 之 `num`)、帶預設值之位置參數視同 opt、N-B 19 列處置表、W-06 判定原則之落實(ws492h)
- `R-FS-RESULT-01` → `rulebook_fs.md`: R-FS-RESULT-01 fs 結果物件之形狀與文件;逐項刪除不跟隨連結
- `R-KEYMAP-01` → `rulebook_obj.md`: R-KEYMAP-01 以呼叫端字串為鍵之長期內部表須用無原型物件
- `R-LOWER-01` → `rulebook_orm-lower.md`: R-LOWER-01 SQL 族後端共用之方言中立條件 IR: 單一擁有者 `lowerFind` / `lowerFindEq`、契約案例表 `_lowerFindCases`、IR 快照 `_lowerFindSnapshots`
- `R-OBJ-ITER-01` → `rulebook_obj.md`: R-OBJ-ITER-01 迭代使用端傳入之物件:只依自有可列舉字串鍵,`length` 鍵不得使走訪改成陣列樣
- `R-OPT-VAL-01` → `rulebook_optval.md`(已套／未套站點見 `rulebook_judge_sites_r1.md` 末節〈第 221 項第二批第一級發布 A 處置結果〉): R-OPT-VAL-01 opt 類數值參數遇非預期之輸入(含超出範圍)視為未給、改用預設(共用 `_optVal.mjs`、`opt.debug` 警告固定詞彙不含值),必須參數才報錯;廣義數字陣列 `opt.base` 與每陣列至少 1 個有效數字(尾端 `undefined`／`null` 視為未給 opt);`preciseNum` 整數路徑;`arrFilterByENum`;`setTimeoutHp`／`setIntervalHp` 之 `interval` 用 `positive` 不設上限;發布 A 只含下游 0 站點之函數,ws270(7 個)、ws272a(計時與流程類 19 個,判準:交給原生計時器者 `use:'timer'`、只與時間差比較者不設上限)、ws272b(字串、陣列、數值、編碼類 19 個;`bufWrite` 照 IEEE754 原樣編碼、成功回 `true`)與 ws272c(`_optNum` 退役〔6 個呼叫端 19 處,`inf:'keep'` 移除〕、DOM 類 9 個、`fsTask`、ws272b 回報後續 6 項;`Infinity` 一律非預期)續納入
- `R-ORMSTR-01` → `rulebook_orm-str.md`: R-ORMSTR-01 w-orm 系列字串良構: 單一擁有者 `chkOrmStr` / `chkOrmData`、契約案例表 `_cvOrmStrCases`、只因良構性拒收
- `R-PORT-PIDS-01` → `rulebook_port.md`: R-PORT-PIDS-01 查詢「誰在監聽某 TCP 埠」一律經 `execProcessPortPids`／`execProcessPortPidsSync`: 不依狀態欄、Windows 以 PowerShell 呼叫 OS API(GetExtendedTcpTable)確認而 Get-NetTCPConnection 為退回、失敗與無人嚴格分開
- `R-PRECISE-01` → `rulebook_judge.md`: R-PRECISE-01 `preciseNum` 以 decimal.js 之 12 位有效數字(`PRECISE_DIGITS`;使用者 2026-10-31 由 15 位改定)取代固定 `eps = 1e-9`(小數值不歸零;整數路徑不變〔**第 221 項第二批第一級發布 A 起整數路徑改為保留全部位數並正規化,見 R-OPT-VAL-01 規則 11**〕;`judge`、`estimateTicks` 隨之)
- `R-PM-ARG-01` → `rulebook_timer.md`: R-PM-ARG-01 計時與流程函數之函數參數檢測(dspec §11 W-15「甲」): ①建立或立即啟動者(`setTimeoutHp`、`setIntervalHp`、`cacheBd`、`pmHook`、`pmHookReject`)之 `fun` 無效同步拋固定訊息、先於任何副作用;②執行期提交之任務(`pmQueue`、`pmThrottle`、`pmKeyMutex`)reject 固定字串、不同步拋錯、`pmKeyMutex` 不排隊、`pmThrottle` 於執行點再驗(通過檢測後才撤銷者同以固定字串 reject、佇列續行);③清單元素(`pmChain`、`pmMap`、`pmSeries`)視為未給;函數判定經內部 `_isFunSafe`(已撤銷 Proxy 視為非函數;`pmChain` 同族一致);`importResources.pathItems` 進入時驗證並複製、無效 reject 固定字串(V19,`type` 明示優先於副檔名、只有未給／`null`／`''` 視為未給)、不改寫呼叫端輸入、載入事件內之 `func` 判定經 `isFunSafe`(第 492 項第 6 批 ws492g 與修正輪 ws492g2)
- `R-PM-SETTLE-01` → `rulebook_timer.md`: R-PM-SETTLE-01 以呼叫端函數或 Promise 之結果決定流程者:必定 settle、不產生未處理之 rejection/例外、佇列必定續行、失敗路徑必清理且可重試
- `R-REPLACE-LITERAL-01` → `rulebook_replace.md`: R-REPLACE-LITERAL-01 字串取代之取代值須字面化: `replace`／`replaceAll` 之取代值(第 2 引數)為函式、不含 `$` 之字面值,或刻意之 `$` 樣式(正規式捕獲群、`$&`);`replace(c, t, r)` 之 `r` 為字面文字,`replaceObj` 不再預先逸出 `$`
- `R-TIMER-RELEASE-01` → `rulebook_timer.md`: R-TIMER-RELEASE-01 回傳事件物件且持有重複計時器者須可釋放
- `R-TRACE-01` → `rulebook_trace.md`: R-TRACE-01 計時器相關函數之觀察回調(opt.onTrace)與其測試: 以事件同步、斷言語意,不以延時偵測
- `R-UTF8-01` → `rulebook_data.md`: R-UTF8-01 字串與 Uint8Array 之 UTF-8 互轉:原生、失敗不失真
- `R-WRAPPER-01` → `rulebook_data.md`: R-WRAPPER-01 包裝物件(new String/Number/Boolean)之處理: 判斷函數只收原始值(包裝物件為 false)、轉型函數(cdbl/cint/cstr/cbol)照舊拆包、直接判型之入口依同原則(2026-11-19 ws492i 改寫,取代 A-lite)
- `R-JUDGE-NOTHROW-01` → `rulebook_judge_nothrow.md`: R-JUDGE-NOTHROW-01 判斷函數(`is*`)對任何輸入皆不拋錯(型別無法判定回 false、內容檢查拋錯回 false);內部 `_isFunSafe` 已移除(ws492i)
- `R-C1C2-DEF-01` → `rulebook_judge_nothrow.md`: R-C1C2-DEF-01 C1／C2 之定義: `cbol` 依 B2、`isDate` 收嚴、`cint` 行為不改而 JSDoc 寫明失真(ws492i)
- `R-XSS-01` → `rulebook_xss.md`: R-XSS-01 js-xss 之取得與設定單一出處;偵測回報清洗會轉義或刪除之可疑項目
- `R-XSS-WALK-01` → `rulebook_xss.md`: R-XSS-WALK-01 clearXSS 之走訪: 顯式堆疊、來源物件只處理一次、複製後依終態清除、型別處置表
