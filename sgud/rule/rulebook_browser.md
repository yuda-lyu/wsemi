# 規則帳本(瀏覽器開啟分頁與彈窗訊息)

本檔記 2026-11-12(ws430,排程第 430 項第一批;規格第 199 項 C18)新增之規則.規格為主控 dspec〈輸入參數之檢測機制〉§5(失敗通道:同步且有副作用者 throw,先於任何副作用)、§6(訊息 `invalid <名稱>: must be <種類描述>`、不回顯值)、§11 Q1-g 下〔使用者 2026-11-12 定〕之 `openLink`、`openLink` 之協定與環境、`openLink` 之 C4／C5、`domAlert`、`browserView` 系各條.全部條目之索引見 `sgud/rule/rulebook.md`〈索引〉;破壞性變更見 `sgud/rule/rulebook_breaking_65on.md` 第 65 項.

## R-BROWSER-OPEN-01 開分頁類函數(`browserView` 系、`openLink`):無效即同步拋錯且先於副作用、開不成即拋錯、Blob 網址延遲釋放、協定與類型不設白名單而以文件載明責任

### 規則

1. **輸入無效即同步 throw,先於建 Blob、建元素與開分頁**,訊息固定詞彙、不含值;**品牌以內部槽判定(單一擁有者 `src/_browserData.mjs`,內部模組不匯出)**: 字串以 `typeof`(只收原始字串,規格 §3.4 S1／S2,包裝物件 `new String` 無效);Blob 以 `Blob.prototype.size` 之內建存取器;ArrayBuffer 以 `ArrayBuffer.prototype.byteLength` 之內建存取器(SharedArrayBuffer 拋錯即無效)且未分離(`detached` 存取器,執行環境無者略過);檢視以 `ArrayBuffer.isView` 再取其內建 `buffer` 存取器之底層緩衝區須同上;Uint8Array 以 `%TypedArray%.prototype[@@toStringTag]` 之內建存取器取內部名稱.不採 `Object.prototype.toString` 之標籤(可由 `Symbol.toStringTag` 偽裝),不呼叫輸入之方法或存取器(不可讀之 Proxy、拋錯之 getter 一律無效而不外洩其錯誤),跨 realm(iframe、vm)之真物件有效(2026-11-12 外審 terra 1～4 後改定).複核後補: 執行環境無 `detached` 存取器(ES2024 前)者,零長度之 ArrayBuffer 再以 `new Uint8Array(v)` 是否拋錯區分已分離與有效(複核 N1);Blob 之 `size` 存取器於呼叫時才取並快取,模組載入後才提供 Blob 之環境亦可用(N5);**已知限制**: Node 之 Blob 以屬性(`kHandle`)判定,Proxy 包裝之真 Blob、以真 Blob 為原型之物件於 Node 會通過(瀏覽器拒收;本系列需 window 與 document,實務只在瀏覽器執行)(N2).
   - `browserView(data, type)`: `data` 須為原始字串(可空)、Blob(含 File)、可用之 ArrayBuffer 或底層可用之檢視,否則 `invalid data: must be a string, Blob, ArrayBuffer or ArrayBufferView`;`type` 須為非空之原始字串,否則 `invalid type: must be a non-empty string`.
   - 包裝函數各自先檢首參數與 `type`(以本函數之參數名拋出): `browserViewFromText` → `invalid text: must be a string`(原始字串,可空);`browserViewFromBlob` → `invalid bb: must be a Blob`;`browserViewFromU8arr` → `invalid u8a: must be a Uint8Array`(底層共享或已分離者亦無效);後二者另檢 `type`(與 `browserView` 之訊息相同,為等價之先檢).
   - `openLink(url)`: `url` 須為非空之原始字串,否則 `invalid url: must be a non-empty string`.
