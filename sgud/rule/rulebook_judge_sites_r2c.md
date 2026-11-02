# 規則帳本(判斷類站點之處置結果——第 221 項第 2 輪(ws272c;新增之處置結果節附於本檔末,逾 30KB 時再抽出新檔))

本檔為 2026-11-02(ws272c,全域設定 §14)新增:原 `sgud/rule/rulebook_judge_sites.md` 之處置結果節依輪次抽出至 `rulebook_judge_sites_r1.md`、`rulebook_judge_sites_r2.md`,本輪起之處置結果節附於本檔;風險代號(〈共通說明〉)與各檔索引見 `sgud/rule/rulebook_judge_sites.md`.

## 第 221 項第 2 輪 ws272c 處置結果(2026-11-02,`_optNum` 退役〔6 個呼叫端 19 處〕＋DOM 類 9 個函數＋`fsTask`＋ws272b 回報後續 6 項,規則 R-OPT-VAL-01／R-ENUM-CALLERS-01 之延伸;主控任務 20261102123434 ws272c)

- 依據:使用者 2026-11-02 裁示(`_optNum` 之 `inf:'keep'` 移除:`domDetect` 之 `tolerancePixel`／`toleranceBounce`、`domIsStable` 之 `tolerance` 改依一般 opt 規則,`Infinity` 為非預期、改用預設 1／3／0;`fsTask` 之 `timeInterval` 比照 `setTimeoutHp` 直接用小數、不四捨五入,`levelLimit` 依清單);主控判定 ws272b 回報後續 6 項(`repObj` 收 0、`str2sha` 訊息不帶值、`ismonth` 等收 0000~0099 年、`rang` 溢位回 `[]`、隨機整數邊界、`bufRead`／`bufWrite` 之 `mLen` > 52);主控清單 `wsemi-judge-list.md` §2 第 14、16 項、§3 第 28~31、33~36 項與 §6;複核報告 `wsemi-level2-verify.md` 第 30~38 節(下游逐站皆不用改);規格 dspec〈輸入參數之檢測機制〉§3.1、§7.1、K2、K3、K4、K9／V20、§11.
- **`_optNum` 退役**(`src/_optNum.mjs` 與 `test/_optNum.test.mjs` 已移除,src 內不再有 `_optNum` 之引用;其 `inf:'keep'` 規則一併移除):6 個呼叫端 19 處改 `optVal`(規則於各檔模組層宣告一次,`opt.debug === true` 才警告,固定詞彙、不含值、每函數每參數每行程一次,出口 `opt.funLog` 或 `console.warn`;JSDoc 補 `debug`／`funLog`):

| 呼叫端:選項(預設) | 舊 `optNum` 規則 | 新規則 |
|---|---|---|
| `domDetect`:`timeInterval`(20)、`throttle`(0) | 整數、>0、timer 夾限 | `iseint { use:'timer', min:1 }` |
| `domDetect`:`tolerancePixel`(1)、`toleranceBounce`(3) | 整數、≥0、`inf:'keep'` | `iseint { min:0 }` |
| `domIsStable`:`tolerance`(0) | ≥0、`inf:'keep'` | `isenum { use:'nonnegative' }` |
| `domIsStable`:`timeDiff`(100) | ≥0、`below:'clamp'`、timer 夾限 | `isenum { use:'timer' }`＋有效之負數視為 0(JSDoc 載明,見設計說明①) |
| `domIsStable`:`timeDetect`(50) | >0、timer 夾限 | `isenum { use:'timer', gt:0 }` |
| `domDrag`:`previewOpacity`(0.4)、`previewDisabledOpacity`(0.2)、`previewBorderWidth`(1)；`domDragPreview`:`containerOpacity`(0.4)、`containerBorderWidth`(1) | 無規則(`isnum` 且有限) | `isenum`(不限範圍) |
| `domDrag`:`timeDragStartDelay`(120) | ≥0、`below:'clamp'`、timer 夾限 | `isenum { use:'timer' }`＋有效之負數視為 0 |
| `fsDownloadFileVerifyCore`:`maxAttempts`(3) | 整數、≥1 | `iseint { use:'count', min:1 }` |
| 同上:`retryDelayMs`(1000) | ≥0、timer 夾限 | `isenum { use:'timer' }` |
| 同上:`stallMs`(30000)、`totalMs`(600000) | >0、timer 夾限 | `isenum { use:'timer', gt:0 }` |
| `fsEnsureBinsCore`:`manifestMs`(取自 `opt.stallMs`,30000)、`extractMs`(取自 `opt.totalMs`,600000) | >0、timer 夾限 | `isenum { use:'timer', gt:0 }`(取 `o.stallMs`／`o.totalMs` 原值) |

  修前 → 修後(實測;有效輸入結果與修前相同,差異皆為非預期之輸入):`Infinity`、超過 2147483647 之有限數:timer 類原夾至 2147483647 → 預設;`tolerancePixel`／`toleranceBounce`／`tolerance` 之 `Infinity` 原保留(任何變化皆容許／不發出／不阻斷回授)→ 預設 1／3／0;`'0x10'`(原 16)、包裝物件(原 `new Number(5)` 為 5)、`-Infinity` → 預設;`maxAttempts`、`tolerancePixel`、`toleranceBounce` 之超出個數／安全整數範圍之大整數(原 `Number.isInteger` 收)→ 預設;`domDetect` 之 `toNum`(`getSize`／`getBase` 回傳值):`Infinity`(原 1.8e308)／`'0x10'`／包裝物件 → 視為非數字(`getSize` 之軸為 0、`getBase` 之軸不比較);`domDrag.getIndex`:屬性 `'0x10'`(原 16)→ 非拖曳點。`domDetect` 內因此成孤兒之 `tolerancePixel === Infinity`、`toleranceBounce === Infinity` 兩分支已移除;**同向連續發出上限 10 次(`RUN_MAX`)不可再以 `Infinity` 關閉**(原 `toleranceBounce` 為 `Infinity` 時一律發出)。
