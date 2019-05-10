import isestr from './isestr.mjs'


/**
 * 字串是否包含大寫英文字元
 *
 * @memberOf wsemi
 * @param {String} str 輸入欲判斷的字串
 * @returns {Boolean} 回傳是否包含大寫英文字元
 */
function isStrHasCapital(str) {

    //check
    if (!isestr(str)) {
        return ''
    }

    let result = str.match(/^.*[A-Z]+.*$/)
    let r = !(result === null)

    return r
}


export default isStrHasCapital
