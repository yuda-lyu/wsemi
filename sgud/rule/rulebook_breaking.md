# 規則帳本(破壞性變更紀錄)

本檔自 `sgud/rule/rulebook.md` 搬移而來(2026-10-28 整理,wsemi-run08):各節之節號與標題不變、內容逐字未動;全部條目之索引見 `sgud/rule/rulebook.md`〈索引〉.

## 破壞性變更紀錄(2026-10-16,第 39 項,主控 run01 複審裁示)

可觀察之對外行為變更;各條之規則與測試見所屬規則條目.

第 1～38 項(2026-10-16 至 2026-10-21)已於 2026-10-29(wsemi-run10)抽出至 `sgud/rule/rulebook_breaking_20261021.md`(逐字搬移、項號不變);本檔自第 39 項起.

破壞性變更各項依項號拆為下列各檔(同目錄;2026-11-02 ws272c 依全域設定 §14 整理,本檔原約 49.4KB;項號不變、內容逐字搬移).新增之項附於 `rulebook_breaking_71on.md` 末(`rulebook_breaking_65on.md` 約 36KB,於第 70 項後封存,第 71 項起另開 `rulebook_breaking_71on.md`,2026-11-17 ws492d;該檔於第 73 項後約 29.5KB 封存,第 74 項起另開 `rulebook_breaking_74on.md`,2026-11-18 ws492g;`rulebook_breaking_52on.md` 於第 56 項後封存,2026-11-02 ws286b;`rulebook_breaking_57on.md` 約 26KB,於第 64 項後封存,第 65 項起另開 `rulebook_breaking_65on.md`,2026-11-12 ws430;該檔逾 30KB 時再抽出新檔):

| 項號 | 檔 | 約 KB |
|---|---|---|
| 第 1～38 項(2026-10-16 至 2026-10-21) | `sgud/rule/rulebook_breaking_20261021.md` | 28.2 |
| 第 39～44 項 | `sgud/rule/rulebook_breaking_39to44.md` | 12.2 |
| 第 45～51 項 | `sgud/rule/rulebook_breaking_45to51.md` | 23.4 |
| 第 52～56 項 | `sgud/rule/rulebook_breaking_52on.md` | 23.9 |
| 第 57 項起(第 57 項 ws286a、第 58 項 ws286b、第 59 項 ws286c、第 60 項 ws286d、第 61 項 ws286e、第 62 項 ws290、第 63 項 ws426、第 64 項 ws427〔`replace` 之 `r` 改字面〕;第 64 項後封存) | `sgud/rule/rulebook_breaking_57on.md` | 約 26 |
| 第 65 項起(第 65 項 ws430〔`browserView` 系、`openLink`、`domAlert` 之 C18;opt 數值改 `iseint` 14 站〕、第 66 項 ws430b〔第 430 項第二批 14 個函數:元素層級與自有鍵,R-ELEM-LEVEL-01〕、第 67 項 ws430c〔第 430 項第三批 14 個函數:列之訊息指出位置、儲存格文字表示法、arrDiff 逐格比對、帶時區時刻之驗證,R-ELEM-LEVEL-02 等〕、第 68 項 ws492a〔第 492 項:`domIsClientXYIn` 無效回傳 `undefined` → `false`、`domGetBoudRectRefSelf`／`interp1`(stairs)之數值參數改 `isenum`＋`cdbl`,R-ENTRY-CONVERT-01〕、第 69 項 ws492b〔第 492 項第 1 批:`objSortByKeys` 排序規則與非預期輸入拋錯、`treeToFilepath` 非陣列／元素非物件拋錯、`arr2dt` 值陣列之函數元素視為 `null`、`pseudoRandomIntsNdpRange` 回 `[vstart, vend]` 內之值,R-ENTRY-THROW-01、R-RANGE-VALUE-01〕、第 70 項 ws492c〔第 492 項第 2 批:31 個 `fs*Core` 缺注入相依 fail-closed、判斷類非字串路徑回 `false`、`levelLimit` 之 `null` 取預設 1、路徑型 opt 鍵非預期取預設、`fsTask` 紀錄資料夾無法使用即拋錯、N-A 之 fs 函數入口檢測,R-FS-DEPS-01、R-LEVEL-LIMIT-01、R-FS-OPT-PATH-01、R-FS-ENTRY-CHECK-01〕;第 70 項後封存〔該檔逾 30KB〕) | `sgud/rule/rulebook_breaking_65on.md` | 約 36 |
| 第 71 項起(第 71 項 ws492d〔第 492 項第 3 批:雜湊演算法 `type`／`typeHash` 給了而無效即拒絕、`fsEnsureBins` 之 `names: []` 合法與非安全 opt 改預設、`fsDownloadFileVerify` 包裝物件不解包、fs 系錯誤訊息不回顯路徑／網址／輸入值、Node 原生錯誤改固定詞彙加錯誤碼、對外 12 函數注入鍵 `undefined` 取內建,R-HASH-TYPE-01、R-SEC-OPT-01、R-FS-ERRMSG-01、R-FS-MSG-V20-01〕、第 72 項 ws492e〔第 492 項第 4 批:DOM 與下載函數之輸入檢測——改畫面者同步拋固定訊息、查詢類回空、下載族同一通道、`domRemove`／`domCancelEvent` 改回布林、`files2data` 等 Promise 通道、opt 逐鍵檢測、`color` 之 `amount`／`w1`／`w2`,R-DOM-ARG-01、R-DOM-OPT-01、R-DL-ARG-01、R-COLOR-ARG-01〕、第 73 項 ws492f〔第 492 項第 5 批:外部程序——`execProcess` 之 `prog` 三模式一致須為非空原始字串且 exec 不再轉型、`args` 元素種類檢測、`opt.codeCmd` 不支援改 K3 預設、原生錯誤固定詞彙;`execProcessKillPid` 之 `pid` 須 1~2147483647 之整數且 0、負數先於殺程序拒絕;`execJsCode` 之 `fpJsCode` 固定訊息與「不存在」分開、`opt` 直通,R-EXEC-ARG-01、R-EXEC-FAIL-01 規則 15〕;第 73 項後封存〔約 29.5KB,逾 30KB 前另開〕) | `sgud/rule/rulebook_breaking_71on.md` | 約 29 |
| 第 74 項起(第 74 項 ws492g〔第 492 項第 6 批:計時與流程函數之函數參數——`setTimeoutHp`／`setIntervalHp`／`cacheBd`／`pmHook`／`pmHookReject` 之 `fun` 無效改同步拋 `Error('invalid fun: must be a function')`(不再到期才記錄、輪詢至 nMax、回 `null`),`pmQueue`／`pmThrottle` 任務無效之 reject 字串改 `'invalid fun: must be a function'`,`pmKeyMutex` 之 `fn` 無效改立即 reject `'invalid fn: must be a function'` 且不排隊,`pmChain`／`pmMap`／`pmSeries` 非函數視為未給(僅 JSDoc);`importResources` 之 `pathItems` 進入時驗證、無效以固定字串 reject、不改寫呼叫端輸入、不再 `console.log` 回顯,R-PM-ARG-01、R-PM-SETTLE-01 規則 12〕;新增之項附於此檔) | `sgud/rule/rulebook_breaking_74on.md` | 約 6 |