- **下游 `Infinity` 掃描**(唯讀,`C:\opensrc` 其他套件 `src/`、`server/`,以上列 6 函數之相關鍵〔`tolerancePixel`／`toleranceBounce`／`tolerance`／`timeDiff`／`timeDetect`／`timeInterval`／`throttle`／`previewOpacity`／`previewDisabledOpacity`／`previewBorderWidth`／`timeDragStartDelay`／`containerOpacity`／`containerBorderWidth`／`maxAttempts`／`retryDelayMs`／`stallMs`／`totalMs`〕對 `Infinity`／`Number.MAX_VALUE`／`Number.MAX_SAFE_INTEGER`／`1e` 之正則,及 `v-domresize`／`v-domstable` 指令值):**0 站**;呼叫端:`w-component-vue`(`domDrag` 1、`domDetect` 1〔`domResize.mjs`,指令值透傳〕、`domIsStable` 1〔`domStable.mjs`,指令值透傳〕)、`w-aggrid-vue`(`domDetect` 1,不傳 opt)、16 個套件之 `ensureBins.mjs`(`fsEnsureBins('bin/manifest.json', { ...o, pkgRoot })`,`o` 為各套件使用者選項透傳,靜態掃描無 `stallMs`／`totalMs` 傳 `Infinity`);透傳之執行期值無從靜態證明,語意變更(`Infinity` 由保留／夾限改預設)已列於破壞性變更第 55 項.無須停下改下游之站點(屬第三級者)。
- **DOM 類(依清單 §3 第 28~31、33~36 項與 §2 第 16 項)**:

| 函數 | 參數(預設) | 判定 | 修前 → 修後 |
|---|---|---|---|
| `domConvertToPic` | `opt.scale`(1) | `isenum`(不限範圍),取值 `Number()`;`<1` 仍 reject | `Infinity`(→1.8e308,畫布失敗)／`'0x10'`(16)／包裝物件 → 1;`-Infinity`(原 → `-MAX` 而 reject)→ 1 |
| `domFadeIn`、`domFadeOut` | `ele.style.opacity`(DOM 讀值) | `isenum`,取值 `Number()` | `'Infinity'`(原寫入 1.8e308)／`'0x10'`(原 16)→ 忽略,以 `opacityIni` 為漸變起點;有效十進位字串不變(`domFadeIn.duration`／`delay` 不在清單,未動) |
| `domShowImages` | `opt.disTouchMoveToHide`(4) | `iseint { use:'count' }` | `Infinity`(永不因移動而隱藏)→ 4(**反向**);負數／小數／`'0x10'`／包裝物件 → 4 |
| `domShowInputAndGetFiles`、`domShowInputAndGetFilesU8Arrs`、`domGetFiles`(同批) | `sizeMbLimit`(1000) | `isenum`(不限範圍;0 與負數仍由 `domGetFiles` 改用 1000),取值 `Number()` | `Infinity`(不限大小,原 `cdbl` 為 1.8e308)→ 1000(**反向**);`'0x10'`(16)／包裝物件 → 1000;兩層一致(原 `domGetFiles` 與 `domShowInputAndGetFiles` 各自處置) |
| `domTooltip` | `tippystate`(函數自行寫入之倒數秒數) | `isenum`,取值 `Number()`(原 `cint`) | 外部寫入 `'0x10'`／`'Infinity'` → 視為非倒數狀態(原視為倒數中而不建立／不倒數) |

- **`fsTask`(使用者 2026-11-02 定 A)**:`opt.levelLimit`(1)→ `iseint { use:'count', min:1 }`,非預期(0、負數、小數、`Infinity`、`'0x10'`、包裝物件、`null`)→ 1;`opt.timeInterval`(60000)→ `isenum { use:'timer', gt:0 }`,**有效數字直接用小數、不再 `cint` 四捨五入**(`0.4` 原 0、`1.4` 原 1、`2.5` 原 3),`Infinity`／超過 2147483647(原夾至上限)／`'0x10'`(原 16)→ 60000;移除 `Math.min(…, cst.TIMER_TIME_MAX)`、`ispint`／`ispnum`／`cint` 之 import。JSDoc 原稱「設定 `null` 為無窮遍歷所有檔案」,但實作對 `null` 一向用 1(`ispint(null)` 為 false),文件已更正為實作行為。
- **ws272b 回報後續 6 項(主控判定)**:

