# 規則帳本(字串取代之取代值)

索引見 `sgud/rule/rulebook.md`〈索引〉.

## R-REPLACE-LITERAL-01 字串取代之取代值須字面化: `replace`／`replaceAll` 之取代值(第 2 引數)為函式、不含 `$` 之字面值,或刻意之 `$` 樣式

- **依據**: 排程第 427 項之 wsemi 部分(主控任務 20261112065727 wsrep,2026-11-12).`String.prototype.replace`／`replaceAll` 之**取代字串**會展開 `$&`、`$'`、`` $` ``、`$$`、`$n`、`$<name>`;取代值來自呼叫端或外部輸入而本意為字面文字時,含 `$` 即寫出錯誤結果(使用端之一的重設密碼信因此使信中密碼與資料庫不同,已於該使用端修正).`replace(c, t, r)` 之 JSDoc 為「將 t 全部取代成 r」(字面取代),實作 `String(c).replaceAll(t, r)` 卻展開 `r` 中之 `$`——為同族中唯一漏網(`replaceObj` 先逸出 `$`、`replacePlus` 以函式回傳).
- **成因與實測(Node,pattern 為字串時)**: `$&`(比對到的文字)、`$'`(其後文字)、`` $` ``(其前文字)、`$$`(單一 `$`)會展開;`$1`、`$<x>` 因字串 pattern 無捕獲群而保持字面(修前亦然).例: 修前 `replace('a{x}b', '{x}', '$&')` → `'a{x}b'`、`replace('a{x}b', '{x}', '$$')` → `'a$b'`、`replace('價格{p}', '{p}', '$&5')` → `'價格{p}5'`.
- **規則**:
  1. `src/` 內每個 `.replace(`／`.replaceAll(` 站點之取代值須為其一: (a)不含 `$` 之字串字面值(含無內插之樣板字串、字串字面值相加);(b)函式(回傳值不展開 `$` 樣式);(c)刻意之 `$` 樣式(正規式之捕獲群 `$1`,或 `$&` 於字面文字前加字元),逐站列入下表〈刻意之 `$` 樣式〉.其餘(變數、參數、有內插之樣板字串、函式呼叫回傳值、成員取值)一律為缺陷,改為 `() => String(x)`.
  2. `replace(c, t, r)` 之 `t`、`r` 皆為字面文字(`r` 以函式回傳,`$` 不展開);`r` 非字串仍回 `''`(不變).`replaceObj` 不得再預先把 value 之 `$` 逸出為 `$$`(`replace` 已字面,逸出會使每個 `$` 變 `$$`).`replacePlus` 維持函式回傳.
  3. 新增或擴充「取代值來自呼叫端」之取代類函數,測試須含取代值 `$&`、`$'`、`` $` ``、`$$`、`$<x>`、`$1` 各一案(`$<x>`、`$1` 於字串 pattern 修前亦字面,為防日後改用正規式之守門).
- **盤點指令(可重跑)**:
  - 粗查(含 JSDoc 與註解內之範例,須人工排除): `Grep pattern="\.(replace|replaceAll)\s*\(" path=src glob=*.mjs output_mode=content`(2026-11-12 修前命中 69 行〔30 檔〕、修後 68 行〔29 檔,`replaceObj.mjs:87` 移除〕;其中 JSDoc 範例 `fsEnsureBins.mjs:80`、`fsGetFilesInFolder.mjs:30`、`fsGetFilesWithHashInFolder.mjs:34`、`fsGetFoldersInFolder.mjs:30`、`fsTreeFolder.mjs:30` 與註解 `replace.mjs:36` 共 6 行不計;單行含多個呼叫者如 `getDiagSecrets.mjs:177`).
  - 精確(以 AST,註解與字串內之文字不計): `npx mocha test/replaceLiteralSites.test.mjs --timeout 180000`;列出全部站點可用 `test/tools/replaceSiteScan.mjs` 之 `scanReplaceSites(原始碼)`(回 `[{ line, method, kind, text }]`,`kind` ∈ `lit`／`dollar-lit`／`fn`／`dynamic`／`noarg`).
  - 取代類函數之呼叫端(`import … from './replace.mjs'`): `Grep pattern="replace\.mjs" path=src` → `color.mjs`、`domAlert.mjs`、`getCsvStrFromData.mjs`、`replaceObj.mjs`,取代值皆為字面常數(`''`、`' '`)或已由 `replaceObj` 傳入之普通文字.
- **站點全集(2026-11-12,`src/` 514 個 `.mjs`,AST 掃描 67 站點)**: 修前 68 站點 = `lit` 54、`fn` 5、`dollar-lit` 8、`dynamic` 1;修後 67 站點 = `lit` 54、`fn` 6、`dollar-lit` 7、`dynamic` 0.改動 2 站點,餘 65 站點不改.

  | 站點 | 取代值來源 | 判定 | 處置 |
  |---|---|---|---|
  | `replace.mjs:43`(修前 `:37`) `String(c).replaceAll(t, r)` | 參數 `r`(呼叫端或外部輸入) | **缺陷**(`$&`、`$'`、`` $` ``、`$$` 被展開;與 JSDoc「字面取代」不符) | 改 `replaceAll(t, () => String(r))` |
  | `replaceObj.mjs:87`(修前) `v.replaceAll('$', '$$$$')` | 字面常數 `'$$$$'`(輸出 `$$`) | 刻意之逸出,但**依賴 `replace` 會展開**;`replace` 改字面後會使 `$` 變 `$$` | 移除該行逸出(改 `kvs.push([k, v])`);對外行為不變(`replaceObj('a-b', { a: '$&$&' })` 仍 `'$&$&-b'`) |
  | `replacePlus.mjs:75` | 參數 `r`,以函式回傳 | 已字面 | 不改 |
  | `getDiagSecrets.mjs:108,149,180`、`_diagKit.mjs:718`(第二個 `replace`) | 函式(逐比對處理) | 已字面 | 不改 |
  | 其餘 `lit` 54 站點 | 字串字面常數(不含 `$`) | 已字面 | 不改 |

  **刻意之 `$` 樣式(`dollar-lit` 7 站點,正規式取代,不改)**:

  | 站點 | 取代值 | 依據 |
  |---|---|---|
  | `cfinancial.mjs:49` | `'$1' + ',' + '$2'` | `/(\d+)(\d{3})/` 之捕獲群,千分位 |
  | `execCliCore.mjs:197` | `'$1$1\\"'` | `/(\\*)"/g` 之捕獲群,反斜線加倍並轉義引號(`escapeWinArg`) |
  | `execCliCore.mjs:200` | `'$1$1'` | `/(\\*)$/` 之捕獲群,尾端反斜線加倍 |
  | `execCliCore.mjs:206` | `'^$&'` | cmd.exe metacharacters 前加 `^`(`escapeWinArg`) |
  | `execCliCore.mjs:219` | `'^$&'` | 同上(`escapeWinCmd`) |
  | `replacePlus.mjs:67` | `'\\$&'` | `not` 字元類別內逸出 `\ ] [ ^ -` |
  | `_diagKit.mjs:718` | `'\\$&'` | `escRe`: 正規式元字元跳脫 |

  `lit` 54 站點之檔案分布(站點數): `_diagCases` 1、`_diagKit` 3(`:797,1016,1192`)、`_filterXSS` 1、`b642u8arr` 2、`color` 3、`detectXSS` 1、`domCompareText` 1、`execCliCore` 1(`:103`)、`execCliFailDetail` 1、`filepathToTree` 2、`fsEnsureBinsCore` 3、`fsSrlog` 2、`fsSyncFolderCore` 2、`getClearPathName` 2、`getDiagSecrets` 13、`getDiagShape` 1、`lowerFind` 1、`lowerFindEq` 1、`strCompare` 2、`strDiff` 4、`strDiffToHtml` 7;逐站取代值見 `scanReplaceSites` 輸出.
