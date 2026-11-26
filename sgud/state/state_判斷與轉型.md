# 狀態(判斷與轉型)

本檔 2026-11-19(ws492i)新增(排程第 492 項第 8 批): 判斷函數只收原始值、轉型函數照舊拆包、判斷函數不拋錯、`cbol`／`isDate`／`cint` 之定義之**現況**;索引見 `sgud/state/state.md`.

## 第 663 項批 11:轉型／編碼／字串／時間字串轉換類 62 函數之 opt 讀取不拋錯、state 模式 9 站訊息固定詞彙、fs 列舉同步 6 函數讀鍵拋錯視為未給、公開 `getOptReader`(wsr2,2026-11-27,主控任務 20261127030143;package.json version 1.9.81 之工作樹,與 wsr1 同一次發布,未提交未發布)

- **做到哪**(已實作,規則見 `sgud/rule/rulebook_judge_nothrow.md` R-C1-HOSTILE-01 規則 3~6、R-OPT-READER-01;破壞性變更第 85 項):
  - 62 個函數(派工列 36 + 同機制同家族 26)入口以 `_pickOpt` 取快照(`optSnap`),已撤銷之 Proxy、陷阱拋錯之物件、存取器拋錯之鍵視為未給;`htmlDecode`／`htmlEncode` 改交 `he` 只含其可用鍵之自有鍵快照(`pickOpt` 第 4 參數 `onlyOwn`).
  - state 模式 9 站(`ab2u8arr`、`str2obj`、`stru8arr2obj` 2、`u8arr2obj`、`timeTZ2expire`、`timeTZ2past`、`timemsTZ2expire`、`timemsTZ2past`)之失敗 `msg` 由原樣轉出 `errToStr(err)` 改固定詞彙,細節經 `diagIfAsked`(`opt.logDetail`／`opt.funLog`);`stru8arr2obj`、`str2obj` 之 catch 內 `instanceof` 包 try(獨立複審發現,修前即存在).
  - fs 列舉同步 6 函數(`fsTreeFolder`、`fsGetFilesInFolder`、`fsGetFoldersInFolder` 及三個 Core)讀 `opt.levelLimit`／`path`／`fs`／`optDbg` 拋錯視為未給(`fs`、`path` 缺漏由相依檢查 fail-closed).
  - 新增對外函數 `getOptReader(tag, opt)`(`src/getOptReader.mjs`;`src/index.mjs` 由 `node toolg/gPackageIndex.mjs` 重產,增 1 行);「原始 number 且有限」之判斷函數不收錄(`Number.isFinite` 即是,單一使用端).
  - `o2j` JSDoc 補「以 `opt.funLog` 取回序列化失敗之原生錯誤並接為 `Error.cause`」範例(`test/optHostile663.test.mjs` 鎖定).
- **測試**: `test/optHostile663.test.mjs`(138 案,含 AST 守門與自測)、`test/fsEnumOptRead663.test.mjs`(8 案)、`test/getOptReader.test.mjs`(33 案)、`test/tools/optReadScan.mjs`(新工具);`test/ab2u8arr.test.mjs`、`str2obj`、`stru8arr2obj`、`u8arr2obj` 之 R-CODEC-ERR-01 之 2 案改寫為固定訊息;`test/getDiagBriefErr.test.mjs` 改 `ERR_SSL_PROTOCOL_ERROR` 之案並增「NODE 集合每個代碼皆有 Node 實證」案.
- **驗證**: 全套 `npm test` 34245 passing／8 pending／0 failing(約 2 分;前輪 A 輪 34057,+188 案),`npm pack` 發布包解開目錄(node_modules 以目錄連接點指向本庫,跑後已拆並回驗目標完好)同 34245／8／0;新測試於修前鏡像根(A 輪完成後之工作樹複本)紅: `optHostile663` 132 failing／6 passing、`fsEnumOptRead663` 6／2、`getDiagBriefErr` 2／37、`ab2u8arr` 7／14、`str2obj` 2／30、`stru8arr2obj` 3／43、`u8arr2obj` 2／153,含 `R-EVEM-RAW-01` 之 dom 三檔 7 failing／1 passing,`getOptReader` 為新模組(修前 `ERR_MODULE_NOT_FOUND`);修後全綠,新測試連跑 20 次皆綠;變異 `X01`～`X54`(53 項)52 被殺、1 等價(`X21`);eslint 改動與新增之檔 0 新增(`src/index.mjs` 之 `eol-last` 為 `gPackageIndex` 產出之既有行為);private-guard CLEAN;自派 sonnet 唯讀獨立複審 1 次(屬實 5 項已修: `instanceof` 外拋、JSDoc label、`getOptReader` 之淨化範圍／去重 id／`check` 非函數;列已知缺口 3 項).
- **已知缺口與待裁示**:
  1. `retError(err.toString())` 站點(全庫約 38 處)未動;讀呼叫端型別陣列者(`u8arr2ab`、`u8arr2bs`、`u8arr2blob` 等)於實例自有存取器拋錯時 `msg` 仍帶出所拋之文字(複審實證);建議另批比照 9 站改固定訊息.
  2. 同形之其他讀 opt 函數未取快照: `arrGroupByMaxmin`、`arrLookupByMaxmin`、`arrMax`、`arrMin`、`treeObj`(已撤銷之 Proxy 作 opt 時拋錯);fs／exec／dom 系各有自家失敗通道,不套.
  3. `domDropFiles` 之 `getFiles` 監聽器拋錯仍轉為 `error` 事件(文件化契約,刻意不套 `evEmit`),見 `state_事件派發.md`.
  4. 下游收斂(主控另派): w-gis `src/geojsonToMultiPolygon.mjs:29`、w-dwdata-ftp `src/_optReader.mjs`、w-ftp `src/downloadViaTemp.mjs:57` 改用 `getOptReader`(對照見 R-OPT-READER-01).

