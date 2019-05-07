import isestr from './isestr.mjs'


/**
 * 字串是否包含數字
 *
 * @export
 * @param {String} str 輸入欲判斷的字串
 * @returns {Boolean} 回傳是否包含數字
 */
export default function isStrHasNumber(str) {

    //check
    if (!isestr(str)) {
        return ''
    }

    let result = str.match(/^.*[0-9]+.*$/)
    let r = !(result === null)

    return r
}
