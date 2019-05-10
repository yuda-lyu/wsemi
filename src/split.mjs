import isestr from './isestr.mjs'


/**
 * 切割字串
 *
 * @memberOf wsemi
 * @param {String} c 輸入要被切割的字串
 * @param {String} t 輸入用來切割的符號字串
 * @returns {Array} 回傳切割後的字串陣列
 */
function split(c, t) {

    //check
    if (!isestr(c)) {
        return []
    }
    if (!isestr(t)) {
        return []
    }

    let r = c.split(t)

    return r
}


export default split
