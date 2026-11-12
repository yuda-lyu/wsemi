import browserData from './_browserData.mjs'
import browserView from './browserView.mjs'


/**
 * 前端瀏覽器以分頁開啟blob數據如文字、圖片、影片、pdf等
 *
 * 交由browserView開啟(開啟、延遲釋放、失敗與可夾帶腳本之類型之安全注意見browserView；type由呼叫端決定，不得以未經檢查之使用者上傳資料搭配text/html、image/svg+xml等可夾帶腳本之類型呼叫)。
 * bb須為Blob(含File與其子類；以內部槽判定，不採可偽裝之Symbol.toStringTag)，否則同步拋出Error('invalid bb: must be a Blob')；type須為非空之原始字串，否則同步拋出Error('invalid type: must be a non-empty string')；皆不開分頁。無法開啟分頁時拋出之Error同browserView。
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/browserViewFromBlob.test.mjs Github}
 * @memberOf wsemi
 * @param {Blob} bb 輸入blob數據
 * @param {String} type 輸入數據MIME Type字串，例如'application/pdf'或'text/plain'等，詳見[https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/MIME_types/Common_types]
 * @throws {Error} bb非Blob、type非非空字串、或無法開啟分頁時拋出Error
 * @example
 * need test in browser
 *
 * let u8a = new Uint8Array([66, 97, 115])
 * let bb = new Blob([u8a])
 * browserViewFromBlob(bb, 'application/pdf')
 *
 */
function browserViewFromBlob(bb, type) {

    //check, 先於開分頁
    if (!browserData.isBlobBrand(bb)) {
        throw new Error('invalid bb: must be a Blob')
    }
    if (!browserData.isEstrPrim(type)) {
        throw new Error('invalid type: must be a non-empty string')
    }

    //browserView
    browserView(bb, type)

}


export default browserViewFromBlob
