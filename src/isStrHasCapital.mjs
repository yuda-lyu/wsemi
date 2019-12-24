import isestr from './isestr.mjs'


/**
 * 字串是否包含大寫英文字元
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/isStrHasCapital.test.js Github}
 * @memberOf wsemi
 * @param {String} str 輸入欲判斷的字串
 * @returns {Boolean} 回傳是否包含大寫英文字元
 * @example
 * console.log(isStrHasCapital('abc125'))
 * // => false
 *
 * console.log(isStrHasCapital('abC125'))
 * // => true
 */
function isStrHasCapital(str) {

    //check
    if (!isestr(str)) {
        return false
    }

    let result = str.match(/^.*[A-Z]+.*$/)
    let r = !(result === null)

    return r
}


export default isStrHasCapital
