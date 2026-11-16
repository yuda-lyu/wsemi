# 規則帳本(判斷函數站點盤點,第 221 項 §11 第 6 項之後續與第 426 項處置結果)

本檔自 `sgud/rule/rulebook_judge_sites_r2d.md` 逾 30KB 後另開(2026-11-12,ws426,全域設定 §14):其後新增之處置結果節附於本檔末;第 221 項 §11 第 6 項 ws286c、ws286d、ws286e 之處置結果與 ws290 修訂見 `rulebook_judge_sites_r2d.md`;索引見 `sgud/rule/rulebook.md`.

## 第 426 項 ws426 處置結果:同步工具函數遇無效輸入之處置(R-SYNC-INVALID-01;使用者 2026-11-12 對規格第 199 項 Q1-a～d 之裁示)

依據:主控 dspec〈輸入參數之檢測機制〉§5.3(依函數類別)、§11 Q1-a～d(使用者 2026-11-12 定:依主控建議)、K2／K3(opt 類參數非預期改用預設,本項不改)、K9(訊息不帶值)、P1～P5.

### 規則

1. **C3 格式化**(值 → 顯示字串):主參數、次參數無效回 `''`,不拋錯(含 `day2cht`).opt 類參數(如 `idig`)依 K3.
2. **C8 之 `preciseNum`、`judge`、`estimateTicks`、`color`**:無效即同步拋錯(維持).
3. **C10 隨機範圍**:`random*`、`pseudoRandom*` 之 `vstart`、`vend` 為範圍參數——`undefined`、`null` 視為未給 → 預設(`0` 與 `1`／`100`);有給而無效即同步 `throw Error('invalid vstart: must be an integer')`(整數系,`iseint` use `safe`)或 `… must be a valid number`(實數系,`isenum`),訊息不帶值,先檢 `vstart`;單一擁有者 `src/_rangeVal.mjs`,各函數不各自手寫.`n`、`seed` 與 `genID` 之 `len` 為 opt 類,不拋.`vstart > vend` 之拋錯(訊息帶已檢測之值)維持.
4. **C5 字串操作、C7 非數值之結構運算**:主參數與次參數(長度、位置等)無效皆回輸出型別之空值(`''`、`[]`、`{}`,或與正常輸出同形之空結果),**不回原值、不拋錯、不輸出至 console**.opt 類參數(`strleft`／`strright`／`strdelleft`／`strdelright` 之 `n`、`strmid` 之 `n`、`arrAt` 之 `iend`、`matat` 之 `iend`、`dtmapping` 之 `def` 等)依 K3.使用者先前已裁定為拋錯者(`rep`、`repObj`、`replaceObj`、`replacePlus`、`sepInt`、`strTruncate` 之 `maxLen`、差異比對 5 個、`arrFilterByENum`、`arrReverse`、`arrSep`、`matConcat`、`matat`、`ltdtpull`;`objSortByKeys`、`treeToFilepath` 已定而排下下輪)不依本條.空陣列、空物件為合法資料(2026-11-03),不得因其為空而回空值以外之失敗.
5. **C6 編碼與序列化**:保留雙模式(預設模式回空值、`opt.returnWithStateAndMsg` 回 `{ state, msg }`),行為不改;JSDoc 於 `@returns` 後一行寫明「失敗之辨識」——失敗之空值亦為合法結果者寫出合法例並指明須用狀態模式辨識.

### 站點全集與判準(盤點表全文見主控任務 20261112065727 `agent-out/ws426-修正報告.md`〈一〉)

| 類 | 已套(本輪改) | 已合(現況即應然) | 刻意不套／不在本項 |
|---|---|---|---|
| C3 | — | `dig`(主)、`digExp`、`cfilesize`、`cfinancial`、`day2cht`、`addMonth`、`getTimeRange`、`getTimeFromUnit` | `dig` 之 `idig`(第三級,`rulebook_judge_sites_r1.md:57`);`day2cht` 之 `bNoDisplayYear` 非布林 truthy 判定(opt 類,K3 不合,未裁示) |
| C8 | — | `preciseNum`、`judge`、`estimateTicks`、`color` | `judge` 之 `op` 訊息帶值且先 `console.log`、`estimateTicks`／`color` 部分訊息帶值(K9,未裁示) |
| C10 | `randomIntRange`、`randomRange`、`randomIntsRange`、`randomIntsNdpRange`、`randomsRange`、`pseudoRandomIntRange`、`pseudoRandomRange`、`pseudoRandomIntsRange`、`pseudoRandomIntsNdpRange`、`pseudoRandomsRange`(`src/_rangeVal.mjs:25-43`,各檔 `rangeVal(` 共 20 站) | `genID` | `pseudoRandom`(`seed` 為任意值,無範圍)、`rang`(計算類,§11 第 221 項待決第 4 項) |
| C5 | `attstr` 回傳之 `remove`(`removeItemOrId` 非字串 → `''`,`''` 仍回原字串)、`add`(`composItems1`／`composItems2` 非字串 → `''`,原預設模式拋 TypeError)(`src/attstr.mjs` 之 `atRemove`、`atAdd`) | `attstr` 之 `parse`、`join`、`strleft`、`strright`、`strmid`、`strdelleft`、`strdelright`、`trim`、`replace`、`sep`、`split`、`htmlEncode`、`htmlDecode`、`html2str`、`getFileName`、`getFileNameExt`、`getFileTrueName`、`getPathParent`、`getClearPathName`、`getFileType`、`urlParse`、`strFindSimilar` | 已裁定拋錯者(規則 4);`strTruncate` 之 `maxLen`(與 11-12 裁示之例衝突,待裁示) |
| C7 | `arrInsert`(`ind` 無效或超過長度、`items` 未給〔`undefined`〕皆回 `[]`;`src/arrInsert.mjs`)、`arrPull`(`src/arrPull.mjs:48-58`)、`arrPullAt`(`src/arrPullAt.mjs:49-51`)、`dtmapping`(`src/dtmapping.mjs:34-36`;連動 `ltdtmapping`)、`ltdtDiffByKey`(`src/ltdtDiffByKey.mjs:62-67`)、`objSortBy`(`src/objSortBy.mjs:49-52`) | `arr2dt`、`arrAt`、`arrFilterByKeywords`、`arrFilterByNum`、`arrFilterByPnum`、`arrFilterByPnumAndToLog`、`arrFind`、`arrSort`、`composeToTree`、`convertToTree`、`flattenToConn`、`flattenTree`、`filepathToTree`、`dtpick`、`getltdtkeys`、`ltdtmapping`(主、次)、`ltdtmerge`、`ltdtpick` | `arrReduce`(輸出為任意元素,維持 `null`);已裁定拋錯者(規則 4);`treeObj`、`getObjSize`(11-02 定維持);數值計算 `arrAdd` 等 10 個 |
| C6 | JSDoc 39 檔(`git diff` 各 +1 行,行為不改) | — | `blob2*`(Promise)、`getCsvStrFromData`、`time*2*` 18 個(C19,Q1-g 待呈) |

