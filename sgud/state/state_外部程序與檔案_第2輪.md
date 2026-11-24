# 狀態: 外部程序與檔案(第 2 輪起)

本檔為 `sgud/state/state.md` 索引之類型檔(2026-11-24 新增;`state_外部程序與檔案.md` 約 25.8KB,新節另起本檔).只記現況,過程見 `sgud/exp/experience.md` 與各輪報告.

## `fsEnsureBins` 跨程序只取得一次(排程第 632 項;twsm2,2026-11-24;package.json version 未改之工作樹,未提交未發布)

- 現況: 已實作.同一快取資料夾內同一取得單位(單一檔 `<sha256>/<name>`、檔案組之組識別)於快取未命中時持 `<快取>/.lock-<鍵>` 資料夾鎖(內含 `owner.json`),他程序等候、釋放後重新檢查快取命中即用;可接手 dead/expired/invalid;等候上限依 `opt.totalMs` 推得,逾時 `E_LOCK_TIMEOUT`;離線且無鏡像只等候;事件 onProgress `'wait'`、onTrace `'lock-wait'`、`'lock-takeover'`.規則: `sgud/rule/rulebook_bin.md` R-BIN-ENSURE-01 規則 19(含已知限制㉕～㉚);破壞性變更: `rulebook_breaking_77on.md` 第 80 項①.
- 程式: `src/fsEnsureBinsCore.mjs`(`lockKey`、`lockBudget`、`pidAlive`、`readLock`、`staleOf`、`tryLock`、`takeover`、`lockTimeoutErr`、`lockUnit`、`lockRecheck`、`unlockUnit`;`runEntry`/`runBundle` 改為「快取→鎖→重新檢查→`getEntry`/`getBundle`→finally 釋放」;`tarRun` 之分批抽為 `toBatches` 與預算共用;`buildCtx` 增 `host`),JSDoc 於 `src/fsEnsureBins.mjs` 與 Core 之併發、錯誤、onProgress、onTrace、opt.totalMs.
- 測試: `test/fsEnsureBinsLock.test.mjs` 21 案(多程序 7 案以 `test/tools/ensureBinsLockChild.mjs`;含自派複審 D1～D4 之 4 案);`test/fsEnsureBins.test.mjs` 之不共用案改斷言規則 19 ⑨;修前紅(HEAD 之 src 跑初版 17 案之測試檔)0 passing／17 failing,D1～D4 四案以「修前寫法」變異驗紅(見報告〈變異〉).
- 自派複審(sonnet,唯讀): 未發現兩程序同時接手;D1～D4 已修,D5～D7 列規則 19 已知限制㉛～㉝.
- 已知缺口與待辦: 使用端之測試(並行 worker 各自取同一檔案組者)另由主控派輪改為集中取得、時限對齊下載預算;PID 重用時只能依 expired 接手(已知限制㉕,是否加心跳列報告需裁示);制式規格(外部執行檔之存放下載校驗與離線)尚無鎖之條文(列報告〈規格回饋〉).
- 最近一次驗證: twsm2 報告(`C:\opensrcOper\dnow\20261124223109\agent-out\twsm2-修正報告.md`)之受影響測試、變異、全套兩配置.
