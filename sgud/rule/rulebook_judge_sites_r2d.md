# 規則帳本(判斷類站點之處置結果,續 r2c)

本檔自 `sgud/rule/rulebook_judge_sites_r2c.md` 逾 30KB(ws286b 後 33.8KB)後另開(2026-11-03,ws286c,全域設定 §14):其後新增之處置結果節附於本檔末(逾 30KB 時再抽出新檔;**本檔 ws286e 後已逾 30KB〔約 31.5KB〕,其後新增節請另開 `sgud/rule/rulebook_judge_sites_r2e.md` 並於 `rulebook_judge_sites.md`、`rulebook.md` 增列索引**);共通說明(風險代號)與全檔索引見 `sgud/rule/rulebook_judge_sites.md`.

## 第 221 項 §11 第 6 項 ws286c 處置結果(2026-11-03,差異比對子類 5 個函數:`strDiff`、`strDiffToHtml`、`arrDiff`、`matDiff`、`ltdtDiff`;非計算類函數之必須參數遇非預期;第一級〔下游 0 站點〕;主控任務 20261031121854 ws286c)

- 依據:使用者 2026-11-03 逐列確認(dspec〈輸入參數之檢測機制〉§11 第 6 項):「差異比對（5 個） 先修wsemi 再連動跑完」→ 5 個函數之必須參數型別不對即拋錯(訊息不帶值);兩邊皆空者 `strDiffToHtml` 仍回 `''`,其餘回與正常輸出同形之空結果(`{ diff: [], dfs: [] }`);`matDiff` 非矩陣仍拋錯但不再以 `console.log` 印資料;`ltdtDiff` 元素非物件拋錯.主控查 `C:\opensrc` 其他套件(含測試碼)這 5 個函數字面搜尋 0 處(9201 檔);wsemi `src/` 內僅 `strDiff` ← `arrDiff`、`arrDiff` ← `matDiff`／`ltdtDiff` 三條內部呼叫鏈(Grep 於 `src/` 僅命中此五檔與 `index.mjs`).
- 規則(本節):
  1. 必須參數無效 throw `Error(固定訊息)`,不帶值,依參數順序檢測:`strDiff`／`strDiffToHtml` 為 `invalid strOld: must be a string`、`invalid strNew: must be a string`;`arrDiff` 為 `invalid arrOld: must be an array`、`invalid arrNew: must be an array`;`matDiff` 為 `invalid matOld|matNew: must be an array`;`ltdtDiff` 依序為 ltdtOld 陣列、ltdtOld 元素、ltdtNew 陣列、ltdtNew 元素(`invalid ltdtOld|ltdtNew: must be an array` 與 `…: must be an array of objects`).`''` 與 `[]` 為合法輸入,只有一邊為空者照常回差異結果.
  2. 兩邊皆空:`strDiff`／`arrDiff`／`matDiff`／`ltdtDiff` 回 `{ diff: [], dfs: [] }`(每次新物件,與正常輸出同鍵同序;實測正常輸出只有 `diff`、`dfs` 兩鍵,`matDiff`／`ltdtDiff` JSDoc 原寫之 `dfrs` 不存在,已更正),`strDiffToHtml` 回 `''`.`ltdtDiff` 因 `[{}]` 對 `[{}]` 等「兩側皆無可比對之鍵」時內部轉成兩個 `[]` 矩陣交 `arrDiff`,同回 `{ diff: [], dfs: [] }`(改前為 `{ dfs: [] }`).
  3. 不回顯輸入資料:`arrDiff`(矩陣模式)／`matDiff` 之某列非陣列仍 throw,**訊息不變**(`arrOld is not a matrix`／`arrNew is not a matrix`,沿用 `arrDiff` 內部名稱),移除其前之兩行 `console.log`(dspec V20).
  4. `ltdtDiff` 元素檢測用 `isobj`(`Object.prototype.toString` 為 `[object Object]`:一般物件,含 `{}` 與無原型物件),走訪用 lodash `every`(依索引,陣列空洞視為 `undefined` 而無效;`Array.prototype.every` 會略過空洞,不可用).陣列、函數、`null`、基本型別、`Date`、`Map` 等皆為非物件.
  5. `opt` 內無效之鍵維持現行(改用預設,不報錯).
  6. **(ws290 修訂,2026-11-12,使用者裁示;破壞性變更紀錄第 62 項,見 `rulebook_breaking_57on.md`)** 取代上列規則 1 之 `ltdtDiff` 元素訊息、規則 2 之 `[{}]` 句、規則 3 之「訊息不變」、規則 4 之 `isobj`: ①`ltdtDiff` 元素須為**有效物件**(`iseobj`,即非空物件;`{}`、無可列舉鍵之物件、非物件皆無效,陣列空洞仍依 lodash `every` 視為 `undefined` 而無效),無效時 throw `invalid ltdtOld|ltdtNew: every element must be a non-empty object`(序同規則 1),**不支援空物件列**(其會使內部 `ltdtkeys2mat` 整側靜默回 `[]` 而算錯;`ltdtkeys2mat` 之回傳約定不改);`[{}]` 對 `[{}]` 因而改為 throw,內部「兩側皆無可比對之鍵」站點已不可由 `ltdtDiff` 抵達.②`matDiff` 於內部先檢各列(`every(matOld|matNew, isarr)`),throw `invalid matOld|matNew: every row must be an array`(不再沿用 `arrDiff` 之參數名);`arrDiff`(矩陣模式)之元素非陣列訊息改為 `invalid arrOld|arrNew: every element must be an array when opt.mode is 'matrix'`.測試: `ltdtDiff.test.mjs`／`matDiff.test.mjs`／`arrDiff.test.mjs`,變異 16 項全殺死.
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