- 盤點指令(可重跑):①隨機系單一擁有者 `Grep pattern="rangeVal\(" path=src output_mode=count` 應為 10 檔各 2 站,`Grep pattern="RULE_VSTART|RULE_VEND" path=src` 應為 0;②C7 不回原值 `Grep pattern="return (arr|vall)$" path=src/arrInsert.mjs,src/arrPull.mjs,src/arrPullAt.mjs` 應為 0;③C6 文件 `Grep pattern="失敗之辨識" path=src output_mode=count` 應為 39;④探針 `node ./tmp/ws426/probe.mjs ./src <out.json>`(派工結束後已清除,寫法見本節〈測試〉之說明,重建時對每參數代入 13 種無效值並比對修前修後).

### 內部呼叫端(連動)

- `ltdtmapping` 逐列呼叫 `dtmapping`:非物件之列由 `{ <key>: def }` 改為 `{}`(位置保留),已列入破壞性變更.
- `ltdtDiffByKey` 之內部呼叫端 `fsSyncFolderCore.mjs:134`、`fsTask.mjs:332`、`fsTaskCp.mjs:399` 皆傳陣列與有效字串鍵,行為不變.
- `objSortBy` 之內部呼叫端 `objSortByKeys.mjs:57` 恆傳函數,行為不變.
- 隨機系內部呼叫:`pseudoRandom*` 呼叫 `pseudoRandom(seed)`(不變);他函數未呼叫被改之 10 個隨機函數(`Grep` 確認).

### 測試

- 新增 `test/invalidInputQ1.test.mjs`(甲:本輪改變之 C5 `attstr`、7 個 C7 函數與 10 個 C10 函數,主參數、次參數各至少一案;乙:未改變者之守門 6 案,現況即應然);`test/tools/rangeParamKit.mjs`(範圍參數之表驅動建構器,`defineRangeParam`).
- 修改(斷言舊行為者改為新行為):`optValG4randRandom.test.mjs`、`optValG6strArrNum.test.mjs`(`vstart`／`vend` 改 `defineRangeParam`、`arrInsert`／`arrPullAt` 不再回同一參考)、`intInputHangG6.test.mjs` 與 `test/tools/intInputHangG6Runner.mjs`(超大 `vend` 改期望立即拋錯)、`arrInsert.test.mjs`、`arrPull.test.mjs`、`arrPullAt.test.mjs`、`objSortBy.test.mjs`.
- 修前紅:以「現行工作樹、本輪改動之 src 檔改回 HEAD 版」之副本跑新測試:`invalidInputQ1`(28 案)甲 21 案全紅、乙 7 案中 6 案綠(行為守門)、1 案紅(C6 文件守門:讀 39 檔確認 `@returns` 後一行為「失敗之辨識」);受影響 8 檔 778 案紅(`invalidInputQ1` 早期版本).變異 22 項(改回舊寫法、放寬 null、訊息帶值、不取轉換值、刪文件等)全部轉紅.
- 外審(terra,2026-11-12)後補修:`attstr`(漏列)、`arrInsert` 之 `items` 未給、C6 文件用語改為「本函數所偵測之失敗」並補 `u8arr2obj` 合法例與 `ltdt2vrtsable`／`b642str` 之限制、`pb642obj` 參數順序與失敗值、隨機陣列函數之 `@returns`、`getClearPathName` 之 `@returns`、`arrPull` 之既有限制說明;其餘條目見下〈已知缺口〉.

### 已知缺口(外審提出、未在本輪修,待裁示或排程)

