# wsemi src 可改用 isenum / iseint 之計算類站點盤點(唯讀,只列不改)

- 盤點日期:2026-10-31
- 範圍:`src/*.mjs`;已排除 isnum / isint / ispint / isp0int / isenum / iseint / _numOpt / _numRange / index(_numOpt、_numRange 內本無站點);不含 `docs/`、`test/`
- 方法:Grep `\b(isnum|isint|ispint|isp0int)\(` 逐站讀上下文(約前後 10 行,必要處追到下游用法);另補一處以回調傳入、非呼叫式之 `arrFilterByNum.mjs:40`(`filter(arr, isnum)`);`arrReverse.mjs` 僅 import isnum、無呼叫,不計
- 站點總數:**217**(Grep 命中 216 行、125 檔;其中 5 行為註解;+ 回調型 1)
- 符合數:**191**(符合「值被用於計算/計時/埠號/索引/個數/位數…」者;其中 9 處為符合用途但建議保留現行判定);不符合 26(列於第 7 節)
- 各分節數量:1 計時毫秒 30 / 2 埠號 1 / 3 索引位置切片 8 / 4 個數長度次數 51 / 5 位元進位位數年份時間戳 13 / 6 一般數值運算 88 / 7 不符合 26(不計入符合數)
- 狀態統計(符合 191 之內):建議改 140 / 待確認 42 / 建議保留 9
- 本檔未修改 src、test,未執行測試,無 git 寫入

## 共通說明(各列「風險」欄以代號引用)

- **R-NUM**(原判定為 isnum):現收 Infinity、-Infinity、'Infinity'、'0x10' / '0b11' / '0o7'、包裝物件 `new Number(1)`、'1e-400'(下溢為 0);isenum 一律拒收。其後 `cdbl(v)`(lodash toFinite)會把 Infinity 轉成 Number.MAX_VALUE 繼續算,改後在入口即被擋。
- **R-INT**(原判定為 isint / ispint / isp0int):現經 `cdbl` → lodash isInteger,故收 Infinity(→MAX_VALUE)、'0x10'、2**60 等非安全整數、'1.0000000000000001' 與 '9007199254740993'(精度遺失後仍判整數)、包裝物件;iseint 一律拒收。ispint 另要求 >0、isp0int 另要求 >=0,於 iseint 以 `use` 或 `min` 表達。
- **P-CLAMP**(計時毫秒常見樣式):現行 `ispint(x) → cint(x) → Math.min(x, cst.TIMER_TIME_MAX)`,超大值夾至上限(專案慣例:超大值之意圖為「很久」,見 `_optNum.mjs` 註解)。
  - 式 A(行為最接近):`iseint(x, { min: 1 })` 並保留 `Math.min` 夾制;安全整數範圍內大於 2147483647 者仍被夾至上限。
  - 式 B:`iseint(x, { use: 'timer', min: 1 })` 可刪 `Math.min`,但 >2147483647 改回預設值而非夾上限。
  - 兩式共通風險:Infinity 與 >2**53 之值現被夾至上限(視為很久),改後回預設值。
  - 凡值不進原生計時器(僅與時間差比較)者,不套 `use: 'timer'` 之上限。
- **取值**:判定通過後,現有 `cint(v)` / `cdbl(v)` 對有效值與 `Number(v)` 等價(cint 對整數不變),可保留不動。
- **opt 非預期之輸入視為未給**(dspec 2026-10-31 13:57 更新,本表盤點時為「不合即 throw」,現已改):isenum / iseint 的第二參數 opt 非預期者(含 filter / every / some 傳入之索引、陣列)視為未給、改用預設,不拋錯,`opt.debug === true` 時警告;故可直接當回調傳入,但慣例仍建議包成 `(v) => isenum(v)`。
- **超出範圍之處置(dspec K3 〈超出範圍亦同〉,2026-10-31 13:57 新增)**:opt 鍵之值超出其種類之範圍(如計時毫秒超過 2147483647)視為未給、改用預設;原「夾至 `TIMER_TIME_MAX`」之寫法(wsemi 16 檔,即本表 P-CLAMP 所列)隨第 221 項改為改用預設。故下列各「式 A(保留 `Math.min` 夾制)」建議依規格應改採「式 B(`use: 'timer'`,超過者回預設)」;式 A 僅作為過渡或行為最接近之備案。
- 狀態欄:**建議改**=可直接換,風險已列;**待確認**=行為取捨需裁示或有耦合/缺陷待先處理;**建議保留**=符合用途但現行判定有文件或契約依賴,不建議換。

---

## 1 計時毫秒(30)

