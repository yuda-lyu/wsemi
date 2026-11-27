# 規則帳本(結構函數之元素層級:第三批、儲存格文字表示法、差異比對之配對、帶時區時刻之驗證)

本檔記排程第 430 項第三批(ws430c,2026-11-15;因額度中斷分兩段完成,第二段 ws430c2)之規則.規格為使用者 2026-11-15 逐函數之裁定(主控任務 20261115170127〈裁定表〉一～十四)與主控 dspec〈輸入參數之檢測機制〉§11〈第三批〉、§4(`opt.debug`)、§6(訊息只含索引不含值).第二批之規則 R-ELEM-LEVEL-01 見 `sgud/rule/rulebook_elem.md`;全部條目之索引見 `sgud/rule/rulebook.md`〈索引〉;破壞性變更見 `sgud/rule/rulebook_breaking_65on.md` 第 67 項.

## R-ELEM-LEVEL-02 結構函數第三批:列之訊息指出位置、單一空元素不當空陣列、中性可設定之預設值、範圍參數

### 規則

1. **列或元素無效之訊息指出位置**:`invalid <參數名>, row[i] is not …`(雙模式函數)或 `invalid <參數名>: row[i] is not …`(拋錯類),只含索引,不含值;原「every element/row must be …」「the first row is not …」類之訊息一併改寫(`keysmat2ltdt`、`mat2ltdt`〔列號以 mat 計,表頭為第 0 列〕、`ltdtkeys2mat`、`ltdtkeysheads2mat`、`matDiff`、`ltdtpull`、`matConcat`、`matat`).`arrDiff` 矩陣模式之列訊息不變(裁定表〈七〉).
2. **參數層判定一律 `isarr`＋長度**,不得以 `isearr` 把 `['']`、`[null]`、`[{}]`、`[[]]` 當空陣列(`keysmat2ltdt`、`mat2ltdt` 之列;`ltdtkeys2mat`／`ltdtkeysheads2mat` 之 ltdt;`strFindSimilar` 之 `strkeys`;`matat`、`arrAt`).列之檢查不限第一列,先於任何轉換.
3. **欄位鍵之略過**(`keysmat2ltdt`、`mat2ltdt` 之表頭、`ltdtkeys2mat`、`ltdtkeysheads2mat` 之 keys;單一擁有者 `src/_normKey.mjs` 之 `_normKey.field`):`''`、`null`、`undefined`(含空位)、物件、陣列、函數、Symbol、布林、非有限數字略過,有限數字以 `String()`;BigInt 裁定未列,同 `_normKey` 以 `String()`.全被略過視同 keys 無效.`keysmat2ltdt` 略過時其餘位置不變、重複後者覆蓋;`ltdtkeys2mat` 重複產生重複之欄;`ltdtkeysheads2mat` 同位置之表頭一併略過.
4. **只讀自有可列舉同名欄位**(單一擁有者 `_cellText.getOwn`):`ltdtkeys2mat`／`ltdtkeysheads2mat`(資料列與 kphead)、`ltdtDiff`、`ltdtpull`;不解析路徑(`'a.b'`、`'d.e'` 為欄位名)、不讀繼承鍵(`toString`).
5. **中性、可設定之預設值,不內建回退**(使用者 2026-11-15):`ltdtkeys2mat`／`ltdtkeysheads2mat` 之 `opt.empty`(預設 `''`)、`ltdtkeysheads2mat` 之 `opt.emptyHead`(預設 `''`)、`matConcat` 之 `opt.empty`(預設 `null`);讀取一律經 `_cellText.readFill`(opt 非物件視為未給、每鍵只讀一次、讀取拋錯或 `undefined` 取預設、函數視為 `null`、`null` 與其他值原樣).未給 kphead 以鍵名當表頭為既定行為,不屬回退.
6. **函數值作為資料或填充值視為 `null`**(不執行、不複製):`keysmat2ltdt`、`mat2ltdt` 之值;`ltdtkeys2mat` 之值(`'null'`);`ltdtkeysheads2mat` 之 kphead 值;各 `opt.empty`／`opt.emptyHead`.
7. **長度不符之 `opt.debug` 提示**(`keysmat2ltdt`、`mat2ltdt`):同 R-ELEM-LEVEL-01 規則 6 之出口(`optVal.readDbg` 讀 `debug`／`funLog`,`parseNumOpt.warnOnce` 去重,去重鍵 `<fn>|length|mat`,同原因每行程一次),只在首次遇到長度不符時讀一次 opt;訊息只含列號(以呼叫端之 mat 計)與兩者長度,不含值.
8. **範圍參數**(`arrAt`,`matat` 隨之):`iend` 小於 `istart` 視為未給;`iend` 超出長度截至末端;`istart` 超出長度仍回 `[]`.
9. **一律回新陣列**:`ltdtpull`(含 `ltdtDel` 為 `[]` 時之淺複本)、`matConcat` 每列.
10. **檢查之列即其後使用之列**(外審 T13、T5):呼叫端之陣列每列只讀一次並存為快照,其後一律使用快照,不再讀輸入陣列、不呼叫輸入陣列之方法(`slice`、`reduce`、`map` 等可被遮蔽):`_keysmat2ltdtCore`、`mat2ltdt`、`_ltdtkeys2matCore.chkRowsKeys`(回傳 `rows`)、`ltdtDiff`、`ltdtpull`、`matConcat`、`matat`、`matDiff`(以快照交 `arrDiff`);`strFindSimilar` 之候選亦快照.
11. **裁定表未列者行為不變之落實**(外審 T2～T4、T6):`strFindSimilar` 單獨傳入之 String／Number 包裝物件(ar 或 strkeys)同修前接受、BigInt 與 Symbol 候選同修前轉字串比對;`ltdtkeys2mat`／`ltdtkeysheads2mat` 之 BigInt 鍵同修前保留該欄而值恆為缺值、表頭為原 BigInt(`keysmat2ltdt` 之 BigInt 鍵同修前以 `String()`);`istimeTZ`／`istimemsTZ` 之時區非有效偏移者(`'|08:00'`、`'+99:99'` 等 checkTZ 所收者)維持修前之本機時間判定.

