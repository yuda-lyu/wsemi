# 規則帳本(判斷類站點之處置結果——第 221 項第一批、第二批第一級發布 A、已知缺陷先修(ws270))

本檔自 `sgud/rule/rulebook_judge_sites.md` 抽出(2026-11-02 整理,ws272c,全域設定 §14):〈第 221 項第一批處置結果〉、〈第 221 項第二批第一級發布 A 處置結果〉、〈第 221 項已知缺陷先修(ws270)處置結果〉逐字搬移、節號與標題不變;風險代號(〈共通說明〉)與各檔索引見 `sgud/rule/rulebook_judge_sites.md`.

## 第 221 項第一批處置結果(wsemi221a,2026-10-31,規則 R-ENUM-CALLERS-01)

- 依據:使用者 2026-10-31 指示「先處理:一、無效時的處理不變,只是判斷界線收緊;二、計算函數:無效時報錯,這點不變,只是判斷界線收緊;三、廣義數字陣列的計算.…四至七等 wsemi 改好、自有套件連動改完,再來接著處理」.
- **本節為實際處置;上方各表之「建議」「狀態」欄為盤點當時(2026-10-31 上午)之建議,二者不同處以本節為準**(見〈與盤點建議不同者〉).
- 行號為盤點當時(`src` 改前)之行號;改後行號已位移,以函數名定位.
- 已套 **37** 站;**未套**(本批不動):其餘各節全部站點,及下列 5 站:`dig.mjs:34`、`digExp.mjs:28`、`cfinancial.mjs:33`(`idig`,屬第四～七段)、`preciseNum.mjs:89`(`isint` 整數路徑分流,盤點即建議保留)、`estimateTicks.mjs:422`(`isint`,非本批).

| 檔:行(盤點時) | 處置(狀態) | 備註 |
|---|---|---|
| sind.mjs:75、cosd.mjs:75、tand.mjs:75 | `isnum`→`isenum`,取值 `Number(deg)`;無效仍 `null`(**已套**) | |
| secd.mjs:76、cscd.mjs:76、cotd.mjs:76 | 同上(**已套**) | |
| asind.mjs:45 | `isenum(v)`(**已套**) | 超出 [-1,1] 仍回 `NaN`(未加 min/max) |
| atand.mjs:57 | `isenum(v)`(**已套**,盤點原建議保留) | 使用者裁定三角函數收緊;JSDoc 範例 `atand(±Infinity)` 改 `null` |
| atan2d.mjs:58、atan2d.mjs:62 | `isenum(x)`、`isenum(y)`(**已套**,盤點原建議保留) | 同上 |
| round.mjs:120、ceil.mjs:75、floor.mjs:75 | `isenum(v)`,字串去頭尾空白後交 Decimal;無效 `''`(**已套**) | 原 `round(' 30 ')` 拋 DecimalError 一併消除 |
| round.mjs:108、ceil.mjs:69、floor.mjs:69 | `isp0int(idig)` → `iseint(idig, { use: 'digits' })`,無效用 0(**已套**,盤點原為待確認) | 使用者指定 `digits`(0~100);101 以上由可用改回 0 |
| dig.mjs:31、digExp.mjs:25、cfinancial.mjs:30、cfilesize.mjs:36 | `isenum`,取值 `Number(…)`;無效 `''`(**已套**) | `cfinancial` 之檢測與 `dig` 內重複(等價) |
| judge.mjs:119、judge.mjs:122 | `isenum(x1)`、`isenum(x2)`,字串去頭尾空白;無效 throw 訊息不改(**已套**,盤點原為待確認) | 包裝物件由放行改 throw |
| preciseNum.mjs:78 | `isenum(v)`,字串去頭尾空白;無效 throw 訊息不改(**已套**,盤點原為待確認) | 移除包裝物件拆包之分支(孤兒) |
| estimateTicks.mjs:230、estimateTicks.mjs:236 | `isenum`,取值 `Number(…)`;無效 throw 訊息不改(**已套**) | 必然之限制見 JSDoc |
| color.mjs:252、color.mjs:258、color.mjs:274、color.mjs:341 | `isnum`→`isenum`,取值 `Number(…)`(**已套**) | 341 依派工單用 `isenum`(盤點建議 `iseint(c, { use: 'byte' })`;`parseInt` 結果本為整數或 NaN,等價) |
| color.mjs:965、color.mjs:986 | `isint`→`iseint(num)`(默認 `safe`),取值 `Number(num)`(**已套**) | 盤點為待確認(負數是否維持):用默認 `safe`,負數仍收(回 `[rgba]`);連帶修掉 `Infinity` 使迴圈不結束 |
| arrAdd.mjs:26、arrAdd.mjs:27 | `isenum`,**非有效數字以 0 計算**(**已套**,盤點原為「略過」) | 同位置皆非有效數字由 `null` 改 0 |
| arrMulti.mjs:26、arrMulti.mjs:27 | `isenum`,**非有效數字以 1 計算**(**已套**) | 同位置皆非有效數字由 `null` 改 1;連動 `arrProduct`、`arrNorm` |
| arrMax.mjs:110、arrMin.mjs:110 | `isenum`,取值 `Number(…)`;**無有效數字 throw**(**已套**,盤點原為「略過、回 null」) | 非陣列、空陣列亦 throw |