- **未改而判定為正確者(依據)**: 正規式取代且取代值為字面常數(`''`、`'?'`、`'/'`、`'\n'`、`' '` 等)者,常數不含 `$`,無展開問題;`strDiffToHtml.mjs:164,167,170` 之 HTML 片段含 `#`、`:` 但無 `$`.`fsSrlog.mjs:213`、`fsSyncFolderCore.mjs:100` 之 `replace(fdSys|fpRep, '')` 其變數在 pattern 位置(字面搜尋,不展開),取代值為 `''`.
- **測試**: `test/replace.test.mjs`(17 → 28 案,新增 11 案: JSDoc 例、`$&`／`$'`／`` $` ``／`$$`／`$<x>`／`$1` 各 1 案、20 種 `$` 樣式迴圈、`t` 為字面〔含 `$` 與正規式元字元〕、`String` 物件 `r`、與 `split/join` 為 oracle 之 400 組種子亂數差分);`test/replaceObj.test.mjs`(既有 143 案之 `$` 值案,守 `replaceObj` 逸出移除後對外不變,未修改該檔);`test/replaceLiteralSites.test.mjs`(7 案: 掃描器 3 案〔分類、optional／computed／鏈式／註解字串不計、行號〕、`src/` 站點 4 案〔掃描範圍非空、無 `dynamic`、`dollar-lit` 恰為上表 7 站點、`replaceObj` 不預先逸出〕);工具 `test/tools/replaceSiteScan.mjs`(剖析器同 `bigintLiteralScan.mjs`: `@babel/parser` + estree).
- **不採**: 以 `String.raw`／正規式 `escape` 對 `r` 預先逸出(函式回傳最簡且不改變輸出);對 `replace` 另加「展開模式」選項(專案原則 14: 不做舊版相容,下游盤點無依賴展開者).
- **取代紀錄**: ws286b 處置結果(`rulebook_judge_sites_r2c.md` 〈第 221 項 §11 第 6 項 ws286b 處置結果〉規則 2 與表列「`replaceObj` 先將 value 之 `$` 逸出為 `$$` 再交 `replace`」「`replace` 之 `$` 特殊樣式未改」)為當時事實,自 2026-11-12(ws427)起 `replace` 已字面、`replaceObj` 不再逸出;破壞性變更紀錄第 64 項見 `sgud/rule/rulebook_breaking_57on.md`.
- **變更紀錄**: 2026-11-12(ws427 wsrep)新增本規則並改 `replace`、`replaceObj` 兩站點.