2. **開不成即 throw(不只 `console.log`、不回 `undefined`)**: 通過規則 1 之 data 仍無法建立 Blob 者(執行環境特有之限制,如 Node 讀取 Blob 子類覆寫之 `size` 而拋錯)以 `invalid data: …` 拋出,不外洩原生錯誤(複核 N2); `browserView` 依序檢查 `window` 與 `document` → `window and document are required`;`Blob` → `Blob is not supported`;`window.URL.createObjectURL` → `URL.createObjectURL is not supported`;`createObjectURL` 拋錯 → `can not create object URL`(不外洩內部錯誤);`window.open` 拋錯 → `can not open window`;`window.open` 回 `null`／`undefined`(被攔截) → `window.open was blocked`;後二者先立即 `revokeObjectURL`.`openLink` 無 `document` 或 `document.body` → `document is not available`(不再拋原生 `ReferenceError`／`TypeError`).
3. **Blob 網址延遲釋放**: 開啟成功後 `setTimeout(revoke, 60000)`(常數 `REVOKE_DELAY_MS`);理由與代價寫於 JSDoc(新分頁載入為非同步、立即釋放可能載入失敗;釋放後該分頁重新整理或內建檢視器之另存可能失敗;不釋放則占記憶體至本頁關閉).**釋放為盡力而為**: 無 `revokeObjectURL` 或其拋錯時忽略(JSDoc 載明).JSDoc 區分「輸入與環境檢查先於建 Blob」與「建 Blob 後之執行期失敗(`createObjectURL`、`window.open`)」.
4. **不設協定白名單與類型白名單、行為不改**(使用者 2026-11-12 定): `browserView` 以同源 Blob 開啟,可執行腳本之類型(`text/html`、`image/svg+xml`、`application/xhtml+xml`、`text/xml`、`application/xml`)之腳本以本系統來源執行、且新分頁 `window.opener` 指向本頁(真 Chromium 實測);`openLink` 之各協定實測結果(`javascript:` 只開空白頁、`data:text/html` 與 `file:` 被擋、`blob:` 以本系統來源執行、非網址字串為相對路徑、新分頁 `opener` 為 `null`);皆寫於 JSDoc,責任在呼叫端(不得以未經檢查之使用者上傳資料搭配可執行腳本之類型).
5. **須於使用者操作之事件中呼叫**(JSDoc 載明): `openLink` 之 `a.click()` 無回傳,被攔截無從偵測;`browserView` 被攔截時依規則 2 拋錯.

### 站點全集(`src/`)

| 函數 | 檔 | 規則 |
|---|---|---|
| `browserView` | `src/browserView.mjs` | 1、2、3、4 |
| `browserViewFromText` | `src/browserViewFromText.mjs` | 1(先檢 `text`),其餘轉交 `browserView` |
| `browserViewFromBlob` | `src/browserViewFromBlob.mjs` | 1(先檢 `bb`、`type`),其餘轉交 |
| `browserViewFromU8arr` | `src/browserViewFromU8arr.mjs` | 1(先檢 `u8a`、`type`),其餘轉交 |
| `openLink` | `src/openLink.mjs` | 1、2、4、5 |

盤點指令: `Grep "window.open\(|createObjectURL\(" src/`(2026-11-12: `window.open` 只在 `browserView.mjs`;`createObjectURL` 另見 `domConvertToPic`、`fsDownloadFile` 類之下載函數,不屬開分頁,不在本規則).

### 測試

- `test/browserView.test.mjs`(18 案)、`test/_browserData.test.mjs`(4;無 `detached` 存取器之環境、延後提供 Blob、建 Blob 失敗之固定訊息)、`test/browserViewFromText.test.mjs`(4)、`test/browserViewFromBlob.test.mjs`(5)、`test/browserViewFromU8arr.test.mjs`(5)、`test/openLink.test.mjs`(6);共用最小假 `window`／`document` 於 `test/tools/browserFakeKit.mjs`(可觀察 `createElement`、`click`、`window.open`、`createObjectURL`／`revokeObjectURL`;結束時還原安裝前之全域描述符);延遲釋放以 `mock.timers` 判定(59999 未釋放、60000 已釋放);偽裝標籤、包裝字串、SharedArrayBuffer、已分離緩衝區、已撤銷 Proxy、拋錯之 `Symbol.toStringTag` 存取器皆有案;跨 realm 以 `vm.createContext` 之真物件驗證.
- 修前紅: 以 `git archive HEAD src` 之副本跑同一批測試,外審前之 37 案中 25 案紅(其餘為正常用法與行為不改之鎖定案).變異: M1～M6、M20、M25～M29、M38～M40(15 個)皆被殺.
- 真 Chromium(headless,不納入本套件測試;ws430 報告附): 無效輸入 0 分頁、偽裝標籤與包裝字串拒收、iframe 之真 Uint8Array 與 Blob 可開、Blob 內容與網址、59／60 秒釋放、`text/html` 之腳本以本系統來源執行且 `opener` 非 null、`openLink` 各協定;**被攔截回 null 之路徑無法以真瀏覽器重現**(headless shell 不攔彈窗),只以假 `window.open` 覆蓋;SharedArrayBuffer 於非跨源隔離頁不可用,只以 Node 單元測試覆蓋.

