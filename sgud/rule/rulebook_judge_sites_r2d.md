# 規則帳本(判斷類站點之處置結果,續 r2c)

本檔自 `sgud/rule/rulebook_judge_sites_r2c.md` 逾 30KB(ws286b 後 33.8KB)後另開(2026-11-03,ws286c,全域設定 §14):其後新增之處置結果節附於本檔末(逾 30KB 時再抽出新檔);共通說明(風險代號)與全檔索引見 `sgud/rule/rulebook_judge_sites.md`.

## 第 221 項 §11 第 6 項 ws286c 處置結果(2026-11-03,差異比對子類 5 個函數:`strDiff`、`strDiffToHtml`、`arrDiff`、`matDiff`、`ltdtDiff`;非計算類函數之必須參數遇非預期;第一級〔下游 0 站點〕;主控任務 20261031121854 ws286c)

- 依據:使用者 2026-11-03 逐列確認(dspec〈輸入參數之檢測機制〉§11 第 6 項):「差異比對（5 個） 先修wsemi 再連動跑完」→ 5 個函數之必須參數型別不對即拋錯(訊息不帶值);兩邊皆空者 `strDiffToHtml` 仍回 `''`,其餘回與正常輸出同形之空結果(`{ diff: [], dfs: [] }`);`matDiff` 非矩陣仍拋錯但不再以 `console.log` 印資料;`ltdtDiff` 元素非物件拋錯.主控查 `C:\opensrc` 其他套件(含測試碼)這 5 個函數字面搜尋 0 處(9201 檔);wsemi `src/` 內僅 `strDiff` ← `arrDiff`、`arrDiff` ← `matDiff`／`ltdtDiff` 三條內部呼叫鏈(Grep 於 `src/` 僅命中此五檔與 `index.mjs`).
- 規則(本節):
  1. 必須參數無效 throw `Error(固定訊息)`,不帶值,依參數順序檢測:`strDiff`／`strDiffToHtml` 為 `invalid strOld: must be a string`、`invalid strNew: must be a string`;`arrDiff` 為 `invalid arrOld: must be an array`、`invalid arrNew: must be an array`;`matDiff` 為 `invalid matOld|matNew: must be an array`;`ltdtDiff` 依序為 ltdtOld 陣列、ltdtOld 元素、ltdtNew 陣列、ltdtNew 元素(`invalid ltdtOld|ltdtNew: must be an array` 與 `…: must be an array of objects`).`''` 與 `[]` 為合法輸入,只有一邊為空者照常回差異結果.
  2. 兩邊皆空:`strDiff`／`arrDiff`／`matDiff`／`ltdtDiff` 回 `{ diff: [], dfs: [] }`(每次新物件,與正常輸出同鍵同序;實測正常輸出只有 `diff`、`dfs` 兩鍵,`matDiff`／`ltdtDiff` JSDoc 原寫之 `dfrs` 不存在,已更正),`strDiffToHtml` 回 `''`.`ltdtDiff` 因 `[{}]` 對 `[{}]` 等「兩側皆無可比對之鍵」時內部轉成兩個 `[]` 矩陣交 `arrDiff`,同回 `{ diff: [], dfs: [] }`(改前為 `{ dfs: [] }`).
  3. 不回顯輸入資料:`arrDiff`(矩陣模式)／`matDiff` 之某列非陣列仍 throw,**訊息不變**(`arrOld is not a matrix`／`arrNew is not a matrix`,沿用 `arrDiff` 內部名稱),移除其前之兩行 `console.log`(dspec V20).
  4. `ltdtDiff` 元素檢測用 `isobj`(`Object.prototype.toString` 為 `[object Object]`:一般物件,含 `{}` 與無原型物件),走訪用 lodash `every`(依索引,陣列空洞視為 `undefined` 而無效;`Array.prototype.every` 會略過空洞,不可用).陣列、函數、`null`、基本型別、`Date`、`Map` 等皆為非物件.
  5. `opt` 內無效之鍵維持現行(改用預設,不報錯).
- 逐函數(`file:line` 為本輪工作樹;「改前」皆為 HEAD 實測,見報告〈使用者逐列確認表之實測〉):

