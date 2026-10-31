# 規則帳本(判斷類專用函數 isenum／iseint、preciseNum 精度,及既有函數改用 isenum／iseint 第一批)

本檔記計算類函數判定「數字／整數參數」所用之專用判斷函數 `isenum`、`iseint` 之規則,以及 `preciseNum` 之精度規則,及排程第 221 項第一批(24 函數改用,R-ENUM-CALLERS-01).規格為主控 dspec〈輸入參數之檢測機制〉§7.1(單一來源;使用者 2026-10-31 指示)、§7.2、§3.1、K3(opt 非預期之輸入視為未給、`opt.debug` 警告)、K6、§5.3 C2、§6 V20.全部條目之索引見 `sgud/rule/rulebook.md`〈索引〉.

**規格於 wsemieff 執行中途更新**(dspec 檔案時間 2026-10-31 13:57:48,晚於派工單與實作起點):`isenum`／`iseint` 之 opt 非預期輸入原為「throw」,改為「視為未給、改用預設、不拋錯」,並新增 `opt.debug`／`opt.funLog` 警告.本檔依更新後之規格;原 throw 版之碼與測試保存於主控任務 `agent-out/wsemieff-evidence/throw-version/`(供回復).

## R-ENUM-01 計算類函數判定數字／整數參數一律經 `isenum`／`iseint`(單一擁有者、專用判斷、範圍表單一來源、opt 非預期視為未給)

### 背景與關係

- `isnum`、`isint`、`ispint`、`isp0int` 屬**定義上**之判斷(`isnum(Infinity)`、`isnum('0x10')`、`isint(Infinity)`、`isint(2 ** 60)`、包裝物件皆為 true),**行為不改**(JSDoc 各補一句指向 `isenum`／`iseint`);計算類函數判定參數須用專用函數,不得用 `isnum`／`isint`、`cdbl`／`cint`(非數字回 0)、`parseFloat`／`parseInt`、`Number(v)`／`+v` 直接轉、全域 `isNaN`(dspec §7.2).
- 本輪(2026-10-31,主控任務 20261031121854,wsemieff)只新增兩函數與範圍表;既有函數之改用(排程第 221 項)與其他判斷函數之重定義**不在本輪**,站點全集見 `sgud/rule/rulebook_judge_sites.md`.

### 規則

1. **判斷類**:`isenum(v, opt)`、`iseint(v, opt)` 只回布林、不轉換;對被檢測值 `v` 永不拋錯、不呼叫 `v` 之任何方法(`valueOf`、`toString`、`Symbol.toPrimitive`、存取器、Proxy 陷阱)、包裝物件不解包(`typeof` 為 `object`／`function` 者一律 false;**為 R-WRAPPER-01 規則 4 之明列例外**——該規則之 `isnum` 族對包裝物件拆包,這兩個專用函數不拆,`test/isstr.test.mjs` 全表與 `test/tools/wrapperCases.mjs` 增 15 格);`String.prototype.valueOf`／`Number.prototype.valueOf` 被改寫不影響結果(原始值路徑不經 `valueOf`).
2. **有效數字(`isenum`)**:原始 number 且有限;或原始字串,去頭尾空白(`String.prototype.trim`,與 `Number()` 同一空白集合)後符合 `^[+-]?(\d+(\.\d*)?|\.\d+)([eE][+-]?\d+)?$`,轉換後有限,且未下溢(轉換後為 0 而尾數含非零數字者).取值一律 `Number(…)`.**regex 與規格原式(`\d+\.?\d*`)等價但無歧義**:規格式於長串數字後接非法字元時為 O(n²) 回溯(50000 位約數秒),改為 `\d+(\.\d*)?`(線性);測試 `E4b` 以 50000 位字串 < 250ms 鎖定.
3. **有效整數(`iseint`)**:`isenum` 為底(字串路徑呼叫 `isenum`),數字用 `Number.isSafeInteger`,字串轉換後須為安全整數且**有效數字比對**相同(去指數、去小數點、去尾零、去正負號與前導零後,輸入與 `String(轉換值)` 之有效數字序列相同;比照 Joi `lib/types/number.js` 之 `extractSignificantDigits`);**15 位以內之純數字字串**(`^[+-]?\d{1,15}$`)走快路徑直接判定.BigInt 一律 false.不用 `cdbl`、lodash `toFinite`／`toInteger`、decimal.js.
4. **opt 之非預期輸入視為未給、改用預設,一律不拋錯**(dspec K3、§7.1,使用者 2026-10-31:「isenum／iseint 自己的 opt 也是給預設」):
   - `undefined`／`null` 視為未給(最快路徑,不配置物件);其餘須為**一般物件**(原型為 `Object.prototype`〔任一領域〕或 null),否則(陣列、類別實例、包裝物件、Date、Map、函式、數字、字串、Symbol、BigInt、讀取拋錯之 Proxy、已撤銷之 Proxy)**整份視為 `{}`**——即使帶有宣告鍵之自有屬性亦不讀取;故 `['1', 'a'].filter(isenum)` 可用(索引被視為未給).
   - 已宣告之鍵(`use`、`min`、`max`、`gt`〔僅 isenum〕、`lt`〔僅 isenum〕、`debug`、`funLog`)為 `undefined`／`null` 視為未給;每鍵只讀一次(V11),讀取拋錯(存取器)視為該鍵無效.
   - `use` 非表內字串(含 `constructor`、`__proto__`、`String` 物件、isenum 與 iseint 之 use 互換):視為未給(isenum 不限定範圍;iseint 改用預設 `'safe'`);`min`／`max`／`gt`／`lt` 非有效數字(`iseint` 為安全整數;界值可為數字字串,轉換後比較):該鍵視為未給;含未宣告之鍵(如誤拼之 `minExlusive`;`iseint` 無 `gt`／`lt`)忽略.
   - **範圍為空**(明確給定之界值本身為空,如 `min > max`、`gt >= lt`、`min >= lt`、`gt >= max`;**或與 `use` 取交集後為空**,如 `{ use: 'ratio', min: 2 }`、`{ use: 'byte', min: 300 }`):**明確給定之 `min`／`max`／`gt`／`lt` 皆視為未給,`use` 保留**(單點 `[5, 5]` 合法).此為本輪對規格「範圍為空(…;相關鍵皆視為未給)」之詮釋(見〈待裁示〉).
