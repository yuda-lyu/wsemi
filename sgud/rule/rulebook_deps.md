# 規則帳本(外部依賴跨主版號升級)

索引見 `sgud/rule/rulebook.md`〈索引〉.

## R-DEP-MAJOR-01 外部依賴跨主版號升級: 使用處全集、新舊差分、關閉後不沿用、建置打包驗證

- **依據**: 主控 2026-11-09 外部依賴跨主版號升級(使用者原則:「有新版且沒問題就升,破壞性更新得連動更新」;主控任務 20261109223142 ws01):chokidar 5.0.0 → 6.0.0、he 1.2.0 → 2.0.0.`package.json` 宣告 `^6.0.0`、`^2.0.0`.未新增 `engines`(原未宣告);Node 需求寫於 README〈Installation〉.
- **使用處全集**(盤點指令: `Grep "from 'chokidar'|from 'he'" src`;`fsEvem` 不直接 import,經 `fsWatchFolder`):

  | 套件 | 站點 | 處置 |
  |---|---|---|
  | chokidar | `src/fsWatchFile.mjs`(`chokidar.watch`)、`src/fsWatchFolder.mjs`(`chokidar.watch`) | 選項 `interval`／`binaryInterval` 改 `pollingInterval`／`pollingBinaryInterval`(chokidar 6 起之名,舊名仍有別名);`close()` 後不沿用(見規則 2);其餘選項(`usePolling`、`awaitWriteFinish`)不變 |
  | he | `src/htmlEncode.mjs`、`src/htmlDecode.mjs` | `import he from 'he'` 改具名匯入 `import { encode } from 'he'`／`import { decode } from 'he'`(he 2 為純 ESM,`exports` 僅 `./src/he.mjs`,無預設匯出) |

- **規則**:
  1. **選項用新名**: 傳給 `chokidar.watch` 者一律 `pollingInterval`／`pollingBinaryInterval`;測試以假 `chokidar.watch` 觀察之欄位亦同(`test/optValG2fsWatch.test.mjs`、`test/tools/optValG5Kit.mjs`).
  2. **chokidar 6 之 `close()` 為終結態**(`FSWatcher.close()` 後 `closed` 為 true、`add()` 丟 `Cannot add paths after FSWatcher.close() has been called`、`index.js:293`): wsemi 兩個函數皆**每次以 `chokidar.watch` 新建 watcher**,`unWatch` 以 `close()` 關閉後將 `watcher` 置 `null`,再現時下一次輪詢新建,**從未對已關閉者呼叫 `add`**(`fsWatchFolder` 於被監看資料夾消失→再現時新建;`fsWatchFile` 於 `clear` 後不再新建).此為不變式,新增使用 chokidar 之處須遵守.
  3. **he 2 之匯入為具名**: 新增使用 he 之處一律 `import { encode, decode, escape, unescape } from 'he'`,不用預設匯入.
  4. **UMD 打包**: he **打包進** `dist/wsemi.umd.js`(`toolg/gDistRollup.mjs` 之 `globals`／`external` 內 `'he'` 為註解掉,前端 `bodyLog` 須用 `htmlEncode`);chokidar 為 external(Node 專用).升版後須於暫存位置以既有建置指令產出並驗證(不改 `toolg/`、`script.txt`,不手改 `dist/`).
