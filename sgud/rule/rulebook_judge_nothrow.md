# 規則帳本(判斷函數不拋錯、C1／C2 之定義)

本檔 2026-11-19(ws492i,排程第 492 項第 8 批)新建:收「判斷函數不應拋錯」(R-JUDGE-NOTHROW-01)與「C1／C2 之定義」(R-C1C2-DEF-01)兩條;包裝物件之處置見 `sgud/rule/rulebook_data.md` R-WRAPPER-01(同批改寫).索引見 `sgud/rule/rulebook.md`.

## R-JUDGE-NOTHROW-01 判斷函數(`is*`)對任何輸入皆不拋錯: 型別無法判定回 `false`,內容檢查拋錯回 `false`

- 依據: 使用者 2026-11-16 批 6 裁定③(`isfun` 不拋錯、移除 `_isFunSafe`、盤點其他對外判斷函數對已撤銷之 Proxy、存取即拋錯之物件是否拋錯,同屬者一併改為回 `false`);dspec〈輸入參數之檢測機制〉§5.3 C2(判斷類函數回布林、永不拋錯、不轉換)、V19／V20(失敗通道之訊息不帶值).
- 規則:
  1. **對外 `is*` 判斷函數對任何輸入皆不拋錯**(惡意值集 `test/tools/hostileValues.mjs` 19 種: 已撤銷之物件／函數／陣列 Proxy、陷阱全拋錯之 Proxy、讀取 `Symbol.toStringTag` 即拋錯之物件、讀取 `length`／`constructor`／`then`／`nodeType`／`valueOf` 即拋錯之物件、元素存取即拋錯之陣列、只有 `ownKeys`／`getPrototypeOf`／`getOwnPropertyDescriptor`／陣列 `length`／元素 `get` 單一陷阱拋錯之 Proxy): **型別本身無法判定**(標籤讀取拋錯)者一律 `false`(`isernot` 為反面 `true`;`isProxy` 對 Proxy 本身為 `true`,以 `util.types` 內部槽、不觸發陷阱);**型別可判定而其後內容檢查拋錯**者(`iseobj`、`isobj0`、`isearr`、`isarr0`、`isarr1`)該內容檢查回 `false`(`isobj`、`isarr` 仍為 `true`,因型別可判).
  2. **單一擁有者**: 以內部標籤判型者(`isab`、`isarr`、`isbigint`、`isblob`、`isfile`、`isnull`、`isobj`、`isu8arr`、`isu16arr`、`isundefined`)一律經內部 `src/_tagOf.mjs`(`Object.prototype.toString.call` 之 try 包裝,拋錯回 `''`);`isstr`、`isnbr`、`isbol` 以 `typeof`、`isnan` 以 `Number.isNaN`(不讀標籤、不觸發陷阱,見 R-WRAPPER-01);`isfun`、`isEle`、`isErr` 委派 lodash 並以 try 包裝(`isfun` 之 async generator 函數維持現行 `false`);`isint`／`ispint`／`isp0int`／`isDate` 讀 `opt` 拋錯視為未給(K3).其餘 `is*` 隨底層函數自動成立.
  3. **內部 `src/_isFunSafe.mjs` 已移除**(ws492g 為繞過 `isfun` 對已撤銷 Proxy 拋錯而設,屬過渡);其 17 個使用站點(`setTimeoutHp`、`setIntervalHp`、`cacheBd`、`pmChain`、`pmQueue`、`pmKeyMutex`、`pmMap`、`pmHook`、`pmHookReject`、`pmSeries`、`pmThrottle`、`importResources`)改回 `isfun`,各站點之失敗通道不變(見 `rulebook_timer.md` R-PM-ARG-01 規則 4).
  4. **設計上之例外(非判斷函數,以拋錯或 reject 回報不合格)**: `isUserPw`(輸入非原始字串即同步拋 `'密碼非有效字串'`,`opt` 讀取拋錯亦外拋)、`isUserName`／`isUserIdentify`(回傳 Promise,輸入無效 reject).
  5. **已撤銷之 Proxy 與讀取拋錯之物件之連動語意**: 判斷函數對其回 `false` 後,以判斷函數守門之函數依其失敗通道處理——屬非預期型別之 `opt` 值(物件、字串、函數鍵)依 K3 視為未給(`execCli`／`execCliSession`／`execCliJsonRpc`／`execCliJsonFile`／`execProcess` 之已撤銷 Proxy `opt` 本身、`env`、回調、`args` 由修前之「結果物件／reject 回報原生錯誤」改為視為未給而照常執行;必須參數(`command`、`requests` 元素)為無效並回報固定訊息);容器(`pmMap`、`pmSeries` 之 `rs`)之標籤讀取拋錯由「以該錯誤 reject」改為固定字串 `'rs is not an array or object'`;`fsMergeFiles` 之 `fpsIn` 僅一個元素且讀取即拋錯者由原生錯誤詞彙改為 `'invalid fpsIn: must be a non-empty array'`.讀取本身失敗(存取器拋錯,如 `opt.cwd` 之 getter)仍照既有規則回報錯誤,不受影響.
