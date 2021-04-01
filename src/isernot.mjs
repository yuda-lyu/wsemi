import iser from './iser.mjs'


/**
 * 判斷是否為廣義有效
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/isernot.test.js Github}
 * @memberOf wsemi
 * @param {*} v 輸入任意資料
 * @returns {Boolean} 回傳判斷布林值
 * @example
 *
 * console.log(isernot('12a5'))
 * // => true
 *
 * console.log(isernot(''))
 * // => false
 *
 * console.log(isernot([]))
 * // => false
 *
 * console.log(isernot([{}]))
 * // => true
 *
 * console.log(isernot(['']))
 * // => true
 *
 * console.log(isernot({}))
 * // => false
 *
 * console.log(isernot(null))
 * // => false
 *
 * console.log(isernot(undefined))
 * // => false
 *
 */
function isernot(v) {

    return !iser(v)
}


export default isernot
