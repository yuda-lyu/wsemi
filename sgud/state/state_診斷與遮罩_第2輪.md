# 狀態(診斷輸出與遮罩,第 2 輪起)

本檔 2026-11-24 新建(twsm1);第 1 輪(診斷輸出與遮罩之共用函數、通報站點、形狀摘要)之現況見 `sgud/state/state_計時與診斷.md`.只記現況、不寫過程(過程見 `sgud/exp/experience.md`).

## 已知秘密內建 JSON 跳脫形、NODE 代碼以內建 undici 核對(排程第 650 項、第 621 項;主控任務 20261127030143 wsr1,2026-11-27;package.json version 1.9.81 之工作樹,未提交未發布)

- **已改**(R-DIAG-01 規則 21、22;破壞性變更第 84 項③④): 比對器 `getMatcher` 對字串清單之每項另加 `JSON.stringify(s).slice(1, -1)`(遮罩器各入口同一出處,只增不減);`_diagCodes.mjs` 之 NODE 集合增 `UND_ERR_SOCKS`.
- **第 621 項①②之核實**: twsm2(2026-11-24,已發布)已落實 `fsEvem` 1 站、`fsTaskCp` 3 站經 `pickDiagOpt(opt)` 與 9 個 `UND_ERR_*`;本輪以 twsm2 前一版(`98891adbf^` 之 `git archive`)重跑其測試得修前 10 failing,現行 78 passing;9 個代碼皆見於 Node 24.22.1 內建之 undici 7.30.1.
- **測試**: `test/diagJsonEsc650.test.mjs`(7 案;修前 4 failing,修後 7 passing);`test/getDiagBriefErr.test.mjs` 增 1 案(以執行中 Node 內建之 undici 原始碼核對;修前 1 failing).變異 M11～M13 皆被殺.
- **待裁示(已結,2026-11-27 wsr2,排程第 663 項)**: `ERR_SSL_PROTOCOL_ERROR` 無 Node 實得之證據(本機 OpenSSL 3.5.9 未見對應 reason)——主控裁定移除,已由 `_diagCodes.mjs` 之 NODE 集合移除(破壞性變更第 85 項④);NODE 集合限以 Node 或 undici 實證之代碼,`test/getDiagBriefErr.test.mjs` 新增「NODE 集合每個代碼皆有執行中 Node 之實證」案(41 個於內建原始碼、`ERR_SSL_WRONG_VERSION_NUMBER` 以真實 fetch 連純 http 服務核對);修前 2 failing／37 passing,變異 `X22`～`X24` 全被殺.
- **下游**: w-dispatch-ai 之 `secretList` 自行展開之 JSON 跳脫形可刪除(主控另案通知).

## 收尾輪:控制字元單一規則之補齊、常駐路徑之記錄經 getDiag、除錯殘留(主控對 twsm1 需裁示之裁定;主控任務 20261124085531 twsm1b,2026-11-24;與下節同一次發布,package.json version 1.9.72 之工作樹,未提交未發布)

- **已改**(R-DIAG-01 規則 16、20;破壞性變更第 79 項): `normLabel`(getDiag、genDiagFunLog 之 label)改 `ctlToQ`;`lowerFind`／`lowerFindEq` 之 `clean` 改與 `RE_CTL` 同一字面值(零 import,以測試核對);`setTimeoutHp`／`setIntervalHp`／`fsWatchFile`／`fsWatchFolder`／`fsSrlog` 之記錄經 `getDiag(opt)`(console.error 固定詞彙＋`{ errType, errCode? }`,opt 增 `logDetail`、既有 `funLog` 兼收);`_getDiff2Html`／`_getHtmlToText` 之除錯殘留改固定詞彙.權杖遮罩維持單一規則(裁定 A).
- **全庫 console 盤點**: 47 處 24 檔(twsm1 時 56 處 28 檔);「印捕獲之錯誤本體」剩瀏覽器端 DOM 與顏色 11 處,主控裁定後議.
- **驗證數字**(2026-11-24 最終碼): 見本輪報告與下列;修前紅以 twsm1 之成果(本輪改動前之工作樹副本)為基準,本輪新增或改期望之測試皆紅;變異 25 項(以未植入變異之副本為對照組,只計對照組以外之新失敗)全數擊殺;全套與發布包全套之數字記於報告〈全套〉.
- **twsm1c(主控對 twsm1b 需裁示之裁定 1 A、2 A,同一次發布)**: `fsWatchFile`／`fsWatchFolder` 之監聽器拋錯通報改用與停止監看錯誤同一快照之 logDetail/funLog(每個 evEmit 站點);`fsEvem`、`fsTaskCp` 以 `pickDiagOpt` 轉傳 logDetail/funLog 給內部監看.驗證:修前紅(twsm1b 之成果為基準)11 案紅、修後綠;變異 11 項全擊殺;全套數字見本輪報告.
- **已知缺口**: 瀏覽器端 11 處後議.(`fsEvem`、`fsTaskCp` 自身派發之通報已於 twsm2 改經同一快照,見下條.)
- **twsm2(排程第 621 項①②,2026-11-24,與跨程序鎖同一次發布;未提交未發布)**: ①`fsEvem` 本地派發 1 站、`fsTaskCp` 之 set、remove、change 3 站之監聽器拋錯通報改經建立時同一快照之 `pickDiagOpt(opt)`(JSDoc 刪「不在此列」);②`getDiagBriefErr` 之 NODE 集合增 undici 之 `UND_ERR_CONNECT_TIMEOUT`、`UND_ERR_HEADERS_TIMEOUT`、`UND_ERR_BODY_TIMEOUT`、`UND_ERR_SOCKET`、`UND_ERR_HEADERS_OVERFLOW`、`UND_ERR_RES_CONTENT_LENGTH_MISMATCH`、`UND_ERR_CLOSED`、`UND_ERR_DESTROYED`、`UND_ERR_PRX_TLS` 與 `ERR_SSL_PROTOCOL_ERROR`(本機真實 fetch 實得 5 種;取捨寫於 `src/_diagCodes.mjs` 註解).規則 R-DIAG-01(`rulebook_diag.md` 規則 7、20 與測試紀錄);破壞性變更第 80 項②③.驗證: 修前紅 9/9;變異與全套數字見 twsm2 報告.