- 盤點指令: ①以測試為準: `npx mocha --no-parallel test/isThrowFree.test.mjs --timeout 180000`(以 `readdir` 取 `src/is*.mjs` 全集 × 惡意值 19 種,新增之 `is*` 自動入表;另 `opt` 為第 2 參數者 `isint`／`ispint`／`isp0int`／`isDate`／`isenum`／`iseint` 逐一核對);②`git grep -n "Object.prototype.toString.call" -- src` 判型用途只剩 `_tagOf.mjs`、`ispm.mjs`(自帶 try)與非判型用途;③`git grep -n "isFunSafe" -- src test` 應為 0 站點(僅註解中之歷史說明).
- 站點全集(2026-11-19,以惡意值 19 種探測 HEAD 與修後,`is*` 全集 62 個＋轉型 4 個): HEAD 對第 1 參數拋錯者 57 個函數(`isstr` 等全數經 `Object.prototype.toString.call`),修後 3 個——`isUserPw`(例外 4)、`cint`(只在 `opt` 為惡意值時拋,轉型函數非判斷函數,列待裁示)、`cstr`(5 種已撤銷 Proxy 或標籤拋錯者經 lodash `isSymbol` 拋,同上);逐函數表見主控任務報告 `ws492i-修正報告.md`.
- 測試(2026-11-19 ws492i): `test/isThrowFree.test.mjs`(函數全集 × 惡意值逐函數案＋`opt` 惡意案＋內容檢查之具體案)、`test/isfun.test.mjs`(原 `_isFunSafe` 3 案移入並增惡意值案)、`test/_unbox.test.mjs`(`_tagOf` 部分)、`test/isDateStrict.test.mjs`、`test/cbol.test.mjs` 之惡意值案;值軸 `test/tools/hostileValues.mjs`.
- 已知限制: ①`isUserPw`、`cint`(opt)、`cstr`(lodash `isSymbol`)見規則 4 與上列;②lodash 型別函數之其他殘留(`isSymbol`)不在判斷函數範圍;③`getErrorMessage` 等診斷函數自有不拋錯保證(R-DIAG-01),不在本規則.

## R-C1C2-DEF-01 C1／C2 之定義: `cbol` 依 B2、`isDate` 收嚴、`cint` 行為不改而 JSDoc 寫明失真

