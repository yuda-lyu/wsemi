# 規則帳本(讀取 Excel)

本檔 2026-11-27(wsr1,排程第 599 項①)自 `sgud/rule/rulebook_data.md`(原約 35.6KB)依類型抽出:節號與標題不變、內容逐字搬移;全部條目之索引見 `sgud/rule/rulebook.md`〈索引〉.

## R-EXCEL-READ-01 讀取Excel之值:提取原值轉字串

- 單一擁有者: `src/getDataFromExcelFileU8Arr.mjs`(`toStr`、`dateToStr`).Date 物件判斷用 `isDate(v, { onlyCheckDateObject: true })`.
- 盤點指令: 以 Grep 於 `src/` 搜 `readXlsx\(`(讀取引擎之呼叫點)與 `getDataFromExcelFileU8Arr\(`(呼叫點;2026-11-01 移除 `getDataFromExcelFileU8ArrDyn` 後,src 內應僅 `index.mjs` 匯出);規則 6: `git grep -n keepEmptyHeader -- src` 應只命中 `src/getDataFromExcelFileU8Arr.mjs`(opt 讀取一處、`to_ltdt` 之簽章與判斷、註解與 JSDoc),命名函數另以 `git grep -n nameEmptyHeads -- src` 搜,應只有同檔之定義與 `to_ltdt` 一處呼叫.
- 站點全集與判準(2026-10-10 盤點):
  - `src/getDataFromExcelFileU8Arr.mjs`(唯一呼叫 `readXlsx` 者): 已套.
