import each from 'lodash/each'
import cloneDeep from 'lodash/cloneDeep'
import filterXSS from 'xss'
import isarr from './isarr.mjs'
import isobj from './isobj.mjs'
import isstr from './isstr.mjs'


/**
 * 清除xss攻擊語法
 *
 * Depend on: {@link https://jsxss.com/zh/index.html https://jsxss.com/zh/index.html}
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/clearXSS.test.js Github}
 * @memberOf wsemi
 * @param {Object|Array|String} obj 輸入資料
 * @returns {Object|Array|String} 輸出資料
 * @example
 * clearXSS(`><script>alert('XSS')</script>`)
 * // => `&gt;&lt;script&gt;alert('XSS')&lt;/script&gt;`
 * clearXSS(`<img src="javascript:alert('XSS')">`)
 * // => `<img src>`
 */
function clearXSS(obj) {

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
        else if (isstr(o)) {
            return ftxss(o)
        }
        else {
            return o
        }
    }

    //遍例所有屬性filterXSS
    let t = scxss(cloneDeep(obj))

    return t
}


export default clearXSS