| 項 | 處置 | 修前 → 修後 |
|---|---|---|
| `repObj(o, n)` | `iseint { use:'count' }`(0~4294967295),訊息改 `invalid n: must be a non-negative integer` | `n=0`:throw → `[]`(與 `rep` 之 0 回 `''` 對稱);負數等:訊息 positive → non-negative |
| `str2sha` | `invalid n[n]` 改固定詞彙 `invalid n: must be one of 1, 224, 256, 384, 512`(throw 與 `returnWithStateAndMsg` 同) | 訊息不再帶 n(dspec K9／V20,與 `pmTimeout` 同) |
| `ismonth`、`isday`、`istime`、`istimems`、`istimeTZ`、`istimemsTZ` | 新增內部 `src/_dayjs.mjs`(dayjs 薄包裝):年份 0000~0099 之標準寫法無時區字串以 `Date.setFullYear`／`setHours` 建立日期再交 dayjs(dayjs 內部 `new Date(y, m, …)` 將 0~99 年對映為 1900~1999),其餘輸入原樣交 dayjs;27 個依賴日期字串之模組(六個判斷、`addMonth`、`day2cht`、`getTimeRange`、`getTimeObject`、`domShowInputDatatime`、`time2day`／`time2hour`／`time2min`、`timems2day`／`timems2hour`／`timems2min`／`timems2time`、`timeTZ2day`／`timeTZ2hour`／`timeTZ2min`、`timemsTZ2day`／`timemsTZ2hour`／`timemsTZ2min`／`timemsTZ2time`、`timemsTZ2expire`、`timemsTZ2past`)改 `import ot from './_dayjs.mjs'`(`now2str` 等只取現在時間者不動) | `'0000-01'`~`'0099-12'` 等:false → true(年份 0000~9999 皆收;閏年依格里曆,0000、0004、0400 閏、0100 非閏);`addMonth` 結果(年份 0~9999)皆可回送 `ismonth`;`time2day('0050-03-04T12:34:56')` 等轉換函數原 `''`(判斷不收)→ `'0050-03-04'`(不經判斷放行亦不會變 1950);`day2cht('0050-03-04')` → `民國 -1861 年 3 月 4 日`;`getTimeRange`／`timemsTZ2expire`／`timemsTZ2past` 跨 0099／0100 邊界之日數正確;年份 100 以上之輸出不變 |
| `rang` | 兩端有效但計算結果含非有限數 → `[]`:先檢 `dx`(免 `num` 大時逐次累加至耗盡記憶體),再檢累加所得各元素 | `rang(-Number.MAX_VALUE, Number.MAX_VALUE)`:含 `Infinity` 之陣列 → `[]`;`rang(0, Number.MAX_VALUE, 3)`(間隔有限但累加捨入使末元素為 `Infinity`)→ `[]` |
| `randomIntRange`、`randomIntsRange`、`pseudoRandomIntRange`、`pseudoRandomIntsRange`(同型) | `Math.floor(pr * rng + vstart)` 之後 `if (r > vend) r = vend`(僅鉗制超出 `vend` 者,其餘結果逐位不變) | `randomIntRange(9007199254740991, 9007199254740991)` 約半數回 `9007199254740992` → 恆為 `9007199254740991`;固定種子之偽隨機值不變。`randomIntsNdpRange`(`sampleSize(range())`)與 `pseudoRandomIntsNdpRange`(`r` 僅作排序鍵)不同型,不改 |
| `bufRead`、`bufWrite`(`bufReadDbl`／`bufWriteDbl` 隨之) | `mLen > 52` 回 `null`(`bufWrite` 不寫入) | `(60, 9)` 等:讀回 0／寫入失真 → `null`;標準 `(23,4)`／`(52,8)` 與 `mLen` ≤ 52 之非標準版面不變 |

