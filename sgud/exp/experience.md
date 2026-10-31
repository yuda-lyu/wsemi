# 累積經驗

本檔為執行工作時特有之累積經驗,留給後續之嘗試、執行與判斷,由agent自行編列、擴充與維護.

## 已抽出之舊經驗(索引)

2026-10-28(wsemi-run08)依全域設定§14整理: 本檔原約 82.4KB,將 2026-10-06 至 2026-10-21 之 30 節(約 56.4KB)抽出至 `sgud/exp/experience_20261028.md`(節號與標題不變、內容逐字搬移),本檔只留 2026-10-28 起之 6 節.需要久遠經驗時調閱該檔.被抽出之節:

- 修退化先追既有原則,只補壞掉的型別(2026-10-06)
- 寫檔工具會改寫跳脫字元(2026-10-06、2026-10-10 兩次)
- 時區測試(2026-10-06)
- hucre 與測試用 xlsx(2026-10-06)
- 評估第三方「更全面」之前先讀其原始碼(2026-10-10)
- 真瀏覽器驗證之借用環境(2026-10-06)
- js-xss 之解析模型與瀏覽器不同, 以其回呼做偵測須補洞(2026-10-11)
- 驗清洗函數之安全性: 以瀏覽器解析器批次檢查, 含切兩欄拼接(2026-10-12)
- 驗「釋放後不撐住行程」之量測時點(2026-10-13)
- 會漏計時器之缺陷, 紅燈測試要能自行結束(2026-10-13)
- 執行外部程序之失敗回報: 探測與替身法(2026-10-13)
- 修前紅、修後綠之驗證法(不用 stash/checkout, 2026-10-13)
- promise 包裝與佇列之 settle 審計(2026-10-14)
- 執行外部程序之命令解析、cwd 與回調(2026-10-14)
- 比較候選修法之紀律(2026-10-14)
- 派工套用原型與審查(2026-10-14)
- 大批實作之分工與閘門(2026-10-14, run04)
- 套件升版之供應鏈檢查流程(2026-10-06)
- fs 系失敗出口之真實觸發法與探測架構(2026-10-16, run01 fs 審計)
- 另案彙整之審計(2026-10-16, run01)
- 大範圍實作之分組與第二輪補修(2026-10-16, run02)
- lodash 陣列樣迭代與帶 length 鍵之物件(2026-10-17, R-OBJ-ITER-01)
- E2 八項與第 51 項之實作(2026-10-17, run02)
- cvOrmFind 之實作、測試與外審(2026-10-17, 第33項批0)
- jsdoc 發布與 BigInt 字面值(2026-10-17, cvOrmFind 第 2 次執行)
- cvOrmFind 品牌物件檢查與 Proxy(2026-10-17,wsemi 第 1 次執行)
- clearXSS 走訪重寫與三位外審(2026-10-20,第 62 項 run02)
- getFileType 對照表擴充與不分大小寫(2026-10-20,Gitea issue #7)
- ORM 字串良構檢核(chkOrmStr/chkOrmData/案例表)之實作經驗(2026-10-20,第 66 項批 0)
- 方言中立 IR `lowerFind` 移入 wsemi 與 toctou 補案之經驗(2026-10-21,第 94 項第①步)

2026-10-29(wsemi-run10)再整理: 本檔原約 37.6KB,將 2026-10-28 之 6 節(約 26.1KB)抽出至 `sgud/exp/experience_20261029.md`(節號與標題不變、內容逐字搬移),本檔只留 2026-10-29 起之節.被抽出之節:

- 帶期望雜湊之下載 `fsDownloadFileVerify` 之實作與測試(2026-10-28,第 148 項前半 wsemi-run01)
- `fsDownloadFileVerify` 第三方完整複核與修正之經驗(2026-10-28,wsemi-run03)
- `fsDownloadFileVerify` 補第三方複核之經驗(2026-10-28,wsemi-run02)
- 共用外部執行檔取得 `fsEnsureBins` 之實作與外審(2026-10-28,wsemi-run04)
- 計時器相關函數之觀察回調(opt.onTrace)試行與負載試驗(2026-10-28,wsemi-run06)
- 觀察回調全面套用第 1 輪(dom/pm/cache 系,2026-10-28,wsemi-run07)

2026-10-31(診斷通報輪)再整理: 本檔原約 34.3KB,將 2026-10-29 之 6 節(約 22.1KB)抽出至 `sgud/exp/experience_20261031.md`(節號與標題不變、內容逐字搬移),本檔只留 2026-10-30 起之節.被抽出之節:

- 觀察回調全面套用第 2 輪(fs 系,2026-10-29,wsemi-run08)
- 觀察回調全面套用第 3 輪(最末輪: exec 系、下載/取得、dom 系,2026-10-29,wsemi-run09)
- 檔案組、主幹模式之退路與重取、網址判定收緊(2026-10-29,wsemi-run10)
- 診斷輸出與遮罩之共用函數(2026-10-29,diag-run02)
- 診斷遮罩之發布前第三方複核(2026-10-29,diag-run03)
- 診斷遮罩之發布前收斂輪(2026-10-29,diag-run04)

## 查詢埠之監聽者(2026-10-30,主控任務 20261030064553 run01)

- **本機實測(Windows 11 26300.9818＋KB5127936,zh-TW)**: `netstat -ano` 約 25ms,但自起之監聽 0/10 列出;系統之 135、445 有列但狀態字錯(`0.0.0.0:135 0.0.0.0:0 FIN_WAIT_1`、`:445 … CLOSED`).`Get-NetTCPConnection -LocalPort` 約 0.9 秒、10/10 查到,State 為 0.故判定「監聽」只看遠端 `0.0.0.0:0`/`[::]:0`,135 仍由 netstat 查得、新起之監聽一律走備援.
- **PowerShell 之「查無」與「指令不存在」Category 相同**: 查無為 `CmdletizationQuery_NotFound_LocalPort,Get-NetTCPConnection`,指令不存在為 `CommandNotFoundException`,兩者 `CategoryInfo.Category` 皆為 `ObjectNotFound`;以 Category 判會把指令不存在當無人(fail-open),須以 FullyQualifiedErrorId 之前綴分辨.真機測試以把 cmdlet 名改錯之腳本驗證.
- **非同步版之第 2 個子指令於微任務後才組成**: 若組成時才讀 `process.env.SystemRoot`,呼叫端於呼叫後改動環境變數會使兩個子指令用不同之系統夾(測試即因「呼叫後立即還原」而走到真實 PowerShell 得 `[]`);入口讀一次存入設定.判準: 非同步流程中凡「呼叫當下之狀態」皆於入口快照.
- **spawnSync 之 timeout 須為整數**: 小數即拋 `ERR_OUT_OF_RANGE`(Node 24 實測),setTimeout 則接受小數——同一選項兩版行為分歧;入口無條件進位.
- **攔截 child_process 驗選項與子程序 pid**: 被測模組以 `cp.spawn(...)` 屬性取用時,測試可暫換 `cp.spawn`/`cp.spawnSync`(同一個 CJS 物件)記錄 options(windowsHide、shell、stdio、timeout、killSignal、maxBuffer)與 `pid`,再以 `process.kill(pid, 0)` 輪詢驗子程序已結束;比寫 pid 檔可靠(逾時短時子程序可能未及寫檔).
- **「事件於 resolve 之前通知」之驗法**: settle 事件與 resolve 同一同步段,await 後兩種順序看不出;於回調內 `util.inspect(pm).includes('<pending>')`.
- **子代理(sonnet)獨立審查**之 15 條中 1 條為當下之紅測試根因(上列 SystemRoot)、2 條為兩版分歧/TOCTOU;先跑一次再審,審查者可引 quiet-run 之 log 為旁證.

## 小輪 9 項(2026-10-30,主控任務 20261030143215 run01)

- **原型為 null 之原生 Promise 不是 thenable**: 無 `then` 可查,`Promise.resolve`／`.then` 之回傳把它當一般值;`pmSeries`、`pmMap` 依原值交出(結果陣列含該 Promise),其 rejection 不會傳到 pmSeries.品牌判定(`Promise.prototype.then.call`)仍可標記它;測試預期須寫「依原值交出且無未處理之 rejection」,不是「pmSeries reject」(首次寫錯而紅).
- **無 util 時沿原型鏈讀屬性會執行不可偵測 Proxy 之陷阱**: `markDropped` 擴充跨 realm 時改為走原型鏈找 constructor,語料 A10(`Object.create(new Proxy({}, { getPrototypeOf }))`)於無 util 環境即紅——兩環境都跑語料才抓得到;無 util 時只看值自身與其直接原型(原碼即只讀到這一層).
- **跨 realm 之內建函數以原始碼辨識**: `Function.prototype.toString.call(f)` 之 `function Promise() { [native code] }`、`function get [Symbol.species]() { [native code] }`(各內建之 species getter 原始碼相同,皆回傳 this);bound function 與 Proxy 之原始碼無名稱,class 為 `class X …`,故不會誤認.
- **Node 對不存在(或為檔案)之 cwd 一律經 `'error'` 事件回 ENOENT**(Windows,spawn/exec/execFile 三模式實測),同步 catch 不會遇到;`execSpawnError(err, { cwd })` 於兩路皆傳屬防禦(變異於同步路徑必存活,列等價).
- **變異使計時器永不停止時受測 mocha 不退出**: debounce 之「cancel 不清計時器」變異讓 mocha 寫完報告後掛住,`spawnSync` 等到逾時;變異執行器一律加 `--exit`(只看成敗,不影響判定).中途重啟取鎖鏈時,以 taskkill /T 殺自己之鏈並 `--release-stale` 回收鎖.
- **守門擋下合併指令中之一段即整條不執行**: `echo x > f; nohup bash chain.sh &` 因 echo 寫檔被擋,nohup 亦未執行;啟動背景鏈後須另行確認(看 log 或行程).
- **`monitorEventLoopDelay` 之樣本數依行程存活時間**: 數百毫秒即結束之 mocha 可能 `count` 為 0(探測檔仍寫出);負載執行器之測試只斷言探測檔存在.
- **測試負載執行器本身**: 受測之 mocha 夾具須於有限時間內自行結束(掛住之計時器 20 秒後自清),否則「不終止行程樹」類變異會留下孤兒行程;以「離開碼非 0 且行程已不存在」區分被終止與自行結束.「guard 不帶 NODE_OPTIONS」之測試須以帶 NODE_OPTIONS 之環境啟動 loadTrial 本身,否則變異存活(L7).
- **以 then 之品牌檢查判型之成本**: 對非 Promise 每次建 TypeError,10 萬個一般值約 296ms(instanceof 約 0.4ms);原始值先早退、`util.types.isPromise` 可用時先預檢.品牌判定「改寫 then 後仍用載入時之內建」須有改寫 then 之測試,否則改成呼叫時取 then 之變異存活(P4).
- **樣本須涵蓋各分類判準之單獨成立**: conns 之「含 `://` 或 `@`」樣本中含 `://` 者皆含 `@`,使「只認 @」之變異存活;補只有 `://`(`redis://…?token=`、`sqlite:///…`)之樣本.
- **子代理(sonnet)讀碼審查**於全套已綠後仍找到 8 條(中 3: 無 util 之多餘陷阱、兩個測試缺口;低 5),其中效能退化與「無 util 多一次取原型」為我自己於本輪引入——擴充判定時要以「比修前多執行了哪些使用端程式/多花多少成本」對照 HEAD.

## 診斷通報輪(2026-10-31,主控任務 20261031121854,排程第 212、207① 項)

- **同類掃描要掃「複製出來之程式」**: 建議書只列 evEmit 與 debounce,Grep `m.func catch`/`func is not a function` 即發現 `pmDebounce` 有逐字相同之兩站點(複製來之碼),一併修;全庫 `console.(log|error)(` 非註解站點共 87 處(修後 81),其中印捕獲之錯誤值 26 處未動、列待裁示.盤點用 `grep -vE ":[0-9]+:[[:space:]]*(\*|//)"` 濾掉 JSDoc 與註解行,否則數千行範例噪音.
- **getDiag 之細節遮罩無秘密宣告時仍會遮 `token=值`**: `maskDiagCopy` 之通用規則(憑證鍵名之值、`key=值` 樣式、網址帳密、Bearer)在 wsemi 自身(無 secrets)之 logDetail 輸出仍生效,測試以 `Error('token=SENT')` 斷言細節含原訊息即紅(實得 `token=***`);細節測試用之拋出值訊息須用非憑證樣式(`user-SENT`),另以 `token=SENT` 單獨驗遮罩.
- **寫檔工具會把原始碼內之 ` `、` ` 轉成原字元**(第 3 次遇到,前兩次 2026-10-06、10-10 見索引): 正規式字元類內出現原字元即 SyntaxError.改用 Unicode 屬性類別 `/[\p{Cc}\p{Cf}\p{Zl}\p{Zp}]/u`(專案已有先例 `_ormMsgClean.mjs`),或以 `String.fromCharCode(0x2028)` 組入;`Edit` 之 old_string 內寫 ` ` 亦會被轉成原字元而恰好比對得到檔內之原字元(要修時可用).寫完以 `Grep '[\x{2028}\x{2029}]'` 回驗檔內無原字元.
- **拋出值之安全輸出文法**: 鍵名需濾 Cc(C0、DEL、C1)、Cf(雙向覆寫 U+202A~E、U+2066~9、零寬、BOM、軟連字號)、Zl、Zp——只濾換行與 C0 會被 U+202E 重排 log 行(獨立審查指出,改用屬性類別後以語料 H07 鎖定).字串之長度不輸出(可能反映秘密長度),二進位 byteLength 與陣列 length 輸出(診斷空內容所需)——取捨寫入 JSDoc.
- **測試之隨機產生器須驗分支命中**: `seed * 1103515245 % 2^31` 超過 2^53 後低位被浮點捨去,20 個分支只命中 9 個而測試仍綠(名實不符);改 `Math.imul(seed, 1664525) + 1013904223 >>> 0` 取高位元,並斷言各分支與各輸出種類皆至少出現一次.
- **表驅動站點測試之同步方式**: 輸出(console 接管與 funLog)寫入同一紀錄器,測試等「第 N 筆輸出」(防懸置用載入時保存之真實計時器);debounce 系於假時鐘內 `advance(60)` 後再等輸出(輸出在 `.then` 微任務,advance 每步讓出 setImmediate 已足);evEmitDelay 為真實 1ms 計時器,以輸出事件同步.否定斷言(console 0 筆)在 funLog 態成立之理由: 同一次 diag 呼叫於 funLog 與 console 間二擇一,funLog 之紀錄抵達時 console 分支必已不會再執行.
- **debounce/pmDebounce 之 async reject 站點會執行拒絕值之 `reason` getter**(既有之 `pm2resolve`/`pmConvertResolve`,非診斷出口): 敵意值測試 `hit===0` 於此兩站點不涵蓋 reason,註記於 `diagSiteKit.mjs`.
- **變異腳本之 from 字串須唯一**: JSDoc 與程式內常有同樣字樣(`'[wsemi debounce] task threw'` 在說明文與程式各一),`BADFROM(count=2)` 時改帶 `diag(` 前綴;刪除一行 `add(...)` 時小心連換行一併刪掉(與下一行黏成一行致 SyntaxError,整批變異作廢重跑).
- **sonnet 子代理唯讀審查**(約 14 分鐘): 實質有用之 3 條(tag 讀三次、雙向字元、隨機產生器退化)為我自己引入或遺漏;「建議」中之內部呼叫端(cache、alive 等)無法透傳 logDetail/funLog、`getDiag.readOpt` 讀繼承屬性(`Object.prototype.logDetail=true` 會開細節)屬既有設計,列待裁示.審查者之探測腳本放 `tmp/wsemi/review/`,結束後須回驗其已清理.

## 專用判斷函數 isenum／iseint 與 preciseNum 精度(2026-10-31,主控任務 20261031121854,wsemieff)

- **規格 regex 若有可選量詞相鄰須驗回溯**: dspec 原式 `\d+\.?\d*` 於「長串數字＋非法字元」為 O(n²)(`\d+` 與 `\d*` 可互換位置),50000 位約數秒;改無歧義寫法 `\d+(\.\d*)?` 為線性.測試以 50000 位字串＋時間門檻(< 250ms)鎖定,並用「改回規格原式」之變異驗證抓得到;不要用 20 萬位(變異跑法會卡數十秒).
- **新增 `is*.mjs` 會自動進 R-WRAPPER-01 全表**: `test/tools/wrapperCases.mjs` 以 readdir 取 `src/is*.mjs` 並要求「f(p) 與 f(Object(p)) 之差異只容許帳本列出之格」,全套才抓到(單測 3 檔全綠).新增判斷函數(尤其不拆包者)須先預期全表差異格,補於 `rule3Cells` 與 `rulebook_data.md` R-WRAPPER-01 規則 4.判準: 新增 `src/is*.mjs` 後先跑 `npx mocha --no-parallel test/isstr.test.mjs --grep "全表"`.
- **邊界測試用 nextUp／nextDown(Float64Array＋BigInt64Array 加減 1)取「下一個可表示之數」**: 「上界外一步」「下界外一步」才能逐 use 精確鎖定;注意端點 ±0.5 在 2^52 以上會被捨入為整數(`-9007199254740991 + 0.5` 為 `-9007199254740990`),非整數測試值改取區間中點＋0.5.
- **變異執行器之 find 字串須指向程式碼而非 JSDoc**: `toSignificantDigits(15)` 在 JSDoc 與程式各出現一次,`String.replace` 只換第一個(JSDoc),變異未改到程式碼而「存活」;改帶程式碼前後文(`v.trim() : v).toSignificantDigits(15)`).存活變異先查「是否真的改到碼」再補測試.
- **存活變異之分類**: ①等價(結果相同,以隨機字串對原版逐筆比對 0 差異證明;`tmp/wsemieff/equiv.mjs`);②受真表限制而存活(真表無 `lt`,`use` 合併 `lt` 之分支無從觸發)→ 補直測共用解析之測試檔,以自訂宣告表覆蓋各鍵;③比較時自動型別轉換使「未轉換」不可見(`5 >= '5'`)→ 斷言解析結果 `typeof` 為 number.
- **no-self-compare**: `n === n`／`n !== n` 判 NaN 被 eslint 擋,改 `Number.isNaN(n)`(V8 內聯,效能無差,已回測).測試中刻意用 `new Number`、改 `Number.prototype.valueOf`、解析時失精度之字面值,於檔頭 `/* eslint-disable no-extend-native, no-new-wrappers, no-loss-of-precision -- 理由 */`(專案有先例 `cvOrmFind.test.mjs`).
- **decimal.js 不接受前後空白**(`new Decimal(' 5 ')` 拋 `[DecimalError]`),但接受 `'0x10'`、`'0b11'`、`'5.'`、`'.5'`、`'+5.5'`;`preciseNum` 對字串先 `trim()`.對 30 萬隨機字串(`isnum` 為 true 者 21724 個)呼叫無非預期例外.
- **改前後代表性輸出快照**: `tmp/wsemieff/snap.mjs` 輸出 JSON,改前跑一次、改後再跑,`snapdiff.mjs` 分類差異;HEAD 副本以 `git archive HEAD src | tar -x -C ./tmp/wsemieff/head` 取得(node_modules 由祖先目錄解析),供新舊並列呼叫(`estimateTicks` 小量級探測).
- **子代理(sonnet)盤點 217 站點**約 12 分鐘、約 31 萬 token: 輸出可用(逐站讀上下文、列風險代號),抽查 7 列行號與內容相符;其「待確認 42」多為 Infinity 當「無上限」之語意反轉,屬改用前須主控裁示之項目.
- **守門**: 在 Bash 用 `cd`、heredoc 會被擋(訊息 `[主控守門 …]`),不執行亦無副作用;一律絕對路徑、Write 工具寫腳本.
- **規格會在執行中途被更新,收尾前須再核對規格檔時間與全文**: 本輪 13:35 讀 dspec,13:57 使用者指示 `isenum`／`iseint` 之 opt 非預期改「視為未給、改用預設」並新增 `opt.debug`／`funLog` 警告(原為 throw),我至 14:20 才因子代理審查之引用行號與我所讀不同而察覺,已寫完之 throw 版(碼、600 案、變異、帳本)須重做.判準: 實作前記下規格檔 mtime(`ls -la --time-style=full-iso`),完成前與每次派獨立審查前核對;派審查者讀規格時其行號即為偵測訊號.
- **獨立審查(sonnet 子代理,15 分鐘)發現的非規格項**: ①`preciseNum` 改 `new Decimal(v)` 使包裝物件(`isnum` 放行)由可運作變拋 `[DecimalError]`(原 `v * multiplier` 自動轉型)——改用 Decimal/BigInt 這類不自動轉型的庫時,逐一盤點呼叫端放行的型別(包裝物件、跨 realm、帶空白字串);②`judge` 之容差語意由絕對 1e-9 改為相對 15 位有效數字〔後經使用者改定 12 位,見下〕,屬行為變更須入破壞性變更與 JSDoc.審查者的 Write 工具曾拒寫其報告檔(要求直接回覆),結果以回覆文字取得.
- **變異執行器要處理 CRLF**: 專案檔為 CRLF,多行錨點(`\n`)對 CRLF 檔比不到而 `NOT-APPLIED`;執行器讀檔後 `replace(/\r\n/g, '\n')` 再比對與寫出(測試以 LF 檔執行無妨).錨點仍須指向程式碼(`console.warn(msg)` 在檔頭註解也出現一次,取第一個即改到註解而「存活」).
- **等價變異的辨識**: 比較運算自動轉型使「界值不 `Number()`」不可見(`Math.max('5', -Infinity)` 即回 number);快路徑 regex 少一個選項僅改變走哪條路徑(結果相同).以隨機差分對原版 0 差異證明.
- **preciseNum 有效位數 15→12(wsemieff2,2026-10-31,使用者改定)**: ①位數以具名常數 `PRECISE_DIGITS` 一處定義,變異錨點取 `const PRECISE_DIGITS = 12` 與 `toSignificantDigits(PRECISE_DIGITS)` 兩行(位數改 15／11／13／10／14 各一項);JSDoc、測試註解、帳本中的「N 位」字樣須同步,收尾用 `Grep '15 ?位有效|第 ?15 ?位'` 掃 `src`、`test`、`sgud`(經驗檔歷史紀錄除外).②**隨機成對差分的改變率取決於產生器的相對差距分布,不可單獨拿來比較位數方案**: 審查者產生器令相對差距均勻分布於 10^-0.5~10^-19.5,舊版 `eps` 對一般 17 位浮點等同精確比較,故 15 位只波及 3 個 decade(3.8%)、12 位波及 5 個(13.7%),二者的改變皆為相對差距小於位數界限之浮點雜訊級配對(`===` 全為「不等→相等」);另須配「容差曲線」(短小數 x 與 x ± 10^-e 之 `===` 比例,依 |x| 量級分組)、「累積誤差對精確和之 `===`」(以 decimal.js 精確和為真值)、「常見資料成對」三種視角才能判斷.③**舊版 `eps = 1e-9` 近似與量級無關之絕對容差**(e=10 約 3~21%、e=11 約 21~48%、e=14 為 100% 判相等),12 位為相對容差: |x|≥1000 較寬、|x|<1 較嚴(`1 + 1e-11 === 1` 由 true 變 false);dspec 稱「對常見量級與舊版同級」僅在 |x| 約 10~1000 成立,已入帳本,下游深度比較(w-geo,量級 1~1000)落在可接受區.④**非整數大量級的整數位亦被捨入**(`preciseNum(123456789012345.6)` 得 `'123456789012000'`),而整數走原樣路徑(`1.23456789012345e20` 得 `'123456789012345000000'`),二者處理不同(JSDoc 限制 3).⑤手算小數位數易錯(`3.2123456789e-20` 為 11 位有效數字、小數位數 30,非 31),斷言應以推導式(首位位置＋有效數字數－1)核對修後碼的輸出,而非為了通過改斷言.⑥修前紅的做法: 改碼前先把新案跑在現行(15 位)碼上存證,再改 src;變異執行器 `tmp/wsemieff2/mutate.mjs` 沿用「複製 src 與測試到 `./tmp/…/mut/` 後逐一改寫」之作法.⑦Edit 工具對 CRLF 檔寫入多行字串時保留 CRLF(改後 `grep -c $'\r'` 與行數相等),不需特別處理.
