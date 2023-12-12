import size from 'lodash-es/size'
import sum from 'lodash-es/sum'
import arrMulti from './arrMulti.mjs'


/**
 * 各陣列同位置元素相乘並加總
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/arrProduct.test.mjs Github}
 * @memberOf wsemi
 * @param {Array} arguments 輸入n個陣列，需同長度，其內元素皆會轉為浮點數，各陣列針對各元素進行相加總
 * @returns {Array} 回傳各元素相加後陣列
 * @example
 *
 * let v1 = [1, 2, 3, 4]
 * let v2 = [0.1, 0.1, 0.1, 0.1]
 * let v3 = [11, 22, 33, 44]
 *
 * console.log(arrProduct(v1, v2))
 * // => 1
 *
 * console.log(arrProduct(v1, v2, v3))
 * // => 33
 *
 */
function arrProduct() {

    //check
    if (size(arguments) < 2) {
        return null
    }

    //arrMulti
    let r = arrMulti(...arguments)

    //check
    if (size(r) === 0) {
        return null
    }

    //sum
    r = sum(r)

    return r
}


export default arrProduct