## 串流遮罩器、收錄評估與診斷輸出之擴充(排程第 486、610 項;主控任務 20261124085531 twsm1,2026-11-24;package.json version 1.9.72 之工作樹,未提交未發布)

- **新增 4 函數**(已入 `src/index.mjs`,以 `toolg/gPackageIndex.mjs` 重產): `genDiagStreamMasker`(R-DIAG-02,`rulebook_diag_stream.md`)、`maskDiagCtrl`(R-DIAG-01 規則 16)、`maskDiagToken`(規則 17)、`pickDiagOpt`(規則 18).
- **擴充既有函數**(規則 19、20;破壞性變更第 78 項): `getDiag` 之 level `'warn'` 改 console.warn、`diag.brief(err, { format: 'text' })`;`getDiagBriefErr` 之 `opt.format: 'text'`(行內字串 `(errType errCode)`)與 fetch 之 `nested: ['cause']` JSDoc 範例;`maskDiagText` 之 `opt.credPatterns`;`downloadExcelFileFromData` 轉換失敗改經 `getDiag(opt)`(新增第 4 參數 opt).`getDiagShape` 之控制字元規則移入 `_diagKit.mjs`(`RE_CTL`/`ctlToQ`,輸出不變).
- **收錄判定**(依跨套件規格〈wsemi收錄原則〉): 串流遮罩器 收(判準 1,使用端 2 套件);①行內摘要格式 收(判準 2,使用端 2 套件現以不同字樣自組);②控制字元替換 收(判準 1、3,使用端 5 套件);③權杖遮罩 收(判準 1,使用端 4 套件);④欄位名白名單 `logKey` **不收**(只有 1 套件,且名單為該套件資料表之欄位,屬領域語意;其他套件之近似者回傳物件、形狀不同);⑦`pickDiagOpt` 收(判準 1、2,使用端 5 套件;只取值不驗證).
- **驗證數字**(2026-11-24 最終碼): 全套 `npm test` 33543 passing／8 pending／0 failing(約 2 分);`npm pack` 之發布包解開於 `./tmp/` 以其根為工作目錄跑全套 33543／8／0(發布包不含 `node_modules`,以目錄連接點指向本庫者;不接時 2 案紅〔`getUserAgentUmd`、`evem` 以明確之 `node_modules/<套件>/` 路徑讀檔〕,屬配置所致);修前紅(HEAD 之 `src` 配本輪之測試檔逐檔執行): 新 4 模組載入失敗、既有 4 檔共 8 案紅;變異 40 項全數擊殺(串流遮罩器 20、其他 20);eslint 本輪新增與改動之檔 0 error(`src/index.mjs` 缺結尾換行為產生器既有);private-guard CLEAN;自派 sonnet 唯讀獨立複審 1 次(串流遮罩之隨機與對抗探測約 9120 組無反例;其 A1〔網址帳密之 @ 在長列之窗外時明文〕、A2〔字串塊之二進位試探成本〕已修並補案).
- **權杖遮罩與既有四份**: 四份共同測資 14 列與各份額外測資逐字相同,唯二列不同(一份釘住 C1 不換、一份釘住 U+206A 不換;四份彼此本就矛盾,見規則 17);主控裁定 A(維持單一規則),使用端改用時改其測試.
- **全庫 console 盤點**(AST,`test/tools/scanConsoleSites.mjs`): 56 處 28 檔,分類與判定見規則 20;本輪只改 `downloadExcelFileFromData`(主控指定);同類之常駐路徑 9 處與除錯殘留 2 處已於收尾輪(上節)改,現況見上節.
- **已知缺口**: ①~④已於收尾輪依主控裁定處置(上節);⑤共用語料(D5)未加串流遮罩器之案(其規則經 maskStr,已由既有語料涵蓋;串流特有之切點案在 `test/genDiagStreamMasker.test.mjs`).
- **使用端改用(另排各套件輪次;本輪不改他套件)**: 串流遮罩 2 套件、權杖遮罩 4 套件、控制字元 5 套件、`pickDiagOpt` 5 套件、行內摘要 2 套件、`downloadExcelFileFromData` 之 opt 2 套件(可選);各自之要點見 `rulebook_diag_stream.md` 與 `rulebook_breaking_77on.md` 第 78 項.
- **發布**: 主控之發布流程;核心套件屬高風險改動,發布前另派未參與撰寫者做獨立實操確認(主控任務之 task.md).
