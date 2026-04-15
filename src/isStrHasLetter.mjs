import isestr from './isestr.mjs'


/**
 * 字串是否包含英文字母字元(不分大小寫)
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/isStrHasLetter.test.mjs Github}
 * @memberOf wsemi
 * @param {String} str 輸入欲判斷的字串
 * @returns {Boolean} 回傳是否包含英文字母字元
 * @example
 *
 * console.log(isStrHasLetter('12345'))
 * // => false
 *
 * console.log(isStrHasLetter('abc125'))
 * // => true
 *
 */
function isStrHasLetter(str) {

    //check
    if (!isestr(str)) {
        return false
    }

    let result = str.match(/^.*[a-zA-Z]+.*$/)
    let r = !(result === null)

    return r
}


export default isStrHasLetter
