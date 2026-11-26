# 規則帳本(資料與型別判定、格式轉換)

本檔自 `sgud/rule/rulebook.md` 搬移而來(2026-10-28 整理,wsemi-run08):各節之節號與標題不變、內容逐字未動;全部條目之索引見 `sgud/rule/rulebook.md`〈索引〉.

2026-11-27(wsr1,排程第 599 項①)依類型拆檔(原約 35.6KB): R-EXCEL-READ-01 移至 `sgud/rule/rulebook_excel.md`、R-FILETYPE-01 移至 `sgud/rule/rulebook_filetype.md`;節號與標題不變、內容逐字搬移,本檔留判定與型別、字串編碼、環境判斷之各條.

## R-UTF8-01 字串與 Uint8Array 之 UTF-8 互轉:原生、失敗不失真

- 單一擁有者: `src/str2u8arr.mjs`、`src/u8arr2str.mjs`;呼叫端 `src/obj2u8arr.mjs`、`src/u8arr2obj.mjs`.
- 規則:
  1. 字串→位元組用原生 `TextEncoder`;編碼前檢查良構(`String.prototype.isWellFormed`,無此方法之環境以正則判孤立代理碼元),含孤立代理碼元者視為失敗,不得讓 TextEncoder 靜默換成 U+FFFD.
  2. 位元組→字串用 `new TextDecoder('utf-8', { fatal: true, ignoreBOM: true })`:非合法 UTF-8 視為失敗,不得靜默換成 U+FFFD,也不得回成功之空字串;開頭 BOM 保留為 U+FEFF,與編碼端往返一致.
  3. 失敗依 wsemi 慣例回空值,`returnWithStateAndMsg` 時回 `{ state: 'error', msg }`;內部呼叫其他轉換函數須以 `returnWithStateAndMsg` 取狀態,不得以預設模式吞掉錯誤.
  4. 不引入第三方套件做 UTF-8 轉換: fflate 之 `strToU8`/`strFromU8` 於現代環境即原生 TextEncoder/TextDecoder 之預設選項(去除開頭 BOM、壞資料換成 U+FFFD,fflate 0.8.3 `esm/index.mjs:1678-1680`、`:1798`、`:1837`),無法滿足規則 1、2.
- 盤點指令: 以 Grep 於 `src/` 搜 `new TextEncoder|new TextDecoder|crypto-js/enc-utf8`.
- 站點全集與判準(2026-10-10 盤點):
  - `src/str2u8arr.mjs`、`src/u8arr2str.mjs`: 已套.
  - `src/str2b64.mjs`、`src/b642str.mjs`(crypto-js enc-utf8,字串與 base64 互轉): 未套(本規則訂立時之範圍外);其語意同為失敗不失真(孤立代理拋 URIError、非合法 UTF-8 拋 Malformed UTF-8 data,BOM 保留),僅效能較差.
  - `src/aes2str.mjs`(crypto-js AES 解密後之 UTF-8): 刻意不套,屬 crypto-js AES 流程之一環.
  - `src/execCli.mjs`、`src/execCliSession.mjs`、`src/_execProcessCodec.mjs`(外部程序輸出之串流解碼): 刻意不套,輸出顯示不可因壞位元組中斷,以 U+FFFD 取代並另有字碼頁判定.
- 測試: `test/str2u8arr.test.mjs`(UTF-8 位元組、孤立代理失敗、無 isWellFormed 之退路、大字串)、`test/u8arr2str.test.mjs`(BOM 保留、6 種非法 UTF-8 失敗、subarray 與 Buffer、300 筆隨機良構字串往返並與 Buffer 之 UTF-8 對照);呼叫端 `test/obj2u8arr.test.mjs`、`test/u8arr2obj.test.mjs`.指令: `npx mocha --no-parallel test/str2u8arr.test.mjs test/u8arr2str.test.mjs test/obj2u8arr.test.mjs test/u8arr2obj.test.mjs --timeout 180000`.
- 變更紀錄:
  - 2026-10-10: 由 crypto-js 經 base64 轉換改為原生 TextEncoder/TextDecoder;3000 筆隨機良構字串新舊輸出一致;`u8arr2str` 遇非法 UTF-8 由 `{ state: 'success', msg: '' }` 改為 `{ state: 'error' }`(原呼叫 `b642str` 未取狀態而吞掉錯誤),預設模式仍回 `''`;孤立代理之錯誤訊息由 `str2b64: URIError: URI malformed` 改為 `invalid str, contains lone surrogates`;50MB 往返由約 9.3 秒降為約 0.12 秒.

