# 規則帳本(fs 系 Core 之注入相依、levelLimit 之 null、路徑型 opt 鍵、入口檢測)

本檔收排程第 492 項第 2 批(ws492c,2026-11-17,主控任務 20261116102625;盤點報告 W-02、W-10、W-11、W-12、W-18 與〈不符清單〉N-A 之 fs 函數)之處置規則.索引見 `sgud/rule/rulebook.md`〈索引〉.依據: 輸入規格 `C:\opensrcOper\dspec\輸入參數之檢測機制.md` K2、K3、K4、P4、V5、V17、V19、V20、C12、S4、R-FS-INVALID-PATH-01 與專案原則 1(預設拒絕)、14(自有套件不做舊版相容,破壞性變更由下游連帶修正).

## R-FS-DEPS-01 fs 系 Core 缺注入相依(opt.fs、opt.path、opt.crypto、opt.Readable、opt.pipeline)須依其家族通道 fail-closed,不得回成功、不得動檔案;對外函數之注入鍵給 undefined 取 Node 內建

- **原缺陷(2026-11-16 實測)**: `fsDeleteFileCore(<存在之檔>)`、`fsDeleteFolderCore(<存在之夾>)` 未傳 `opt.fs` 時回 `{ success: 'file does not exist: …' }` 而檔案仍在(`fsExistsCore` 吞掉 `statSync` 之 `TypeError` 當成不存在);`fsExistsCore`／`fsIsFileCore`／`fsIsFolderCore` 於 `fs` 缺漏時回 `false`(把依賴無效當成不存在);其餘 Core 於缺 `opt.fs` 時回 `{ error: "fpSrc[<路徑>] is not a file" }` 之類被誤歸因且回顯路徑之錯誤,或回 Node 原文 `TypeError`;`fsDownloadFileCore` 先 `fetch` 才發現 `fs` 缺漏.
- **規則**:
  1. **Core 不自行匯入 fs、path、crypto、stream**(可被打包至無此內建模組之環境),相依一律由呼叫端注入;缺漏(未給、`null`、非物件、缺少必要方法;`undefined` 對 Core 即「未給」,Core 無內建可取)為相依無效,依該 Core 之家族通道回報,**不得回成功**:
     - `env`(同步結果物件): 回 `{ error: '<說明字串>' }`(字串,R-FS-RESULT-01 允許);
     - `envP`(`fsCopyFileCore`／`fsCopyFolderCore` 之 `useSync: false`): `Promise` resolve `{ error }`,不 reject(既有契約);
     - `rej`(回傳 Promise): reject 說明字串;
     - `thr`(同步回陣列者): 同步拋 `Error`;
     - `bool`(判斷類 `fsExistsCore`、`fsIsFileCore`、`fsIsFolderCore`): **同步拋 `Error`,不回 `false`**(`false` 與「不存在」無從區分,且 `fsDeleteFileCore` 等以其結果決定是否「已不存在即成功」);路徑無效仍先回 `false`(R-FS-INVALID-PATH-01).
  2. **訊息**(不帶輸入值,V19、V20): `invalid opt.<名>: must be an object providing <方法清單>`;函數型相依 `invalid opt.pipeline: must be a function`;單一擁有者 `src/_chkFsDeps.mjs`(`chkFsDeps(deps, spec)`),回報第一個不合者(鍵依 spec 順序: fs → path → crypto／Readable → pipeline).
  3. **順序**: 路徑／引數無效(`invalid pah`、`invalid data`、`invalid c`、`invalid urlIn`…)先於相依無效;相依無效先於任何判斷、建立、刪除、`fetch`(V17).`fsDeleteFileSafeCore`、`fsDeleteFolderSafeCore` 維持其既有「`opt.fs` 先於路徑」之順序與 `opt.fs is invalid: …` 訊息;`fsDownloadFileVerifyCore`、`fsEnsureBinsCore` 維持既有 `E_ARG`(原即 fail-closed,未改).
  4. **必要方法之取捨**(兩類): ①**只讀類**(判斷、讀檔、列舉、雜湊)只列「判斷前置」(`statSync`、`lstatSync`)與其無條件使用之主操作方法(`readFileSync`、`readdirSync`),**串流建立方法**(`createReadStream`)缺少時於用到之處 reject(失敗無副作用、不會回成功;既有測試以局部替身只提供各案路徑所需之方法,如「`crypto.createHash` 拋錯」案不提供 `createReadStream`);②**寫入、刪除、複製、合併、同步類**(失敗前可能已有不可逆之副作用,或缺方法時回成功而未完成)列其於成功路徑上無條件使用之**全部**操作方法(含 `createReadStream`、`createWriteStream`、切片刪除之 `unlinkSync`、`rmSync`),須於第一個破壞性動作(截斷輸出檔、刪除項目、先 `fetch`)之前齊備.兩類皆**不預先檢查僅於特定分支才用之方法**(上層資料夾不存在時之 `mkdirSync`〔`fsCreateFolderCore`、`fsSyncFolderCore` 除外,其本身即建立〕、連結之 `readlinkSync`／`symlinkSync`、失敗清理之 `unlinkSync`).why: 首版對所有 Core 檢全集,使既有局部替身 28 案紅(`fsMergeFilesCore` 27、`fsGetFileBasicHashCore` 1),遂改為只讀類之取捨;外審(terra)證明寫入／合併／同步／清空類若不先檢查,會「合併截斷既有輸出後才發現缺 `createReadStream`」「缺 `unlinkSync` 合併成功而切片仍在」「清空／同步先刪部分項目才失敗」,故第②類改回全集(既有替身之該類案例補齊方法,見 `test/fsMergeFiles.test.mjs` `mkFs`).
  4b. 非函數成員: `path.sep`(`fsSyncFolderCore` 以之切分相對路徑並決定刪除目標)須為非空字串(spec 以 `'sep:string'` 表之),否則 `invalid opt.path: must be an object providing resolve, dirname, join, basename, sep`(`sep: ''` 會使解析結果離開目標資料夾).
  5. **對外函數(有 Node 內建可取者)**: `opt` 之注入鍵為 `undefined` 視為未給取 Node 內建(`{ fs, ...opt }` 之展開會以 `undefined` 蓋掉預設,V5);`null`、非物件、缺少方法者仍由 Core 回報(`fsDeleteFileSafe`／`fsDeleteFolderSafe` reject `opt.fs is invalid: …`;`fsDownloadFileVerify` reject `E_ARG`).站點: `fsDeleteFileSafe`、`fsDeleteFolderSafe`、`fsDownloadFileVerify`(`fs`、`crypto`、`Readable`、`pipeline` 四鍵).**2026-11-17(ws492d,排程第 492 項第 3 批,主控裁定併入)另加 12 個對外函數,單一擁有者 `src/_mergeInject.mjs`(`mergeInject(defaults, opt)`: 展開後把值為 `undefined` 之注入鍵還原為內建;展開本身須置於 try 內)**: `fsEnsureBins`(`fs`、`path`、`crypto`、`Readable`、`pipeline`、`spawn`、`env`)、`fsCreateFile`(`fs`)、`fsCopyFile`、`fsCopyFolder`(`path`、`fs`)、`fsMergeFiles`(`fs`)、`fsGetFileHash`、`fsGetFileBasicHash`(`fs`、`crypto`)、`fsGetFileXxHash`(`fs`)、`fsGetFolderBasicHash`、`fsGetFilesWithHashInFolder`、`fsTreeFolderWithHash`、`fsSyncFolder`(`path`、`fs`、`crypto`);`null`、非物件、缺方法者仍由 Core 之相依檢查(R-FS-DEPS-01 規則 1)fail-closed.盤點指令: `Grep "\.\.\.opt" src/fs*.mjs` 預期只剩 `fsWriteTextAtomic`(固定使用內建 fs,`{ ...opt, fs }`)與三個既有手寫還原者(`fsDeleteFileSafe`、`fsDeleteFolderSafe`、`fsDownloadFileVerify`);測試: `test/fsSecurityOpts.test.mjs`〈對外函數之注入鍵給undefined取Node內建〉.
  6. `execCliCore` 自行匯入 `fs`、`path`,無注入鍵;其 `buildSpawnEnv(envExtra)` 之 `envExtra` 非一般物件(`null`、字串、數字、陣列、函數等)視為未給(K3),不拋錯、不把字串展開為環境變數鍵(原 `buildSpawnEnv('abc')` 得 `'0'`、`'1'`、`'2'` 鍵).
