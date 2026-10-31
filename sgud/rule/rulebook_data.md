# 規則帳本(資料與型別判定、格式轉換)

本檔自 `sgud/rule/rulebook.md` 搬移而來(2026-10-28 整理,wsemi-run08):各節之節號與標題不變、內容逐字未動;全部條目之索引見 `sgud/rule/rulebook.md`〈索引〉.

## R-EXCEL-READ-01 讀取Excel之值:提取原值轉字串

- 單一擁有者: `src/getDataFromExcelFileU8Arr.mjs`(`toStr`、`dateToStr`);`getDataFromExcelFileU8ArrDyn` 委派之.Date 物件判斷用 `isDate(v, { onlyCheckDateObject: true })`.
- 盤點指令: 以 Grep 於 `src/` 搜 `readXlsx\(`(讀取引擎之呼叫點)與 `getDataFromExcelFileU8Arr\(`(委派點).
- 站點全集與判準(2026-10-10 盤點):
  - `src/getDataFromExcelFileU8Arr.mjs`(唯一呼叫 `readXlsx` 者): 已套.
  - `src/getDataFromExcelFileU8ArrDyn.mjs`: 委派上者,已套.
- 規則:
  1. `valueToString` 預設 true:一律提取原值轉字串,不用 Excel 之顯示文字(顯示文字會使長整數成科學記號而失精度,2020-05-31 起之既定原則).數值依原值轉字串,布林為 `'true'`/`'false'`,錯誤格為其文字(如 `'#N/A'`).
  2. **日期(引擎讀出之 Date)轉字串一律為 `YYYY-MM-DDTHH:mm:ss.SSS`:不加時區,統一至毫秒,不得依值自行省略至日或秒.** 取 UTC 分量(hucre 以 UTC 分量表示 Excel 儲存格之年月日時分秒),結果與執行環境之時區無關;無效日期為 `''`.
  3. `valueToString:false`:回傳原值,日期為 Date,其 UTC 分量即 Excel 儲存格之年月日時分秒.
  4. `fmt:'csv'`:輸出為文字,日期不論 `valueToString` 一律為規則 2 之字串並加引號.
  5. 表頭同規則 1、2 轉字串,轉換後為 `''` 者視為空表頭跳過;重複表頭後者覆蓋前者.
- 依據: xlsx 儲存格之日期時間為不帶時區之序號(雙精度浮點數,Excel 以 17 位有效數字寫入),精度可至毫秒(ECMA-376/ISO 29500;openpyxl 文件:「maximum date and time precision in XLSX files is millisecond precision」);檔案屬性(core.xml)之時間帶 Z 與儲存格無關.
- 軸: 儲存格型別(文字/inlineStr/rich text/數值/布林/日期/日期時間/時間/經過時間/錯誤/公式快取值/無快取公式/`t="d"`/空格/有格式之空格) × 數值格式(內建 id/自訂) × `fmt`(ltdt/array/csv) × `valueToString` × 位置(表頭/內容) × 日期系統(1900/1904) × 執行時區.
- 已知限制(依原值,不依顯示格式):
  - 純時間儲存格之日期部分為基準日 `1899-12-31`(1904 系統為 `1904-01-01`),如 `'1899-12-31T13:45:00.000'`.
  - 經過時間格式(`[h]:mm` 等)為自基準日起算之日期時間,如 1.5 日為 `'1900-01-01T12:00:00.000'`.
  - 序號 60(Excel 虛構之 1900-02-29)讀為 `'1900-02-28T00:00:00.000'`.
  - 日期格式但值含時刻者輸出時刻;毫秒以下由引擎四捨五入至毫秒.