- 依據: 使用者 2026-11-16「W-21, 1至3都甲」(排程第 492 項;dspec〈輸入參數之檢測機制〉§11〈C1／C2 之定義〉①②③、§3.3 B2、§5.3 C1／C2).
- 規則:
  1. **`cbol` 依 B2**: 只把 `true`、`false`、`'true'`、`'false'`(去頭尾空白後須**全小寫**)轉為對應布林,其餘一律 `false`——`cbol(1)`、`cbol('TRUE')`、`cbol('True')`、`cbol('tRuE')` 由 `true` 改 `false`(破壞性變更第 76 項);`cbol(' true ')` 為 `true`(去頭尾空白)、`cbol(0)`、`cbol('y')`、`cbol('1')` 仍為 `false`.包裝物件依 R-WRAPPER-01 規則 2 照舊拆包(`new Boolean(true)`、`new String('true')` 為 `true`、`new Number(1)` 同 `cbol(1)` 為 `false`);恆回原始布林.
  2. **`isDate` 收嚴**: `true` 者只有「有效之 `Date` 物件(以 `Date.prototype.getTime` 內部槽判定,含跨 realm 與子類別)」與「通過 `isday`／`istime`／`istimems`／`istimeTZ`／`istimemsTZ` 任一之字串」;數字(含 `0`、毫秒時間戳)、數字字串(`'0'`、`'125'`、`'2019'`)、不存在之日期(`'2026-02-30'`)、非規格格式(`'2026/11/16'`、`'2019-01'`、`'2019-01-01T12:34'`、毫秒位數非 3 者)、無效之 `Date`(`new Date('x')`)、包裝物件、偽造 `Symbol.toStringTag` 之物件與 `Date` 之 Proxy 皆為 `false`(破壞性變更第 76 項).
  3. **`opt.onlyCheckDateObject` 既有語意之核對**(使用者 2026-11-16「另於實作時核對」): 與修前相同者——僅判斷是否為 `Date` 物件、不解析字串與數字、無效日期(`Invalid Date`)與跨 realm(vm)之 `Date` 亦為 `true`、`opt` 非布林(含 `new Boolean(true)`、`'true'`、`1`)視為未給;**唯一差異**:修前以 `Object.prototype.toString.call(v) === '[object Date]'` 判定,偽造 `Symbol.toStringTag` 為 `'Date'` 之一般物件與 `Object.create(Date.prototype)` 為 `true`,修後以內部槽判定而為 `false`(偽造者本非 `Date`,下游 0 站,唯一本庫呼叫端 `getDataFromExcelFileU8Arr` 只收真 `Date`).
  4. **`cint` 行為不改**,JSDoc 寫明超出安全整數範圍(絕對值大於 `Number.MAX_SAFE_INTEGER`)會失真(`cint(2 ** 60)` 為 `1152921504606847000`、`cint('9007199254740993')` 為 `9007199254740992`),要精確先以 `iseint` 判斷(同 `cdbl(Infinity)` 之甲).
  5. **不改者**(使用者已裁): `isnum('0x10')`、`isnum('Infinity')` 為 `true`(2026-10-31、2026-11-12 裁定,`is*` 依數學定義、`ise*` 判可用值);`ispint(Infinity)`、`ispint(1e10)`、`ispint('0x10')` 為 `true`(下游 ftp492 提出,主控第 4 點裁定已涵蓋,JSDoc 已寫「要判可用、可計算之整數用 `iseint`」,以 `test/isintMathDefinition.test.mjs` 核實).
- 盤點指令: `git grep -n -E "\bcbol\(|\bisDate\(" -- src`(本庫 `cbol` 0 站、`isDate` 1 站 `getDataFromExcelFileU8Arr`〔`onlyCheckDateObject`〕);下游全部自有套件之 `src/server/toolg/test`: `cbol` 2 站(`w-fetch-web getOpt` 先經 `isbol` 守門故不受影響、`w-web-task procCore` 之 `asTask` 來自 HTTP 載荷,外部呼叫端送 `1`／`"TRUE"` 時由開任務改為不開)、wsemi 之 `isDate` 0 站;固定舊行為之下游測試 0 處.
- JSDoc: `cbol`(B2 表、例)、`isDate`(收嚴規則、例、`onlyCheckDateObject`)、`cint`(失真與 `iseint`)已改寫,舊例(`'2019'`、`'2019-01'` 等為 `true`)已移除.
- 測試(2026-11-19 ws492i): `test/cbol.test.mjs`(改寫,B2 各值)、`test/isDateStrict.test.mjs`(新,正反例、不存在之日期、無效 `Date`、跨 realm、偽造、包裝物件、已撤銷 Proxy、`opt`)、`test/isDate.test.mjs`(既有 32 案依新規則翻轉為 `false`)、`test/cint.test.mjs`(失真行為不改、`iseint` 對照、JSDoc、包裝物件)、`test/isintMathDefinition.test.mjs`.
- 已知限制: ①`isDate` 之字串判定依賴 dayjs(同 `isday` 等):UMD 未載入 dayjs 全域時拋 `invalid dayjs`(修前 `isDate` 以 `new Date` 解析不依賴 dayjs);②不帶時區之字串依本機時區判定,本機夏令空窗內不存在之本地時刻為 `false`(同 `istime` 契約);③`isDate` 不收 `YYYY-MM`(年月另以 `ismonth` 判斷).