| 檔:行 | 現行判定 | 值之用途 | 建議 | 行為變化風險 | 狀態 |
|---|---|---|---|---|---|
| src/alive.mjs:130 | `ispint(timeAlive)` | 單元存活時間 ms(與 t 比較 `t > timeAlive`,其後夾 TIMER_TIME_MAX) | `iseint(timeAlive, { min: 1 })` 式 A | P-CLAMP、R-INT | 建議改 |
| src/alive.mjs:138 | `ispint(timeDetect)` | setInterval 偵測間隔 ms(夾上限) | `iseint(timeDetect, { min: 1 })` 式 A | P-CLAMP、R-INT | 建議改 |
| src/cache.mjs:579 | `ispint(timeExpired)` | 快取過期 ms,僅與 `timeDiff` 比較(`timeDiff > d.timeExpired`),不進計時器 | `iseint(timeExpired, { min: 1 })`(不套 timer 上限) | R-INT;Infinity 現→MAX_VALUE 即永不過期,改後回預設 5000 | 待確認(有無以 Infinity 表永不過期之用法) |
| src/cacheSt.mjs:102 | `ispint(timeExpire)` | 快取存活 ms(夾上限) | `iseint(timeExpire, { min: 1 })` 式 A | P-CLAMP、R-INT | 建議改 |
| src/cacheSt.mjs:109 | `ispint(timeDetect)` | 偵測間隔 ms(setInterval,夾上限) | `iseint(timeDetect, { min: 1 })` 式 A | P-CLAMP、R-INT | 建議改 |
| src/cacheSt.mjs:217 | `ispint(timeInterval)` | waitExist 輪詢間隔 ms,轉交 waitFun(其再夾上限) | `iseint(timeInterval, { min: 1 })` | R-INT;Infinity 現→MAX_VALUE→waitFun 夾上限,改後回預設 100 | 建議改 |
| src/cacheSt.mjs:248 | `ispint(timeInterval)` | waitNotExist 輪詢間隔 ms,轉交 waitFun | `iseint(timeInterval, { min: 1 })` | 同上 | 建議改 |
| src/debounce.mjs:144 | `ispint(ms)` | 防抖時間區間 ms,僅與 `tDiff` 比較(`tDiff > ms`),不進計時器 | `iseint(ms, { min: 1 })` | R-INT;Infinity 現→MAX_VALUE 即永不觸發,改後回預設 300 | 建議改 |
| src/pmDebounce.mjs:136 | `ispint(ms)` | 防抖時間區間 ms,僅與 `tDiff` 比較(`tDiff > ms`) | `iseint(ms, { min: 1 })` | 同上 | 建議改 |
| src/delay.mjs:26 | `isnum(ms)` | setTimeout 延遲 ms(其後 `Math.min(ms, TIMER_TIME_MAX)`);全庫多處呼叫 | `isenum(ms, { min: 0 })` 並保留 Math.min | R-NUM;負數現收(setTimeout 視同 1ms)改後回預設 10;Infinity 現夾上限、改後回預設 10;小數仍可 | 建議改(影響面大) |
| src/domRipple.mjs:30 | `ispint(timeDuration)` | setTimeout 移除延遲 + transition 秒數(`timeDuration / 1000`),無 cint、無夾上限 | `iseint(timeDuration, { use: 'timer', min: 1 })` | R-INT;>2147483647 現使 setTimeout 以 1ms 觸發(潛在缺陷),改後回預設 1000 | 建議改 |
| src/evEmitDelay.mjs:68 | `ispint(ms)` | setTimeout 延遲 ms(預設 1,cint 後夾上限) | `iseint(ms, { min: 1 })` 式 A | P-CLAMP、R-INT | 建議改 |
| src/execCli.mjs:523 | `ispint(retryDelayMs)` | 重試間隔基數 ms,下游 `Math.min(retryDelayMs * attempt, 15000)` | `iseint(retryDelayMs, { min: 1 })` | R-INT;Infinity 現→MAX_VALUE→下游夾 15000,改後回預設 5000 | 建議改 |
| src/execCli.mjs:532 | `ispint(timeoutMs)` | 子行程逾時 ms(cint 後夾上限) | `iseint(timeoutMs, { min: 1 })` 式 A | P-CLAMP、R-INT | 建議改 |
| src/execCliJsonRpc.mjs:147 | `ispint(v) ? v : 120000` | 整體逾時 ms,原值(不 cint)轉交 execCliSession | `iseint(v, { min: 1 })` | R-INT;須與 execCliSession:164 同步改,否則 jsonrpc 放行之 Infinity 到 session 端被拒而得 null(不限時) | 建議改(須同步) |
| src/execCliSession.mjs:164 | `ispint(v) ? Math.min(v, MAX) : null` | 逾時 ms(setTimeout),無效=null=不限時 | `iseint(v, { min: 1 })` 並保留 Math.min | R-INT;**反向**:Infinity 與 >2**53 現被夾至上限(約 24.8 天後逾時),改後得 null(不限時) | 待確認(可否接受由有限逾時變不限時) |
| src/execCliSession.mjs:168 | `isp0int(v)` | exitGraceMs 正常結束寬限 ms(預設 2000,夾上限) | `iseint(v, { min: 0 })` 並保留 Math.min | P-CLAMP、R-INT | 建議改 |
| src/execCliSession.mjs:172 | `isp0int(v)` | killWaitMs 強殺等待 ms(預設 3000,夾上限) | `iseint(v, { min: 0 })` 並保留 Math.min | P-CLAMP、R-INT | 建議改 |
| src/execProcess.mjs:113 | `isnum(v)` 且 `v <= 0` 為 null | 子行程逾時 ms(setTimeout,夾上限);無效或 <=0 = null = 不限時 | `isenum(v, { gt: 0 })` 並保留 Math.min | R-NUM;**反向**:Infinity 現夾上限(有限逾時),改後得 null(不限時) | 待確認 |
| src/fsEvem.mjs:134 | `ispint(timeInterval)` | chokidar polling interval ms(只 cint,無夾上限) | `iseint(timeInterval, { use: 'timer', min: 1 })` | R-INT;>2147483647 現原樣交 chokidar(底層計時器以 1ms 觸發),改後回預設 100 | 建議改 |
| src/fsEvem.mjs:141 | `ispint(timeBinaryInterval)` | chokidar binaryInterval ms | `iseint(timeBinaryInterval, { use: 'timer', min: 1 })` | 同上(預設 300) | 建議改 |
| src/fsWatchFile.mjs:106 | `ispint(timeInterval)` | polling interval ms(夾上限) | `iseint(timeInterval, { min: 1 })` 式 A | P-CLAMP、R-INT | 建議改 |
| src/fsWatchFile.mjs:114 | `ispint(timeBinaryInterval)` | binaryInterval ms(無夾上限) | `iseint(timeBinaryInterval, { use: 'timer', min: 1 })` | R-INT;>2147483647 改回預設 300 | 建議改 |
| src/fsWatchFolder.mjs:153 | `ispint(timeInterval)` | polling interval ms(夾上限) | `iseint(timeInterval, { min: 1 })` 式 A | P-CLAMP、R-INT | 建議改 |
| src/fsWatchFolder.mjs:161 | `ispint(timeBinaryInterval)` | binaryInterval ms(無夾上限) | `iseint(timeBinaryInterval, { use: 'timer', min: 1 })` | R-INT;>2147483647 改回預設 300 | 建議改 |
| src/pmTimeout.mjs:85 | `isp0int(ms)` | 逾時 ms;無效即 throw `invalid ms`;其後夾上限 | `iseint(ms, { min: 0 })` 並保留 Math.min | R-INT;Infinity 現被接受(夾上限),改後 throw(新增拋錯情境) | 待確認 |
| src/setIntervalHp.mjs:43 | `isnum(interval) ? Number(interval) : NaN`,其後另擋 `ms > 0 且有限` | 輪詢間隔 ms(以時鐘比對 `elapsed >= interval`,不進原生計時器上限) | `isenum(interval, { gt: 0 })` | R-NUM 但已另擋 Infinity、<=0;差異僅 '0x10'、包裝物件改後拒收 | 建議改 |
| src/setTimeoutHp.mjs:38 | 同上 | 延遲 ms(同上,自行比對時鐘) | `isenum(interval, { gt: 0 })` | 同上 | 建議改 |
| src/waitFun.mjs:151 | `ispint(timeInterval)` | setInterval 輪詢間隔 ms(夾上限) | `iseint(timeInterval, { min: 1 })` 式 A | P-CLAMP、R-INT | 建議改 |
| src/_execPortPids.mjs:414 | `isnum(v) && Number(v) > 0` | spawnSync timeout ms(`Math.ceil` 後夾上限,非正=預設) | `isenum(v, { gt: 0 })` 並保留 ceil / Math.min | R-NUM;Infinity 現→ceil→夾上限,改後回 TIMEOUT_DEF | 建議改 |

## 2 埠號(1)

| 檔:行 | 現行判定 | 值之用途 | 建議 | 行為變化風險 | 狀態 |
|---|---|---|---|---|---|
| src/_execPortPids.mjs:455 | `(typeof v === 'number' 或 'string') && ispint(v) && Number(v) <= 65535` | 查詢用埠號 | `iseint(v, { use: 'port' })`(typeof 守門可留可刪,iseint 本就拒包裝物件) | R-INT;現 '0x10' 通過成埠 16、'0x100' 成 256,改後拒收;其餘等價(1~65535,0 本被 ispint 擋) | 建議改 |

## 3 索引 / 位置 / 切片(8)

| 檔:行 | 現行判定 | 值之用途 | 建議 | 行為變化風險 | 狀態 |
|---|---|---|---|---|---|
| src/arrAt.mjs:35 | `isp0int(istart)` | 陣列起始索引(cint 後與 `vall.length` 比較) | `iseint(istart, { use: 'index' })` | R-INT;Infinity 現→`>= length` 回 [],改後同樣回 [],結果不變 | 建議改 |
| src/arrAt.mjs:46 | `isp0int(iend)` | 陣列結束索引 | `iseint(iend, { use: 'index' })` | 同上 | 建議改 |
| src/arrInsert.mjs:63 | `isp0int(ind)` | 插入位置(後續另擋 `ind > size(arr)` 回原陣列) | `iseint(ind, { use: 'index' })`(亦可併入 `max: size(arr)`) | 無效與超界同為回原陣列,差異僅 '0x10'、包裝物件、精度字串 | 建議改 |
| src/arrPullAt.mjs:37 | `isp0int(vpull)` | 單一待移除索引,通過則包成陣列 | `iseint(vpull, { use: 'index' })` | R-INT;vpull 為陣列時本判定本即 false,無影響(陣列元素之後只 cint、未驗證,另案) | 建議改 |
| src/domDrag.mjs:47 | `isnum(s) && Number.isFinite(Number(s))` | 元素順序指標(屬性值,cint 四捨五入,小數合法) | `isenum(s)`(保留 cint 四捨五入;不用 iseint,否則小數被拒) | 已排除 Infinity;差異僅 '0x10'(現 Number→16 通過)、包裝物件 | 建議改 |
| src/strmid.mjs:31 | `isp0int(s)` | 起始位置,直接 `c.substring(s, s + n)`,s 未 cint | `iseint(s, { use: 'index' })` 且取值須補 `Number(s)` | R-INT;**現有缺陷**:s 為字串型數字(如 '2')時 `s + n` 為字串相加('2'+1='21'),與 isp0int 收字串型數字相衝,換 iseint 仍收字串,須同時修取值 | 待確認(須同時修取值) |
| src/bufRead.mjs:37 | `isint(offset)` | Uint8Array 讀取起點 offset | `iseint(offset, { use: 'index' })` | R-INT;負數 offset 現通過(讀到 undefined,結果失真),改後回 null | 建議改 |
| src/bufWrite.mjs:46 | `isint(offset)` | Uint8Array 寫入起點 offset | `iseint(offset, { use: 'index' })` | R-INT;負數 offset 現通過(寫入落在無效索引),改後回 null | 建議改 |

