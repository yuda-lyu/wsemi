import isestr from './isestr.mjs'


/**
 * 字串是否包含小寫英文字元
 *
 * @memberOf wsemi
 * @param {String} str 輸入欲判斷的字串
 * @returns {Boolean} 回傳是否包含小寫英文字元
 */
function isStrHasLowerCase(str) {

    //check
    if (!isestr(str)) {
        return ''
    }

    let result = str.match(/^.*[a-z]+.*$/)
    let r = !(result === null)

    return r
}


export default isStrHasLowerCase
