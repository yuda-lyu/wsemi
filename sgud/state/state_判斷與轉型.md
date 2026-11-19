# 狀態(判斷與轉型)

本檔 2026-11-19(ws492i)新增(排程第 492 項第 8 批): 判斷函數只收原始值、轉型函數照舊拆包、判斷函數不拋錯、`cbol`／`isDate`／`cint` 之定義之**現況**;索引見 `sgud/state/state.md`.

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