- **設計說明／偏離清單**:①清單與規格 K3 對「負數」之處置為「非預期 → 預設」,但 `domIsStable.timeDiff`、`domDrag.timeDragStartDelay` 之 JSDoc 明載「負數視為 0」,且派工書要求有效輸入之結果與現行相同,故保留「有效之負數 → 0」(於取值前以 `isenum` 判定後歸 0),`-Infinity`／`'-Infinity'` 則依 `Infinity` 一律非預期而改用預設(原夾至 0)——列需裁示;②`fsEnsureBinsCore` 之 `manifestMs`／`extractMs` 取 `o.stallMs`／`o.totalMs` 原值再判定(原以 `get(opt, key)` 重讀一次),規則名警告函數名取 `fsEnsureBins`;③`domFadeIn`／`domFadeOut` 之 `ele.style.opacity` 在真實 DOM 恆為 `''` 或十進位字串,故有效輸入結果不變;④`domFadeIn.duration`(`cdbl`,負數用 1000)與 dspec §11 第 17 項「`domFadeIn`、`domFadeOut` 之 `opt.duration` 無效或負數用 500」未對齊(清單只列 `domFadeIn:51`),本輪未動,列需裁示;⑤日期的 0000~0099 年以 `_dayjs.mjs` 單一擁有者處理,不以各函數自寫正則;⑥`_dayjs.mjs` 於 dayjs 不可用時(UMD 未載入 dayjs 全域)拋 `Error('invalid dayjs')`:`timemsTZ2past`／`timemsTZ2expire` 原有之 `!isfun(ot)` 守門因包裝恆為函數而失效(獨立複核發現),改由包裝拋出同一錯誤(測試以載入掛鉤使整條依賴鏈之 dayjs 為 `undefined`);⑦年份 ≥ 100 之輸出不變——唯含時區後綴之字串於換算為本地時間後落入 0000~0099 年者(0100-01-01 附近,如 `timemsTZ2past('0100-01-01T00:00:00.456+14:00')` 在 Asia/Taipei 原 `26年前` → `1926年前`)原被 dayjs 對映為 1999 年,現為正確,故上列「269456 列 0 差異」限於探針字串集(無此類邊界)。
- 有效輸入域修前修後差分(`tmp/ws272c/diff.mjs`,修前=動工前之工作樹〔含 ws272a／ws272b〕;證據夾 `diff-result.txt`):`rang` 2060 列、偽隨機整數 4800 列、`bufRead`／`bufWrite` 27200 列、`repObj` 119 列、`str2sha` 72 列、日期 22 個模組年份 ≥ 100 之有效與無效字串 **269456 列 0 差異**、`addMonth` 360 列 0 差異;差異列皆為上列缺陷修正(`rang` 溢位 6、偽隨機值大於 `vend` 265、`mLen` > 52 之 576、`repObj` 44、`str2sha` 16、年份 0000~0099 之 1056)。`_optNum` 呼叫端與 DOM 類之有效輸入以測試之「有效輸入」案對修前碼驗證:除 `fsTask` 小數 `timeInterval` 4 案(使用者 A,預期)外,全部於修前碼亦綠(0 差異)。
- **已知不修／範圍外**:`pseudoRandomIntsNdpRange(5, 8, 4)` 回 `[0, 2, 3, 1]`(排序後之索引,非 `[5, 8]` 內之值,與 JSDoc「各元素值域為 `[vstart,vend]`」不符,修前即有);`rang(0, Number.MAX_VALUE, 3)` 類「間隔有限但逐次累加捨入溢位」現回 `[]`(改為 `rStart + dx * i` 並令末元素為 `rEnd` 可保留有效結果,但會改變一般輸入之末位元,本輪不改);`getTimeRange` 等對 DST 缺口之本地時間字串仍依主機時區(修前即有,與年份無關);**dayjs 內部 `startOf`／`endOf`／`daysInMonth`／月與年差仍以 `new Date(y, m, d)` 運算,對 0~99 年對映為 1900~1999**(獨立複核發現;`_dayjs.mjs` 只修解析):0001~0099 年之閏年規律與 1901~1999 相同故月差與整數曆法逐格一致,**唯 0000 年**(閏年,被當作非閏之 1900)於 2 月 29 日起算之月差差 1(`timemsTZ2past('0000-02-29T12:00:00.000+08:00', '0000-04-29T12:00:00.000+08:00')` 回 `1個月前`,同月日在 0004、0400、2000 年皆 `2個月前`;4026 格中 8 格),及 `getTimeObject` 回傳之 dayjs 物件上 `startOf('month')`／`endOf('year')`／`daysInMonth()`(`getTimeObject('0000-02-01').daysInMonth()` 回 28)——屬 dayjs 限制,本輪不修(若需要,月年差改整數曆法)。
- 測試:新檔 `optValG7optNumRetire.test.mjs`(`fsDownloadFileVerify` 四參數〔假 fetch 回 503,觀察 `onRetry`／`onTrace`,`performance.now` 凍結使 `totalMs` 精確〕＋退役檢查)、`optValG7dom.test.mjs`(`domConvertToPic`、`domFadeIn`／`domFadeOut`、`domShowImages`、`domShowInputAndGetFiles`／`U8Arrs`／`domGetFiles`、`domTooltip`;無法於 Node 載入之前端模組〔viewerjs、tippy.js 與其 css、`@zumer/snapdom`〕以 `test/tools/domStubKit.mjs` 之 `node:module` 載入掛鉤換為記錄呼叫之替身,只對以 `?stub=` 載入之 src 模組生效,不新增依賴)、`optValG7fsTask.test.mjs`、`dateYear0000.test.mjs`(純整數曆法預言＋27 模組)、`randIntBounds.test.mjs`；既有 `domDetect`／`domIsStable`／`domDrag`／`domDragPreview` 各增 `optVal` 區塊並改 3／1／2／0 案期望(釘住舊 `Infinity` 保留或夾限者)、`fsEnsureBins`(+11 案,假時鐘)、`bufIeee754`／`bufRead`、`repObj`／`str2sha`／`addMonth`／`optValG6strArrNum`／`intInputHangG6`(+`rang` 溢位子行程案)、`domShowInputDatatime` 增補。

## 第 221 項第 3 輪 ws271 處置結果(2026-11-02,`interp1`／`arrGroupByMaxmin`／`arrLookupByMaxmin`／`strTruncate`＋`domFadeIn` 對齊;第三級〔先改下游再改 wsemi〕,規則 R-OPT-VAL-01／R-ENUM-CALLERS-01 之延伸;主控任務 20261102171617 ws271)

- 依據:使用者 2026-11-02 裁定(dspec〈輸入參數之檢測機制〉§11):`interp1` 之 px 定 A(陣列無效元素原位 `{err}`、輸出長度恆等於 px 長度);`arrGroupByMaxmin`／`arrLookupByMaxmin`「Infinity 原則上視為非預期……使用方得自己給適當之超大/小值去當邊界」「上下限無效即拋錯」;`strTruncate`「有 opt, 就代表為一般情形 maxLen 為必須參數 未給或非預期就是報錯」;第 17 項 `domFadeIn`／`domFadeOut` 之 `opt.duration` 無效或負數用 500(`domFadeOut` 已於 1.9.37 改,ws272c 回報 `domFadeIn` 未對齊).下游已先行完成:w-data-pipeline 1.0.25(`oneline` 自判 n)、w-gis 1.1.14(`interp1` 傳入值以 `isenum` 清理)、w-knowledge-summarize(字數設定以 `iseint` 清理)、w-dispatch-ai(`oneline` 自判 n);w-geo、w-statistic、w-knowledge-extract 經主控盤點傳入值皆為有效值,不用改.
- 逐函數(`file:line` 為本輪工作樹):

