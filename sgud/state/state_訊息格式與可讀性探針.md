# 狀態(訊息格式 V19／V20 與共用可讀性探針)

查: 輸入無效之失敗訊息一律 `invalid <名稱>: must …` 且不帶輸入值、移除帶值之 console、fs 系參數名 `pah` 更正、`domIsStable.timeDiff` 負數改用預設、JSDoc 對齊與全庫斷言、共用可讀性探針 `chkReadable` 之現況:驗證數字、已知缺口與待裁示、下游固定舊行為(排程第 492 項第 9 批、第 558 項).所含節:

- 第 492 項第 9 批:訊息格式與文件、第 558 項共用可讀性探針(ws492j,2026-11-19)〔本節於 2026-11-19 新增〕

## 第 492 項第 9 批:訊息格式與文件、第 558 項共用可讀性探針(ws492j,2026-11-19)

- **基準**: wsemi 1.9.69(HEAD `cd3ff5c61`,工作樹原乾淨);**未提交、未發布、未改 `script.txt`、未改其他套件、未改 dspec**.規則見 `rulebook_msg.md` R-MSG-V19-01、R-READABLE-01;破壞性變更第 77 項(`rulebook_breaking_77on.md`).
- **做到哪**:
  - V19／V20 訊息改字約 170 個對外函數(含獨立複審後補:`JSON.parse` 之 `SyntaxError` 固定訊息 4 個函數、`fsCleanFolderCore`／`interp1`／`filepathToTree`／`getCsvStrFromData`／`fsDelete*SafeCore`／`cache`／`fsEnsureBinsCore` 之描述與檢查對齊、`msgPah` 更名)(逐函數舊→新對照在破壞性變更第 77 項所指之交件報告);以實呼叫探針(`wsinv-probe`,349 個函數)重核:修前 43 個函數之輸入無效訊息不合 V19,修後只餘例外(`cvOrmFind`／`lowerFind` 之 `invalid find` 契約詞彙、C11 驗證器 `isUserPw`／`isUserName`／`isUserIdentify`、`interp1` 之狀態碼 `err:'out of x-range'`、`execCli`／`execCliJsonRpc` 對含 NUL 之 `command` 之 Node 原生訊息〔見待裁示 3〕);另對 125 個探針未涵蓋(DOM、計時器、行程、網路)之函數以讀碼核對.
  - 移除帶值之 console／訊息 20 餘處(見第 77 項②);`fsReadJson`／`fsSrlog`／`fsWatchFolder`／`fsWatchFile`／`fsDownloadFileVerify`／`fsEnsureBins` 之原生或使用端文字改固定詞彙.
  - fs 系 20 函數參數名 `pah`→`fp`／`fd`、`pahOld`／`pahNew`→`fpOld`／`fpNew`／`fdOld`／`fdNew`;`jsdocFixes` 由 20 函數擴為 src 全部對外函數之 `@param` 與簽名一致斷言(不定參數以 `arguments` 為名);`fsCreateFile(Core)` 之 `opt.mode`／`opt.flag` 自 JSDoc 移除;`oo` 之 JSDoc 補失敗行為與 `cloneDeep` 分工.
  - 唯一行為改變 `domIsStable` 之 `opt.timeDiff` 負數改用預設 100(下游 w-component-vue 只轉傳鍵名,0 站傳 0 或負數).
  - 新增 `chkReadable`(`src/chkReadable.mjs`,已入 `src/index.mjs`):`''` 可讀、固定原因字串不可讀、永不拋錯、不呼叫存取器與 `toJSON`;選項 `deep`／`fun`／`ownKeys`／`has`／`elements`／`maxElements`.
