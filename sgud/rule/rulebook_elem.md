# 規則帳本(結構函數之元素層級與自有鍵)

本檔記排程第 430 項第二批(ws430b,2026-11-14)之規則 R-ELEM-LEVEL-01.規格為使用者 2026-11-14 逐函數之裁定(主控任務 20261114175457〈裁定表〉)與主控 dspec〈輸入參數之檢測機制〉§11〈第二批〉、§4(`opt.debug`)、§6(訊息不帶值).全部條目之索引見 `sgud/rule/rulebook.md`〈索引〉;破壞性變更見 `sgud/rule/rulebook_breaking_65on.md` 第 66 項.

## R-ELEM-LEVEL-01 結構函數:參數層回空結果、元素層依用途拋錯或佔位、鍵只看自有可列舉字串鍵

### 規則

1. **參數層**(第 1 參數非陣列或為 `[]`):回輸出型別之空結果,不拋錯(Q1-c);輸出為物件者回同形之空結果(`filepathToTree` 為 `{ treeItems: [], treeItemsFolder: [], kpPath: {}, fpsNormalize: [] }`).**不得以 `isearr` 把「只有一個無效元素」之陣列(`[null]`、`[{}]`、`['']`)當空陣列**:參數層之判定一律 `isarr`(或 `Array.isArray`)＋長度.
2. **元素層**(陣列內有無效元素):
   - 組樹、比對、轉換類拋錯並指出第幾個(`invalid items[1]: …`、`invalid fps[2].path: …`、`invalid ltdtOld[0]: …`);雙模式函數(`ltdt2vrtsable`)回 error(預設 `[]`、狀態模式 `{ state: 'error', msg }`).
   - 逐列映射與挑選類(`ltdtmapping`、`ltdtpick`)非物件列以 `{}` 佔位、列數不變;`arrFilterByKeywords` 非字串元素為 `{ hasKeyword: false, weight: 0 }`、結果筆數恆等於輸入長度.
3. **鍵一律只看自有可列舉字串鍵**:取值以 `Object.prototype.propertyIsEnumerable.call(o, k)` 判定後 `o[k]`,不以 lodash `get` 解析路徑(`'a.b'`、`'a[0]'` 為欄位名),不取繼承之鍵;迭代以 `Object.keys`.鍵 `'__proto__'` 為自有欄位時,寫入結果一律經 `src/_setOwnKey.mjs`(defineProperty 為自有資料屬性,不改原型).適用:`dtmapping`、`ltdtmapping`、`dtpick`、`ltdtpick`、`getltdtkeys`、`ltdtmerge`(來源列)、`ltdtDiffByKey`(主鍵與 `infor`)、`ltdt2vrtsable`(欄與 `value`)、`composeToTree`(`id`／`parentId`)、`filepathToTree`(`path`／`type`)、`iseobj`(至少一個自有可列舉字串鍵).
4. **欄位名之正規化**(`arr2dt`、`dtmapping`、`ltdtmapping` 之 `keys`;單一擁有者 `src/_normKey.mjs`):`''`、`null`、`undefined`(含空洞)、物件(含陣列、包裝物件)、函數、Symbol 略過;數字(與布林、BigInt)以 `String()` 為欄位名(數字依裁定,布林與 BigInt 同修前).`arr2dt` 略過欄位名時連同其對應之值,其餘配對位置不變、重複者後者覆蓋;`dtmapping` 重複只算一次;`ltdtmapping` 之 `keys` 元素全被略過時視同 keys 無效回 `[]`.
5. **函數值作為填充值或預設值視為 `null`**(不執行、不複製):`arr2dt` 之 `values`、`dtmapping`／`ltdtmapping` 之 `def`;物件之填充值／預設值每個欄位各一份複本(`cloneDeep`).
6. **長度不符而回空結果者之 `opt.debug` 提示**(`arr2dt` 之 values 與 keys、`ltdtmerge` 之 ltdt2 與 ltdt1):`opt.debug === true` 時經 `optVal.readDbg(opt)` 取 `funLog`,以 `_numOpt.warnOnce` 輸出(出口 `funLog(msg, { fn, reason: 'length', key })` 或 `console.warn`;同原因每行程一次,去重鍵 `<fn>|length|<key>`);訊息固定詞彙,只含兩者長度,不含值;只在長度不符時讀一次 opt(V11).
7. **錯誤訊息**:`invalid <名稱>[<索引>](.<欄>): must …`,英文、小寫開頭、不含輸入值(路徑、主鍵值、欄位名皆不帶);拋錯前不輸出任何 console.

### 逐函數處置(裁定表之節號)