| 函數:參數 | 改前 | 改後 | 性質／失敗通道 |
|---|---|---|---|
| `interp1`:`px` 單值(`interp1.mjs` 守門) | `isnum`(收 `Infinity`、`'0x10'`、包裝物件) | `isenum`;無效回 `{ err: 'px is not a number or an array' }`(訊息照現行) | 必須參數;失敗通道 `{err}` 維持 |
| `interp1`:`px` 陣列元素(`toArrayX`) | `isnum`→`toNumber`;無效元素**丟棄**(輸出變短、錯位) | `isenum`→`Number`;無效元素於**原位**輸出 `{ err: 'invalid px[i]: must be a valid number' }`(不帶值),長度恆等於 px 長度;元素形式 `[x,…]`、`{keyX}`(JSDoc 未載、現況支援)維持,取出之 x 以 `isenum` 判定 | 必須參數;與超出範圍之原位 `{err}` 一致 |
| `interp1`:資料點 `ps`(`toArrayXY`) | `isnum(x)&&isnum(y)`→`toNumber` | `isenum`→`Number`;無效點照現行濾除 | 資料集,不需對齊 |
| `interp1`:`opt.xMin`／`xMax` | `isNumber` | **不動**(派工書) | — |
| `arrGroupByMaxmin`／`arrLookupByMaxmin`:區間上下限(`keyMax`／`keyMin`) | `isnum`＋`cdbl`;無效或缺鍵**靜默略過整個區間** | 共用 `src/_maxminsLimits.mjs`(單一擁有者):`isenum`＋`Number`;無效(含缺鍵、`null`、`Infinity`、`'0x10'`、包裝物件、非物件元素)**throw** `invalid maxmins[i].<鍵>: must be a valid number`(不帶值;先檢 `keyMax`);於 `maxmins` 為有效陣列後、`arr` 檢查前檢測,與 `arr` 內容無關;每個鍵只讀一次 | 必須參數(設定);`maxmins` 非有效陣列仍回 `[]` |
| 同上:被分組／查找之值 | `isnum`→`cdbl` 再 `isNumber` 閘門(收 `Infinity`→`Number.MAX_VALUE`、`'0x10'`、包裝物件) | `isenum`→`Number`,`isNumber` 閘門改為 `value !== null`;無效者略過該筆(`arrGroupByMaxmin` 欄位無效時退而以元素本身判定,同現行;`arrLookupByMaxmin` 不添加 `keyItems`) | 資料,略過 |
| `strTruncate`:`maxLen` | `isp0int`＋`cint`;無效**原樣回傳字串** | `iseint { use:'count' }`＋`Number`;未給或非預期 **throw** `invalid maxLen: must be a non-negative integer`(不帶值);`str` 非有效字串仍先回 `''` | 必須參數 |
| `domFadeIn`:`opt.duration` | `cdbl`;非數字為 0(瞬間)、負數為 1000 | `optVal`＋`isenum { use:'nonnegative' }`,非預期(含負數、`Infinity`、`'0x10'`、包裝物件)用 500;0 為瞬間;補 `opt.debug`／`opt.funLog` | opt 類,不報錯 |

- wsemi 內部呼叫端(逐一確認):`execCli.mjs:296,297,335,336,352,353,400,406,414` 之 `strTruncate(x, 500|1000, optTruncate)` 為字面值;`execCliFailDetail.mjs:77` 之 `strTruncate(text, n)`:`n` 於 `:51-56` 先 `iseint(n, { min: 1 })` 並 `Number()`(恆為 1~安全整數)、`text` 恆為字串;`domAlert.mjs:41` 之 `domFadeIn(ele)` 未帶 opt(用預設 500).`interp1`／`arrGroupByMaxmin`／`arrLookupByMaxmin` 於 `src/` 內無其他呼叫端.
- 盤點指令:`Grep pattern="strTruncate|interp1|arrGroupByMaxmin|arrLookupByMaxmin|domFadeIn" path=src` 應僅命中上列檔(含各自定義檔與 `index.mjs`);`Grep pattern="maxminsLimits" path=src` 應命中 `_maxminsLimits.mjs`、`arrGroupByMaxmin.mjs`、`arrLookupByMaxmin.mjs`.
- 測試:新檔 `optValG8level3.test.mjs`(347 案:`interp1` 103、`arrGroupByMaxmin` 105、`arrLookupByMaxmin` 103〔皆含共用上下限矩陣〕、`strTruncate` 36);既有 `strTruncate.test.mjs`(「maxLen 無效回原字串」改為 throw)、`optValG4randDomMisc.test.mjs`(`domFadeIn` 納入與 `domFadeOut` 同一探針,+55 案;原「瞬間完成回 0」改以 `expOf(0)` 與 `domFadeIn` 回 1).執行:`npx mocha --no-parallel test/optValG8level3.test.mjs test/strTruncate.test.mjs test/optValG4randDomMisc.test.mjs test/interp1.test.mjs test/arrGroupByMaxmin.test.mjs test/arrLookupByMaxmin.test.mjs test/execCliFailDetail.test.mjs --timeout 180000`.
- 驗證:見主控任務 `agent-out/ws271-修正報告.md`(修前紅 303 案、變異 51 項擊殺 46〔存活 5 皆等價〕、有效輸入域差分 22129 列 0 差異、全套 28500 案 0 failing).

## 第 221 項 §11 第 6 項第一類 ws286a 處置結果(2026-11-02,`domIsFocused`／`domAppend`／`domPrepend`／`copyStrToClipboard`:非計算類函數之必須參數遇非預期,「把錯誤訊息當回傳值」改正＋三個內部呼叫端;第一級〔下游 0 站點〕;主控任務 20261031121854 ws286a)

