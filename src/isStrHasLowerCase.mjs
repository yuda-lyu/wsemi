import isestr from './isestr.mjs'


/**
 * 字串是否包含小寫英文字元
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/isStrHasLowerCase.test.js Github}
 * @memberOf wsemi
 * @param {String} str 輸入欲判斷的字串
 * @returns {Boolean} 回傳是否包含小寫英文字元
 * @example
 * console.log(isStrHasLowerCase('ABC125'))
 * // => false
 *
 * console.log(isStrHasLowerCase('abC125'))
 * // => true
 */
function isStrHasLowerCase(str) {

    //check
    if (!isestr(str)) {
        return false
    }

    let result = str.match(/^.*[a-z]+.*$/)
    let r = !(result === null)

    return r
}


export default isStrHasLowerCase