- 元素層級之無效(非參數層級):`ltdtmapping`／`ltdtDiffByKey` 混入非物件列時逐列處理(部分結果)、`dtmapping`／`dtpick`／`ltdtpick` 之 `keys` 含非字串元素、`arrFilterByKeywords` 元素為 `null` 時拋 TypeError(既有缺陷).Q1-c 之裁示對象為參數;元素層級之處置(整批回空值或逐列)待裁示.
- `getClearPathName`、`ltdtDiffByKey` 無效回同形空結果而非字面 `{}`(本輪依 11-03 差異比對子類之「同形空結果」處理),待確認.
- `genClockTZ` 之 `formatTime`(工廠方法,值 → 顯示字串)無效拋錯係 Gitea #41 建議檔所定(K2),是否適用 Q1-a 待裁示.
- `getTimeRange` 之 `tend` 為 `null` 回 `''`、`undefined` 視同 `tstart`(opt 類之 null 處置,依〈不得改變〉未動).
- 隨機系:`vstart > vend` 之訊息帶值(K9)、實數系極端有限端點之區間差溢位為 `Infinity`(如 `randomRange(-Number.MAX_VALUE, Number.MAX_VALUE)`)、`*NdpRange` 之合法巨大跨度依跨度配置或迭代(可能耗盡記憶體)、`pseudoRandomIntsNdpRange` 回索引而非數值(既有,JSDoc 已註明;**已於第 492 項 ws492b 改為回 `[vstart, vend]` 內之值**,見本檔〈第 492 項 ws492b 處置結果〉).
- `dtmapping`／`ltdtDiffByKey` 以 `isobj`(`toString` 判定)收類別實例,較 dspec §3.6 O1 寬.
- `arrPull`／`arrPullAt` 以 `isearr` 判定 `vall`,單一無效值之陣列(`[null]`)回 `[]`;`arrPull` 不移除 `''`／`null`(JSDoc 已註明).

### 變更紀錄

- 2026-11-12(ws426):新增本條;破壞性變更紀錄第 63 項.

## 第 430 項 ws430 處置結果(規格第 199 項 Q1-h「檢查要拿來計算之 opt 一律用 ise*」;主控帳本 G17;2026-11-12)

- **依據**: 主控 dspec〈輸入參數之檢測機制〉§11 Q1-h〔使用者 2026-11-12 定〕「wsemi 內 6 檔 14 處改用 `iseint`」、§11 第 19～21 項(Infinity 之 opt 一律改用預設,語意反轉者亦然);本套件 R-OPT-VAL-01(`rulebook_optval.md`;共用 `src/_optVal.mjs`、取值 `Number(v)`、不夾限、`opt.debug` 警告);站點原盤點見 `rulebook_judge_sites_inv_a.md` 第 21～26、74～76、85、93～95 列.
- **處置(14 站,逐站舊 → 新;預設不變)**:

| 站 | 舊判定 | 新判定(`optVal` 之 `iseint` 規則) | 預設 | 主要差異 |
|---|---|---|---|---|
| `execCli.mjs` `maxRetries` | `isp0int` → `cint` | `{ use:'count' }` | 0 | `Infinity`(原 `MAX_VALUE`=近乎無限重試)、`new Number(1)`(原 1)、`'0x10'`(原 16) → 0 |
| `execCli.mjs` `retryDelayMs` | `ispint` → `cint` | `{ min:1 }`(不設計時器上限:實際間隔先夾 15000 才交計時器) | 5000 | `Infinity`(原實際間隔夾為 15000)、`'0x10'`(原 16) → 5000 |
| `execCli.mjs` `timeoutMs` | `ispint` → `cint` → 夾至 2147483647 | `{ use:'timer', min:1 }`,移除夾限 | 120000 | `Infinity`／`3e9`／`2147483648`(原夾至上限)、`'0x10'`、`new Number(300)` → 120000 |
| `execCli.mjs` `maxBuffer` | `ispint` → `cint` | `{ use:'count', min:1 }`(字元數,同 `stderrKeep`;外審 terra 9 後由 `{min:1}` 改定——超過 4294967295 之字串本已無法容納,V8 字串上限約 2^29) | 10485760 | `Infinity`(原 `MAX_VALUE`=不限)、超過 4294967295 → 10MB |
| `execCliJsonRpc.mjs` `timeoutMs` | `ispint(v) ? v : 120000`(原值轉交,未轉數字) | `{ use:'timer', min:1 }`,轉交 `Number(v)` | 120000 | `Infinity`／`3e9`(原轉交後於 session 夾至 2147483647)、`'0x10'` → 120000;`null` 照舊為預設(下游以 `null` 轉傳) |
| `execCliSession.mjs` `timeoutMs` | `ispint` → 夾至 2147483647,否則 `null` | `{ use:'timer', min:1 }` | `null`(不限) | `Infinity`／`3e9`(原約 24.8 天後逾時) → 不限時;`'0x10'` → 不限時 |
| `execCliSession.mjs` `exitGraceMs` | `isp0int` → 夾至上限 | `{ use:'timer' }` | 2000 | `Infinity`(原 2147483647)、`-1`、`1.5`、`'0x10'`(原 16) → 2000 |
| `execCliSession.mjs` `killWaitMs` | `isp0int` → 夾至上限 | `{ use:'timer' }` | 3000 | `Infinity`、`'0x10'`、`new Number(10)`(原 10) → 3000 |
| `execCliSession.mjs` `stderrKeep` | `isp0int` → `cint` | `{ use:'count' }` | 4000 | `Infinity`(原全部保留)、`'0x10'`、`new Number(0)`(原 0) → 4000 |
| `fsTreeFolderCore.mjs` `levelLimit` | `null` 為無窮;`ispint` → `cint`;其餘原值保留(`level <= 原值` 比較) | `null` 保留為無窮;其餘 `{ use:'count', min:1 }` | 1 | `Infinity`(原無窮)、`'0x10'`(原 16 層)、`2.5`(原等於 2 層)、`new Number(3)`(原 3 層) → 1;連帶 `fsTreeFolder`、`fsGetFilesInFolder(Core)`、`fsGetFoldersInFolder(Core)`、`fsTreeFolderWithHash(Core)`、`fsGetFilesWithHashInFolder(Core)` |
| `isUserPw.mjs` `numLenMin` | `isint` 且 `cint >= 0` → `cint` | `{ use:'count' }` | 8 | `Infinity`(原 `MAX_VALUE` 使任何密碼不合格且 min>max)、`1.5`、`'0x10'`、`new Number(2)` → 8 |
| `isUserPw.mjs` `numLenMax` | 同上 | `{ use:'count' }` | 30 | `Infinity`(原不限長)、`1.5`、`'0x10'` → 30 |
| `isUserPw.mjs` `consecutiveCharsMinMatch` | `ispint` → `cint` | `{ use:'count', min:1 }` | 3 | `Infinity`(原恆不比對)、`'0x10'`、`1.5` → 3 |
| `dig.mjs` `idig` | `isp0int`,無效回 `''` | `{ use:'digits' }`(0～100,同 `digExp`／`cfinancial`) | 0 | `Infinity`／`101`(原 `toFixed` 拋 RangeError)、`-1`／`2.5`／`'abc'`／`null`(原 `''`)、`new Number(2)`(原 2) → 0 |