## 第 221 項 §11 第 6 項 ws286d 處置結果(2026-11-03,空資料不是失敗:向量處理 `arrAdd`／`arrMulti`／`arrAccum` 空進空出、`arrProduct` 一邊空即報錯、狀態模式轉換函數 `ltdtkeys2mat`／`ltdtkeysheads2mat`／`ltdt2vrtsable`／`mat2ltdt`／`keysmat2ltdt`、`getCsvStrFromData([])`;第一級〔下游僅預設模式或 0 站點〕;主控任務 20261031121854 ws286d)

- 依據:使用者 2026-11-03(dspec〈輸入參數之檢測機制〉§11 第 6 項「空資料不是錯誤」「數值陣列之空陣列」,使用者逐列確認 3 組):「空陣列也依然是陣列,故傳入與回傳皆為空陣列,不像是無法計算出數值的情況」→ 逐項處理而回陣列者空進空出;「arrMax arrMin arrNorm arrProduct 是要基於陣列去計算出單一數值,故傳空陣列進去無法算出數值,這得視為報錯」→ 維持;「arrProduct([1], [])、arrProduct([], [1]) 依你建議報錯」;「同類問題 6 個 依你建議去修」(5 個轉換函數狀態模式、`getCsvStrFromData([])`).主控查:其他自有套件未呼叫向量與彙總這 7 個函數;5 個轉換函數之下游呼叫皆為預設模式(`w-data-csv`、`w-ui-dwload`、`w-aggrid-vue`);`getCsvStrFromData` 下游只有 `w-fft` 範例頁(`examples/ex-spectrum1d.html`)——本輪以 `own-token-search` 重查結果相同(證據夾 `ws286d-evidence/7-own-token-search.txt`;`w-statistic`／`w-geo` 僅註解、`w-web-perm` 為不相關之字串 id).
- **更正舊記載(第 221 項第二批 §11 第 15 項)**:第 15 項曾記「每個輸入陣列各自至少 1 個有效數字,**空陣列亦然(視為 0 個)→ throw**」(`rulebook_optval.md` R-OPT-VAL-01 ②、`rulebook_breaking_45to51.md` 第 47 項、`rulebook_judge_sites_r1.md` 第 15 項列、`state_數值與判斷.md`)——**對 `arrAdd`／`arrMulti`／`arrAccum` 已由本節取代**(空陣列空進空出回 `[]`),**對 `arrProduct` 維持 throw 並擴及「任一邊為空」**,`arrMax`／`arrMin`／`arrNorm` 維持不變;「有元素但無有效數字仍 throw」不變.各處已加註〔2026-11-03 更正〕.
- 規則(本節):
  1. 空陣列為合法資料,不得因其為空而報錯;**由陣列算出單一數值者**(`arrMax`、`arrMin`、`arrNorm`、`arrProduct`)空陣列算不出,報錯(維持);**逐項處理而回陣列者**(`arrAdd`、`arrMulti`、`arrAccum`)空進空出.
  2. 向量處理:`arrAdd`／`arrMulti` 所有輸入陣列皆為空(長度 0,可 ≥2 個,最後的 `opt` 不計)回 `[]`(每次新陣列);`arrAccum([])` 回 `[]`.**容器處置仍先於有效數字檢查**:陣列少於 2 個、含非陣列、長度不同(含一邊空另一邊非空,如 `arrAdd([1], [])`、`arrAdd(['a'], [])`、`arrAdd([], ['a'])`)回 `[]`;有元素的陣列仍各自須有 1 個有效數字,否則 throw 原訊息(`invalid arrs[索引]: …`／`invalid vec: …`).空進空出先於 `opt.base` 讀取(`opt` 不生效、不警告).
  3. `arrProduct`:容器含非陣列或陣列少於 2 個仍回 `null`(先於空陣列檢查);**其後任一輸入陣列為空陣列即 throw `invalid arrs[<第一個空陣列之索引>]: must contain a valid number`**(即使另一陣列長度不同或無有效數字:`arrProduct([1,2], [])`→ `arrs[1]`、`arrProduct(['a'], [])`→ `arrs[1]`、`arrProduct([1], [], [2])`→ `arrs[1]`);兩邊皆非空而長度不同仍回 `null`(不在本輪).`arrNorm` 先以 `chkValid` 擋空陣列與無有效數字,再以非空且有效之 `vec` 呼叫 `arrProduct(vec, vec)`,不受影響.
  4. 轉換函數(狀態模式 `opt.returnWithStateAndMsg === true`):輸入為空陣列(`Array` 且 `length === 0`)回 `{ state: 'success', msg: [] }`(每次新陣列);`ltdtkeysheads2mat` 不含表頭列(與預設模式一致).**預設模式一律不變**(空陣列仍回 `[]`);**非陣列仍為失敗**(狀態模式 `{ state: 'error', msg }`,預設模式 `[]`);**非空而 `isearr` 無效之陣列**(`[{}]`、`[null]`、`['']`、`[[]]`)仍為失敗;`mat2ltdt` 只有表頭列(列數少於 2)仍為失敗(不在本輪).
  5. **型別檢測與資料有無無關**(沿 `ltdtpull` 同日裁示):其他必須參數型別無效即使資料為空陣列仍為失敗——`keysmat2ltdt` 的 `keys` 無效(含 `[]`)先於 `mat` 為空之判定,仍 `invalid keys`;`ltdt2vrtsable` 的 `mergerowkeys` 非陣列仍 `invalid mergerowkeys`(`ltdt2vrtsable([], 'x', D)` 之錯誤訊息由 `invalid ltdt` 變為 `invalid mergerowkeys`,仍為 error).`ltdtkeys2mat` 的 `keys` 為選用(非陣列時由 `ltdt` 提取),`ltdt` 為空時不論 `keys` 為何皆 success.
  6. `getCsvStrFromData`:`data` 為 `[]` 回空內容——`bom` 開啟(預設)為只含 BOM(U+FEFF)之字串、關閉為 `''`(沿用 `getCsv` 之 `bom` 判定,與非空輸入同);**非陣列與非空而 `isearr` 無效之陣列**(`[null]`、`['']`、`[[]]`)仍回 `{ error: 'no data' }`.
  7. 每次回傳新陣列/新物件,不共用常數.
