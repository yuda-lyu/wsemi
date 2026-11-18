# 狀態(結構運算與參數定義)

本檔記排程第 492 項第 7 批(結構運算與參數定義)之**現況**;過程見 `sgud/exp/experience.md`,規則見 `sgud/rule/rulebook_struct7.md`,破壞性變更見 `sgud/rule/rulebook_breaking_74on.md` 第 75 項.

## 第 492 項第 7 批:結構運算與參數定義(ws492h,2026-11-19;主控任務 20261116102625;package.json version 1.9.67 之工作樹,未提交未發布)〔本節於 2026-11-19 新增〕

### 現況

| 項 | 現況 | 規則 | 主要測試 |
|---|---|---|---|
| W-16乙 C7 第 1 參數無效回空結果(11 函數) | 已套: `arrDiff`／`matDiff`／`ltdtDiff` 回 `{ diff: [], dfs: [] }`;`arrFilterByENum`／`arrReverse`／`arrSep`／`ltdtpull`／`matConcat`／`matat`／`treeToFilepath` 回 `[]`;`objSortByKeys` 回 `{}`;第 1 參數先判、不檢查其餘參數;次參數與元素層仍拋.`treeObj`／`arrFind`／`filepathToTree`／`ltdtDiffByKey` 核實現況即符合,程式不改 | R-STRUCT-ARG1-01 | `test/structBatch7.test.mjs`「W-16乙」節;各函數既有測試檔 |
| W-19 單一空元素(18 函數) | 已套 13 函數(`arrGroupByMaxmin`、`arrLookupByMaxmin`、`arrPull`、`arrPullAt`、`arrReduce`、`arrReverse`、`arrSep`、`arrSort`、`binstr`、`convertToTree`、`flattenToConn`、`getExcelU8ArrFromData`、`strFindFuzz`);核實原即不丟棄 5 函數(`addExcelWorksheetFromData`、`arrInsert`、`flattenTree`、`objSortByKeys`、`treeToFilepath`) | R-ELEM-LEVEL-03 | `test/structBatch7.test.mjs`「W-19」節 |
| W-07 `arrSep` | 已套: 只收設定物件,舊式整數寫法移除,`numCount`／`numGroup` 二擇一必給 | R-ARRSEP-OBJ-01 | `test/arrSep.test.mjs`(改寫)、`test/intInputHang.test.mjs` |
| W-13 超出範圍改預設 | 已套: `domDrag.timeDragStartDelay` 負數 → 120;`domConvertToPic.scale` 小於 1 → 1(不 reject);`color.spreadHue`／`spreadMonochromatic` 之 `num`(整數)超出 1~4294967295 → 1 且依 `fmtOutput` 轉出 | R-OPT-RANGE-01 | `test/structBatch7.test.mjs`「W-13」節、`test/domDrag.test.mjs`、`test/optValG7dom.test.mjs` |
| N-B 19 列 | 逐函數核對現行碼(19 個函數): 12 個前批已處理(行號見 R-OPT-RANGE-01 表),7 個本批改(`binstr.mode`、`strFindFuzz.strkey`、`arrSep`、`getTimeBetween.unit`／`getTimeObject.unit`、`getDataFromExcelFileU8Arr`、`getFileAccept.groupBy`) | R-OPT-RANGE-01 | `test/structBatch7.test.mjs`「N-B」節、`test/getDataFromExcelFileU8Arr.test.mjs` |
| W-06 簽名／JSDoc／行為一致 | 已套: `domCompareText.title` 為必須參數(無效拋 `invalid title: must be a non-empty string`);`execCliJsonRpc.requests` 為 opt(非陣列視為 `[]`);其餘 `domTooltip`／`domTriggerEvent`／`fsCreateFile*`／`bodyLog`／`domShowImages`／`domShowInputDatatime` 核實一致不改;`pmMap`／`pmSeries`／`pmChain` 批 6 已處理 | R-OPT-RANGE-01 規則 4 | `test/structBatch7.test.mjs`「W-06」節、`test/domCompareText.test.mjs`、`test/execCliJsonRpc.test.mjs` |

### 驗證(最近一次: 2026-11-19)

- 全套 `npm test`: 32808 passing／8 pending／0 failing(前一批基準 32395／8／0,淨增 413);新檔 `test/structBatch7.test.mjs` 398 案,改期望之既有測試檔 18 個(`arrReverse`、`arrFilterByENum`、`arrSep`〔重寫〕、`matat`、`ltdtpull`、`matConcat`、`matDiff`、`arrDiff`、`ltdtDiff`、`objSortByKeys`、`treeToFilepath`、`elemLevelRulesB3`、`intInputHang`、`execCliJsonRpc`、`getDataFromExcelFileU8Arr`、`optValG7dom`、`domDrag`、`domCompareText`).
- 修前紅: 18 個新與改之測試檔對 `git archive HEAD src` 副本 2095 案中 686 紅;對新碼 0 紅.
- 變異: 49 項,48 擊殺,1 等價(`arrSort` 之 `vall.length === 0` 捷徑).
- 獨立複審: sonnet 子代理唯讀,14 條: 採 4(`domCompareText.title` 依判定原則改必須參數、`strFindFuzz` JSDoc 對 `[{}]`／`[NaN]` 之描述、`arrReverse` 孤兒 import、舊帳本標註更新)、已載 1(`color` `num` 為 1 之回傳型別改變入破壞性第 75 項)、維持語意 3(`arrLookupByMaxmin` 單一空元素回 `[]`、`domTooltip.content` 批 4 裁定、`arrSort` 單元素回同參照為既有)、列回饋 3(`strFindFuzz` 非字串關鍵字與 `bscore`、`arrSep`／`color` 之 4294967295 配置量、其餘 `isearr` 站點)、列待裁示 2(`color` `num` 之「無效」是否含型別不符、`treeObj`／`arrFind` 之逐字適用)、範圍外 1(`arrMax`／`arrMin` 第 1 參數仍拋).

### 已知缺口與待裁示

- `color.spreadHue`／`spreadMonochromatic` 之 `num` 為非整數或非數字(必須參數)仍拋 `invalid num: must be an integer`;若「無效用預設」含型別不符,須改 `toCount` 對任何非 `iseint(num, { use: 'count', min: 1 })` 一律回 1.
- `arrFind('abc', 'abc')` 回 `[0]`(JSDoc 明載純量自動轉陣列);若 W-16 逐字適用於 `arrFind` 則改 `[]`.
- `strFindFuzz` 非字串非有限數字之 `strkey`(`Infinity`、布林、函數、物件)回 `true`;`bscore` 以真值判斷(回饋列).
- `arrSep` `numGroup: 4294967295`、`color.spread*` `num: 4294967295` 之配置量(既有,回饋列).
- `domIsStable.timeDiff` 負數仍視為 0(同 W-13 之類型,未列入,回饋列).
- `src/` 仍有 `isearr` 站點(`attstr`、`estimateTicks`、`ltdt2vrtsable`、`ltdtpick`、`domGetFileAccept`、`fsMergeFilesCore`,及不改之 `arrFilterBy*Num`)——不在 W-19 之 18 函數內,未逐一裁定.
- `arrSort` 單元素(`size === 1`)回傳輸入陣列本身(同參照),非複本(既有行為).
- `sgud/rule/rulebook.md`(約 34KB)、`sgud/exp/experience.md`(約 44KB)、`sgud/feedback/feedback.md`(約 43KB)已逾整理門檻,待單獨一輪整理.
