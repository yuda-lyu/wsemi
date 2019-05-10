import each from 'lodash/each'
import isestr from './isestr.mjs'
import split from './split.mjs'
import iser from './iser.mjs'


/**
 * 切割字串並剔除非有效元素
 *
 * @memberOf wsemi
 * @param {String} c 輸入要被切割的字串
 * @param {String} t 輸入用來切割的符號字串
 * @returns {Array} 回傳切割後的字串陣列
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
    let r = []
    each(s, function(v) {
        if (!iser(v)) {
            r.push(v)
        }
    })

    return r
}


export default sep