- 逐函數(`file:line` 為本輪工作樹;「改前」皆為 HEAD 實測,見報告〈使用者逐列確認表之實測〉):

| 函數:情形 | 改前 | 改後 | 位置 |
|---|---|---|---|
| `arrAdd`／`arrMulti`:所有輸入陣列皆 `[]`(含 3 個以上、帶 `opt`) | throw `invalid arrs[0]: …` | `[]` | `src/_arrNum.mjs:135-137`(`reduceArrs`) |
| `arrAccum([])` | throw `invalid vec: …` | `[]` | `src/arrAccum.mjs:46-48` |
| `arrAdd`／`arrMulti`／`arrAccum`:有元素但無有效數字 | throw | 不變 | `src/_arrNum.mjs:140`(`reduceArrs` 內 `chkValid`)、`:91-97`(`chkValid` 本體) |
| `arrAdd([1], [])`、`([], [1])`、`(['a'], [])`、`([], ['a'])` | `[]` | 不變(派工書原列「`['a']` 一邊仍拋錯」與 HEAD 實測不符,見報告需裁示 1) | `reduceArrs` 長度檢查 |
| `arrProduct`:任一邊為空陣列(`([1], [])`、`([], [1])`、`([1,2], [])`、`(['a'], [])`、三個陣列含空) | `null`(`([], [])` 為 throw) | throw `invalid arrs[<第一個空陣列索引>]: must contain a valid number` | `src/arrProduct.mjs:64`、`src/_arrNum.mjs:101-111`(新 `chkNotEmpty`)、`:85-87`(新 `errNoValid`,`chkValid` 改用) |
| `arrProduct([1,2], [3])`、含非陣列(`([], 'x')`) | `null` | 不變 | — |
| `arrMax([])`、`arrMin([])`、`arrNorm([])` | throw | 不變(守護:`arrMax.test.mjs:194`、`arrMin.test.mjs:194`、`arrNorm.test.mjs:56`,變異 G1~G3 殺死) | — |
| `ltdtkeys2mat([], keys, D)` | `{ state: 'error', msg: 'invalid ltdt' }` | `{ state: 'success', msg: [] }` | `src/ltdtkeys2mat.mjs:61-71` |
| `ltdtkeysheads2mat([], keys, kphead, D)` | 同上 | `{ state: 'success', msg: [] }` | `src/ltdtkeysheads2mat.mjs:55-65` |
| `ltdt2vrtsable([], mergerowkeys 有效, D)` | 同上 | `{ state: 'success', msg: [] }`(`mergerowkeys` 無效仍 error) | `src/ltdt2vrtsable.mjs:56-75` |
| `mat2ltdt([], D)` | `{ state: 'error', msg: 'invalid mat' }` | `{ state: 'success', msg: [] }` | `src/mat2ltdt.mjs:52-62` |
| `keysmat2ltdt(keys 有效, [], D)` | 同上 | `{ state: 'success', msg: [] }` | `src/keysmat2ltdt.mjs:55-65` |
| 5 個轉換函數:預設模式傳 `[]`、非陣列(有 `D`／無 `D`)、`keysmat2ltdt` 之 `keys` 無效 | `[]`／`error`／`[]`／`invalid keys` | 不變 | — |
| `getCsvStrFromData([])`／`([], true)` | `{ error: 'no data' }` | 只含 BOM(U+FEFF)之字串 | `src/getCsvStrFromData.mjs:75` |
| `getCsvStrFromData([], false)` | `{ error: 'no data' }` | `''` | 同上 |
| `getCsvStrFromData('x')` 等非陣列、`[null]` 等無效陣列 | `{ error: 'no data' }` | 不變 | — |