## 4 個數 / 長度 / 次數(51)

| 檔:行 | 現行判定 | 值之用途 | 建議 | 行為變化風險 | 狀態 |
|---|---|---|---|---|---|
| src/arrSep.mjs:44 | `!ispint(opt) && !iseobj(opt)` | num(每組個數)之型別守門 | `iseint(opt, { use: 'count', min: 1 })` | R-INT;**現有缺陷**:`num = opt` 未轉數字,字串型數字(如 '3')使 `i += num` 變字串相加,須同時 Number() | 待確認(須同時修取值) |
| src/arrSep.mjs:50 | `ispint(opt)` | 每組個數 numCount(迴圈步進 `i += num`) | `iseint(opt, { use: 'count', min: 1 })` | 同上 | 待確認 |
| src/arrSep.mjs:55 | `ispint(get(opt, 'numCount'))` | 每組個數 | `iseint(..., { use: 'count', min: 1 })` | 同上 | 待確認 |
| src/arrSep.mjs:59 | `ispint(get(opt, 'numGroup'))` | 切成幾組(迴圈 `g < num`) | `iseint(..., { use: 'count', min: 1 })` | 同上;Infinity 現近乎無限迴圈,改後拋 `invalid opt.numCount or opt.numGroup` | 待確認 |
| src/cacheBd.mjs:182 | `ispint(nMax)` | 最大嘗試次數(`for i <= nMax`,每次間隔 1000ms) | `iseint(nMax, { use: 'count', min: 1 })` | R-INT;Infinity 現→MAX_VALUE=近乎無限輪詢,改後回預設 200 | 待確認(Infinity 作無限次之用法) |
| src/cacheBd.mjs:189 | `ispint(nTrigger)` | 觸發 get 之嘗試次數(`i > nTrigger`) | `iseint(nTrigger, { use: 'count', min: 1 })` | R-INT;Infinity 現=永不觸發,改後回預設 3 | 建議改 |
| src/cacheSt.mjs:211 | `ispint(attemptNum)` | waitExist 最大嘗試次數,轉交 waitFun | `iseint(attemptNum, { use: 'count', min: 1 })` | R-INT;Infinity 現→MAX_VALUE=近乎無限次,改後回預設 30 | 待確認(同 waitFun:145) |
| src/cacheSt.mjs:242 | `ispint(attemptNum)` | waitNotExist 最大嘗試次數 | 同上 | 同上 | 待確認 |
| src/color.mjs:965 | `isint(num)`,其後 `cint(num)`、`num <= 1` 回 `[rgba]` | spreadHue 之色數(迴圈 num 次) | `iseint(num, { use: 'count' })` | R-INT;負數現收(回 `[rgba]`),use:'count' 改後 throw `num is not an integer`;若要保留負數行為改用 `iseint(num)`;Infinity 現近乎無限迴圈 | 待確認(負數是否維持) |
| src/color.mjs:986 | `isint(num)` | spreadMonochromatic 之色數 | 同上 | 同上 | 待確認 |
| src/execCli.mjs:94 | `isnum(smin)` → `cint(smin)` | check 規則 `min:N` 之輸出字元數下限(`stdout.length < min`) | `iseint(smin, { use: 'count' })` | 現收小數(cint 四捨五入,'min:1.5'→2)、負數、'min:Infinity'(→MAX_VALUE 恆失敗);改後小數字串視為規則無效=驗證失敗 | 待確認(小數是否保留四捨五入) |
| src/execCli.mjs:515 | `isp0int(maxRetries)` | 最大重試次數(`for attempt <= maxRetries`) | `iseint(maxRetries, { use: 'count' })` | R-INT;**反向**:Infinity 現→MAX_VALUE=近乎無限重試,改後回 0(不重試) | 待確認 |
| src/execCli.mjs:542 | `ispint(maxBuffer)` | stdout / stderr 累積字元數上限(與 `.length` 比較) | `iseint(maxBuffer, { min: 1 })`(不用 count,免 >4GiB 被拒) | R-INT;Infinity 現→MAX_VALUE=不限,改後回預設 10MB | 待確認 |
| src/execCliSession.mjs:176 | `isp0int(v) ? cint(v) : 4000` | stderr 保留字元數 | `iseint(v, { use: 'count' })` | R-INT | 建議改 |
| src/fsDeleteFileSafeCore.mjs:39 | `ispint(numRetry)` | 刪除重試次數 | `iseint(numRetry, { use: 'count', min: 1 })` | R-INT;Infinity 現近乎無限重試,改後回預設 5 | 建議改 |
| src/fsDeleteFolderSafeCore.mjs:39 | `ispint(numRetry)` | 刪除資料夾重試次數 | 同上 | 同上 | 建議改 |
| src/fsGetFileXxHashCore.mjs:38 | `ispint(chunkSize)` → cint,其後 `> 2**30` 改用預設 | 串流 highWaterMark 位元組數 | `iseint(chunkSize, { min: 1, max: 2 ** 30 })`,可刪後面 `> 2**30` 判斷 | 等價(超界本就回預設);差異僅 '0x10'、包裝物件、精度字串 | 建議改 |
| src/fsGetFileHashCore.mjs:53 | `isnum(chunkSize)` → cdbl,轉交 fsGetFileXxHashCore | xxhash64 切片位元組數 | `iseint(chunkSize, { min: 1, max: 2 ** 30 })` | 現 0 / 負 / 小數 經 cdbl 後交下游 ispint 仍回預設,結果一致;改後入口即回預設 | 建議改 |
| src/getFileHash.mjs:106 | `isnum(chunkSize)` → cdbl | 切片位元組數;**本地變數 chunkSize 未被使用**(下游收的是原 `opt`,由 getFileXxHash / getFileBasicHash 自行再判) | 不需改判定;屬未使用變數(死碼,依規則不自行刪,僅提出) | 無 | 待確認(死碼處置) |
| src/getFileBasicHash.mjs:112 | `isnum(chunkSize)` → cdbl | 切片位元組數(`slice(offset, offset + chunkSize)`、`offset += chunkSize`) | `iseint(chunkSize, { min: 1 })` | R-NUM→整數化;0 / 負 / 小數現使迴圈不前進或反向(無窮迴圈或雜湊錯誤),改後回預設 64MB | 建議改 |
| src/getFileXxHash.mjs:80 | `isnum(chunkSize)` → cdbl | 切片位元組數(同上迴圈) | `iseint(chunkSize, { min: 1 })` | 同上 | 建議改 |
| src/fsTask.mjs:206 | `ispint(levelLimit)` | 列舉層數上限(轉交 fsGetFilesWithHashInFolder) | `iseint(levelLimit, { use: 'count', min: 1 })` | R-INT;Infinity 現→MAX_VALUE=等同無限層,改後回預設 1 | 建議改 |
| src/fsTreeFolderCore.mjs:35 | `levelLimit !== null && ispint(levelLimit)` | 列舉層數上限(null=無窮) | `iseint(levelLimit, { use: 'count', min: 1 })` | 無效時保留原值(不回預設):Infinity 改後保持 Infinity,`level <= Infinity` 仍成立,結果不變;其後 `if (levelLimit < 1)` 成死碼 | 建議改 |
| src/genID.mjs:25 | `ispint(len)` | ID 字元數(迴圈 `i < len`) | `iseint(len, { use: 'count', min: 1 })` | R-INT;Infinity 現→cint→MAX_VALUE 近乎無限迴圈,改後回 32 | 建議改 |
| src/getBufferSize.mjs:38 | `isnum(buf.byteLength)` | 回傳位元組數(buf 已過 isab / isblob / isu8arr / isu16arr 型別守門) | 可不改;若改 `iseint(buf.byteLength, { use: 'count' })` | 屬性恆為安全非負整數,無實質差異;僅偽造物件有別 | 建議保留(低價值) |
| src/getBufferSize.mjs:46 | `isnum(buf.length)` | 同上 | 同上 | 同上 | 建議保留(低價值) |
| src/getBufferSize.mjs:54 | `isnum(buf.size)` | 同上(Blob.size) | 同上 | 同上 | 建議保留(低價值) |
| src/getErrorMessage.mjs:503 | `ispint(levelCauseMax, { useLimitSafe: true })` | cause 追溯層數上限 | `iseint(levelCauseMax, { use: 'count', min: 1 })` | 現 useLimitSafe 已擋非安全整數與 Infinity,實質等價;差異僅 '0x10'、包裝物件 | 建議改 |
| src/getErrorMessage.mjs:510 | `ispint(levelJsonMax, { useLimitSafe: true })` | JSON 序列化層數上限 | 同上 | 同上 | 建議改 |
| src/getErrorMessage.mjs:517 | `ispint(lengthMessageMax, { useLimitSafe: true })` | 訊息字元數上限(預設 0=不限) | 同上 | 同上 | 建議改 |
| src/isUserPw.mjs:296 | `!isint(numLenMin) 或 cint(numLenMin) < 0` | 密碼最短長度 | `!iseint(numLenMin, { use: 'count' })`(可併掉 `cint < 0` 判斷) | R-INT;Infinity 現→MAX_VALUE 使任何密碼不合格,改後回預設 8 | 建議改 |
| src/isUserPw.mjs:303 | `!isint(numLenMax) 或 cint(numLenMax) < 0` | 密碼最長長度 | 同上 | R-INT;Infinity 現=不限長,改後回預設 30 | 建議改 |
| src/isUserPw.mjs:527 | `ispint(consecutiveCharsMinMatch)` | 帳號連續字元比對長度(slice 長度) | `iseint(..., { use: 'count', min: 1 })` | R-INT;Infinity 現使 `size(account) >= ...` 恆假(不比對),改後回預設 3 | 建議改 |
| src/pmQueue.mjs:380 | `isp0int(takeLimit)` | 同時任務數上限(0=不限) | `iseint(takeLimit, { use: 'count' })` | R-INT;Infinity 現近乎不限,改後回 0(不限),實質相同 | 建議改 |
| src/pseudoRandomIntsNdpRange.mjs:135 | `ispint(n)` | 產生個數 | `iseint(n, { use: 'count', min: 1 })` | R-INT;Infinity 現迴圈近乎無限 / 耗盡記憶體,改後回 1 | 建議改 |
| src/pseudoRandomIntsRange.mjs:133 | `ispint(n)` | 產生個數 | 同上 | 同上 | 建議改 |
| src/pseudoRandomsRange.mjs:114 | `ispint(n)` | 產生個數 | 同上 | 同上 | 建議改 |
| src/randomIntsNdpRange.mjs:57 | `ispint(n)` | 產生個數 | 同上 | 同上 | 建議改 |
| src/randomIntsRange.mjs:56 | `ispint(n)` | 產生個數 | 同上 | 同上 | 建議改 |
| src/randomsRange.mjs:57 | `ispint(n)` | 產生個數 | 同上 | 同上 | 建議改 |
| src/rang.mjs:54 | `ispint(num)` | 等分數(`dx = (rEnd - rStart) / num`) | `iseint(num, { use: 'count', min: 1 })` | R-INT;Infinity 現 dx=0,改後回預設 2 | 建議改 |
| src/rep.mjs:26 | `isp0int(n)` | 重複次數(`repeat(c, n)`,n 未 cint) | `iseint(n, { use: 'count' })` | R-INT;Infinity 現回 ''(lodash repeat 對 >MAX_SAFE_INTEGER 回空),改後亦 '',結果不變 | 建議改 |
| src/repObj.mjs:30 | `ispint(n)` | 重複次數(`times(n, constant(o))`) | `iseint(n, { use: 'count', min: 1 })` | R-INT;Infinity 現 lodash times 回 [],改後亦 [],結果不變 | 建議改 |
| src/sepInt.mjs:29 | `isp0int(n)` | 切分段數(迴圈 `i <= n`、除數) | `iseint(n, { use: 'count' })` | R-INT;Infinity 現迴圈近乎無限,改後回 [] | 建議改 |
| src/strmid.mjs:35 | `ispint(n)` | 取出字元數 | `iseint(n, { use: 'count', min: 1 })` | R-INT | 建議改 |
| src/strleft.mjs:26 | `isp0int(n)` | 取左側字元數 | `iseint(n, { use: 'count' })` | R-INT;Infinity 現→cint→substring 夾制得整串,改後回 '' | 建議改 |
| src/strright.mjs:26 | `isp0int(n)` | 取右側字元數 | 同上 | 同上(整串→'') | 建議改 |
| src/strdelleft.mjs:27 | `isp0int(n)` | 刪左側字元數 | 同上 | Infinity 現→回 '',改後亦 '',結果不變 | 建議改 |
| src/strdelright.mjs:27 | `isp0int(n)` | 刪右側字元數 | 同上 | 同上 | 建議改 |
| src/strTruncate.mjs:49 | `isp0int(maxLen)` | 最大字元數;無效=原樣回傳 | `iseint(maxLen, { use: 'count' })` | Infinity 現→MAX_VALUE→原樣回傳,改後無效亦原樣回傳,結果不變 | 建議改 |
| src/waitFun.mjs:145 | `ispint(attemptNum)` | 最大嘗試次數(`n > attemptNum`,未 cint) | `iseint(attemptNum, { use: 'count', min: 1 })` | R-INT;**反向**:Infinity 現=永遠輪詢(自然之無限用法),改後回預設 200 | 待確認 |

