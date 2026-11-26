# 規則帳本(結構運算與參數定義:第 492 項第 7 批)

本檔記排程第 492 項第 7 批(ws492h,2026-11-19)之規則.規格依據: dspec〈輸入參數之檢測機制〉§11〈C7 結構運算之第 1 參數(使用者 2026-11-16「W-16:乙」)〉、第三批「單一空元素不再當空陣列」、〈W-13 超出範圍〉、〈N-B opt 數值與 K3、V4〉、第 221 項第 5 項「由此之判定原則」、處理原則 14;盤點依據為 wsinv 報告 W-06、W-07、W-13、W-16、W-19、N-B.全部條目之索引見 `sgud/rule/rulebook.md`〈索引〉;破壞性變更見 `sgud/rule/rulebook_breaking_74on.md` 第 75 項;現況見 `sgud/state/state_結構運算與參數定義.md`.

## R-STRUCT-ARG1-01 C7 結構運算之第 1 參數型別不對,一律回輸出型別之空結果,不拋錯

### 規則

1. **第 1 參數(資料本體)非陣列(`arrFind`、`filepathToTree`、`ltdtDiffByKey` 另含物件)——含未給、`null`、字串、數字、布林、函數、`Symbol`、`BigInt`、包裝物件、`Date`、`Map`、類陣列物件——回輸出型別之空結果,不拋錯**;空陣列等空資料照常處理(空資料不是錯誤).
2. **第 1 參數無效時先回空結果,不檢查其餘參數**(第 1 參數 → 次參數之序);第 1 參數有效後,**次參數依各函數既有裁定**(`arrDiff.arrNew`、`matDiff.matNew`、`ltdtDiff.ltdtNew`、`ltdtpull.ltdtDel`／`key`、`matConcat.mat2`、`matat.istart`、`arrSep.opt`、`objSortByKeys.keys` 仍拋固定訊息).
3. **元素層(陣列內之無效元素)依第二批「元素層依用途」不變**(`matat`／`matConcat`／`matDiff` 之 `row[i]`、`ltdtDiff`／`ltdtpull` 之元素、`treeToFilepath` 之 `data[i]` 仍拋).
4. 空結果之形狀(每次回傳新物件): `arrDiff`／`matDiff`／`ltdtDiff` 為 `{ diff: [], dfs: [] }`;`arrFilterByENum`／`arrReverse`／`arrSep`／`ltdtpull`／`matConcat`／`matat`／`treeToFilepath` 為 `[]`;`objSortByKeys` 為 `{}`;`filepathToTree` 為 `{ treeItems: [], treeItemsFolder: [], kpPath: {}, fpsNormalize: [] }`;`ltdtDiffByKey` 為 `{ del: [], add: [], same: [], diff: [], infor: {} }`.
5. **現況即符合、不改程式者**: `filepathToTree`、`ltdtDiffByKey`(早已回空結果);`treeObj`(`data` 為任意值,傳入 hook,從未拋錯,無「原拋錯」可改);`arrFind`(JSDoc 明載 `vall` 為 `String|Number|Object|Boolean|Array` 並自動轉陣列,`undefined`／`null`／`''`／`NaN`／`{}` 回 `[]`,純量被包成單元素,非型別不對).待裁示: 若要逐字適用,`arrFind('abc', 'abc')` 將由 `[0]` 改 `[]`.

### 站點全集與盤點

- 改為回空結果(11): `arrDiff`、`arrFilterByENum`、`arrReverse`、`arrSep`、`ltdtDiff`、`ltdtpull`、`matConcat`、`matDiff`、`matat`、`objSortByKeys`、`treeToFilepath`.
- 盤點指令: `Grep pattern="throw new Error\('invalid [A-Za-z0-9]+: must be an (array|object)'\)" path=src glob=*.mjs`,2026-11-19 之預期全集為 8 處: 次參數 `arrDiff.mjs`(`arrNew`)、`ltdtDiff.mjs`(`ltdtNew`)、`ltdtpull.mjs`(`ltdtDel`)、`matConcat.mjs`(`mat2`)、`matDiff.mjs`(`matNew`)、`objSortByKeys.mjs`(`keys`),以及 `arrMax.mjs`、`arrMin.mjs`(由陣列算出單一數值之彙總,屬第一批數值計算之裁定,第 1 參數非陣列仍拋,不在本規則).新增拋錯站點不在此全集即為偏離.