### 逐函數處置(裁定表之節號)

| 函數 | 處置 | `src` |
|---|---|---|
| 〈一〉`keysmat2ltdt` | 規則 1、2、3、6、7;核心單一擁有者 `_keysmat2ltdtCore`(一律回 `{ state, msg }`);短補 `''`、長丟棄、`undefined`／空位補 `''` | `keysmat2ltdt.mjs`、`_keysmat2ltdtCore.mjs` |
| 〈二〉`mat2ltdt` | 只有表頭為 success `[]`;每列(含表頭)先檢查;核心同上(`rowOffset: 1`);表頭全部無效回 `keysmat2ltdt: invalid keys` | `mat2ltdt.mjs` |
| 〈三〉`strFindSimilar` | 參數層無效回同形空結果 `{ ratings: [], bestMatch: null, bestMatchIndex: -1 }`;`ar` 陣列只串接字串與有限數字、去空白為空即無效;候選非字串非有限數字 rating 0 且 target 原值(函數為 `null`),有限數字以字串比對而 target 原數字;全部 0 時 `bestMatch: null`;單一數字 strkeys 之 target 仍為字串(同修前) | `strFindSimilar.mjs` |
| 〈四〉`ltdtkeys2mat` | 規則 1～6;`{}`、只有繼承鍵者為有效列;keys 非陣列或全部無效為 invalid keys;值之表示依 R-CELL-TEXT-01;判定與轉換單一擁有者 `_ltdtkeys2matCore` | `ltdtkeys2mat.mjs`、`_ltdtkeys2matCore.mjs` |
| 〈五〉`ltdtkeysheads2mat` | 同〈四〉之列與 keys(無前綴之訊息);表頭取 kphead 自有同名鍵、缺者 `opt.emptyHead`、函數 `null`;新增 `opt.empty` | `ltdtkeysheads2mat.mjs` |
| 〈六〉`ltdtDiff` | 拋錯規則不變;取值只讀自有欄位、缺鍵或 `undefined` 給 `opt.empty`,其餘原值交 `arrDiff` 依 R-CELL-TEXT-01(物件為鍵排序後之 JSON);不轉傳 opt | `ltdtDiff.mjs` |
| 〈七〉`arrDiff` | 依 R-DIFF-PAIR-01 以 `diffArrays` 逐元素、逐列再逐格(格之鍵含欄位指標);移除 `opt.dls`／`opt.dlq`;`diff` 改以元素陣列表示(各段 value 為比對文字或各列之比對文字陣列) | `arrDiff.mjs` |
| 〈八〉`matDiff` | 列訊息 `invalid matOld: row[i] is not an array`;固定矩陣模式、不轉傳 opt | `matDiff.mjs` |
| 〈九〉`ltdtpull` | 只讀自有同名鍵;`ltdtDel` 之列缺自有鍵拋 `invalid ltdtDel: row[i] has no own key [<欄位名>]`(帶實際欄位名,裁定表〈十六〉)、鍵值非「非空字串或有限數字」拋 `invalid ltdtDel: row[i] has an invalid key value`;`ltdtAll` 之列缺鍵或鍵值無效保留;key 為有限數字視同字串;嚴格相等;一律新陣列 | `ltdtpull.mjs` |
| 〈十〉`matConcat` | 欄數取各矩陣最長之列;新增第 3 參數 `opt.empty`(預設 `null`) | `matConcat.mjs` |
| 〈十一〉`matat` | `[[]]` 回 `[[]]`;各列依 `arrAt`;列訊息指出 row[i] | `matat.mjs` |
| 〈十二〉`arrAt` | 規則 2、8;參數層 `isarr` | `arrAt.mjs` |
| 〈十三〉〈十五〉`time*2*` 18 個 | 不帶時區 7 個程式不改;帶時區 11 個依〈十五〉(見 R-TZ-WALL-01);JSDoc 補失敗之辨識(`''`)、本機時區與夏令空窗、`err` 之兩類值、帶時區者之轉換方式 | 各 `time*2*.mjs` |
| 〈十四〉`istimeTZ`、`istimemsTZ` | 依 R-TZ-WALL-01;`istime`／`istimems` 不改、補 JSDoc | `istimeTZ.mjs`、`istimemsTZ.mjs`、`_tz.mjs` |