- **不改**: `verifyValue`(依型別名判斷之判斷類)、`estimateTicks`(傳入為算出之有限刻度)(使用者 2026-11-12).
- **opt.debug**: 有 opt 物件者(`execCli`、`execCliJsonRpc`、`execCliSession`、`isUserPw`)傳入其 opt,JSDoc 加 `opt.debug`／`opt.funLog`(R-OPT-VAL-01 規則 12);`execCliJsonRpc` 另把 `debug`／`funLog` 轉交 `execCliSession`(其對原樣轉交之 `exitGraceMs` 亦警告;外審 terra 6);`levelLimit` 由 `fsTreeFolderCore` 讀其 opt 之 `debug`,有 opt 物件之對外函數 `fsTreeFolderWithHash(Core)`、`fsGetFilesWithHashInFolder(Core)` 經 `optVal.readDbg` 讀出後轉交(經 `fsGetFilesInFolderCore`),JSDoc 加兩行(外審 terra 7,規則 4);無 opt 之 `fsTreeFolder`、`fsGetFilesInFolder`、`fsGetFoldersInFolder` 與 `dig` 不警告.`_optVal.mjs` 新增 `optVal.readDbg(opt)`(自 `warnInvalid` 抽出,行為不變).
- **debug 讀取時機(外審 terra 第 5 條、複核 N3)**: 本輪入口改為「判定時只收集、業務鍵全部讀完後才至多讀一次 `opt.debug`」——`execCliSession`(4 鍵)、`execCliJsonRpc`(`timeoutMs`;另一律讀一次以轉交 session)、`domAlert`(數值類 opt)以新增之 `optVal.defer()`(`take`／`flush`);`levelLimit` 之 debug 來源以 `optDbg` 轉交(`fsTreeFolderWithHashCore`、`fsGetFilesWithHashInFolderCore` → `fsGetFilesInFolderCore` → `fsTreeFolderCore`),只在非預期時才讀;`execCli` 以 `onceOpt`(展開副本,呼叫端之存取器於展開時各讀一次,其後重讀副本無副作用)維持,與其 `onTrace` 同只認自有可列舉鍵(第 8 條,不改).`isUserPw` 與前輪各函數仍為「第一個非預期鍵當下讀」之既有寫法(全庫約 50 處;是否全庫改用 `defer` 列回饋與需裁示).
- **孤兒 import 已移除**: `execCli`(`cst`、`ispint`、`isp0int`)、`execCliJsonRpc`(`ispint`)、`execCliSession`(`cst`、`ispint`、`isp0int`、`cint`)、`fsTreeFolderCore`(`ispint`、`cint`)、`isUserPw`(`isint`、`ispint`、`cint`)、`dig`(`isp0int`).
- **測試**: `test/optValG17eint.test.mjs`(34 案;含 debug 只讀一次且晚於業務鍵、有效值不讀;子行程以 `onTrace` 之 `retry`／`stop`／`kill`／`full`／`done` 事件斷言;逾時另以 `setTimeout` 側錄直接驗交給計時器之值〔外審 terra 11:只驗警告抓不到「仍警告但用舊夾限」〕,不限時以 `opt.debug` 警告斷言;`maxBuffer`、`levelLimit` 之 count 上限;JsonRpc 轉交 debug;WithHash 之 levelLimit 警告);修前紅 21 案(外審前之 32 案中);變異 M12～M17、M21～M24、M33～M37、M43～M45(18 個)皆被殺.既有 2 案改寫預期: `test/execCliSession.test.mjs`(`stderrKeep` 之包裝物件改為預設)、`test/isenumCallersRound.test.mjs`(dig 之 idig 由「本批不改」改為預設 0).
- **下游(只盤點、未改他套件;ws430 報告附)**: 無呼叫端傳入字面 `Infinity`、小數或超過 2147483647 之字面值;w-ldap 之 `opt.timeout`、w-dispatch-ai `runExecCli` 之 `timeoutMs` 經 `ispint`／`castPintOr` 後轉交,使用者給大於 2147483647 時由「夾至上限」變「預設 120000」;`dig` 之變數第 2 參數(元件 prop 等)來源不明者,原為 `''` 或 RangeError 之值改為 0 位小數.

## 第 492 項 ws492a 處置結果:對外入口之數值參數以 `isenum` 判定、通過即 `cdbl` 轉型後使用(R-ENTRY-CONVERT-01;使用者 2026-11-16;主控任務 20261116102625)