- 測試: `test/getDataFromExcelFileU8Arr.test.mjs`(各型別、ltdt/array/csv、`valueToString:false`、1904、表頭、三時區子行程),測試檔以 `test/tools/buildXlsx.mjs` 依 OOXML 原文組出(不經任何 xlsx 套件寫出);`test/isDate.test.mjs`(`onlyCheckDateObject`).指令: `npx mocha --no-parallel test/getDataFromExcelFileU8Arr.test.mjs test/isDate.test.mjs --timeout 180000`.
- 變更紀錄:
  - 2019-05~2020-05: `sheet_to_csv` 取顯示文字(日期依格式顯示,長整數失精度,含換行之儲存格切斷整列).
  - 2020-05-30~2026-08-17(SheetJS): 原值轉字串,日期為序號字串(如 `'45293'`),錯誤格為 `''`.
  - 2026-08-17(改用 hucre): 日期原值變為 Date,`cstr` 回 `''` 致日期遺失(退化);錯誤格成錯誤文字.
  - 2026-10-06: 日期轉 `YYYY-MM-DDTHH:mm:ss.SSS`(規則 2);csv 之日期不再為空;表頭轉換後空鍵跳過;`isDate` 新增 `opt.onlyCheckDateObject`.

## R-UTF8-01 字串與 Uint8Array 之 UTF-8 互轉:原生、失敗不失真

- 單一擁有者: `src/str2u8arr.mjs`、`src/u8arr2str.mjs`;呼叫端 `src/obj2u8arr.mjs`、`src/u8arr2obj.mjs`.
- 規則:
  1. 字串→位元組用原生 `TextEncoder`;編碼前檢查良構(`String.prototype.isWellFormed`,無此方法之環境以正則判孤立代理碼元),含孤立代理碼元者視為失敗,不得讓 TextEncoder 靜默換成 U+FFFD.
  2. 位元組→字串用 `new TextDecoder('utf-8', { fatal: true, ignoreBOM: true })`:非合法 UTF-8 視為失敗,不得靜默換成 U+FFFD,也不得回成功之空字串;開頭 BOM 保留為 U+FEFF,與編碼端往返一致.
  3. 失敗依 wsemi 慣例回空值,`returnWithStateAndMsg` 時回 `{ state: 'error', msg }`;內部呼叫其他轉換函數須以 `returnWithStateAndMsg` 取狀態,不得以預設模式吞掉錯誤.
  4. 不引入第三方套件做 UTF-8 轉換: fflate 之 `strToU8`/`strFromU8` 於現代環境即原生 TextEncoder/TextDecoder 之預設選項(去除開頭 BOM、壞資料換成 U+FFFD,fflate 0.8.3 `esm/index.mjs:1678-1680`、`:1798`、`:1837`),無法滿足規則 1、2.
- 盤點指令: 以 Grep 於 `src/` 搜 `new TextEncoder|new TextDecoder|crypto-js/enc-utf8`.
- 站點全集與判準(2026-10-10 盤點):
  - `src/str2u8arr.mjs`、`src/u8arr2str.mjs`: 已套.
  - `src/str2b64.mjs`、`src/b642str.mjs`(crypto-js enc-utf8,字串與 base64 互轉): 未套(本規則訂立時之範圍外);其語意同為失敗不失真(孤立代理拋 URIError、非合法 UTF-8 拋 Malformed UTF-8 data,BOM 保留),僅效能較差.
  - `src/aes2str.mjs`(crypto-js AES 解密後之 UTF-8): 刻意不套,屬 crypto-js AES 流程之一環.
  - `src/execCli.mjs`、`src/execCliSession.mjs`、`src/_execProcessCodec.mjs`(外部程序輸出之串流解碼): 刻意不套,輸出顯示不可因壞位元組中斷,以 U+FFFD 取代並另有字碼頁判定.
- 測試: `test/str2u8arr.test.mjs`(UTF-8 位元組、孤立代理失敗、無 isWellFormed 之退路、大字串)、`test/u8arr2str.test.mjs`(BOM 保留、6 種非法 UTF-8 失敗、subarray 與 Buffer、300 筆隨機良構字串往返並與 Buffer 之 UTF-8 對照);呼叫端 `test/obj2u8arr.test.mjs`、`test/u8arr2obj.test.mjs`.指令: `npx mocha --no-parallel test/str2u8arr.test.mjs test/u8arr2str.test.mjs test/obj2u8arr.test.mjs test/u8arr2obj.test.mjs --timeout 180000`.
- 變更紀錄:
  - 2026-10-10: 由 crypto-js 經 base64 轉換改為原生 TextEncoder/TextDecoder;3000 筆隨機良構字串新舊輸出一致;`u8arr2str` 遇非法 UTF-8 由 `{ state: 'success', msg: '' }` 改為 `{ state: 'error' }`(原呼叫 `b642str` 未取狀態而吞掉錯誤),預設模式仍回 `''`;孤立代理之錯誤訊息由 `str2b64: URIError: URI malformed` 改為 `invalid str, contains lone surrogates`;50MB 往返由約 9.3 秒降為約 0.12 秒.