| 函數 | 處置 | `src` |
|---|---|---|
| 〈一〉`genClockTZ().formatTime` | 非「至少 12 位數字開頭之原始字串」回 `''`(C3,含數字型戳記) | `genClockTZ.mjs` |
| 〈二〉`arrFilterByKeywords` | 非字串元素不匹配(String 物件視同字串)、筆數恆等於 arr;keywords 無效回同筆數全 `{false,0}`;半形與全形空白分隔;空白關鍵字先剔除、重複去重;`-x` 只排除含者、其餘依一般關鍵字,只有排除者時不含者權重 1;`+a +b` 全部須含;`+a b` 含全部必要即命中、權重只依一般關鍵字(n、k 只計一般,可為 0;主控 2026-11-14 確認維持),無一般時權重 1;陣列內數字與布林以字串形式為一般關鍵字(不解析前綴),null 等略過 | `arrFilterByKeywords.mjs` |
| 〈三〉`arr2dt` | 規則 4、5;陣列 values(含 `['']`、`[null]`、`[{}]`、`[]`)一律為值陣列;長度不符 `{}`＋規則 6;新增第 3 參數 `opt` | `arr2dt.mjs` |
| 〈四〉`dtmapping` | 規則 3、4、5;值為 `undefined` 填 def;不支援 Map(非 `isobj`) | `dtmapping.mjs` |
| 〈五〉`ltdtmapping` | 逐列 `dtmapping`;`[{}]`→`[{a:''}]`、`[null]`→`[{}]` | `ltdtmapping.mjs` |
| 〈六〉`getltdtkeys` | 只有非陣列、非函數之物件列貢獻(字串、String 物件、陣列、TypedArray／DataView、函數不貢獻);`Set` 累積(20000 個相異鍵由約 12 秒降至毫秒級,結果與順序不變) | `getltdtkeys.mjs` |
| 〈七〉`iseobj` | `isobj(v)` 且至少一個自有可列舉字串鍵(`for…in`＋`hasOwnProperty`,遇到即回傳) | `iseobj.mjs` |
| 〈八〉`ltdtDiffByKey` | 列非物件／陣列／缺自有主鍵、主鍵值非「非空字串或有限數字」、同側重複、`1` 與 `'1'` 並存(同側或跨側)皆拋錯;內容比對為鍵排序之 JSON(先 `JSON.stringify` 取 JSON 語意再 `JSON.parse` 後排序輸出);`infor` 之 `'__proto__'` 為一般欄位;檢測之主鍵值即其後使用之值 | `ltdtDiffByKey.mjs` |
| 〈九〉`ltdt2vrtsable` | 每格須為 `{ value, style }`(value 自有、style 可省略預設 `{}`);缺欄(含繼承欄)、格非物件或為 null、缺 value → 雙模式 error `invalid ltdt, every row must have a cell {value, style} for every column` | `ltdt2vrtsable.mjs` |
| 〈十〉`filepathToTree` | 規則 1;項目非物件、`path`(自有)缺／非原始字串／空／分段後無任何段(`'/'`、`'///'`、`'   '` 等,比照空字串;主控 2026-11-14 裁定,ws430b2)、`type`(自有)非 `'folder'`／`'file'`、路徑任一段含 `opt.delimiter` 皆拋錯(指出第幾個;path 先於 type 檢查);不改動呼叫端項目;重複與檔案／資料夾衝突照樣拋錯,訊息改為指出本項與先前項(`fps[j]`,虛擬資料夾取建立它之項目),不輸出 console;`.`、`..` 為一般名稱 | `filepathToTree.mjs` |
| 〈十一〉`composeToTree` | 元素須 `iseobj`;`id`／`parentId` 只有 `undefined`、`null`、`''` 為無值;孤兒、循環、指向自己置頂並保留 parentId(循環取最先出現者;頂層依原順序);id 以 `Map` 嚴格區分(重複時子節點掛在最後一個);移除走不到之 `console.log` | `composeToTree.mjs` |
| 〈十二〉`ltdtmerge` | 長度不符 `[]`＋規則 6(新增第 3 參數 `opt`);ltdt2 之陣列列忽略;來源只合併自有鍵(最外層與巢狀皆 `Object.keys`) | `ltdtmerge.mjs` |
| 〈十三〉`dtpick` | 只取自有可列舉欄位;`'__proto__'` 以一般欄位寫入;值為 `undefined` 者保留 | `dtpick.mjs` |
| 〈十四〉`ltdtpick` | `[{}]`、`[null]` → `[{}]`(參數層改 `isarr`) | `ltdtpick.mjs` |

### 站點全集與盤點指令

