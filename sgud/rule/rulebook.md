# 規則帳本

本檔為套件設計與開發階段之規則帳本,為要求程式碼須長成什麼樣,或由規格產出之測試(項目/說明/流程)有哪些,包含軸、單一擁有者、已知限制、破壞性變更紀錄,以及對應是哪些測試檔案或指令等,由agent自行編列、擴充與維護.

## 索引(哪類查哪檔)

2026-10-28(wsemi-run08)依全域設定§14整理: 本檔原約 301.4KB,現依類型拆為下列各檔(同目錄);各節之節號與標題不變、內容逐字搬移,既有引用(如 `sgud/rule/rulebook.md R-FIND-01`)改至下表所列之檔查閱.新增條目時附於相近類型之檔,並同步更新本索引.

2026-10-29(wsemi-run10)再整理(各檔約 30KB 以上者): `rulebook_fs.md` 之 R-DL-VERIFY-01 移至 `rulebook_dl.md`、R-BIN-ENSURE-01 移至 `rulebook_bin.md`;`rulebook_timer.md` 之 R-TRACE-01 移至 `rulebook_trace.md`;`rulebook_breaking.md` 之第 1～38 項(2026-10-16 至 2026-10-21)抽至 `rulebook_breaking_20261021.md`(同一節標題、項號不變),新增之破壞性變更仍附於 `rulebook_breaking.md`.節號與標題不變、內容逐字搬移.單節即逾 30KB 之 R-FIND-01、R-ORMSTR-01 與約 30KB 之 `rulebook_exec.md`(二節)未拆.

| 類 | 檔 | 條目 | 約 KB |
|---|---|---|---|
| 計時器、佇列與 Promise 流程 | `sgud/rule/rulebook_timer.md` | R-TIMER-RELEASE-01、R-PM-SETTLE-01 | 20.9 |
| 計時器相關函數之觀察回調 | `sgud/rule/rulebook_trace.md` | R-TRACE-01 | 24.6 |
| 檔案系統 | `sgud/rule/rulebook_fs.md` | R-FS-RESULT-01、R-FS-REJECT-01、R-FS-EVEM-NAME-01 | 21.8 |
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
| 判斷類專用函數 `isenum`／`iseint` 與 `preciseNum` 精度 | `sgud/rule/rulebook_judge.md` | R-ENUM-01、R-PRECISE-01 | 約 14 |
| 判斷類專用函數之改用站點全集(排程第 221 項輸入;217 站點、符合 191) | `sgud/rule/rulebook_judge_sites.md` | R-ENUM-01 之站點全集 | 43.1 |
| 破壞性變更紀錄(第 39 項起) | `sgud/rule/rulebook_breaking.md` | 破壞性變更紀錄 | 約 22 |
| 破壞性變更紀錄(第 1～38 項) | `sgud/rule/rulebook_breaking_20261021.md` | 破壞性變更紀錄 | 28.2 |

各條目全標題:

