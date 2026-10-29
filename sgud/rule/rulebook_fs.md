# 規則帳本(檔案系統、下載與外部執行檔取得)

本檔自 `sgud/rule/rulebook.md` 搬移而來(2026-10-28 整理,wsemi-run08):各節之節號與標題不變、內容逐字未動;全部條目之索引見 `sgud/rule/rulebook.md`〈索引〉.

2026-10-29(wsemi-run10)再整理: R-DL-VERIFY-01 移至 `sgud/rule/rulebook_dl.md`、R-BIN-ENSURE-01 移至 `sgud/rule/rulebook_bin.md`(節號與標題不變、內容逐字搬移).

## R-FS-RESULT-01 fs 結果物件之形狀與文件;逐項刪除不跟隨連結

- 規則:
  1. 文件載為「結果物件」之 fs 函數,所有出口回 `{ success }` 或 `{ error }`(error 值為錯誤訊息字串或 Error 物件,文件載明),不回裸值.
  2. 回傳結果物件者其 JSDoc 必載為結果物件(含 success 與 error 各代表什麼).
  3. 清空資料夾之逐項刪除以 `fs.lstatSync` 判型別(不跟隨連結): 真資料夾 `rmSync(recursive, force)`;檔案與連結(符號連結、junction,含目標已不存在之懸空連結)`unlinkSync` 只移除本身.檔案不用 rmSync: Windows 下 rmSync 之錯誤訊息帶 `\\?\` 前綴且非 ASCII 路徑亂碼.
  4. 清空之目標本身為連結(junction、符號連結)時不清空,回 `{ error: 'input path is not a folder' }`(不經連結刪除他處內容,設計事實).
- 盤點指令: `src/fs*.mjs` 之 `return` 敘述與 `@returns` 對照(2026-10-14 以 `tmp/run02/scan-fs-returns.mjs` 盤點).
- 站點全集與判準(2026-10-14): 66 檔,回傳結果物件 24 檔;出口形狀: fsCleanFolderCore 之建立失敗原回 `r.error`(裸值)——已套;JSDoc: fsReadText、fsReadTextCore、fsReadJson、fsWriteText、fsWriteTextCore、fsWriteJson 原與實作不符——已套.
- 已知限制: 清空時某項刪除失敗即回 `{ error }` 並停止(已刪者不復原);子資料夾內被占用之檔,其錯誤訊息來自 rmSync(亂碼,Node 端問題).
- 測試: `test/fsCleanFolder.test.mjs` 之 `describe(\`fsCleanFolder 結果物件(R-FS-RESULT-01)\`)` 段 8 案(夾具 `test/_tmp/fsCleanFolder/`,after 刪除):建立失敗 3 形(上層為檔案、undefined、空字串)回 `{ error }` 而非裸 Error;目標為檔案;內含懸空 junction 與檔案時清空成功;內含 junction 時不動其指向之外部資料夾;目標本身為 junction 時不清空;win32 下執行中之檔案之錯誤訊息保留原完整路徑(無 `\\?\`).守門變異 G5(逐項一律 rmSync)被抓.指令: `npx mocha --no-parallel test/fsCleanFolder.test.mjs --timeout 180000`.
- 變更紀錄:
  - 2026-10-14: 依 w-component-vue 之 `建議wsemi修正-fsCleanFolder.md` 與主控裁示:建立失敗(上層為檔案、undefined、空字串等)由裸 Error 改為 `{ error }`;懸空連結不再使清空中止;6 檔 JSDoc 更正.w-package-tools 內附之 wsemip 需重新打包方生效.
- 2026-10-16 增訂(主控 run01 複審裁示 2、N8):
  5. `error` 值恆為 truthy: 捕捉之值一律經單一擁有者 `src/_toResultError.mjs`(內部,不進 index,只匯入 `_errToStr`、`_isRealError`): 真 Error(經 `_isRealError`,含跨 realm 與無原型者,原樣回傳而保留 code;2026-10-16 外審 opus F03,原只以 instanceof 判定而把跨 realm 之 Error 轉成字串)或非空字串原樣;其餘(null、undefined、空字串等)經 `_errToStr`,仍為空字串者 `'unknown error'`.是否出錯一律以布林旗標判定,不以錯誤值 `!== null` 為哨兵(錯誤值本身可為 null).修前之觀察: fsWriteJson 之 toJSON、fsReadTextCore/fsWriteTextCore 之注入 fs 拋 null 時回 success 並寫出空內容,拋 undefined 時回 `{ error: undefined }`;fsCleanFolderCore 之目標不存在而自動建立拋 null 時偽回 `{ success: 'done: …' }`.
  6. JSDoc 載 error 之型別「(說明字串或Error物件)」: fsCreateFile、fsCreateFolder、fsDeleteFile、fsDeleteFolder、fsRenameFile、fsRenameFolder 及其 Core(12 檔),與 fsCopyFile、fsCopyFileCore、fsCopyFolder、fsCopyFolderCore(4 檔).結果物件之 error 不統一型別(規則 1 已允許兩型).
  7.(run02 同類補齊)回傳結果物件之 fs 函數不同步拋出: 前置檢查(fsExistsCore、fsIsFileCore、fsIsFolderCore、上層資料夾之檢查與建立,含注入 opt.fs 之 lstatSync/statSync 拋錯)與實際操作置於同一 try 內,轉為 `{ error }`(error 依規則 5).fsCopyFile、fsCopyFolder 同(R-FS-REJECT-01 規則 2).opt 本身或其屬性不可讀(getter 拋錯、已撤銷之 Proxy)同: 對外函數之 `{ fs, ...opt }` 展開與 Core 之 `get(opt, …)` 皆在 try 內(useSync:false 者 resolve `{ error }`).
- 站點全集與判準(2026-10-16,結果物件 24 檔;盤點: Grep `src/fs*.mjs` 之 `error:`、`success:`,與 `existsSync\(|lstatSync\(|statSync\(|fsIsFileCore\(|fsIsFolderCore\(|fsExistsCore\(|getPathParent\(` 是否於 try 內):
  - 規則 5 已套: fsWriteJson、fsReadTextCore、fsWriteTextCore、fsCreateFileCore、fsCopyFileCore(sync/async)、fsCopyFolderCore(sync/async)、fsCreateFolderCore、fsDeleteFileCore、fsDeleteFolderCore、fsRenameFileCore、fsRenameFolderCore、fsCleanFolderCore;對外 11 檔委派 Core.刻意不套: fsReadJson(只用內建 fs,讀檔錯誤由 fsReadTextCore 回傳;JSON.parse 之輸入恆為字串,拋出值恆為 SyntaxError);fsReadText、fsWriteText 對外(固定內建 fs,error 恆為 Error,既載正確).
  - 規則 7 已套: fsDeleteFileCore、fsDeleteFolderCore、fsCreateFolderCore、fsRenameFileCore、fsRenameFolderCore、fsCleanFolderCore、fsWriteTextCore、fsCreateFileCore、fsCopyFileCore、fsCopyFolderCore;不適用: fsReadTextCore(無前置檢查)、fsWriteJson(前置檢查不拋,寫檔委派 fsWriteTextCore)、fsReadJson.
  - 規則 6 已套: 上列 16 檔 JSDoc;fsWriteJson、fsReadTextCore、fsWriteTextCore 補「拋出非Error之值時為其字串」.
- 已知限制(2026-10-16): 庫內呼叫端忽略 fsCreateFolderCore/fsDeleteFileCore/fsDeleteFolderCore 之結果物件者(fsCopyFileCore、fsCopyFolderCore、fsRenameFileCore、fsRenameFolderCore、fsWriteTextCore、fsCreateFileCore、fsDownloadFileCore、fsMergeFilesCore、fsSyncFolderCore 之上層夾建立與切片刪除),規則 7 使注入之 lstatSync 拋錯改回 `{ error }` 而被忽略;建立資料夾類者後續操作自行失敗並回報(不致偽成功);fsMergeFilesCore 之切片刪除失敗被忽略、合併仍 resolve、切片殘留(真實 EBUSY 於 HEAD 即如此,是否回報屬另裁).回布林之 fsIsFileCore、fsIsFolderCore 於注入之 lstatSync 拋錯時同步拋出(JSDoc 未載,另案).fsCreateFileCore 之 JSDoc 載 opt 可為編碼字串,實作取 `get(opt, 'encoding')` 而忽略字串 opt(讀碼,另案).
- 測試(2026-10-16): 子行程執行器 `test/tools/fsFailRunner.mjs`(RO17~RO38、CF/CD 各案;每案掛 unhandledRejection/uncaughtException 記錄器;夾具 `test/_tmp/fsFail-<案名>/` 用到才建、finally 刪)、呼叫端 `test/tools/fsFailRun.mjs`(`runFsFail`、`rErr`);各檔 `describe(\`<函數>[Core] 結果物件(R-FS-RESULT-01)\`)`: fsWriteJson 4、fsReadText 1、fsWriteText 2、fsCreateFile 2、fsCopyFile 6、fsCopyFolder 5、fsDeleteFile 2、fsDeleteFolder 2、fsCreateFolder 2、fsRenameFile 2、fsRenameFolder 2、fsCleanFolder 3.指令: `npx mocha --no-parallel test/fsWriteJson.test.mjs test/fsReadText.test.mjs test/fsWriteText.test.mjs test/fsCreateFile.test.mjs test/fsCopyFile.test.mjs test/fsCopyFolder.test.mjs test/fsDeleteFile.test.mjs test/fsDeleteFolder.test.mjs test/fsCreateFolder.test.mjs test/fsRenameFile.test.mjs test/fsRenameFolder.test.mjs test/fsCleanFolder.test.mjs --grep "R-FS-RESULT-01" --timeout 180000`.

## R-FS-REJECT-01 fs 系回傳 Promise 者: 拒絕值一律為字串、不同步拋出、失敗不偽成功、不懸置、不殘留資源

- 依據: 主控 run01 複審裁示 1(① (a) 全改字串,格式依族保留)與必修 N1~N7、N9、N11;審計輸入空間表 `tmp/run01-1016/fs/fs-reject-table.md`(66 檔 140 格).
- 單一擁有者: 錯誤值轉字串 `src/_errToStr.mjs`(R-CODEC-ERR-01 規則 3).
- 範圍: 回傳 Promise 之 fs 函數 22 個(對外與 Core 各 11): fsGetFileBasicHash、fsGetFileXxHash、fsGetFileHash、fsGetFolderBasicHash、fsTreeFolderWithHash、fsGetFilesWithHashInFolder、fsSyncFolder、fsDeleteFileSafe、fsDeleteFolderSafe、fsMergeFiles、fsDownloadFile 及其 Core;另 fsBuildWriteStreamText 之 create/end、fsSrlog;fsCopyFile、fsCopyFolder 之 `useSync:false`(resolve 結果物件、不觸發 reject,屬 R-FS-RESULT-01)適用規則 2、6.
- 規則:
  1. 拒絕值一律為字串(`typeof v === 'string'`): 前置檢查為說明字串;捕捉之錯誤值(Error、null、undefined、注入物拋出之任意值)經 `_errToStr`(Error 得 `String(err)` 即 `名稱: 訊息`).例外依既載格式: fsMergeFiles(Core 與對外包裝)為 message(message 為字串者取之,否則 `_errToStr`;R-CODEC-ERR-01 規則 2;外審 opus F15 與 fsopt ⑦-1);fsDownloadFileCore 之下載失敗與輸出夾之檢查/建立失敗(含注入之 lstatSync 拋錯)維持 `failed to download url[…] to file[…]: <訊息>`,其輸入檢查(urlIn、fpOut、opt.pipeline)改為說明字串.
  2. 不得同步拋出、不得以非字串 reject: 前置檢查(含呼叫端 `opt.fs` 經對外函數之 `{ fs, ...opt }` 覆蓋內建 fs 後之 lstatSync/statSync 拋錯,與 fsTreeFolderCore、fsGetFilesInFolderCore 之同步拋錯經雜湊族傳上者)一律在 try 內(或 async 函數內並捕捉),依規則 1 轉字串;回傳結果物件者(fsCopyFile、fsCopyFolder)轉為 `{ error }`,不觸發 reject.**opt 本身或其屬性不可讀**(getter 拋錯、已撤銷之 Proxy)同: 對外函數之 `{ fs, ...opt }` 展開與 Core 之 `get(opt, …)` 皆在 try 內(2026-10-16 外審 opus F02;原 22 函數中 21 個同步拋出或以 Error 物件 reject).
  3. 串流事件監聽器(`'readable'`、`'data'`、`'end'`、`'error'`)本體包 try: 呼叫注入物(hash.update/digest、input.read、hasher.update)拋錯即以規則 1 之字串 reject 並 destroy 串流;不得成未捕捉例外、不得懸置、不得以出錯後之雜湊 resolve(同 R-CODEC-ERR-01 規則 2、R-PM-SETTLE-01 規則 2).
  4. 不得偽成功:
     a. fsGetFileXxHash(及 fsGetFileHash 之 xxhash64 分支)之 chunkSize 非正整數(0、負數、小數、非數字)或超過上限 2^30 時改用預設值(以 ispint 判定;0 讀出空內容而得空雜湊 `ef46db3751d8e999`,負數與小數原為 highWaterMark 錯誤;Node 24 下 2^31 懸置、2^32 得空雜湊、2^53 與 Infinity 為 RangeError——外審 opus F21).
     b. fsDeleteFileSafe、fsDeleteFolderSafe 之最後一次嘗試仍為可重試之錯誤(EBUSY)時 reject 字串(最後一次之錯誤經 `_errToStr`),不得 resolve `done: …`;非 EBUSY 之錯誤立即 reject;標的不存在仍視為成功(既有設計),含重試期間標的被他方刪除(檔案版遇 ENOENT 且標的確已不存在時 resolve `file does not exist: …`,與資料夾版之 `rmSync({ force: true })` 一致——外審 opus F18).
     c. fsSyncFolder 之內部複製(fsCopyFolderCore、fsCopyFileCore)與刪除目標內多出之項目(fsDeleteFileCore、fsDeleteFolderCore)之結果物件帶 `error` 鍵即視為失敗(不以 error 值之真假判定,同 R-FS-RESULT-01 規則 5 不以錯誤值為哨兵),reject 該錯誤之字串,不得 resolve true(刪除一段為外審 opus F13).
  5. 不得懸置: fsBuildWriteStreamText 之 create 失敗或未 create 時呼叫 end() 須 resolve(不同步拋出、無開啟中之串流即直接 resolve,以 `stream === null || stream.closed` 判定);create 回傳 Promise(JSDoc 載明),該 Promise 先標記已處理(`pm.catch(() => {})`,await 者仍收到 rejection),create 失敗後之 write 不動作不拋錯(依 JSDoc 範例流程 create→write→end→await 給無效 fp 時,不同步拋出、無 unhandledRejection——外審 opus F14;「未呼叫 create 即 write」維持同步拋 TypeError 之既有約定).
  6. 不得殘留資源: fsCopyFileCore、fsCopyFolderCore(async)以 pipe 複製時,讀取流或寫入流任一端出錯即 destroy 兩端(釋放檔案控制代碼);含寫入流之建構子同步拋錯(目標路徑含 NUL 等)時銷毀已建立之讀取流(2026-10-16 外審 opus F01,CF11、CD10).測試判準為串流本身之 `destroyed` 與 `fd`(以 opt.fs 代理攔得之串流);`process.getActiveResourcesInfo()` 看不到開啟中之 fd(修前修後皆 `[]`),只作附帶斷言.
  7. 內部產生之 Promise 不得無人接: fsSrlog 之 `core()` 須接 rejection 並以 console.log 記錄(記錄包 try),不得成 unhandledRejection 致無處理器時行程以離開碼 1 結束(同 R-PM-SETTLE-01 規則 2、10).
  8. catch 內讀錯誤值之屬性(`err.code` 等)須可承受 null、undefined 與任意值(以 `get` 讀取或先判物件).
  9. JSDoc: 上列 22 檔之 `@returns` 載「reject回傳錯誤訊息字串」;同步回陣列者(fsTreeFolder、fsGetFilesInFolder、fsGetFoldersInFolder 及其 Core)、fsBuildReadStreamText、fsEvem 之 emit 之同步拋錯載於 JSDoc(N11);fsBuildWriteStreamText 載 create/end 之回傳.
  10. (2026-10-29 wsemi-run09,run08 只列不修缺陷②③,專案原則 14)注入之 `fs` 與重試終點: ①`fsDeleteFileSafeCore`、`fsDeleteFolderSafeCore` 之 `opt.fs` 為 null、非物件(字串、數字)或無 `statSync` 函數時 reject 字串 `opt.fs is invalid: it must be an object providing statSync (and lstatSync, unlinkSync|rmSync)`,並通知 `fail`(n 為 0、code 為 null)(原 `fsExistsCore` 吞掉對 null 呼叫 `statSync` 之 TypeError 而判標的不存在,回傳 `file does not exist: …` 之成功而未刪任何東西;對外函數 `{ fs, ...opt }` 展開使呼叫端給 `fs: null` 或 `fs: undefined` 亦然).僅檢 `statSync` 是因 `fsExistsCore` 只吞它之錯誤;缺 `lstatSync`、`unlinkSync`、`rmSync` 者其 TypeError 本在 try 內以字串 reject,不另檢.內部檢查模組 `src/_fsMissFns.mjs`.②重試耗盡不多等: 最後一次嘗試遇 EBUSY 後直接 reject(原再 `await delay(300)` 才 reject,多等 300ms 且無用),`onTrace` 之 `retry` 只在之後還有下一次嘗試時通知(n 小於 numRetry),`giveup` 於最後一次失敗當下通知.
- 盤點指令: Glob `src/fs*.mjs`;Grep 其內 `reject\(|throw new Error|\.on\('(error|readable|data|end)'|err\.code|errTemp !== null`,逐一核對規則 1~8;`git grep -n "@returns" -- "src/fs*.mjs"` 核對規則 9.
- 已知限制: 拒絕值為字串後拿不到 `err.code` 與 stack(自有下游經查不讀 code,`tmp/run01-1016/downstream/downstream.md` A 類);fsSyncFolder 之目標內多出之項目為連結(junction)時 fsDeleteFolderCore 以 lstat 判非資料夾而回 error,規則 4c 使同步 reject `input path is not a folder`(修前 resolve true 而連結殘留;是否改以 unlinkSync 移除連結待裁示);fsSrlog 回傳 log 函數(非 Promise),其 opt 不可讀之處置無規格句(未套規則 2 之 opt 句);fsTask 監看夾內有懸空 junction 時雜湊失敗之 reject 被吞,不發 change 亦不發 error(N10,屬監看語意,主控裁示文件化,另案);注入之串流以非 Buffer 之 data(如數字)餵入時 XxHash 仍得空雜湊(XH12,僅注入可觸發);fsCopyFile(async)之來源讀取失敗時目標檔可能已被寫入流建立為空檔,不刪除(不刪呼叫端可能既有之檔).
- 站點全集與判準(2026-10-16,run02 實作後):
  - 已套: fsGetFileBasicHashCore(1、2、3、9)、fsGetFileXxHashCore(1、2、3、4a、9)、fsGetFileHashCore(2、9)、fsGetFolderBasicHashCore(1、2、9;補資料夾前置檢查)、fsTreeFolderWithHashCore(1、2、9)、fsGetFilesWithHashInFolderCore(1、2、9)、fsSyncFolderCore(1、2、4c、9)、fsDeleteFileSafeCore/fsDeleteFolderSafeCore(1、2、4b、8、9)、fsMergeFilesCore(1 例外 message、2、9)、fsDownloadFileCore(1、2、9)、fsBuildWriteStreamText(1、2、5、9)、fsCopyFileCore/fsCopyFolderCore(2、6)、fsSrlog(7;另 `srlog()` 於 useLoc 而堆疊無呼叫端位置時同步拋 `can not parse stackLines`,JSDoc 已載);對外 11 檔之 `@returns` 同改(9).
  - 只改 JSDoc(規則 9/N11,行為不改): fsTreeFolder、fsGetFilesInFolder、fsGetFoldersInFolder 及其 Core(同步回陣列者,fd 非資料夾或列舉失敗同步拋 Error)、fsBuildReadStreamText(fp 非檔案同步拋 Error)、fsEvem(emit 寫入失敗同步拋 Error).
  - 刻意不套: fsBuildWriteStreamText 之 write 未 create 即同步拋 TypeError(JSDoc 載須於create後呼叫,無規格句);XxHashCore `'end'` 內 digest 為第三方 wasm 不可注入(已包 try,無測試).fsDownloadFileVerify(Core)(2026-10-28 新增)之規則 1 刻意不套: 以 Error 物件(帶 code 等)reject,見 R-DL-VERIFY-01 規則 4;規則 2(不同步拋出、opt 不可讀轉為 reject)、5(不懸置)、6(不殘留)照套.
- 測試(2026-10-16): 子行程執行器 `test/tools/fsHashFailRunner.mjs`(雜湊族與 fsSyncFolder:BH01–15、XH01–17、FH01–05、GB01–08、TW01–06、FW01–07、SY01–06,無處理器 5 案;XH12 為 pending 之已知限制;Error 來源之期望值於子行程以同一錯誤直接呼叫得 `String(err)`)與 `test/tools/fsFailRunner.mjs` + `test/tools/fsFailRun.mjs`(DF01–09、DD01–08、MG01–05、DL01–08、WS01–07、CF、CD、EV02/EV03 各兩模式);各檔 `describe(\`<函數> 失敗回報(R-FS-REJECT-01)\`)`.Windows 真實觸發(icacls ACL 拒讀、cmd ping 持檔之 EBUSY、他程序 cwd 之 EPERM)於他平台 skip,夾具與子程序 finally 清除並回驗.HEAD 副本紅 88 案(fsh 41、fso 47)、修後綠.守門變異 fso 6/6 被抓.外審補修(2026-10-16)增列: CF11、CD10(寫入流建構子同步拋錯,F01)、opt 不可讀 36 函數 × 2 形(getter 拋錯、已撤銷 Proxy;`fsFailRun.mjs` 之 `itOptUnreadable` 與 fsHashFailRunner 之對應案,F02;修前 36 紅)、SY07–SY08(刪除多出項目失敗,F13)、WS08–WS11(範例流程 × 無效 fp,F14)、MG06–MG07 與 message 非字串 6 案、OU-fsMergeFiles(對外與 Core 同格式,F15)、DF10–DF12、DD09–DD11(EBUSY→成功、EBUSY→EPERM、EBUSY→ENOENT,F18/F19)、XH18–XH20、FH06(chunkSize 2^31、2^32、2^53,F21);變異 13/14 被抓(未抓者為重複 create 之等價變異).指令: `npx mocha --no-parallel test/fsGetFileBasicHash.test.mjs test/fsGetFileXxHash.test.mjs test/fsGetFileHash.test.mjs test/fsGetFolderBasicHash.test.mjs test/fsTreeFolderWithHash.test.mjs test/fsGetFilesWithHashInFolder.test.mjs test/fsSyncFolder.test.mjs test/fsDeleteFileSafe.test.mjs test/fsDeleteFolderSafe.test.mjs test/fsMergeFiles.test.mjs test/fsDownloadFile.test.mjs test/fsBuildWriteStreamText.test.mjs test/fsCopyFile.test.mjs test/fsCopyFolder.test.mjs test/fsSrlog.test.mjs --grep "R-FS-REJECT-01" --timeout 180000`.
- 變更紀錄: 2026-10-16 依主控 run01 複審裁示 1 與 N1–N7、N9、N11 新訂並實作(破壞性變更見文末〈破壞性變更紀錄〉第 1 條).2026-10-29 wsemi-run09 增規則 10(注入 fs 驗 statSync、重試耗盡不多等 300ms;破壞性變更見 `rulebook_breaking.md` 第 41 項).


## R-FS-EVEM-NAME-01 fsEvem 之事件名稱即事件檔案檔名: 須為單一安全檔名,寫入不得離開事件資料夾,含 `.` 之名稱原樣送達

- 依據: wsemi-run08 〈發現之問題〉§8 第 3 項(安全缺陷,主控 wsemi-run09 令最優先處理): `fsEvem` 的 `emit(evName, …)` 以 `path.resolve(fd, evName)` 為事件檔案位置,事件名稱含 `..`、路徑分隔字元或絕對路徑者可寫出事件資料夾之外(`'../x'` 寫到上一層;絕對路徑直接寫到該位置);收端又以 `getFileTrueName` 去掉最後一段,含 `.` 之名稱(`'user.login'`)收端還原為 `'user'`.專案原則 14: 不做舊版相容、直接改正確行為.
- 規則:
  1. 事件名稱須為單一安全檔名,否則 `emit` 同步拋 `Error`(`fsEvem: invalid event name "<前 40 字>": <原因>`)且不寫出任何檔案: 非字串(含 `String` 包裝物件、null、undefined、數字、物件)、空字串、UTF-8 位元組數逾 200、含路徑分隔字元(`/`、`\`)或 `< > : " | ? *` 或控制字元(碼位小於 32)、等於 `.` 或 `..`、以 `.` 或空白結尾(Windows 去掉結尾之 `.` 與空白而與他名衝突)、為 Windows 裝置名稱(`CON`、`PRN`、`AUX`、`NUL`、`COM1`–`COM9`、`LPT1`–`LPT9`,不分大小寫,含其後接副檔名者).單一擁有者: `src/fsEvem.mjs` 之 `checkEvName`.
  2. 寫入前再驗: `path.resolve(path.resolve(fd), evName)` 之 `dirname` 須恰等於事件資料夾絕對路徑且 `basename` 等於事件名稱(規則 1 之保險),不合同樣拋 Error、不寫檔.
  3. 事件名稱即檔名(含 `.` 與副檔名): 收端以 `path.basename(msg.fp)` 取名稱,不再去掉最後一段; `'user.login'`、`'v1.2.3'` 原樣送達本程序監聽器與 `onTrace` 之 `emit` 事件.事件資料夾內其他程序或人工放入之檔案(如 `bad.txt`)之事件名稱為其完整檔名(`skip` 事件之 `evName` 同).
  4. 只擋「名稱」: 事件內容(`{ pkg, time }`)、keySys 本地派發、`clear()` 刪除整個事件資料夾等既有語意不變.
- 盤點指令: Grep `path\.resolve\(fd|getFileTrueName` 於 `src/fsEvem.mjs`(應無 `getFileTrueName`);Grep 其他以使用者字串組檔案位置之站點 `path\.resolve\(\w+, \w+\)` 於 `src/fs*.mjs` 逐一判斷是否同類(本輪未全面盤點,見已知限制).
- 站點全集與判準: 已套: `fsEvem` 之 `writeEventFile`(寫)與 `evl.on('change')`(讀)兩站;刻意不套: 無.
- 測試: `test/fsEvem.test.mjs` 〈事件名稱安全案〉新增 4 案(3 案修前紅、1 案安全名稱對照修前後皆綠)+ 1 案更新(`skip` 之 `evName` 為完整檔名,修前紅).修前紅(HEAD 副本 `src`、四個測試檔)共 11 案紅,含此 4 案(摘要 `agent-out/wsemi-run09-evidence/quiet-run-summaries/` 之 `defect-red2`);修後 112 passing(含 fsDeleteFileSafe、fsDeleteFolderSafe、fsTask、evemSafe).
- 已知限制:
  - 不分大小寫之檔案系統(Windows、macOS 預設)上大小寫不同之名稱(`'Foo'` 與 `'foo'`)為同一事件檔案,收端得到先建立者之大小寫(JSDoc 已載).
  - 多程序共用同一事件資料夾時,一個程序 `clear()` 會刪除整個資料夾而影響其他程序(run08 §8 第 3 項③,既有設計,未改).
  - 其他 `fs*` 函數以呼叫端字串組檔案位置者(如 `fsCreateFile` 之 `fp`)本就以位置為介面,不在本規則範圍.
- 變更紀錄: 2026-10-29 wsemi-run09 新訂並實作(破壞性變更見 `rulebook_breaking.md` 第 41 項).