5. **`opt.debug`／`opt.funLog` 警告**(dspec K3):`opt.debug === true`(非布林視為 false)時,非預期之輸入另輸出警告;出口為 `opt.funLog`(函數,以 `(msg, { fn, reason, key })` 呼叫),未給或非函數則 `console.warn(msg)`;**出口拋錯一律忽略**.警告為**固定詞彙,只含函數名、鍵名〔僅 ≤32 字之短識別字,否則省略〕、種類描述與所採之預設,不含傳入之值**(V20、K9),如 `[wsemi iseint] invalid opt.use: must be one of 'safe', …, using default 'safe'`、`[wsemi isenum] invalid opt.min: must be a valid number, ignored`、`invalid opt: range is empty, min/max/gt/lt ignored`、`invalid opt.minExlusive: unknown option, ignored`、`invalid opt.min: cannot be read, ignored`.**同一函數、同一原因、同一鍵每個行程只警告一次**(逐筆呼叫不洗版;去重表上限 256 筆,滿了即不再警告;`resetWarned()` 供測試).opt 本身非一般物件時讀不到 `debug`,故不警告.
6. **範圍表單一來源 `src/_numRange.mjs`**:`ENUM_USE`(`positive` >0、`nonnegative` >=0、`timer` 0~TIMER_TIME_MAX、`ratio` 0~1、`percent` 0~100)、`EINT_USE`(`safe`〔預設〕、`count`、`index`、`timer`、`port` 1~65535、`byte`、`int32`、`uint32`、`digits` 0~100、`radix` 2~36、`year` 0~9999、`timestamp`);凍結之無原型物件;計時上限取自 `src/_const.mjs` 之 `TIMER_TIME_MAX`,**不另寫數字**(測試 `test/_numRange.test.mjs` 鎖定各 use 之上下界與「timer 行引用 `cst.TIMER_TIME_MAX`」之原始碼檢查).日後 §7 單值檢測產生訊息亦讀此檔.
7. **opt 解析單一擁有者 `src/_numOpt.mjs`**(`parseNumOpt(opt, spec)`,宣告表 `spec`:函數名、宣告鍵、use 表與名稱、預設 use、界值檢測與描述、界值鍵訊息):兩函數共用,回 `{ min, max, gt, lt }`(含端點／不含端點,未限制者 ±Infinity,一律 number,每次新物件);`use` 與明確界值取**交集**(各界取較嚴者),不放寬;不改寫呼叫端之 opt(V9).
8. **效能**:未給 opt 之路徑不配置物件;實測(Node v24.22.1,100 萬次逐筆呼叫,2026-10-31)見〈效能〉.
9. **JSDoc**(使用者指示):`isenum`、`iseint`、`preciseNum` 寫明範疇(判斷類、只回布林、不轉換、何謂有效數字／有效整數、與 `isnum`／`isint` 之差異)、用法(計算類入口判定、取值為去頭尾空白後 `Number(…)`、各 `use` 與 `min`／`max`／`gt`／`lt` 之例、opt 非預期之處置與 `debug`)、**必然之限制**(dspec §7.1〈兩函數共通〉①～⑤:字面值解析時已捨去之精度、超過約 17 位有效數字依 IEEE 754 捨入、浮點誤差不加容差、前導零依值判定、不收千分位／全形／Unicode 減號／十六進位／包裝物件).
10. 把 `isenum`／`iseint` 本身當回調傳給 `filter`／`every`／`some` 時,索引被視為未給(不拋錯);慣例仍建議包成 `(v) => isenum(v)`.

### 盤點指令(站點全集)

- 計算類站點(`isnum(`／`isint(`／`ispint(`／`isp0int(` 判定後即做數值運算、計時毫秒、埠號、索引、個數、位數):
  `Grep pattern='\b(isnum|isint|ispint|isp0int)\(' path=src glob='!{index,isnum,isint,ispint,isp0int,isenum,iseint}.mjs' output_mode=count`(2026-10-31:127 檔、220 行)
