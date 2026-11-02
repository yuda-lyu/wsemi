# 規則帳本(判斷類站點全集——§1 計時毫秒、§2 埠號、§3 索引／位置／切片、§4 個數／長度／次數、§5 位元／進位／位數／年份／時間戳)

本檔自 `sgud/rule/rulebook_judge_sites.md` 抽出(2026-11-02 整理,ws272c,全域設定 §14):§1~§5逐字搬移、節號與標題不變;風險代號(〈共通說明〉)與各檔索引見 `sgud/rule/rulebook_judge_sites.md`.

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

