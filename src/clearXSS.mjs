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
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/clearXSS.test.mjs Github}
 * @memberOf wsemi
 * @param {String|Object|Array} inp 輸入資料
 * @returns {Object|Array|String} 輸出資料
 * @example
 *
 * console.log(clearXSS(`><script>alert('XSS')</script>`))
 * // => `&gt;&lt;script&gt;alert('XSS')&lt;/script&gt;`
 *
 * console.log(clearXSS(`<img src="javascript:alert('XSS')">`))
 * // => `<img src>`
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
