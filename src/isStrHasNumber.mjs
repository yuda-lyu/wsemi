import isestr from './isestr.mjs'


/**
 * 字串是否包含數字
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/isStrHasNumber.test.js Github}
 *
 * @example
 *
 * @memberOf wsemi
 * @param {String} str 輸入欲判斷的字串
 * @returns {Boolean} 回傳是否包含數字
 */
function isStrHasNumber(str) {

    //check
    if (!isestr(str)) {
        return ''
    }

    let result = str.match(/^.*[0-9]+.*$/)
    let r = !(result === null)

    return r
}


export default isStrHasNumber