## R-ENV-01 環境判斷函數(回布林)於非目標環境回 false、不拋錯

- 依據: 主控 run01 複審裁示 11(⑤ 同修).
- 規則: 讀取瀏覽器全域(location、navigator、document)前以 `typeof X !== 'undefined'` 防護;未宣告之全域直接讀取為 ReferenceError,`if (location)` 不是防護.isDev 用 `typeof location`(Web Worker 亦有 location,不可改用 isWindow),判準不變(`location.href` 含 localhost 為開發;下游 e2e 依賴此判準).
- 站點全集與判準(2026-10-16,環境判斷 6 函數): isDev(Node 下拋 ReferenceError)、isIE(無 navigator 時拋)、isEleExistByID(無 document 時拋)——修;isWindow、getEnv、isNarrow——已套(以 isWindow 防護).
- isIE 另於 `navigator.userAgent` 非字串時回 false(navigator 存在而無字串 userAgent 之環境).
- JSDoc: isDev、isIE、isEleExistByID 之 `@returns` 補「非瀏覽器環境(無location/navigator/document)回傳false」.
- 盤點指令: Grep `src/` 之 `^\s*if \((location|navigator|document|window)\)`(2026-10-16 為 0 筆)與 `typeof (location|navigator|document|window)`(domDetect、isDev、isIE、isEleExistByID、isWindow).
- 測試(2026-10-16): `test/isDev.test.mjs` 3、`test/isIE.test.mjs` 4、`test/isEleExistByID.test.mjs` 3(`describe(\`<函數> 非瀏覽器環境與判準(R-ENV-01)\`)`;原為占位案);全域替身以 `test/tools/envGlobal.mjs` 之 `withGlobal` 依屬性描述子可還原地移除/替換(Node 24 之 navigator 為可配置 getter).

## R-WRAPPER-01 包裝物件(new String/Number/Boolean)之處理: 判斷函數只收原始值,轉型函數照舊拆包

