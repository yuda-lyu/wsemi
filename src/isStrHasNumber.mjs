import isestr from './isestr.mjs'


/**
 * 字串是否包含數字
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/isStrHasNumber.test.mjs Github}
 * @memberOf wsemi
 * @param {String} str 輸入欲判斷的字串
 * @returns {Boolean} 回傳是否包含數字
 * @example
 *
 * console.log(isStrHasNumber('abc'))
 * // => false
 *
 * console.log(isStrHasNumber('abc125'))
 * // => true
 *
 */
function isStrHasNumber(str) {

    //check
    if (!isestr(str)) {
        return false
    }

    let result = str.match(/^.*[0-9]+.*$/)
    let r = !(result === null)

    return r
}


export default isStrHasNumber