- 內部呼叫站逐站確認(2026-11-03;`ws286d-evidence/3-diff-result.log` 差分與 `6-excel-*.log` 實測):

| 站點 | 傳入值來源 | 是否依賴舊回傳 | 結論 |
|---|---|---|---|
| `ltdtDiff.mjs:868-869` `ltdtkeys2mat(ltdtOld/ltdtNew, keys, { empty })` | 已檢為物件陣列(可為 `[]`);**預設模式**(不給 `returnWithStateAndMsg`) | 空陣列預設模式回 `[]` 與改前相同;不讀 `state` | 無需改;差分 15000 列(含一邊或兩邊為空)0 差異 |
| `downloadExcelFileFromData.mjs:67` `ltdtkeysheads2mat(data)` | 前置 `isarr(data) && iseobj(get(data, 0))`,必為非空且首列為有效物件之陣列;預設模式 | 否 | 無需改;`downloadExcelFileFromData.test.mjs` 綠 |
| `getExcelWorksheetFromData.mjs:62` `ltdtkeysheads2mat(data)` | `every(data, iseobj)` 成立才呼叫(`data = []` 亦成立→傳 `[]`);預設模式 | `[]` 預設模式回 `[]` 與改前相同(`rows: []`) | 無需改;差分 10000 列(含 `[]`)0 差異 |
| `mat2ltdt.mjs` → `keysmat2ltdt(keys, data, D)` | `mat` 已檢列數 ≥2,`data = tail(mat)` 必為非空 | 否(僅 `r.state === 'error'` 時回報) | 無需改 |
| `ltdtkeysheads2mat.mjs` → `ltdtkeys2mat(ltdt, keys, D)` | `ltdt` 已檢非空(空陣列於本函數先行回傳) | 否 | 無需改 |
| `arrNorm.mjs:47,53` `chkValid`→`arrProduct(vec, vec, { base })` | `vec` 已經 `chkValid` 證實非空且有有效數字 | 否 | 無需改;`arrNorm([])` 仍 throw `invalid vec: …`(守護案+變異 V5/G3) |
| `arrProduct.mjs:70` → `arrMulti(...arrs, { base })` | `chkNotEmpty` 之後,陣列皆非空(或含非陣列者,`arrMulti` 回 `[]`→`null`) | 否 | 無需改 |
| `getDataFromExcelFileU8Arr.mjs:161` `getCsvStrFromData(sh.data, bom)` | `sh.data` 為 `to_array` 之陣列(`bom = false`);空工作表(含只有空儲存格者,hucre 讀為無列)為 `[]` | **依賴舊回傳**:空工作表之 csv `data` 由 `{ error: 'no data' }` 變 `''`(派工書已預告);`fmt='array'`／`'ltdt'` 空工作表仍 `[]` | 已含於改動;補 5 案(空工作表 csv ×3 〔`[]`、`valueToString:false`、只有空列〕、`array`／`ltdt` 不變、非空 csv 不變);差分 48 列空工作表 csv 皆 `''`、672 列非空 0 差異 |