## 5 位元 / 進位 / 位數 / 年份 / 時間戳(13)

| 檔:行 | 現行判定 | 值之用途 | 建議 | 行為變化風險 | 狀態 |
|---|---|---|---|---|---|
| src/bufRead.mjs:43 | `isint(mLen)` | IEEE754 尾數位元數(`eLen = nBytes*8 - mLen - 1`、`1 << eLen` 位移) | `iseint(mLen, { min: 0 })`(可再加 `max`,如雙精度尾數 52) | R-INT;負數 / 過大現通過後位移失真,改後回 null | 待確認(是否加 max 由業務定) |
| src/bufRead.mjs:46 | `isint(nBytes)` | IEEE754 位元組數(`eLen`、`i = nBytes - 1`) | `iseint(nBytes, { min: 1 })`(可再加 `max: 8`) | R-INT;<=0 現通過後讀取越界,改後回 null | 待確認 |
| src/bufWrite.mjs:52 | `isint(mLen)` | 同 bufRead(含 `mLen === 23` 特例、位移) | `iseint(mLen, { min: 0 })` | 同 bufRead:43 | 待確認 |
| src/bufWrite.mjs:55 | `isint(nBytes)` | 同 bufRead | `iseint(nBytes, { min: 1 })` | 同 bufRead:46 | 待確認 |
| src/color.mjs:341 | `isnum(c)`(c 為 `parseInt(hex, 16)` 結果) | 2 位十六進位分量(0~255,除 255) | `iseint(c, { use: 'byte' })` | parseInt 只回有限整數或 NaN,且字串長度已限 2,與現行等價 | 建議改 |
| src/cfinancial.mjs:33 | `isp0int(idig)` | 小數位數,轉交 dig(toFixed) | `iseint(idig, { use: 'digits' })` | R-INT;idig>100 現通過後 toFixed 拋 RangeError,改後回 ''(與無效處置一致) | 建議改 |
| src/dig.mjs:34 | `isp0int(idig)` | toFixed 位數 | `iseint(idig, { use: 'digits' })` | 同上(>100 現拋 RangeError) | 建議改 |
| src/digExp.mjs:28 | `isp0int(idig)` | toExponential 位數(0~100) | `iseint(idig, { use: 'digits' })` | 同上 | 建議改 |
| src/ceil.mjs:69 | `isp0int(idig)` → cint | Decimal `toDecimalPlaces(dp)` 位數(無效回 0) | `iseint(idig, { min: 0, max: 1e9 })`(Decimal dp 上限);用 `digits` 會把 101~1e9 由現行可用改回預設 0 | R-INT;digits 上限 100 縮窄現行容許範圍 | 待確認(採 digits 或 Decimal 上限) |
| src/floor.mjs:69 | `isp0int(idig)` → cint | 同上 | 同上 | 同上 | 待確認 |
| src/round.mjs:108 | `isp0int(idig)` → cint | 同上(cint 內部亦呼叫 round) | 同上 | 同上 | 待確認 |
| src/str2sha.mjs:113 | `ispint(n)` → cint | SHA 演算法名稱數字(1 / 224 / 256 / 384 / 512),後續 `haskey(kpSha, n)` 白名單把關 | `iseint(n, { min: 1 })`(白名單仍由 haskey 把關) | R-INT;無效 n 仍 throw;差異僅 '0x10' 類(現 '0x100' →256 通過)、包裝物件 | 建議改 |
| src/isDate.mjs:211 | `isnum(v)` → `new Date(v)` | 毫秒時間戳之 Date 有效性判斷 | 不建議直接換 `iseint(v, { use: 'timestamp' })` | isDate 屬判斷類函數,定義域為 Date 可表示範圍(±8.64e15),`timestamp` 僅 0000~9999 年;且小數時間戳 Date 可接受、iseint 會拒;前一行 isestr 分支已處理字串 | 待確認(建議保留,除非先定義新範圍) |

