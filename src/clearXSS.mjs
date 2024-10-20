import each from 'lodash-es/each.js'
import cloneDeep from 'lodash-es/cloneDeep.js'
import filterXSS from 'xss'
import isarr from './isarr.mjs'
import isobj from './isobj.mjs'
import isestr from './isestr.mjs'


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

    //ftxss
    function ftxss(c) {
        return filterXSS(c, {
            onIgnoreTagAttr: function(tag, name, value, isWhiteAttr) {
                if (name === 'style') {
                    return name + '="' + filterXSS.escapeAttrValue(value) + '"'
                }
            }
        })
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
