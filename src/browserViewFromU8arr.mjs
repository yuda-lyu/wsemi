import isu8arr from './isu8arr.mjs'
import browserView from './browserView.mjs'


/**
 * 前端瀏覽器以分頁開啟Uint8Array數據如文字、圖片、影片、pdf等
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/browserViewFromU8arr.test.js Github}
 * @memberOf wsemi
 * @param {Uint8Array} u8a 輸入Uint8Array數據
 * @param {String} type 輸入數據MIME Type字串，例如'application/pdf'或'text/plain'等，詳見[https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/MIME_types/Common_types]
 * @example
 * need test in browser
 *
 * let u8a = new Uint8Array([66, 97, 115])
 * browserView(u8a, 'application/pdf')
 *
 */
function browserViewFromU8arr(u8a, type) {

    //check
    if (!isu8arr(u8a)) {
        return
    }

    //browserView
    browserView(u8a, type)

}


export default browserViewFromU8arr
