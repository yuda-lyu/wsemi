# 規則帳本(fs 路徑參數之無效處置)

本檔收 fs 系函數之路徑參數無效時之處置規則(2026-11-02,ws265,主控任務 20261102014123,排程第 265 項,來源第 216 項①).索引見 `sgud/rule/rulebook.md`〈索引〉.

## R-FS-INVALID-PATH-01 fs 系函數之路徑參數無效(非字串、空字串、含 NUL 字元)須依各函數之失敗通道回報,訊息不帶輸入值,與「不存在」分開,且不得動到任何檔案

- **依據**: 輸入規格 `C:\opensrcOper\dspec\輸入參數之檢測機制.md` §5.3 C12(`fs*`「無效路徑回 `{ error }`,不帶值;『無效』與『不存在』分開」,原列缺陷)、跨類別原則 P4(無效、不存在、空,三者分開)、V19 訊息格式;專案原則 14(自有套件不做舊版相容,破壞性變更由下游連帶修正).
- **原缺陷(2026-11-02 以子行程沙箱探測全部 `src/fs*.mjs`,484 筆,腳本 `tmp/ws265/probe-fs.mjs`,已隨結案清除)**:
  - `fsDeleteFile`、`fsDeleteFolder`、`fsDeleteFileSafe`、`fsDeleteFolderSafe`(及其 Core)對 null、undefined、`''`、數字、物件、含 NUL 字串等全部回**成功**(`{ success: 'file does not exist: null' }`、Promise resolve 同字串),且回顯輸入值.
  - `fsCopyFolder(src, '')` 回 `{ success: 'done: ' }` 並把 `src` 內容複製進**工作目錄**;`fsSyncFolder(src, '')` resolve `true` 並複製進工作目錄(`''` 被當成 cwd).
  - `fsReadText(0)` 回 `{ success: '' }`(數字 0 於 `fs.readFileSync` 為檔案描述子,讀到 stdin);`fsWriteText(0, …)`、`fsCreateFile(0, …)` 等寫入走到描述子 0 而 `EBADF`.
  - 其餘結果物件函數雖回 `{ error }`,但訊息為 Node 內部訊息(`The "path" argument must be of type string … Received null`、`Received 'a\x00b'`),**回顯輸入值**且無法與「不存在」之錯誤分辨.
  - 回傳 Promise 之函數(hash 系、列舉系、同步、合併)拒絕值為 `fd[null] is not a folder` 一類,把無效與不是資料夾混為一談且回顯值;`fsGetFileXxHash`、`fsBuildReadStreamText` 之 `fp is not a file` 不回顯但亦不分辨.
  - `fsWatchFolder`、`fsWatchFile`、`fsTask`、`fsTaskCp` 對無效路徑不報錯而回傳監看物件(永遠輪詢一個不存在之路徑);`fsTask` 仍建立 `./_tkfs`、`fsTaskCp` 以 `String(null)` 組出 `null/fpHash.json`.
  - `fsMergeFiles` 之 `fpsIn` 含無效項時,逐片處理到該項才發現,前面之切片已被合併並**刪除**.