- **站點全集與建議之 use 見 `sgud/rule/rulebook_judge_sites.md`**(排程第 221 項之輸入;2026-10-31 逐站讀上下文盤點,抽查 7 列相符):站點 217(Grep 216 行、125 檔,另補回調型 1),**符合 191**(建議改 140、待確認 42、建議保留 9),不符合 26(註解、型別分流、鍵名守門、判斷類函數本身、verifyValue 之型別名對應);分節:計時毫秒 30、埠號 1、索引／位置／切片 8、個數／長度／次數 51、位元／進位／位數／年份／時間戳 13、一般數值運算 88.**規格更新後須留意**: ①盤點當時 opt 無效為 throw,現為改用預設;②K3〈超出範圍亦同〉:計時「夾至 `TIMER_TIME_MAX`」改為「超過者改用預設」,故計時站點依規格宜採 `use: 'timer'`(該檔之「式 B」),「式 A」(保留 `Math.min`)僅為行為最接近之備案.
- 只引用不改:本輪未改任何既有函數之判定;下游 `w-geo` 之 `judge` 站點見 R-PRECISE-01.

### 測試

- `test/isenum.test.mjs`、`test/iseint.test.mjs`、`test/_numRange.test.mjs`、`test/_numOpt.test.mjs`、共用輔助 `test/tools/numOptKit.mjs`;述語編號 E1~E11、I1~I11 見各檔檔頭(E7／I8: opt 非預期視為未給之等效表〔給之 opt 與等效 opt 對 30 餘個探測值逐一同結果〕;E8／I9: debug 警告)
- 案數(2026-10-31): 694(`isenum` / `iseint` / `_numRange` / `_numOpt` 四檔);全套 `npm test` 19079 passing、5 pending、0 failing.
- 單檔指令: `npx mocha --no-parallel test/isenum.test.mjs test/iseint.test.mjs test/_numRange.test.mjs test/_numOpt.test.mjs --timeout 60000`.

### 已知限制

- 數字字面值於解析時已捨去之精度無從得知(`4503599627370496.5` 寫在程式中即為整數,`iseint` 為 true).
- `isenum` 之字串超過約 17 位有效數字者依 IEEE 754 捨入,不視為無效(只擋下溢);要求精度無損者用 `iseint`(只限整數).
- 浮點運算誤差不加容差(`isenum(0.1 + 0.2, { max: 0.3 })` 為 false);須容差之比較用 `judge`.
- 前導零(`'007'`)依值判定;以前導零為意義之編號應以字串類判定.
- 不收千分位、底線、全形數字、Unicode 減號、十六進位／二進位／八進位、`'Infinity'`、`'NaN'`、包裝物件、BigInt;空字串、純空白、`'-'`、`'NP'` 等標記字串為 false(廣義數字 N1 之判斷函數於後續輪新增).
- `-0` 與 `'-0'` 視為 0(有效),函數不轉換故不區分.
- `opt` 之解析每次呼叫都做(不快取,因 opt 可變);給 opt 之路徑每次約 +50~120 ns(見〈效能〉),逐元素檢測之計算類函數宜在迴圈外建立一次 opt 物件.
- 警告中的鍵名(僅短識別字)為程式側之名稱;**不得以秘密當 opt 之鍵名**.去重表為行程內狀態(上限 256),同一行程內不同 `funLog` 不重複收到同一則警告.

### 效能(2026-10-31,wsemieff,`tmp/wsemieff/perf.mjs`,100 萬次逐筆呼叫,中位數)

| 輸入 | `isnum` | `isint` | `isenum(v)` | `iseint(v)` | `isenum(v,{use:'nonnegative'})` | `iseint(v,{use:'count'})` | `iseint(v,{use:'port',min:1024})` |
|---|---|---|---|---|---|---|---|
| 數字(含小數) | 13.4 ms | 75.7 ms | **5.5 ms** | **5.6 ms** | 59.7 ms | 73.9 ms | 98.1 ms |
| 整數字串 | 19.1 ms | 153.7 ms | 23.6 ms | 24.8 ms | 98.3 ms | 107.3 ms | 131.9 ms |
| 小數＋指數字串 | 43.8 ms | 257.8 ms | 61.4 ms | 119.0 ms | 146.0 ms | 217.1 ms | 234.6 ms |
| 混合(含無效) | 24.7 ms | 110.2 ms | 18.5 ms | 21.4 ms | 96.7 ms | 103.1 ms | 126.8 ms |

(未給 opt 之路徑與 `isnum` 同量級、遠快於 `isint`;給 opt 時每次呼叫多一次 opt 解析與一個小物件,約每次 +50~120 ns;opt 為每次呼叫新建之字面物件與共用同一物件相差無幾.規格新增 `debug`／`funLog` 鍵後效能與 throw 版相同量級.)

### 變異(2026-10-31)

