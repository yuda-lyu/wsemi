import each from 'lodash-es/each.js'
import map from 'lodash-es/map.js'
import trim from 'lodash-es/trim.js'
import isestr from './isestr.mjs'
import split from './split.mjs'


/**
 * 切割字串並剔除非有效元素
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/sep.test.mjs Github}
 * @memberOf wsemi
 * @param {String} c 輸入要被切割的字串
 * @param {String} t 輸入用來切割的符號字串
 * @returns {Array} 回傳切割後的字串陣列
 * @example
 *
 * console.log(sep('1.25 abc  中文', ' '))
 * // => ['1.25', 'abc', '中文']
 *
 */
function sep(c, t) {

    //check
    if (!isestr(c)) {
        return []
    }
    if (!isestr(t)) {
        return []
    }

    let s = split(c, t)
    s = map(s, trim)
    let r = []
    each(s, function(v) {
        if (isestr(v)) {
            r.push(v)
        }
    })

    return r
}


export default sep