- `破壞性變更紀錄` → `rulebook_breaking.md`(第 39 項起)、`rulebook_breaking_20261021.md`(第 1～38 項): 破壞性變更紀錄(2026-10-16,第 39 項,主控 run01 複審裁示)
- `R-BIN-ENSURE-01` → `rulebook_bin.md`: R-BIN-ENSURE-01 外部執行檔之取得一律經 `fsEnsureBins`(清單校驗、快取→鏡像→GitHub、離線)
- `R-CODEC-ERR-01` → `rulebook_exec.md`: R-CODEC-ERR-01 codec 之錯誤值轉換與失敗回報:只轉真 Error、catch 不外拋
- `R-DIAG-01` → `rulebook_diag.md`: R-DIAG-01 診斷輸出與遮罩一律經 wsemi 之共用函數(單一實作、預設不輸出資料值、對外錯誤值不含憑證、永不拋錯且有界、一份共用語料)
- `R-DL-VERIFY-01` → `rulebook_dl.md`: R-DL-VERIFY-01 下載執行檔或二進位資產一律經 `fsDownloadFileVerify` 驗證 SHA-256(與大小)
- `R-ENUM-01` → `rulebook_judge.md`(站點全集另見 `rulebook_judge_sites.md`): R-ENUM-01 計算類函數判定數字／整數參數一律經 `isenum`／`iseint`(判斷類、單一擁有者、`opt.use` 範圍表單一來源 `_numRange`、opt 無效必拋且不帶值)
- `R-ENV-01` → `rulebook_data.md`: R-ENV-01 環境判斷函數(回布林)於非目標環境回 false、不拋錯
- `R-EXCEL-READ-01` → `rulebook_data.md`: R-EXCEL-READ-01 讀取Excel之值:提取原值轉字串
- `R-EXEC-FAIL-01` → `rulebook_exec.md`: R-EXEC-FAIL-01 執行外部程序之失敗回報:字串或結果物件、不含參數與環境變數之值、不崩潰
- `R-FILETYPE-01` → `rulebook_data.md`: R-FILETYPE-01 getFileType 副檔名對照表: 鍵為小寫副檔名、比對不分大小寫、新增項目附於表尾、既有項目逐項不變
- `R-FIND-01` → `rulebook_orm-find.md`: R-FIND-01 w-orm 系列條件(find)之形狀檢核: 單一擁有者 `cvOrmFind`、白名單、fail-closed、檢查之值即使用之值
- `R-FS-EVEM-NAME-01` → `rulebook_fs.md`: R-FS-EVEM-NAME-01 fsEvem 之事件名稱即事件檔案檔名: 須為單一安全檔名,寫入不得離開事件資料夾,含 `.` 之名稱原樣送達
- `R-FS-REJECT-01` → `rulebook_fs.md`: R-FS-REJECT-01 fs 系回傳 Promise 者: 拒絕值一律為字串、不同步拋出、失敗不偽成功、不懸置、不殘留資源
- `R-FS-RESULT-01` → `rulebook_fs.md`: R-FS-RESULT-01 fs 結果物件之形狀與文件;逐項刪除不跟隨連結
- `R-KEYMAP-01` → `rulebook_obj.md`: R-KEYMAP-01 以呼叫端字串為鍵之長期內部表須用無原型物件
- `R-LOWER-01` → `rulebook_orm-lower.md`: R-LOWER-01 SQL 族後端共用之方言中立條件 IR: 單一擁有者 `lowerFind` / `lowerFindEq`、契約案例表 `_lowerFindCases`、IR 快照 `_lowerFindSnapshots`
- `R-OBJ-ITER-01` → `rulebook_obj.md`: R-OBJ-ITER-01 迭代使用端傳入之物件:只依自有可列舉字串鍵,`length` 鍵不得使走訪改成陣列樣
- `R-ORMSTR-01` → `rulebook_orm-str.md`: R-ORMSTR-01 w-orm 系列字串良構: 單一擁有者 `chkOrmStr` / `chkOrmData`、契約案例表 `_cvOrmStrCases`、只因良構性拒收
- `R-PORT-PIDS-01` → `rulebook_port.md`: R-PORT-PIDS-01 查詢「誰在監聽某 TCP 埠」一律經 `execProcessPortPids`／`execProcessPortPidsSync`: 不依狀態欄、Windows 以 Get-NetTCPConnection 備援、失敗與無人嚴格分開
- `R-PRECISE-01` → `rulebook_judge.md`: R-PRECISE-01 `preciseNum` 以 decimal.js 之 12 位有效數字(`PRECISE_DIGITS`;使用者 2026-10-31 由 15 位改定)取代固定 `eps = 1e-9`(小數值不歸零;整數路徑不變;`judge`、`estimateTicks` 隨之)
- `R-PM-SETTLE-01` → `rulebook_timer.md`: R-PM-SETTLE-01 以呼叫端函數或 Promise 之結果決定流程者:必定 settle、不產生未處理之 rejection/例外、佇列必定續行、失敗路徑必清理且可重試
- `R-TIMER-RELEASE-01` → `rulebook_timer.md`: R-TIMER-RELEASE-01 回傳事件物件且持有重複計時器者須可釋放
- `R-TRACE-01` → `rulebook_trace.md`: R-TRACE-01 計時器相關函數之觀察回調(opt.onTrace)與其測試: 以事件同步、斷言語意,不以延時偵測
- `R-UTF8-01` → `rulebook_data.md`: R-UTF8-01 字串與 Uint8Array 之 UTF-8 互轉:原生、失敗不失真
- `R-WRAPPER-01` → `rulebook_data.md`: R-WRAPPER-01 包裝物件(new String/Number/Boolean)之值判定
- `R-XSS-01` → `rulebook_xss.md`: R-XSS-01 js-xss 之取得與設定單一出處;偵測回報清洗會轉義或刪除之可疑項目
- `R-XSS-WALK-01` → `rulebook_xss.md`: R-XSS-WALK-01 clearXSS 之走訪: 顯式堆疊、來源物件只處理一次、複製後依終態清除、型別處置表