- **181 項,擊殺 178,存活 3 皆為等價**(以隨機輸入對原版逐筆比對 0 差異證明,`tmp/wsemieff/equiv.mjs`:`I16`〔快路徑 regex 漏正負號,僅影響走哪條路徑〕、`I19`〔零值比對 `''` 與 `sigDigits('0')` 皆為空字串〕共 60 萬隨機字串＋15 個邊界字串 0 差異;`O26`〔界值不 `Number()`,後續 `Math.max`／`Math.min` 與比較自動轉型〕40 萬組隨機 `v`／opt〔數字、數字字串、含空白、科學記號、無效字串、undefined〕0 差異).
- 分類: `isenum` 31(改用 `isnum`、數字不查有限、格式檢查拿掉、包裝物件、下溢、`gt`／`lt`／`min`／`max` 邊界差一、宣告鍵漏 `gt`／`debug`／`funLog`、函數名錯等)、`_numOpt` 47(未宣告鍵不略過、一般物件檢查拿掉／放寬、範圍為空檢查拿掉／差一／漏端點排除、空範圍只丟部分鍵、`use` 覆蓋而非交集〔4 鍵〕與取較寬〔4 鍵〕、null／undefined 不視為未給、getter 拋錯外拋、`debug` 改 truthy／恆 true、`funLog` 收非函數、去重拿掉／鍵不含函數名／不含鍵名、上限拿掉／差一、出口拋錯不吞、警告含值、鍵名一律回顯、預設改 `console.log` 等)、`iseint` 26(拿掉有效數字比對、改 `Number.isInteger`、快路徑放寬為 16 位、比對漏尾零／前導零／指數／小數點、拿掉 `isenum` 閘門、BigInt／包裝物件通過、預設 use 為 null 等)、`_numRange` 68(每個 `use` 之 `min`／`max`／`gt` ±1 共 64 項、計時上限寫死、表改為有原型物件／不凍結共 4 項)、`preciseNum` 9(有效位數 14／16、不去空白、拿掉整數路徑、`toString` 指數記號、`returnDigit` 固定 1、回到固定 eps〔HEAD 版〕、小數值歸零、包裝物件不轉)。
- 執行器 `tmp/wsemieff/mutate.mjs`(不入庫;於 `./tmp/wsemieff/mut/` 複製 `src`／測試後逐項套用;CRLF 檔先轉 LF 比對).歷程: 首版(throw 設計)153 項擊殺 151;規格更新重做後首輪 181 項存活 5、未套用 1〔存活: `O38` 錨點誤中檔頭註解、`I14` 缺 iseint 無效 v 仍警告之案、`O26`／`I16`／`I19` 等價;未套用: `P08` 因 CRLF 錨點比不到〕,補案與修執行器後如上.

### 待裁示／自行決定之事項

- **「範圍為空」之詮釋**(規格寫「範圍為空(如 `min > max`、`gt >= lt`;相關鍵皆視為未給)」,未明言與 `use` 之交集與「相關鍵」之範圍):本輪取「含 `use` 交集之有效範圍為空時,明確給定之 `min`／`max`／`gt`／`lt` 全部視為未給、`use` 保留」.若主控另有定(例如只丟衝突之成對鍵、或交集為空仍保留界值而恆 false),改 `_numOpt.mjs` 一處與 E7／I8 等效表.
- 界值(`min`／`max`／`gt`／`lt`)接受數字字串(`isenum`／`iseint` 判定,轉換後比較);規格未明言,依「以 `isenum` 判定」.
- 警告出口簽名 `funLog(msg, { fn, reason, key })`(規格只寫「交 `funLog`」);去重表上限 256(防呼叫端以大量不同鍵名撐大).
- regex 改無歧義等價式(規則 2);建議 dspec §3.1 之正規式字樣同步改.
- 規格中途更新(見檔首)導致 throw 版作廢;若使用者最終仍要 throw,以 evidence 之 throw 版回復.

## R-PRECISE-01 `preciseNum` 以 12 位有效數字取代固定 `eps = 1e-9`(排程第 218 項;位數由 15 改 12:使用者 2026-10-31 wsemieff2)

### 規則