- **規則**:
  1. **「無效」之定義(單一擁有者 `src/_chkFsPath.mjs`)**: 非字串(null、undefined、數字〔含 0〕、布林、物件、陣列、函數、symbol、`Buffer`、`URL`、`String` 包裝物件)、空字串、含 NUL(`\0`)字元之字串.**純空白字串、`.`、`..`、非 ASCII、超長字串不是無效**(POSIX 之合法檔名,屬「有效但可能不存在」,走原有之存在判定).
  2. **訊息(不帶輸入值,V19)**: `invalid <參數名>: must be a non-empty string`;含 NUL 者 `invalid <參數名>: must not contain a NUL character`;`fsMergeFiles` 之 `fpsIn` 元素帶索引 `invalid fpsIn[<i>]: …`.參數名為該函數之 JSDoc 參數名(`pah`、`fp`、`fd`、`fpSrc`、`fpTar`、`pahOld`、`pahNew`、`fdSrc`、`fdTar`、`fpOut`).
  3. **依失敗通道回報**(站點全集見下;單一出處 `test/tools/fsPathSites.mjs`):
     - `bool`(判斷類 `fsIsFile`、`fsIsFolder`、`fsExists` 及其 Core): 回 `false`,不拋錯(C2 判斷類回布林;「不是檔案」之判斷對無效路徑為真,不在本規則改動內,只以測試釘住).
     - `env`(同步結果物件): 回 `{ error: <說明字串> }`(字串,非 Error 物件;R-FS-RESULT-01 規則 1 允許).
     - `rej`(回傳 Promise): reject 該說明字串(R-FS-REJECT-01 規則 1);不同步拋出.`fsDeleteFileSafe`、`fsDeleteFolderSafe` 另發 `onTrace` 之 `fail`(`{ n: 0, code: null }`,同 `opt.fs` 無效之路徑).
     - `thr`(同步回陣列者與建構／監看類): 同步拋 `Error`(message 為該說明字串).`fsGetFilesInFolder`、`fsGetFoldersInFolder`、`fsTreeFolder`(R-FS-REJECT-01 規則 9 之同步拋出);`fsBuildReadStreamText`;`fsWatchFolder`、`fsWatchFile`、`fsTask`、`fsTaskCp`(輸入規格 C20 建構子與工廠:建構參數無效拋錯,不回傳一個永遠輪詢不存在路徑之物件).
     - `own`(既有專屬訊息,僅補 NUL): `fsDownloadFile(Core)` 之 `fpOut is not an effective string`、`fsDownloadFileVerify(Core)` 之 `fpOut is not an effective file path`(Error 物件,R-DL-VERIFY-01)、`fsGetBinManifestEntry` 之 `fp is not an effective string`(字串,`Error: …` 前綴),三者原已不回顯、且與網路失敗分開,訊息不改,含 NUL 之路徑改為同樣拒收(原走到連線並於訊息回顯).
  4. **無效於任何副作用之前回報**: 不建立資料夾或檔案、不刪除、不複製、不開 watcher、不建立 `_tkfs`.`fsMergeFiles` 於開檔與刪除任何切片之前檢查 `fpOut` 與 `fpsIn` 全部元素.
  5. **「無效」與「不存在」分開**: 有效但不存在之路徑之行為與訊息不變(`file does not exist: <路徑>` 成功、`fp[<路徑>] is not a file` 等);測試以對照路徑(`nope.txt`、`nopedir`)證其訊息不以 `invalid ` 起頭.
  6. **檢查置於各 Core 之入口(或其唯一之分派入口),公開函數委派 Core 即同步**: `fsCopyFileCore`、`fsCopyFolderCore` 於 `useSync` 分派前檢查(`useSync: false` 時以 Promise resolve 結果物件,不 reject,同其既有契約).
- **刻意不套(不屬路徑必要參數)**: `fsEvem` 之 `opt.fd`、`fsSrlog` 之 `opt.fdSys`／`opt.fdLog`、`fsTask` 之 `opt.fdStorage` 為有預設值之 opt 類選項,非預期之輸入改用預設(R-OPT-VAL-01);`fsEnsureBins(Core)` 之路徑為清單內相對路徑,另由 `E_MANIFEST` 檢核(R-BIN-ENSURE-01).
- **站點全集**: 73 站點(公開函數與 Core 各一)、84 站點×參數位置: `bool` 6、`env` 26、`rej` 25、`thr` 11、`own` 5;`fsWriteTextAtomic(Core)` 之 `fp` 原已回 `invalid fp: …`,本規則補 NUL.完整性由 `test/fsInvalidPath.test.mjs`〈site list〉釘住(新增 `src/fs*.mjs` 未列入站點表或排除名單即紅).
- **測試**: `test/fsInvalidPath.test.mjs`(子行程執行器 `test/tools/fsInvalidPathRunner.mjs` 於夾具資料夾內對 84 站點×參數位置各餵 11 種無效值〔null、undefined、`''`、0、123、true、`{}`、`[]`、函數、含 NUL 字串、symbol〕與 1 個有效但不存在之對照路徑,共 1004 次呼叫,逐一斷言回傳形態、訊息、夾具無任何增刪).
- **已知限制**: ①`Buffer`、`URL` 物件雖為 Node `fs` 所收,依輸入規格(路徑為字串)視為無效;②純空白路徑於 Windows 之行為隨系統(結尾空白被去除),歸「有效但可能不存在」,不另判;③`fsDownloadFileVerify` 之 `fpOut` 因先經 `unwrap`,`new String('x')` 解包後視為有效(其既載行為,R-DL-VERIFY-01);④`fsTaskCp` 先前遇無效路徑會靜默繼續,現同步拋出,呼叫端須自行確保路徑有值;⑤`fsEvem` 之 `opt.fd` 為含 NUL 字元之字串時,`fsEvem` 自身之 `isestr` 判為有效而交給 `fsWatchFolder`,後者現同步拋 `Error`(`fsEvem()` 因而拋出,不改用預設值:靜默換用預設資料夾會使兩個實例各監看不同夾而不自知;獨立審查者提出,極端輸入,依原則只於此註明).
- **變更紀錄**: 2026-11-02(ws265)新增本規則;破壞性變更第 49 項.
