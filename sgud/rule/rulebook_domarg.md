# 規則帳本(DOM 與下載函數之輸入檢測)

本檔記 2026-11-18(ws492e,排程第 492 項第 4 批:DOM 與下載)新增之規則.規格為主控 dspec〈輸入參數之檢測機制〉§11〈DOM 函數解除「先不動」(W-17)〉〈domAlert 之樣式 opt(W-14)〉、§5.1(失敗通道)、§5.3 C18、K2、K3、K4、V17、V19、V20、P1、P3、Q3-c.全部條目之索引見 `sgud/rule/rulebook.md`〈索引〉;破壞性變更見 `sgud/rule/rulebook_breaking_71on.md` 第 72 項;現況見 `sgud/state/state_dom與資料.md` 最前節.

## R-DOM-ARG-01 DOM 函數之輸入檢測通則:改畫面者拋錯、查詢者回空、回 Promise 者 reject,皆固定訊息、不帶值、先於任何改動

### 規則

1. **會改動畫面、觸發事件、掛載監聽者**:輸入無效即**同步拋 `Error`**,訊息為固定字串、格式 `invalid <名稱>: must be <種類描述>`(V19)、**不含輸入值**(V20),且**先於任何改動**(不改屬性與樣式、不建元素、不起計時器、不掛監聽、不建 evem;V17).多個參數皆無效時依簽章順序先報前者.
2. **查詢類**(同 `domIsFocused`):輸入無效不拋錯、不輸出 console、不帶值,回 `false`／`null`／空陣列 `[]`;選擇器語法錯誤、無 `document`(非瀏覽器環境)亦同,不外洩原生 `SyntaxError`(其訊息含選擇器全文).
3. **回傳 Promise 者**(`domShowInputDatatime`、`files2data`、`domShowImages`):不同步拋,以固定字串 reject(§5.1);reject 值維持各函數既有之字串型式.
4. **數值檢測通過即轉型再使用**(Q3-c、K4):座標、`left`／`top`、`amount`／`w1`／`w2`、`delay`／`opacityIni` 皆以 `isenum` 判定、`cdbl`／`Number` 轉換,不以未轉型之原值使用;每個鍵或參數只讀一次.
5. **包裝物件**(`new String` 等)依 §3.4 S1 視為無效者,本批以 `typeof` 判原始值(`domFind`／`domFinds`／`domTriggerEvent`／`domAlert` 樣式 opt 與 `type`／`domScroll*` 列舉鍵／`domCompareText` 與 `domRenderMarkdownMind` 之字串參數);`isestr`／`isstr` 系之包裝物件政策屬 W-20 另批,本批沿用其現行判定(`downloadFileFrom*` 之 `fileName`、`domSetAttr`)並於測試註明.

### 站點全集(本表 19 函數;`domAlert`、`domScroll*`、`domFade*` 見 R-DOM-OPT-01,`downloadFileFrom*`、`downloadExcelFileFromData` 見 R-DL-ARG-01,`color` 見 R-COLOR-ARG-01;本批共 30 函數)