- **依據**: 使用者 2026-11-16「函數一般而言,數值檢測完通過,就會自動轉型(因可能輸入 '12.3' 得 cdbl)」「數值檢測通過就自動轉型('12.3' → cdbl,整數時 '123' → cint)」「若需要 isenum,那就請先去改」;主控 dspec〈輸入參數之檢測機制〉K3(opt 非預期視為未給)、K4(檢測之值即使用之值)、K7(數字類一律收數字字串)、V20(訊息不帶值,比較類寫出規則)、§11 Q3-c(2026-11-16 通則:判定通過即轉型);主控重掃判讀表(`C:\opensrcOper\dnow\20261116102625\lodash-sites.md`).
- **規則(R-ENTRY-CONVERT-01)**: ① 對外入口之數值參數(必須參數或 opt 鍵)以 `isenum`(實數)／`iseint`(整數)判定,通過即 `cdbl`／`cint` 轉型後使用,不以未轉型之原值計算;② 值於內部已必然為數值者(瀏覽器事件屬性、已 `cdbl` 之值、依型別分流)可用 lodash／原生判斷,不改;③ 取值只讀一次(檢測之值即使用之值,K4;呼叫端之存取器不得在檢測與使用之間回不同值);④ 回布林者無效回 `false`(比照 `domIsFocused`),回物件者依該函數既有通道(`domGetBoudRectRefSelf` 回 `null`),opt 無效視為未給(K3);⑤ 訊息與 console 不帶輸入值(V20),範圍類錯誤寫出規則.
- **處置(3 檔 4 站,逐站舊 → 新)**:

| 站 | 舊判定 | 新判定 | 失敗通道 | 主要差異 |
|---|---|---|---|---|
| `domIsClientXYIn.mjs:29-45` `clientX`、`clientY`(必須參數) | `isNumber`;無效 `console.log` 帶值後回 `undefined` | `isenum` → `cdbl` | 回 `false`(嚴格布林) | `NaN`／`±Infinity`／`new Number(n)`(原收下)→ `false`;數字字串(原 `undefined`)→ 與數字同;無效不再 `console.log`、不呼叫 `getBoundingClientRect` |
| `domIsClientXYIn.mjs:37-39`、`:52-56` `ele` 非元素、取外框拋錯 | `console.log` 帶值(非元素)／帶 err(拋錯)後回 `undefined` | 非元素回 `false`、不 `console.log`;取外框拋錯回 `false`(`console.log(err)` 與比較計算拋錯之 `console.log(err)` 維持,輸出錯誤物件非輸入值) | 回 `false` | 回傳型別恆為布林(P1) |
| `domGetBoudRectRefSelf.mjs:36-60` `p.clientX`、`p.clientY` | `isNumber(p.clientX)`、`isNumber(p.clientY)` 後再讀 `p.clientX`／`p.clientY` 計算(讀兩次) | 依序(先 X 後 Y;X 無效即不讀 Y,同改前之短路)各讀一次入區域變數 → `isenum` → `cdbl` | 回 `null`(既有) | `NaN`／`±Infinity`(原收下,x、y 為 `NaN`／`±Infinity`)、包裝物件(原被當數字用)→ `null`;數字字串(原 `null`)→ 與數字同;存取器第二次回不同值不影響結果 |
| `interp1.mjs:213-251` `opt.xMin`、`opt.xMax`(`mode:'stairs'`) | `isNumber` | `isenum` → `cdbl` | 無效視為未給(K3) | `NaN`／`±Infinity`／包裝物件(原當端點,結果錯亂或誤報範圍錯誤)→ 視為未給;數字字串(原忽略)→ 與數字同(擴充端點之 x 為數字);範圍錯誤訊息改 `invalid opt.xMin: must be <= the smallest x of ps`、`invalid opt.xMax: must be >= the largest x of ps`(原 `xMin=… > ps[0].x=…` 帶值),回傳形狀 `{ err }` 不變 |