## R-ENV-01 環境判斷函數(回布林)於非目標環境回 false、不拋錯

- 依據: 主控 run01 複審裁示 11(⑤ 同修).
- 規則: 讀取瀏覽器全域(location、navigator、document)前以 `typeof X !== 'undefined'` 防護;未宣告之全域直接讀取為 ReferenceError,`if (location)` 不是防護.isDev 用 `typeof location`(Web Worker 亦有 location,不可改用 isWindow),判準不變(`location.href` 含 localhost 為開發;下游 e2e 依賴此判準).
- 站點全集與判準(2026-10-16,環境判斷 6 函數): isDev(Node 下拋 ReferenceError)、isIE(無 navigator 時拋)、isEleExistByID(無 document 時拋)——修;isWindow、getEnv、isNarrow——已套(以 isWindow 防護).
- isIE 另於 `navigator.userAgent` 非字串時回 false(navigator 存在而無字串 userAgent 之環境).
- JSDoc: isDev、isIE、isEleExistByID 之 `@returns` 補「非瀏覽器環境(無location/navigator/document)回傳false」.
- 盤點指令: Grep `src/` 之 `^\s*if \((location|navigator|document|window)\)`(2026-10-16 為 0 筆)與 `typeof (location|navigator|document|window)`(domDetect、isDev、isIE、isEleExistByID、isWindow).
- 測試(2026-10-16): `test/isDev.test.mjs` 3、`test/isIE.test.mjs` 4、`test/isEleExistByID.test.mjs` 3(`describe(\`<函數> 非瀏覽器環境與判準(R-ENV-01)\`)`;原為占位案);全域替身以 `test/tools/envGlobal.mjs` 之 `withGlobal` 依屬性描述子可還原地移除/替換(Node 24 之 navigator 為可配置 getter).

## R-WRAPPER-01 包裝物件(new String/Number/Boolean)之值判定

- 依據: 主控 run01 複審裁示 12(⑥ A-lite);探測 `tmp/run01-1016/self/probe-wrapper.mjs`(54 函數 × 23 原始值,比較 `f(p)` 與 `f(Object(p))`;修前差異 21 格).
- 規則:
  1. isstr、isnbr、isbol 依內部標籤判型,包裝物件視同其型別(既有,不改;w-aggrid-vue `test/unit-hucre-limits.test.mjs:54` 依賴 `new String('boxed')` 為有效字串,本庫 `test/_optNum.test.mjs:14` 依賴 `new Number(3)` 得 3).
  2. 值判定函數對包裝物件拆包後判定: isestr 以 `v.length > 0`、isstr0 以 `v.length === 0`;isnan 對物件以 `Number.prototype.valueOf.call(v)` 取原始值(非 Number 物件即拋錯而為 false;不呼叫物件自身之 valueOf、不以內部標籤判定,防偽裝);cbol 之布林分支回傳 `Boolean.prototype.valueOf.call(v)`(恆回原始布林,不回包裝物件本身——`new Boolean(false)` 為 truthy;其拋錯者如凍結且偽造 Symbol.toStringTag 為 'Boolean' 之物件(lodash isBoolean 對其為真)回 false).其上之 iser、isernot、isnum 族(isnum、isint、isn0int、isn0num、isp0int、isp0num)、cstr、isUserName、isUserIdentify 隨之一致.
  3. 其餘函數不保證拆包(設計限制,JSDoc 載明請傳入原始值): isday、istime 對包裝字串為 false;cbol(new Number(1)) 為 false;以 `isbol(x)` 守門後以 `if (x)` 取值之站點,`new Boolean(false)` 仍為 truthy.
  4. (2026-10-31,wsemieff,R-ENUM-01 規則 1)**專用判斷函數 `isenum`、`iseint` 不拆包**(dspec 輸入參數之檢測機制 §7.1「包裝物件不解包」,用於計算類函數入口,不得因 `new Number(1)` 通過而其後運算出錯):包裝物件一律 false,故全表差異增 15 格——isenum 對原始值為 true 之 9 格(字串 `'0'`、`'1'`、`'1.5'`、`'-1'`,數字 0、1、-1、1.5、-1.5),iseint 對原始值為 true 之 6 格(字串 `'0'`、`'1'`、`'-1'`,數字 0、1、-1).這 2 個函數不屬規則 2 之涵蓋函數(`rule2Fns` 不含),`isnum`／`isint`／`ispint`／`isp0int` 之拆包行為不變.