## 6 一般數值運算(88)

| 檔:行 | 現行判定 | 值之用途 | 建議 | 行為變化風險 | 狀態 |
|---|---|---|---|---|---|
| src/addMonth.mjs:29 | `isint(n)` | dayjs `add(n, 'months')` 之月數 | `iseint(n)`(安全整數;極大值 dayjs 為 Invalid Date,可另加 min / max) | R-INT;Infinity 現通過→輸出 'Invalid Date' 字串,改後回 '' | 建議改 |
| src/arrAccum.mjs:31 | `isnum(v)` | 累加:`vv += cdbl(v)` 先累加,再依判定 push 累加值或 '' | `isenum(v)`,**並把累加移入判定之內** | R-NUM;若只換判定,Infinity 元素仍經 cdbl 以 MAX_VALUE 污染其後累加和 | 待確認(須調整順序) |
| src/arrAdd.mjs:26 | `isnum(v1[k])` | 逐元素相加(無效視為缺值) | `isenum(v1[k])` | R-NUM;Infinity 元素現以 MAX_VALUE 加入,改後當缺值略過 | 建議改 |
| src/arrAdd.mjs:27 | `isnum(v2[k])` | 同上 | `isenum(v2[k])` | 同上 | 建議改 |
| src/arrMulti.mjs:26 | `isnum(v1[k])` | 逐元素相乘 | `isenum(v1[k])` | 同上(MAX_VALUE 參與乘積) | 建議改 |
| src/arrMulti.mjs:27 | `isnum(v2[k])` | 同上 | `isenum(v2[k])` | 同上 | 建議改 |
| src/arrMax.mjs:110 | `isnum(vNow)` → cdbl | 取最大值之比較 | `isenum(vNow)` | R-NUM;Infinity 元素現以 MAX_VALUE 參與比較,改後略過 | 建議改 |
| src/arrMin.mjs:110 | `isnum(vNow)` → cdbl | 取最小值之比較 | `isenum(vNow)` | 同上 | 建議改 |
| src/arrNorm.mjs:36 | `isnum(r)`(r 為 `arrProduct(vec, vec)` 自算結果) | `Math.sqrt(r)` | `isenum(r)` | 僅 r 溢位成 Infinity 時有別:現→sqrt(MAX_VALUE),改後 null | 建議改 |
| src/arrSort.mjs:24 | `isnum(v)` | 排序分類:數字依 cdbl 數值排序,其餘放最末 | `isenum(v)` | R-NUM;Infinity / '0x10' 現列入數字排序(Infinity→MAX_VALUE 排最後端),改後落入字串或最末組;牽涉已裁示之「無法轉數字者放最末」邊界 | 待確認 |
| src/arrSort.mjs:55 | `vst.every((t) => isnum(t))` | 字串全可轉數字時依數值排序 | `isenum(t)` | 同上 | 待確認 |
| src/arrFilterByNum.mjs:40 | `filter(arr, isnum)`(回調型,非呼叫式) | 過濾保留數字再 cdbl | `filter(arr, (v) => isenum(v))`(**不可**直接傳 `isenum`,filter 會把 index 當 opt 而拋錯) | R-NUM;Infinity 元素現以 MAX_VALUE 保留,改後濾除 | 建議改 |
| src/arrGroupByMaxmin.mjs:495 | `isnum(value)` → cdbl | 分組比較值 | `isenum(value)` | R-NUM | 建議改 |
| src/arrGroupByMaxmin.mjs:499 | `isnum(v)` → cdbl | 元素本身作比較值 | `isenum(v)` | R-NUM | 建議改 |
| src/arrGroupByMaxmin.mjs:517 | `isnum(rmax) && isnum(rmin)` → cdbl | 區間上下界(`>= / <=` 比較) | `isenum(rmax) && isenum(rmin)` | R-NUM;以 ±Infinity 表開放區間者(經 cdbl→±MAX_VALUE 仍可比)改後該區間被略過 | 待確認(呼叫端有無以 Infinity 作開放界) |
| src/arrLookupByMaxmin.mjs:611 | `isnum(value)` → cdbl | 查表比較值 | `isenum(value)` | R-NUM | 建議改 |
| src/arrLookupByMaxmin.mjs:628 | `isnum(rmax) && isnum(rmin)` → cdbl | 區間上下界 | `isenum(rmax) && isenum(rmin)` | 同 arrGroupByMaxmin:517 | 待確認 |
| src/asind.mjs:45 | `isnum(v)` → Math.asin | 反正弦輸入 | `isenum(v)`(不建議加 min / max:超出 [-1,1] 現回 NaN,加了會變 null) | R-NUM | 建議改 |
| src/atand.mjs:57 | `isnum(v)` → Math.atan | 反正切輸入 | 保留 isnum | **JSDoc 範例明列 `atand(Infinity)`、`atand(-Infinity)` => ±90**,依賴 Infinity 經 cdbl→MAX_VALUE;改後回 null | 建議保留 |
| src/atan2d.mjs:58 | `isnum(x)` | atan2 輸入 | 保留 isnum | JSDoc 範例含 `atan2d(1, Infinity)`、`atan2d(1, -Infinity)` | 建議保留 |
| src/atan2d.mjs:62 | `isnum(y)` | atan2 輸入 | 保留 isnum | 同上 | 建議保留 |
| src/cosd.mjs:75 | `isnum(deg)` | 角度(度)輸入 | `isenum(deg)` | R-NUM;Infinity 現→cos(MAX_VALUE × π / 180) 得無意義值,改後 null | 建議改 |
| src/cotd.mjs:76 | `isnum(deg)` | 角度輸入 | `isenum(deg)` | 同上 | 建議改 |
| src/cscd.mjs:76 | `isnum(deg)` | 角度輸入 | `isenum(deg)` | 同上 | 建議改 |
| src/secd.mjs:76 | `isnum(deg)` | 角度輸入 | `isenum(deg)` | 同上 | 建議改 |
| src/sind.mjs:75 | `isnum(deg)` | 角度輸入 | `isenum(deg)` | 同上 | 建議改 |
| src/tand.mjs:75 | `isnum(deg)` | 角度輸入 | `isenum(deg)` | 同上 | 建議改 |
| src/bufWrite.mjs:40 | `isnum(value)` → cdbl | 待編碼寫入之 IEEE754 數值 | `isenum(value)` | R-NUM;現 Infinity 被 cdbl 轉 MAX_VALUE 後編碼(後方 `value === Infinity` 與 NaN 分支因此為死碼);改後 Infinity 回 null | 待確認(IEEE754 寫入是否要支援 ±Infinity / NaN,現行實質不支援) |
| src/cdbl.mjs:22 | `isnum(v)` → toFinite | 轉換函數本身 | 保留 isnum | cdbl 為 isnum 域之轉換契約(Infinity→MAX_VALUE),全庫約 60 處站點依賴,isint / ispint / cint 皆建於其上 | 建議保留 |
| src/cint.mjs:99 | `isnum(v)` → cdbl → round | 轉換函數本身 | 保留 isnum | cint JSDoc 與 useClampSafe / useLimitSafe 明列 Infinity 之處置(鉗制或錯誤),改後語意消失 | 建議保留 |
| src/cfilesize.mjs:36 | `isnum(b)` → cdbl | 位元組數換算單位字串 | `isenum(b)`(不加 nonnegative,負值現有輸出) | R-NUM;Infinity 現→MAX_VALUE→很大單位字串,改後 '' | 建議改 |
| src/color.mjs:252 | `isnum(cc)`(去 % 後) | 顏色分量(除 100 後驗 0~1) | `isenum(cc)` | R-NUM;Infinity 現→`value > 1` 錯誤,改後 `value is not a number` 錯誤(同為 throw,訊息變) | 建議改 |
| src/color.mjs:258 | `isnum(cc)` | 顏色分量(除 defValue) | `isenum(cc)` | 同上 | 建議改 |
| src/color.mjs:274 | `isnum(cc)` | 0~1 分量 | `isenum(cc)` | 同上 | 建議改 |
| src/domConvertToPic.mjs:41 | `isnum(scale)` → cdbl,<1 則 reject | 放大倍率 | `isenum(scale)`(不加 min:1,否則 <1 由 reject 變預設 1) | R-NUM;Infinity 現→MAX_VALUE→畫布失敗,改後回預設 1 | 建議改 |
| src/domDetect.mjs:97 | `isnum(v) ? cdbl(v) : null` | 元素尺寸屬性值 | `isenum(v)` | 瀏覽器尺寸屬性為有限數,無實質差異 | 建議改(低價值) |
| src/domFadeIn.mjs:51 | `isnum(ele.style.opacity)` → cdbl | 元素現行不透明度作漸變起點 | `isenum(ele.style.opacity)` | style.opacity 為 '' 或有限數字字串,無實質差異 | 建議改(低價值) |
| src/domFadeOut.mjs:51 | 同上 | 同上 | 同上 | 同上 | 建議改(低價值) |
| src/domShowImages.mjs:92 | `isp0int(disTouchMoveToHide)` → cint | 觸控移動超過幾 px 即隱藏 | `iseint(disTouchMoveToHide, { min: 0 })` | R-INT;Infinity 現=永不因移動隱藏,改後回預設 4 | 建議改 |
| src/domShowInputAndGetFiles.mjs:115 | `isnum(sizeMbLimit)` → cdbl | 檔案大小上限 MB(與檔案大小比較) | `isenum(sizeMbLimit)`(或加 `use: 'positive'`) | R-NUM;**反向**:Infinity 現→MAX_VALUE=不限,改後回預設 1000MB;加 positive 則 0 / 負數由現收(全拒)改回預設 | 待確認(Infinity=不限之用法) |
| src/domShowInputAndGetFilesU8Arrs.mjs:49 | `isnum(sizeMbLimit)` → cdbl | 同上,轉交 domShowInputAndGetFiles | 同上 | 同上 | 待確認 |
| src/domTooltip.mjs:74 | `isnum(tippystate)` | 元件自設之倒數屬性(寫入 '5',遞減) | `isenum(tippystate)` | 值僅由本函數寫入,無實質差異 | 建議改(低價值) |
| src/domTooltip.mjs:113 | `isnum(ts)` → cint → `ts -= 1` | 倒數計數 | `isenum(ts)` | 同上 | 建議改(低價值) |
| src/domVirtualCreate.mjs:44 | `isnum(width)` → cdbl | CSS 寬度(px) | `isenum(width)` | R-NUM;Infinity 現→`1.79e308px`(無效 CSS),改後 null | 建議改 |
| src/domVirtualCreate.mjs:56 | `isnum(height)` → cdbl | CSS 高度(px) | `isenum(height)` | 同上 | 建議改 |
| src/domVirtualCreate.mjs:65 | `isnum(width)` → `${width}px` | 寫入 style.width | `isenum(width)`(可加 `use: 'nonnegative'`,但會改負值行為) | R-NUM;'0x10' 現→'0x10px'(無效 CSS),改後略過 | 建議改 |
| src/domVirtualCreate.mjs:68 | `isnum(height)` → `${height}px` | 寫入 style.height | `isenum(height)` | 同上 | 建議改 |
| src/estimateTicks.mjs:230 | `isnum(rmin)` → cdbl,不合 throw | 刻度區間下界 | `isenum(rmin)` | R-NUM;Infinity 現→MAX_VALUE 後 rmax-rmin 溢位,改後 throw `rmin is not a number` | 建議改 |
| src/estimateTicks.mjs:236 | `isnum(rmax)` → cdbl,不合 throw | 刻度區間上界 | `isenum(rmax)` | 同上 | 建議改 |
| src/estimateTicks.mjs:422 | `isint(v)` | 計算得之刻度值是否為整數(降權重計次) | `iseint(v)` | 僅 \|v\|>2**53 之整數浮點有別(刻度實務不會出現) | 建議改 |
| src/interp1.mjs:37 | `isnum(v)` → toNumber | 內插輸入點(純數字形式)x 座標 | `isenum(v)` | R-NUM;Infinity 現經 lodash toNumber 保留 Infinity 進入內插運算,改後略過該點;'0x10' 現→16 | 建議改 |
| src/interp1.mjs:46 | `isnum(x)` → toNumber | 內插輸入點 x | `isenum(x)` | 同上 | 建議改 |
| src/interp1.mjs:90 | `isnum(x) && isnum(y)` → toNumber | 內插資料點 (x, y) | `isenum(x) && isenum(y)` | 同上 | 建議改 |
| src/interp1.mjs:750 | `!isnum(px)` 且 `!isarr(px)` 回 err | 查詢點 px 之型別守門(數字或陣列) | `!isenum(px)` | 同上;Infinity 現通過守門後入運算,改後回 err `px is not a number or an array` | 建議改 |
| src/judge.mjs:119 | `isnum(x1)`,不合 throw | 容差比較左值(其後 preciseNum → 比較) | `isenum(x1)` | R-NUM;須與 preciseNum:78 同時決定(preciseNum 之 JSDoc 現明載「沿用 isnum,不在本函式變動範圍」;judge.test 正在新增中) | 待確認 |
| src/judge.mjs:122 | `isnum(x2)`,不合 throw | 容差比較右值 | `isenum(x2)` | 同上 | 待確認 |
| src/preciseNum.mjs:78 | `isnum(v)`,不合 throw | 取 12 位有效數字之輸入 | `isenum(v)` | JSDoc 明載沿用 isnum('0x10'、'Infinity' 寬鬆寫法不在變動範圍),為進行中之決定;estimateTicks / judge 皆經此 | 待確認 |
| src/preciseNum.mjs:89 | `isint(v)` | 整數路徑分流:整數直接 cstr 回傳、位數 0 | 保留 isint | 此為「分類」非「有效性」判定;改 iseint 則非安全整數(如 1e21)改走 Decimal 路徑,與 JSDoc 限制第 3 點(1e21 得 '1e+21')衝突 | 建議保留 |
| src/pseudoRandomIntRange.mjs:119 | `isint(vstart)` → cint | 隨機整數區間下界 | `iseint(vstart)` | R-INT;±Infinity 現→±MAX_VALUE 區間運算得 Infinity / NaN,2**60 精度失真;改後回預設 0 | 建議改 |
| src/pseudoRandomIntRange.mjs:125 | `isint(vend)` → cint | 隨機整數區間上界 | `iseint(vend)` | 同上(預設 100) | 建議改 |
| src/pseudoRandomIntsRange.mjs:121 | `isint(vstart)` | 同上 | `iseint(vstart)` | 同上 | 建議改 |
| src/pseudoRandomIntsRange.mjs:127 | `isint(vend)` | 同上 | `iseint(vend)` | 同上 | 建議改 |
| src/pseudoRandomIntsNdpRange.mjs:123 | `isint(vstart)` | 同上 | `iseint(vstart)` | 同上 | 建議改 |
| src/pseudoRandomIntsNdpRange.mjs:129 | `isint(vend)` | 同上 | `iseint(vend)` | 同上 | 建議改 |
| src/randomIntRange.mjs:34 | `isint(vstart)` | 同上 | `iseint(vstart)` | 同上 | 建議改 |
| src/randomIntRange.mjs:40 | `isint(vend)` | 同上 | `iseint(vend)` | 同上 | 建議改 |
| src/randomIntsNdpRange.mjs:45 | `isint(vstart)` | 同上 | `iseint(vstart)` | 同上 | 建議改 |
| src/randomIntsNdpRange.mjs:51 | `isint(vend)` | 同上 | `iseint(vend)` | 同上 | 建議改 |
| src/randomIntsRange.mjs:44 | `isint(vstart)` | 同上 | `iseint(vstart)` | 同上 | 建議改 |
| src/randomIntsRange.mjs:50 | `isint(vend)` | 同上 | `iseint(vend)` | 同上 | 建議改 |
| src/pseudoRandomRange.mjs:91 | `isnum(vstart)` → cdbl | 隨機數區間下界 | `isenum(vstart)` | R-NUM;±Infinity 現→±MAX_VALUE 區間寬度溢位為 Infinity,改後回預設 0 | 建議改 |
| src/pseudoRandomRange.mjs:97 | `isnum(vend)` → cdbl | 隨機數區間上界 | `isenum(vend)` | 同上(預設 1) | 建議改 |
| src/pseudoRandomsRange.mjs:102 | `isnum(vstart)` | 同上 | `isenum(vstart)` | 同上 | 建議改 |
| src/pseudoRandomsRange.mjs:108 | `isnum(vend)` | 同上 | `isenum(vend)` | 同上 | 建議改 |
| src/randomRange.mjs:34 | `isnum(vstart)` | 同上 | `isenum(vstart)` | 同上 | 建議改 |
| src/randomRange.mjs:40 | `isnum(vend)` | 同上 | `isenum(vend)` | 同上 | 建議改 |
| src/randomsRange.mjs:45 | `isnum(vstart)` | 同上 | `isenum(vstart)` | 同上 | 建議改 |
| src/randomsRange.mjs:51 | `isnum(vend)` | 同上 | `isenum(vend)` | 同上 | 建議改 |
| src/rang.mjs:40 | `isnum(rStart)` → cdbl | 等分區間起點 | `isenum(rStart)` | R-NUM;不合現回 [],維持 | 建議改 |
| src/rang.mjs:47 | `isnum(rEnd)` → cdbl | 等分區間終點 | `isenum(rEnd)` | 同上 | 建議改 |
| src/round.mjs:120 | `isnum(v)` → `new Decimal(v)` | 被修約數值 | `isenum(v)` | R-NUM;Decimal 對 Infinity 回 Infinity、另可解析 '0x10',呼叫端或有依賴 | 待確認 |
| src/ceil.mjs:75 | `isnum(v)` → `new Decimal(v)` | 同上 | `isenum(v)` | 同上 | 待確認 |
| src/floor.mjs:75 | `isnum(v)` → `new Decimal(v)` | 同上 | `isenum(v)` | 同上 | 待確認 |
| src/dig.mjs:31 | `isnum(v)` → cdbl → toFixed | 被格式化數值 | `isenum(v)` | R-NUM;Infinity 現→MAX_VALUE 之很長字串,改後 '' | 建議改 |
| src/digExp.mjs:25 | `isnum(v)` → cdbl | 被格式化數值 | `isenum(v)` | Infinity 現→'1.7976931348623157e+308',改後 '' | 建議改 |
| src/cfinancial.mjs:30 | `isnum(v)` → dig | 被格式化數值 | `isenum(v)` | 同 dig | 建議改 |
| src/sepInt.mjs:26 | `isint(v)` | 被切分之整數(`floor(v / n)`、`v - q * n`) | `iseint(v)` | R-INT;Infinity 現通過→運算得 NaN,改後回 [] | 建議改 |
| src/_optNum.mjs:41 | `isnum(v)` → Number(v) | 各函數數值選項共用 helper(domDetect / domDrag / domIsStable / fsDownloadFileVerifyCore / fsEnsureBinsCore、domDragPreview 等共 19 處呼叫) | 不建議直接換:helper 規則明列 +Infinity 之處置(timer 夾上限、`inf: 'keep'` 保留),多個呼叫端之 JSDoc 依賴;若要受益須在 helper 內先分流 Infinity,對有限值再用 isenum | 直接換則 `v === Infinity` 分支成死碼,tolerancePixel / toleranceBounce 之 Infinity 語意與 timer 夾上限消失 | 待確認 |

