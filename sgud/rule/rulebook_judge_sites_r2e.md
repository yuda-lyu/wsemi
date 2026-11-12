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
- 隨機系:`vstart > vend` 之訊息帶值(K9)、實數系極端有限端點之區間差溢位為 `Infinity`(如 `randomRange(-Number.MAX_VALUE, Number.MAX_VALUE)`)、`*NdpRange` 之合法巨大跨度依跨度配置或迭代(可能耗盡記憶體)、`pseudoRandomIntsNdpRange` 回索引而非數值(既有,JSDoc 已註明).
- `dtmapping`／`ltdtDiffByKey` 以 `isobj`(`toString` 判定)收類別實例,較 dspec §3.6 O1 寬.
- `arrPull`／`arrPullAt` 以 `isearr` 判定 `vall`,單一無效值之陣列(`[null]`)回 `[]`;`arrPull` 不移除 `''`／`null`(JSDoc 已註明).

### 變更紀錄

- 2026-11-12(ws426):新增本條;破壞性變更紀錄第 63 項.