- JSDoc: isstr、isnbr、isbol 補「包裝物件依內部標籤視同其型別；值判定函數(isestr、isstr0、isnan、isnum族)與cbol對包裝物件拆包後判定，其餘函數不保證，請傳入原始值」;isestr、isstr0、isnan 之 `@returns` 補「包裝物件依其原始值判定」;cbol 之 `@returns` 補「恆回傳原始布林值」.
- 盤點指令: `npx mocha --no-parallel test/isstr.test.mjs --grep "全表" --timeout 180000`(工具 `test/tools/wrapperCases.mjs`,自 src 以 readdir 取 is* 與 cbol/cdbl/cint/cstr 共 54 函數,扣環境/DOM/Blob/Promise 9 個,× 23 原始值),差異只容許規則 3 所列之 3 格(2026-10-16 修前 21 格、修後 3 格;2026-10-31 起加規則 4 之 `isenum`／`iseint` 15 格,共 18 格).
- 測試(2026-10-16): 全表 3 案(`test/isstr.test.mjs`「包裝物件全表 f(p) 與 f(Object(p))(R-WRAPPER-01)」);各檔「<函數> 包裝物件(R-WRAPPER-01)」段: isstr、isnbr、isbol、isestr、isstr0 各 2,isnan 5(含 `{ valueOf(){return NaN} }` 與偽造 toStringTag 為 false),cbol 5,isnum/isint/isn0int/isn0num/isp0int/isp0num 各 2,iser、isernot、cstr、isUserName、isUserIdentify 各 2.HEAD 副本紅 23(R-WRAPPER-01 部分),變異皆被抓.
- 已知限制(2026-10-16): isstr 以內部標籤判型,故 `{ [Symbol.toStringTag]: 'String' }` 通過 isstr;修後 isestr 以 length 判定對其為 false(修前 true)、isstr0 對帶 `length: 0` 之偽造物件為 true(修前 false),方向保守.既有 `test/isUserName.test.mjs`、`test/isUserIdentify.test.mjs` 之舊案不回傳 Promise 而斷言永不影響結果(既有偽測試,新段已以 async/await 撰寫,舊案未改).

## R-FILETYPE-01 getFileType 副檔名對照表: 鍵為小寫副檔名、比對不分大小寫、新增項目附於表尾、既有項目逐項不變