## R-DOMALERT-01 `domAlert` 之輸入、關閉與事件綁定

### 規則

1. **D1** `msg` 非非空之原始字串(`typeof` 判定;包裝物件、不可讀之 Proxy 皆無效,規格 §3.4 S1) → 不顯示、回 `Promise.resolve()`(不 reject,因經 `$alert` 之呼叫端皆 fire-and-forget;msg 有效而無 `document` 時同步拋出執行環境之錯誤為既有行為,JSDoc 載明).
2. **D2** `opt` 非物件(含 `null`、字串、數字、陣列、判型拋錯之已撤銷 Proxy) → 視為 `{}`;判型以 `typeof` 與 `Array.isArray`(局部 `isOptObj`),**不依可自訂之 `Symbol.toStringTag`**(帶自訂標籤之一般物件仍為設定物件,同修前;複核 N4:初版以 `isobj` 判型而誤判,已改);`paddingStyle`、`closeIconShift` 同.**各鍵讀取拋錯(拋錯之 getter、已撤銷之 Proxy)視為未給**而用該欄預設(規格 §4 V11;`sget`／`sis`／`sstyle` 為本檔局部輔助),`position` 只讀一次.數值類 opt 以 `optVal.defer` 收集,全部讀完後才至多讀一次 `opt.debug`(外審第 5 條).
3. **D3／D5** 數值類 opt 經 `optVal`(`src/_optVal.mjs`,R-OPT-VAL-01)以 `isenum` 逐一判定,非預期(含 NaN、Infinity、`'0x10'`、包裝物件、非數字)用該欄預設: `time`(4000,`nonnegative`,不設計時器上限——只與 `Date.now` 之差比較)、`borderWidth`(1,`nonnegative`)、`borderRadius`(8,`nonnegative`)、`paddingStyle.{top,right,bottom,left}`(14／26／14／14,`nonnegative`)、`closeIconShift.{top,right,bottom,left}`(可為負,無範圍).數字字串可用(K4).`opt.debug === true` 時警告(固定詞彙、不含值).
4. **D5b** `paddingStyle` 部分給鍵(或為非物件)時未給、無效之鍵用該鍵預設;`closeIconShift` 未給之鍵保留預設(`top:10`、`right:10`),**但同軸已給有效值者不套用另一端之預設**(給 `bottom` 不設 `top`、給 `left` 不設 `right`),以保留置於左下等之用法(主責者決定,列 ws430 報告需裁示).
5. **D4** 關閉一律經 `closeItemByID`: 先 `pm.resolve()` 再移除;時間到與按 ✕ 同一路徑;已關閉者不再處理(`removeItemByID`／`closeItemByID` 先查佇列).
6. **D6** 行為不改: `msg`、`opt.icon` 以 HTML 插入,字串型 opt 去分號後直接放入樣式;JSDoc 載明外部文字須先 `htmlEncode`.**〔2026-11-18 ws492e 縮限,使用者 2026-11-16「W-14:甲」〕**「行為不改」只限 HTML 插入與去分號之安全說明;四個樣式字串 opt(`textColor`／`backgroundColor`／`borderColor`／`shadowStyle`)給 `null`、非字串、包裝物件、讀取拋錯改用 JSDoc 預設(K3),**空字串為合法值(不要該樣式)**;`opt.type` 只認內建圖標之自有鍵(`'toString'` 等原型鏈名稱改 `'success'`);見 `rulebook_domarg.md` R-DOM-OPT-01.
7. **D7** 外框、內寬層、關閉按鈕以 `createElement` 建立,`mouseenter`／`mouseleave`(淡入淡出 ✕)與 `click`(關閉)以 `addEventListener` 綁定;不得有行內事件屬性,不得掛全域函數(原 `ttWAlertCancel`／`ttWAlertFadeIn`／`ttWAlertFadeOut` 已移除;全庫下游 0 處引用,只見於他套件之打包產物).外觀、位置、淡入淡出與多則排列不變(真 Chromium 修前修後並排: 三則排列之外框尺寸與計算樣式相同、元素截圖逐像素差 0、滑鼠移入後亦 0).**附帶差異**(外審 terra 10,JSDoc 載明): msg／icon 之 HTML 解析限於內寬層內之內容容器,`msg` 含未閉合標籤(如 `'<textarea>abc'`)時修前會吞入其後之關閉按鈕(真 Chromium: 修前無 ✕、修後有 ✕),正常 HTML 不受影響.

