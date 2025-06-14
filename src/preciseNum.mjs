import get from 'lodash-es/get.js'
import isnum from './isnum.mjs'
import isint from './isint.mjs'
import isbol from './isbol.mjs'
import cstr from './cstr.mjs'
import dig from './dig.mjs'


/**
 * 轉數字成為原始精度之數字字串
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/preciseNum.test.mjs Github}
 * @memberOf wsemi
 * @param {String|Number} v 輸入數字字串或數字
 * @param {Object} [opt={}] 輸入設定物件，預設{}
 * @param {Boolean} [opt.returnDigit=false] 輸入是否回傳小數位數布林值，預設false
 * @returns {String} 回傳數字字串
 * @example
 *
 * console.log(`preciseNum(0)`, preciseNum(0))
 * // => preciseNum(0) 0
 *
 * console.log(`preciseNum(1)`, preciseNum(1))
 * // => preciseNum(1) 1
 *
 * console.log(`preciseNum(0.3)`, preciseNum(0.3))
 * // => preciseNum(0.3) 0.3
 *
 * console.log(`preciseNum(0.1 + 0.2)`, preciseNum(0.1 + 0.2))
 * // => preciseNum(0.1 + 0.2) 0.3
 *
 * console.log(`preciseNum(4.67 + 7.12 + 94.4)`, preciseNum(4.67 + 7.12 + 94.4))
 * // => preciseNum(4.67 + 7.12 + 94.4) 106.19
 *
 * console.log(`preciseNum(94.4 + 7.12 + 4.67)`, preciseNum(94.4 + 7.12 + 4.67))
 * // => preciseNum(94.4 + 7.12 + 4.67) 106.19
 *
 * console.log(`preciseNum(0, { returnDigit: true })`, preciseNum(0, { returnDigit: true }))
 * // => preciseNum(0, { returnDigit: true })) 0
 *
 * console.log(`preciseNum(1, { returnDigit: true })`, preciseNum(1, { returnDigit: true }))
 * // => preciseNum(1, { returnDigit: true })) 0
 *
 * console.log(`preciseNum(0.3, { returnDigit: true })`, preciseNum(0.3, { returnDigit: true }))
 * // => preciseNum(0.3, { returnDigit: true })) 1
 *
 * console.log(`preciseNum(0.1 + 0.2, { returnDigit: true })`, preciseNum(0.1 + 0.2, { returnDigit: true }))
 * // => preciseNum(0.1 + 0.2, { returnDigit: true })) 1
 *
 * console.log(`preciseNum(4.67 + 7.12 + 94.4, { returnDigit: true })`, preciseNum(4.67 + 7.12 + 94.4, { returnDigit: true }))
 * // => preciseNum(4.67 + 7.12 + 94.4, { returnDigit: true })) 2
 *
 * console.log(`preciseNum(94.4 + 7.12 + 4.67, { returnDigit: true })`, preciseNum(94.4 + 7.12 + 4.67, { returnDigit: true }))
 * // => preciseNum(94.4 + 7.12 + 4.67, { returnDigit: true })) 2
 *
 */
function preciseNum(v, opt = {}) {

    //check
    if (!isnum(v)) {
        throw new Error(`v is not a number`)
    }

    //returnDigit
    let returnDigit = get(opt, 'returnDigit')
    if (!isbol(returnDigit)) {
        returnDigit = false
    }

    //check
    if (isint(v)) {
        if (returnDigit) {
            return 0
        }
        return cstr(v) //不能用cint, 得要回傳數字字串
    }

    //eps
    let eps = 1e-9

    //idig, vv
    let idig = null
    let vv = null
    for (let i = 1; i <= 16; i++) { //最高測試至16位

        //multiplier
        let multiplier = Math.pow(10, i)
        // console.log(i, multiplier)

        //multiplied
        let multiplied = v * multiplier

        //檢查乘以10的n次方是否與其四捨五入的值非常接近
        if (Math.abs(multiplied - Math.round(multiplied)) < eps) {
            idig = i
            vv = dig(v, i)
            break
        }
    }
    // console.log('vv', vv)

    //check, 若無法找到代表v精度超高, 直接轉字串回傳
    if (vv === null) {
        idig = 16
        vv = cstr(v)
    }

    if (returnDigit) {
        return idig
    }
    return vv
}


export default preciseNum