0. **有效位數為 12**(使用者 2026-10-31「那依你建議改 12 位」;依據 dspec §7.1〈精度之處理〉末列與〈12 位之依據〉:15 位只吸收單次運算之雜訊〔第 16、17 位〕,累積誤差可達第 14 位,使 `judge` 對累積誤差之相等判定較舊版嚴格甚多——`0.1` 累加 1000 次 `=== 100` 由 true 變 false;12 位對常見量級與舊版同級、且為相對精度〔小數值不歸零〕).位數以 `src/preciseNum.mjs` 之具名常數 `PRECISE_DIGITS` 定義一處,不另散寫數字;JSDoc 與測試之位數字樣須與之同步(盤點指令: `Grep pattern='PRECISE_DIGITS|toSignificantDigits|[0-9]+位有效數字' path=src/preciseNum.mjs,src/judge.mjs,test/preciseNum.test.mjs,test/judge.test.mjs`).
1. 非整數(`isint` 為 false)改為 `new Decimal(v).toSignificantDigits(PRECISE_DIGITS)`(=12;數字字串先去頭尾空白由 decimal.js 直接解析;包裝物件先 `Number(v)` 轉原始數字——decimal.js 不接受物件,`isnum` 放行包裝物件,修前可運作,不可因此拋 `[DecimalError]`),字串為 `.toFixed()`(不含指數記號、不補尾零),`returnDigit` 為 `.decimalPlaces()`;移除 `eps = 1e-9` 之迴圈(`i = 1…16`).
2. 整數(`isint` 為 true)路徑**不變**(`cstr(v)`、位數 0),故超過 12 位之整數(含 `1.23456789012345e20`)、`1e21`(得 `'1e+21'`)、`Infinity`(得 `'Infinity'`)、`'0x10'`(得 `'0x10'`)、`'1.5e3'`(得 `'1.5e3'`)維持原狀;`isnum` 判定不變.
3. 小數值不再歸零:`preciseNum(1e-11)` 由 `'0.0'`(位數 1)變 `'0.00000000001'`(位數 11);`judge(1e-11, '>', 0)` 由 false 變 true、`judge(1e-11, '===', 0)` 由 true 變 false.
4. 輸出格式之細微變化(破壞性變更第 45 項):`preciseNum(1.23456789012)` 由 `'1.234567890120'`(補尾零、位數 12)變 `'1.23456789012'`(位數 11);`preciseNum(3772.9999999999995)` 由 `'3773.0'`(位數 1)變 `'3773'`(位數 0);超過 12 位有效數字者被捨入(`12345678.123456789` 由 `'12345678.12345679'` 變 `'12345678.1235'`;非整數之大量級 `123456789012345.6` 由 `'123456789012345.6'` 變 `'123456789012000'`〔整數位亦只留 12 位〕;帶空白之長字串 `' 0.35096605331636965 '` 由原樣回傳變 `'0.350966053316'`).
5. **`judge` 之容差語意改變**(JSDoc 已載): 預設 `withPreciseNum: true` 時兩數各取 12 位有效數字後精確比較,第 12 位內之差異可區分(`judge(1e-11, '>', 0)` 由 false 變 true;`judge(1 + 1e-11, '===', 1)` 由 true 變 false;`judge(1 + 1e-10, '===', 1)` 為 false),第 13 位起才不同者視為相等(`judge(1 + 1e-12, '===', 1)` 為 true;0.1 累加 1000 次得 `99.9999999999986`,`judge(s, '===', 100)` 為 true〔二者與舊版相同,15 位時為 false〕);為捨入後比較,相差極微而跨越第 12 位進位邊界者仍被區分(`judge(1.2345678901249, '===', 1.2345678901251)` 為 false).**為相對容差**: 舊版 `eps = 1e-9` 近似與量級無關之絕對容差,12 位者 |x| 約 1~10 吸收 1e-12 以內、10~1000 吸收約 1e-10~1e-11 以內、1000~1e5 吸收約 1e-9 以內、0.01~1 吸收約 1e-13 以內——|x|≥1000 較舊版寬鬆(`judge(5000.0000000005, '===', 5000)` 由 false 變 true)、|x|<1 較舊版嚴格.差分數據(wsemieff2,證據 `agent-out/wsemieff2-evidence/04-…`): 30 萬組隨機成對(相對差距均勻分布於 10^-0.5~10^-19.5)舊版→12 位 13.7% 改變〔15 位 3.8%〕,**全部相對差距小於 1e-11**,`===` 之改變皆為「不等→相等」(變寬)、「相等→不等」0 組;此比例反映產生器含大量浮點雜訊級配對,小數 1~6 位、差 1~5 個最後小數位之常見資料 20 萬組 0 組改變;浮點累加對精確和之 `===`(10 萬組)舊版 75.0%、15 位 49.9%、12 位 100% 判相等;小於 1e-9 之小數與 0 比,舊版判對 41.6%、12 位 100%.

### 站點全集

- `src` 內:`judge.mjs`(`preciseNum(x1)`、`preciseNum(x2)`)、`estimateTicks.mjs:250,302`(`returnDigit`).
- 下游(只列不改;`Grep pattern='\bjudge\(|\bpreciseNum\(' path=C:\opensrc glob='*.{mjs,js,vue,ts,cjs}'`,2026-10-31):**`w-geo` 10 檔** 皆 `import judge from 'wsemi/src/judge.mjs'`:`sepDepthStartEndByDepth`、`mergeByDepthStartEnd`、`groupByDepthStartEnd`、`checkDepthStartEnd`、`checkDepth`、`calcLayersByMerge`、`calcDepthStartEndByGroup`、`calcDepthStartEndByDepth`、`calcDepthStartEndByConnect`、`calcClassifyUscs`(`src/*.mjs`;另有暫存檔 `_temp1/calcLayersByCompress2.mjs` 不計);無任何套件直接使用 `preciseNum`;其餘 `judge` 命中(w-pksupdate、w-serv-hapi、w-web-perm、w-knowledge-extract)為各自同名之自有函數,無關.w-geo 影響:深度等值比較(`===`、`>=`)原對累積浮點誤差(約 1e-12 量級)寬容者,現須落在第 12 位有效數字之外(第 13 位起)才視為相等;|x| 約 1~10 者容差由舊版近似 1e-10~1e-11 之絕對容差變為約 1e-12 之相對容差(較嚴),|x| 於 1000 以上者較寬(見規則 5).

### 測試