## R-C1-HOSTILE-01 轉型與驗證函數對惡意值不拋錯(C1;排程第 492 項第 10 批 ws492k,第 551 項;ws492i Q-3)

- **規則**(dspec〈輸入參數之檢測機制〉§5.3 C1: 無法轉型者回預設值、不拋錯;K3: opt 給了而讀取即拋錯視為未給):
  1. **主參數**: `cdbl`、`cint`、`cstr`、`cbol` 對 `test/tools/hostileValues.mjs` 全集(19 值: 已撤銷之 Proxy〔物件、函數、陣列〕、陷阱全拋錯之 Proxy、讀取內部標籤或常讀鍵即拋錯之物件、元素存取即拋錯之陣列)皆回預設值(`0`、`0`、`''`、`false`),不拋錯.`cstr` 原經 lodash `isSymbol` 對已撤銷之 Proxy 拋錯,改以 `typeof` 判 Symbol/BigInt;**BigInt 與 Symbol 之包裝物件照舊拆包**(內部槽 `BigInt.prototype.valueOf`、`Symbol.prototype.valueOf`;`cstr(Object(1n))` 仍為 `'1'`,偽造 `Symbol.toStringTag` 之物件為 `''`).
  2. **opt**: `cint`、`isUserPw` 於入口以內部 `src/_pickOpt.mjs` 取快照(只讀所需之鍵、各鍵一次、讀取拋錯之鍵視為未給;opt 為已撤銷之 Proxy 等亦同);`debug`／`funLog` 以快照上之惰性存取器讀取(只有非預期輸入時才讀,時序同修前).`cint` 於 `useLimitSafe` 且非 `returnWithStateAndMsg` 時之拋錯為設定之契約(非惡意值),不變;`isUserPw` 僅 `pw` 無效依既有契約(C11 驗證器)同步拋固定訊息.
  3. **同形盤點**(只列不改,見 ws492k 報告〈同形盤點〉): 以 `get(opt, …)` 讀 opt 而於已撤銷之 Proxy 拋錯之函數 36 個(編碼、時間字串、`o2j` 族、`str2*`、`u8arr2*`、`trim`、`htmlEncode`／`htmlDecode`、`round`、`strTruncate` 等;`rep`／`replaceObj`／`replacePlus`／`repObj`／`sepInt`／`strDiff`／`strDiffToHtml`／`strFindFuzz`／`strFindSimilar`／`cache` 為必須參數依設計拋錯,不在內);`cfilesize`、`cfinancial`、`dig`、`digExp` 已不拋錯,以測試鎖定.
- **站點**: `src/cstr.mjs`、`src/cint.mjs`、`src/isUserPw.mjs`、`src/_pickOpt.mjs`(新).
- **測試**: `test/convHostile.test.mjs`(19 值 × 4 轉型函數、19 值與 3 個存取器鍵作 `cint` 之 opt、`isUserPw` 之 19 值與 16 個鍵、`cstr` 包裝物件、`debug` 惰性讀取、8 個轉型與格式化函數 × 3 個引數位置);變異 `M27`～`M31`、`M39`～`M41`(`_pickOpt` 之 `M30`、`M41` 為等價變異).
- **已知限制**: ①快照只對 `cint`、`isUserPw` 套用,同形之 36 函數待裁示;②`isUserPw` 之 `forbiddenChars`、`commonPasswordBlacklist` 等陣列值內之元素讀取拋錯不在本批(opt 本身之讀取已安全).