| 函數 | 類別 | 無效輸入之處置(訊息皆不帶值) | 測試 |
|---|---|---|---|
| `domFind(query)` | 查詢 | `query` 非非空原始字串、語法錯誤、無 document → `null`,不呼叫原生 API | `test/domFind.test.mjs` |
| `domFinds(query)` | 查詢 | 同上 → `[]` | `test/domFinds.test.mjs` |
| `domElementsFromPoint(x, y)` | 查詢 | 座標非有效數字 → `[]`,不呼叫原生 API(原生會把 `null`／`''`／`true`／`[]` 轉成 0 或 1);通過者 `cdbl` | `test/domElementsFromPoint.test.mjs` |
| `domRemove(inp)` | 改畫面(回布林) | 已脫離 DOM 之元素、無效輸入、無效選擇器、無符合 → `false`;至少移除一個 → `true` | `test/domRemove.test.mjs` |
| `domCancelEvent(e)` | 事件(回布林) | `e` 假值、不可取消、呼叫過程拋錯 → `false`;完成 → `true`;不再回訊息字串(P5) | `test/domCancelEvent.test.mjs` |
| `domSetAttr(ele, attr, val)` | 改畫面 | `val === ''` 為合法值(布林屬性),回 `''`;其餘維持回 `null` | `test/domSetAttr.test.mjs` |
| `domTriggerEvent(ele, eventName)` | 觸發事件 | `invalid ele: must be an element`;`invalid eventName: must be a non-empty string`(原生會把 `undefined` 轉 `'undefined'` 照常派發) | `test/domTriggerEvent.test.mjs` |
| `domTooltip(ele, content, option)` | 改畫面 | `invalid ele: must be an element`;`content` 給了而非字串 `invalid content: must be a string`(`undefined`／`null`／`''` 用 `ele.innerHTML`) | `test/domTooltip.test.mjs` |
| `domDropFiles(ele, opt)` | 掛監聽 | `invalid ele: must be an element`,先於 `getTrace` | `test/domDropFiles.test.mjs` |
| `domDragBarAndScroll(panel, bar, opt)` | 掛監聽 | `invalid panel: must be an element`、`invalid bar: must be an element`,先於讀 `opt`(原 panel 無效於掛載時拋原生 TypeError、bar 無效靜默通過至每次按下 panel 才拋) | `test/domDragBarAndScroll.test.mjs` |
| `domShowInputDatatime(time, opt)` | Promise | `opt.eleRef` 與 `document.activeElement` 皆非元素、或無 `parentNode` → reject `invalid opt.eleRef: must be an element, or document.activeElement must be an element`,先於移除前次輸入框;原「無參考元素時改接 body」之分支實質不可用(其後之 `eleRef.addEventListener` 對 `null` 拋錯)而移除 | `test/domShowInputDatatime.test.mjs` |
| `files2data(files)` | Promise | `invalid files: must be an array of File`;`invalid files[i]: must be a File`(含 Blob、`null`、空洞,i 為第一個無效索引,每元素只讀一次);讀取失敗 `can not convert files to base64`;空陣列合法 | `test/files2data.test.mjs` |
| `domShowImages(eleImg, eleGroup, opt)` | Promise | `invalid eleImg: must be an element`;`eleGroup` 非元素 → 視為未給(單圖,K3,不 reject);元素但無 `img` → `invalid eleGroup: must contain at least one img element` | `test/domShowImages.test.mjs` |
| `domRipple(ele, event, opt)` | 改畫面 | `ele` 非元素 → 不動作(維持,2026-11-02 先不動);`event` 非物件或 `clientX`／`clientY` 非有效數字 → `invalid event: must be an event object with valid clientX and clientY`,先於改寫 `ele.style`(原改寫後才拋原生 TypeError 或寫入 `NaNpx`);兩者皆無效時 `ele` 優先 | `test/domRipple.test.mjs` |
| `domRenderMarkdownMind(ele, markdown, opt)` | 改畫面 | 同步拋 `invalid ele: must be an element`、`invalid markdown: must be a string`(空字串合法)、`invalid markmap: must be loaded as a global object with Transformer and Markmap`;檢測序 ele、markdown、markmap,先於清空 `ele.innerHTML`(原 ele 無效回被 reject 之 Promise 而成功回同步物件,P1) | `test/domRenderMarkdownMind.test.mjs` |
| `domCompareText(ele, title, strOld, strNew, opt)` | 改畫面 | 同步拋 `invalid ele: must be an element`、`invalid strOld: must be a string`、`invalid strNew: must be a string`(取代 `Promise.reject('invalid ele')`) | `test/domCompareText.test.mjs` |
| `bodyLog(...args)` | 改畫面(C18) | 無 `document` 或取不到 `body` 元素 → 不動作、不拋錯(W-03;原 `ReferenceError`／`TypeError`) | `test/bodyLog.test.mjs` |
| `domGetFileAccept(kind)` | 查詢 | 行為不改,JSDoc 補寫:非字串亦非有效陣列 → `'*'`(K3);字串或有效陣列無符合 → `''` | `test/domGetFileAccept.test.mjs` |
| `domGetFiles(ele, sizeMbLimit)` | 查詢 | 超限之 `errs[i]` 為固定字串 `invalid files[i]: must be <= sizeMbLimit`(不含大小與上限值,V20 ②);`@returns` 更正為物件 `{ files, errs }` | `test/domGetFiles.test.mjs`、`test/optValG7dom.test.mjs` |

## R-DOM-OPT-01 opt 逐鍵檢測:非預期視為未給、改用預設,不夾限、不直通未知鍵

### 規則