- 規則:
  1. `valueToString` 預設 true:一律提取原值轉字串,不用 Excel 之顯示文字(顯示文字會使長整數成科學記號而失精度,2020-05-31 起之既定原則).數值依原值轉字串,布林為 `'true'`/`'false'`,錯誤格為其文字(如 `'#N/A'`).
  2. **日期(引擎讀出之 Date)轉字串一律為 `YYYY-MM-DDTHH:mm:ss.SSS`:不加時區,統一至毫秒,不得依值自行省略至日或秒.** 取 UTC 分量(hucre 以 UTC 分量表示 Excel 儲存格之年月日時分秒),結果與執行環境之時區無關;無效日期為 `''`.
  3. `valueToString:false`:回傳原值,日期為 Date,其 UTC 分量即 Excel 儲存格之年月日時分秒.
  4. `fmt:'csv'`:輸出為文字,日期不論 `valueToString` 一律為規則 2 之字串並加引號.
  5. 表頭同規則 1、2 轉字串,轉換後為 `''` 者視為空表頭,預設(`opt.keepEmptyHeader` 非 `true`)整欄跳過、`true` 時依規則 6 命名保留;重複表頭後者覆蓋前者.
  6. **`fmt:'ltdt'` 之 `opt.keepEmptyHeader`(預設 `false`,B1 布林,非布林視為未給而取預設,K3、V5、K5;使用端提出,Gitea #221,主控 2026-11-26 裁定參數名、預設與碰撞規則)**: `false`(含未給、非布林)即規則 5——空表頭之欄位整欄跳過,如以合併儲存格跨多欄之表頭其被合併之欄,值遺失(hucre 讀合併範圍內非左上角之儲存格為 `null`,與未合併之空白表頭無異;1.8.73 改用 hucre 前之 SheetJS 時代以 `__EMPTY` 系命名而保留);`true` 時空表頭之欄位(空 cell 或轉字串後為 `''`;只有空白字元之表頭是真實表頭)依由左至右之順序命名為 `'__EMPTY'`、`'__EMPTY_1'`、`'__EMPTY_2'`…(同 SheetJS 時代 `sheet_to_json` 之命名),序號單調遞增、不回補被跳過者,各分頁各自起算;產生之名稱與表頭列內任一真實表頭相同(含位於其右側者)時序號續增至不重複,**真實表頭不改名**(與 SheetJS 由左至右命名而使右側真實表頭被改名不同);命名後之欄位其空 cell 仍為略鍵、`''` 仍保留鍵、全空列仍跳過;首列全空時 `true` 逐欄命名(預設各列為 `{}`);資料列較表頭列寬時(hucre 回稠密矩形,表頭列補 `null`),超出表頭列之欄位其表頭即為空白,同樣命名保留;`fmt:'array'`／`'csv'` 本就保留全部欄位(空表頭為 `''`),不受影響;**不處理重複表頭**(仍規則 5)——與 SheetJS 之差異(重複者加 `_1`、`_2` 後綴而不覆蓋)屬另一議題,見本節〈已知限制〉.單一擁有者: `nameEmptyHeads`(`src/getDataFromExcelFileU8Arr.mjs`).
- 依據: xlsx 儲存格之日期時間為不帶時區之序號(雙精度浮點數,Excel 以 17 位有效數字寫入),精度可至毫秒(ECMA-376/ISO 29500;openpyxl 文件:「maximum date and time precision in XLSX files is millisecond precision」);檔案屬性(core.xml)之時間帶 Z 與儲存格無關.
- 軸: 儲存格型別(文字/inlineStr/rich text/數值/布林/日期/日期時間/時間/經過時間/錯誤/公式快取值/無快取公式/`t="d"`/空格/有格式之空格) × 數值格式(內建 id/自訂) × `fmt`(ltdt/array/csv) × `valueToString` × 位置(表頭/內容) × 日期系統(1900/1904) × 執行時區;ltdt 之表頭另有軸: 空白表頭(無/有合併儲存格) × `keepEmptyHeader`(未給/false/true/非布林) × 與真實表頭之命名碰撞(左側/右側) × 重複表頭.
- 已知限制(依原值,不依顯示格式):
  - 重複表頭(兩欄以上表頭文字相同)於 `fmt:'ltdt'` 後者覆蓋前者,前者之值遺失(實測 `a,a,a` 三欄僅留末欄之值);SheetJS 時代為 `a`、`a_1`、`a_2`(`a,a,a_1` 為 `a`、`a_1`、`a_1_1`;使用端以 xlsx 0.18.5 實測之提報,本庫已無 xlsx 未重現).`keepEmptyHeader` 不處理之(見規則 6).
  - 純時間儲存格之日期部分為基準日 `1899-12-31`(1904 系統為 `1904-01-01`),如 `'1899-12-31T13:45:00.000'`.
  - 經過時間格式(`[h]:mm` 等)為自基準日起算之日期時間,如 1.5 日為 `'1900-01-01T12:00:00.000'`.
  - 序號 60(Excel 虛構之 1900-02-29)讀為 `'1900-02-28T00:00:00.000'`.
  - 日期格式但值含時刻者輸出時刻;毫秒以下由引擎四捨五入至毫秒.
- 測試: `test/getDataFromExcelFileU8Arr.test.mjs`(各型別、ltdt/array/csv、`valueToString:false`、1904、表頭、三時區子行程、`describe('opt.keepEmptyHeader …')` 21 案〔夾具鑑別力、預設不變、合併儲存格表頭與未合併之空白表頭、`valueToString:false`、命名碰撞(左右兩側之真實表頭)、空表頭定義、空 cell 語意、分頁各自起算、碰撞只對同一分頁之真實表頭、首列全空、無空表頭時無作用、無列或只有表頭列之分頁、12 欄空白表頭跨兩位數序號、資料列較表頭列寬、重複表頭不處理、array／csv 不受影響、非布林視為未給、opt 非物件、不改寫呼叫端 opt(凍結物件)、與其他無效 opt 並用且無法讀取之 u8a 仍回 `{ error }`〕),測試檔以 `test/tools/buildXlsx.mjs`(`opt.merges` 組合併儲存格)依 OOXML 原文組出(不經任何 xlsx 套件寫出);`test/isDate.test.mjs`(`onlyCheckDateObject`).指令: `npx mocha --no-parallel test/getDataFromExcelFileU8Arr.test.mjs test/isDate.test.mjs --timeout 180000`.
- 變更紀錄:
  - 2019-05~2020-05: `sheet_to_csv` 取顯示文字(日期依格式顯示,長整數失精度,含換行之儲存格切斷整列).
  - 2020-05-30~2026-08-17(SheetJS): 原值轉字串,日期為序號字串(如 `'45293'`),錯誤格為 `''`.
  - 2026-08-17(改用 hucre): 日期原值變為 Date,`cstr` 回 `''` 致日期遺失(退化);錯誤格成錯誤文字.
  - 2026-10-06: 日期轉 `YYYY-MM-DDTHH:mm:ss.SSS`(規則 2);csv 之日期不再為空;表頭轉換後空鍵跳過;`isDate` 新增 `opt.onlyCheckDateObject`.
  - 2026-11-01: 移除保留函數 `getDataFromExcelFileU8ArrDyn`(原委派本函數,差異僅在錯誤時 reject 而非 resolve `{ error }`;破壞性變更紀錄第 48 項): 使用端改呼叫 `getDataFromExcelFileU8Arr` 並自行檢查回傳之 `error`.
  - 2026-11-26(排程第 670 項,Gitea #221): 新增 `opt.keepEmptyHeader`(規則 6,非破壞性擴充,預設行為不變);1.8.73(2026-08-17)改用 hucre 後空表頭之欄位整欄跳過(SheetJS 時代為 `__EMPTY` 系命名而保留值),以合併儲存格跨多欄之表頭其被合併之欄之值遺失,需要者以 `keepEmptyHeader: true` 取回.主控裁定: 參數名、預設 `false`、碰撞規則(真實表頭不改名)、空白定義沿用現行、重複表頭不在本案(另案).