## R-CELL-TEXT-01 儲存格之文字表示法單一擁有者 `_cellText`

- **規則**:`ltdtkeys2mat`(及經其判定之 `ltdtkeysheads2mat`)與 `arrDiff`(及經其之 `matDiff`、`ltdtDiff`)之儲存格表示一律經 `src/_cellText.mjs`(`cellRep`、`cellText`),不各寫一份:字串與有限數字原值(`arrDiff` 取其文字);布林 `'true'`／`'false'`;`null` ⇒ `'null'`;`undefined` 與空位為缺值(`ltdtkeys2mat` 給 `opt.empty`,`arrDiff` 為 `''`);`NaN`／`±Infinity` ⇒ 字串;物件與陣列 ⇒ JSON(`ltdtkeys2mat` 同修前 `o2j`,`arrDiff` 為鍵排序後之 JSON);Date(以內部槽判定)⇒ ISO 字串;函數 ⇒ `'null'`;BigInt ⇒ `String(v)`.比對以文字、不比型別.
- **鍵排序後之 JSON**:`_cellText.stableStringify` 為單一擁有者(`ltdtDiffByKey` 之內容比對亦改用之,行為不變).
- **裁定表未列而由 ws430c2 暫定、主控 2026-11-15 定為維持者(裁定表〈十六〉)**:Symbol 比照函數 ⇒ `'null'`;無效 Date ⇒ `'null'`(同 JSON);物件序列化失敗(BigInt、循環參照)於 `arrDiff` ⇒ `''`(同 `o2j` 失敗);包裝物件(以內部槽 `String/Number/Boolean.prototype.valueOf.call` 判定,偽造 `Symbol.toStringTag` 之一般物件照物件為 JSON;外審 T9)String／Number 依修前原值、Boolean 包裝以其原始布林值.
- **填充值之讀取 `readFill`**:opt 非一般物件(陣列、Date、類別實例)視為未給(dspec §4 V4;外審 T10).
- **盤點**:`Grep pattern="from './_cellText.mjs'" path=src`(應為 `ltdtDiffByKey`、`_ltdtkeys2matCore`、`ltdtkeys2mat`、`ltdtkeysheads2mat`、`ltdtDiff`、`arrDiff`、`matConcat`).

