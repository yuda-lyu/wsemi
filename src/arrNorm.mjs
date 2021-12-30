import isearr from './isearr.mjs'
import isnum from './isnum.mjs'
import arrProduct from './arrProduct.mjs'


/**
 * 陣列Norm值，代表由各元素平方值相加開根號
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/arrNorm.test.mjs Github}
 * @memberOf wsemi
 * @param {Array} vec 輸入要被累加計算的陣列
 * @returns {Array} 回傳各元素累加後之陣列
 * @example
 *
 * console.log(arrNorm([1, 2, 3, 4]))
 * // => 5.477225575051661
 *
 * console.log(arrNorm([0.1, 0.1, 0.1, 0.1]))
 * // => 0.2
 *
 * console.log(arrNorm([11, 22, 33, 44]))
 * // => 60.249481325568276
 *
 */
function arrNorm(vec) {

    //check
    if (!isearr(vec)) {
        return null
    }

    //arrProduct
    let r = arrProduct(vec, vec)

    //check
    if (!isnum(r)) {
        return null
    }

    if (r <= 0) {
        return null
    }

    return Math.sqrt(r)
}


export default arrNorm
