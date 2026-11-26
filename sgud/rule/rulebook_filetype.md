# 規則帳本(副檔名對照表)

本檔 2026-11-27(wsr1,排程第 599 項①)自 `sgud/rule/rulebook_data.md`(原約 35.6KB)依類型抽出:節號與標題不變、內容逐字搬移;全部條目之索引見 `sgud/rule/rulebook.md`〈索引〉.

## R-FILETYPE-01 getFileType 副檔名對照表: 鍵為小寫副檔名、比對不分大小寫、新增項目附於表尾、既有項目逐項不變

- 依據: Gitea issue #7(使用端,2026-10-20;建議檔 `建議wsemi修正.md`);基準 wsemi 1.9.22(實測 21 個副檔名與 `getFileType('z')` 皆回 `null`).
- 單一擁有者: `src/getFileType.mjs` 之 `fts`.`getFileAccept`(取全表、依欄位群組化)與 `domGetFileAccept`(經 `getFileAccept()` 依 `group` / `name` 組 `<input accept>` 字串)皆由其衍生,不另建副檔名表.
- 盤點指令: Grep `getFileType|getFileAccept|domGetFileAccept`(本機全部自有套件庫下,`*.{mjs,js,vue,ts,cjs}`,2026-10-20 命中: wsemi `src/getFileType.mjs`、`getFileAccept.mjs`、`domGetFileAccept.mjs`、`domShowInputAndGetFiles.mjs`(僅 JSDoc 提及)、`index.mjs`、`test/getFileType.test.mjs`、`test/getFileAccept.test.mjs`、`test/domGetFileAccept.test.mjs`、`dist/wsemi.umd.js`,及 w-tmper-docx 之 `dist` 內嵌 wsemi 副本;**無任何呼叫端以 `null` 判斷後走特殊流程**——唯一依 `null` 者為使用端(不在自有套件庫內)).
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