### 測試

- `test/structBatch7.test.mjs` 之「W-16乙」節(13 函數 × 16~18 種無效第 1 參數、每次新物件、次參數仍拋、元素層不變、已符合者之鎖定);各函數既有測試檔之改期望(`arrReverse`、`arrFilterByENum`、`arrSep`、`matat`、`ltdtpull`、`matConcat`、`matDiff`、`arrDiff`、`ltdtDiff`、`objSortByKeys`、`treeToFilepath`、`elemLevelRulesB3`).

## R-ELEM-LEVEL-03 單一空元素之陣列(`[null]`、`[undefined]`、`['']`、`[{}]`、`[[]]`、`[NaN]`)視為一個元素,不得被當成空陣列而丟棄

### 規則

1. **參數層判定一律 `isarr`＋長度**(同 R-ELEM-LEVEL-02 規則 2),不得以 `isearr` 把單一空元素當空陣列;空陣列 `[]` 之結果維持原狀.
2. 逐函數處置(依各函數語意): 保留 — `arrReverse`、`arrSep`(numCount／numGroup 皆含該元素)、`arrSort`(單一元素原樣回傳;`null` 依 N1 放最末,只有一個時即其本身;`returnIndex` 回 `[0]`)、`arrPull`(`vall` 之單一空元素保留;`vpull` 之 `[null]`／`['']` 為一個待移除值,單值 `''` 亦同,`{}` 以參照比對故不移除)、`arrPullAt`(`vall` 保留);佔位/呼叫 — `arrReduce`(對該元素呼叫 `fun` 一次)、`flattenToConn`(轉出一個節點)、`convertToTree`(轉出含一個子節點之樹);略過非有效數字 — `arrGroupByMaxmin`(`arr`: 各組皆無 `items`);拋錯 — `arrGroupByMaxmin`／`arrLookupByMaxmin` 之 `maxmins`(設定缺上下限,同 `[null, null]`);Excel 失敗通道 — `getExcelU8ArrFromData`(不再回 `{ error: 'no data' }`,依一般流程轉換,結果同多個空元素);結果與多個空元素相同者(非被當空陣列) — `binstr`(`keys` 之無效元素回 `false`)、`strFindFuzz`(`arr` 依 `join` 串成文字,`strkey` 為 `''` 時回 `true`／`100`)、`arrLookupByMaxmin`(`arr`: 首元素須為有效物件之既有規則,回 `[]`).
3. **核實原即不丟棄、不改程式**: `addExcelWorksheetFromData`(守門為 `isarr`)、`arrInsert`、`flattenTree`(無 `id` 之節點本即不輸出,單一與多個空元素同為 `[]`)、`objSortByKeys`(`keys` 之非字串數字元素略過,不影響其餘鍵)、`treeToFilepath`(`[null]` 等拋 `data[0]`,`[{}]` 回 `[]`).
4. 不改: `arrFilterByNum`／`arrFilterByPnum`／`arrFilterByPnumAndToLog`(濾除 `null` 屬正常).

### 站點全集與盤點

- 盤點指令: `Grep pattern="isearr\(" path=src glob=*.mjs`,2026-11-19 之預期全集: `arrFilterByNum`、`arrFilterByPnum`、`arrFilterByPnumAndToLog`(不改)、`attstr`(2)、`domGetFileAccept`(2)、`estimateTicks`、`fsMergeFilesCore`、`getCsvStrFromData`(空陣列另判)、`ltdt2vrtsable`、`ltdtpick`——本批 18 函數已無 `isearr`;其餘站點不在 W-19 之 18 函數內,未逐一裁定(`attstr`、`estimateTicks`、`ltdt2vrtsable`、`ltdtpick` 待後續批).

### 測試

