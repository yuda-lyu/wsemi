import browserData from './_browserData.mjs'
import browserView from './browserView.mjs'


/**
 * 前端瀏覽器以分頁開啟文字資料
 *
 * 以type為'text/plain'交由browserView開啟(開啟、延遲釋放與失敗之說明見browserView)。
 * text須為原始字串(可為空字串；包裝物件new String無效，規格§3.4 S2)，否則同步拋出Error('invalid text: must be a string')且不開分頁；無法開啟分頁時拋出之Error同browserView。
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/browserViewFromText.test.mjs Github}
 * @memberOf wsemi
 * @param {String} text 輸入文字字串
 * @throws {Error} text非字串、或無法開啟分頁時拋出Error
 * @example
 * need test in browser
 *
 * let text = 'abc'
 * browserViewFromText(text)
 *
 */
function browserViewFromText(text) {

    //check, 先於開分頁
    if (!browserData.isStrPrim(text)) {
        throw new Error('invalid text: must be a string')
    }

    //browserView
    browserView(text, 'text/plain')

}


export default browserViewFromText
