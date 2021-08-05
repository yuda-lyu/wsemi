import isEqual from 'lodash/isEqual'
import isarr from './isarr.mjs'
import iser from './iser.mjs'


/**
 * 判斷任一字串陣列vtar內元素，是否「等於」任一字串陣列vhas內元素
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/arrhas.test.mjs Github}
 * @memberOf wsemi
 * @param {String|Number|Object|Boolean|Array} vtar 輸入被查找的字串陣列或字串
 * @param {String|Number|Object|Boolean|Array} vhas 輸入查找字串陣列或字串
 * @returns {Boolean} 回傳判斷布林值
 * @example
 *
 * console.log(arrhas([1, 2, 3, '4', 5, 'abc'], 2))
 * // => true
 *
 * console.log(arrhas([1, 2, 3, '4', 5, 'abc'], 6))
 * // => false
 *
 * console.log(arrhas([1, 2, 3, '4', 5, 'abc'], [2]))
 * // => true
 *
 * console.log(arrhas([1, 2, 3, '4', 5, 'abc'], [6]))
 * // => false
 *
 * console.log(arrhas([1, 2, 3, '4', 5, 'abc'], ['4', 2]))
 * // => true
 *
 * console.log(arrhas([1, 2, 3, '4', 5, 'abc'], ['7', 6]))
 * // => false
 *
 * console.log(arrhas([1, true, 2, 3, '4', true, 5, 'abc'], true))
 * // => true
 *
 * console.log(arrhas([1, true, 2, 3, '4', true, 5, 'abc'], false))
 * // => false
 *
 * console.log(arrhas([1, true, 2, 3, '4', true, 5, 'abc'], [true]))
 * // => true
 *
 * console.log(arrhas([1, true, 2, 3, '4', true, 5, 'abc'], [false]))
 * // => false
 *
 * console.log(arrhas([1, 2, { x: 'xyz' }, 3, '4', 5, 'abc'], { x: 'xyz' }))
 * // => true
 *
 * console.log(arrhas([1, 2, { x: 'xyz' }, 3, '4', 5, 'abc'], { x: 'opqr' }))
 * // => false
 *
 * console.log(arrhas([1, 2, { x: 'xyz' }, 3, '4', 5, 'abc'], [{ x: 'xyz' }]))
 * // => true
 *
 * console.log(arrhas([1, 2, { x: 'xyz' }, 3, '4', 5, 'abc'], [{ x: 'opqr' }]))
 * // => false
 *
 * console.log(arrhas([1, 2, { x: 'xyz' }, 3, '4', 5, 'abc'], ['4', { x: 'xyz' }]))
 * // => true
 *
 * console.log(arrhas([1, 2, { x: 'xyz' }, 3, '4', 5, 'abc'], ['7', { x: 'opqr' }]))
 * // => false
 *
 */
function arrhas(vtar, vhas) {

    function ck(v) {
        if (isarr(v)) {
            return v
        }
        return [v]
    }

    //check vtar, 會自動轉陣列
    if (iser(vtar)) {
        return false
    }
    vtar = ck(vtar)
    if (vtar.length === 0) {
        return false
    }

    //check vhas, 會自動轉陣列
    if (iser(vtar)) {
        return false
    }
    vhas = ck(vhas)
    if (vhas.length === 0) {
        return false
    }

    //由vtar各元素當中，若存在vhas內任一元素則回傳true，反之回傳false
    for (let i = 0; i < vtar.length; i++) {
        for (let j = 0; j < vhas.length; j++) {
            if (isEqual(vtar[i], vhas[j])) {
                return true
            }
        }
    }
    return false
}


export default arrhas