- **不改(逐站,主控判讀)**: `cdbl.mjs:37`(`toFinite`,轉型函數本身)、`isint.mjs:56`(`isInteger`,已 `isnum`＋`cdbl`)、`domDrag.mjs:82`(`toPoint` 取瀏覽器事件之 `clientX/Y`)、`domDrag.mjs:256`／`domDragPointer.mjs:168`(`isNumber(e.buttons)`)、`domGetWindowSize.mjs:36、47`(`window`／`document` 尺寸屬性)、`flattenToConn.mjs:712`(依型別分流之鍵)、`pseudoRandom.mjs:78`(種子依型別分流);原生 `Number.isFinite`／`isInteger`／`isNaN` 之站點(判斷函數實作、已為數值之內部值、已裁定之嚴格型別如 `ltdtDiffByKey` 之鍵值)皆不改;`getDiagShape`(診斷設定形狀上限,只收數字型別)屬 opt,列 wsinv 盤點之判定,不在本次.
- **盤點指令(可重跑)**: `Grep pattern="import (isNumber|isInteger|toFinite|isFinite)[^\n]* from 'lodash-es" path=src` 應僅命中上列「不改」站(`cdbl`、`isint`、`domDrag`、`domDragPointer`、`domGetWindowSize`、`flattenToConn`、`pseudoRandom`);`Grep pattern="isNumber" path=src glob="{interp1,domIsClientXYIn,domGetBoudRectRefSelf}.mjs"` 應為 0 命中;`Grep pattern="console.log" path=src/domIsClientXYIn.mjs` 應僅剩 2 處(取外框拋錯、比較計算拋錯),皆輸出錯誤物件 `err`、不含輸入值.
- **測試**: `test/domIsClientXYIn.test.mjs`(74 案,取代佔位案)、`test/domGetBoudRectRefSelf.test.mjs`(75 案,取代佔位案)、`test/interp1.test.mjs`(檔末新增 59 案之 `ws492a` 一節;全檔 138)、`test/optValG8level3.test.mjs`(1 案依新規格改寫:原鎖定「`xMin`／`xMax` 數字字串不被使用」,現改為與數字同).DOM 案以最小假 DOM(`test/tools/fakeDom.mjs`、`domEditKit.mjs`)驅動;真實 `getBoundingClientRect` 之語義屬瀏覽器,非本檔所能驗證,須於瀏覽器實測.執行: `npx mocha --no-parallel test/domIsClientXYIn.test.mjs test/domGetBoudRectRefSelf.test.mjs test/interp1.test.mjs test/optValG8level3.test.mjs --timeout 180000`(634 案 0 failing).
- **驗證**: 見主控任務 `agent-out/ws492a-修正報告.md`(修前紅 87 案:domIsClientXYIn 61、domGetBoudRectRefSelf 11、interp1 14、optValG8level3 1;修後 634 案 0 failing;變異 39 項擊殺 37,存活 2 項皆為 `domGetBoudRectRefSelf`「拿掉 `cdbl`」之等價變異——減法對數字字串本即強制轉為數值;`domIsClientXYIn` 之拿掉 `cdbl` 以「外框欄位為數字字串之自建夾具」使字典序比較可觀察而被殺〔原生 DOMRect 欄位為數字,此案僅證明比較前已轉型〕;`interp1` 之拿掉 `cdbl` 被殺〔擴充端點 x 為字串時 `(p0.x + p1.x) / 2` 成字串串接〕).外審 terra(`gpt-6.1-terra`／max)13 條:皆經實測重現(其中 2 條是否為缺陷屬契約問題),其中本輪造成之回歸 1 條已修(`domGetBoudRectRefSelf` 提前讀 `clientY`,改回先 X 後 Y 依序讀取,補「X 無效不讀 Y」案)、測試缺口 4 條已補(下溢字串 `'1e-400'`、X／Y 分開之惡意物件、`domIsClientXYIn` 字串外框夾具、自訂鍵名階梯＋字串界值),`domGetBoudRectRefSelf` JSDoc 補明 `p` 須為一般物件(事件物件本身回 `null`,補案);其餘 7 條(外審第 3～9 條)為既有缺陷、不在本輪範圍,列下「已知殘餘」.
- **下游(只盤點、未改他套件)**: `domIsClientXYIn` 呼叫端皆傳事件之 `clientX/Y`(或其記錄值,初值 0),結果只作真假判斷、無依賴 `undefined`: w-component-vue `buildPopper.mjs:160、171、248`、`WDrawer.vue:628`、`WDialog.vue:942、973`,w-quill-vue `WQuillVue.vue:105`(存入 `vo.bInElement` 僅作真假);w-flow-vue `popupPolicy.mjs:44` 僅註解提及.無事件座標(如缺 `clientX` 之觸控事件)時由「`undefined` 並 `console.log`」變「`false`」.`domGetBoudRectRefSelf` 僅 wsemi 內 `domDrag.mjs:351` 呼叫,`p` 由 `toPoint` 取得(數字或 `null`),`null` 結果已處理(`if (!rl) return`).wsemi `interp1` 之 `xMin`／`xMax` 呼叫端僅 w-geo `buildInterpFun.mjs:77-81`(`xMin: 0`、`xMax: depthMax`,`calcDepthMax` 回有限數,無深度時為 `-1e20`,行為同前);w-geo `intrpPsdBySize.mjs:103`、`calcLiquefaction.mjs:200`、`calcEstmVerticalStress.mjs:33-60` 為 linear 模式無此二鍵;w-gis 之 `interp1` 為其自有函數.無下游比對舊範圍錯誤訊息文字.
- **已知殘餘(範圍外,未改)**: `domIsClientXYIn` 於 `getBoundingClientRect` 拋錯、比較計算拋錯時仍 `console.log(err)`(輸出錯誤物件,非輸入值;比照 `domIsFocused` 之殘餘);`domGetBoudRectRefSelf` JSDoc `@example` 之呼叫引數與簽名不符(既有);`docs/` 為產生檔,未重產.外審 terra 另提之既有缺陷(本輪未改,待裁示是否另立項): ① `interp1` 之 `opt` 為已撤銷 Proxy、`opt` 之鍵存取器拋錯(`xMin`／`xMax`／`keyX` 等)時,存取器拋錯者回 `{ err }`(既有測試 R-CODEC-ERR-01 之 2 鎖定)而非視為未給,整份 `opt` 為已撤銷 Proxy 者則同步外拋;② `interp1` 多個 `px` 各自重讀同一份 `opt` 之界值(有狀態存取器可使各查詢點結果不同);③ `interp1` stairs 模式之中點 `(p0.x + p1.x) / 2` 於兩端點為極大有限數(約 1e308)時相加溢位而回錯誤之點;④ `isEle`(`nodeType` 存取器拋錯之非元素)與 `iseobj`(已撤銷 Proxy 之 `p`)遇例外物件時同步外拋,兩個 DOM 入口因此不保證回 `false`／`null`;⑤ `domIsClientXYIn` 取外框拋錯之 `console.log(err)` 若 `console.log` 自身拋錯則函數外拋(原已如此).