- 依據: Gitea issue #7(rddmanager,2026-10-20;建議檔 `建議wsemi修正.md`);基準 wsemi 1.9.22(實測 21 個副檔名與 `getFileType('z')` 皆回 `null`).
- 單一擁有者: `src/getFileType.mjs` 之 `fts`.`getFileAccept`(取全表、依欄位群組化)與 `domGetFileAccept`(經 `getFileAccept()` 依 `group` / `name` 組 `<input accept>` 字串)皆由其衍生,不另建副檔名表.
- 盤點指令: Grep `getFileType|getFileAccept|domGetFileAccept`(`C:\opensrc` 下,`*.{mjs,js,vue,ts,cjs}`,2026-10-20 命中: wsemi `src/getFileType.mjs`、`getFileAccept.mjs`、`domGetFileAccept.mjs`、`domShowInputAndGetFiles.mjs`(僅 JSDoc 提及)、`index.mjs`、`test/getFileType.test.mjs`、`test/getFileAccept.test.mjs`、`test/domGetFileAccept.test.mjs`、`dist/wsemi.umd.js`,及 w-tmper-docx 之 `dist` 內嵌 wsemi 副本;**無任何呼叫端以 `null` 判斷後走特殊流程**——唯一依 `null` 者為使用端(rddmanager,不在 `C:\opensrc`)).
- 規則:
  1. 表內 `name` 為**不含點之副檔名,一律小寫**;唯一既有例外 `Z`(application/x-compress)保留原樣(改名會使 `getFileAccept()` 之 `name`、`getFileAccept('name')` 之鍵與 `domGetFileAccept` 依名稱取 acp 之結果改變),其查詢由規則 2 補足.新增鍵須小寫,小寫後不得與任何既有鍵重複,且不得為 `__proto__`(`getFileAccept` 以 `r[k] = []` 建分組,`__proto__` 會設定原型而非自有鍵; 其餘 `Object.prototype` 成員名如 `constructor` 由規則 6 處理)(以上皆測試鎖定).
  2. `getFileType(name)` **不分大小寫**: 輸入與表內 `name` 皆 `toLowerCase()` 後比對.回傳之列物件為表內原物件,`name` 欄保持表內原樣(`getFileType('z').name === 'Z'`);未命中回 `null`;輸入非有效字串(`undefined`、`''`、非字串)回全表(沿用修前).不處理前導點、前後空白(`'.jpg'`、`' jpg'` 回 `null`,沿用修前).
  3. 新增項目**一律附於表尾**: 既有 174 列之順序與內容不變(除規則 5 之 `heic`),故 `getFileAccept()[n]` 之位置取值、`getFileAccept('acp')` 各分組之既有成員順序、`domGetFileAccept` 各字串之既有片段順序皆不變(新片段只出現在各 `group` 內既有片段之後).**表尾 21 列彼此之順序亦鎖定**(測試逐列相等): 順序決定 `getFileAccept('acp')` 同 acp 分組之成員順序(如 `text/markdown` 為 `['md','markdown']`)與 accept 字串中新片段之順序.
  4. `acp` 依 IANA 登錄(2026-10-20 以 IANA `application`/`image`/`model`/`text` 四份 CSV 逐項核對,皆有登錄;**`gpx` 無登錄**,IANA 僅有 `application/vnd.gpxsee.map+xml`,取通行值 `application/gpx+xml`).本次新增列中,多義(`las`、`obj`)或無登錄(`gpx`)者於列內以 `msg` 註記(既有先例: `asf`、`mpg`、`sub`;既有表之 `ai`、`mts` 等多義列未附 `msg`,本次不補).`group` / `exec` 比照同類既有項目(下表「比照」欄); 無同類先例者(kmz、las、laz、obj、gltf)比照其所屬大類之無工具項(如 `stl`、`glb`、`shp`)為 `group: ''`、`exec: ''`.
  5. **既有項目唯一允許之差異: `heic` 之 `acp` 由 `image/heif` 改 `image/heic`**(2026-10-20 第 2 次執行,主控裁示 1): IANA 對 HEVC 編碼之 HEIF 影像登錄 `image/heic`,瀏覽器與作業系統對 `.heic` 檔回報之 `File.type` 亦為 `image/heic`; `heif` 保留 `image/heif`(新增列).其餘 173 列逐列不變.基準表 `test/tools/getFileTypeBase.mjs` 維持修前原樣,此差異明列於其具名匯出 `changes`,測試以「基準表 + `changes`」為既有項目之期望值,且斷言相異列恰為 `changes` 所列者.
  6. `getFileAccept(groupBy)` 建分組時以**自有屬性**判斷分組鍵是否已存在(`Object.prototype.hasOwnProperty.call(r, k)`,本庫慣用寫法,見 `detectXSS`、`ltdtmerge`),不用 `haskey`(其為 `key in obj`,會命中原型鏈): 表內 `name` / `group` / `acp` / `exec` 之值為 `constructor`、`toString`、`hasOwnProperty` 等 `Object.prototype` 成員名時,原寫法使 `r[k]` 取到繼承之函數而 `r[k].push` 拋 `TypeError`(外審 F5,修前即有之潛在缺陷,表內現無此類值,2026-10-20 主控裁示 6 修).回傳物件之原型維持 `Object.prototype`(不改為無原型物件,以免下游 `r.hasOwnProperty` 等用法失效).`__proto__` 為特例(設定原型),由規則 1 禁止作為表內值.