### 測試

- `test/domAlert.test.mjs`(26 案;含自訂標籤之 opt、debug 只於全部鍵讀完後讀一次、有效時不讀;每案以查詢字串載入新模組實例;計時以 `mock.timers` 之 `setInterval`／`setTimeout`／`Date`,以「推進虛擬時間後 Promise 是否已完成」判定;樣式以結構無關之 `styleTexts` 收集;D7 案保存並還原既有之全域描述符).
- 修前紅 17 案(外審前之 23 案中);變異 M7～M11、M18、M19、M30～M32、M41、M42(12 個)皆被殺.
- 真 Chromium(ws430 報告附): 外觀與位置並排相同、像素差 0;按 ✕ 修前 Promise 不完成、修後完成;嚴格 CSP 下修前 ✕ 與淡入失效(3 筆 CSP 違規)、修後可用;`time` 為 NaN／Infinity 修前永不關閉、修後 4 秒關閉;D1、D2、D5b 實測.

## R-DOMPIC-01 `domConvertToPic`:複本補回 canvas 位圖與單選 select 之選取、等複本 img 完成再截圖、成敗皆移除放入之節點

本節 2026-11-25 新增(排程第 642 項;snapdom 3.8.0 升版冒煙時發現之兩缺陷).索引見 `sgud/rule/rulebook.md`〈索引〉.

### 成因(真 Chromium 實證,「原元素直交 snapdom」對「經本函數」並排)

- **canvas 內容截不到**: 原元素直交 snapdom 可截到(紅藍各半之 canvas,區塊平均色 [255,0,0]、[0,0,255]),經本函數則該區為純白——本函數先 `cloneNode(true)` 再放入頁面,而 `cloneNode` 不複製 canvas 位圖(複本非透明像素 20000 → 0).**snapdom 本身無此缺陷**.
- **壞圖(404 `<img>`)首次呼叫輸出高度飄移**: 複本之 `<img>` 放入頁面後重新載入,失敗前以 `width`／`height` 屬性之盒(如 60×40)排版,失敗後改為替代文字盒(如 46×21);實測放入後 `complete === false`、版面高 68,約 2 ms 後 `error`、高 43.snapdom 量測若落在其間,輸出為失敗前之版面.原元素直交 snapdom 恆為失敗後版面(原元素早已失敗).修前同頁首次呼叫 4／30 為失敗前版面(高 82),第 2 次起(snapdom 前處理較快)恆為失敗前版面;修後 30／30 與同頁連續 3 次皆為失敗後版面(高 57,含 14px 外距).**注意**: 使用端先前之描述「57 = 底緣被裁、82 = 完整」方向相反——57 才是失敗後之正確版面.
- **主控推測之修正**: `input`／`textarea` 之 `value`、核取／單選鈕之 `checked`、range 之現值,`cloneNode` 已複製(HTML 規格之 cloning steps;Chromium 實測複本值同原件);只有單選 `<select>` 之選取遺失(複本回到第一項,輸出為第一項之文字).
- **獨立複審另發現之既有副作用(修前即有,同日實證並修)**: 同名(無表單)之單選鈕,複本放入頁面後與頁面上之原件同組,複本之已勾選鈕使**原件之勾選被取消**(實測原件 `r2.checked` 由 `true` 變 `false`,修前修後之呼叫皆然,並行呼叫互相取消);有表單者因複本之表單為另一個表單擁有者而不受影響.

### 規則