| 函數:情形 | 改前 | 改後 | 位置 |
|---|---|---|---|
| `strDiff`:`strOld`／`strNew` 非字串 | `{}` | throw `invalid strOld: must be a string`／`invalid strNew: must be a string` | `src/strDiff.mjs:289-295` |
| 同上:兩邊皆 `''` | `{}` | `{ diff: [], dfs: [] }` | `:296-301` |
| `strDiffToHtml`:`strOld`／`strNew` 非字串 | `''` | throw(訊息同上) | `src/strDiffToHtml.mjs:110-116` |
| 同上:兩邊皆 `''` | `''` | 不變 | `:117-119` |
| `arrDiff`:`arrOld`／`arrNew` 非陣列 | `{}` | throw `invalid arrOld: must be an array`／`invalid arrNew: must be an array` | `src/arrDiff.mjs:545-551` |
| 同上:兩邊皆 `[]`(任何 `mode`) | `{}` | `{ diff: [], dfs: [] }` | `:552-557` |
| 同上:矩陣模式某列非陣列 | throw(訊息不變),且 `console.log` 2 次 | throw(訊息不變),0 次 | `:84`、`:98`(原 `:84-85`、`:100-101`) |
| `matDiff`:`matOld`／`matNew` 非陣列 | `{}` | throw `invalid matOld: must be an array`／`invalid matNew: must be an array` | `src/matDiff.mjs:326-332` |
| 同上:兩邊皆 `[]` | `{}` | `{ diff: [], dfs: [] }` | `:333-338` |
| `ltdtDiff`:`ltdtOld`／`ltdtNew` 非陣列 | `{}` | throw `invalid ltdtOld: must be an array`／`invalid ltdtNew: must be an array` | `src/ltdtDiff.mjs:828-830`、`:834-836` |
| 同上:任一元素非物件(含空洞) | `{ dfs: [] }`(兩側皆如此)或該側靜默當成空(如 `[{ a: 1 }, 2]` 對 `[{ a: 1 }]` 顯示「新增」) | throw `invalid ltdtOld|ltdtNew: must be an array of objects` | `:831-833`、`:837-839` |
| 同上:兩邊皆 `[]`、或兩側皆無可比對之鍵(`[{}]` 對 `[{}]`) | `{}`／`{ dfs: [] }` | `{ diff: [], dfs: [] }` | `:840-845` |

- 內部呼叫鏈逐站確認(2026-11-03;HEAD 副本加計數實測,`ws286c-evidence/2-internal-sites-instrument.log`):

| 站點 | 傳入值來源 | 無效值可否抵達 | 是否依賴舊回傳 `{}` | 結論 |
|---|---|---|---|---|
| `arrDiff.mjs` 內 `arrDiff1D` → `strDiff`(`:41`) | `join(map(arr, v => \`${v}\n\`), '')`,必為字串 | 否 | `strDiff('', '')` 僅在 `arrDiff1D([], [])` 時發生:`arrDiff` 頂端已先擋兩邊皆空;唯一內部路徑為 `arrDiff2D` 之 modify 行對(儲存格含換行,如 `matDiff([['a\nz']], [['b\nz']])`,該對去分隔字串後兩邊皆 `[]`)——此處只讀回傳之 `.dfs`:舊 `{}` 經 `map(undefined)` 得 `[]`,新 `[]`,最終輸出逐字相同 | 無需改;結果與改前相同(該案寫入測試) |
| `arrDiff2D` → `strDiff`(HEAD `:113`→現 `:109`) | 同上(每列後必接 `\n`,故 `[[]]` 為 `'\n'`、`[['']]` 為 `'0∶⟋\n'`,不為 `''`) | 否 | 兩邊皆 `''` 不可能(`arrDiff` 已擋兩邊皆空) | 無需改;`arrDiff([[]], [[]])`、`matDiff([[]], [[]])`、`matDiff([['']], [['']])` 結果與改前逐字相同 |
| `matDiff` → `arrDiff`(HEAD `src/matDiff.mjs:303`→現 `:341`) | `matOld`／`matNew` 已檢為陣列;`{ ...opt, mode: 'matrix' }` | 陣列元素非陣列可抵達 → `arrDiff2D` 仍 throw `arrOld|arrNew is not a matrix`(訊息不變,不再 console.log) | 不依賴 | 無需改 |
| `ltdtDiff` → `getltdtkeys`、`ltdtkeys2mat`、`arrDiff`(HEAD `src/ltdtDiff.mjs:818`→現 `:872`) | 已檢為「物件陣列」;`ltdtkeys2mat` 回陣列(失敗亦回 `[]`)故 `arrDiff` 收到之必為陣列 | 否 | 兩邊矩陣皆 `[]` 時舊 `arrDiff` 回 `{}`、`ltdtDiff` 再補 `dfs` 成 `{ dfs: [] }`;新回 `{ diff: [], dfs: [] }`,為本表所列之同形變更;`ltdtDiff` 對回傳物件賦值 `r.dfs`,每次新物件故無共用狀態風險 | 已含於上表;`[{}]` 對 `[{}]` 之輸出由 `{ dfs: [] }` 變 `{ diff: [], dfs: [] }`(邊界案寫入測試) |