## R-DIFF-PAIR-01 差異比對之「先刪後增配對為 modify」單一擁有者 `_diffPair`

- **規則**:`strDiff`(逐行)與 `arrDiff`(逐元素、逐列、逐格)之配對一律經 `src/_diffPair.mjs`(自 `strDiff` 原樣抽出之演算法:連續 icOld 個刪除項後至多 icOld 項內找第一段新增項,依序配對前 min 個為 modify).`arrDiff` 不再把陣列串成文字再切回(值內含換行、`⟋`、`∶` 不再錯位或截斷);矩陣模式之列鍵為各格比對文字陣列之 JSON,modify 列再逐格比對,格鍵為 `[欄位指標, 文字]`(同修前以「欄位指標∶值」比對之語意,故 `dfs` 不變).
- **等價證據**:修前副本與新碼對 11003 組隨機輸入(值不含換行、`⟋`、`∶`;一維 3000、`strDiff` 3000、矩陣與 `matDiff` 各 2000、`ltdtDiff` 2000)之 `dfs`(`strDiff` 為整個結果)逐一相同;JSDoc 範例之 `dfs` 以實跑重產比對,`arrDiff`、`matDiff` 0 處改變、`ltdtDiff` 只有原 `0 df [` 筆誤改為 `{`.

## R-TZ-WALL-01 帶時區之時刻依其時區驗證(`istimeTZ`、`istimemsTZ`)

- **規則**:時區為有效偏移(`'Z'` 或 `±HH:mm`,HH 00～23、mm 00～59;`_tz.isValidOffset`)者,去除時區後以 `_tz.isWallTime` 依該時區之固定偏移逐欄驗證;checkTZ 所收而非有效偏移者(`'|08:00'`、`'+99:99'`)維持修前之本機時間判定(外審 T6).有效偏移者(以 UTC 建立 Date 並逐欄比對:年 0000～9999、月、日依格里曆閏年、時 0～23、分 0～59、秒 0～59、毫秒 000～999),不經本機時間往返比對,結果不受執行環境時區影響.dayjs 不可用時仍拋 `invalid dayjs`(`_dayjs.assertDayjs`,維持修前失敗形式,使 `timeTZ2past` 等不變).
- **等價證據**:新舊對 200000 組隨機輸入 × 4 種呼叫(共 800000)於 Asia/Taipei 與 UTC 皆 0 處不同(隨機生成不含夏令空窗之時刻);夏令空窗內者(Asia/Taipei 1974、1979;America/New_York 2026-03-08 02:30)修前 `false`、修後 `true`.
- **帶時區之 11 個轉換函數(裁定表〈十五〉,使用者 2026-11-15 甲;撤銷〈十三〉對此 11 個之「程式碼不改」;ws430c3)**:`timeTZ2day`、`timeTZ2hour`、`timeTZ2min`、`timemsTZ2day`、`timemsTZ2hour`、`timemsTZ2min`、`timemsTZ2time` 經 `istimeTZ`／`istimemsTZ` 驗證後直接取字串中之時刻欄位(`t.slice(0, 10|13|16|19)`),不經本機時間解析(原以本機時間解析再 format,空窗內差 1 小時);`timeTZ2past`、`timemsTZ2past`、`timeTZ2expire`、`timemsTZ2expire` 之時刻原即以帶偏移之字串解析為絕對時刻(固定偏移),程式不需改,日界與顯示之時:分依本機時區(對所有輸入一致,不變).差分(HEAD 對新碼,11 函數 × 6000 組隨機輸入,含各種偏移、毫秒、年 0000～0120、空窗)於 Asia/Taipei、UTC、America/New_York 之非空窗輸入各 66000 次呼叫 0 處不同.

