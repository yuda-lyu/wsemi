# 規則帳本(事件派發)

本檔 2026-11-22 新建(自本套件之 Claude Code 自動記憶提取使用者原則與 2026-09-12~13 之定案);全部條目之索引見 `sgud/rule/rulebook.md`〈索引〉.

## R-EVEM-RAW-01 evem 只回裸 eventemitter3;計時器、串流、監視器回呼內之派發經 evEmit／evEmitDelay

- 依據: 使用者原則(2026-09-13)「evem 是很底層的功能, eventemitter3 本身就有其功能性, 封裝層就是要讓其發揮功能, 並保持調用/觸發方不會拿到非預期或觸發非預期事件」.2026-09-07~08 曾於註冊時包裝監聽器(`type:'safe'`),2026-09-12~13 全數移除(過程與教訓見 `sgud/exp/experience_20261122.md` 〈事件派發之定案與「連續補丁」之教訓〉).
- 單一擁有者: `src/evem.mjs`(只回 `new EventEmitter()`,其 JSDoc 載明語意)、`src/evEmit.mjs`(派發站點攔截;pm 之 settle 排在通報之前,明文要求不得對調;自行輸出經 getDiag,R-DIAG-01 規則 14)、`src/evEmitDelay.mjs`(脫勾派發,其內部以 evEmit 派發;`opt.ms` 依 R-ENUM-01 之 `use:'timer'`,超出計時器上限者改用預設 1,不夾限).
- 規則:
  1. **`evem()` 不包裝、不攔截**: 監聽器同步拋錯依 EventEmitter 規範由 emit 外拋至呼叫端,並中止該次派發之其餘監聽器;async 監聽器之 reject 不被觀察(規範預設丟棄回傳值,`captureRejections` 為 Node 專屬 opt-in,瀏覽器與 eventemitter3 皆無),監聽器須自行處理,非同步結果以事件所帶之 pm 回覆.不得再於註冊時包裝監聽器(包裝須維護函數對應表,使 `on`／`off`／`once`／`listeners` 偏離規範,封裝層自身即成為「調用方拿到非預期」之來源).
  2. **於 timer、stream、watcher 等「無呼叫端之堆疊」回呼內,對使用者可掛監聽器之事件物件派發者,一律經 `evEmit`**(同堆疊內以 try 攔截);確需脫勾者經 `evEmitDelay`,不自行 `setTimeout(() => ev.emit(...))`(該堆疊沒有呼叫者,try 攔不到,純同步監聽器亦然).**(2026-11-27 wsr2 明文涵蓋 Promise 鏈與 microtask)** 判準為「回呼內拋錯有無人承接」: ①`Promise.resolve().then(...)`、`queueMicrotask`、`.catch(...)` 之處理函數內(其拋錯成為 unhandled rejection,無人觀察)派發者,比照 timer,一律經 `evEmit`;②`.then(...)` 之回呼內派發而鏈尾有 `.catch` 承接、且「監聽器拋錯轉為某事件或某結果」為該模組之**文件化契約**者,不套(例: `domDropFiles` 之 `getFiles` 監聽器拋錯轉為 `error` 事件);③瀏覽器 DOM 事件回呼、ResizeObserver 回呼內之同步派發,派發前狀態已更新、拋錯由瀏覽器回報而不致使模組狀態不一致者,維持直接派發(須測試鎖定),但同一函數若另有無人承接之路徑(計時器、microtask),該路徑須經 `evEmit`(`domDetect.post` 以 `deferred` 區分、`domDrag.deliver` 以 `safe` 區分).
  3. `evEmit` 之 `opt.funSettle`: 派發所帶之 pm 於監聽器出錯時先 settle 再通報,使流程在結構上不可能懸置;無回覆通道之事件不給.已覆寫 `ev.emit` 之模組(`fsEvem`)以 `opt.funEmit` 指定原生 emit.
  4. 事件之 timer 毫秒進 `setTimeout` 前須在計時器上限內(`cst.TIMER_TIME_MAX`=2147483647;超過者 Node 夾成 1ms 並警告,瀏覽器環繞無警告): 使用者給之 opt 依 R-ENUM-01 `use:'timer'` 與 R-OPT-VAL-01(超出改用預設,不夾限);內部運算所得之延遲用 `Math.min(x, cst.TIMER_TIME_MAX)`(不可用 max).