- 依據(2026-11-19 ws492i 起,**取代** 2026-10-16 之 A-lite〔包裝物件視同其型別、值判定函數拆包〕與 2026-10-31 之規則 4〔`isenum`／`iseint` 為例外〕): 使用者 2026-11-16「W-20 甲」(排程第 492 項;dspec〈輸入參數之檢測機制〉§11〈包裝物件〉:「看起來像字串、數字、布林，但實際上是物件, 用new建構者所得之值會導致判斷(===)失敗, 且用typeof 會無法準確判斷真值型別」→ 判斷函數一律只收原始值,轉型函數照舊拆包);另批 6 裁定③(判斷函數不應拋錯,見 `rulebook_judge.md` R-JUDGE-NOTHROW-01).
- 規則:
  1. **判斷函數(`is*`)只收原始值,包裝物件一律無效(判斷結果 `false`)**: `isstr`(`typeof v === 'string'`)、`isnbr`(`'number'`)、`isbol`(`'boolean'`)、`isnan`(`Number.isNaN`)四個底層函數改以 `typeof`／`Number.isNaN` 判型——**不再讀內部標籤**,故偽造 `Symbol.toStringTag` 為 `'String'`／`'Number'`／`'Boolean'` 之一般物件亦為 `false`;其上之 `isestr`、`isstr0`、`iser`、`isernot`、`isnum` 族(`isnum`、`isint`、`ispint`、`isp0int`、`isnint`、`isn0int`、`isnnum`、`isn0num`、`ispnum`、`isp0num`)、`isDate`、`isday`／`istime`／`istimems`／`istimeTZ`／`istimemsTZ`、`isEmail`、`isStrHas*`、`isUserName`／`isUserIdentify`／`isUserPw` 隨之一致;`isenum`／`iseint` 原即不收,不再為例外.語意相反者 `isernot(Object(p))` 為 `true`(包裝物件有值);驗證函數 `isUserName`／`isUserIdentify` 對包裝字串 reject(同非字串)、`isUserPw` 同步拋固定訊息(既有契約).
  2. **轉型函數(`cdbl`、`cint`、`cstr`、`cbol`)照舊拆包**: 經內部 `src/_unbox.mjs`(先以內部標籤預篩、再以 `String.prototype.valueOf`／`Number.prototype.valueOf`／`Boolean.prototype.valueOf` 內部槽取原始值,不呼叫物件自身之 `valueOf`／`toString`,偽造標籤者無內部槽故原樣回傳)先拆包再轉;`f(Object(p))` 與 `f(p)` 結果相同(含跨 realm 之包裝物件).轉型不再依賴判斷函數收包裝物件.
  3. **以判斷函數守門之函數收到包裝物件即依其類別之失敗通道處理**(隨規則 1 自動成立): opt 之字串、布林、數字鍵視為未給(K3);字串函數之主參數依各函數無效輸入之通道(`strleft` 等回 `''`、`replace` 之 `r` 為包裝字串回 `''`、`getFileType` 回全表、`arrFilterByKeywords` 之元素為 `{ hasKeyword: false, weight: 0 }`、`strFindSimilar` 回空結果、`execCli.opt.input` 等視為未給).
  4. **不經判斷函數而直接判型之入口依同原則**: `src/` 內以 lodash `isNumber` 判型者 5 檔 7 處(`domDrag`〔座標 `x`／`y` 與 `e.buttons`〕、`domDragPointer`〔`e.buttons`〕、`domGetWindowSize`〔視窗尺寸候選〕、`flattenToConn`〔鍵〕、`pseudoRandom`〔種子〕)改用 `isnbr`(與 lodash 之差異只有包裝物件;`NaN`、`Infinity` 照舊為數字,另屬 W-24);`clearXSS` 之包裝 `String` 屬資料樹內之字串值,**清除而非判斷,不得因 `isestr` 只收原始值而略過**(否則未清除之包裝字串轉字串後即可含危險標記),故以內部槽自行拆包後清除(`boxedStringOf`,空字串之包裝物件維持走 `slow` 複製,同修前).
  5. **顯式拆包處(非判斷函數,不變)**: `_cellText`(arrDiff 欄值)、`getltdtkeys`(包裝字串列不貢獻鍵)、`_diagKit`／`maskDiag*`／`getDiagSecrets`(遮罩以內部槽取包裝字串,fail-closed 不可略過)、`cbol`／`cdbl`／`cint`／`cstr`(規則 2).