- **站點全集(31 個 `fs*Core`,盤點指令 `Grep "chkFsDeps\(" src/`: 預期 27 檔 + 單一擁有者 `_chkFsDeps.mjs`;`fsGetFileHashCore` 之 `crypto` 經 `fsGetFileBasicHashCore` 檢查(同訊息);4 個沿用既有檢查者另列)**:

| Core | 通道 | 必要之 fs 方法 | 其他相依 |
|---|---|---|---|
| `fsExistsCore` | bool(拋) | `statSync` | — |
| `fsIsFileCore`、`fsIsFolderCore` | bool(拋) | `statSync`、`lstatSync` | — |
| `fsCreateFolderCore` | env | `statSync`、`lstatSync`、`mkdirSync` | — |
| `fsCreateFileCore`、`fsWriteTextCore` | env | `statSync`、`lstatSync`、`writeFileSync` | — |
| `fsDeleteFileCore` | env | `statSync`、`lstatSync`、`unlinkSync` | — |
| `fsDeleteFolderCore` | env | `statSync`、`lstatSync`、`rmSync` | — |
| `fsRenameFileCore`、`fsRenameFolderCore` | env | `statSync`、`lstatSync`、`renameSync` | — |
| `fsReadTextCore` | env | `readFileSync` | — |
| `fsWriteTextAtomicCore` | env | `mkdirSync`、`writeFileSync`、`renameSync`、`unlinkSync` | — |
| `fsCleanFolderCore` | env | `statSync`、`lstatSync`、`readdirSync`、`rmSync`、`unlinkSync` | `path.join` |
| `fsCopyFileCore` | env／envP | `statSync`、`lstatSync`;同步另 `copyFileSync`,非同步另 `createReadStream`、`createWriteStream` | `path.dirname` |
| `fsCopyFolderCore` | env／envP | `statSync`、`lstatSync`、`readdirSync`;同步另 `copyFileSync`,非同步另 `createReadStream`、`createWriteStream` | `path.dirname`、`resolve`(同步)／`join`(非同步) |
| `fsTreeFolderCore`、`fsGetFilesInFolderCore`、`fsGetFoldersInFolderCore` | thr | `statSync`、`lstatSync`、`readdirSync` | `path.resolve`、`basename` |
| `fsGetFileBasicHashCore` | rej | `statSync`、`lstatSync` | `crypto.createHash` |
| `fsGetFileHashCore` | rej | `statSync`、`lstatSync` | `crypto.createHash`(`type` 為 `xxhash64` 時不需) |
| `fsGetFileXxHashCore` | rej | `statSync`、`lstatSync` | — |
| `fsGetFilesWithHashInFolderCore` | rej | `statSync`、`lstatSync`、`readdirSync` | `path.resolve`、`basename`;`crypto.createHash`(`type` 為 `xxhash64` 時不需) |
| `fsGetFolderBasicHashCore`、`fsTreeFolderWithHashCore` | rej | `statSync`、`lstatSync`、`readdirSync` | `path.resolve`、`basename`;`crypto.createHash` |
| `fsMergeFilesCore` | rej | `statSync`、`lstatSync`、`createReadStream`、`createWriteStream`、`unlinkSync` | — |
| `fsSyncFolderCore` | rej | `statSync`、`lstatSync`、`mkdirSync`、`readdirSync`、`createReadStream`、`createWriteStream`、`unlinkSync`、`rmSync` | `path.resolve`、`dirname`、`join`、`basename`、非空字串 `sep`;`crypto.createHash` |
| `fsDownloadFileCore` | rej | `statSync`、`lstatSync`、`createWriteStream`、`renameSync` | `Readable.fromWeb`、`pipeline`(函數) |
| `fsDeleteFileSafeCore`、`fsDeleteFolderSafeCore`(既有,未改) | rej | `statSync`(其餘缺少時 `TypeError` 轉字串) | — |
| `fsDownloadFileVerifyCore`、`fsEnsureBinsCore`(既有,未改) | rej(`E_ARG`) | 依其 `fnsFs` | `crypto`、`Readable`、`pipeline` 等 |

  完整性: 新增 `src/fs*Core.mjs` 時須列入上表與 `test/fsDepsFailClosed.test.mjs` 之 `cores` 表(該測試以 `Grep` 式清單對照 31 站).