## 第 492 項 ws492b 處置結果:已裁定而未落實之 3 個函數、`pseudoRandomIntsNdpRange` 之值域、JSDoc 文字修正(R-ENTRY-THROW-01、R-RANGE-VALUE-01;使用者 2026-11-03「都A」與第二批裁定表 §三;主控任務 20261116102625,盤點報告 `wsinv-審計報告.md`〈已裁定而未落實〉〈N-D〉批 1 與批 6)

- **依據**: ①`objSortByKeys`、`treeToFilepath`: dspec〈輸入參數之檢測機制〉§11 第 221 項待決第 6 項(使用者 2026-11-03「objSortByKeys treeToFilepath 照你最後規劃建議(都A)改 但得放於下下輪」;其前「針對輸入obj按keys排…未列於keys的則不動(放後), 故keys給[]或其內指名key不存在於物件, 這代表合法使用」「再添加opt參數…那就是不保留未列於keys的鍵」);②`arr2dt`: 第二批裁定表 §三「`values` 為函數視為 `null`(不執行、不複製)」,盤點 R42 實測 `arr2dt(['a'], [()=>1])` 得 `{a:[Function]}`;③`pseudoRandomIntsNdpRange`: 盤點 N-D(JSDoc 首句「各元素值域為[vstart,vend]」,同族 `randomIntsNdpRange` 已加偏移).
- **規則(R-ENTRY-THROW-01)**: 必須參數為陣列或物件者,無效即同步 throw `invalid <名稱>: must be <種類>`(V19,訊息不帶輸入值 V20;陣列元素帶索引如 `invalid data[0]: must be an object`);空陣列、空物件為合法資料,不拋錯;真陣列以 `Array.isArray` 判定(R-OBJ-ITER-01 規則 2:依 `Object.prototype.toString` 為真而非真陣列者,如以 `Symbol.toStringTag` 偽稱 Array 之物件,不得依其 `length` 迭代);opt 非一般物件視為未給(K3),布林鍵只有 `true` 生效(包裝物件視為未給,W-20 未決故不經 `isbol`);鍵只看自有可列舉字串鍵(同 R-ELEM-LEVEL-01、R-OBJ-ITER-01,Symbol 鍵不納入).
- **規則(R-RANGE-VALUE-01)**: 回傳「範圍內之值」之函數,值域須為 `[vstart, vend]`;`pseudoRandomIntsNdpRange` 之排序用之值不含 `vstart`(只決定 `0~(vend-vstart)` 之排列),取前 `n` 個後加 `vstart`,故結果恆等於同 seed、`vstart=0`、`vend-vstart` 之結果平移 `vstart`(seed 為 `'start1'` 時每次呼叫自增,不在此限;`vstart=0` 時與修前逐位相同).
- **處置(逐函數,舊 → 新;對外行為變更見 `rulebook_breaking_65on.md` 第 69 項)**:

| 函數 | 舊 | 新 | 站 |
|---|---|---|---|
| `objSortByKeys(obj, keys, opt)` | 未列於 keys 之鍵(排序值 0)排在第二個以後之指定鍵之前;`obj` 非物件、`keys` 非陣列(含 `[]`)靜默回 `{}`;無 opt | 指定鍵依 keys 順序放前、其餘維持原序放後;`opt.onlyKeys === true` 只保留指定鍵;`keys` 為 `[]` 或含不存在之鍵合法;`obj` 非物件(含陣列、函數、null、偽稱 Array 者)throw `invalid obj: must be an object`、`keys` 非真陣列 throw `invalid keys: must be an array`(先檢 obj) | `src/objSortByKeys.mjs` |
| `treeToFilepath(data, opt)` | 非陣列、`[]` 一律回 `[]`;元素非物件被 `treeObj` 靜默略過 | `data` 非真陣列 throw `invalid data: must be an array`;頂層元素非物件(含陣列、null)throw `invalid data[<索引>]: must be an object`;`[]`、無有效 `_type` 之物件節點、`children` 內之非物件照舊 | `src/treeToFilepath.mjs` |
| `arr2dt(keys, values, opt)` | 值陣列之函數元素原樣放入(`{a:[Function]}`) | 值陣列之函數元素視為 `null`(不執行、不複製);其餘元素(含物件)原樣;`values` 本身為函數仍為 `null` | `src/arr2dt.mjs` |
| `pseudoRandomIntsNdpRange(vstart, vend, n, seed)` | 回 `0~(vend-vstart)` 之索引,未加 `vstart` | 回 `[vstart, vend]` 內之值(索引加 `vstart`) | `src/pseudoRandomIntsNdpRange.mjs` |