- 站點全集與判準(2026-10-20,新增 21 項,表由 174 列增為 195 列): 

  | name | group | acp | exec | 比照 / 依據 |
  |---|---|---|---|---|
  | jpeg、jpe、jfif | image | image/jpeg | imageviwer | jpg |
  | tiff | image | image/tiff | imageviwer | tif |
  | svg | image | image/svg+xml | imageviwer | 無同名先例,依 image 類 |
  | heif | image | image/heif | imageviwer | heic |
  | md、markdown | data | text/markdown | textviwer | txt |
  | yaml、yml | data | application/yaml | textviwer | json |
  | log、ini | data | text/plain | textviwer | txt |
  | tsv | data | text/tab-separated-values | excel | csv |
  | kml | data | application/vnd.google-earth.kml+xml | textviwer | geojson |
  | kmz | `''` | application/vnd.google-earth.kmz | `''` | 為 zip 封裝之 KML,不比照文字檢視器; 同 `shp` 類無工具項 |
  | gpx | data | application/gpx+xml | textviwer | geojson; 無 IANA 登錄,列內 `msg` |
  | dxf | image | image/vnd.dxf | imageviwer | dwg |
  | las | `''` | application/vnd.las | `''` | 無先例; 列內 `msg`(多義) |
  | laz | `''` | application/vnd.laszip | `''` | 無先例 |
  | obj | `''` | model/obj | `''` | stl; 列內 `msg`(多義) |
  | gltf | `''` | model/gltf+json | `''` | glb |