- **測試**: `test/fsDepsFailClosed.test.mjs`(各 Core × 缺注入之 5 種給法〔未給 opt、`{}`、`{ fs: null }`、`{ fs: {} }`、`{ fs: undefined }`〕斷言通道、無 `success`、訊息起頭 `invalid opt.fs: must be an object providing `、不回顯路徑、夾具無任何增刪;缺 `path`／`crypto`／`Readable`／`pipeline` 20 案;`fsDeleteFileCore`／`fsDeleteFolderCore` 假成功對照;`buildSpawnEnv`;判斷類 W-18;對外函數之 `undefined` 取預設;相依齊全之正對照).
- **已知限制**: ①必要方法之取捨見規則 4,缺少「僅特定分支才用」之方法或只讀類之串流方法者於用到時依原通道回報(訊息為 Node 之 `TypeError`,不帶輸入值);②(**已於 2026-11-17 ws492d 處置**,見規則 5)對外函數之展開 `{ fs, …, ...opt }`(`opt.fs: undefined` 蓋掉預設內建)同形者共 12 個,ws492c 依任務範圍(W-10 列表)只改 `fsDeleteFileSafe`、`fsDeleteFolderSafe`、`fsDownloadFileVerify`,ws492d 改其餘 12 個;ws492c 當時之記載: 其餘 `fsEnsureBins`、`fsCreateFile`、`fsCopyFile`、`fsCopyFolder`、`fsMergeFiles`、`fsGetFileHash`、`fsGetFileBasicHash`、`fsGetFileXxHash`、`fsGetFolderBasicHash`、`fsGetFilesWithHashInFolder`、`fsTreeFolderWithHash`、`fsSyncFolder` 缺漏時其 Core 皆 fail-closed(不回成功),僅「給 `undefined` 不取內建」,待裁示是否一併改;③`fsExistsCore` 以 `try/catch` 吞掉 `statSync` 之全部錯誤(含 `EACCES`)而回 `false`(同 Node 之 `fs.existsSync`),`fsDeleteFileCore` 因而對「stat 被拒」之檔回「不存在」成功——非「相依缺漏」,屬既有判斷語意,未改,列待裁示(外審 B6);④`fsDeleteFileSafeCore`／`fsDeleteFolderSafeCore` 於標的不存在時只檢 `statSync`(JSDoc 既載「缺少其他函數時其呼叫之 `TypeError` 以字串 reject」),缺 `lstatSync`／刪除方法而標的不存在者 resolve「不存在」,維持既有契約(外審 B9).