- JSDoc: `isstr`、`isnbr`、`isbol`、`isnan`、`isestr`、`isstr0`、`isnum` 族、`isDate` 載「只收原始值,包裝物件為 false」與「對任何輸入皆不拋錯」;`cdbl`／`cint`／`cstr`／`cbol` 載「轉型函數照舊拆包」;`@returns` 之「包裝物件依其原始值判定」舊敘述已移除.
- 盤點指令: ①全表 `npx mocha --no-parallel test/isstr.test.mjs --grep "全表" --timeout 180000`(工具 `test/tools/wrapperCases.mjs`,自 `src` 以 readdir 取 `is*` 與 `cbol`／`cdbl`／`cint`／`cstr`,扣環境/DOM/Blob/Promise 9 個,× 23 原始值;判斷函數之包裝物件結果須為 `boolean:false`〔例外 `isernot` 為 `true`、`isUserName`／`isUserIdentify` reject、`isUserPw` 拋固定訊息〕,轉型函數須 `f(Object(p)) === f(p)`;新增之 `is*` 函數自動入表);②直接判型: `git grep -n -E "lodash-es/(isString|isNumber|isBoolean)\.js|instanceof (String|Number|Boolean)" -- src` 應為 0;`git grep -n "Object.prototype.toString.call" -- src` 應只剩 `_tagOf.mjs`、`ispm.mjs`(自帶 try)與非判型用途(`_cellText`、`_numOpt`、`getErrorMessage`、`getObjSize`、`_isRealError`、`_lowerFindCases`、`clearXSS`〔`toStr`〕).
- 測試(2026-11-19 ws492i): `test/isstr.test.mjs` 末段〈包裝物件全表〉(4 案)、各檔「<函數> 包裝物件(R-WRAPPER-01, W-20: 判斷函數只收原始值)」段(`isstr`、`isestr`、`isstr0`、`isbol`、`isnbr`、`isnan`、`isnum`、`isint`、`isn0int`、`isn0num`、`isp0int`、`isp0num`、`iser`、`isernot`、`isUserName`、`isUserIdentify`)、`cbol` 之「轉型函數照舊拆包」段、`test/_unbox.test.mjs`;下游行為隨之改變而改寫之既有案: `arrFilterByKeywords`〈二-1〉、`strFindSimilar`〈三-9〉、`replace`、`getFileType`、`execCli`／`execCliSession`／`execCliJsonRpc`／`execCliJsonFile`／`execProcess`(已撤銷 Proxy 與包裝字串之 opt 改視為未給)、`pmMap`／`pmSeries`(容器標籤讀取拋錯)、`time*TZ2past／expire`(物件 `tNow`)、`isenum`／`iseint` 之 E10／I10.
- 已知限制(2026-11-19): ①`Symbol` 之包裝物件(`Object(Symbol())`)與 `BigInt` 之包裝物件不在本規則內(`cstr` 仍以 lodash `isSymbol` 判 Symbol 包裝,`isbigint` 以內部標籤);②`isSymbol`(lodash)對已撤銷之 Proxy 仍拋錯,故 `cstr(已撤銷之 Proxy)` 仍拋(轉型函數非判斷函數,列待裁示 Q-3);③`isEle`、`isErr` 仍委派 lodash,以 try 包裝回 `false`.

## R-NUM-INPUT-01 數值輸入支援字串型數字;isnum 照字面;排序時無法轉數字者放最末

- 依據: 使用者 2026-09-27 裁示之三條通則(2026-11-22 自本套件之 Claude Code 自動記憶提取).理由: 外部資料常為字串型數字(網頁 input、表格元件轉存、前後端傳遞);空白被當 0 會使數值欄排序退回字典序,或把空格當 0 參與計算.審查者曾主張 `domDrag` 之選項「只收數字以維持原合法集合」,被使用者否決.
- 規則:
  1. **數值輸入一律支援字串型數字**(如 `'12.34'`→12.34、`'5'`→5、`' 7 '`→7): 先轉數字再判定,不可因「原本只收數字」而拒收字串.新寫或修改任何接受數值之函數時預設接受數字字串.十六進位、指數、小數寫法不在本通則延伸範圍(`'0.999…9'`→1、`'1e-324'`→0 轉數字後失真);新式輸入判定 `isenum`／`iseint` 依 R-ENUM-01 另定(視為非預期).
  2. **`isnum` 照字面**: 只有數字(NaN 除外)與數字字串為 true;空字串、純空白或多空白字串(含 tab、換行、全形空白)一律 false;數字前後帶空白者(`' 5 '`)維持 true(否則 `cdbl(' 5 ')` 會變 0).
  3. **排序函數若支援非數字輸入**: 數字與數字字串依數值排最前,其他字串其次,無法轉數字或無法解析者(空格、null、undefined、NaN、布林、物件等)無法排序,一律放最末並維持原順序(同 Excel,空格排最後);已落實於 `arrSort`,`objSortBy` 以 `arrSort` 排序.