- **12 位改定輪(wsemieff2,2026-10-31)**: `test/preciseNum.test.mjs`(位數字樣 15→12;新增第 12/13 位邊界〔含進位邊界〕、`0.1` 累加 1000 次得 `'100'`、`1 + 1e-12`／`1 + 1e-11`／`1 + 1e-10`、小量級 `3.2e-10` 與大量級〔整數路徑與非整數〕共新增 4 案,相對 HEAD 累計新增 22 案,現共 45 案)、`test/judge.test.mjs`(位數字樣 15→12;累積誤差案改寫為「相等」;新增 `1 + 1e-12/1e-11/1e-10` 與量級〔含進位邊界〕共 2 案,相對 HEAD 累計新增 9 案,現共 25 案);對 15 位碼跑新案 **10 failing**(修前紅,證據 `agent-out/wsemieff2-evidence/01-…`)→ 12 位碼 102 passing(含 `estimateTicks`);變異 15 項(位數改 15／11／13／10／14、恢復 `eps`〔HEAD 整檔〕、不取有效數字、捨入模式 ROUND_DOWN／ROUND_UP、整數路徑也取有效數字、位數取 precision、改 toString、`judge` 不轉／只轉單邊)全擊殺(證據 03).以下為 15 位輪之紀錄(位數字樣以規則 0 為準).
- (15 位輪)`test/preciseNum.test.mjs`(新增 18 案:小數值保留、位數、有效位數捨入、字串型數字、整數路徑不變、浮點誤差、包裝物件、長字串、大量級)、`test/judge.test.mjs`(新增 7 案)、`test/estimateTicks.test.mjs`(既有全綠);修前紅:以既有碼跑新案(首批 14 failing,log 見主控任務 20261031121854 `agent-out/wsemieff-evidence/01-…`;包裝物件案為審查後補,對 HEAD 副本與修後碼皆通過;以變異 `P09`〔包裝物件不轉原始數字,即審查前第一版之行為〕證明新案抓得到);變異 `P01~P09` 全擊殺.
- 改前後代表性輸出比對(12 位,`tmp/wsemieff2/snap2.mjs`,同輸入產生器,HEAD 對工作樹):1084 個 `preciseNum` 輸入 91 筆不同〔15 位時 70 筆;歸零 5＋被 eps 吸成短小數 2、同值僅格式不同 22、捨入至 12 位 62〕,2328 個 `judge` 組合 0 筆不同,406 個 `estimateTicks` 輸入 5 筆不同(與 15 位時同 5 筆);下段為 15 位輪之紀錄。
- (15 位輪)改前後代表性輸出比對(`tmp/wsemieff/snap.mjs`,1084 個 `preciseNum` 輸入、2328 個 `judge` 組合、406 個 `estimateTicks` 輸入):`preciseNum` 70 筆不同(皆屬「eps 判位數不準」之同類:小於 1e-9 歸零、尾零、浮點誤差拖尾位數、超過 15 位之位數),`judge` 0 筆不同(隨機組合未涵蓋累積誤差/小量級配對,另以專案測試與審查者差分涵蓋),`estimateTicks` 5 筆不同(3 筆為 `rmin === rmax` 且為浮點誤差值者〔如 `7459999.999999999`〕`tickDig` 由 1 變 0、`tickInterval` 不變;2 筆為小於 1e-9 之量級:`estimateTicks(1e-11, 1e-11)` 之 `tickInterval` 由 0 變 `1e-12`,`estimateTicks(0, 1e-11)` 由 0.01 變 0.001〔主路徑本就與量級無關,見下〕).

### 已知限制／只列不修

- `estimateTicks` 於全距小於約 1e-9 之區間(如 `estimateTicks(0, 1e-8)`)主路徑本就給出與量級無關之間距(`tickInterval 0.001`),改前後相同,非本輪範圍;`rmin === rmax` 且量級小於 1e-9 者(如 `estimateTicks(3e-10, 3e-10)`)改前 `tickInterval` 為 0,改後為 `3e-11`(隨 `preciseNum` 修正而修正).
- `preciseNum` 超過 12 位有效數字者捨入至 12 位,第 13 位起才不同之兩值視為相等,無法也不應被辨識(試驗數據罕超過 10 位有效數字;JSDoc 必然之限制 1);捨入後比較,跨進位邊界者仍被區分.
- 整數與非整數之處理不同(整數路徑原樣、不經 12 位): `judge(123456789012345, '===', 123456789012346)` 為 false,而 `judge(123456789012345.6, '===', 123456789012345.7)` 為 true(JSDoc 必然之限制 3);非整數之大量級,整數位亦只留 12 位(`preciseNum(123456789012345.6)` 得 `'123456789012000'`).只列不修.
- (已於排程第 221 項第一批處理,見下 R-ENUM-CALLERS-01)`judge`／`preciseNum`／`estimateTicks` 原沿用 `isnum`(收 `Infinity`、`'0x10'`),三者已一致改用 `isenum`.

## R-ENUM-CALLERS-01 既有計算類函數之數字／整數判定改經 `isenum`／`iseint`(排程第 221 項第一批,wsemi221a,2026-10-31;使用者 2026-10-31 指示「先處理一、二、三」)

### 背景與範圍

- 使用者裁定(dspec §3.1 定案、§11):「定義上算數字」(`isnum`)與「可安全計算」(`isenum`)分開判斷;`isenum` 不收十六／八／二進位、`Infinity`;三角函數無效回 `null`,`round` 系列與格式化無效回 `''`(維持現行通道);「基於廣義數字之陣列,於計算處理時,非有效數字就是用該函數之預設值去計算(arrAdd 為 0、arrMulti 為 1)」「若沒法計算與回傳結果,那就報錯」.
- 本批只做三段:①無效處置不變只收緊界線(三角 9 函數、`round`／`ceil`／`floor`、`dig`／`digExp`／`cfinancial`／`cfilesize`);②計算函數無效仍 throw(`judge`、`preciseNum`、`estimateTicks`、`color`);③廣義數字陣列之計算(`arrAdd`、`arrMulti`、`arrMax`、`arrMin`).**其餘函數(`arrSort`、`arrFilterByNum`、`arrFilterByPnum`、`arrAccum`、`arrProduct`、`arrNorm`、`interp1`、`rang`、計時與個數類參數、`is*`、`c*`、`dig`／`digExp`／`cfinancial` 之 `idig`)一律不動**,待第四～七段.

