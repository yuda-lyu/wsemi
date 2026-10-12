import each from 'lodash-es/each.js'
import cloneDeep from 'lodash-es/cloneDeep.js'
import isarr from './isarr.mjs'
import isobj from './isobj.mjs'
import isestr from './isestr.mjs'
import fxss from './_filterXSS.mjs'


/**
 * 清除xss攻擊語法
 *
 * Depend on: {@link https://jsxss.com/zh/index.html https://jsxss.com/zh/index.html}
 *
 * 白名單外之標籤轉義，白名單內之標籤刪除白名單外之屬性與危險網址(style屬性保留)，標籤外之文字只轉義會開始標籤之<(其後為英文字母、斜線、驚嘆號、問號或位於結尾)，>與其餘之<維持原樣，故'a < b'等數學式不改寫
 *
 * 輸出僅供以HTML內文呈現(如v-html、innerHTML)，不可放入屬性值或註解內
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/clearXSS.test.mjs Github}
 * @memberOf wsemi
 * @param {String|Object|Array} inp 輸入資料
 * @returns {Object|Array|String} 輸出資料
 * @example
 *
 * console.log(clearXSS(`><script>alert('XSS')</script>`))
 * // => `>&lt;script>alert('XSS')&lt;/script>`
 *
 * console.log(clearXSS(`<img src="javascript:alert('XSS')">`))
 * // => `<img src>`
 *
 * console.log(clearXSS(`孔深 < 500 m 且 > 10 m`))
 * // => `孔深 < 500 m 且 > 10 m`
 *
 */
function clearXSS(inp) {

    //filterXSS, opt, 有字串須處理時才取得, 使非字串輸入於瀏覽器未載入xss時仍回傳原值
    let filterXSS = null
    let opt = null

    //ftxss
    function ftxss(c) {
        if (filterXSS === null) {
            filterXSS = fxss.getFilterXSS()
            opt = fxss.getOpt(filterXSS) //與detectXSS共用設定
        }
        return filterXSS(c, opt)
    }

    //scxss
    function scxss(o) {
        if (isarr(o) || isobj(o)) {
            each(o, function(v, k) {
                o[k] = scxss(v)
            })
            return o
        }
        else if (isestr(o)) {
            return ftxss(o)
        }
        else {
            return o
        }
    }

    //遍例所有屬性filterXSS
    let t = scxss(cloneDeep(inp))

    return t
}


export default clearXSS