- 盤點指令:`Grep pattern="chkNotEmpty|chkValid|n === 0" path=src glob="{_arrNum,arrAdd,arrMulti,arrAccum,arrProduct,arrNorm}.mjs"`;`Grep pattern="isarr\\((ltdt|mat|data)\\) && .*length === 0" path=src`(應命中 6 檔 6 站:5 個轉換函數與 `getCsvStrFromData`);`Grep pattern="\\.\\./src/(arrMax|arrMin)" path=test` 之守護案見上表.
- 測試(16 檔,HEAD 1050 → 1384 案,+334):`test/arrAdd`(35→40)、`arrMulti`(35→40)、`arrAccum`(11→14)、`arrProduct`(35→42)、`ltdtkeys2mat`(18→67)、`ltdtkeysheads2mat`(24→72)、`ltdt2vrtsable`(18→67)、`mat2ltdt`(24→71)、`keysmat2ltdt`(44→133)、`getCsvStrFromData`(1→28)、`getDataFromExcelFileU8Arr`(18→23)、`optValArrBase`／`isenumCallersArr`(案數不變,3 處＋2 處鎖定舊行為者改寫為空進空出)；`arrMax`／`arrMin`／`arrNorm` 測試檔未動(其 `[]` 守護案原已存在)；轉換函數之非陣列表重用 `test/tools/diffInputKit.mjs` 之 `NON_ARR`.執行:`npx mocha --no-parallel <上列 14 檔 + arrNorm、arrMax、arrMin>` 加內部呼叫端測試(`ltdtDiff`、`downloadExcelFileFromData`、`getExcelWorksheetFromData`、`getExcelU8ArrFromData`、`addExcelWorksheetFromData`、`getExcelWorkbookFromData`、`getltdtkeys`)與掃描類(`testStructure`、`optValG7optNumRetire`、`_srcBigIntLiteral`、`loadTrial`、`evemSafe`)共 30 檔.
- 驗證:見主控任務 `agent-out/ws286d-修正報告.md`(修前紅:新測試於未修之 HEAD src 上 1384 案中 43 紅、1341 綠;修後 30 檔 2696 案 0 failing;變異 35 項全部殺死〔含守護 `arrMax([])`／`arrMin([])`／`arrNorm([])` 改成不拋錯三項〕;前後差分 287020 列:有效域〔非空〕247230 列 0 差異、受影響域〔空陣列〕39790 列全符預測;eslint 0 error).
- 已知殘餘(未改,需裁示):①`arrAdd(['a'], [])`／`arrAdd([], ['a'])` 因容器(長度不同)先於有效數字檢查而回 `[]`,與派工書列「非空而無有效數字之一邊仍拋錯」不符(HEAD 即如此,測試已鎖;若要改為拋錯須動搖「容器先於有效數字」之既定順序);②`arrProduct` 兩邊皆非空而長度不同仍回 `null`(使用者明示不動);③`mat2ltdt` 只有表頭列(列數少於 2)仍為失敗、`keysmat2ltdt` 之 `keys = []` 仍為失敗(不在本輪,是否也視為「空資料」請使用者定);④`getExcelU8ArrFromData` 輸出之 zip 含時間戳,同一輸入隔秒位元組即不同(HEAD 對 HEAD 亦然,證據 `3-probe-zip-nondeterm.log`),涉及該函數之位元組比對須改比讀回內容.

## 第 221 項 §11 第 6 項 ws286e 處置結果(2026-11-03,陣列與結構子類 6 個函數:`arrFilterByENum`、`arrReverse`、`arrSep`、`matConcat`、`matat`、`ltdtpull`;必須參數無效即拋錯、空資料照常;第一級〔他套件 0 站點〕;主控任務 20261031121854 ws286e)