- 本條之 14 個函數與 2 個內部模組(`_normKey.mjs`、`_setOwnKey.mjs`)如上表.盤點:`Grep pattern="from './_setOwnKey.mjs'|from './_normKey.mjs'" path=src`(應為 `arr2dt`、`dtmapping`、`ltdtmapping`、`dtpick`、`ltdtDiffByKey`、`ltdt2vrtsable`).
- wsemi 內部呼叫端(2026-11-14 逐站確認): `ltdtDiff`／`ltdtkeys2mat`／`ltdtkeysheads2mat`(`getltdtkeys`、`iseobj`;列只有繼承鍵者 `ltdtDiff` 由「回 `{diff:[],dfs:[]}`」改為拋錯,即 2026-11-12 回饋之不一致結案)、`fsTask:332`／`fsTaskCp:399`／`fsSyncFolderCore:134`(`ltdtDiffByKey`;主鍵為 `Object.keys` 之鍵或 `${ftype}|${rpath}`,唯一且非空;紀錄檔被竄改而含 `""` 鍵時 `fsTask` 該輪 reject 後由 `fsTask.mjs:682` 之 `.catch` 記 trace `fail`,`fsTaskCp` 之 `core` reject 後由 `fsTaskCp.mjs:452-453` 之 `.catch` 吞下,皆不使行程崩潰)、`convertToTree:974`(`composeToTree`;節點由內部組出,皆有 id)、`files2data:49`(`ltdtmerge`;兩側皆純物件陣列且等長)、其餘 import `iseobj` 之約 30 檔(只對「只有繼承鍵之物件」改變結果).
- 下游(其他自有套件)盤點見主控任務 `20261114175457` 之 `agent-out/ws430b-修正報告.md`〈下游盤點〉.

### 測試

- `test/elemLevelRules.test.mjs`(逐節逐列,標題前綴〈節-列〉;期望值取自裁定表文字;JSDoc 列以讀 `src` 之 JSDoc 文字守門).既有測試依新規格改寫者:`arrFilterByKeywords`、`filepathToTree`、`genClockTZ`、`getltdtkeys`(第 25～32 行)、`ltdt2vrtsable`、`ltdtDiffByKey`、`ltdtmerge`(對照之 lodash merge 改以「陣列來源列視為 undefined」、繼承鍵兩案改為只合併自有鍵)、`invalidInputQ1`(2 處).
- 執行: `npx mocha --no-parallel test/elemLevelRules.test.mjs --timeout 180000`.
- 變異(2026-11-14,腳本 `tmp/ws430b/mutate.mjs`,已清除;副本存主控任務證據檔): 56 項逐一把新碼改回舊寫法或拿掉裁定之處理,56/56 被殺(基準 70 案全綠);初跑存活 2 項(String 包裝物件列、`''` 之 id 與 parentId)補案後被殺;外審後補 M56(`style` 取繼承者).

### 外審(2026-11-14,agy-hydrogen `gemini-4-hydrogen-high`;terra、Argon、agy-opus 額度用盡)

- 採納並修正: `composeToTree` 之 `buildTree` 亦以 `getOwn` 取 `id`／`parentId`(與 `addNodeLevel` 一致,無可觀察差異)、`ltdt2vrtsable` 之 `style` 只取自有可列舉者(繼承或不可列舉視為省略;〈九-1〉補案、變異 M56)、`dtpick` 欄位名判定與 `dtmapping`／`arr2dt` 之 cloneDeep 範圍寫入 JSDoc、`composeToTree` JSDoc 寫明既有子節點欄位須為陣列.
- 屬實但為修前即有、裁定表未列之情境(不改,列下):見已知限制②③.

### 已知限制

- ①~~`filepathToTree` 之 `path` 若分段後無任何段(如 `'/'`、`'///'`、`'  '`)仍靜默略過、不偵測重複~~ → 主控 2026-11-14 裁定比照空字串拋 `invalid fps[i].path: must be a non-empty string`,已實作(ws430b2,`test/elemLevelRules.test.mjs`〈十-2〉之 path 無段案);`soryItems` 回傳不完整時之內部拋錯(`invalid parentId[…]`、`無預先建置資料夾`)仍帶內部物件之 console 與路徑(裁定表只列重複與衝突,維持修前).
- ②`filepathToTree` 之 `opt.bindRoot` 為 `'__proto__'` 時內部表(`kpPathFd` 等一般物件)賦值失效,輸出 2 筆 console 並拋 `invalid parentId[__proto__] in file`(帶值);`bindRoot` 含分隔字串時未比照路徑段檢查(外審 T2;修前即同,HEAD 副本實測).
- ③`composeToTree` 之項目既有子節點欄位非陣列(`children: 'bad'`、`null`)或 `opt.bindChildren` 為 `'__proto__'` 時拋原生 `TypeError: cs.push is not a function`(外審 T3;修前即同;JSDoc 已寫明須為陣列).
- `arrFilterByKeywords` 陣列內之負數(`-5`)為一般關鍵字 `'-5'`(修前即如此,不解析前綴).
- `arr2dt`／`dtmapping` 之 `keys` 元素為布林、BigInt、`NaN`、`Infinity` 仍以 `String()` 為欄位名(裁定表未列,維持修前).
