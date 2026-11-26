# 狀態(讀取 Excel)

本檔收排程第 670 項(Gitea #221)之現況;只記現況、不寫過程(過程見 `sgud/exp/experience.md`).索引見 `sgud/state/state.md`.

## `getDataFromExcelFileU8Arr` 新增 `opt.keepEmptyHeader`(排程第 670 項,t670,2026-11-26;package.json version 1.9.80 之工作樹,未提交未發布)

- 現況(已實作): `fmt:'ltdt'` 時表頭為空白(空 cell 或轉字串後為 `''`)之欄位,預設(未給、`false`、非布林)整欄跳過(行為不變);`opt.keepEmptyHeader: true` 時由左至右依序命名為 `__EMPTY`、`__EMPTY_1`、`__EMPTY_2`…並保留其值,序號與表頭列內任一真實表頭(含右側者)相同時續增至不重複、真實表頭不改名、序號單調遞增不回補、各分頁各自起算.非布林(`'true'`、`1`、`'y'`、`null`、`new Boolean(true)` 等)視為未給取預設 `false`(K3、V5、K5).只影響 `fmt:'ltdt'`,`'array'`、`'csv'` 本就保留全部欄位.內部單一擁有者 `nameEmptyHeads`(`src/getDataFromExcelFileU8Arr.mjs`);`opt` 讀取於 `getDataFromExcelFileU8Arr` 一處.
- 規則: `sgud/rule/rulebook_data.md` R-EXCEL-READ-01 規則 5、6(含軸、已知限制、測試、變更紀錄).
- 測試: `test/getDataFromExcelFileU8Arr.test.mjs` 新增 `describe('opt.keepEmptyHeader …')` 21 案(原 25 案,共 46 案);`test/tools/buildXlsx.mjs` 新增選用之 `opt.merges`(組合併儲存格,不給時輸出不變,只此測試檔使用).指令: `npx mocha --no-parallel test/getDataFromExcelFileU8Arr.test.mjs --timeout 180000`.
- 驗證(2026-11-26): 新測試檔於修前版(鏡像根)46 案為 32 passing／14 failing(皆斷言失敗,無載入失敗;修前即綠之 7 案為夾具鑑別力、預設不變、無空表頭無作用、無列或只有表頭列、array／csv 不受影響、非布林視為未給、opt 非物件);修後 46 passing.變異 20 項全被新測試擊殺(序號跳號、起算序號、不檢碰撞、只避左側真實表頭、預設改 true、非布林當 true、序號與碰撞集合跨分頁共用、空白字元當空表頭、一律／永不命名、重複表頭一併處理、命名欄補空字串、array 受影響、鍵名誤植、碰撞檢查只做前 4 個序號、改名真實表頭、寫回呼叫端 opt),改前舊測試檔僅擊殺其中 2 項(預設改 true、一律命名).全套 `npm test`(`quiet-run --lock`,約 2.5 分): 34024 passing／8 pending／0 failing(離開碼 0);發布包配置(`npm pack` 解開後於其根跑 `npm test`,`node_modules` 以目錄連接點接本庫)同為 34024／8／0,兩配置之 8 項 pending 名單逐字相同(皆平台或環境條件之略過).相關 13 個測試檔(各 Excel 讀寫函數、`getCsvStrFromData`、`isDate`、`isDateStrict`、`jsdocFixes`、`structBatch7`)1219 passing.eslint 改動之 3 個 JS 檔 0 項.獨立複審(唯讀,另以修前版、新版與獨立參照實作差分 fuzz 800 例 0 差異)無阻擋性缺陷,其建議已採(合成資料通用化與逐筆相異、補資料列較表頭列寬／同一分頁碰撞／不改寫 opt 三案、行號與盤點敘述更正).
- 已知缺口: 重複表頭(兩欄以上表頭文字相同)於 `fmt:'ltdt'` 仍後者覆蓋前者、前者之值遺失,本參數不處理(使用端另案,排程第 671 項;改寫時須連同測試 `should leave duplicate headers as is …`);`opt.debug` 警告於本函數未實作(`fmt`、`valueToString`、`keepEmptyHeader` 皆然,既有處置);非物件 `opt` 視為 `{}`(既有處置).
- 下游: 使用端要取回空表頭之欄須自行傳 `keepEmptyHeader: true`;README、`dist/`、`docs/` 未動(發布時重產).