## 7 不符合(26,不計入符合數)

| 檔:行 | 現行判定 | 不符合之理由 |
|---|---|---|
| src/arrDiff.mjs:161 | 註解中的 `isnum(vok)` | 註解,非程式 |
| src/arrDiff.mjs:167 | 註解中的 `isnum(vnk)` | 註解,非程式 |
| src/fsTreeFolderWithHashCore.mjs:74 | 註解中的 `ispint(levelLimit)` | 註解,非程式 |
| src/flattenToConn.mjs:674 | 註解中的 `isnum(i)` | 註解,非程式 |
| src/_const.mjs:45 | JSDoc 註解中的 `ispint(v, { useLimitSafe: true })` | 註解,非程式 |
| src/flattenToConn.mjs:670 | `isestr(k) 或 isnum(k)` | 鍵名型別分流(收進 nk 後 join('-')),非計算 |
| src/arrPull.mjs:38 | `isobj(vpull) 或 isnum(vpull) ...` | 型別分流(單值包成陣列),非計算 |
| src/cstr.mjs:30 | `!isestr(v) && !isnum(v) && ...` | 字串化之型別守門,Infinity 字串化為 'Infinity' 屬合法輸出,非計算 |
| src/domSetAttr.mjs:31 | `!isestr(val) && !isnum(val)` | 屬性值型別守門,後續 setAttribute 字串化,非計算 |
| src/haskey.mjs:26 | `!isestr(key) && !isnum(key)` | 物件鍵型別守門(`key in obj`),非計算 |
| src/ltdtkeys2mat.mjs:92 | `!isstr(v[k]) && !isnum(v[k])` | 儲存格值型別分流(非字串數字者轉 JSON),非計算 |
| src/strFindSimilar.mjs:47 | `isestr(ar) 或 isnum(ar)` | 型別分流後 cstr 轉字串,非計算 |
| src/strFindSimilar.mjs:58 | `isnum(strkeys)` | 型別分流後 cstr 轉字串,非計算 |
| src/strFindFuzz.mjs:51 | `isestr(arr) 或 isnum(arr)` | 型別分流後 cstr 轉字串,非計算 |
| src/isnnum.mjs:48 | `isnum(v)` 後判 `cdbl(v) < 0` | 判斷類函數(符號判斷)本身,其定義域沿用 isnum,屬公開 API 語意,不在計算站點 |
| src/isn0num.mjs:49 | `isnum(v)` 後判 `<= 0` | 同上 |
| src/ispnum.mjs:48 | `isnum(v)` 後判 `> 0` | 同上 |
| src/isp0num.mjs:49 | `isnum(v)` 後判 `>= 0` | 同上 |
| src/isnint.mjs:49 | `isint(v)` 後判 `cint(v) < 0` | 同上(整數符號判斷) |
| src/isn0int.mjs:49 | `isint(v)` 後判 `cint(v) <= 0` | 同上 |
| src/verifyValue.mjs:66 | `type === 'isnum'` 分支內 `isnum(value)` | 驗證器以型別名稱對應判斷函數,公開 API 語意,非計算 |
| src/verifyValue.mjs:87 | `type === 'isint'` 分支 | 同上 |
| src/verifyValue.mjs:94 | `type === 'ispint'` 分支 | 同上 |
| src/verifyValue.mjs:101 | `type === 'isp0int'` 分支 | 同上 |
| src/verifyValue.mjs:133 | `custom` 回傳值型別檢查 `!isnum(r.value) & !isstr(r.value)` | 型別守門,非計算 |
| src/verifyValue.mjs:145 | `type === 'any'` 分支 `!isnum(value) && !isstr(value)` | 型別守門,非計算 |