- **擴及不帶時區者與非有效偏移(排程第 428 項,wsr1 2026-11-27;主控裁示: 原誤判為無效者改為有效屬缺陷修正;撤銷裁定表〈十三〉〈十四〉對 `istime`／`istimems` 與 7 個不帶時區轉換函數之「程式不改」)**:
  1. `istime`、`istimems` 以 `_tz.isWallTime`;`isday` 以 `_tz.isWallDay`;`ismonth` 以 `_tz.isWallMonth`(程式改而結果不變:月份往返不跨月,變異 M04 為等價);`istimeTZ`、`istimemsTZ` 對 checkTZ 所收之全部時區(含非有效偏移 `'|08:00'`、`'+99:99'`、`'+24:00'`,寬鬆收錄不變)一律 `isWallTime`,`_tz.isValidOffset` 已移除.各函數於驗證前仍呼叫 `_dayjs.assertDayjs()`(dayjs 不可用時拋 `invalid dayjs`,維持呼叫端之失敗形式).
  2. 轉換函數 `time2day`／`time2hour`／`time2min`／`timems2day`／`timems2hour`／`timems2min`／`timems2time`(`t.slice(0, 10|13|16|19)`)、`getTimeRange`(日 `slice(0, 10)`、時分 `slice(11, 16)`)、`day2cht`(年月日以 `Number(t.slice(…))`)、`domShowInputDatatime`(顯示值 `slice(0, 16)`)經判斷後直接取字串欄位,不經本機時間解析;上列檔不再 import `_dayjs`(`istime` 等仍 import 以 assertDayjs).
  3. 盤點(「本機時間往返或解析」軸): `Grep pattern="ot\\(" path=src` 之時刻字串解析站點——判斷 6 檔與轉換 10 檔已改;`addMonth`(只到月,往返不跨月)、`getTimeObject`／`getTimeBetween`(以 dayjs 做時間單位加減,非輸入檢查)、`now2str` 系(以「現在」產生字串)、`timeTZ2past` 等 past/expire(以帶偏移之字串解析為絕對時刻)不屬本項.
  5. **(原已知缺口,wsr3 第 675 項已處理,見下〈擴及 getTimeBetween 等〉)**: `getTimeBetween`／`getTimeObject` 之序列缺項或重複、空窗內時刻回 `null`,與 `timemsTZ2past`／`timemsTZ2expire` 於午夜不存在之日少算天數.