- 依據:使用者 2026-11-03(dspec〈輸入參數之檢測機制〉§11 第 6 項「陣列與結構子類」):「arrFilterByENum arrReverse arrSep matConcat matat ltdtpull 可再做 但需等前一次連動更新之後」＋逐列確認主控所列表;「ltdtpull([], 'x', 'id') A 仍報錯，因為 'x' 不是陣列。空陣列本身不報錯」→ **型別檢測與資料有無無關**:必須參數型別不對、缺少、給錯即拋錯(訊息不帶值),空陣列照常.前一輪(ws286d,wsemi 1.9.48)全庫連動已跑完並看過結果.主控查其他自有套件(含測試碼)這 6 個函數 0 站點;本輪以 `own-token-search` 重查(9211 檔)結果相同,wsemi `src/` 內亦無呼叫(僅各檔定義、JSDoc 與 `index.mjs` 匯出);wsemi 內僅測試碼有呼叫(6 個測試檔與 `intInputHang.test.mjs`＋子行程 `test/tools/intInputHangRunner.mjs` 之 `arrSep` 3 案).
- 規則(本節):
  1. 必須參數無效 throw `Error(固定訊息)`,不帶值(V19／V20),**依參數順序、每個參數先檢型別再檢元素**:`arrFilterByENum` 為 `invalid arr: must be an array`;`arrReverse` 為 `invalid vall: must be an array`;`arrSep` 為 `invalid arr: must be an array`、`invalid opt: must be a positive integer or an object with numCount or numGroup`(非物件且非有效整數)、`invalid opt.numCount or opt.numGroup`(設定物件,含 `{}`,`numCount` 與 `numGroup` 皆無效;**沿用既有訊息,維持**);`matConcat` 依序 `invalid mat1: must be an array`、`invalid mat1: must be an array of arrays`、`invalid mat2: must be an array`、`invalid mat2: must be an array of arrays`;`matat` 依序 `invalid mat: must be an array`、`invalid mat: must be an array of arrays`、`invalid istart: must be an integer index`;`ltdtpull` 依序 `invalid ltdtAll: must be an array`、`… must be an array of objects`、`invalid ltdtDel: must be an array`、`… must be an array of objects`、`invalid key: must be a non-empty string`.
  2. **空陣列為合法資料,不報錯**:`arrFilterByENum([])`、`arrReverse([])`、`arrSep([], 有效 opt)`、`matConcat([], [])`／`([[1]], [])`／`([], [[1]])`、`matat([], 有效 istart)`、`ltdtpull([], [], 'id')`／`([], [{id:1}], 'id')`／`([{id:1}], [], 'id')` 皆照舊;**型別檢測與資料有無無關**:`arrSep([])`、`arrSep([], 0)`、`matat([], 'x')`、`ltdtpull([], 'x', 'id')`、`ltdtpull([], [], '')` 仍拋錯(空陣列不豁免另一個必須參數).
  3. 元素檢測用 lodash `every`(依索引走訪,陣列空洞視為 `undefined` 而無效;`Array.prototype.every` 會略過空洞):`matConcat`／`matat` 各元素須為陣列(`isarr`),`ltdtpull` 各元素須為物件(`isobj`,與 `ltdtDiff` 同).
  4. `arrSep` 之 `opt`:有效整數(`iseint`,use `count`、min 1,數字字串亦可)為整數寫法,**舊式呼叫維持可用**(第 223 項另案);`isobj(opt)` 為設定物件(`{}` 亦是,原回 `[]`);其餘(未給、`0`、`null`、`''`、陣列、布林、函數、包裝物件、`Infinity`、超過 4294967295 等)throw 型別訊息.`arrSep` 之 JSDoc 參數名原寫 `num` 與簽名 `opt` 不符,已更正為 `opt`.
  5. `matat` 之 `istart` 為必須參數,判定與 `arrAt` 同(`iseint`,use `index`:0~4294967294,數字字串亦可),**負數、小數、`Infinity`、非數字字串一律 throw**;**超出各列長度屬資料範圍而非型別,維持該列回 `[]`**(`matat([[1,2]], 10)` 仍 `[[]]`);`iend` 為 opt 類(K3),非預期視為未給(只取 `istart` 一筆),不報錯.
  6. **未動:單一廣義無效元素之陣列**:`arrReverse`／`arrSep`／`matat` 於型別檢測通過後仍以 `isearr` 守門——空陣列與僅含單一廣義無效元素(`[null]`、`[undefined]`、`['']`、`[{}]`、`[[]]`、`[NaN]`)之陣列維持原行為回 `[]`(例:`arrReverse([null])` 回 `[]`,`arrReverse([null, null])` 回 `[null, null]`);此為既有怪行為(靜默丟資料),**不在使用者所列表,不改,列需裁示**.`arrFilterByENum`／`matConcat`／`ltdtpull` 原即用 `isarr`,無此問題.
  7. `ltdtpull`:`ltdtDel` 為 `[]` 時仍回 `ltdtAll` **本身**(非複本,維持);`@returns` 原寫「被刪除的物件陣列」不實,已更正為移除後剩餘之陣列.元素缺 `key`(兩邊皆缺時 `differenceBy` 視為相等而被一併移除,如 `ltdtpull([{a:1},{a:2}], [{b:1}], 'id')` 回 `[]`)為資料層行為,不在使用者所列表,不改,列需裁示.
  8. 每次回傳新陣列(`arrFilterByENum`、`arrReverse`、`matConcat`、`matat`、`arrSep`);`matConcat([[1]], [])` 之回傳列為新陣列.
