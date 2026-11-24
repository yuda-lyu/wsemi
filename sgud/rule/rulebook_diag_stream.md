# 規則帳本(診斷輸出與遮罩:串流遮罩器)

本檔 2026-11-24 新建(twsm1,主控任務 20261124085531,排程第 486 項);`rulebook_diag.md`(R-DIAG-01,約 45KB)之後另開.全部條目之索引見 `sgud/rule/rulebook.md`〈索引〉.

## R-DIAG-02 串流文字之遮罩一律經 `genDiagStreamMasker`(逐列、與 maskDiagText 同一套規則、長列分段不切開命中、與塊之切法無關)

- 依據: 跨套件規格 `C:\opensrcOper\dspec\診斷輸出與遮罩.md` D1(單一實作)、D2、D4;收錄原則判準 1(使用端兩個自有套件各寫一份: 一份逐列緩衝、長列依 16000 分段、切點避開已登錄秘密與自抄之憑證樣式;一份逐塊、保留秘密真前綴之尾端、只做精確比對與單一金鑰樣式);主控 2026-11-24 定「收錄;API 須能直接取代兩份;使用端之改用不在本輪」.
- 單一擁有者: `src/genDiagStreamMasker.mjs`;規則之實作在 `src/_diagKit.mjs`(`getCtx`、`maskStr`、`spansOf`〔含選用之 `ext`: 各命中之整段範圍〕、`addSecrets`、`applyIvs`),不另抄憑證鍵名或樣式.
- 規則:
  1. **API**: `genDiagStreamMasker(secrets, opt)` 回 `{ push(chunk), flush() }`;push 回此時可安全交出之已遮罩文字(可為 `''`),flush 交出其餘並重設(其後可再 push,視為新串流);兩者永不拋錯(內部失敗回 `***` 並捨棄緩衝).secrets 與 opt 同 maskDiagText(字串陣列或 getDiagSecrets 之結果取 detail;`opt.patterns`、`opt.credPatterns`),比對器於建立時建成一次(快照);清單無法使用時每段 `***`.
  2. **逐列**: 收到換行才交出該列(含換行);每列之輸出等於 `maskDiagText(該列, secrets, opt)`.已知秘密含換行者,跨於其中之列尾不作為切點(與下一列合為一段),判定須等其後至多「最長之含換行秘密長度−1」字元或 flush.
  3. **長列**(一段超過 20000 字元,即 maskDiagText 不截長度之上限): 強制分段,每段至多 16000;切點優先取前 16000 內最後一個空白或定位字元之前,不得落在任一命中之**整段範圍**內(已知秘密、網址帳密自 scheme 起至 @、鍵值對自鍵起至值之結尾、Bearer 自 Bearer 起、opt.patterns 之整個命中;只避遮罩區間會把鍵與值分在兩段,後段無鍵而不被遮——實作時以自寫測試發現),亦不切開代理對;命中範圍於自段首起「16000＋max(4000, 最長秘密長度)＋1」字元之窗上以同一套規則求得,窗內之遮罩依該窗之命中區間輸出.段首即落在延伸超過 16000 之命中內者以該命中之結尾為切點;該命中延伸至窗尾而列未結束者(超長憑證值、未閉合之引號或中括號、scheme:// 之後至窗尾皆無空白、/、?、# 者)該列其餘部分以一個 `***` 取代(fail-closed),列尾之換行照輸出.分段只依該列之文字(等窗內文字到齊才切),輸出與塊之切法無關.
  4. **chunk**: 字串照用;ArrayBuffer 與其視圖以 UTF-8 串流解碼(跨塊之多位元組字元正確,flush 補 U+FFFD);數字、布林、bigint 以 String;undefined、null 為空;包裝字串解包;Symbol、函數、一般物件、可偵測之 Proxy、無法解碼之二進位以 `***` 取代該塊(不執行 toString).
  5. **與 maskDiagText 之差異**(JSDoc 載明): 長列分段輸出全文不截斷;`scope: 'message'` 之樣式於逐列下作用於每列;未閉合之憑證值只遮至該列;長列之切點之後之文字視為新段之開頭(只會多遮,如緊接英數字之 Bearer).
- 與兩份既有實作之對照(使用端改用之要點;改用不在本輪):
  - 逐列緩衝者: 原以「整塊完整列」一次遮罩(多列之引號值跨列時輸出隨切塊而異)、長列 16000 分段之切點只避已登錄秘密與自抄之 `RE_CRED`(鍵名重抄,不含網址帳密、陣列值、opt.patterns,切點落在鍵之後而值不被遮;實測 6 萬字元之 `token=` 值有 44007 字元明文輸出)、無換行累積逾 64000 時之提前切段不保留秘密之真前綴、`String(chunk)` 使跨塊之 UTF-8 字元變 U+FFFD、自行寫檔與標頭.改用: `let sm = genDiagStreamMasker(secrets)`,`push`/`flush` 之回傳非空時才寫檔(標頭照舊由使用端寫);刪 `STDERR_PIECE`、`safeCut`、`RE_CRED`.輸出差異: 逐列(而非逐塊)、長列切點位置、超長憑證整列 `***`.
  - 逐塊者: 原為精確比對(遮罩字樣 `[REDACTED]`、秘密短於 6 不遮)加選用之單一金鑰樣式,低延遲(不等換行)、`String(chunk)`(執行物件之 toString、跨塊 UTF-8 變 U+FFFD).改用: stdout(模型輸出)用 `genDiagStreamMasker(secrets, { credPatterns: false })`,stderr 用 `genDiagStreamMasker(secrets, { patterns: [{ re: <金鑰樣式> }] })`(另多遮內建憑證樣式);秘密之長度下限由呼叫端過濾(或改用 getDiagSecrets 之 values);輸出差異: 遮罩字樣改 `***`、以列為單位交出(收到換行才交出)、stderr 另遮鍵值對/Bearer/網址帳密.
- 已知限制: 未登錄之秘密只依內建樣式盡力遮罩,其跨列者第二列起不被視為憑證值;opt.patterns 依賴命中範圍之前文(後顧斷言)者,長列之切點可能落在前文與命中之間;maskDiagText 本身之已知限制(緊接英數字之 Bearer 不遮、同列兩個單引號鍵值對之第二個值等)照舊.
- 盤點指令: Grep `src/` 之 `genDiagStreamMasker|spansOf\(` → 擁有者 `src/genDiagStreamMasker.mjs` 與 `_diagKit.mjs`(maskStr 為 spansOf 之另一使用者);Grep `C:\opensrc` 之 `src|server` 搜 `createStreamRedactor|makeStderrSink|safeCut` → 2026-11-24 使用端 2 套件各 1 份(判準: 未套,待使用端輪改用).
- 測試: `test/genDiagStreamMasker.test.mjs`(S1~S8,33 案: 逐列等於 maskDiagText 之全切法、含換行秘密之全切法、長列之切點〔秘密、鍵值對、網址帳密、opt.patterns 之群組、6015 字元秘密跨窗〕、代理對、超長憑證 fail-closed、空白偏好、chunk 型別與 UTF-8、快照、fail-closed 清單、credPatterns、when 拋錯、隨機文字×隨機切塊、20 萬次單字元 push).指令: `npx mocha --no-parallel test/genDiagStreamMasker.test.mjs --timeout 180000`.
- 驗證(2026-11-24 twsm1): 修前紅(HEAD 無此模組,載入失敗);以使用端逐列緩衝者之邏輯接上同一份測試: 25 案中 15 案紅(含切法相關、含換行秘密、代理對、UTF-8、超長憑證);變異 20 項(本模組 16、`_diagKit` 之 ext 4)全數擊殺(首輪存活 2 項: 整列上限改 16000 者補「20000 字元內整列等於 maskDiagText」之案後擊殺,秘密陣列之複本判為等價而移除複本);獨立唯讀複審(sonnet)隨機與對抗探測約 9120 組無反例,其 A1(網址帳密之 @ 在窗外)已修並補案、A2(字串塊之二進位試探成本)已修.
