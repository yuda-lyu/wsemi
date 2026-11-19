import get from 'lodash-es/get.js'
import isInteger from 'lodash-es/isInteger.js'
import isbol from './isbol.mjs'
import isnum from './isnum.mjs'
import cdbl from './cdbl.mjs'


/**
 * 判斷是否為整數
 *
 * 本函式屬定義上之「是否為整數」，isint(Infinity)、isint('0x10')、isint(2 ** 60)皆為true，不代表對計算有效；計算類函數判定整數參數請改用iseint(有效整數，可依用途限定範圍，如個數、索引、埠號、計時毫秒)，不要求整數者用isenum。
 * 依數學定義判斷，Infinity於數學上是數值，也無法說非整數，故isint(Infinity)、isint(-Infinity)為true(使用者2026-11-12定，行為不改)；要判可用、可計算之整數用iseint。
 * 只收原始數字與數字字串，包裝物件new Number(5)、new String('5')為false(判斷函數只收原始值)；對任何輸入皆不拋錯(含已撤銷之Proxy，opt亦同，讀取即拋錯之opt視為未給)。
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/isint.test.mjs Github}
 * @memberOf wsemi
 * @param {*} v 輸入任意資料
 * @param {Object} [opt={}] 輸入設定物件，預設{}
 * @param {Boolean} [opt.useLimitSafe=false] 輸入是否限制須為安全整數布林值，若為true則超出安全整數範圍者(即Number.isSafeInteger為false，含Infinity、-Infinity與絕對值大於Number.MAX_SAFE_INTEGER者)判定為false，預設false
 * @returns {Boolean} 回傳判斷布林值
 * @example
 *
 * console.log(isint('1.25'))
 * // => false
 *
 * console.log(isint('125'))
 * // => true
 *
 * console.log(isint(1.25))
 * // => false
 *
 * console.log(isint(125))
 * // => true
 *
 * console.log(isint(Infinity))
 * // => true
 *
 * console.log(isint(Infinity, { useLimitSafe: true }))
 * // => false
 *
 */
function isint(v, opt = {}) {

    //useLimitSafe, opt為已撤銷之Proxy等讀取即拋錯者視為未給(判斷函數不拋錯)
    let useLimitSafe = null
    try {
        useLimitSafe = get(opt, 'useLimitSafe', null)
    }
    catch (err) {
        useLimitSafe = null
    }
    if (!isbol(useLimitSafe)) {
        useLimitSafe = false
    }

    if (isnum(v)) {
        v = cdbl(v)
        if (useLimitSafe) {
            //因cdbl對Infinity與超出範圍數值會轉為Number.MAX_VALUE, 而其為lodash之整數故isInteger仍為true, 須改用Number.isSafeInteger方能排除
            return Number.isSafeInteger(v)
        }
        else {
            return isInteger(v)
        }
    }
    else {
        return false
    }
}


export default isint