- **規格未明、本批依下列決定(請使用者可否決)**: ①`objSortByKeys` 之 keys 重複者取第一次出現之位置(各鍵只出現一次;修前取最後一次出現之位置);②keys 元素只有字串與數字(轉成字串)可對應鍵,其他型別略過(修前依屬性鍵轉換,`null` 元素會對應 `'null'` 鍵);③只對應自有可列舉字串鍵(繼承之 `constructor`、`toString` 等修前以 `get(kp, k, 0)` 誤取原型上之函數,現不對應);④JS 規定陣列索引樣整數字串鍵(`0`~`4294967294`)恆排在其他鍵之前,不在本函數控制範圍(JSDoc 已載明);⑤檢測順序先 `obj` 後 `keys`;⑥`treeToFilepath` 只檢頂層元素,`children` 內非物件仍由遍歷略過(未改);⑦`arr2dt` 之函數元素規則依任務書擴及值陣列(裁定表原文為「`values` 為函數」)。
- **JSDoc 文字修正(不改行為;盤點批 6)**: `Unit8Array` → `Uint8Array`(實有 **7** 個函數,盤點寫 5:`ab2u8arr`、`bs2u8arr`、`getBufferSize`、`obj2stru8arr`、`stru8arr2obj`、`u8arr2bs`、`u8arr2blob`);`domCancelEvent` 之 `event`/`HTMLEvent` → `e`/`Event`;`domCompareText` 之 `opt.fmt` → `opt.format`(程式讀 `format`,並載明 opt 整份展開傳給 Diff2Html、`outputFormat` 覆蓋由 `format` 換算之值);`domFinds` 之 `@returns` → `NodeList`;`domElementsFromPoint` 之 `clientY` 說明 x座標 → y座標;`domDropFiles` 之 `@returns`(evem 事件物件、事件 dropIn/dropOut/getFiles/error、`off` 為覆寫之函數,呼叫前已排定之判定維持原行為);`fsTreeFolderWithHash`/`fsTreeFolderWithHashCore` 之 `opt.forFolder`(針對資料夾);`fsCreateFile`/`fsCreateFileCore` 之 `opt`(只讀 `encoding`,字串簡寫不採用;`opt.mode`、`opt.flag` 標明目前未實作);外審另指出之 `bs2u8arr` 之 `bs` → `str`、`obj2stru8arr` 之 `data` → `o`;`treeToFilepath` 之 `treeItems`/`delimiter`/`bindRoot` → `data`/`opt.delimiter`/`opt.bindRoot`.
- **盤點指令(可重跑)**: `Grep pattern="Unit8Array" path=src` 應為 0 命中;JSDoc 與簽名、讀碼之逐項核對為 `npx mocha --no-parallel test/jsdocFixes.test.mjs`;`Grep pattern="objSortByKeys|treeToFilepath|pseudoRandomIntsNdpRange" path=C:/opensrc glob="*/*/src/**/*.{mjs,js,vue}"` 排除 wsemi 自身應只剩 `w-component-vue` `WExplorer.vue:441` 之註解掉之 import;`arr2dt` 見下游.
- **測試**: `test/objSortByKeys.test.mjs`(全面改寫為新規格,109 案;含對獨立期望值逐案比對之 600 隨機案)、`test/treeToFilepath.test.mjs`(原 11 案中 5 案之無效輸入改為拋錯,檔內 37 案)、`test/elemLevelRules.test.mjs`〈三-4b〉(檔內 72 案)、`test/pseudoRandomIntsNdpRange.test.mjs`(21 → 39 案)、`test/jsdocFixes.test.mjs`(新增 41 案,逐項鎖定 JSDoc 文字與簽名一致、`fsCreateFile` 之實際行為,真檔於 `test/_tmp/jsdocFixes/` 並於測後刪除)、`test/optValG4randRandom.test.mjs`(清理已無作用之 `idx` 分支)、`test/randIntBounds.test.mjs`.`test/tools/objIterG3Runner.mjs` 未改(`objSortByKeys:tag` 現同步拋錯,由 `objSortByKeys.test.mjs` 之子行程案例斷言).
- **驗證**: 見主控任務 `agent-out/ws492b-修正報告.md`(修前紅 150 案;變異 30 項全擊殺;全套 `npm test` 含 ws492a 之改動 0 failing;外審 terra 18 條(2 組同根合併為 16 項),屬實或部分屬實 15 項,其中 10 項已改、5 項範圍外或既有列待裁示,誤報 1 項,逐條見報告).
- **下游(只盤點、未改他套件;範圍 `C:/opensrc/*/*/src` 含 `.vue`)**: `objSortByKeys` 0 站、`treeToFilepath` 0 站(w-component-vue `WExplorer.vue:441` 僅註解掉之 import)、`pseudoRandomIntsNdpRange` 0 站;`arr2dt` 7 站皆在 w-table-vue `WTableEdit.vue`(`:939`、`:1017`、`:1020`、`:1025`、`:1028`、`:1034`、`:1067`),引數為預設 `''` 或 `true`(非陣列),不受值陣列之函數元素規則影響.
- **已知殘餘(範圍外,未改)**: ①`arr2dt` 以 `isarr`(依 `Object.prototype.toString`)判定 `keys`／`values`,偽稱 Object 之真陣列不被當值陣列、偽稱 Array 且 `length` 極大之物件可使迴圈近乎無限(既有,與 R-OBJ-ITER-01 規則 2 不一致,待裁示是否另立項);②`pseudoRandomIntsNdpRange`／`randomIntsNdpRange` 依 `vend-vstart` 配置並排序整個範圍(`(0, 1000000, 1)` 約 0.9 秒;合法巨大跨度可耗盡記憶體;見上「已知殘餘」之隨機系條目);③隨機範圍函數之 `vstart[x] > vend[y]` 訊息帶值(K9/V20,屬 N-C 批 5);④`fsCreateFile`／`fsCreateFileCore` 之 `opt.mode`、`opt.flag` 文件有而未實作(實作或自文件移除,待裁示);⑤`obj2stru8arr`／`stru8arr2obj`／`getBufferSize` 之 JSDoc 型別描述過窄(實際亦收其他 TypedArray、ArrayBuffer);⑥全庫 `src` JSDoc 頂層 `@param` 名稱與簽名不符者另有 30 個函數(盤點腳本 2026-11-16:含 `arrPull`、`arrPullAt`、`strCompareForVersion`、`verifyValue`、`fsMergeFilesCore`、`bodyLog`、`attstr` 與 `fs*Core` 缺 `opt` 之說明等),本批只改任務書所列與外審指出者.
