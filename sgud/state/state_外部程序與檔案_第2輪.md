# 狀態: 外部程序與檔案(第 2 輪起)

本檔為 `sgud/state/state.md` 索引之類型檔(2026-11-24 新增;`state_外部程序與檔案.md` 約 25.8KB,新節另起本檔).只記現況,過程見 `sgud/exp/experience.md` 與各輪報告.

## `fsEnsureBinsBudget` 之並行最壞選項 `opt.concurrent`、`fsDownloadFileVerify` 之 Node 內建 fetch 已知限制(排程第 634 項②④;t642,2026-11-25;1.9.77 之工作樹,未提交未發布)

- 現況(已實作): ④`fsEnsureBinsBudget(manifest, { concurrent: true })` 回傳並行(兩個程序競爭同一單位)之最壞 = 2×各單位預算之和＋取主幹清單之上限(主幹模式且非離線,不乘 2);預設不倍乘;非原始布林 `true` 之值視為未給;鎖之上限與 `fsEnsureBins` 不變.規則 `rulebook_bin.md` R-BIN-ENSURE-01 規則 22.②Node 24.22.1 內建 undici 於 `Connection: close`＋大本體＋背壓會未捕獲斷言崩潰(主控查證,純 fetch 可重現,不向上游回報)已載於 `fsDownloadFileVerify` 之 JSDoc、README 之 Known limitation 與 `rulebook_dl.md` 已知限制㉑(實作端以 64 MB 純 fetch 試一次未崩潰,確切條件以主控查證為準).
- 測試: `test/fsEnsureBinsBudget.test.mjs` 13 案(增 4 案＋範例案增第 4 值);修前(改前 `src` 之鏡像根)4 案紅.
- 已知缺口與待辦: dspec E5-3 由主控同步(本輪不改);下游採用(w-scan-dep、w-scan-vulnerability、w-dwload-dlp、w-md2docx 等之測試自乘 2 者改傳 `concurrent: true`)由主控連動,不在本輪;`opt.concurrent` 不計等候期間持有者連續更換(每換一個持有者重新起算等候上限)之情形.

## `fsEnsureBins` 離線試取清除之競態、無主暫存之清除、取得預算函數(排程第 639 項、第 634 項①③;twsm3,2026-11-25;1.9.75 之工作樹,未提交未發布)

- 現況: 已實作.①離線缺檔之清除只在離線且有鏡像時,本單位之夾持鎖時清、快取根於 reject 前只刪空夾,建夾後之兩步(建鎖、暫存夾、主幹清單副本、下載之暫存檔、移入快取)遇 ENOENT 重建再試——先離線試取再連網之寫法不再使並行之他程序 ENOENT 失敗、重複下載或 lock-skip;②持鎖時清除確定無主之 `.work-*`、`manifest-last.json.*.part` 與本檔之 `.part`(onTrace `lock-orphan`);③新函數 `fsEnsureBinsBudget`(與鎖之上限同一算式).規則: `rulebook_bin.md` R-BIN-ENSURE-01 規則 20、21(已知限制㉟～㊵);破壞性變更: `rulebook_breaking_77on.md` 第 81 項.
- 測試: `test/fsEnsureBinsLock.test.mjs`(新增 "schedule 639" 7 案、"schedule 634" 4 案;交錯以子行程之事件閘門構造)、`test/fsEnsureBinsBudget.test.mjs` 9 案;修前紅(HEAD 1.9.75): 新 11 案 0/11、預算檔模組不存在.
- 已知缺口與待辦: 使用端之測試(先離線試取者)可恢復原寫法或改用 `fsEnsureBinsBudget` 設時限(主控另派);同一 sha256 不同檔名之他單位於清除瞬間多一次請求;dspec 未載清除與無主暫存之條文(列報告需裁示).
- 最近一次驗證: twsm3 報告(主控任務 20261124223109 之 twsm3).

## `fsEnsureBins` 跨程序只取得一次(排程第 632 項;twsm2,2026-11-24;package.json version 未改之工作樹,未提交未發布)

- 現況: 已實作.同一快取資料夾內同一取得單位(單一檔 `<sha256>/<name>`、檔案組之組識別)於快取未命中時持 `<快取>/.lock-<鍵>` 資料夾鎖(內含 `owner.json`),他程序等候、釋放後重新檢查快取命中即用;可接手 dead/expired/invalid;等候上限依 `opt.totalMs` 推得,逾時 `E_LOCK_TIMEOUT`;離線且無鏡像只等候;事件 onProgress `'wait'`、onTrace `'lock-wait'`、`'lock-takeover'`.規則: `sgud/rule/rulebook_bin.md` R-BIN-ENSURE-01 規則 19(含已知限制㉕～㉚);破壞性變更: `rulebook_breaking_77on.md` 第 80 項①.
- 程式: `src/fsEnsureBinsCore.mjs`(`lockKey`、`lockBudget`、`pidAlive`、`readLock`、`staleOf`、`tryLock`、`takeover`、`lockTimeoutErr`、`lockUnit`、`lockRecheck`、`unlockUnit`;`runEntry`/`runBundle` 改為「快取→鎖→重新檢查→`getEntry`/`getBundle`→finally 釋放」;`tarRun` 之分批抽為 `toBatches` 與預算共用;`buildCtx` 增 `host`),JSDoc 於 `src/fsEnsureBins.mjs` 與 Core 之併發、錯誤、onProgress、onTrace、opt.totalMs.
- 測試: `test/fsEnsureBinsLock.test.mjs` 21 案(多程序 7 案以 `test/tools/ensureBinsLockChild.mjs`;含自派複審 D1～D4 之 4 案);`test/fsEnsureBins.test.mjs` 之不共用案改斷言規則 19 ⑨;修前紅(HEAD 之 src 跑初版 17 案之測試檔)0 passing／17 failing,D1～D4 四案以「修前寫法」變異驗紅(見報告〈變異〉).
- 自派複審(sonnet,唯讀): 未發現兩程序同時接手;D1～D4 已修,D5～D7 列規則 19 已知限制㉛～㉝.
- 已知缺口與待辦: 使用端之測試(並行 worker 各自取同一檔案組者)另由主控派輪改為集中取得、時限對齊下載預算;PID 重用時只能依 expired 接手(已知限制㉕,是否加心跳列報告需裁示);制式規格(外部執行檔之存放下載校驗與離線)尚無鎖之條文(列報告〈規格回饋〉).
- 最近一次驗證: twsm2 報告(主控任務 20261124223109 之 twsm2)之受影響測試、變異、全套兩配置.