1. **`domAlert` 四個樣式字串 opt**(`textColor`／`backgroundColor`／`borderColor`／`shadowStyle`;W-14,縮限 2026-11-12 D6 之「行為不改」):只認**原始字串**,`null`、非字串、包裝物件、讀取拋錯 → 該欄 JSDoc 預設(`#000`、`#fff`、`#ebeef5`、`0 2px 12px 0 rgba(0,0,0,.1)`);**空字串為合法值,表示不要該樣式**(輸出 `color:;` 等,由瀏覽器處理);字串去分號後直接放入樣式(D6 安全說明維持:不可傳未經檢查之外部文字).`opt.type` 只認內建圖標之**自有鍵**(`success`／`warning`／`error`／`infor`／`cancel`,`infor`、`cancel` 原已可用而未載入 JSDoc,現補載),不經原型鏈判定(原 `haskey` 以 `in` 判定,`'toString'` 等使 icon 變函數而被插入函數原始碼).
2. **`domScrollIntoView`／`domScrollTo`**(W-05):`opt` 逐鍵檢測、不直通未知鍵給原生 API.`behavior` ∈ `auto`／`instant`／`smooth`,非預期改預設 `smooth`(原 `undefined` 會覆蓋預設而瞬間捲動,`null`／非法列舉字串使原生拋 `TypeError`);`block`／`inline` ∈ `start`／`center`／`end`／`nearest`,非預期不傳(由瀏覽器用其預設);`left`／`top`(`domScrollTo`)須為有效數字(`isenum`＋`cdbl`),非預期不傳(原生會把 `NaN` 轉成 0 而使該軸歸零).單一擁有者 `src/_scrollOpt.mjs`(內部模組不匯出):每鍵只讀一次、讀取拋錯視為未給.
3. **`domFadeIn`／`domFadeOut`**(Q1-h):`opt.delay` 以 `isenum`(`use: 'timer'`,0~2147483647,可帶小數、數字字串)、`opt.opacityIni` 以 `isenum`(`use: 'ratio'`,0~1)判定,非預期改預設(`delay` 0;`opacityIni` In 為 0、Out 為 1),**不夾限**(原 `cdbl` 使 `null`／`'abc'`／包裝物件變 0,Out 之預設 1 因而變全透明起算而無動畫;`Infinity` 夾為 `MAX_VALUE`;超出 0~1 夾限);JSDoc 原稱 `delay` 為整數,實為計時毫秒(可帶小數).`opt.debug === true` 時固定詞彙警告(`optVal` 單一擁有者).
4. **`domShowImages.eleGroup`**:帶預設值之位置參數視同 opt 鍵(K2/K3),見 R-DOM-ARG-01.

### 測試

`test/domAlert.test.mjs`〈domAlert 樣式字串opt與type(W-14)〉(4 鍵 × 12 種非預期值 ＋ 空字串／去分號／getter 拋錯 ＋ type 5 個自有鍵與 16 種非預期值)、`test/domScrollIntoView.test.mjs`、`test/domScrollTo.test.mjs`、`test/domFadeIn.test.mjs`、`test/domFadeOut.test.mjs`(含交給 `setTimeout` 之引數之觀察:假計時器對負數與超出上限者一律改 1 毫秒而使序列相同,須以包裝觀察引數本身才能抓出夾限／直傳之變異).

## R-DL-ARG-01 下載族:同一通道,輸入無效即同步拋固定訊息,先於環境檢查

### 規則

1. `downloadFileFromB64`、`downloadFileFromBlob`、`downloadFileFromText`、`downloadFileFromU8Arr` **同一通道**(V16 同層一致;`U8Arr`、`Text` 原為 `console.log` 後 return,屬同族一併改):`fileName` 非非空字串 `invalid fileName: must be a non-empty string`;`b64` 非非空字串 `invalid b64: must be a non-empty string`;`blob` 非 Blob(File 亦為 Blob)`invalid blob: must be a Blob`;`ccont` 非字串(空字串合法)`invalid ccont: must be a string`;`u8a` 非 Uint8Array `invalid u8a: must be a Uint8Array`.檢測順序為簽章順序,**先於環境檢查**:無 `window` 時有效輸入維持 `console.log('no window')` 後 return(不拋錯),無效輸入照拋(結果不隨環境而異).
2. `downloadFileFromText.withBOM` 為帶預設值之位置參數:非布林視為未給、改用預設 `true` 並照常下載(原整個下載被放棄).
3. `downloadExcelFileFromData`(async,Excel 類既有 `{ error }` 通道維持):`invalid fileName: must be a non-empty string`、`invalid fileName: must not contain a NUL character`(R-FS-INVALID-PATH-01)、`invalid data: must be an array`;寫檔失敗 resolve `{ error: 'operation failed (code <錯誤碼>)' }`(`_fsErrMsg` 單一擁有者,不含路徑;原含 NUL 之檔名與寫檔失敗以 Node 原生錯誤 reject 而回顯路徑);不再 `console.log` 帶出 `fileName` 與整份 `data`(V20).
4. 與派工書「下載類以固定訊息 reject」字面之差異:四個 `downloadFileFrom*` 為同步無回傳值之函數,依 §5.1「同步且有副作用者同步 throw」採同步拋(改回 Promise 會使輸出型別改變〔P1〕,且既有呼叫端不 await 而產生未處理之 rejection);見 state 之待裁示.