- 依據:使用者 2026-11-02 定分組後逐函數確認(「先修 第一類」);dspec〈輸入參數之檢測機制〉§5.1(回傳 Promise 者 reject 不同步 throw;同步且有副作用者同步 throw Error,先於任何副作用)、§5.3 C18(不以訊息字串作回傳值)、V17(無效時不留副作用)、V19(訊息格式 `invalid <名稱>: must be <種類描述>`)、V20(訊息不回顯輸入值)、「訊息不得洩漏內部錯誤」.第一類之 `getTimeRange` 因 nc1 盤點提出不同建議,正待使用者再確認,**本輪不動**.主控查 `C:\opensrc` 其他套件(9200 檔)字面搜尋這 4 函數為 0 處,僅 wsemi 內部呼叫.
- 規則(本節):
  1. 判斷類之 DOM 函數(`domIsFocused`)遇非元素回 `false`(嚴格布林,P1 輸出型別恆定;原回字串 `'invalid element'`,真值會被 `if` 當成有焦點).
  2. 同步且有副作用之 DOM 函數(`domAppend`、`domPrepend`、`copyStrToClipboard`)遇無效輸入同步 `throw new Error(固定訊息)`,先於任何 DOM 變動;檢測順序固定(先父層、後子項);訊息不帶輸入值.
  3. `copyStrToClipboard` 之暫存 textarea 於成功與全部失敗路徑(取不到焦點、`execCommand` 拋錯、`execCommand` 回 `false`)皆移除(`finally`);清理失敗(頁面腳本已自行移除)不覆蓋原結果或原錯誤;`execCommand` 之原錯誤不外洩(改拋固定訊息);`execCommand` 以 `!== false` 判失敗(回 `undefined` 視為成功).
  4. 回傳 Promise 之函數若內部呼叫 `domAppend`／`domPrepend`,須於任何副作用前自行以 `isEle` 檢測 `body`,取不到時依該函數既有失敗形式回報(不得讓 `domAppend`／`domPrepend` 之拋錯同步外洩,亦不得留下半完成之副作用).
- 逐函數(`file:line` 為本輪工作樹):

| 函數:情形 | 改前 | 改後 | 失敗通道 |
|---|---|---|---|
| `domIsFocused(ele)`:`ele` 非元素(`src/domIsFocused.mjs:25-27`) | 回字串 `'invalid element'`(真值) | 回 `false` | 回傳布林 |
| `domAppend`／`domPrepend`:`eleParent` 非元素(`domAppend.mjs:23-25`、`domPrepend.mjs:22-24`) | 回字串 `'invalid eleParent'` | `throw new Error('invalid eleParent: must be an element')` | 同步 throw |
| 同上:`itemChild` 非字串亦非元素(`domAppend.mjs:33-35`、`domPrepend.mjs:32-34`) | 回字串 `'invalid itemChild'` | `throw new Error('invalid itemChild: must be a string or an element')` | 同步 throw |
| `copyStrToClipboard(str)`:`str` 非字串(`copyStrToClipboard.mjs:28-30`) | 回字串 `'invalid input'` | `throw new Error('invalid str: must be a string')`,不建立任何元素 | 同步 throw |
| 同上:取不到焦點(`:54-56`) | 回字串 `'ele can not be focusd'`,textarea 留在頁面 | `throw new Error('ele can not be focused')`(順改錯字),textarea 必移除 | 同步 throw |
| 同上:`execCommand` 拋錯(`:60-65,66-68`) | 回字串,textarea 留在頁面 | `throw new Error('can not copy str to clipboard')`(原錯誤不外洩),textarea 必移除 | 同步 throw |
| 同上:`execCommand` 回 `false`(`:61`) | 視為成功 | 視為複製失敗,同上 | 同步 throw |
| 同上:成功 | 回 `''`,textarea 移除 | 回 `''`(不變),textarea 移除 | — |

- wsemi 內部呼叫端(逐站確認;`body` 皆取自 `document.querySelector('body')`):

| 站點 | 傳入值來源 | 失敗行為(改後) | 通道 |
|---|---|---|---|
| `domShowInputAndGetFiles.mjs:125-129`(檢測)、`:154`(`domAppend(body, hidehtml)`) | `body` 同上;`hidehtml` 為函數內組成之字串(恆為有效子項) | **非 async、回傳 `genPm()` 之 Promise**,改前 `domAppend` 之拋錯會變同步丟出;改為於 `domRemove`（移除前次呼叫之 input）、`genPm`、建立 input、綁定監聽、觸發點擊**之前**檢測,`Promise.reject('can not find body element')`(字串);前次呼叫之 input 不被移除 | reject 字串(JSDoc 同步更新) |
| `domConvertToPic.mjs:62-66`(檢測)、`:91`(`domPrepend(body, eleOut)`) | `body` 同上;`eleOut` 為函數內建立之元素 | async 函數;檢測置於 `cloneNode` 之前,`Promise.reject('can not find body element')`(字串,與該函數既有之 `'invalid ele'`、`'opt.scale can not less then 1'` 同一形式);不呼叫 snapdom | reject 字串 |
| `domVirtualCreate.mjs:50-54`(檢測)、`:85`(`domPrepend(body, elePanel)`) | `body` 同上;`elePanel` 為函數內建立之元素 | async 函數;檢測置於建立元素之前,`throw new Error('can not find body element')`(async 故為 reject,與該函數既有之 `Error('invalid fun')` 同一形式);**不呼叫 `fun`**(改前 `domPrepend` 回字串被忽略,`fun` 會對未接上頁面之元素被呼叫並回傳結果) | reject Error |
| `copyStrToClipboard.mjs:54`(`domIsFocused(ele)`) | `ele` 為函數內建立之 textarea(恆為元素) | 不會走到非元素分支;取不到焦點改拋錯(見上表) | 同步 throw |

