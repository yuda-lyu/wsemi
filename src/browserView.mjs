import browserData from './_browserData.mjs'


//開啟後釋放Blob網址之延遲毫秒: 新分頁載入Blob網址為非同步, 立即釋放可能使新分頁載入失敗; 延遲過長則Blob佔用記憶體至釋放或本頁關閉為止。取60秒(長於常見作法FileSaver之40秒)
let REVOKE_DELAY_MS = 60 * 1000


/**
 * 前端瀏覽器以分頁開啟指定數據如文字、圖片、影片、pdf等
 *
 * 以data與type建立Blob、經URL.createObjectURL取得同源之Blob網址後以window.open開新分頁顯示，開啟後延遲60秒以URL.revokeObjectURL釋放該網址(理由: 新分頁載入Blob網址為非同步，立即釋放可能使新分頁載入失敗；不釋放則Blob佔用記憶體至本頁關閉。已載入之分頁內容不受釋放影響，但釋放後於該分頁重新整理、或內建檢視器(如PDF檢視器)之另存或下載可能失敗)。釋放為盡力而為: 執行環境無URL.revokeObjectURL或其拋錯時忽略(不影響已開啟之分頁)，該網址佔用至本頁關閉。
 *
 * 失敗一律同步拋出Error(訊息不含輸入值、不外洩內部錯誤):
 * 1. 輸入檢查先於建立Blob與開分頁: data須為原始字串(可為空字串)、Blob(含File)、ArrayBuffer或ArrayBuffer之檢視(如Uint8Array、DataView)，以內部槽判定(不採可偽裝之Symbol.toStringTag、不呼叫輸入之方法或存取器)，包裝物件new String、SharedArrayBuffer與以其為底之檢視、已分離(detached)之ArrayBuffer與以其為底之檢視皆無效(無法建立Blob)，否則拋出Error('invalid data: must be a string, Blob, ArrayBuffer or ArrayBufferView')；
 * 2. type須為非空之原始字串(包裝物件new String無效)，否則拋出Error('invalid type: must be a non-empty string')；
 * 3. 環境檢查亦先於建立Blob: 無window或document(如nodejs、Web Worker)拋出Error('window and document are required')，無Blob拋出Error('Blob is not supported')，無URL.createObjectURL(如IE11以前)拋出Error('URL.createObjectURL is not supported')；
 * 通過上列檢查之data仍無法建立Blob者(執行環境特有之限制)亦拋出Error('invalid data: must be a string, Blob, ArrayBuffer or ArrayBufferView')，不外洩原生錯誤；
 * 4. 建立Blob後之執行期失敗: URL.createObjectURL拋錯拋出Error('can not create object URL')；window.open拋錯拋出Error('can not open window')，window.open回傳null(被瀏覽器之彈出視窗攔截)拋出Error('window.open was blocked')，此二者發生於開分頁之嘗試，拋出前先立即釋放已建立之Blob網址。window.open須於使用者操作之事件(如click)中呼叫，否則可能被瀏覽器攔截。
 *
 * 安全注意: 可夾帶腳本之類型(text/html、image/svg+xml、application/xhtml+xml、text/xml、application/xml等)以同源Blob開啟時，其內含之腳本以本系統之來源(origin)執行，可存取本系統之Cookie、localStorage與同源API，且新分頁之window.opener指向本頁(以window.open開啟，真Chromium實測，與openLink之新分頁opener為null不同)。type由呼叫端決定，本函數不檢查data內容亦不限制type；不得以未經檢查之使用者上傳資料搭配上述類型呼叫(展示使用者上傳之資料時，請只允許text/plain、application/pdf、image/png等不執行腳本之類型，或先經檢查與清理)。
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/browserView.test.mjs Github}
 * @memberOf wsemi
 * @param {String|Blob|ArrayBuffer|Uint8Array} data 輸入數據，可為原始字串、Blob、ArrayBuffer或ArrayBuffer之檢視(如Uint8Array)，共享或已分離之緩衝區無效
 * @param {String} type 輸入數據MIME Type原始字串，例如'application/pdf'或'text/plain'等，詳見[https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/MIME_types/Common_types]，可夾帶腳本之類型見上方安全注意
 * @throws {Error} data或type無效、或無法開啟分頁時拋出Error，見上方說明
 * @example
 * need test in browser
 *
 * let text = 'abc'
 * browserView(text, 'text/plain')
 *
 * let u8a = new Uint8Array([66, 97, 115])
 * browserView(u8a, 'application/pdf')
 *
 */
function browserView(data, type) {

    //check, 先於建立Blob與開分頁; 以內部槽判定品牌(不採可偽裝之標籤), 原始字串才有效(規格§3.4 S1、S2)
    if (!browserData.isBlobPart(data)) {
        throw new Error('invalid data: must be a string, Blob, ArrayBuffer or ArrayBufferView')
    }
    if (!browserData.isEstrPrim(type)) {
        throw new Error('invalid type: must be a non-empty string')
    }

    //環境
    if (typeof window === 'undefined' || window === null || typeof document === 'undefined' || document === null) {
        throw new Error('window and document are required')
    }
    if (typeof Blob === 'undefined') {
        throw new Error('Blob is not supported')
    }
    let URLg = window.URL
    if (!URLg || typeof URLg.createObjectURL !== 'function') {
        throw new Error('URL.createObjectURL is not supported')
    }

    //blob, 通過檢查之資料仍無法建立Blob者(如執行環境特有之限制)視為data無效, 以固定訊息拋出, 不外洩原生錯誤
    let blob
    try {
        blob = new Blob([data], { type })
    }
    catch (err) {
        throw new Error('invalid data: must be a string, Blob, ArrayBuffer or ArrayBufferView')
    }

    //url
    let url
    try {
        url = URLg.createObjectURL(blob)
    }
    catch (err) {
        throw new Error('can not create object URL')
    }

    //revoke, 釋放Blob網址, 盡力而為(無revokeObjectURL或其拋錯時忽略, JSDoc已載明)
    let revoke = () => {
        try {
            URLg.revokeObjectURL(url)
        }
        catch (err) {}
    }

    //open
    let w
    try {
        w = window.open(url)
    }
    catch (err) {
        revoke()
        throw new Error('can not open window')
    }
    if (w === null || w === undefined) {
        revoke()
        throw new Error('window.open was blocked')
    }

    //延遲釋放, 理由見REVOKE_DELAY_MS
    setTimeout(revoke, REVOKE_DELAY_MS)

}


export default browserView