## R-LEVEL-LIMIT-01 列舉層數 `levelLimit` 之 `null` 依 K3 取預設 1,無窮遍歷由呼叫端給大有限值

- **規則**: fs 列舉家族 `levelLimit`(位置參數,視同 opt 鍵)之 `null` 與 `undefined`、`0`、負數、小數、`Infinity`、`'0x10'`、包裝物件同為非預期,取預設 `1`(K3、V5;`optVal` 已涵蓋 `null`);**`null` 不再表示無窮遍歷**,需遍歷全部層級者給大有限值(`iseint` 之 `use: 'count'` 上限 `4294967295`).`fsTask` 之 `opt.levelLimit` 原即 `null` → 預設 1,轉交 `fsGetFilesWithHashInFolder` 者為解析後之數字,現與列舉家族一致.
- **站點全集(10 個函數 + `fsTask`)**: `fsTreeFolder`、`fsTreeFolderCore`、`fsTreeFolderWithHash`、`fsTreeFolderWithHashCore`、`fsGetFilesInFolder`、`fsGetFilesInFolderCore`、`fsGetFoldersInFolder`、`fsGetFoldersInFolderCore`、`fsGetFilesWithHashInFolder`、`fsGetFilesWithHashInFolderCore`(單一擁有者 `fsTreeFolderCore` 之 `optVal`);`fsTask`(`RULE_LEVEL_LIMIT`).
- **內部需全部層級者改給 `4294967295`(行為不變)**: `fsGetFolderBasicHashCore`(`fsTreeFolderCore(fd, 4294967295, …)`)、`fsSyncFolderCore`(`levelLimit`).
- **盤點指令**: `Grep "levelLimit === null|, null," src/fs*.mjs` 預期 0 命中(內部呼叫端無以 `null` 表無窮者).
- **下游**(自有套件 `src`,2026-11-17): w-zip `src/mZip.mjs:236` `fsTreeFolder(fpSrc, null)`、w-ftp `src/ftpTreeFilesInLocalAndRemote.mjs:71` `fsTreeFolder(fdLocal, levelLimit)`(`levelLimit` 於非正整數時為 `null` 表無窮)原依 `null` 無窮遍歷,**行為會變**(只列第 1 層),須依專案原則 14 自行改給 `4294967295`.
- **測試**: `test/fsLevelLimitOptPath.test.mjs`(10 函數 × [`null`／未給同 `1`、異於 `4294967295`;`0`、負、小數、`Infinity`、`'0x10'`、包裝物件、`NaN` 等同 `1`];`fsGetFolderBasicHash` 深層檔變動雜湊必變;`fsSyncFolder` 深層同步;`fsTask` 以觀察回調核對首輪掃描檔數).