- 盤點指令:`Grep pattern="domIsFocused|domAppend|domPrepend|copyStrToClipboard" path=src` 應僅命中 4 個定義檔、`index.mjs`、上列 3 個呼叫端與 `copyStrToClipboard.mjs`;`Grep pattern="can not find body element" path=src` 應命中 3 個呼叫端.
- 測試:`test/domIsFocused.test.mjs`(20 案)、`domAppend.test.mjs`(32)、`domPrepend.test.mjs`(33)、`copyStrToClipboard.test.mjs`(30)、新檔 `domBodyMissing.test.mjs`(16;三呼叫端)；共用載具新檔 `test/tools/domEditKit.mjs`(`NOT_ELE` 無效值表、`mkEditDom` 於 `mkFakeDom` 之 `Ele` 補 `insertAdjacentHTML`／`insertBefore`／`firstChild`／`select`／嚴格 `removeChild`／`document.body`／`activeElement`／`createElement` 記錄／`execCommand` 記錄,`env.ops` 為 0 代表未動 DOM).執行:`npx mocha --no-parallel test/domIsFocused.test.mjs test/domAppend.test.mjs test/domPrepend.test.mjs test/copyStrToClipboard.test.mjs test/domBodyMissing.test.mjs test/domShowInputAndGetFiles.test.mjs test/domShowInputAndGetFilesU8Arrs.test.mjs test/domConvertToPic.test.mjs test/domVirtualCreate.test.mjs test/domVirtualCreateQueue.test.mjs test/optValG7dom.test.mjs test/optValG4randDomMisc.test.mjs --timeout 180000`(12 檔 677 案).
- 驗證:見主控任務 `agent-out/ws286a-修正報告.md`(修前紅:5 檔 131 案中 108 紅〔`domIsFocused` 16、`domAppend` 28、`domPrepend` 28、`copyStrToClipboard` 23、呼叫端 13〕、23 綠皆為不變之正常路徑;修後 12 檔 677 案 0 failing;變異 22 項全擊殺;真 headless Chromium 15 項檢查全過;eslint 0 error).
- 已知殘餘(範圍外,未改):`domShowInputAndGetFiles` 於無 `document` 環境仍同步丟出 `ReferenceError`(既有);`copyStrToClipboard` 於 `eleParent` 無效且 `document.body` 為 `null` 時為原生 `TypeError`;`domIsFocused` 之 `catch` 內 `console.log(err)`(輸出錯誤物件而非輸入值);`execCommand` 回 `false` 之路徑在 headless Chromium 無手勢時實測仍回 `true`,故僅由假 DOM 案與變異覆蓋.

## 第 221 項 §11 第 6 項 ws286b 處置結果(2026-11-02,`getTimeRange`＋字串／日期子類 4 個函數〔`rep`、`replaceObj`、`replacePlus`、`sepInt`〕＋`cfilesize` 新增 `tb`＋5 處文件修正;第一級〔下游 0 站點〕;與 ws286a 同次發布;主控任務 20261031121854 ws286b)

- 依據:使用者 2026-11-02 已定(dspec〈輸入參數之檢測機制〉§5.3 C3、C9、C19、§11 第 6 項):`getTimeRange` 無效回 `''`、不加雙模式;`strCompare`／`strCompareForVersion`／`getTimeBetween` 只修文件;字串與日期子類 4 個函數逐列確認(下表);`replacePlus` 改普通文字;`cfilesize` 新增 `tb`;其餘函數(含 `addMonth`)使用者定不動.ws286a 呼叫端前置檢測(固定訊息 `can not find body element`)主控同意,不改.主控查 `C:\opensrc` 其他套件(含測試碼)這 6 個函數字面搜尋 0 處;wsemi `src/` 內亦無呼叫端(Grep 於 `src/` 僅命中各自檔案與 `index.mjs`).
- 規則(本節):
  1. 同步之字串／整數函數之必須參數無效 throw `Error(固定訊息)`(`invalid <名稱>: must be <種類描述>`,不帶值),依參數順序檢測,且皆先於「`c` 為 `''` 回 `''`」之回傳(`''` 是合法的 `c`,但其餘必須參數仍須有效:`rep('', 'x')` 拋 `n` 無效).
  2. 取代類函數之 key／pattern／value 皆為普通文字:`String.prototype.replaceAll` 之取代字串即使 pattern 為字串仍解讀 `$&`、`` $` ``、`$'`、`$$`(`$1`、`$<a>` 無捕獲群時照字面;實測 `replace('a-b', 'a', '$&$&')` 得 `'aa-b'`),wsemi 之 `replace` 同,**未改**;`replaceObj` 先將 value 之 `$` 逸出為 `$$` 再交 `replace`;`replacePlus` 之 `pre`／`aft` 以 lodash `escapeRegExp` 逸出、`not` 之字元類別內逸出 `\ ] [ ^ -`、旗標 `u`(`not` 內非 BMP 字元以字元為單位,否則其代理對會誤擋共用高代理之其他字元)、取代以函式回傳 `r`.
  3. 不以人讀訊息作回傳值:`getTimeRange` 無效回 `''`(`tend` 未給視同 `tstart`,正常輸出〔含「起始時間大於結束時間」文字〕不變);`strCompare` 回 `0`(最不相似,亦為合法結果)、`strCompareForVersion` 回 `null`(無法比較;`null >= 0` 為真,不可直接比大小或當 `sort` 比較子)、`getTimeBetween` 回 `[]`(亦表起訖相同或起大於訖)之語意寫入 JSDoc.
  4. `cfilesize` 以 `tb` 為最高單位(`1099511627775` → `'1024.0 gb'`、`1099511627776` → `'1.0 tb'`、`1024 ** 5` → `'1024.0 tb'`),無效輸入維持 `''`.
- 逐函數(`file:line` 為本輪工作樹;「改前」皆為 HEAD 實測,見報告〈使用者逐列確認表之實測〉):