- 逐函數(`file:line` 為本輪工作樹;「改前」皆為 HEAD 實測,見報告〈使用者逐列確認表之實測〉):

| 函數:情形 | 改前 | 改後 | 位置 |
|---|---|---|---|
| `arrFilterByENum`:非陣列(`'x'`、`null`、`undefined`、物件…) | `[]` | throw `invalid arr: must be an array` | `src/arrFilterByENum.mjs:47-50` |
| `arrFilterByENum([])`、`(['a'])` | `[]` | 不變 | — |
| `arrReverse`:非陣列 | `[]` | throw `invalid vall: must be an array` | `src/arrReverse.mjs:43-46` |
| `arrReverse([])` | `[]` | 不變(每次新陣列) | `:48-51` |
| `arrSep`:`arr` 非陣列 | `[]` | throw `invalid arr: must be an array` | `src/arrSep.mjs:53-56` |
| `arrSep([1,2,3])`、`(…, 0)`、`(…, null)`、`(…, '')`、`(…, [])`、`(…, Infinity)`、`(…, 2 ** 32)`、`([])`、`([], 0)` | `[]` | throw `invalid opt: must be a positive integer or an object with numCount or numGroup` | `:58-62` |
| `arrSep([1,2,3], {})`、`([], {})`、`([], { numGroup: 0 })` | `[]` | throw `invalid opt.numCount or opt.numGroup`(`([1,2,3], { numGroup: 0 })` 原即此訊息,維持) | `:75-81` |
| `arrSep([], 2)`、`([], { numGroup: 2 })`、`([null], 2)` | `[]` | 不變 | `:84-87` |
| `matConcat`:`mat1`／`mat2` 非陣列(含缺 `mat2`) | `[]` | throw `invalid mat1|mat2: must be an array` | `src/matConcat.mjs:66-69`、`:73-75` |
| `matConcat([1],[2])`、`([1],[])`、`([[1]],[2])`、含 `null` 列 | `[[]]`／`[[]]`／`[[1]]`／補 `null` | throw `… must be an array of arrays` | `:70-72`、`:76-78` |
| `matConcat([],[])`、`([[1]],[])`、`([],[[1]])` | `[]`／`[[1]]`／`[[1]]` | 不變 | `:81-83` |
| `matat`:`mat` 非陣列 | `[]` | throw `invalid mat: must be an array` | `src/matat.mjs:43-46` |
| `matat([1,2], 0)`、`([[1,2], null], 0)` | `[[], []]`／`[[1], []]` | throw `invalid mat: must be an array of arrays` | `:47-49` |
| `matat([[1,2]], 'x')`、`(…, undefined)`、`(…, -1)`、`(…, 1.5)`、`(…, Infinity)`、`([], 'x')` | `[[]]`／`[[]]`／`[[]]`／…／`[]` | throw `invalid istart: must be an integer index` | `:51-54` |
| `matat([[1,2]], 0, 'x')`、`(…, 1, -10)`、`([[1,2]], 10)`、`([], 0)` | `[[1]]`／`[[2]]`／`[[]]`／`[]` | 不變 | `:56-63` |
| `ltdtpull`:`ltdtAll`／`ltdtDel` 非陣列 | `[]` | throw `invalid ltdtAll|ltdtDel: must be an array` | `src/ltdtpull.mjs:42-51` |
| `ltdtpull(['x'], [], 'id')`、`([{id:1}], ['x'], 'id')`、含 `null`／陣列／`Date` 元素 | `[]` | throw `… must be an array of objects` | `:46-48`、`:52-54` |
| `ltdtpull`:`key` 非非空字串(含缺少、`''`、`['id']`) | `[]` | throw `invalid key: must be a non-empty string` | `:55-57` |
| `ltdtpull([],[],'id')`、`([],[{id:1}],'id')`、`([{id:1}],[],'id')`(回 `ltdtAll` 本身) | `[]`／`[]`／`[{id:1}]` | 不變 | `:59-62` |

