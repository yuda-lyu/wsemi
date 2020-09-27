import isblob from './isblob.mjs'
import browserView from './browserView.mjs'


/**
 * 前端瀏覽器以分頁開啟blob數據如文字、圖片、影片、pdf等
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/browserViewFromBlob.test.js Github}
 * @memberOf wsemi
 * @param {Blob} bb 輸入blob數據
 * @param {String} type 輸入數據MIME Type字串，例如'application/pdf'或'text/plain'等，詳見[https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/MIME_types/Common_types]
 * @example
 * need test in browser
 *
 * let u8a = new Uint8Array([66, 97, 115])
 * let bb = new Blob([u8a])
 * browserView(bb, 'application/pdf')
 *
 */
function browserViewFromBlob(bb, type) {

    //check
    if (!isblob(bb)) {
        return
    }

    //browserView
    browserView(bb, type)

}


export default browserViewFromBlob
