import get from 'lodash-es/get.js'
import isInteger from 'lodash-es/isInteger.js'
import isbol from './isbol.mjs'
import isnum from './isnum.mjs'
import cdbl from './cdbl.mjs'


/**
 * 判斷是否為整數
 *
 * 本函式屬定義上之「是否為整數」，isint(Infinity)、isint('0x10')、isint(2 ** 60)皆為true，不代表對計算有效；計算類函數判定整數參數請改用iseint(有效整數，可依用途限定範圍，如個數、索引、埠號、計時毫秒)，不要求整數者用isenum。
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

    //useLimitSafe
    let useLimitSafe = get(opt, 'useLimitSafe', null)
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