| 函數:情形 | 改前 | 改後 | 位置 |
|---|---|---|---|
| `getTimeRange(tstart, tend)`:`tstart` 無效 | `'無起始時間'` | `''` | `src/getTimeRange.mjs:42-44` |
| 同上:`tend` 有給但無效(含 `null`、`''`) | `'結束時間格式錯誤'` | `''` | `:52-54` |
| 同上:`tend` 未給(`undefined`)、正常輸出 | 視同 `tstart`／各格式文字 | 不變;JSDoc 改標可選 `[tend]` | `:47-49` |
| `rep(c, n)`:`c` 非字串 | `''` | throw `invalid c: must be a string`(先於 `n`) | `src/rep.mjs:51-53` |
| 同上:`c` 為 `''` | `''` | 不變(`rep('', 'x')` 因 `n` 無效 throw) | `:56-58` |
| `replaceObj(c, o)`:`c` 非字串 | `''` | throw `invalid c: must be a string` | `src/replaceObj.mjs:56-58` |
| 同上:`c` 為 `''` | `''` | 不變(`o` 仍須為一般物件) | `:62-64` |
| 同上:`o` 非一般物件(含 `null`、陣列) | `''` | throw `invalid o: must be a plain object` | `:59-61` |
| 同上:`o` 為空物件;鍵為 `''` | `''` | 回 `c`;略過空鍵 | `:71-73` |
| 同上:value 為數字／布林／物件／陣列／`null`／`undefined` | `''`(原轉換迴圈算完未存回,任何非字串值使結果為 `''`) | `1` → `'1'`、布林 → `'true'`／`'false'`(不經 `cstr`)、物件與陣列 → JSON、`null`／`undefined`／其他型別 → `''`;每值只讀一次 | `:68-88` |
| 同上:value 含 `$&` 等 | 被特殊解讀(`'aa-b'`) | 原樣輸出 | `:87` |
| `replacePlus(c, pre, aft, not, r)`:`c`／`pre`／`aft`／`r` 無效 | `''` | throw `invalid c: must be a string`／`invalid pre: must be a non-empty string`／`invalid aft: must be a non-empty string`／`invalid r: must be a string`(依 c、pre、aft、r 序;皆先於 `c` 為 `''` 之回傳) | `src/replacePlus.mjs:48-62` |
| 同上:`pre`／`aft`／`not`／`r` | 正規表示式(`'(' ')'` → `'XX'`;`'[' ']'` → `'Xdef'`;`r='$&$&'` → `'a1ba1b'`) | 普通文字(`'aXc'`、`'abcXdef'`、`'$&$&'`);`not` 每個字元皆不可出現;貪婪不變 | `:64-75` |
| 同上:`not` 非字串／空字串 | 忽略 | 不變 | `:64-68` |
| `sepInt(v, n, breverse)`:`v` 無效 | `[]` | throw `invalid v: must be an integer` | `src/sepInt.mjs:45-47` |
| 同上:`n` 無效(含 0、小數、`Infinity`) | `[]` | throw `invalid n: must be a positive integer` | `:48-50` |
| 同上:`breverse` 非布林 | `[]` | 改用預設 `true`(`sepInt(10, 3, 'x')` → `[3, 3, 4]`) | `:51-53` |
| `cfilesize(b)`:≥ 1 TB 之有效輸入 | `''` | `'x.x tb'`;< 1 TB 與無效輸入不變 | `src/cfilesize.mjs:56-57` |
| 只修文件:`strCompare`、`strCompareForVersion`、`getTimeBetween`、`getTimeFromUnit`、`getTimeObject` | — | JSDoc 寫明 `0`／`null`／`[]` 之語意；範例 `'…ssZ'` 改為不含 `Z`；`test/getTimeFromUnit.test.mjs` 與 `test/strCompare.test.mjs`(11 案)標題改正;程式行為不動 | 各檔 JSDoc |

- 盤點指令:`Grep pattern="\b(rep|replaceObj|replacePlus|sepInt|cfilesize|getTimeRange)\(" path=src` 應僅命中各自定義檔(JSDoc 範例);`Grep pattern="中文訊息|無起始時間|結束時間格式錯誤" path=src` 於 `getTimeRange.mjs` 應為 0 處.
- 測試:`test/getTimeRange.test.mjs`(81;15 案改斷言 `''`,另補無效值表〔19 值 × tstart／tend／兩邊〕)、`rep.test.mjs`(49)、`replaceObj.test.mjs`(143)、`replacePlus.test.mjs`(138;含 14 個特殊字元 × pre／aft／not／皆為字面、`r` 含 `$&`／`$1`／`` $` ``／`$'`／`$$`／`$<a>`、貪婪不變、非 BMP)、`sepInt.test.mjs`(74)、`cfilesize.test.mjs`(45;含 1 TB 兩側邊界、1 PB、數字字串)、`intInputHang.test.mjs`(32;7 案改斷言 throw 訊息)、`isInvalidDateStr.test.mjs`(+1 斷言);`test/tools/intInputHangRunner.mjs` 之 `sepInt` 7 案改 `tryThrow`.7 檔案數 HEAD 275 → 562(+287;`mocha --dry-run`).執行:`npx mocha --no-parallel test/getTimeRange.test.mjs test/rep.test.mjs test/replaceObj.test.mjs test/replacePlus.test.mjs test/sepInt.test.mjs test/cfilesize.test.mjs test/intInputHang.test.mjs test/isInvalidDateStr.test.mjs test/dateYear0000.test.mjs test/isenumCallersRound.test.mjs --timeout 180000`.
- 驗證:見主控任務 `agent-out/ws286b-修正報告.md`(修前紅:344 案;修後該 10 檔 1022 案 0 failing;變異 39 項全擊殺;有效輸入域修前修後差分 130012 列 0 差異;eslint 0 error).
- 已知殘餘(未改):`replaceObj` 之 value 為循環參照或含巢狀 BigInt 之物件時仍為 `JSON.stringify` 原生 `TypeError`(沿用既有測試鎖定之行為);`replace` 之 `$` 特殊樣式(不在本輪範圍).