## 第 492 項第 10 批(下):第 551 項轉型函數對惡意值不拋錯、第 552 項判型改原生或內部槽(ws492k,2026-11-26;package.json version 1.9.78 之工作樹,未提交未發布)

- **做到哪**(已實作):
  - 第 551 項(R-C1-HOSTILE-01): `cstr` 對已撤銷之 Proxy 等回 `''`(改 `typeof`,BigInt／Symbol 包裝物件照舊拆包);`cint`、`isUserPw` 之 opt 於入口取快照(`src/_pickOpt.mjs`,已撤銷之 Proxy 與鍵之存取器拋錯視為未給,`debug`／`funLog` 惰性讀取);`hostileValues` 19 值 × 4 轉型函數、× 3 個 opt 存取器鍵、`isUserPw` 16 鍵逐格鎖定;`cdbl`／`cbol`／`cfilesize`／`cfinancial`／`dig`／`digExp` 本即不拋,以測試鎖定.
  - 第 552 項(R-JUDGE-NATIVE-01): `isnull`／`isundefined`／`isbigint` 語言原生;`isab`／`isu8arr`／`isu16arr` 內部槽(`src/_slotKind.mjs`);偽造 `Symbol.toStringTag` 不再通過,`Object(1n)` 為 `false`,Proxy 包裝之 ArrayBuffer 為 `false`.
  - **停於該函數(下游有依賴現行語意,待裁示)**: `isarr`(標籤讀取拋錯之陣列 Proxy 判 `false` 為 w-orm-* 寫入守門所依賴)、`isobj`(偽造 `'Object'` 標籤者於 w-serv-orm `getMapOrm` 仍被掃描)、`isblob`／`isfile`(標籤判型為跨實作替身之設計).
- **測試與驗證**: 見 `state_訊息格式與可讀性探針.md` 同批(全套 33922 passing／8 pending／0 failing、修前紅、變異);`test/convHostile.test.mjs`、`test/judgeNativeTag.test.mjs`(新)、`test/isbigint.test.mjs`(翻轉)、`ab2u8arr`／`u8arr2obj`／`obj2u8arr` 之夾具改以真實例(Proxy 偽造標籤不再通過).
- **已知缺口與待裁示**:
  1. `isarr`／`isobj`／`isblob`／`isfile` 仍可被偽造標籤通過(下游盤點見交件報告);若改,w-orm-lowdb 等五庫之寫入守門測試與 w-serv-orm `getMapOrm` 須同步(建議先改下游補探針:`chkReadable`)。
  2. ~~36 個轉型／編碼函數對已撤銷 Proxy 之 opt 仍拋錯(見訊息檔已知缺口)~~(2026-11-27 wsr2 第 663 項已處置: 擴及 62 函數,見本檔最前節).
  3. 下游固定舊行為: w-orm-mongodb `test/api-readable.test.mjs:758`(`isu8arr` 改內部槽後讀標籤 0 次,原斷言 1 次).

## 第 492 項第 8 批:判斷與轉型(ws492i,2026-11-19;package.json version 1.9.68 之工作樹,未提交未發布)