- 盤點指令: `git grep -n -E "isnum\(" -- src`(核對呼叫端未把空白字串當 0);排序類 `git grep -n -E "arrSort|objSortBy" -- src`.改動 `isnum` 這類核心判斷後,以差分方式(舊版副本 vs 新版)全面檢查依賴者.
- 測試: `test/isnum.test.mjs`(純空白字串為 false、前後帶空白為 true)、`test/arrSort.test.mjs`〈無法轉數字或無法解析者放最末〉(`arrSort([10, '', 9, 'N/A', ' ', null, 100])` → `[9, 10, 100, 'N/A', '', ' ', null]`)、`test/objSortBy.test.mjs`.
- 現況(2026-11-22 實跑 src): `isnum('   ')`、`isnum('')`、`isnum('\t\n')`、`isnum('　')`、`isnum(NaN)` 為 false;`isnum(' 5 ')`、`isnum('12.34')` 為 true;`cdbl(' 5 ')` 為 5.
- 變更紀錄: 2026-09-27 裁示並落實(`isnum` 純空白為 false、`arrSort` 非數字放最末、`objSortBy` 改用 `arrSort`);2026-11-16 W-20 起判斷函數只收原始值(R-WRAPPER-01),本規則對原始值之語意不變.

## R-JUDGE-SOURCE-01 布林與函數之判斷單一出處: 只經 isbol／isfun

- 依據: 使用者 2026-09-22 明示(2026-11-22 自本套件之 Claude Code 自動記憶提取): `src/` 內判斷布林與函數一律用自有 `isbol`／`isfun`,不得自行 import lodash 之 `isBoolean`／`isFunction`.理由: 同一判斷只有一個出處,之後要換實作(如 `isfun` 由 toString 標籤改委派 lodash)只改一檔.當日已把 `pmQueue`、`treeObj`、`domDragPointer`、`domDragBarAndScroll` 改齊.
- 規則:
  1. 除 `src/isfun.mjs`(委派 lodash `isFunction`)外,`src/` 內不得 import lodash 之 `isFunction`;`isBoolean` 無例外(2026-11 起 `isbol` 自身改以 `typeof v === 'boolean'` 判型,不再 import lodash,見 R-WRAPPER-01).
  2. 其他 lodash 判斷函數(`isNumber` 等)不受本規則,依 R-WRAPPER-01 規則 4 與各檔既有用法.
  3. `isfun` 委派 lodash 後與原實作之唯一差異: generator 函數為 true;async generator(`async function*`)於 lodash 4 仍為 false(已入 JSDoc);判定拋錯(已撤銷之 Proxy 等)回 false(R-JUDGE-NOTHROW-01).
- 盤點指令: `git grep -n -E "lodash-es/(isBoolean|isFunction)" -- src`(2026-11-22 只命中 `src/isfun.mjs:1`).
- 測試: `test/isbol.test.mjs`、`test/isfun.test.mjs`;守門測試 `test/judgeSourceGuard.test.mjs`(2026-11-27 wsr1,排程第 599 項③;掃描器 `test/tools/judgeSourceScan.mjs` 以 acorn 解析、不計註解與字串;站點之形含單檔路徑之預設匯入〔含無副檔名、`lodash/`〕、自整包或彙整模組〔`lodash-es`／`lodash` 與其 `lodash.js`、`lodash.default.js`、`lang.js`、`lang.default.js`〕之具名匯入〔含別名與字串名〕、命名空間或預設匯入〔計為 `'*'`〕、獨立套件 `lodash.isfunction`／`lodash.isboolean`、上述來源之 re-export 與 `export *`、字面來源之動態 `import()` 與 require 類呼叫〔`require`、名稱含 require 者、`createRequire(...)` 之結果所賦之變數、`createRequire(...)(...)`〕;非字面之來源〔字串相加〕無法判定;附 26 正例與 10 反例之盲點自測(彙整模組、獨立套件與 require 類為獨立複審所補);掃描檔數須 ≥500,允許之站點以各檔釘住為 `{ 'isfun.mjs': ['isFunction'] }`,新增或消失皆失敗;`WSEMI_JUDGE_SRC` 可改掃他資料夾供變異驗證).
- 盤點指令(守門測試之外之人工核對)同上;2026-11-27 仍只命中 `src/isfun.mjs:1`.