- `test/structBatch7.test.mjs` 之「W-19」節(18 函數 × 6 種單一空元素,另含空陣列不變、`arrPull` 單值、`getExcelU8ArrFromData`、已不被吞者之鎖定、JSDoc 鎖定);各函數既有測試檔(`arrReverse`、`arrSep`)之改期望.

## R-ARRSEP-OBJ-01 `arrSep` 之 `opt` 只收設定物件(`numCount`／`numGroup` 二擇一必給)

- **規則**: `opt` 須為設定物件;整數(舊式 `arrSep(arr, 3)`)、字串、陣列、`null`、未給一律拋 `invalid opt: must be an object with numCount or numGroup`(處理原則 14,第 223 項併結;下游 0 站點);`numCount`(每組個數上限)與 `numGroup`(組數)各以 `iseint(x, { use: 'count', min: 1 })` 判定、判定通過後取 `Number` 值使用(每鍵只讀一次,K4),兩者皆無效(含空物件)拋 `invalid opt.numCount or opt.numGroup`(V10),皆有效採 `numCount`;檢測順序為 `arr`(非陣列回 `[]`,不檢查 `opt`)、`opt`(與 `arr` 有無資料無關)、單一空元素(R-ELEM-LEVEL-03).
- **已知**: 上限 4294967295 為 `use: 'count'` 之合法值,`numGroup: 4294967295` 會預建該個數之空陣列(配置量隨值,既有行為,使用端自負);`numCount: 4294967295` 之內層迴圈亦隨值.

## R-OPT-RANGE-01 範圍型 opt 超出範圍視為未給,改用預設(K3);帶預設值之位置參數視同 opt

### 規則

1. **超出範圍亦同**(使用者 2026-10-31 K3;本批 W-13): `domDrag.opt.timeDragStartDelay` 負數(原視為 0)改預設 120;`domConvertToPic.opt.scale` 小於 1(原 `Promise.reject('opt.scale can not less then 1')`)改預設 1;`color.spreadHue`／`spreadMonochromatic` 之 `num`——**必須參數**,非整數與非數字仍拋 `invalid num: must be an integer`(V19),整數但超出 1~4294967295(0、負數、超過上限;修前超過上限者迴圈無上限而耗盡記憶體)視為未給改用預設 1,回傳只含輸入色一色之陣列且**依 `fmtOutput` 轉出**(修前回未轉出之 rgba 物件且不檢測 `fmtOutput`).
2. **帶預設值之位置參數視同 opt**(K2/K3): `binstr.mode`(非 `'anyone'`／`'all'` → `'anyone'`)、`getTimeBetween.unit`／`getTimeObject.unit`(不在 `years`／`months`／`days`／`hours`／`minutes`／`seconds` → `'days'`,判定用 `getTimeFromUnit(unit) !== ''`)、`getFileAccept.groupBy`(不在 `''`／`name`／`group`／`acp`／`exec` → `''`,不群組化).`getDataFromExcelFileU8Arr` 之 `opt.fmt`(非 `ltdt`／`csv`／`array` → `'ltdt'`)與 `opt.valueToString`(非布林 → `true`)非安全相關,由回 `{ error }` 改用預設.`strFindFuzz.strkey` 之有限數字依其字串寫法(`3` 與 `'3'` 同).
3. **安全相關者不適用**(W-08／W-09,給了而無效即拒絕): `fsGetBinManifestEntry` 之 `name`／`path`／`url` 維持拒絕.

### N-B 19 列處置(2026-11-19 以現行碼逐列核對)