1. **複製後補回 `cloneNode` 不帶走之狀態**(`copyCanvas`、`copySelect`;原件與複本結構相同,以 `listAll` 取本身與後代依文件順序,同索引互相對應): 各 `<canvas>` 於呼叫當下之內容 `drawImage` 至複本之 2D 環境;各單選 `<select>` 之 `selectedIndex` 複製至複本.**失敗不中斷**: 位圖寬或高為 0、控制權已轉移至 OffscreenCanvas、取不到 2D 環境者保留空白(try/catch,不 reject);跨源圖片使 canvas 被污染(tainted)者可畫入複本但內容無法讀出,輸出中該 canvas 區域為空白、由 snapdom 於四周畫 1px 灰框,**不 reject**(與原元素直交 snapdom 相同).複選 `<select>` 之選取 snapdom 不呈現於輸出(實測有無選取輸出像素相同),不處理.
2. **放入頁面後等複本 `<img>` 完成**(`waitImg`): 只等 `complete === false` 者之 `load`／`error`(已完成者如無 `src` 之 `<img>` 不會再觸發事件,不可等);上限 `IMG_WAIT_MAX = 5000` ms,逾時不再等、直接截圖、不報錯;無須等待者不建計時器(假 DOM 之單元測試不受影響).**複本內 `loading="lazy"` 者改為 `eager`**(`loadImgNow`): 複本置於頁面頂端,其內遠離視窗者不會觸發延遲載入,否則每次呼叫空等至上限(實測遠端 lazy 圖: 不改 5081 ms、改後 64 ms).
3. **成功或失敗皆移除本函數放入之節點**(`try/finally` 內 `domRemove(eleOut)`): 修前截圖拋錯時外層容器與複本殘留於 `body`.
   - **複本內有名稱之單選鈕改用本次呼叫專用之名稱**(`isolateRadio`,`__domConvertToPic<序號>_<原名>`,元素本身為 radio 時亦處理): 複本內各鈕仍同組、勾選狀態與外觀不變,不再與頁面上之同名原件同組,原件之勾選不被改動(呼叫後頁面上之單選狀態不變).
4. 輸出尺寸為複本之版面尺寸,**元素之外距計入**(複本外層為絕對定位之區塊格式化脈絡,子元素外距不外溢)——既有行為,JSDoc 載明,測試鎖定.

### 站點全集與判準

- 盤點指令: `Grep "cloneNode\(" src/`(2026-11-25: `domConvertToPic.mjs`、`domDragPreview.mjs` 兩處);`Grep "snapdom" src/`(只有 `domConvertToPic.mjs`).
- `domConvertToPic.mjs`: 已套規則 1~4.`domDragPreview.mjs`: **刻意不套**——拖曳預覽(殘影)非截圖輸出,不在本規則範圍.

### 已知限制(JSDoc 載明)

- 元素內之捲動位置(`scrollTop`／`scrollLeft`)不帶入複本,輸出為未捲動之內容並含捲軸(實測: 原元素直交 snapdom 呈現捲動後位置且無捲軸).**未修**: 修正會改變下游現有輸出,另案由主控裁示.
- 其餘依 snapdom 之能力(如跨網域 iframe 為占位、跨源污染之 canvas 為空白).

### 測試

- `test/domConvertToPic.test.mjs`(29 案,真 Chromium;基建見 `rulebook_test.md` R-TEST-BROWSER-01): 輸出(尺寸、`opt.scale`、`opt.picType`、`opt.toBase64`、外距)、DOM 殘留與並行、截圖失敗與無效輸入、canvas(紅藍區塊顏色、位圖尺寸≠CSS 尺寸、`scale`、元素本身為 canvas、多 canvas 巢狀、原 canvas 不被改動、跨源污染、OffscreenCanvas)、表單現值(select 以屬性設定 = 以 `selected` 設定之輸出像素雜湊相同,含元素本身為 select;input／checkbox／radio／textarea／range 同)、單選鈕(頁面上同名原件之勾選不被改動、複本之勾選仍呈現)、壞圖高度(10 個新頁面之首次呼叫、同頁第 2 次起)、已載入圖片、無 `src` 之 `<img>`、遠端 lazy 圖、永不載入之圖(上限).**不比對標準圖**,改以尺寸、指定區塊平均色與非白像素數、同次執行內兩輸出之像素雜湊.
- 修前紅(以改前之 `src/domConvertToPic.mjs` 取代頁面載入之檔,環境變數 `WSEMI_DOMCONVERTTOPIC_SRC`): 29 案中 11 案紅(截圖失敗之殘留 1、canvas 5、select 2、單選鈕原件勾選 1、壞圖首次呼叫 1〔機率性,每輪 10 頁約 76%,實測兩輪皆紅〕與第 2 次起 1〔確定性〕).變異 14 項(`tmp` 內單點變異,以同一環境變數載入)中 12 項被殺、2 項存活皆為等價: ①複選 select 亦複製選取(其選取不呈現於輸出,見規則 1);②單選鈕只改名已勾選者(未勾選者加入同名群組不影響原件之勾選,可觀察行為相同;現行實作改名全部有名稱者,較單純).`complete` 過濾之變異須有「無 `src` 之 img」案才被殺(首輪存活,補案後被殺).