### 與盤點建議不同者(使用者 2026-10-31 裁定)

1. `atand`、`atan2d`:盤點建議保留 `isnum`(JSDoc 範例±90) → 使用者定三角函數收緊,改 `isenum`,範例改 `null`,2＋2 個既有測試改期望.
2. `round`／`ceil`／`floor` 之 `idig`:盤點待確認(`digits` 或 Decimal 上限) → 使用者指定 `digits`;連動 `estimateTicks`(`rmin === rmax` 且刻度間距小數位數 > 100,即絕對值 < 約 1e-99〔12 位有效數字時約 1e-89〕時 `tickInterval` 為 0).
3. `judge`／`preciseNum`:盤點待確認 → 使用者指定改 `isenum`.
4. `arrMax`／`arrMin`:盤點「略過」 → 使用者「若沒法計算與回傳結果,那就報錯」:無有效數字 throw.
5. `arrAdd`／`arrMulti`:盤點「當缺值略過(結果 `null`)」 → 使用者「非有效數字以該函數之預設值計算」:0／1.

### 本批連動、不在原站點全集內者

- `arrProduct`、`arrNorm`(皆未改)經 `arrMulti` 連動,見 R-ENUM-CALLERS-01〈已知限制／連動〉.(第二批第一級發布 A 已依 §11 第 15 項改定,見下節.)

---

## 第 221 項第二批第一級發布 A 處置結果(wsemiA,2026-10-31,規則 R-OPT-VAL-01,檔 `rulebook_optval.md`)