### 測試

`test/downloadFileFromB64.test.mjs`、`test/downloadFileFromBlob.test.mjs`、`test/downloadFileFromText.test.mjs`、`test/downloadFileFromU8Arr.test.mjs`(共用載具 `test/tools/domArgKit.mjs` 之 `mkDownloadEnv`)、`test/downloadExcelFileFromData.test.mjs`.

## R-COLOR-ARG-01 `color` 之必須參數與訊息

### 規則

1. `amount`(`modSaturate`／`modLighten`／`modBrighten`／`modHue`)與 `w1`、`w2`(`mix`)為必須參數,須為 0~1(含端點)之有效數字(`isenum`,數字字串可),通過後 `cdbl` 轉數字再使用,否則拋 `invalid amount: must be a number from 0 to 1`、`invalid w1: …`、`invalid w2: …`(原無檢測:`undefined`／`'abc'`／`NaN` 得 `rgb(NaN, NaN, NaN)`、數字字串以 `+=` 串接、`null` 被當 0;`w2` 誤報 `w1`).單一擁有者 `toRatio`.
2. 顏色參數無效之訊息與 console 不回顯輸入(V20;原 `console.log('color=', color)`、`can not parse color: <字串>`、`can not parse color: <整個物件之 JSON>`):`invalid color: must be a string or an object`、`invalid color: must be a valid color`;解析器自拋之固定訊息仍以 `console.log(err)` 輸出(不含輸入值).
3. 其餘訊息改 V19 格式:`invalid num: must be an integer`(原 `num is not an integer`)、`invalid fmtOutput: must be one of the output formats`(合併原 `fmtOutput is not a string` 與 `invalid fmtOutput`;**只認 `kpCv` 自有鍵**,原 `kpCv[fmtOutput]` 對 `'constructor'` 等為真).
4. `interp` 內部自算之權重經 `mixCore`(不檢測、維持原輸出):重複之漸變鍵使 `r0 === r1` 時權重為 `NaN`,維持得 `'rgba(NaN, NaN, NaN, NaN)'` 而不拋錯(不屬本批改動).

### 測試

`test/color.test.mjs`〈color 輸入檢測(ws492e)〉(4 函數 × 24 種無效 amount、`mix` 之 w1／w2 各 24 種、數字字串等同數字、V20 console 不含輸入、26 個轉換方法之無效顏色同訊息、`fmtOutput` 8 種、`num`、`interp` 重複鍵);既有 `invalidInputQ1`、`isenumCallersCalc`、`objIterG3Runner` 之舊訊息斷言依新訊息更新.

## 已知限制與未納入(2026-11-18)

- **P3 主次參數處置不一**:`domRipple` 之 `ele` 無效仍不動作(2026-11-02 先不動),`event` 無效拋錯;待下一輪統一 C18「元素不存在」通道時一併定.
- **未納入本批**:`importResources`(C13,Promise 與流程)、`getFileAccept.groupBy`(E5)、`getFileHash`／`getFileBasicHash`／`getFileXxHash` 之 `console.log('inp', inp)`(E2,ws492d 待裁示第 3 項)、`domDetect`／`domDrag` 之 `console.log` 帶值(N-C,批 5)、`domIsClientXYIn`／`domIsFocused`／`domElementsFromPoint` 之 `console.log(err)`(輸出原生錯誤物件而非輸入值,維持).
- **`color` 解析過寬**未改(`'#1g2233'` 得 r=1、`'rgb(255)'` 缺分量補 0、`strIsHex` 未錨定):屬收嚴型,下游用法未盤,待裁示.
- 包裝物件(W-20):`isestr`／`isstr` 系之行為不在本批.
- 真實瀏覽器語義(選擇器解析、事件派送、捲動、下載、FileReader、viewer.js、tippy、markmap 之渲染)非單元測試所能驗證;`domFind`／`domFinds`／`domElementsFromPoint`／`domRemove`／`domSetAttr`／`domCancelEvent`／`domTriggerEvent`／`domScrollTo`／`domScrollIntoView`／`domRipple`／`domFadeIn`／`domFadeOut`／`domGetFiles`／`files2data`／`bodyLog`／`domAlert`／`downloadFileFromB64`／`Blob`／`Text`／`U8Arr`,及 `domDropFiles`／`domShowInputDatatime`／`domDragBarAndScroll` 之無效輸入,已以真 Chromium 對修前修後並排實測(見 `sgud/state/state_dom與下載輸入檢測.md`);`domTooltip`／`domShowImages`／`domCompareText`／`domRenderMarkdownMind` 與上述三者之有效路徑只以假 DOM 與替身驗證.
