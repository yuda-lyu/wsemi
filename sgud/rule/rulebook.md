# 規則帳本

本檔為套件設計與開發階段之規則帳本,為要求程式碼須長成什麼樣,或由規格產出之測試(項目/說明/流程)有哪些,包含軸、單一擁有者、已知限制、破壞性變更紀錄,以及對應是哪些測試檔案或指令等,由agent自行編列、擴充與維護.

## 索引(哪類查哪檔)

2026-10-28(wsemi-run08)依全域設定§14整理: 本檔原約 301.4KB,現依類型拆為下列 10 檔(同目錄);各節之節號與標題不變、內容逐字搬移,既有引用(如 `sgud/rule/rulebook.md R-FIND-01`)改至下表所列之檔查閱.新增條目時附於相近類型之檔,並同步更新本索引.

| 類 | 檔 | 條目 | 約 KB |
|---|---|---|---|
| 計時器、佇列與 Promise 流程 | `sgud/rule/rulebook_timer.md` | R-TIMER-RELEASE-01、R-PM-SETTLE-01、R-TRACE-01 | 31.7 |
| 檔案系統、下載與外部執行檔取得 | `sgud/rule/rulebook_fs.md` | R-FS-RESULT-01、R-FS-REJECT-01、R-FS-EVEM-NAME-01、R-DL-VERIFY-01、R-BIN-ENSURE-01 | 55 |
| 執行外部程序與編碼 | `sgud/rule/rulebook_exec.md` | R-EXEC-FAIL-01、R-CODEC-ERR-01 | 29.0 |
| XSS 偵測與清洗 | `sgud/rule/rulebook_xss.md` | R-XSS-01、R-XSS-WALK-01 | 19.7 |
| 物件迭代與鍵表 | `sgud/rule/rulebook_obj.md` | R-KEYMAP-01、R-OBJ-ITER-01 | 24.1 |
| 資料與型別判定、格式轉換 | `sgud/rule/rulebook_data.md` | R-EXCEL-READ-01、R-UTF8-01、R-ENV-01、R-WRAPPER-01、R-FILETYPE-01 | 24.3 |
| w-orm 系列條件(find)之形狀檢核 | `sgud/rule/rulebook_orm-find.md` | R-FIND-01 | 38.5 |
| w-orm 系列字串良構 | `sgud/rule/rulebook_orm-str.md` | R-ORMSTR-01 | 36.9 |
| SQL 族後端共用之方言中立條件 IR | `sgud/rule/rulebook_orm-lower.md` | R-LOWER-01 | 18.7 |
| 破壞性變更紀錄 | `sgud/rule/rulebook_breaking.md` | 破壞性變更紀錄 | 28.6 |

各條目全標題:

- `破壞性變更紀錄` → `rulebook_breaking.md`: 破壞性變更紀錄(2026-10-16,第 39 項,主控 run01 複審裁示)
- `R-BIN-ENSURE-01` → `rulebook_fs.md`: R-BIN-ENSURE-01 外部執行檔之取得一律經 `fsEnsureBins`(清單校驗、快取→鏡像→GitHub、離線)
- `R-CODEC-ERR-01` → `rulebook_exec.md`: R-CODEC-ERR-01 codec 之錯誤值轉換與失敗回報:只轉真 Error、catch 不外拋
- `R-DL-VERIFY-01` → `rulebook_fs.md`: R-DL-VERIFY-01 下載執行檔或二進位資產一律經 `fsDownloadFileVerify` 驗證 SHA-256(與大小)
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
- `R-PM-SETTLE-01` → `rulebook_timer.md`: R-PM-SETTLE-01 以呼叫端函數或 Promise 之結果決定流程者:必定 settle、不產生未處理之 rejection/例外、佇列必定續行、失敗路徑必清理且可重試
- `R-TIMER-RELEASE-01` → `rulebook_timer.md`: R-TIMER-RELEASE-01 回傳事件物件且持有重複計時器者須可釋放
- `R-TRACE-01` → `rulebook_timer.md`: R-TRACE-01 計時器相關函數之觀察回調(opt.onTrace)與其測試: 以事件同步、斷言語意,不以延時偵測
- `R-UTF8-01` → `rulebook_data.md`: R-UTF8-01 字串與 Uint8Array 之 UTF-8 互轉:原生、失敗不失真
- `R-WRAPPER-01` → `rulebook_data.md`: R-WRAPPER-01 包裝物件(new String/Number/Boolean)之值判定
- `R-XSS-01` → `rulebook_xss.md`: R-XSS-01 js-xss 之取得與設定單一出處;偵測回報清洗會轉義或刪除之可疑項目
- `R-XSS-WALK-01` → `rulebook_xss.md`: R-XSS-WALK-01 clearXSS 之走訪: 顯式堆疊、來源物件只處理一次、複製後依終態清除、型別處置表