- **擴及 `getTimeBetween`、`getTimeObject` 與日曆差(排程第 675 項〔中〕,wsr3 2026-11-27;主控裁示: 本機夏令下之錯誤結果改為正確屬缺陷修正;破壞性變更第 86 項①②)**:
  1. **共用逐欄驗證 `_tz.parseWallUnit(t, unit)`**: 依單位補齊至 `YYYY-MM-DDTHH:mm:ss` 後以 `isWallTime` 驗證,回傳 `{ y, mo, d, h, mi, s, ms }`(`ms` 為牆鐘時刻視為 UTC 之毫秒數,以 `setUTCFullYear` 建立,年 0～99 不對映為 1900～1999);單位不在六選項或字串無效回 `null`.
  2. `getTimeBetween`: 以 `parseWallUnit` 驗兩端,項數與各項以 UTC 日曆運算(years/months 以欄位算術,days/hours/minutes/seconds 以 `ms` 加固定步長再 `toISOString().slice`),**不經本機時間、不經 dayjs**;保留 `tstart >= tend` 回 `[]`、非預期 `unit` 改用 `'days'`.`getTimeObject`: 有效性以 `parseWallUnit` 判定,回傳仍為 `ot(t + e, fm)` 之本機 dayjs 物件(對外語意不變;空窗內之時刻物件為 JS 規則推移後之本機時刻),`ot.assertDayjs()` 維持 dayjs 不可用之拋錯.
  3. **`timemsTZ2past`、`timemsTZ2expire`(連帶 `timeTZ2past`、`timeTZ2expire`)之天、周、月、年數**: 以內部檔 `src/_calDayDiff.mjs`(`calDayDiff(later, earlier)`)取兩日('YYYY-MM-DD',本機時區之日期)之日曆差,語意同 dayjs 之 `diff`(天為日曆日差、周為天除 7 取整、月為 earlier 加整數個月〔日超出該月天數取月底〕不超過 later 之最大整數、年為月除 12 取整);任一日期非標準寫法(如本機時區使年份超出 0000～9999)回 `null` 時退回原 dayjs 算法.原算法於午夜不存在之日(夏令於 00:00 起跳之時區)少算 1 天.秒、分、時之差仍為時刻(毫秒)差.「今天、昨天、明天」之日界與顯示之時:分仍依本機時區(JSDoc 已載).
  4. **同機制盤點(`Grep` 本機 `Date`／dayjs 加減與 getter)**: 已處理 = `getTimeBetween`、`getTimeObject`(有效性)、`timemsTZ2past`／`expire`(連帶 `timeTZ2past`／`expire`);**判定無缺陷未動** = `addMonth`(dayjs 於 `'YYYY-MM'` 之本機 1 日午夜加月: 以全部 419 個 IANA 時區 × 1900～2100 年 × 12 個月 × 增減 1／-1／12／13／-13 個月共 505 萬次、年份 0～130 與 9900～9999 共 581 萬次〔超出 0000～9999 者期望回 `''`〕對純算術 0 處不同);**依設計不處理** = `now2str` 系、`nowDay2str`、`fsSrlog`(以「現在」之本機時間產生字串,無加減)、`_dayjs.mjs`(年 0～99 之本機 `Date` 建立,僅供 `addMonth`／`getTimeObject` 之物件與 `timemsTZ2*` 之解析,無空窗問題〔LMT 偏移無跳躍〕)、`genClockTZ`(已為 UTC 日曆運算);經過時間類(`Date.now()` 之差,不受夏令影響).
  5. **測試**: `test/timeBetween675.test.mjs`(8 時區 × 3 案 ＋ 前提案 ＋ dayjs 不可用案 ＋ 同環境案,共 27 案;子行程 `test/tools/timeBetweenRunner.mjs`,期望值為手寫序列,各時區皆同;前提案確認各空窗輸入於其時區確不存在、重疊輸入出現兩次,於 UTC 皆否;`WSEMI_TIME675_SRC` 指向修前 src 時修前 12 failing／15 passing)、`test/timemsTZ2dayDiff675.test.mjs`(7 案: Cairo、Sao_Paulo 午夜起跳之日、New_York、Taipei、UTC 之天周月年,`calDayDiff` 之月底夾取與閏日;修前 3 failing／4 passing)、既有 `getTimeBetween`／`getTimeObject`／`timemsTZ2past`／`expire`／`timeTZ2past`／`expire`／`dateYear0000` 全綠.差分(`tmp` 腳本,已清除): `getTimeBetween`／`getTimeObject` 新舊於 UTC 與 Asia/Taipei 各 7752 次呼叫 0 處不同;`calDayDiff` 對 dayjs 於 UTC 37.8 萬對 0 處不同(年份 0000 閏日一例為 dayjs 之年份 0～99 對映所致,以本函數為正).
  4. 等價證據: 新舊差分(`tmp` 腳本,已清除;數字存於本輪報告)7 時區(UTC、Asia/Taipei、America/New_York、Europe/London、Australia/Sydney、Pacific/Apia、America/Sao_Paulo)× 每時區 5444307 次呼叫(23 個函數,結構化欄位組合含越界值、6 萬筆隨機時刻、16 種畸形寫法,含毫秒與 9 種時區後綴):修後結果之雜湊 7 時區相同;UTC 與 Asia/Taipei 新舊 0 處不同;其餘 5 時區之差異共 2300 次,皆為修前失敗(`false`、`''`、error)而修後成功,0 處反向.

## 測試