- **驗證數字**(2026-11-19): 全套 `npm test` 33479 passing／8 pending(既有之環境略過)／0 failing(約 2.4 分);修前紅(獨立複審修正前之首輪)——HEAD 之 `src` 搭配本批變更之 137 個測試檔(含新增 `msgV19`、`chkReadable`),13957 案中 1965 案紅(11992 綠);複審後補之案各以變異證其會紅;變異——共 66 項(`chkReadable` 29、訊息與行為 37;3 項以逾時擊殺;首輪存活或樣式不符之 6 項經補強測試或修正樣式後擊殺),全數擊殺;eslint 對本批新增與改動之檔,新增之 lint 錯誤 0(`test/filepathToTree.test.mjs` 之 3 個未用 import 與 `src/index.mjs` 缺結尾換行為既有);private-guard CLEAN.
- **獨立複審**: 自派 sonnet 唯讀複審 1 次(契約為 V19／V20 與探針契約,不給實作者之結論),提 24 條(高 0、中 6、低 18);屬實並已修者:深探經 `[[Get]]` 讀取、讀取總量上限 `maxReads`、描述子自有性檢查、`opt.has` 數字鍵、`JSON.parse` 之 `SyntaxError` 固定訊息(4 個函數)、`fsDelete*SafeCore` 訊息只列實際檢查者與 JSDoc、`fsCleanFolderCore` 與 `getCsvStrFromData` 與 `interp1` 之描述對齊、`fsEnsureBinsCore` 之 `opt.names` 缺 `must`、`cache` 之 `invalid key`、`getDataFromExcelFileU8Arr` 之 console、`msgPah`→`msgPath`、探針 JSDoc 補限制;未採:`filepathToTree` 之 `'/'` 路徑與空字串同訊息(主控 2026-11-14 裁定「比照空字串」,既有測試鎖定)、`fsEnsureBinsCore` 清單內容訊息(R-BIN-ENSURE-01 範本)、`o2j` 循環參照之原生訊息(C6)、`fsWatch*` 之 `console.log(err)`(與 HEAD 同,操作失敗);詳見交件報告〈獨立複審〉.
- **已知缺口與待裁示**:
  1. exec 家族之「輸入不可讀」訊息 `<錯誤碼>: <使用端 getter 所拋之文字>`(`execCli`／`execCliSession`／`execCliJsonRpc`／`execCliJsonFile`,R-EXEC-FAIL-01 規則 13)與 `execCliJsonRpc` 之 params 無法序列化訊息(含 method 名,規則 14)維持,待裁示是否與 `execProcess` 一致改固定詞彙.
  2. `execCliCore.buildSpawnArgs` 對非字串 `command` 於 Windows 拋 Node 原生 `TypeError`(訊息帶 `Received type number (5)` 之值),POSIX 不驗;改為固定訊息須動跨平台行為,待裁示.
  3. `execCli`／`execCliSession`／`execCliJsonRpc` 對含 NUL 之 `command` 未於入口擋下(進 spawn 後得 Node 原生 `ERR_INVALID_ARG_VALUE` 訊息;`execProcess` 已擋);於入口先擋會使 `attempts` 由 1 變 0,屬行為改變,待裁示.
  4. 轉交前綴(`str2sha512` 之 `str2sha: invalid str: …`、`b642obj('')` 之 `b642str: …`、`mat2ltdt` 表頭全略過之 `keysmat2ltdt: invalid keys: …`)視為合規形式;`blobs2*` 之元素無效訊息之名稱為內層 `invalid bb`(非 `bbs[i]`),如需改須動程式.
  5. `interp1` 之 x 重複檢查結果(`checkTrend` 之 `{ err }`)於 `interp1` 未被檢查而不外露(既有);結果物件欄位 `ps`／`psEff`／`data` 仍回傳輸入值.
  6. `getObjSize` 對無原型物件拋 `TypeError`(`obj.hasOwnProperty is not a function`)、循環參照拋 `RangeError`,JSDoc 範例輸出與回傳物件不符(W-04 表所列,非本批範圍).
  7. w-orm-level 原「`[0]` 元素 getter 拋錯以原錯誤失敗」之偵測與 w-orm-lowdb、w-orm-level 之「不可讀者原樣拋出原錯誤」,於改用 `chkReadable` 時不再成立(存取器不呼叫、原因為固定詞彙),各庫改用前須裁示(對照見交件報告).
- **下游固定舊行為(只列不改)**: 3 處——w-data-mseed `test/api-WDataMseed.test.mjs:350`、w-scan-dep `test/unit-exsbom.test.mjs:493`、w-data-syncer `test/sfcsv_rows.test.mjs:191`;w-package-tools 內附舊 wsemi 副本(`src/wsemip.umd.js` 等)重打包後才生效.
