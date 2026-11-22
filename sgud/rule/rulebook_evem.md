# 規則帳本(事件派發)

本檔 2026-11-22 新建(自本套件之 Claude Code 自動記憶提取使用者原則與 2026-09-12~13 之定案);全部條目之索引見 `sgud/rule/rulebook.md`〈索引〉.

## R-EVEM-RAW-01 evem 只回裸 eventemitter3;計時器、串流、監視器回呼內之派發經 evEmit／evEmitDelay

- 依據: 使用者原則(2026-09-13)「evem 是很底層的功能, eventemitter3 本身就有其功能性, 封裝層就是要讓其發揮功能, 並保持調用/觸發方不會拿到非預期或觸發非預期事件」.2026-09-07~08 曾於註冊時包裝監聽器(`type:'safe'`),2026-09-12~13 全數移除(過程與教訓見 `sgud/exp/experience_20261122.md` 〈事件派發之定案與「連續補丁」之教訓〉).
- 單一擁有者: `src/evem.mjs`(只回 `new EventEmitter()`,其 JSDoc 載明語意)、`src/evEmit.mjs`(派發站點攔截;pm 之 settle 排在通報之前,明文要求不得對調;自行輸出經 getDiag,R-DIAG-01 規則 14)、`src/evEmitDelay.mjs`(脫勾派發,其內部以 evEmit 派發;`opt.ms` 依 R-ENUM-01 之 `use:'timer'`,超出計時器上限者改用預設 1,不夾限).
- 規則:
  1. **`evem()` 不包裝、不攔截**: 監聽器同步拋錯依 EventEmitter 規範由 emit 外拋至呼叫端,並中止該次派發之其餘監聽器;async 監聽器之 reject 不被觀察(規範預設丟棄回傳值,`captureRejections` 為 Node 專屬 opt-in,瀏覽器與 eventemitter3 皆無),監聽器須自行處理,非同步結果以事件所帶之 pm 回覆.不得再於註冊時包裝監聽器(包裝須維護函數對應表,使 `on`／`off`／`once`／`listeners` 偏離規範,封裝層自身即成為「調用方拿到非預期」之來源).
  2. **於 timer、stream、watcher 等「無呼叫端之堆疊」回呼內,對使用者可掛監聽器之事件物件派發者,一律經 `evEmit`**(同堆疊內以 try 攔截);確需脫勾者經 `evEmitDelay`,不自行 `setTimeout(() => ev.emit(...))`(該堆疊沒有呼叫者,try 攔不到,純同步監聽器亦然).
  3. `evEmit` 之 `opt.funSettle`: 派發所帶之 pm 於監聽器出錯時先 settle 再通報,使流程在結構上不可能懸置;無回覆通道之事件不給.已覆寫 `ev.emit` 之模組(`fsEvem`)以 `opt.funEmit` 指定原生 emit.
  4. 事件之 timer 毫秒進 `setTimeout` 前須在計時器上限內(`cst.TIMER_TIME_MAX`=2147483647;超過者 Node 夾成 1ms 並警告,瀏覽器環繞無警告): 使用者給之 opt 依 R-ENUM-01 `use:'timer'` 與 R-OPT-VAL-01(超出改用預設,不夾限);內部運算所得之延遲用 `Math.min(x, cst.TIMER_TIME_MAX)`(不可用 max).
- 盤點指令: `git grep -n -E "\.emit\(" -- src`(排除註解行)與 `git grep -l -E "evEmit(Delay)?\b" -- src`.
- 站點全集與判準(2026-11-22 盤點;**未逐站判定**,下次涉及該檔時依規則 2 判定並回填本節):
  - 已經 `evEmit`／`evEmitDelay` 者(13 個模組): `_detector`、`alive`、`cache`、`cacheSt`、`debounce`、`domIsStable`、`fsBuildReadStreamText`、`fsEvem`、`fsTask`、`fsTaskCp`、`fsWatchFile`、`fsWatchFolder`、`queue`.
  - 直接 `.emit(` 者(grep 共 22 處,含 `evEmit` 本體 1 處):
    - `domDetect`(3)、`domDrag`(2)、`domDragBarAndScroll`(4)、`domDragPointer`(4)、`domDropFiles`(4): 瀏覽器 DOM 事件回呼內之派發.
    - `fsEvem`(1,已覆寫之 emit 內)、`pmQueue`(1)、`pmThrottle`(2): 事件 id 為模組自身之 settle 通道(監聽者為模組自身).
- 測試: `test/evem.test.mjs`(裸實例語意)、`test/evEmit.test.mjs`、`test/evEmitDelay.test.mjs`(含通報經 getDiag 出口)、`test/evemSafe.test.mjs`(各模組之派發站點整合案;檔名沿用舊稱「safe」).
- 驗法: 「行程會崩潰」類主張以子行程斷言 exit code(mocha 本行程會攔 uncaught);unhandledRejection 在 mocha 管線下會觸發 2 次(獨立執行 1 次),斷言用 includes 不數次數;盤點「事件派發」軸用 `evem(|EventEmitter|chokidar|fs.watch` 全範圍.
- 變更紀錄:
  - 2026-09-07~08: 加 `type:'safe'` 包裝監聽器(約 270 行).
  - 2026-09-12~13: 移除 safe 版,`evem` 回裸 `new EventEmitter()`(43 行含 JSDoc),新增 `evEmit`／`evEmitDelay`,10 個模組改用,13 個 timer 站點加 `Math.min(x, cst.TIMER_TIME_MAX)`.
  - 2026-10-31: `evEmit` 自行輸出改經 getDiag 出口,不再原樣輸出拋出值(破壞性變更第 44 項).
  - 2026-11-02 起: 計時 opt(含 `evEmitDelay.opt.ms`)改依 `use:'timer'`,超出上限者改用預設而非夾限(`rulebook_judge_sites_r2.md` ws272a).
