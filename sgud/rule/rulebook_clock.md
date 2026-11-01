# 規則帳本(顯式時區時鐘)

## R-CLOCK-01 需以指定時區取「現在」者一律經 `genClockTZ`:時間欄位取自 Intl、不隨系統時區、不改全域物件、無預設時區

- 單一擁有者: `src/genClockTZ.mjs`(`genClockTZ(timeZone) → 時鐘物件`;對外匯出).收錄依據 R-SCOPE-01 ②(延伸 `now2str` 家族:該家族隨系統時區,排程環境之系統時區可能為 UTC+0,日誌/檔名/「當日」判定差 8 小時)與 ①(w-dispatch-ai 之 `createFileStore`／`createUsageCounter` 要求注入時區錨定之 `stamp`／`getDate`;w-data-pipeline #39 之 `createLogger` 以鴨子型別取 `stamp8()`／`iso8`).來源: Gitea #41(tai-kns-trade)§1,主控 2026-11-01 裁定收、`createTime` 之預設時區 `'Asia/Taipei'` 不收.
- 規則:
  1. `timeZone` 為必須參數,無預設值: 須為非空**原始**字串(不收 `String` 包裝物件、已撤銷 Proxy 一律視為無效)並為執行環境 `Intl.DateTimeFormat` 所接受之時區名稱,否則**同步拋 Error**(工廠,輸入規格 K2),訊息 `genClockTZ 需要 IANA 時區字串（如 Asia/Taipei）`,不回顯輸入值(K9);驗證用之值即使用之值(K4,不重複 `String()` 轉換).設定錯誤於建立時即現.
  2. **時間欄位與 UTC 偏移取自 `Intl.DateTimeFormat(...).formatToParts(Date.now())`,偏移 = 「該時區牆鐘視為 UTC」與實際時刻(取整秒)之差**;**不得**以系統本地時間解析目標時區之牆鐘(`new Date(toLocaleString(..., { timeZone }))`、dayjs `tz()` 外掛皆如此):系統時區有夏令時間者,其轉換間隙內目標時區結果差 1 小時(審查實測: `TZ=America/Los_Angeles` 於 2026-03-07T18:00Z 起一小時,Taipei 得 `...030000` 應為 `...020000`;`TZ=Europe/London` 同).測試 `sweep` 案逐 5 分鐘掃 7 個轉換點 × 8 個時區 × 4 個系統時區(>1000 檢查)驗 `Date.parse(iso8())` 等於實際瞬間.
  3. 不修改任何全域物件(不 `dayjs.extend`):既有 `now2str`／`timeTZ2*` 系列之行為不受影響(測試 `sideEffects` 案於三種系統時區比對建立時鐘前後之 11 項輸出相同).
  4. 回傳物件之方法皆為閉包(不依賴 `this`,可解構取用、當函數傳遞);**兩套方法名並列為同一函數**: `iso8`＝`getISO`、`stamp8`＝`getNow`,另 `date8`、`day8`、`getDay`、`getDate`、`formatTime`、`getTimestamp`、`timeZone`(11 鍵).理由: 管線類消費端(w-data-pipeline)用 `stamp8`／`iso8`,排程殼類消費端用 `getNow`／`getISO`,收斂為一套會迫使多套件同批改碼,屬「行為隨件移動」(建議檔 §0)之範圍外.
  5. 格式: `iso8` `YYYY-MM-DDTHH:mm:ss±HH:mm`(UTC 為 `+00:00`,與 `now2str` 同格式)、`stamp8` `YYYYMMDDHHmmss`、`date8` `YYYY-MM-DD`、`day8` `YYYYMMDD`、`getTimestamp` `YYYY-MM-DD HH:mm:ss`、`formatTime(s)` `YYYY/MM/DD HH:mm`.
  6. `getDay(s=stamp8())`: 對輸入純切片前 8 碼(不重新解析,不做時區轉換);`s` 非「以 8 位數字開頭之原始字串」視為未給,改用 `stamp8()`(K3).`getDate(offsetDay=0)`: 以日曆日加減(UTC 日期運算,不受夏令時間影響);`offsetDay` 非整數(`iseint`,字串型數字收)或使年份超出 0000～9999 視為未給,改用 0(K3).`formatTime(s)`: `s` 為必須參數,非「至少 12 位數字之原始字串」**同步拋 Error** `invalid s: must be a stamp string of at least 12 digits (YYYYMMDDHHmm...)`(K2;§5.3 C3「格式化類」之處置待確認,現依派工單 K2).
- 盤點指令: `git grep -n "genClockTZ" -- src test`;`git grep -n "dayjs.extend\|\.tz(" -- src`(應為 0:不得引入會改全域之 dayjs 外掛).
- 站點全集(2026-11-01): 本輪為新增函數,既有 `now2str`／`nowDay2str`／`nowms2str`／`now2strp`／`nowms2strp` 站點**刻意不改**(行為不變,仍隨系統時區).下游使用端(建議檔 §1,專案方自行改單一匯入點): srcCapture `core/assemblyKit.mjs:33`、`bench/benchKit.mjs:42` 與測試 11 檔;專案 `src/config.mjs:16` 與 13 個測試檔;tai-news-ai `src/utils.mjs:14`;w-data-pipeline #39 `createLogger`(鴨子型別 `stamp8()`／`iso8`).
- 測試: `test/genClockTZ.test.mjs`(28 案;`at()` 以 `node:test` 之 `mock.timers`(只假冒 Date)固定現在時刻,逐格斷言格式/偏移/跨日/跨月年/閏日/夏令轉換日/K2K3 輸入表;子行程 `test/tools/genClockTZRunner.mjs`(`zones`、`sweep`、`sideEffects` 三案)以 `TZ` 環境變數改系統時區).
- 變異證明(沙箱副本,結案時清除): 22 項(含「回到 dayjs tz 外掛」G21 與「以本地時間解析牆鐘」G22 兩個審查缺陷變體)擊殺 21,存活 1 為等價(G04 `Math.round`→`Math.floor`: 兩端皆取整秒,現代時區偏移為整分鐘).G22 起初存活(瞬間仍對、偏移標示錯),補「無夏令時區固定偏移對照」後擊殺.修前紅: 新測試對 HEAD 之 src 為整檔載入失敗(模組不存在).
- 差分驗證(一次性,腳本見主控任務 `agent-out/wsemi41-evidence/diff-dayjs.mjs`): 系統時區 `TZ=UTC`(無間隙,dayjs tz 外掛此時正確)下,以 18 個時區(含 `Australia/Lord_Howe`、`Asia/Kathmandu`、`Pacific/Chatham`、`Asia/Tehran`、`America/St_Johns`、`Africa/Casablanca`、`Pacific/Kiritimati`)× 4000 個 1990～2100 隨機瞬間共 72000 組,`iso8()`／`stamp8()` 與 `dayjs().tz()` 全部相同(0 差異).
- 已知限制: ①有效時區名稱依執行環境 ICU 資料,Node 24 亦接受 `'+08:00'`、`'EST'`、小寫 `'asia/taipei'` 等(舊版 Node 可能不接受),JSDoc 已載;②`iso8()`／`stamp8()`／`date8()` 等各自呼叫 `Date.now()`,連續呼叫可能跨秒,需同一瞬間之多種寫法者請取一次 `iso8()` 自行切;③`Date.UTC` 對 0～99 年之特例不處理(現在時間不涉及);④`formatTime` 之輸入無效拋錯 vs 回 `''`(C3)待確認.
- 變更紀錄: 2026-11-01(wsemi41)新增.初版以 dayjs `utc`／`timezone` 外掛實作,獨立審查(sonnet)實測發現系統夏令間隙差 1 小時而改為 Intl(規則 2),並因此不再引入 dayjs 外掛之 UMD 子路徑 import.
