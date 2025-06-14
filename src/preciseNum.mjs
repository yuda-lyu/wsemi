import isnum from './isnum.mjs'
import isint from './isint.mjs'
import cstr from './cstr.mjs'
import dig from './dig.mjs'


/**
 * 轉數字成為原始精度之數字字串
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/preciseNum.test.mjs Github}
 * @memberOf wsemi
 * @param {String|Number} v 輸入數字字串或數字
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
 */
function preciseNum(v) {

    //check
    if (!isnum(v)) {
        throw new Error(`v is not a number`)
    }

    //check,
    if (isint(v)) {
        return cstr(v) //不能用cint, 得要回傳數字字串
    }

    //eps
    let eps = 1e-9

    //vv
    let vv = null
    for (let i = 1; i <= 16; i++) { //最高測試至16位

        //multiplier
        let multiplier = Math.pow(10, i)
        // console.log(i, multiplier)

        //multiplied
        let multiplied = v * multiplier

        //檢查乘以10的n次方是否與其四捨五入的值非常接近
        if (Math.abs(multiplied - Math.round(multiplied)) < eps) {
            vv = dig(v, i)
            break
        }
    }
    // console.log('vv', vv)

    //check, 若無法找到代表v精度超高, 直接轉字串回傳
    if (vv === null) {
        vv = cstr(v)
    }

    return vv
}


export default preciseNum
