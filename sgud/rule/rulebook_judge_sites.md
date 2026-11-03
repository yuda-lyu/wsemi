# wsemi src 可改用 isenum / iseint 之計算類站點盤點(唯讀,只列不改)

- 盤點日期:2026-10-31
- 範圍:`src/*.mjs`;已排除 isnum / isint / ispint / isp0int / isenum / iseint / _numOpt / _numRange / index(_numOpt、_numRange 內本無站點);不含 `docs/`、`test/`
- 方法:Grep `\b(isnum|isint|ispint|isp0int)\(` 逐站讀上下文(約前後 10 行,必要處追到下游用法);另補一處以回調傳入、非呼叫式之 `arrFilterByNum.mjs:40`(`filter(arr, isnum)`);`arrReverse.mjs` 僅 import isnum、無呼叫,不計
- 站點總數:**217**(Grep 命中 216 行、125 檔;其中 5 行為註解;+ 回調型 1)
- 符合數:**191**(符合「值被用於計算/計時/埠號/索引/個數/位數…」者;其中 9 處為符合用途但建議保留現行判定);不符合 26(列於第 7 節)
- 各分節數量:1 計時毫秒 30 / 2 埠號 1 / 3 索引位置切片 8 / 4 個數長度次數 51 / 5 位元進位位數年份時間戳 13 / 6 一般數值運算 88 / 7 不符合 26(不計入符合數)
- 狀態統計(符合 191 之內):建議改 140 / 待確認 42 / 建議保留 9
- 本檔未修改 src、test,未執行測試,無 git 寫入

## 共通說明(各列「風險」欄以代號引用)

- **R-NUM**(原判定為 isnum):現收 Infinity、-Infinity、'Infinity'、'0x10' / '0b11' / '0o7'、包裝物件 `new Number(1)`、'1e-400'(下溢為 0);isenum 一律拒收。其後 `cdbl(v)`(lodash toFinite)會把 Infinity 轉成 Number.MAX_VALUE 繼續算,改後在入口即被擋。
- **R-INT**(原判定為 isint / ispint / isp0int):現經 `cdbl` → lodash isInteger,故收 Infinity(→MAX_VALUE)、'0x10'、2**60 等非安全整數、'1.0000000000000001' 與 '9007199254740993'(精度遺失後仍判整數)、包裝物件;iseint 一律拒收。ispint 另要求 >0、isp0int 另要求 >=0,於 iseint 以 `use` 或 `min` 表達。
- **P-CLAMP**(計時毫秒常見樣式):現行 `ispint(x) → cint(x) → Math.min(x, cst.TIMER_TIME_MAX)`,超大值夾至上限(專案慣例:超大值之意圖為「很久」,見 `_optNum.mjs` 註解)。
  - 式 A(行為最接近):`iseint(x, { min: 1 })` 並保留 `Math.min` 夾制;安全整數範圍內大於 2147483647 者仍被夾至上限。
  - 式 B:`iseint(x, { use: 'timer', min: 1 })` 可刪 `Math.min`,但 >2147483647 改回預設值而非夾上限。
  - 兩式共通風險:Infinity 與 >2**53 之值現被夾至上限(視為很久),改後回預設值。
  - 凡值不進原生計時器(僅與時間差比較)者,不套 `use: 'timer'` 之上限。
- **取值**:判定通過後,現有 `cint(v)` / `cdbl(v)` 對有效值與 `Number(v)` 等價(cint 對整數不變),可保留不動。
- **opt 非預期之輸入視為未給**(dspec 2026-10-31 13:57 更新,本表盤點時為「不合即 throw」,現已改):isenum / iseint 的第二參數 opt 非預期者(含 filter / every / some 傳入之索引、陣列)視為未給、改用預設,不拋錯,`opt.debug === true` 時警告;故可直接當回調傳入,但慣例仍建議包成 `(v) => isenum(v)`。
- **超出範圍之處置(dspec K3 〈超出範圍亦同〉,2026-10-31 13:57 新增)**:opt 鍵之值超出其種類之範圍(如計時毫秒超過 2147483647)視為未給、改用預設;原「夾至 `TIMER_TIME_MAX`」之寫法(wsemi 16 檔,即本表 P-CLAMP 所列)隨第 221 項改為改用預設。故下列各「式 A(保留 `Math.min` 夾制)」建議依規格應改採「式 B(`use: 'timer'`,超過者回預設)」;式 A 僅作為過渡或行為最接近之備案。
- 狀態欄:**建議改**=可直接換,風險已列;**待確認**=行為取捨需裁示或有耦合/缺陷待先處理;**建議保留**=符合用途但現行判定有文件或契約依賴,不建議換。

---


## 索引(哪類查哪檔)

2026-11-02(ws272c)依全域設定 §14 整理: 本檔原約 81.2KB,現依類型拆為下列各檔(同目錄);各節之節號與標題不變、內容逐字搬移.本檔只留標題、〈共通說明〉(各列「風險」欄之代號)與本索引.新增之處置結果節附於 `rulebook_judge_sites_r2c.md` 末(該檔逾 30KB 時再抽出新檔).