| 函數 | 處置 | 現行碼 |
|---|---|---|
| `fsGetBinManifestEntry` | 已處理(安全相關,W-08/W-09 拒絕;批 3) | `src/fsGetBinManifestEntry.mjs:92-113` |
| `domAlert` | 已處理(W-14,批 4) | `src/domAlert.mjs:324` |
| `domCompareText` | `format` 已處理(批 4);`title` 本批改為必須參數(R-OPT-RANGE-01 規則 4) | `src/domCompareText.mjs:30-48` |
| `domFadeIn`／`domFadeOut` | 已處理(`optVal`,批 4) | `src/domFadeIn.mjs:8-52`、`src/domFadeOut.mjs:8-52` |
| `domGetBoudRectRefSelf`／`domIsClientXYIn` | 已處理(`isenum`＋`cdbl`,ws492a) | `src/domGetBoudRectRefSelf.mjs:38-42`、`src/domIsClientXYIn.mjs:36-39` |
| `domGetFiles` | 已處理(批 4) | `src/domGetFiles.mjs:28-31` |
| `domScrollIntoView` | 已處理(`_scrollOpt`,批 4) | `src/_scrollOpt.mjs`、`src/domScrollIntoView.mjs` |
| `domShowImages` | 已處理(`eleGroup` K3,批 4) | `src/domShowImages.mjs:108-110` |
| `downloadFileFromText` | 已處理(`withBOM`,批 4) | `src/downloadFileFromText.mjs:40-42` |
| `execCliCore` | 已處理(`buildSpawnEnv`,批 2) | `src/execCliCore.mjs:395-418` |
| `binstr` | 本批改(`mode`) | `src/binstr.mjs:29-32` |
| `strFindFuzz` | 本批改(`strkey` 數字) | `src/strFindFuzz.mjs:66-69` |
| `arrSep` | 本批改(R-ARRSEP-OBJ-01) | `src/arrSep.mjs:72-99` |
| `getTimeBetween`／`getTimeObject` | 本批改(`unit`) | `src/getTimeBetween.mjs:36-40`、`src/getTimeObject.mjs:52-56` |
| `getDataFromExcelFileU8Arr` | 本批改(`fmt`、`valueToString`) | `src/getDataFromExcelFileU8Arr.mjs:244-254`(第 670 項新增之 `keepEmptyHeader` 另在 `:256-260`) |
| `getFileAccept` | 本批改(`groupBy`) | `src/getFileAccept.mjs:33-42` |

### W-06 簽名、JSDoc、行為一致(依第 221 項第 5 項判定原則)

4. **簽名預設或 JSDoc `[]` 才算 opt;程式碼回退不單獨作依據**: `domCompareText.title`(簽名無預設、JSDoc 未標可選)為**必須參數**,非非空字串同步拋 `invalid title: must be a non-empty string`,先於任何 DOM 變動(檢測順序 `ele`、`title`、`strOld`、`strNew`;批 4 之 K3 回退 `'Text'` 移除);`execCliJsonRpc.requests`(簽名預設 `[]` 且 JSDoc `[requests=[]]`)為 **opt**,非陣列(含 `null`)視為未給改 `[]`(同 `args`;原回 `errorType: 'params'`、`'requests 須為陣列'`),陣列內元素不符仍以 `params` 回報.已核實一致、不改: `domTooltip`(`[content]`,給了而非字串依批 4 裁定拋錯)、`domTriggerEvent`、`fsCreateFile`／`fsCreateFileCore`(`[data='']`)、`bodyLog`(`...c`)、`domShowImages`(`[eleGroup=null]`)、`domShowInputDatatime`(`[time='']`);`pmMap`／`pmSeries`／`pmChain` 批 6 已處理.

### 測試

- `test/structBatch7.test.mjs` 之「W-13」「N-B」「W-06」節;`test/domDrag.test.mjs`(負數延遲改預設 120,〔`opt.timeDragStartDelay`〕`defineOptParamAsync` 之 `extraInvalid`)、`test/optValG7dom.test.mjs`(`scale` 小於 1 改預設 1)、`test/getDataFromExcelFileU8Arr.test.mjs`、`test/execCliJsonRpc.test.mjs`、`test/domCompareText.test.mjs`.

## 驗證

- 修前紅: 把本批之測試檔(18 檔,工作樹之測試)對 `git archive HEAD src`(`./tmp/ws492h/head`)跑,2095 案中 686 紅;修後同 18 檔綠.
- 變異: 49 項(腳本於副本逐項改回舊寫法,測試轉紅為擊殺),48 項擊殺,1 項等價(`arrSort` 之 `vall.length === 0` 捷徑,拿掉後空陣列仍經後續流程回 `[]`,結果相同).
- 獨立複審: sonnet 子代理唯讀複審(契約與新舊碼,不給結論),14 條,見報告.