- **行為差分(實測)**:
  - **he**(2.0.0 對 1.2.0,以 mocha 內嵌之 1.2.0 CJS 與專案 2.0.0 經 wsemi 之 `htmlEncode`／`htmlDecode` 比對,腳本與結果隨報告): 編碼 5436 案(ASCII 全表 `\x01`–`ɏ`、CJK、日韓、astral、代理對殘片、9 組選項)**0 差異**;解碼 23084 案(HTML5 全部具名實體〔含無分號〕、數值參照 0x00–0x17F 與邊界、4 組選項)**非嚴格模式 0 差異**,只有 `strict: true` 之 3960 案(皆拋錯)錯誤訊息文字不同(`...was not terminated by a semicolon` → `...was not recognized`,針對無分號之已知實體名),拋錯與否一致.wsemi 之 `htmlDecode(str, opt)` 把 `opt` 原樣交給 he,使用端若比對 strict 之錯誤訊息文字須知.
  - **chokidar 6**:
    - Windows 原生監看(`usePolling: false`)下,被監看資料夾**本身**消失,chokidar 6 多半先回報(`unlinkDir`,onTrace 之 `src: 'watcher'`),chokidar 5 恆由 `fsWatchFolder` 之輪詢合成(`src: 'timer'`);實測各 20 次: chokidar 5 為 timer 20/watcher 0,chokidar 6 為 timer 1~6/watcher 14~19.對外仍**只派發一次** `unlinkDir`(R-WATCH-ROOT-ONCE-01 之 `rootGone` 同時涵蓋兩條路徑,沿用);僅 `onTrace` 之 `emit.src` 分佈與其前是否有 `tick` 改變.
    - Windows 原生監看對**拒絕存取之子資料夾**,chokidar 6 不再回報 `EPERM`(其 `backend.js:250` 將原生監看之 EPERM 視為資料夾已消失而靜默處理;只見 `addDir deny`、不列其內容),chokidar 5 會回報;輪詢模式(`usePolling: true`)仍回報 `EPERM`(realpath).故 `fsWatchFolder`/`fsWatchFile` 之 `error { fun: 'watcher' }` 轉發機制不變,但原生監看下 Windows 權限拒絕之子資料夾不再有 error 事件(下游若依賴此事件須知).
  - 事件語意(add/change/unlink/addDir/unlinkDir、rename 序列、`awaitWriteFinish` 穩定期、`ready`)以既有真 chokidar 案驗證無變(`test/fsWatchFile.test.mjs`、`test/fsWatchFolder.test.mjs`、`test/fsEvem.test.mjs`).
- **測試**:
  - he: `test/htmlEncode.test.mjs`(新增 6 案: CJK、日文＋標記、astral、已是實體之 `&` 再轉義、三種引號、選項透傳 `useNamedReferences`／`decimal`／`encodeEverything`／`allowUnsafeSymbols`)、`test/htmlDecode.test.mjs`(新增 9 案: 具名實體、ASCII 外具名實體、CJK 十六進位／十進位、astral、原字元保留、無分號舊式實體與未知實體、Windows-1252 表與 U+FFFD、選項透傳 `isAttributeValue`／`strict`、編碼再解碼往返).
  - chokidar: `test/fsWatchFolder.test.mjs`(假 chokidar 案增斷言: 新舊 watcher 為不同實例、舊者 `closed`＋`add` 丟錯且從未被 `add`、新者以新選項名建立;新增真 chokidar 案〈create a new real chokidar watcher after the previous one is closed〉經 `withSpyChokidar` 取真實例,驗證消失→關閉→再現→新建→新增檔案回報 `add`)、`test/fsWatchFile.test.mjs`(新增真 chokidar 案: `clear` 後 watcher 終結且不再新建);假 watcher `fakeWatcher` 擬 chokidar 6 終結態(`closed`、`add` 丟錯);新增 `test/tools/fsWatchKit.mjs` 之 `withSpyChokidar`.
  - 既有測試因 chokidar 6 差分之調整(只改錯誤之平台假設,不放寬時間門檻): `test/fsWatchFolder.test.mjs`〈synthesize a timer unlinkDir …〉不再斷言 `emit` 前必有 `tick`(僅 `src` 為 `timer` 時斷言);`test/evemSafe.test.mjs` 之 EPERM 案改 `polling: true`(原生監看不再回報,見上).
- **同類掃描**: `Grep "chokidar" src`、`Grep "from 'he'" src` 全集即上表兩套件四站點;`test/tools/optValG2fsexecKit.mjs`、`test/tools/fsWatchKit.mjs` 之假 `chokidar.watch` 取代仍有效(chokidar 6 預設匯出仍為 `{ watch, FSWatcher }` 物件,`index.js:750`).
- **變更紀錄**: 2026-11-09(ws01,主控任務 20261109223142)新增本規則.