## R-JUDGE-NATIVE-01 判型改語言原生或內部槽,不被偽造之 `Symbol.toStringTag` 通過(排程第 492 項第 10 批 ws492k,第 552 項;ws492i Q-4)

- **規則**(比照 `isstr`,判斷函數只收原始值;C2 永不拋錯):
  1. `isnull`(`v === null`)、`isundefined`(`v === undefined`)、`isbigint`(`typeof v === 'bigint'`,`Object(1n)` 為 `false`).
  2. `isab`、`isu8arr`、`isu16arr`: 以內部槽判定(單一擁有者 `src/_slotKind.mjs`: `ArrayBuffer.prototype.byteLength` 存取器、`%TypedArray%.prototype[Symbol.toStringTag]` 存取器,載入時取得,其後被覆寫不影響;對非該類之物件〔含 Proxy、已撤銷之 Proxy、原始值〕拋 TypeError 一律視為否).偽造 `Symbol.toStringTag` 之一般物件為 `false`,被覆寫標籤之真實例與跨 realm(`vm`、iframe)之真實例為 `true`,Node 之 Buffer 為 `isu8arr` 真,SharedArrayBuffer 非 ArrayBuffer,**Proxy 包裝之 ArrayBuffer 為 `false`**(舊標籤判定為 `true`).缺存取器之極舊引擎退為標籤判定.
  3. **停於該函數(下游有依賴現行語意而會改變結果,列需裁示)**: `isarr`(下游依賴 `Symbol.toStringTag` 讀取拋錯之陣列 Proxy 判為 `false` 之寫入守門;`Array.isArray` 對其為 `true`)、`isobj`(下游 w-serv-orm `getMapOrm` 巢狀節點分類依賴偽造 `'Object'` 標籤者仍被掃描)、`isblob`／`isfile`(以標籤判型為跨實作替身之設計);`ispm` 之標籤判定與 thenable 邏輯不變.
- **站點**: `src/isnull.mjs`、`src/isundefined.mjs`、`src/isbigint.mjs`、`src/isab.mjs`、`src/isu8arr.mjs`、`src/isu16arr.mjs`、`src/_slotKind.mjs`(新);`src/_tagOf.mjs` 仍為 `isarr`／`isobj`／`isblob`／`isfile`／`_unbox` 所用.連帶: `cstr` 對 BigInt／Symbol 包裝物件改自拆包(行為不變).
- **盤點指令**: `Grep "_tagOf" src/`(預期 `isarr`、`isobj`、`isblob`、`isfile`、`_unbox`);下游盤點見 ws492k 報告〈下游盤點〉(131 個自有套件、6134 檔: 直接呼叫 `isbigint` 0、`isab` 1〔w-gis〕、`isu8arr` 3、`isu16arr` 0、`isnull`／`isundefined` 約 10 站,皆以正常值呼叫).
- **測試**: `test/judgeNativeTag.test.mjs`(6 函數: 真實例、偽造標籤〔屬性與 getter〕、被覆寫標籤、子類別、跨 realm、Proxy 包裝、Buffer、SharedArrayBuffer、hostileValues 19 值皆 `false`、載入後全域覆寫不影響)、`test/isbigint.test.mjs`(包裝物件翻轉)、`test/obj2u8arr.test.mjs`(Proxy 包裝之 ArrayBuffer 不再打包);變異 `M32`～`M38`.
- **已知限制**: ①`isarr`／`isobj`／`isblob`／`isfile` 仍可被偽造標籤通過(待裁示);②Proxy 包裝之 ArrayBuffer 舊為 `true` 者(僅測試夾具使用)改 `false`.