- 盤點指令: `git grep -n -E "\.emit\(" -- src`(排除註解行)與 `git grep -l -E "evEmit(Delay)?\b" -- src`.
- 站點全集與判準(2026-11-22 盤點;**2026-11-27 wsr1 逐站判定**,排程第 599 項②;盤點指令之原始命中 24 行,扣 JSDoc 2 行〔`evem.mjs`、`fsEvem.mjs` 之範例〕與 `evEmit` 本體 `evEmit.mjs:94` 後為 21 站):
  - 已經 `evEmit`／`evEmitDelay` 者(13 個模組,與 2026-11-22 相同、無增減): `_detector`、`alive`、`cache`、`cacheSt`、`debounce`、`domIsStable`、`fsBuildReadStreamText`、`fsEvem`、`fsTask`、`fsTaskCp`、`fsWatchFile`、`fsWatchFolder`、`queue`;此 13 模組內無殘留之使用者可掛事件之直接 `.emit(`(`domIsVisible` 經 `_detector` 之派發,亦已套).
  - 直接 `.emit(` 之 21 站逐站判定(判準:事件物件使用者可否掛監聽器 × 派發所在之堆疊是否有呼叫端):
    - **已套(間接)1**: `fsEvem.mjs:264`(呼叫覆寫後之 `ev.emit`,其內本地派發經 `evEmit`,`funEmit` 指定原生 emit;寫檔分支不派發).
    - **刻意不套 13**(另 `domDrag` 2 站為部分,見下):
      - 事件 id 為模組自身之 settle 通道、使用者取不到該事件物件(監聽者只有模組自身之 `once(id)`): `pmQueue.mjs:442`、`pmThrottle.mjs:300`、`pmThrottle.mjs:331`(3).
      - 瀏覽器 DOM 事件回呼內之同步派發,派發前狀態已更新(監聽器拋錯只成為瀏覽器回報之 uncaught 並中止該次其餘監聽器,不使模組狀態不一致): `domDetect.mjs:492`(window resize)、`domDragBarAndScroll.mjs:195`、`:201`、`:218`、`:261`(press/drag/free/wheel;wheel 之 `domCancelEvent` 先於派發)、`domDragPointer.mjs:198`、`:206`、`:213`、`:284`(lock/unlock 先於派發)、`domDropFiles.mjs:211`(dragenter/dragover)(10).
    - **部分 2(已處置,2026-11-27 wsr2)**: `domDrag.mjs`(`deliver`)之 DOM 事件路徑刻意不套(`endDrag` 已先清狀態;`test/domDrag.test.mjs`〈should clear the drag even when a drop listener throws〉等鎖定監聽器拋錯外拋),**microtask 路徑已套**: `deliver(g, ele, mode, build, safe)`、`endDrag(g, e, hit, reason, safe)` 之 `safe` 為 true 時經 `evEmit(inst.ev, name, [payload], { tag: 'domDrag' })`,僅 `scheduleTeardown`、`checkSourceLater` 兩處 microtask 呼叫傳 `true`(`scheduleTeardown` 時群組已無成員,實際不會派發,寫法與另一處一致;原稱「`kpDgs.delete` 被跳過」不成立——無成員則 `deliver` 無實例可派發).
    - **原未套 5 站之處置(2026-11-27 wsr2,主控派工「逐站改為經 evEmit 或判定刻意不套並寫明理由」)**:
      - `domDetect.mjs:359`、`:371`(`post`): **已套**(`deferred` 為真,即 `setTimeout`、節流後續、`refresh` 之路徑,經 `evEmit(ev, name, [payload], { tag: 'domDetect' })`;`resize` 之監聽器拋錯不再成為 uncaught、其後之 `resizeWithWindow` 仍發出);`sync` 路徑(ResizeObserver 回呼內)維持直接派發(`test/domDetect.test.mjs`〈should update the waiting state even when a sync listener throws〉鎖定外拋).
      - `domDropFiles.mjs:227`: **已套**(100ms 計時器內 `dropOut` 經 `evEmit`,`{ tag: 'domDropFiles' }`).
      - `domDropFiles.mjs:269`(`getFiles`): **刻意不套**——`.then` 之回呼內派發、鏈尾有 `.catch` 承接,且「`getFiles` 監聽器拋錯轉為 `error` 事件、`onTrace` 之 `error` 於其前通知」為文件化契約(JSDoc 與 `test/domDropFiles.test.mjs`〈should notify error before error is emitted when reading the dropped content fails or the getFiles listener throws〉);改經 `evEmit` 會使該 `error` 事件之 payload 由拋出值本身改為 `{ fun: 'listener', name: 'getFiles', msg, args }` 並使 `onTrace('error')` 不再於其前通知,屬破壞性契約變更,**列需裁示**(主控如要求一致,改法為 `.then` 內以 `evEmit` 派發 `getFiles`,並調整 `onTrace('error')` 之語意).
      - `domDropFiles.mjs:282`(`.catch` 內之 `error`): **已套**(`.catch` 之處理函數內拋錯無人承接而成 unhandled rejection;`error` 之監聽器拋錯時 `evEmit` 對 `name === 'error'` 不重發而經 `getDiag` 輸出固定 label 與安全摘要).
    - 規則 2 之「無呼叫端之堆疊」是否涵蓋 Promise 鏈與 microtask: **已明文涵蓋**(見規則 2 之 wsr2 增訂,判準為回呼內拋錯有無人承接).
