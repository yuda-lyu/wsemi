# 狀態(事件派發)

本檔 2026-11-27(wsr1)新建: R-EVEM-RAW-01(`sgud/rule/rulebook_evem.md`)之站點判定現況與待辦;只記現況、不寫過程(過程見 `sgud/exp/experience.md`);索引見 `sgud/state/state.md`.新增之現況附於本檔最前.

## R-EVEM-RAW-01 未套 5 站與部分 2 站之處置落實(排程第 663 項批 11 併 A 輪需裁示 ②;主控任務 20261127030143 wsr2,2026-11-27;package.json version 1.9.81 之工作樹,與 wsr1 同一次發布,未提交未發布)

- **現況**(已實作,規則見 `rulebook_evem.md` R-EVEM-RAW-01 規則 2 之 wsr2 增訂與站點全集;破壞性變更第 85 項⑤): 7 站中 **6 站已經 `evEmit`**——`domDetect.mjs`(`post` 之 `deferred` 路徑,即計時器、節流後續、`refresh`;`resize` 之監聽器拋錯不再成為 uncaught,其後之 `resizeWithWindow` 仍發出)2 站、`domDropFiles.mjs` 之 100ms 計時器內 `dropOut` 與 `.catch` 內 `error` 2 站、`domDrag.mjs` 之 microtask 路徑(`deliver`／`endDrag` 之 `safe` 參數,僅 `scheduleTeardown`、`checkSourceLater` 傳 `true`)2 站;**1 站刻意不套**——`domDropFiles.mjs` 之 `getFiles`(監聽器拋錯轉為 `error` 事件為文件化契約,payload 為拋出值本身,`onTrace('error')` 於其前通知;鏈尾 `.catch` 承接).維持直接派發者(各有測試鎖定外拋): `domDetect` 之 `sync` 路徑、`domDrag` 之 DOM 事件路徑、瀏覽器 DOM 事件回呼內之同步派發.規則 2 已明文涵蓋 Promise 鏈與 microtask(判準: 回呼內拋錯有無人承接).
- **測試**: `test/domDetect.test.mjs`(新增 2 案,既有「監聽器拋錯不中斷其他偵測器」案改寫)、`test/domDropFiles.test.mjs`(新增 3 案)、`test/domDrag.test.mjs`(新增 1 案);含 `R-EVEM-RAW-01` 之案於修前鏡像根 7 failing／1 passing,修後 7 passing(連跑 20 次皆綠);變異 `X35`～`X42` 全被殺;全套與發布包配置見 `state_判斷與轉型.md` 最前節(34245／8／0).
- **待裁示**: `domDropFiles` 之 `getFiles` 是否一致改經 `evEmit`(選項甲: 維持,現況;乙: 改經 `evEmit`,`error` 事件之 payload 對該情形改為 `{ fun: 'listener', name: 'getFiles', msg, args }`,`onTrace('error')` 之語意須同步改——破壞性契約變更).建議甲.

## R-EVEM-RAW-01 之站點逐站判定(排程第 599 項②;主控任務 20261127030143 wsr1,2026-11-27;package.json version 1.9.81 之工作樹,程式未改)

- **現況**: 直接 `.emit(` 21 站逐站判定——已套(間接)1(`fsEvem.mjs:264`)、刻意不套 13(`pmQueue`／`pmThrottle` 之 settle 通道 3、瀏覽器 DOM 事件回呼之同步派發 10)、未套 5、部分 2;已用 `evEmit`／`evEmitDelay` 之 13 模組與 2026-11-22 盤點相同.全表見 `rulebook_evem.md`〈站點全集與判準〉.
- **待辦(未套,需裁示是否於下一輪修)**:
  1. `domDetect.mjs:359`、`:371`: 延後路徑 `setTimeout(() => post(...))` 內直接 emit(規則 2 明文禁止之形).
  2. `domDropFiles.mjs:227`: `setTimeout(100)` 內直接 `ev.emit('dropOut')`.
  3. `domDropFiles.mjs:269`、`:282`: Promise 鏈內派發;`getFiles` 監聽器之同步拋錯被轉為 `error` 事件(語意待裁示).
  4. `domDrag.mjs:117`、`:121` 之 microtask 路徑(`scheduleTeardown`、`checkSourceLater`): 監聽器拋錯成 unhandled rejection,`scheduleTeardown` 之 `kpDgs.delete` 被跳過.
  5. 規則 2 之「無呼叫端之堆疊」是否明文涵蓋 Promise 鏈與 microtask(建議涵蓋).
