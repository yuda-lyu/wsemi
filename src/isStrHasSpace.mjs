import isestr from './isestr.mjs'


/**
 * 字串是否包含空白字元
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/isStrHasSpace.test.mjs Github}
 * @memberOf wsemi
 * @param {String} str 輸入欲判斷的字串
 * @returns {Boolean} 回傳是否包含空白字元
 * @example
 *
 * console.log(isStrHasSpace('abc125'))
 * // => false
 *
 * console.log(isStrHasSpace('abc 125'))
 * // => true
 *
 */
function isStrHasSpace(str) {

    //check
    if (!isestr(str)) {
        return false
    }

    let result = str.match(/^.*\s+.*$/)
    let r = !(result === null)

    return r
}


export default isStrHasSpace