| 類 | 檔 | 節 | 約 KB |
|---|---|---|---|
| 判斷類站點全集——§1 計時毫秒、§2 埠號、§3 索引／位置／切片、§4 個數／長度／次數、§5 位元／進位／位數／年份／時間戳 | `sgud/rule/rulebook_judge_sites_inv_a.md` | §1~§5 | 21.8 |
| 判斷類站點全集——§6 一般數值運算、§7 不符合、實作時須先處理之耦合與缺陷 | `sgud/rule/rulebook_judge_sites_inv_b.md` | §6、§7 與〈實作時須先處理之耦合與缺陷〉 | 18.4 |
| 判斷類站點之處置結果——第 221 項第一批、第二批第一級發布 A、已知缺陷先修(ws270) | `sgud/rule/rulebook_judge_sites_r1.md` | 〈第 221 項第一批處置結果〉、〈第 221 項第二批第一級發布 A 處置結果〉、〈第 221 項已知缺陷先修(ws270)處置結果〉 | 16.8 |
| 判斷類站點之處置結果——第 221 項第 2 輪(ws272a、ws272b) | `sgud/rule/rulebook_judge_sites_r2.md` | 〈第 221 項第 2 輪 ws272a 處置結果〉、〈…ws272b 處置結果〉 | 22.2 |
| 判斷類站點之處置結果——第 221 項第 2 輪(ws272c)、第 3 輪(ws271)、§11 第 6 項(ws286a 第一類、ws286b;新增之處置結果節附於本檔末,逾 30KB 時再抽出新檔;本檔 ws286b 後已逾 30KB,其後新增節請另開 `rulebook_judge_sites_r2d.md` 並於本索引增列) | `sgud/rule/rulebook_judge_sites_r2c.md` | 〈第 221 項第 2 輪 ws272c 處置結果〉(新增節,非搬移)、〈第 221 項第 3 輪 ws271 處置結果〉(新增節)、〈第 221 項 §11 第 6 項第一類 ws286a 處置結果〉(新增節)、〈第 221 項 §11 第 6 項 ws286b 處置結果〉(新增節) | 33.8 |
| 判斷類站點之處置結果——第 221 項 §11 第 6 項(ws286c;新增之處置結果節附於本檔末,逾 30KB 時再抽出新檔) | `sgud/rule/rulebook_judge_sites_r2d.md` | 〈第 221 項 §11 第 6 項 ws286c 處置結果〉(新增節) | 9.0 |

各節對應(節號與標題不變):

- `## 1 計時毫秒(30)`、`## 2 埠號(1)`、`## 3 索引 / 位置 / 切片(8)`、`## 4 個數 / 長度 / 次數(51)`、`## 5 位元 / 進位 / 位數 / 年份 / 時間戳(13)` → `rulebook_judge_sites_inv_a.md`
- `## 6 一般數值運算(88)`、`## 7 不符合(26,不計入符合數)`、`## 實作時須先處理之耦合與缺陷(摘要,皆未處理)` → `rulebook_judge_sites_inv_b.md`
- `## 第 221 項第一批處置結果(wsemi221a,…)`、`## 第 221 項第二批第一級發布 A 處置結果(wsemiA,…)`、`## 第 221 項已知缺陷先修(ws270)處置結果(…)` → `rulebook_judge_sites_r1.md`
- `## 第 221 項第 2 輪 ws272a 處置結果(…)`、`## 第 221 項第 2 輪 ws272b 處置結果(…)` → `rulebook_judge_sites_r2.md`
- `## 第 221 項第 2 輪 ws272c 處置結果(…)`(新增節,非搬移;其後之處置結果節亦附於該檔) → `rulebook_judge_sites_r2c.md`
- `## 第 221 項第 3 輪 ws271 處置結果(…)`(新增節,非搬移;`interp1`、`arrGroupByMaxmin`、`arrLookupByMaxmin`、`strTruncate`、`domFadeIn`) → `rulebook_judge_sites_r2c.md`
- `## 第 221 項 §11 第 6 項第一類 ws286a 處置結果(…)`(新增節,非搬移;`domIsFocused`、`domAppend`、`domPrepend`、`copyStrToClipboard` 與三個內部呼叫端) → `rulebook_judge_sites_r2c.md`
- `## 第 221 項 §11 第 6 項 ws286b 處置結果(…)`(新增節,非搬移;`getTimeRange`、`rep`、`replaceObj`、`replacePlus`、`sepInt`、`cfilesize` 與 5 處文件修正) → `rulebook_judge_sites_r2c.md`
- `## 第 221 項 §11 第 6 項 ws286c 處置結果(…)`(新增節,非搬移;差異比對子類 `strDiff`、`strDiffToHtml`、`arrDiff`、`matDiff`、`ltdtDiff` 與其內部呼叫鏈逐站確認) → `rulebook_judge_sites_r2d.md`