---

## 實作時須先處理之耦合與缺陷(摘要,皆未處理)

1. **取值缺陷(判定通過後取值未轉數字)**:`strmid.mjs:31` 之 s、`arrSep.mjs` 之 num(`i += num`)——現收字串型數字卻直接做加法,與換不換 iseint 無關,須另案修取值。`arrAccum.mjs:31` 須先調整累加順序。
2. **成對同步**:`execCliJsonRpc.mjs:147` ↔ `execCliSession.mjs:164`(逾時);`fsGetFileHashCore.mjs:53` ↔ `fsGetFileXxHashCore.mjs:38`(chunkSize);`judge.mjs` ↔ `preciseNum.mjs` ↔ `estimateTicks.mjs`(數字判定須一致)。
3. **Infinity 當「無上限/很久」之反向風險**(換後由無限變有限或由有限逾時變不限時):`waitFun.mjs:145`、`cacheSt.mjs:211/242`、`cacheBd.mjs:182`、`execCli.mjs:515/542`、`execCliSession.mjs:164`、`execProcess.mjs:113`、`pmTimeout.mjs:85`、`cache.mjs:579`、`domShowInputAndGetFiles*.mjs`;換前宜先裁示專案對 Infinity 之慣例(`_optNum.mjs` 現行慣例為超大值夾至上限、`inf:'keep'` 者保留)。
4. **文件/契約明載 Infinity,建議保留 isnum**:`atand.mjs`、`atan2d.mjs`(JSDoc 範例)、`cdbl.mjs`、`cint.mjs`、`_optNum.mjs`;`preciseNum.mjs` 現為進行中之決定(JSDoc 明載沿用 isnum)。
5. **未使用變數(死碼,僅提出不處置)**:`getFileHash.mjs:104-109` 之本地 `chunkSize` 未被後續使用。
6. 呼叫 isenum / iseint 時第二參數為 opt;把函數本身當回調傳給 filter / every 時索引會被視為未給(不拋錯),但慣例仍建議包成 `(v) => isenum(v)`(見 `arrFilterByNum.mjs:40`)。