- 內部呼叫站逐站確認(2026-11-03;`own-token-search arrFilterByENum arrReverse arrSep matConcat matat ltdtpull`,9211 檔):

| 站點 | 結論 |
|---|---|
| wsemi `src/`(含 `index.mjs`) | 6 個函數於 `src/` 內只有各自定義、JSDoc 與 `index.mjs` 匯出,**0 個呼叫**;`matat` 內部呼叫 `arrAt`(未改,其 `istart` 無效仍回 `[]`,但本函數先行 throw 故不可達) |
| 其他自有套件(含測試碼) | **0 站點**(`own-token-search` 結果僅 wsemi 自身) |
| wsemi 測試碼 | 6 個測試檔;`intInputHang.test.mjs`＋`test/tools/intInputHangRunner.mjs` 之 `arrSep-num-inf`／`arrSep-num-str-inf`／`arrSep-num-2p32` 原期望 `{ ret: [] }`,改為期望 throw(`tryThrow`);其餘測試無引用 |

- 盤點指令:`node C:/opensrcOper/tools/own-token-search.mjs arrFilterByENum arrReverse arrSep matConcat matat ltdtpull`;`Grep pattern="throw new Error\\('invalid (arr|vall|opt|mat1|mat2|mat|istart|ltdtAll|ltdtDel|key)" path=src glob="{arrFilterByENum,arrReverse,arrSep,matConcat,matat,ltdtpull}.mjs"`(應命中 6 檔 17 站);`Grep pattern="every\\((mat1|mat2|mat|ltdtAll|ltdtDel)," path=src`(元素檢測 5 站,皆 lodash `every`).
- 測試(7 檔,HEAD 243 案 → 637 案,+394;`mocha --dry-run` 計案數):`test/arrFilterByENum`(56→74)、`arrReverse`(18→46)、`arrSep`(95→132)、`matConcat`(9→111)、`matat`(14→107)、`ltdtpull`(19→135)、`intInputHang`(32→32,案數不變,3 案改期望 throw);共用 `test/tools/diffInputKit.mjs`(`NON_ARR`、`NON_OBJ_ELEM`、`LEAK`、`throwsMsg`、`throwsMsgNoLeak`).鎖定舊行為者改寫:`arrSep` 之無效整數寫法、缺參數與非陣列(原斷言 `[]`)改為 throw;`arrReverse`／`matConcat`／`matat`／`ltdtpull` 非陣列與缺參數原斷言 `[]` 改為 throw;`matat` 之 `-1`／`-10` 3 案原斷言 `[[], []]` 改為 throw.
- 驗證:見主控任務 `agent-out/ws286e-修正報告.md`(修前紅:新測試於未修之 HEAD src 上 637 案中 439 紅、198 綠;修後 637 案 0 failing;受影響 13 檔〔含 `arrAt`、`testStructure`、`optValG7optNumRetire`、`_srcBigIntLiteral`、`loadTrial`、`evemSafe`〕894 案 0 failing;變異 49 項全部殺死、0 存活;前後差分 210000 列:有效域 93048 列 0 差異、受影響域 116952 列全符預測;eslint 除 `arrReverse.mjs` 既有 4 個未使用 import 外 0 error).
- 已知殘餘(未改,需裁示):①`arrReverse`／`arrSep`／`matat` 對單一廣義無效元素之陣列(`[null]` 等)維持 `isearr` 守門而回 `[]`(靜默丟資料,不在使用者所列表);②`matat` 負數／小數／`Infinity` 之 `istart` 改為 throw(使用者所列僅 `'x'`,依 K2 同判 `iseint` index 無效),請使用者確認;③`arrSep` 設定物件無效之訊息 `invalid opt.numCount or opt.numGroup` 不合 V19 格式(依派工書維持);④`ltdtpull` 元素缺 `key` 時以 `undefined` 視為相等而一併移除;⑤`arrReverse.mjs` 既有 4 個未使用 import(`isstr`、`isbol`、`isnum`、`isobj`,eslint no-unused-vars,HEAD 即有,只提出未刪).