## R-FS-OPT-PATH-01 路徑型 opt 鍵(`fsSrlog.opt.fdLog`、`fsTask.opt.fdStorage`、`fsEvem.opt.fd`)非字串、空字串、含 NUL 視為非預期而改用預設

- **規則**: 判定為 `typeof v === 'string' && isestr(v) && chkFsPath(v, …) === null`(`typeof` 先排除非原始字串,免得 `isestr` 讀取物件之 `Symbol.toStringTag` getter 拋錯;`isestr` 只檢長度非 0,**純空白字串維持有效、照用**〔與 R-FS-INVALID-PATH-01 一致,本批不改;初稿誤記為「純空白視為未給」,外審更正〕;`chkFsPath` 補 NUL 與包裝 String),否則改用預設(`./syslog`、`./_tkfs`、`./_evps`),不報錯、不拋錯(K3).原含 NUL 者: `fsSrlog` 之建立資料夾回 `{ error }` 被忽略而每次寫 log 靜默失敗、`fsTask` 之紀錄寫不出而每輪重複派發、`fsEvem` 同步拋錯(R-FS-INVALID-PATH-01 已知限制⑤之取捨改為取預設).
- **`fsTask` 靜默重複派發(盤點 W-12 所列,實測屬實)**: `fdStorage` 為「有效字串但無法當資料夾」(如該路徑已是檔案、無寫入權限)時,`fsCreateFolder` 回 `{ error }` 被忽略,紀錄檔讀寫皆靜默失敗,**每輪掃描都視為新增而重複派發同一檔**(實測 6 輪派發 6 次).修法: 建構時 `fsCreateFolder(fdStorage)` 後判定可用性——該路徑經 `statSync`(跟隨連結)須為資料夾(指向資料夾之符號連結、junction 雖使 `fsCreateFolder` 回 `{ error }`,仍可正常讀寫,**不拒**;外審發現首版以 `fsCreateFolder` 之 `{ error }` 判定而誤拒連結),且紀錄檔位置 `fpHash.json`、`fpResult.json` 若已存在須為一般檔案(已是資料夾者永遠寫不進)——不可用即同步拋 `Error('fsTask: opt.fdStorage can not be created or used as a folder')`(C20 建構子與工廠,不帶路徑,先於啟動計時器).已知限制: 建構後執行期之寫入失敗(磁碟滿、權限被改)仍靜默(`writeObHash` 吞錯),屬另案.
- **測試**: `test/fsLevelLimitOptPath.test.mjs`〈路徑型 opt 鍵〉(子行程 `test/tools/fsOptPathRunner.mjs` 於夾具資料夾內對 12 種非預期值各建子資料夾執行,斷言預設資料夾已建立、無雜散資料夾、不拋錯)、〈fsTask 紀錄資料夾無法使用〉.

## R-FS-ENTRY-CHECK-01 N-A 之 fs 函數: 入口檢測先於副作用,訊息依 V19、V20