### 規則

1. **判定**:24 函數之數字參數由 `isnum` 改 `isenum`、整數參數由 `isint`／`isp0int` 改 `iseint`;失敗通道**不變**(三角 → `null`;`round`／`ceil`／`floor`／格式化 → `''`;`judge`、`preciseNum`、`estimateTicks`、`color` → throw,訊息不改).
2. **取值即檢測之值(K4)**:判定通過後一律以去頭尾空白後之 `Number(…)` 取值,不再用 `cdbl`／`cint`.例外:以 decimal.js 為底之 `round`／`ceil`／`floor`／`judge`／`preciseNum` 對**字串**去頭尾空白後仍交 Decimal 直接解析(保留多餘位數,不經 `Number` 先捨入;如 `round('9.8349999999999999999', 2)` 為 9.83、`Number()` 後會是 9.84),原 `round(' 30 ')` 拋 `[DecimalError]`、`judge(' 30 ', …)` 拋 `[DecimalError]`、`preciseNum(' 30 ')` 回帶空白字串之缺陷隨之消除.
3. **`round`／`ceil`／`floor` 之 `idig`**:`iseint(idig, { use: 'digits' })`(0~100,數字或數字字串),非有效者**用預設 0**、不拋錯(使用者指定採 `digits` 而非 Decimal 上限 1e9;101 以上由可用改回 0).`dig`／`digExp`／`cfinancial` 之 `idig` 本批不動.
4. **`arrAdd`／`arrMulti`**:各位置元素以 `isenum` 判定,**凡非有效數字(標記字串、`null`、`undefined`、布林、`NaN`、`Infinity`、`'0x10'`、包裝物件…)一律以 0／1 計算**,不報錯、不略過;同位置兩者皆非有效數字時該位置為 0／1(舊版為 `null`);陣列容器之處置不變(少於 2 個、非陣列、長度不同 → `[]`).
5. **`arrMax`／`arrMin`**:只取 `isenum` 有效數字比較,其餘略過;**沒有任何有效數字(含空陣列)→ throw `invalid vall: must contain a valid number`**,**非陣列 → throw `invalid vall: must be an array`**(V19、V20:訊息不帶值);`opt.returnIndex`／`opt.compareKey` 之處置不變(`compareKey` 抽出之欄位值同樣依 `isenum`);判斷「沒有有效數字」用 `vRes === null`,不可用 `ind >= 0`(空陣列時 `arrReduce` 回 `null`,`null >= 0` 為 true).
6. **包裝物件不解包**(R-WRAPPER-01 規則 4 之延伸):`new Number(1.5)`、`new String('1.5')` 於上列函數一律為無效(`judge`／`preciseNum`／`estimateTicks` 由放行改 throw;三角回 `null`;`round` 系回 `''`;`color` 內之數值寫法亦然).
7. **`color`**:`strCvFromPercent`／`strCvFrom01`／`strParseHex8` 之數值判定 `isnum` → `isenum`;`spreadHue`／`spreadMonochromatic` 之 `num` `isint` → `iseint`(默認 `safe`).連帶修正:舊 `isint` 收 `Infinity`、`'Infinity'`、`'1e400'`(`cdbl` 後為 `Number.MAX_VALUE`),`for (i < num)` 不結束而**記憶體耗盡(離開碼 134)**,改後 `throw Error('num is not an integer')`.
8. **JSDoc**:24 函數之 `@param`／`@returns` 改寫為新判定(有效數字之定義、無效之處置);`arrAdd`／`arrMulti` 寫明預設值 0／1;`arrMax`／`arrMin` 寫明 throw;`atand`／`atan2d` 之 `Infinity` 範例改 `null`;`estimateTicks` 補必然之限制(見〈已知限制〉).

### 站點全集(`rulebook_judge_sites.md` 末節〈第 221 項第一批處置結果〉)

- 已套 37 站(三角 10、`round`／`ceil`／`floor` 之 `v` 3 與 `idig` 3、`dig`／`digExp`／`cfinancial`／`cfilesize` 之 `v` 4、`judge` 2、`preciseNum` 1、`estimateTicks` 2、`color` 6、`arrAdd` 2、`arrMulti` 2、`arrMax` 1、`arrMin` 1);未套:`dig.mjs:34`、`digExp.mjs:28`、`cfinancial.mjs:33`(`idig`,第四～七段)、`preciseNum.mjs:89`(`isint` 整數路徑分流,保留)、`estimateTicks.mjs:422`(`isint`,非本批)及其餘各節全部站點.
- 盤點指令(wsemi 內剩餘 `isnum` 站點):`Grep pattern='\b(isnum|isint|ispint|isp0int)\(' path=src glob='!{index,isnum,isint,ispint,isp0int,isenum,iseint}.mjs' output_mode=count`.上列 24 檔應已無 `isnum`／`isint`／`isp0int`(僅 `dig`／`digExp`／`cfinancial` 仍有 `isp0int(idig)`、`preciseNum`／`estimateTicks` 仍有 `isint`).
- 下游(`C:\opensrc` 其他套件)呼叫站點盤點:`arrMax`／`arrMin`／`arrAdd`／`arrMulti`／`arrProduct`／`preciseNum`／`estimateTicks`／三角函數／`ceil`／`floor`／`digExp`／`cfinancial`／`cfilesize` **0 站點**;`judge` 21 行(全在 w-geo,其中 6 行以原始值直送,極端輸入才由照算改拋錯)、`color` 59 行(無影響)、`round` 3 行、`dig` 81 行(僅 `Infinity` 類輸入由 `'NaN'` 改 `''`);詳見主控任務 20261031121854 `agent-out/wsemi221a-修正報告.md`〈下游影響表〉.