- 測試: `test/evem.test.mjs`(裸實例語意)、`test/evEmit.test.mjs`、`test/evEmitDelay.test.mjs`(含通報經 getDiag 出口)、`test/evemSafe.test.mjs`(各模組之派發站點整合案;檔名沿用舊稱「safe」).
- 驗法: 「行程會崩潰」類主張以子行程斷言 exit code(mocha 本行程會攔 uncaught);unhandledRejection 在 mocha 管線下會觸發 2 次(獨立執行 1 次),斷言用 includes 不數次數;盤點「事件派發」軸用 `evem(|EventEmitter|chokidar|fs.watch` 全範圍.
- 變更紀錄:
  - 2026-09-07~08: 加 `type:'safe'` 包裝監聽器(約 270 行).
  - 2026-09-12~13: 移除 safe 版,`evem` 回裸 `new EventEmitter()`(43 行含 JSDoc),新增 `evEmit`／`evEmitDelay`,10 個模組改用,13 個 timer 站點加 `Math.min(x, cst.TIMER_TIME_MAX)`.
  - 2026-10-31: `evEmit` 自行輸出改經 getDiag 出口,不再原樣輸出拋出值(破壞性變更第 44 項).
  - 2026-11-02 起: 計時 opt(含 `evEmitDelay.opt.ms`)改依 `use:'timer'`,超出上限者改用預設而非夾限(`rulebook_judge_sites_r2.md` ws272a).
  - 2026-11-27(wsr1,排程第 599 項②): 21 站逐站判定(已套 1、刻意不套 13、未套 5、部分 2),程式未改;未套與部分之 microtask 路徑列待修.
  - 2026-11-27(wsr2,排程第 663 項批 11 併 A 輪需裁示 ②): 原未套 5 站與部分 2 站(共 7 站)之處置落實——已套 6 站(`domDetect` `post` 之延後路徑 2、`domDropFiles` 之 `dropOut` 與 `.catch` 內 `error` 2、`domDrag` 之 microtask 路徑 `leave`／`drop` 之 `deliver` 2)、刻意不套 1(`domDropFiles` `getFiles`,列需裁示);規則 2 明文涵蓋 Promise 鏈與 microtask.行為改變見破壞性變更第 85 項⑤.測試: `test/domDetect.test.mjs`(延後路徑新增 2 案、既有「監聽器拋錯不中斷其他偵測器」案改寫為「亦不使其後之事件不發、錯誤經 evEmit 通報」)、`test/domDropFiles.test.mjs`(新增 3 案,含 `getFiles` 維持之案)、`test/domDrag.test.mjs`(新增 1 案);變異 `X35`～`X42` 全被殺(含反向之 `X37`「同步路徑誤改為經 evEmit」,以鎖定 sync 路徑外拋).修前紅: 於修前鏡像根(A 輪完成後之工作樹複本)跑含 `R-EVEM-RAW-01` 之案,7 failing／1 passing(唯一綠者為 `getFiles` 維持之行為保持案;7 項含 `domDetect` 之改寫案與一項因同一 uncaught 連帶之 `done() called multiple times`);修後 7 passing(連跑 20 次皆綠).
