import browserData from './_browserData.mjs'


/**
 * 前端開啟連結
 *
 * 建立<a target="_blank">掛上body後點擊，再移除，以新分頁開啟url。
 *
 * 失敗一律同步拋出Error(訊息不含輸入值)，皆先於建立元素: url非原始字串(包裝物件new String無效，規格§3.4 S1)或為空字串拋出Error('invalid url: must be a non-empty string')；無document或document.body(如nodejs、Web Worker)拋出Error('document is not available')。
 * 須於使用者操作之事件(如click)中呼叫，否則可能被瀏覽器之彈出視窗攔截而不開啟；a.click()無回傳值，本函數無法偵測是否被攔截。
 *
 * 不設協定白名單，url原樣交給瀏覽器解析(使用者2026-11-12定)。真Chromium(headless)實測各種url之行為:
 * 1. http、https之絕對網址: 開新分頁；相對路徑與非網址之字串(如'not a url')皆以目前頁面之網址為基準解析為相對路徑後開啟；
 * 2. javascript:網址: 只開空白頁，腳本不執行；
 * 3. data:text/html與file:網址: 被瀏覽器擋下而不開啟；
 * 4. blob:網址(本頁以URL.createObjectURL建立者): 開啟，其內容若為可執行腳本之類型(如text/html)，腳本以本系統之來源(origin)執行，風險由呼叫端負責(同browserView之安全注意)，不得以未經檢查之使用者上傳資料建立blob網址後開啟；
 * 5. 新分頁之window.opener皆為null(target為_blank之連結預設noopener)，新分頁無法經opener操作本頁。
 * 其他瀏覽器之行為可能不同。
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/openLink.test.mjs Github}
 * @memberOf wsemi
 * @param {String} url 輸入連結網址字串，可為絕對網址或相對路徑(相對路徑以目前頁面之網址解析)，須為非空之原始字串
 * @throws {Error} url非非空字串、或無document時拋出Error
 * @example
 * need test in browser
 *
 * let url = 'https://www.google.com/'
 * openLink(url)
 *
 */
function openLink(url) {

    //check, 先於建立元素
    if (!browserData.isEstrPrim(url)) {
        throw new Error('invalid url: must be a non-empty string')
    }
    if (typeof document === 'undefined' || document === null || !document.body) {
        throw new Error('document is not available')
    }

    //tag a
    let a = document.createElement('a')
    a.href = url
    a.target = '_blank'

    //open, 掛上body後點擊以新分頁開啟連結, 再移除
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)

}


export default openLink