- 現況(已實作):
  - **判斷函數只收原始值**(使用者 2026-11-16 W-20 甲): `isstr`／`isnbr`／`isbol` 以 `typeof`、`isnan` 以 `Number.isNaN` 判型,`isestr`、`isstr0`、`iser`／`isernot`、`isnum` 族、`isDate`、`isEmail`、`isStrHas*`、`isUserName`／`isUserIdentify` 等隨之;`new String`／`new Number`／`new Boolean` 一律 `false`(`isernot` 為 `true`).轉型函數 `cdbl`／`cint`／`cstr`／`cbol` 經內部 `_unbox.mjs` 照舊拆包.直接判型之 lodash `isNumber` 5 檔 7 處改 `isnbr`;`clearXSS` 之包裝 String 自行拆包清除.連動以判斷函數守門之函數(字串函數、opt 之字串／布林／數字鍵)依各自失敗通道處理.規則 `sgud/rule/rulebook_data.md` R-WRAPPER-01(改寫).
  - **判斷函數不拋錯**(批 6 裁定③): `is*` 對已撤銷 Proxy、陷阱拋錯之 Proxy、讀取標籤／常讀鍵／元素即拋錯之物件皆不拋(型別無法判定回 `false`,內容檢查拋錯回 `false`);標籤判型經內部 `_tagOf.mjs`;`isfun`／`isEle`／`isErr` try 包裝;`haskey`、`isNarrow`、`domIsRendered` 補 try;**`src/_isFunSafe.mjs` 已移除**,17 站改回 `isfun`.設計上例外 `isUserPw`、`isUserName`／`isUserIdentify`(驗證函數).規則 `sgud/rule/rulebook_judge_nothrow.md` R-JUDGE-NOTHROW-01.
  - **C1／C2 之定義**(W-21 甲×3): `cbol` 依 B2(`cbol(1)`、`cbol('TRUE')` 改 `false`);`isDate` 收嚴(有效 `Date` 或通過 `isday`／`istime`／`istimems`／`istimeTZ`／`istimemsTZ` 之字串;不收數字、不存在之日期、非規格格式、無效 `Date`);`opt.onlyCheckDateObject` 語意核對(唯一差異:偽造標籤者由 `true` 改 `false`);`cint` 行為不改、JSDoc 寫明失真.規則 R-C1C2-DEF-01.`ispint(Infinity)`／`ispint(1e10)`／`ispint('0x10')` 為 `true` 核實不改.
  - 破壞性變更第 76 項(`sgud/rule/rulebook_breaking_74on.md`).
- 測試: `test/isThrowFree.test.mjs`(新)、`test/isDateStrict.test.mjs`(新)、`test/_unbox.test.mjs`(新,含 `_tagOf`)、`test/isintMathDefinition.test.mjs`(新)、`test/cbol.test.mjs`(改寫)、`test/isstr.test.mjs` 末段〈包裝物件全表〉與各 `is*` 之「包裝物件」段(改寫)、`test/isfun.test.mjs`(併入原 `_isFunSafe` 案)、`test/isDate.test.mjs`(32 案依新規則翻轉)、`test/cint.test.mjs`(增 8 案)、逐點接線案(`domDrag`、`domDragPointer`、`domGetWindowSize`、`pseudoRandom`);隨行為連動改寫之既有案:`elemLevelRules`、`elemLevelRulesB3`、`replace`、`getFileType`、`pmMap`、`pmSeries`、`fsMsgNoValue`、`time*TZ2past／expire`、`execCli`／`execCliSession`／`execCliJsonRpc`／`execCliJsonFile`／`execProcess`、`isenum`、`iseint`;工具 `test/tools/hostileValues.mjs`(新)、`test/tools/wrapperCases.mjs`(改寫).已刪 `test/_isFunSafe.test.mjs`.
- 驗證(2026-11-19 最終碼): 全套 `npm test` **32913 passing／8 pending／0 failing**(exit 0,約 2 分);HEAD 基準(`git archive HEAD` 之 `src`／`test` 解到 `./tmp/` 後全套)32773 passing／8 pending／6 failing(6 案皆為副本位置所致〔`node_modules` 相對解析、產生檔快照路徑、UMD 打包〕,與本批無關),故 passing 淨增 140、pending 8 → 8 不變(無新增略過);修前紅: 以 HEAD 之 `src` 搭配現行新增或改動之測試,46 檔中 45 檔紅(合計 178 案紅,`_unbox` 因模組不存在載入失敗),唯 `isintMathDefinition` 為核實不改而修前亦綠;變異 54 項全數擊殺(首輪 48 項擊殺 44,存活 4 項:2 為等價變異〔`isstr0` 守門後之不可達分支、`pmThrottle` 入口 `typeof` 因執行點再驗得同結果〕、2 為漏測〔`cint` 去拆包只配 `cint` 自己之測試檔而漏全表、`domDrag` 直接判型站無接線案〕,補案與修正變異後全擊殺);eslint 改動檔 0 error;`private-guard` CLEAN;自派 sonnet 唯讀獨立複審 1 次(無高嚴重度,中 4、低 3,處置見報告).
- 已知缺口與待裁示:
  1. `isDate` 字串判定依 `isday` 等,UMD 缺 dayjs 時拋 `invalid dayjs`(同 `isday`;修前 `isDate` 不依賴 dayjs)——建議維持(Q-1).
  2. 已撤銷之 Proxy 作為 exec 系 `opt`／`env`／回調／`args` 改視為未給而照常執行(修前以錯誤回報)——裁定③之連動,請確認不需 fail-closed(Q-2).
  3. `cstr`(lodash `isSymbol`)、`cint`(`opt` 讀取)、`isUserPw`(`opt` 讀取)對惡意值仍拋——非判斷函數,本批不改(Q-3).
  4. `isnull`／`isundefined`／`isbigint` 等以標籤判型者之偽造標籤與 BigInt 包裝物件不在 W-20 範圍(Q-4).
  5. 下游固定舊行為 9 站點／11 行／7 檔／4 套件(只列不改,見破壞性變更第 76 項).