- 依據:使用者 2026-10-31 改定流程(第一級＝下游 0 站點之函數先做;第二級＝確認所有下游站點之呼叫都不用改者;第三級＝一次改一個函數,先改下游套件)與 wsemi221b 完成版(主控備份 `wsemi221b-backup\`)之規格;**本節為實際處置;上方各表之「建議」「狀態」欄為盤點當時之建議,以本節為準**.下游站點依據 `agent-out/wsemi221b-evidence/downstream.md` §1.
- **已套(本輪 A,wsemiA2 起已不含 `execCliSession`;改用 `optVal`／`isenum`／`iseint`)**:

| 第 | 檔(盤點時行號見上方各表) | 處置(`_optVal.mjs` 之規則) | 備註 |
|---|---|---|---|
| 1 | setTimeoutHp.mjs、setIntervalHp.mjs | `interval`(預設 1):**`isenum { use:'positive' }`(>0,不設上限)**;非預期改用 1 毫秒並照常啟動(原不啟動、回 `null`／空函數) | 主控裁定(221b 報告 §8.2 第 1、16 項):不交給原生計時器,大於 2147483647 之有限正數照原值等待 |
| 1 | fsEvem.mjs、fsWatchFile.mjs | `opt.timeInterval`(預設 100)、`opt.timeBinaryInterval`(預設 300):**`iseint { use:'timer', min:1 }`**(交給 chokidar,小數亦屬非預期),取消夾限 | `fsEvem` 轉交 `fsWatchFolder`(1.9.36 原碼)者為已解析之有效整數 |
| 2 | _execPortPids.mjs(execProcessPortPids／Sync 共用) | **必須參數** `port`:`iseint(port, { use:'port' })`,取值 `Number(port)`,處置不變(reject／null);包裝物件、`'0x50'` 改為不合法 | `_execPortPids.mjs` 之 `timeout` 不在清單 |
| 4 | fsGetFileHashCore.mjs、fsGetFileXxHashCore.mjs | `chunkSize`(預設 64MB):`iseint { use:'count', min:1, max: 2**30 }` | `getFileBasicHash`／`getFileXxHash`(Blob 版,有 `Infinity` 邊界)與 `getFileHash`(僅 JSDoc,轉交前二者)維持原碼 |
| 4 | pseudoRandomIntsRange.mjs、pseudoRandomsRange.mjs、randomIntsRange.mjs、randomsRange.mjs | `n`(預設 1):`iseint { use:'count', min:1 }` | `Ndp` 系有 `Infinity` 邊界,維持原碼 |
| 5 | digExp.mjs、cfinancial.mjs | `idig`(預設 0):`iseint { use:'digits' }`,**非預期改用 0**(原回 `''`) | `dig.mjs` 有下游站點(第三級),維持原碼;二者轉交 `dig` 者為已解析之有效 `idig` |
| 6 | domVirtualCreate.mjs | `opt.width`／`opt.height`(預設 `null`=不設定):`isenum { use:'nonnegative' }` | |
| 6 | domFadeOut.mjs | `opt.duration`(預設 500):`isenum { use:'nonnegative' }`,**非預期或負數用 500**(原 `'abc'` 為 0、負數為 1000) | `domFadeIn` 有下游站點,維持原碼;`opt.delay`、`opacityIni` 不在清單 |
| 6 | randomRange／randomsRange／randomIntsRange 與 pseudoRandomRange／pseudoRandomsRange／pseudoRandomIntRange／pseudoRandomIntsRange | `vstart`／`vend`:實數 `isenum`、整數 `iseint { use:'safe' }`;`vstart > vend` 仍 throw | 預設 0／1(實數)、0／100(整數);`randomIntRange`(有下游站點)、`randomIntsNdpRange`／`pseudoRandomIntsNdpRange`(`Infinity` 邊界)維持原碼 |
| 6 | arrAccum.mjs | **`opt.base`**(預設 0):非有效數字以 base 代入,輸出與輸入逐筆對應;至少 1 個有效數字否則 throw | 第 15 項 |

- **新增或擴充**:`arrFilterByENum`(新增,基於 `isenum`);`arrAdd`(base 0)、`arrMulti`(1)、`arrAccum`(0)、`arrProduct`(0,傳 `base: 0` 給 `arrMulti`)、`arrNorm`(0,傳 `base: 0` 給 `arrProduct`)之 `opt.base` 與「每個輸入陣列至少 1 個有效數字」(內部 `_arrNum.mjs`),**尾端 `undefined`／`null` 視為未給 opt**(`arrAdd`／`arrMulti`／`arrProduct`);`preciseNum` 整數路徑(第 16 項).
- **未套(本輪 A 排除,維持 1.9.36 原碼;待其後各輪)**:
  - `Infinity` 邊界(wsemi221b 報告 §8.1 之 14 處,函數整個不納入):`alive`、`cacheSt`、`execCli`、`execCliJsonRpc`、`fsTask`、`fsTreeFolderCore`、`isUserPw`、`strmid`、`domShowImages`、`randomIntsNdpRange`、`pseudoRandomIntsNdpRange`、`cacheBd`、`getFileBasicHash`、`getFileXxHash`、`debounce`、`pmDebounce`、`fsDeleteFileSafeCore`、`fsDeleteFolderSafeCore`、`pmMap`.
  - 待決第 8 項之 9 站所屬函數:`cache.timeExpired`、`cacheBd.nMax`、`cacheSt.attemptNum`、`waitFun.attemptNum`、`execCli.maxRetries`、`domGetFiles`／`domShowInputAndGetFiles`／`domShowInputAndGetFilesU8Arrs` 之 `sizeMbLimit`.
  - **`execCliSession`(wsemiA2 移出;第三級,與 `execCliJsonRpc` 同批)**:`opt.timeoutMs`、`opt.exitGraceMs`、`opt.killWaitMs`(上方盤點之 execCliSession.mjs:164／168／172)維持 1.9.36 原碼(`ispint`／`isp0int` 加 `Math.min` 夾至 2147483647);原因: 其改動連帶改變 `execCliJsonRpc` 於 `timeoutMs`／`exitGraceMs` 為 `Infinity`／超過 2147483647 時之行為(整體逾時由夾至 2147483647 改不限時;寬限由 2147483647 改 2000),下游 `w-dispatch-ai` 以 `castPintOr` 直送 `timeoutMs`,須先改下游(使用者流程:第三級一次一函數、先改下游).
  - 有下游站點(第二、三級):`dig`、`delay`、`pmTimeout`、`evEmitDelay`、`cache`、`waitFun`、`fsWatchFolder`、`execProcess`、`genID`、`queue`、`pmQueue`、`getErrorMessage`、`strleft`(連帶 `strdelright` 不改)、`randomIntRange`、`domRipple`、`domDrag`、`domFadeIn`、`domConvertToPic`、`domShowInputAndGetFiles*`、`fsDeleteFolderSafe`、`fsGetFileXxHash` 等.
- **其餘盤點站點(本批範圍外,仍沿用 `isnum`／`isint`／`ispint`／`isp0int`)**:三角以外之 `arrAt`、`arrInsert`、`arrPullAt`、`arrSep`、`arrSort`、`arrFilterByNum`、`bufRead`、`bufWrite`、`str2sha`、`addMonth`、`isDate`、`getBufferSize`、`strright`、`strdelleft`、`strdelright`、`strTruncate`、`rep`、`repObj`、`sepInt`、`rang`、`interp1` 等,及第 6 節其餘一般數值運算站點(**其中 `arrSep`、`bufRead`、`addMonth`、`sepInt` 已於下節〈第 221 項已知缺陷先修(ws270)處置結果〉處理**).

---

## 第 221 項已知缺陷先修(ws270)處置結果(2026-11-02,規則 R-OPT-VAL-01／R-ENUM-CALLERS-01 之延伸;主控任務 20261102112347 ws270)

- 依據:使用者 2026-11-02 裁示「先改已知問題」「照做,7 個函數一輪」;主控盤點清單(`C:\opensrcOper\tmp\judgeList\wsemi-judge-list.md` 該 7 函數之節);規格 dspec〈輸入參數之檢測機制〉§3.1 `iseint`、§7.1 必須參數與 opt 類、K2、K3、§11(**`Infinity` 一律非預期**).**失敗通道一律維持各函數現行者**(`[]`／`''`／`null`／throw,不改回傳型別;dspec P1).下游站點:`getFileBasicHash`／`getFileXxHash` 經 `getFileHash` 內部轉交,`getFileXxHash` 被 `w-converhp` 呼叫 17 處(皆不傳 `chunkSize`);`strmid` 之內部呼叫端 `color.mjs` 以字面值 `s` 為 0、1、2、4、6 與 `n` 為 1、2 呼叫(行為不變);`bufRead` 之內部呼叫端 `bufReadDbl`(固定 mLen 52、nBytes 8)與其下 `u8arr2obj`(以 `lengthHead` 之失敗路徑核對,見破壞性變更第 52 項);其餘 0 站點.
- 已套 7 個函數(行號以函數名定位):

| 函數 | 參數(性質) | 判定(單一擁有者) | 失敗通道 | 修前 → 修後(實測) |
|---|---|---|---|---|
| `sepInt` | `v`、`n`(必須) | `iseint(v)`;`iseint(n, { use:'count', min:1 })`;通過後 `Number()` | `[]`(維持) | `sepInt(10, Infinity)`／`2**32`／`MAX_SAFE_INTEGER`／`1e21`:修前不終止(陣列無限成長,子行程 OOM,離開碼 134)→ `[]`;`sepInt(Infinity, 3)`:修前 `[Infinity×3]` → `[]`;`'0x3'`、`new Number(3)`、`3n`、`true` 為 n → `[]`;`'3'`、`' 3 '`、`'1e2'`(v)照常 |
| `getFileBasicHash` | `opt.chunkSize`(opt 類,預設 64MB) | `optVal` + `{ kind:'eint', chk:{ use:'count', min:1, max:2**30 } }`(同 `fsGetFileHashCore`);`opt.debug`／`funLog` 警告 | 非預期改用預設、不報錯(維持) | `chunkSize` 為 `0`／`-1`／`'0'`:修前 `offset += chunkSize` 不前進,不終止(子行程逾時)→ 與預設相同之雜湊;`Infinity` 修前一次切整檔 → 預設;`'0x10'`、`0.5`、`2**30+1`、包裝物件 → 預設 |
| `getFileXxHash` | 同上 | 同上 | 同上 | 同上(`getFileHash` 之 `type:'xxhash64'` 與其他 type 亦經此二函數,JSDoc 同步) |
| `strmid` | `s`(必須,索引);`n`(opt 類,預設 1) | `iseint(s, { use:'index' })` 後 `Number()`;`n` 用 `optVal` + `{ use:'count', min:1 }`(位置參數無 opt 物件,不警告) | `s` 無效 `''`(維持);`n` 非預期用 1 | `strmid('abcdef','1','2')`:修前 `'bcdef'`(`s + n` 字串相加成 `'12'`)→ `'bc'`;`strmid('abcdef', 1, Infinity)`:`'bcdef'` → `'b'`(使用者裁定 `Infinity` 非預期);`n` 為 `'0x3'`、`2**32`、`1.5`、包裝物件 → 1 |
| `arrSep` | `opt`(整數寫法)、`opt.numCount`、`opt.numGroup`(必須) | `iseint(x, { use:'count', min:1 })`,通過後 `Number()`;**整數寫法不移除**(第 223 項日後處理) | 整數寫法無效 `[]`;設定物件二鍵皆無效 throw `invalid opt.numCount or opt.numGroup`(維持) | `arrSep([1..8],'2')`:修前 `[[1,2],[]]`(`i += '2'` 字串相加)→ `[[1,2],[3,4],[5,6],[7,8]]`;`{numGroup:'3'}` → `[[1,4,7],[2,5,8],[3,6]]`;`Infinity`／`'Infinity'`／`2**32`:修前迴圈不終止或無限配置 → `[]`(整數寫法)或 throw(設定物件);`{numCount:Infinity, numGroup:3}`:修前不終止 → 忽略無效鍵改用 numGroup |
| `addMonth` | `n`(必須,可正負) | `iseint(n, { use:'safe' })` 後 `Number()`;計算後 `isValid()` 為 false 亦回 `''` | `''`(維持) | `addMonth('2020-01', Infinity)`、`1e15`、`1e9`、`MAX_SAFE_INTEGER`:修前輸出字串 `'Invalid Date'` → `''`;`'3'`、`-2`、`'1e1'` 照常;`'0x2'`、`1.5`、包裝物件 → `''`;`addMonth('Invalid Date', 1)`(`ismonth` 對該字串為 true,既有缺陷)由 `'Invalid Date'` → `''` |
| `bufRead` | `offset`(索引)、`nBytes`、`mLen`(個數)(皆必須) | `iseint(offset, { use:'index' })`;`iseint(nBytes／mLen, { use:'count', min:1 })`;`Number()`;另 `offset + nBytes <= buffer.length` 與 `mLen < nBytes * 8 - 1` | `null`(維持) | `bufRead(u8, -1, true, 52, 8)`:修前回 `2.05e-307`(負 offset 讀到 undefined)→ `null`;`offset` 越界(`1`〔長度 8〕、`8`、`100`)→ `null`;`nBytes`／`mLen` 為 `Infinity`／`MAX_SAFE_INTEGER`:修前位元組迴圈不終止(`mLen` 為 `Infinity` 者回 `NaN`)→ `null`;`nBytes` 0、`mLen` 0、`mLen >= nBytes*8-1` → `null`;float32／float64(含 -0、次正規數、±Infinity、NaN)正常讀取不變 |

- `getFileHash.mjs`:**只改 JSDoc**(`opt.chunkSize`／`debug`／`funLog` 之描述改為與被轉交之二函數一致,承 R-OPT-VAL-01 裁定紀錄 4、49「待該二函數納入時再改」);原碼(含未被使用之區域變數 `chunkSize`,死碼依 CLAUDE.md §4 只提出不刪)未動.
- **未動**:`bufWrite`(其 `value` 之處置待使用者裁示;`bufWriteDbl` 隨之);上列 7 個以外之函數;`package.json`(含 version)、`script.txt`.
- **已知不修(列待裁示,皆為修前即有、非本輪輸入類缺陷)**:①`bufRead` 之 `mLen` 過小而指數位數 `eLen = nBytes*8 - mLen - 1 > 30`(如 `nBytes` 8、`mLen` 1)時 `1 << eLen` 位移溢位而數值失真(無上限 max:52／8 之規格,盤點 §8 第 5 項「由業務定」);②`addMonth` 之結果年份超出 0~9999(如 `addMonth('2020-01', 100000)` 得 `'10353-05'`、負年得 `'-6314-09'`)時為 dayjs 有效日期但不符 `ismonth`,本輪依指示只擋 `Invalid Date`;③`sepInt`／`arrSep(numGroup)` 之個數為有限大值(如 4294967295)時仍依其值配置輸出(輸出本身即 n 個元素),屬使用端選擇;④`ismonth('Invalid Date')` 為 true(`ismonth` 範圍外缺陷,`addMonth` 已因 `isValid()` 擋下).
- 測試:既有測試檔 `sepInt`／`strmid`／`arrSep`／`addMonth`／`bufRead`／`bufReadDbl`(`.test.mjs`)增補正反例;新檔 `intInputHang.test.mjs`(子行程,堆積 64MB、逾時 8 秒;執行器 `test/tools/intInputHangRunner.mjs`)與 `optValG3countBlobHashChunk.test.mjs`(Blob 子類記錄 `slice` 範圍為觀察值,暴走防護 8 次;共用 `defineOptParamAsync`／`defineWarnEach`).**修前會使行程卡死之輸入一律走子行程,不在 mocha 行程內跑**(見 `sgud/exp/experience.md`).

---