- `test/timeWallGap428.test.mjs`(16 案,第 428 項;子行程 `test/tools/timeWallGapRunner.mjs` 於 7 時區執行,期望值取自 JSDoc〔有效即 true、轉換即字串欄位〕;另有「各空窗輸入於其時區確為不存在之本地時刻、於 UTC 則否」之鑑別前提案;`WSEMI_TIME428_SRC` 指向修前 src 時子行程改載該處:修前 6 failing／10 passing〔6 個有空窗之時區全紅,UTC 與對照組綠〕,修後 16 passing;變異 M01～M10 中 9 項被殺、M04〔ismonth〕等價).
- `test/elemLevelRulesB3.test.mjs`(109 案;第 428 項改寫〈十三-1〉〈十三-4〉〈十四-4〉〈十四-6〉之期望為逐欄驗證(各案註明原規格與改由);ws430c3 增〈十五〉4 案〔`test/tools/timeTZConvRunner.mjs` 之子行程於三時區執行〕;每個 describe 對應裁定表一節,it 標題前綴〈節-列〉,期望值取自裁定表文字;〈十四〉以 `test/tools/istimeTZRunner.mjs` 之子行程於 Asia/Taipei、UTC、America/New_York 執行;JSDoc 列以讀 `src` 之 JSDoc 文字守門;末 describe〈外審補案(ws430c2)〉7 案對應外審 T2～T5、T9、T10、T13、T15,另〈十四-6〉對應 T6).
- 依新規格改寫之既有測試(註明裁定表節號):`arrAt`、`arrDiff`、`matDiff`、`ltdtDiff`、`ltdtpull`、`matConcat`、`matat`、`strFindSimilar`、`keysmat2ltdt`、`mat2ltdt`、`ltdtkeys2mat`、`ltdtkeysheads2mat`、`optValG6strArrNum`、`invalidInputQ1`;`test/tools/diffInputKit.mjs` 新增 `oldDiffToNew`(把修前之 `diff` 期望值轉為新格式,段之切分不變).
- 執行:`npx mocha --no-parallel test/elemLevelRulesB3.test.mjs --timeout 180000`.
- 變異(2026-11-15,腳本 `tmp/ws430c2/mutate.mjs`,已清除,副本存主控任務證據檔):66 項逐一把新碼改回舊寫法或拿掉裁定之處理,65/66 被殺;初跑存活 M29(`ltdtDiff` 取值改回 `o[k]`)補〈六-2〉繼承鍵案後被殺;M43(拿掉 `isWallTime` 之「日」比對)為等價變異(日溢位必改變月份).M51～M66 為外審修正之項(快照、內部槽、`isValidOffset`、BigInt 鍵、`readFill` 之 V4 等).

### 外審(2026-11-15,terra `gpt-6.1-terra` max;15 條)

- 屬實並修正:T2、T3(`strFindSimilar` 包裝物件與 BigInt／Symbol 候選須不變)、T4(BigInt 鍵須不變)、T5(不呼叫輸入陣列之方法)、T6(無效時區後綴須不變)、T9(包裝物件以內部槽判定)、T10(`readFill` 之 V4)、T13(檢查之列即使用之列)、T15(`ltdtDiff` 之 `__proto__` 欄以自有欄位輸出,修前即同).
- 屬實但修前即同、不改(列已知限制):T7(以原型提供數字索引之陣列,空位讀到原型之值)、T8(`isarr`／`isobj` 以型別標籤判定,可被 `Symbol.toStringTag` 偽造)、T11(`returnWithStateAndMsg` 之 getter 拋錯外拋;全庫以 lodash `get` 讀 opt 之既有行為)、T12(`funLog` 之 getter 拋錯使 `debug` 一併視為 false;既有共用出口 `optVal.readDbg` 之行為).
- 屬裁定未涵蓋之解讀、列待裁:T1(kphead 自有 `undefined` 值視為缺對應給 `emptyHead`)、T14(函數作為欄位名比照 `arr2dt` 略過).

### 已知限制

- 上列 T7、T8、T11、T12(修前即同).
- ~~帶時區之 `time*TZ2*` 11 個對夏令空窗內之有效時刻轉出差 1 小時~~ → 裁定表〈十五〉已修(ws430c3,見 R-TZ-WALL-01).