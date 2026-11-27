# 狀態(時間字串之判斷與轉換)

本檔 2026-11-27(wsr1)新建(`state_dom與資料.md` 已約 37.8KB,另開類型檔);帶時區者之前一輪(第 430 項第三批〈十四〉〈十五〉)之現況見 `sgud/state/state_結構函數.md`(2026-11-27 wsr2 自 `state_dom與資料.md` 抽出).只記現況、不寫過程(過程見 `sgud/exp/experience.md`);索引見 `sgud/state/state.md`.新增之現況附於本檔最前.

## `getTimeBetween`／`getTimeObject` 不經本機時間、日曆差(排程第 675 項〔中〕;主控任務 20261127121903 wsr3,2026-11-27;package.json version 1.9.82 之工作樹,未提交未發布)

- **已改**(規則 `sgud/rule/rulebook_elem_b3.md` R-TZ-WALL-01〈擴及 getTimeBetween、getTimeObject 與日曆差〉;破壞性變更第 86 項①②):
  - `_tz.parseWallUnit(t, unit)`(新): 依單位補齊後逐欄驗證並回傳欄位與「牆鐘視為 UTC」之毫秒數.`getTimeBetween` 以之做日曆運算(不經本機時間、不經 dayjs),各時區結果相同;`getTimeObject` 之有效性改逐欄驗證(夏令空窗內之時刻與整日被跳過之日不再回 `null`;物件仍為本機 dayjs 物件,空窗內為推移後之本機時刻).
  - `src/_calDayDiff.mjs`(新,內部): `timemsTZ2past`／`timemsTZ2expire`(連帶 `timeTZ2past`／`expire`)之天、周、月、年數改兩日之日曆差(原於午夜不存在之日少算 1 天);非標準寫法退回原 dayjs 算法.
  - 同機制盤點: `addMonth` 判定無缺陷(419 時區窮舉 0 差)未動;`now2str` 系、`fsSrlog`、`_dayjs`、`genClockTZ`、經過時間類依設計不處理(理由見規則).
- **測試**: `test/timeBetween675.test.mjs`(27 案,8 時區子行程;修前 12 failing)、`test/timemsTZ2dayDiff675.test.mjs`(7 案;修前 3 failing);變異 M01～M08、M24 皆被殺.
- **已知缺口**: 無(wsr1 列之 `getTimeBetween`／`timemsTZ2past` 缺口已處置).`getTimeObject` 對空窗內時刻回「推移後之本機時刻」之物件,呼叫端不可據以取牆鐘欄位(取欄位請用字串);如主控要求空窗內仍回 `null` 或改回 UTC 物件,屬破壞性變更,另議(報告列需裁示).

## 判斷與轉換不經本機時間往返(排程第 428 項〔中〕併同批小項;主控任務 20261127030143 wsr1,2026-11-27;package.json version 1.9.81 之工作樹,未提交未發布)

- **已改**(規則 `sgud/rule/rulebook_elem_b3.md` R-TZ-WALL-01〈擴及不帶時區者與非有效偏移〉;破壞性變更第 84 項①②⑥):
  - 判斷: `istime`、`istimems`(`_tz.isWallTime`)、`isday`(`_tz.isWallDay`)、`ismonth`(`_tz.isWallMonth`,結果不變)、`istimeTZ`／`istimemsTZ` 之非有效偏移後綴(與有效偏移同一 `isWallTime`;`_tz.isValidOffset` 已移除)——逐欄驗證,結果不受執行環境之時區影響;空窗內之時刻與整日跳過之日由 `false` 改 `true`;`isDate` 隨之.
  - 轉換: `time2day`／`time2hour`／`time2min`／`timems2day`／`timems2hour`／`timems2min`／`timems2time`、`getTimeRange`、`day2cht`、`domShowInputDatatime`(顯示值)直接取字串欄位.
  - dayjs 不可用時之失敗形式不變(各判斷仍 `assertDayjs`).
- **同批小項**: `strCompareForVersion`、`getClearPathName` 收 String 包裝物件已回 `null`／`{ path: '', isRoot: false }`(符合 dspec S1／P1),本輪補 JSDoc 與測試鎖定,行為不變;`getltdtkeys([{a:1},'xy'])` 之 `'0','1'` 已於 ws430b(R-ELEM-LEVEL-01,字串列不貢獻鍵)修正,本輪核實(修前版實跑得 `["a","0","1"]`、現行 `["a"]`)並沿用既有測試(`test/getltdtkeys.test.mjs`、`test/elemLevelRules.test.mjs`).
- **測試**: `test/timeWallGap428.test.mjs`(16 案,7 時區子行程;修前 6 failing／修後 16 passing);改寫 `test/elemLevelRulesB3.test.mjs`〈十三-1〉〈十三-4〉〈十四-4〉〈十四-6〉;`test/strCompareForVersion.test.mjs`、`test/getClearPathName.test.mjs` 各增 1 案.
- **驗證**: 新舊差分 7 時區 × 5444307 次呼叫(修後雜湊各時區相同;UTC、Asia/Taipei 0 處不同;其餘差異 2300 次皆修前失敗→修後成功);變異 M01～M10 9/10 被殺(M04 `ismonth` 為等價);全套與發布包配置之數字見 `sgud/exp/experience.md` 之 wsr1 一節與本輪報告.
- **已知缺口**: `addMonth`、`now2str` 系不屬輸入檢查,未改(見 R-TZ-WALL-01 盤點);**`getTimeBetween`(經 `getTimeObject` 以本機時間加減)於空窗或整日跳過處之序列缺項或重複**(獨立複審實測;`getTimeObject` 回傳本機時間之 dayjs 物件,改 UTC 會改變對外語意,需裁示是否另排)、`timemsTZ2past`／`timemsTZ2expire` 於整日跳過之時區之日界(R-TZ-WALL-01 第 5 點);`istimeTZ` 仍寬鬆收錄 `'|08:00'`、`'+99:99'` 等非有效偏移(修前即同,未改).