### 測試

- 新增 4 檔 + 2 工具:`test/isenumCallersTrig.test.mjs`、`isenumCallersRound.test.mjs`、`isenumCallersCalc.test.mjs`、`isenumCallersArr.test.mjs`;共用輸入矩陣 `test/tools/enumInputs.mjs`(`Infinity`、`'0x10'`、`'1e400'`、`'1e-400'`、`'-'`、`'NP'`、`''`、`null`、數字字串、包裝物件等 30 項無效 + 9 項有效字串)、子行程執行器 `test/tools/colorSpreadRunner.mjs`(`spreadHue`／`spreadMonochromatic` 於 `--max-old-space-size=64` 子行程驗不再耗盡記憶體).
- 既有測試因界線改變而改期望 53 案(arrAdd 1、arrMulti 1、arrProduct 1〔連動〕、arrNorm 6〔連動〕、arrMax 18、arrMin 18、atan2d 2、atand 2、judge 1、preciseNum 3),逐案見報告〈既有測試期望值之變更〉.
- 修前紅:新測試 + 改過期望之既有測試共 1515 案對 HEAD 之 src 跑 **575 failing**(24 函數皆有紅案);修後 0 failing.
- 變異:73 項評估,擊殺 71,存活 2 皆為等價(`cfinancial` 改回 `isnum`:`dig` 內仍以 `isenum` 擋下;`dig` 不轉 `Number`:lodash `round` 內部轉型).

### 已知限制／連動

- **`arrProduct`、`arrNorm`(皆未改)經 `arrMulti` 連動(最優先待裁示)**:同位置皆非有效數字時 `arrMulti` 由 `null` 改 1,`arrProduct` 加總多 1(`arrProduct([1,'-'],[3,'NP'])` 由 3 變 4、`arrProduct(['-'],['NP'])` 由 `null` 變 1、`arrProduct([1,2,3],[Infinity,'0x10',1])` 由 `Number.MAX_VALUE` 變 6);`arrNorm = sqrt(arrProduct(v, v))` 隨之 `arrNorm(['abc'])` 由 `null` 變 1、`arrNorm([1,'2',null,null])` 由 `sqrt(5)` 變 `sqrt(7)`(標記向量之範數為 1,語意不合理).兩者之測試期望已改為實測新值並註明連動(`test/arrProduct.test.mjs`、`test/arrNorm.test.mjs`),**非定案**;依 dspec Q3-b 內積遇標記宜 throw,待第四～七段裁示(派工單明列 `arrProduct`、`arrNorm` 不得改).wsemi 以外套件對 `arrProduct`、`arrNorm` 0 站點.
- `estimateTicks` 在 `rmin === rmax` 且刻度間距之小數位數 > 100(絕對值小於約 1e-99,有效位數越多越早,12 位有效數字時約 1e-89,如 `1e-100`、`1.234567e-95`)時,因 `round` 之 `idig` 上限 100,`tickInterval` 為 0、三個刻度位置相同(舊版可算);已寫入 JSDoc 必然之限制.
- `cfinancial` 之 `v` 檢測與 `dig` 內之檢測重複(等價變異),保留以維持兩函數各自獨立.
- **原有、本批未改(獨立審查者指出,已實測與 HEAD 相同)**: `preciseNum` 整數路徑以 `isint(v)`(`Number(v)` 後判整數)分流,字串若轉換後為整數(含近整數寫法)則**回傳原字串、位數 0**,不經 12 位有效數字處理——`preciseNum('0.99999999999999999999')` 回 `'0.99999999999999999999'`(位數 0)、`preciseNum('1.0000000000000001')` 回原字串、`judge('0.99999999999999999999', '===', 1)` 為 false(與「第 13 位起才不同視為相等」不符);整數路徑回傳亦未正規化(`'+5.'`→`'+5.'`、`'1e1'`→`'1e1'`、`'007'`→`'007'`,數字 `10` 則 `'10'`).本批僅補去頭尾空白.屬「檢測之值 ≠ 使用之值」,待裁示是否改以 `isenum` ＋ `Number.isInteger(Number(v))` ＋ Decimal 判整數並正規化輸出.
- `color.interp` 之漸層鍵仍以 `cdbl(k)` 取值(`'0x10'` 為 16、`'abc'` 為 0),非 `isnum`／`isint` 判定站點,本批未動.
- 既有 JSDoc 範例錯誤(原有、未修): `tand.mjs` 之範例組為 `cosd` 之值(如 `tand(0)` 寫 1、實際 0),`estimateTicks.mjs` 之 `0.89~0.9` 範例 `tickDig` 寫 1、實際 2(HEAD 即如此);本批新增之 `tand(' 45 ')` 等範例已實測正確.
