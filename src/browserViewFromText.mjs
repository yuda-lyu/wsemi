import isstr from './isstr.mjs'
import browserView from './browserView.mjs'


/**
 * 前端瀏覽器以分頁開啟文字資料
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/browserViewFromText.test.mjs Github}
 * @memberOf wsemi
 * @param {String} text 輸入文字字串
 * @example
 * need test in browser
 *
 * let text = 'abc'
 * browserViewFromText(u8a)
 *
 */
function browserViewFromText(text) {

    //check
    if (!isstr(text)) {
        return
    }

    //browserView
    browserView(text, 'text/plain')

}


export default browserViewFromText