- 對使用端之可觀察影響(新增項目與比對放寬,皆為加法): ①上列 21 個副檔名由 `null` 改回列物件; ②`getFileType('JPG')`、`getFileType('z')` 等大小寫變體由 `null` 改回該列; ③`getFileAccept()` 長度 174 → 195,`getFileAccept('name')` 鍵數 174 → 195,`getFileAccept('acp')` 鍵數 158 → 170(新增 12 鍵,其中 `application/vnd.google-earth.kmz`、`application/vnd.las`、`application/vnd.laszip`、`model/obj`、`model/gltf+json` 5 個因 `group` 為 `''` 而不會出現在任何 `domGetFileAccept` 字串),`group` 與 `exec` 之鍵集合不變; ④`domGetFileAccept` 之字串(集合)**只增不減**: `'image'` / `'common'` 增 `image/svg+xml`、`image/vnd.dxf`,及規則 5 之 `image/heic`(取代原 `image/heif` 之位置; `image/heif` 改由新增之 `heif` 列帶入,出現在新增片段中而非原位置),`'data'` / `'common'` 增 `text/markdown`、`application/yaml`、`text/tab-separated-values`、`application/vnd.google-earth.kml+xml`、`application/gpx+xml`,`'docums'`、`'compress'` 不變;`domGetFileAccept(['svg'])` 等以副檔名為 kind 者由 `''`(不限)改為對應 acp.
- 軸: 副檔名(既有 174 / 新增 21 / 未收錄) × 大小寫(原樣 / 全大寫 / 混合 / `Z` 與 `z`) × 輸入型別(有效字串 / `''` / `undefined`) × 衍生(`getFileType()` 全表 / `getFileAccept` 位置與分組 / `domGetFileAccept` 各 kind).
- 裁示紀錄(2026-10-20 主控複審第 1 次執行報告〈6. 待裁示〉): ①`heic` 之 `acp` 改 `image/heic`——**已於第 2 次執行實作**(規則 5); ②`las` 為多義副檔名(光達點雲 LASer 與井測資料 Log ASCII Standard 文字檔同用),維持 `application/vnd.las`(光達),列內 `msg` 已註記,使用端若收井測資料需自行判斷; ③`dxf` 維持 `group: 'image'`(比照 `dwg`),`image/` 開頭之 `acp` 不代表瀏覽器能以 `<img>` 呈現(`dxf`、`tiff`、`heif`、`dwg`、`psd`、`tif`、`heic` 皆然),下游以白名單判斷,由主控於 issue 結案留言提醒(外審 F2); ④`domGetFileAccept` 之 `kind` 與 `getFileAccept('name')` 之分組鍵對副檔名仍區分大小寫(`filter(data, { name })`、以表內 `name` 為鍵,故 `getFileAccept('name')['z']` 為 `undefined`),與 `getFileType` 不一致——**本次不改**(測試不鎖定此行為,以免凍結未定案之語意); ⑤Unicode 大小寫維持 `toLowerCase`(見已知限制); ⑥`getFileAccept` 以 `in` 判鍵——**已於第 2 次執行實作**(規則 6).
- 已知限制: 比對用 `String.prototype.toLowerCase`,Unicode 大小寫對應會使少數非 ASCII 字元等同 ASCII 字母——`'m\u212Av'`(U+212A 開爾文符號)得 `mkv` 列(其他單字元 `İ`、`ı`、`ſ` 等不誤中); 檔案副檔名實務上不會出現,不處理(要完全限 ASCII 需改為只轉 `A-Z`,屬額外行為; 主控裁示維持 `toLowerCase`)(外審稱「不誤中」不實,本次自行實測).
- 測試: `test/getFileType.test.mjs`(既有項目逐項不變、表尾新增 21 項逐項且順序相同、不分大小寫全表、鍵唯一性與不得為 `Object.prototype` 成員)、`test/getFileAccept.test.mjs`(位置、分組、群組成員順序;規則 6: 表內暫時加入值為 `Object.prototype` 成員名之列〔`name`/`acp`/`group`/`exec` 四種分組鍵各 7 個名稱加一個重複〕不拋錯且為自有鍵,回傳物件原型仍為 `Object.prototype`,加列後必還原)、`test/domGetFileAccept.test.mjs`(accept 字串集合只增不減、既有片段順序、`heic` 為 `image/heic`);修前基準表 `test/tools/getFileTypeBase.mjs`(修前 174 列原樣,產自 `a29cb722b` 之 `src/getFileType.mjs`,與 `git show HEAD:src/getFileType.mjs` 之全表逐列相同; 具名匯出 `changes` 明列規則 5 之唯一差異,`applyChanges(base)` 為既有項目之期望值).指令: `npx mocha --no-parallel test/getFileType.test.mjs test/getFileAccept.test.mjs test/domGetFileAccept.test.mjs --timeout 180000`.
- 測試數與修前紅(2026-10-20): 三檔共 51 案(修前 5 案); 對未修 `src/getFileType.mjs` 跑 51 案中 33 紅 18 綠(紅: 新增 21 項逐項 + 表尾 + 全表長度 + `z`/`Z` + 大小寫全表 + 混合大小寫 + 包裝字串 + `name` 原樣 + `getFileAccept` 群組成員 + `domGetFileAccept` 之 image / data / common / 副檔名 kind; 綠為「既有項目不變」等鎖定,修前即綠;以暫換 HEAD 舊版 `src/getFileType.mjs` 實測,腳本 `tmp/run01/redOnHead.mjs`,還原後 sha256 回驗).全套 `npm test` 16479 → 16525 passing(+46)、0 failing、4 pending(外審後最終跑).另以 HEAD 舊版對 802 個輸入(195 鍵 × 4 種大小寫變體 + 雜項 + 非字串 + 包裝字串; 腳本 `tmp/run01/diffOld.mjs`)逐項比對,外審另以 1,589 個系統性輸入加 20 萬筆隨機輸入比對: 凡修前回非 `null` 者修後回同一列(0 例相異),差異只有 `null` → 列(新增項目與大小寫變體).
- 變異(2026-10-20,逐項改壞 `src/getFileType.mjs` 跑三檔測試,try/finally 還原並以 sha256 回驗; 腳本 `tmp/run01/mutate.mjs` 暫存不入庫): **31 項中 30 項轉紅、1 項等價存活**(比對改用 `toUpperCase`).轉紅者: 不分大小寫改回精確比對、只轉輸入/只轉表內、命中判定壞掉、刪新增項、改 acp/group/exec(新增與既有各數項)、`Z` 改名、大寫重複鍵、移到表頭、表尾列彼此對調(md/markdown、yaml/yml、svg/heif、jpeg/jpe、kml/gpx)、表尾加 `constructor` 列、`gpx` 拿掉 `msg`.
- 外審(2026-10-20,minimax `opencode/minimax-m3.1-flash-free` xhigh,副本放 `tmp/run01/review/`,提示詞以功能正確性措辭): 8 條. 屬實並已改者: F1 表尾列順序未被測試鎖定(3 個對調變異存活; 改為表尾逐列相等並補 `text/markdown`、`application/yaml` 群組順序案)、F2 `dxf` 歸 `image` 之呈現影響未列(補待裁示 ④)、F3 `getFileAccept('name')` 鍵仍區分大小寫(補待裁示 ③,並移除測試中凍結此行為之斷言)、F4 帳本影響清單漏列群組化鍵集合變化(補)、F5 既有潛在缺陷 `getFileAccept` 以 `in` 判鍵(第 1 次執行補規則 1 與測試而不改 `getFileAccept`; 第 2 次執行依主控裁示改為自有屬性,見規則 6)、F6 規則 4 `msg` 通則敘述超出範圍(改為僅述本次新增列).誤報/不採: F7(`建議wsemi修正.md` 為主控交付之建議書,依指示不刪)、F8(外審時 `sgud/exp/experience.md` 尚未補寫,現已補).外審稱 Unicode 特殊字元皆不誤中不實(U+212A 開爾文符號會使 `mkv` 等含 `k` 之鍵命中,見已知限制).
- 第 2 次執行(2026-10-20,主控裁示 1、6)之測試與變異: 三檔共 58 案(第 1 次執行後 51 案,+7: `heic`/`heif` 1、`getFileAccept` 規則 6 共 6〔四種分組鍵、原型、還原〕,另改寫既有案之期望值為「基準表 + `changes`」).實作前跑(src 未改): 58 案中 12 紅 46 綠(紅: 全表前 174 列、逐鍵查詢、`heic`/`heif`、`getFileAccept` 前 174 列與 acp 群組、四種分組鍵之 `TypeError: r[k].push is not a function`、`domGetFileAccept` 之 image / common / 副檔名 kind); 實作後 58 passing; eslint 改動檔 exit 0; 全套 `npm test` 16535 passing、0 failing、4 pending(第一次跑 2 案 `domDetect` 計時案失敗〔與本次改動無關,單檔重跑另一案偶發失敗,再跑全套 0 failing〕).變異: `src/getFileAccept.mjs` 8 項(判鍵改 `in`、改回 `haskey`、`=== undefined`、拿掉判鍵、回傳無原型物件、判鍵反向、判鍵查錯物件、`push` 改 `unshift`)**全數轉紅**; `src/getFileType.mjs` 33 項(第 1 次執行 31 項中 `heic` 一項改為「改回 `image/heif`」,新增 `heif` 改 `image/heic`、`heic` 改 `group`,`constructor` 列改為 `__proto__` 列)**32 項轉紅、1 項等價存活**(`toUpperCase`).腳本 `tmp/run01/mutate.mjs`、`mutate2.mjs`(暫存不入庫).本次不派外審.
- 變更紀錄:
  - 2026-10-20: 新增 21 項、`getFileType` 不分大小寫(issue #7); 規則與破壞性變更紀錄第 34 條.
  - 2026-10-20(第 2 次執行,主控裁示): `heic` 之 `acp` 改 `image/heic`(規則 5); `getFileAccept` 判鍵改自有屬性(規則 6); 破壞性變更紀錄第 34 條補 ③④.
