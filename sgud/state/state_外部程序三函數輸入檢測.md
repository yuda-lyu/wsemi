# 狀態(外部程序三函數之輸入檢測)

本檔記 `execProcess`、`execProcessKillPid`、`execJsCode` 輸入檢測之現況(自 `sgud/state/state.md` 之索引指入;只記現況,過程見 `sgud/exp/experience.md`).

## `execProcessKillPid` 於 Windows 不開視窗(排程第 681 項〔低〕;主控任務 20261127121903 wsr3,2026-11-27;package.json version 1.9.82 之工作樹,未提交未發布)

- **已改**(規則 `sgud/rule/rulebook_exec.md` R-EXEC-WINHIDE-01;破壞性變更第 86 項⑥): Windows 自行 `cp.spawn('taskkill', ['/pid', N, '/T', '/F'], { windowsHide: true })`(原經 `tree-kill` 之 `exec`,無 `windowsHide`,detached 背景行程呼叫時閃出終端機視窗,實測 2 次重現;修後 0 個);其餘平台仍 `tree-kill`.訊息格式、`onTrace` 事件序列不變;spawn 失敗(含 EMFILE)以同格式 reject.
- **盤點**: 本庫 `dependencies` 只有 `tree-kill` 使用 `child_process`;本庫自身 9 處呼叫皆帶 `windowsHide: true`(AST 掃描釘住).
- **測試**: `test/execProcessKillPid681.test.mjs`(7 案,攔截替身子行程;修前 5 failing／2 passing);既有 `execProcessKillPid.test.mjs` 全綠(真實殺子行程與孫行程之樹殺);變異 M19～M25 皆被殺.視窗實測(非自動化)之證據在報告.

## 第 492 項第 5 批:外部程序(ws492f;盤點報告〈不符清單〉`execProcess`、`execProcessKillPid`、`execJsCode` 三列與 W-05;主控任務 20261116102625,2026-11-18;package.json version 1.9.65 之工作樹,未提交未發布)〔本節於 2026-11-18 新增〕

- **現況(已實作)**:
  - `execProcess`: `prog` 為必須參數,三模式一致須為非空原始字串且不含 NUL(含 spawn 模式引號檢查),exec 模式不再把非字串轉成指令;`args` 容器為真陣列(`Array.isArray`)或原始字串,元素為字串(不含 NUL)或有限數字(轉十進位字串),檢測先於任何子程序之建立(含取系統字碼頁之 `chcp`);`opt.codeCmd` 不支援之編碼依 K3 取預設 `'utf8'`(`opt.debug` 警告一次);無法啟動子進程之 Node 原生錯誤改固定詞彙 `spawn[ENOENT]:\noperation failed (code ENOENT)`(`execSpawnError` 之 `opt.fixed`;`execCli` 系不傳);訊息不回顯 prog、args、env.**仍回顯**: `cwd is not an existing folder: <cwd>`(R-EXEC-FAIL-01 規則 7;使用端依賴).
  - `execProcessKillPid`: `pid` 須為 1~2147483647 之整數或其十進位數字字串(`iseint` int32 且 min 1,轉換後使用),`0`、負數、小數、`'0x10'`、`null`、`''`、`[]`、`true`、`NaN`、BigInt、包裝物件、環繞值等一律 reject `invalid pid: must be an integer from 1 to 2147483647`,先於任何殺程序;onTrace 對無效 pid 只發 `fail`.
  - `execJsCode`: `fpJsCode` 非空原始字串且不含 NUL(固定訊息 `Error`),路徑須為既存檔案(`invalid fpJsCode: must be an existing file`,與參數無效分開),default 非函數為固定訊息,載入之 Node 原生錯誤(`ERR_` 碼或帶 `syscall`)改固定詞彙加 code,目標檔自拋與目標函數拋出之錯誤原樣;`opt` 整份直通(JSDoc 已載).
- **規則**: `sgud/rule/rulebook_execarg.md` R-EXEC-ARG-01;`sgud/rule/rulebook_exec.md` R-EXEC-FAIL-01 規則 15;破壞性變更第 73 項(`rulebook_breaking_71on.md`).
- **測試**: `test/execProcess.test.mjs`(新增 15 案〈execProcess prog與args之輸入檢測(R-EXEC-ARG-01)〉＋既有 15 案改期望值)、`test/execProcessKillPid.test.mjs`(新增 5＋改 3)、`test/execJsCode.test.mjs`(新增 6＋改 3)、`test/_execSpawnError.test.mjs`(新增 6);子行程攔截替身執行器 `test/tools/execArgGuardRunner.mjs`(替身取代 `child_process` 之 `spawn`、`exec`、`execFile`、`spawnSync`、`execSync`、`execFileSync`、`fork` 與 `process.kill`,不呼叫真實函數).指令: `npx mocha --no-parallel test/execProcess.test.mjs test/execProcessKillPid.test.mjs test/execJsCode.test.mjs test/_execSpawnError.test.mjs --timeout 180000`.
- **驗證(2026-11-18)**: 四檔 141 案(修前 109)對修前 `src`(`git archive HEAD`,逐檔獨立 mocha 行程)**43 案紅**(`_execSpawnError` 3、`execJsCode` 6、`execProcessKillPid` 8、`execProcess` 26),修後 140 passing、1 pending;**HEAD 實測(替身阻擋)**: 39 種無效 pid 有 29 種會呼叫 tree-kill(含 `taskkill /pid 0`、`/pid -1`),95 格無效 prog 有 91 格會建立程序,args 無效 145 格有 89 格;spawn 模式引號 12 格於修前之 `spawn+auto` 首格先跑 `chcp`(其後快取);修後皆 0.變異 49 項、48 項擊殺、1 項存活為等價(P13 數字元素不轉字串);全套 `npm test` 32368 passing、8 pending、0 failing(基準 32336＋32);eslint 改動檔 0 error;獨立複審(sonnet 子代理,唯讀)8 條皆屬實、7 條已修(`Array.isArray`、JSDoc、載入錯誤限縮、快照／引號／替身之測試補強、POSIX 替身離開碼),1 條列已知(`optVal` 警告早於 prog 檢測、`debug` 讀取次數;另敵意 Proxy `length` 部分)。
- **已知缺口與待辦**: ①`execCli`、`execCliSession`、`execCliJsonRpc` 仍回原生訊息與 cwd 說明(待後批,須同步 w-data-mseed 之測試);②`execProcess.opt.timeout` 之非預期警告早於 prog／args 檢測(同修前),`opt.debug`／`funLog` 於 timeout 與 codeCmd 兩處各讀一次(未用 `optVal.defer`);③`args` 為敵意 Proxy(`length` 回極大值)時迴圈不設上限(只敵意輸入);④`execProcessKillPid` 之 tree-kill 失敗訊息(Windows 為 taskkill 之系統輸出)未固定詞彙;⑤待裁示: `opt.codeCmd` 不支援改 K3 預設、args 元素是否收數字、cwd 說明是否去值、pid 上限 int32、下游 w-data-mseed 之 2 條測試將紅(見報告).
