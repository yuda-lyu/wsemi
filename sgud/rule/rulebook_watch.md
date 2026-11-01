# 規則帳本(fsWatchFolder 之被監看資料夾本身消失)

索引見 `sgud/rule/rulebook.md`〈索引〉.計時器觀察回調之規則另見 `rulebook_trace.md`(R-TRACE-01).

## R-WATCH-ROOT-ONCE-01 `fsWatchFolder` 被監看之資料夾本身消失之 `unlinkDir`,一次消失只派發一次

- **依據**: 排程第 238 項(2026-11-02,ws265,主控任務 20261102014123):`test/fsWatchFolder.test.mjs`「should notify frozen events … (fake chokidar)」偶發多一筆 `'timer'` emit(主控記錄之失敗序列 `emit` 之 `src` 為 `['watcher','timer','timer']`,期望 `['watcher','timer']`);全套偶發 1 紅,已間歇擋發布閘門.
- **成因**: 週期輪詢(`timeInterval`)偵測到被監看資料夾消失即派發 `unlinkDir`(`src: 'timer'`),並以 `setTimeout(unWatch, 1)` 延後 `unWatch`(監聽觸發中不能直接 unwatch);`unWatch` 之 `watcher.close()` 為非同步,`watcher` 於其完成後才置 `null`.輪詢回呼內耗時超過 `timeInterval` 時(同步 `stat` 於資料夾剛被刪除時變慢、`onTrace` 或監聽器阻塞、行程被排程器擱置),`setInterval` 之下一次到期時刻以**回呼開始時**計(`start` 於回呼前取得),而 `setTimeout(…, 1)` 以**建立當下**計,故下一次輪詢之到期時刻早於延後之 `unWatch`,先於它執行;此時 `watcher` 仍非 `null`、資料夾仍不存在,於是重複派發.實測(Node 24):回呼內先阻塞 60ms 再建立 `setTimeout(…, 1)`,下一次 20ms 輪詢先於該 timeout(5/5);未阻塞時 timeout 先(5/5).chokidar 於部分平台亦回報該資料夾之 `unlinkDir`(`src: 'watcher'`),與輪詢先後到達亦同樣重複.
- **規則**:
  1. 以內部旗標 `rootGone` 記「該次消失已派發」: 輪詢偵測消失時 `!exists && !rootGone` 才派發並設為 true;chokidar 回報被監看資料夾本身之 `unlinkDir`(`path.resolve(fpSpe) === fp`)時,若 `rootGone` 已為 true 則略過(不派發、不通知 `onTrace`),否則設為 true 再派發.
  2. `rootGone` 於**建立新 watcher 時歸零**(資料夾再現、`closed` 後之下一次輪詢建立新 watcher),故「一次消失」只派發一次,不是整個生命週期只一次;再現後再消失須再通知.
  3. 只有被監看之資料夾**本身**之 `unlinkDir` 計入;其子資料夾之 `unlinkDir`(及同一子資料夾之重複事件)照常派發,不設旗標.
  4. 不改: 輪詢週期、`unWatch` 延後 1ms 之設計、`onTrace` 事件之種類與順序(`watch`、`ready`、`emit`、`unwatch`、`closed`、`clear`)、`ev.clear()` 之語意.
- **來源為競態,測試不斷言來源**: 被監看資料夾本身消失時,輪詢合成(`src: 'timer'`,Windows 下 chokidar 通常不偵測)與 chokidar 回報(`src: 'watcher'`)誰先到達為競態,兩者皆正確、只派發一次.原測試於 Windows 下斷言最後一筆之 `src` 恆為 `'timer'`,最終碼整檔連跑 100 次中第 43 次失敗於 `'watcher' !== 'timer'`(同一競態之另一結果;修前則表現為重複派發而於一一對應之斷言即紅).故兩處真 chokidar 案(第一案與〈synthesize a timer unlinkDir〉案)改斷言 `src` 為 `timer` 或 `watcher`,「僅一筆」仍由事件序與一一對應之斷言釘住;`timer` 之 `src` 由假 chokidar 之決定性案(〈should synthesize unlinkDir with src timer …〉)釘住,不因此失去對輪詢合成路徑之覆蓋.此為修正測試之錯誤平台假設,非放寬時間門檻(已列報告〈需裁示〉).
- **同類掃描**: `fsWatchFile` 無輪詢合成之事件(已有 watcher 時 `tick` 不查檔案),無此缺陷;`fsEvem` 內部以 `fsWatchFolder` 監看事件資料夾,隨之修正.
- **測試**: `test/fsWatchFolder.test.mjs` 末段 5 案(假 chokidar,事件閘門,不看時間;以 `test/tools/fsWatchKit.mjs` 之 `blockLoop` 於 `onTrace` 內同步阻塞事件迴圈超過 `timeInterval` 一次,為可重現之延遲注入,同負載試驗之事件迴圈阻塞,不是等待條件之手段): ①輪詢先偵測、②chokidar 先回報、③輪詢先而 chokidar 隨後(微任務)、④子資料夾 `unlinkDir` 不受影響且其後本身消失照常通知一次、⑤再現後再消失再通知.
- **變更紀錄**: 2026-11-02(ws265)新增本規則;破壞性變更第 50 項.
