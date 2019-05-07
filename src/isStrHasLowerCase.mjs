import isestr from './isestr.mjs'


/**
 * 字串是否包含小寫英文字元
 *
 * @export
 * @param {String} str 輸入欲判斷的字串
 * @returns {Boolean} 回傳是否包含小寫英文字元
 */
export default function isStrHasLowerCase(str) {

    //check
    if (!isestr(str)) {
        return ''
    }

    let result = str.match(/^.*[a-z]+.*$/)
    let r = !(result === null)

    return r
}
