# 狀態(訊息格式 V19／V20 與共用可讀性探針)

查: 輸入無效之失敗訊息一律 `invalid <名稱>: must …` 且不帶輸入值、移除帶值之 console、fs 系參數名 `pah` 更正、`domIsStable.timeDiff` 負數改用預設、JSDoc 對齊與全庫斷言、共用可讀性探針 `chkReadable` 之現況:驗證數字、已知缺口與待裁示、下游固定舊行為(排程第 492 項第 9 批、第 558 項).所含節:

- 第 492 項第 9 批:訊息格式與文件、第 558 項共用可讀性探針(ws492j,2026-11-19)〔本節於 2026-11-19 新增〕

## 第 492 項第 10 批(上):第 559 項 exec 家族輸入不可讀、command 含 NUL、`getObjSize`、V20 已知缺口、`chkReadable.ownKeys`(ws492k,2026-11-26;package.json version 1.9.78 之工作樹,未提交未發布)

- **基準**: wsemi 1.9.78(HEAD `cf3f5c74e`,工作樹原乾淨);**未提交、未發布、未改 `script.txt`、未改其他套件、未改 dspec**.規則見 `rulebook_exec.md` R-EXEC-FAIL-01 規則 13、14、16、`rulebook_msg.md` R-MSG-V19-01 規則 9、R-READABLE-01;破壞性變更第 82 項(`rulebook_breaking_77on.md`).
- **做到哪**(已實作):
  - exec 家族(`execCli`／`execCliSession`／`execCliJsonRpc`／`execCliJsonFile`)輸入不可讀之訊息為固定詞彙(`invalid opt: must be a readable object`、`invalid args: must be a readable array`、`invalid opt.env: must be a readable object`、JsonRpc 之 `invalid requests: …`／`invalid requests[i]: …`／`invalid requests[i].params: must be serializable to JSON`);args 與 `opt.env` 入口讀為字串快照(`src/_execSnap.mjs`);`command` 含 NUL 入口擋下(execCli attempts 0;JsonRpc errorType params);`execCliCore.buildSpawnArgs` 非字串／含 NUL 拋固定訊息 TypeError(各平台);`execCliJsonFile` 結果檔失敗訊息固定詞彙.
  - `getObjSize` 無原型物件、自有鍵 `hasOwnProperty` 不拋錯,JSDoc 範例更正.
  - V20 已知缺口: `fsEnsureBinsCore` 清單未知鍵名不回顯;Excel 寫檔器拒絕之 `{ error }` 為固定字串(`_writeXlsxSafe.mjs`);`o2j`／`obj2str`／`obj2stru8arr`／`obj2u8arr` 之 `msg` 固定詞彙;`fsReadJson` 新增 opt 診斷出口;診斷出口單一擁有者 `_diagIfAsked.mjs`;`fsWatchFolder`／`fsWatchFile` 現況已無直接 console(靜態防線 `noConsoleEcho559.test.mjs`).
  - `chkReadable.opt.ownKeys`: 讀 Symbol 鍵描述子;列舉有界(型別陣列／Buffer／DataView／String 包裝物件不列舉,描述子讀取受 `maxReads` 限制).
- **測試**: 新增 `execCliInputGuard`、`chkReadableBounded`、`noConsoleEcho559`(及判斷與轉型之 `convHostile`、`judgeNativeTag`)之 `.test.mjs`;更新既有 18 檔之期望(`execCli`／`execCliSession`／`execCliJsonRpc`／`execCliJsonFile`／`o2j`／`obj2str`／`obj2stru8arr`／`obj2u8arr`／`ab2u8arr`／`u8arr2obj`／`downloadExcelFileFromData`／`getExcelU8ArrFromWorkbook`／`getExcelU8ArrFromData`／`fsReadJson`／`getObjSize`／`fsEnsureBins`／`fsEnsureBinsBundle`／`isbigint` 與 runner `execFailRunner`).驗證: 全套 `npm test` **33922 passing／8 pending／0 failing**(約 2 分;另 `npm pack` 發布包解開之目錄同為 33922／8／0);修前紅(改前 `src` 搭配本批全部測試檔,23 檔)980 passing／158 failing;變異 47 項(含修正後補之 6 項)除 2 項等價外全擊殺;獨立複審 17 項發現,屬實者(F1、F2、F3、F4、F5 文件、F6、F7、F13、F16)已修.
- **已知缺口與待裁示**:
  1. 同形之 state 模式於內部例外原樣轉出 `errToStr(err)` 者(`stru8arr2obj`、`u8arr2obj`、`ab2u8arr`、`str2obj` 非 SyntaxError、`timeTZ2expire` 等 4 函數,約 9 站)與 36 個轉型／編碼函數對已撤銷 Proxy 之 opt 於 `get(opt, …)` 拋錯,見 R-MSG-V19-01 已知限制①;建議另批以 `_pickOpt`／`_diagIfAsked` 機械套用.
  2. `execCliJsonRpc` 之 rpc／exit／notfound 錯誤仍前置呼叫端之 `<method>: `(輸入值之回顯,契約已載且測試鎖定),待裁示是否去除.
  3. `validate` 自訂函數拋出之文字仍進結果之 `stderr`(既有設計,契約字面只管 `error` 欄).
  4. 下游固定舊行為: w-aggrid-vue `test/unit-hucre-limits.test.mjs`(2 處斷言寫檔器 Error 原文)、w-converhp `test/tools/probeDiff.mjs`、w-orm-mongodb `test/api-readable.test.mjs`(讀標籤次數,見判斷與轉型檔);連動由主控後處理.

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