---

## 第 221 項第一批處置結果(wsemi221a,2026-10-31,規則 R-ENUM-CALLERS-01)

- 依據:使用者 2026-10-31 指示「先處理:一、無效時的處理不變,只是判斷界線收緊;二、計算函數:無效時報錯,這點不變,只是判斷界線收緊;三、廣義數字陣列的計算.…四至七等 wsemi 改好、自有套件連動改完,再來接著處理」.
- **本節為實際處置;上方各表之「建議」「狀態」欄為盤點當時(2026-10-31 上午)之建議,二者不同處以本節為準**(見〈與盤點建議不同者〉).
- 行號為盤點當時(`src` 改前)之行號;改後行號已位移,以函數名定位.
- 已套 **37** 站;**未套**(本批不動):其餘各節全部站點,及下列 5 站:`dig.mjs:34`、`digExp.mjs:28`、`cfinancial.mjs:33`(`idig`,屬第四～七段)、`preciseNum.mjs:89`(`isint` 整數路徑分流,盤點即建議保留)、`estimateTicks.mjs:422`(`isint`,非本批).

| 檔:行(盤點時) | 處置(狀態) | 備註 |
|---|---|---|
| sind.mjs:75、cosd.mjs:75、tand.mjs:75 | `isnum`→`isenum`,取值 `Number(deg)`;無效仍 `null`(**已套**) | |
| secd.mjs:76、cscd.mjs:76、cotd.mjs:76 | 同上(**已套**) | |
| asind.mjs:45 | `isenum(v)`(**已套**) | 超出 [-1,1] 仍回 `NaN`(未加 min/max) |
| atand.mjs:57 | `isenum(v)`(**已套**,盤點原建議保留) | 使用者裁定三角函數收緊;JSDoc 範例 `atand(±Infinity)` 改 `null` |
| atan2d.mjs:58、atan2d.mjs:62 | `isenum(x)`、`isenum(y)`(**已套**,盤點原建議保留) | 同上 |
| round.mjs:120、ceil.mjs:75、floor.mjs:75 | `isenum(v)`,字串去頭尾空白後交 Decimal;無效 `''`(**已套**) | 原 `round(' 30 ')` 拋 DecimalError 一併消除 |
| round.mjs:108、ceil.mjs:69、floor.mjs:69 | `isp0int(idig)` → `iseint(idig, { use: 'digits' })`,無效用 0(**已套**,盤點原為待確認) | 使用者指定 `digits`(0~100);101 以上由可用改回 0 |
| dig.mjs:31、digExp.mjs:25、cfinancial.mjs:30、cfilesize.mjs:36 | `isenum`,取值 `Number(…)`;無效 `''`(**已套**) | `cfinancial` 之檢測與 `dig` 內重複(等價) |
| judge.mjs:119、judge.mjs:122 | `isenum(x1)`、`isenum(x2)`,字串去頭尾空白;無效 throw 訊息不改(**已套**,盤點原為待確認) | 包裝物件由放行改 throw |
| preciseNum.mjs:78 | `isenum(v)`,字串去頭尾空白;無效 throw 訊息不改(**已套**,盤點原為待確認) | 移除包裝物件拆包之分支(孤兒) |
| estimateTicks.mjs:230、estimateTicks.mjs:236 | `isenum`,取值 `Number(…)`;無效 throw 訊息不改(**已套**) | 必然之限制見 JSDoc |
| color.mjs:252、color.mjs:258、color.mjs:274、color.mjs:341 | `isnum`→`isenum`,取值 `Number(…)`(**已套**) | 341 依派工單用 `isenum`(盤點建議 `iseint(c, { use: 'byte' })`;`parseInt` 結果本為整數或 NaN,等價) |
| color.mjs:965、color.mjs:986 | `isint`→`iseint(num)`(默認 `safe`),取值 `Number(num)`(**已套**) | 盤點為待確認(負數是否維持):用默認 `safe`,負數仍收(回 `[rgba]`);連帶修掉 `Infinity` 使迴圈不結束 |
| arrAdd.mjs:26、arrAdd.mjs:27 | `isenum`,**非有效數字以 0 計算**(**已套**,盤點原為「略過」) | 同位置皆非有效數字由 `null` 改 0 |
| arrMulti.mjs:26、arrMulti.mjs:27 | `isenum`,**非有效數字以 1 計算**(**已套**) | 同位置皆非有效數字由 `null` 改 1;連動 `arrProduct`、`arrNorm` |
| arrMax.mjs:110、arrMin.mjs:110 | `isenum`,取值 `Number(…)`;**無有效數字 throw**(**已套**,盤點原為「略過、回 null」) | 非陣列、空陣列亦 throw |

### 與盤點建議不同者(使用者 2026-10-31 裁定)

1. `atand`、`atan2d`:盤點建議保留 `isnum`(JSDoc 範例±90) → 使用者定三角函數收緊,改 `isenum`,範例改 `null`,2＋2 個既有測試改期望.
2. `round`／`ceil`／`floor` 之 `idig`:盤點待確認(`digits` 或 Decimal 上限) → 使用者指定 `digits`;連動 `estimateTicks`(`rmin === rmax` 且刻度間距小數位數 > 100,即絕對值 < 約 1e-99〔12 位有效數字時約 1e-89〕時 `tickInterval` 為 0).
3. `judge`／`preciseNum`:盤點待確認 → 使用者指定改 `isenum`.
4. `arrMax`／`arrMin`:盤點「略過」 → 使用者「若沒法計算與回傳結果,那就報錯」:無有效數字 throw.
5. `arrAdd`／`arrMulti`:盤點「當缺值略過(結果 `null`)」 → 使用者「非有效數字以該函數之預設值計算」:0／1.

### 本批連動、不在原站點全集內者

- `arrProduct`、`arrNorm`(皆未改)經 `arrMulti` 連動,見 R-ENUM-CALLERS-01〈已知限制／連動〉.