- **規則**: 下列檢測置於任何建立資料夾、寫檔、`fetch` 之前,無效依該函數既有通道回報,訊息不帶輸入值:
  1. `fsCreateFileCore(pah, data, opt)`(及 `fsCreateFile`): `data` 須為字串、`Buffer`、TypedArray 或 `DataView`;`null` 與 `undefined` 視為未給取 `''`(K3、V5);其餘(數字、布林、物件、陣列、函數、包裝 String、`ArrayBuffer`、`BigInt`)回 `{ error: 'invalid data: must be a string, Buffer, TypedArray or DataView' }`,**不建立上層資料夾**(原先建立後才於 `writeFileSync` 失敗並回顯 Node 原文).
  2. `fsWriteTextCore(fp, c, opt)`(及 `fsWriteText`): `c` 須為字串(空字串有效),否則 `{ error: 'invalid c: must be a string' }`,不建立上層資料夾(同族 `fsWriteTextAtomicCore` 原已如此);`Buffer`／TypedArray 不再被接受(S2).
  3. `fsDownloadFileCore(urlIn, fpOut, opt)`(及 `fsDownloadFile`): `urlIn` 須為非空字串(`'invalid urlIn: must be a non-empty string'`)、可解析之 `http:`／`https:` 網址(`'invalid urlIn: must be a valid http or https url'`)、不帶帳密(`'invalid urlIn: must not contain credentials'`,與 `fsDownloadFileVerifyCore` 同為 S4 之單一規則,因全域 `fetch` 不安全處理帳密);`fpOut` 依 R-FS-INVALID-PATH-01(`'invalid fpOut: must be a non-empty string'`／`'… must not contain a NUL character'`,包裝 String 無效);皆 reject 字串且先於 `fetch`、建立資料夾與寫檔(原訊息 `urlIn in not an effective string`、`fpOut is not an effective string` 為錯字且不合 V19).下載失敗之 reject 訊息(`failed to download url[…] to file[…]`)回顯網址與路徑屬第 3 批(N-C),本批不動.
  4. `fsEnsureBins(Core)`: `manifest` 為字串路徑時,空字串、含 NUL 於入口 `E_ARG`(`'fsEnsureBins: invalid manifest: must be a non-empty string'`／`'… must not contain a NUL character'`),與「清單檔不存在或無法讀取」(`E_MANIFEST`)分開;此檢查置於 `buildCtx` 之前(必須參數先於讀取 opt 與呼叫注入之 `path.resolve` 等,V17);`opt.pkgRoot` 含 NUL 於 `buildCtx` `E_ARG`(`'fsEnsureBins: invalid opt.pkgRoot: must not contain a NUL character'`),空字串與非字串之訊息由 `opt.pkgRoot must be the root folder of the package (a non-empty string)` 改為 V19 `'fsEnsureBins: invalid opt.pkgRoot: must be a non-empty string'`(碼仍為 `E_ARG`).
  7. 必須參數之檢查先於讀取 `opt` 與呼叫注入之方法(外審 B11): `fsDownloadFileCore`(`urlIn`、`fpOut` 先於讀 `opt.fs` 等)、`fsGetBinManifestEntry`(`fp` 先於讀 `opt.name` 等),`opt` 之 getter 拋錯不得蓋過 `invalid urlIn: …`、`invalid fp: …`.
  8. `fsCopyFolderCore` 同步複製: 子資料夾之遞迴複製失敗(`{ error }`)須向上傳遞(原丟棄,深層檔案複製失敗或缺 `copyFileSync` 仍回成功,外審 B4);非同步版原即以 `await` 傳遞.
  5. `fsGetBinManifestEntry(fp, opt)`: `fp` 依 R-FS-INVALID-PATH-01 分訊息(`'invalid fp: must be a non-empty string'`／`'invalid fp: must not contain a NUL character'`),reject 純字串(無 `Error: ` 前綴),包裝 String 無效;「不是檔案」之訊息回顯路徑屬第 3 批.
  6. 判斷類 `fsExists`／`fsIsFile`／`fsIsFolder` 及其 Core(W-18): 路徑經 `chkFsPath`,非字串(`Buffer`、`Uint8Array`、`URL`、包裝 String)一律 `false`(原 `statSync` 接受而回 `true`),先於相依檢查.
- **測試**: `test/fsDepsFailClosed.test.mjs`〈D〉各 describe(`fsCreateFileCore data`、`fsWriteText`、`fsDownloadFileCore`、`fsEnsureBins`、`fsGetBinManifestEntry`)與〈B〉.