- 盤點指令:`Grep pattern="return \{\}" path=src glob="{strDiff,strDiffToHtml,arrDiff,matDiff,ltdtDiff}.mjs"` 應僅命中 `arrDiff.mjs` 內 `arrDiff1D`／`arrDiff2D` 之內部不可達守門(由 `arrDiff` 先檢測,不外洩;未刪,屬既有死碼只提出);`Grep pattern="console\.(log|info|warn|error)" path=src glob="{strDiff,strDiffToHtml,arrDiff,matDiff,ltdtDiff}.mjs"` 應只命中 JSDoc 範例註解.
- 測試:`test/strDiff.test.mjs`(15 → 56)、`strDiffToHtml.test.mjs`(16 → 54)、`arrDiff.test.mjs`(12 → 56)、`matDiff.test.mjs`(11 → 75)、`ltdtDiff.test.mjs`(16 → 80),共 70 → 321(+251;`mocha --dry-run`);共用載具 `test/tools/diffInputKit.mjs`(新檔:無效值表 `NON_STR`／`NON_ARR`／`NON_OBJ_ELEM`、`throwsMsg`〔斷言訊息恰為固定字串且 throw 過程 console 呼叫 0 次〕、`throwsMsgNoLeak`).執行:`npx mocha --no-parallel test/strDiff.test.mjs test/strDiffToHtml.test.mjs test/arrDiff.test.mjs test/matDiff.test.mjs test/ltdtDiff.test.mjs --timeout 180000`.
- 驗證:見主控任務 `agent-out/ws286c-修正報告.md`(修前紅:新測試於未修之 HEAD src 上 280 紅、41 綠〔綠者為不變之有效路徑〕;修後 5 檔 321 案 0 failing,加掃描類共 12 檔 585 案 0 failing;變異 41 項中 39 項殺死、2 項為等價變異〔移除 `strDiff`／`matDiff` 中冗餘之兩邊皆空提前回傳,輸出相同〕;有效輸入域修前修後差分 76053 列 0 差異;eslint 0 error).
- 已知殘餘(未改,需裁示):`ltdtDiff` 之列為 `{}`(空物件)而他列有鍵時,`ltdtkeys2mat` 因要求每列為有效物件(非空)而整側回 `[]`,該側被靜默當成空——如 `ltdtDiff([{ a: 1 }, {}], [{ a: 1 }])` 顯示為「新增 1 列」(應為刪除 1 列的 `{}`)、`ltdtDiff([{ a: 1 }], [{ a: 1 }, {}])` 顯示為「刪除 1 列」(實測 `ws286c-evidence/9-probe-out-of-scope.log`);改前即如此,`{}` 依使用者所定「元素為物件」不在本輪拋錯範圍,故維持.另:`arrDiff` 一維模式元素為 `Symbol` 時為原生 `TypeError: Cannot convert a Symbol value to a string`(訊息不含值,但屬內部錯誤外洩)、`strDiff` 的 `isstr` 收字串包裝物件(`new String('a')`)並照常運作;`arrDiff1D`／`arrDiff2D` 內 `return {}` 守門與 `strDiff` 的 `{ eliminateEndLine: true }` 選項(`strDiff` 不讀取)為既有死碼.
