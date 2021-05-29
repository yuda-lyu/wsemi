import map from 'lodash/map'
import isEqual from 'lodash/isEqual'
import isarr from './isarr.mjs'
import iser from './iser.mjs'


/**
 * 由vall陣列找尋vfind內各元素之第1位置
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/arrfind.test.js Github}
 * @memberOf wsemi
 * @param {String|Number|Object|Boolean|Array} vall 輸入要被尋找的任意資料陣列
 * @param {String|Number|Object|Boolean|Array} vfind 輸入要尋找的任意資料陣列
 * @returns {Array} 回傳所找到各元素第1位置之陣列
 * @example
 *
 * console.log(arrfind([1, 2, 3, '4', 5, 'abc'], 2))
 * // => [ 1 ]
 *
 * console.log(arrfind([1, 2, 3, '4', 5, 'abc'], 12))
 * // => [ -1 ]
 *
 * console.log(arrfind([1, 2, 3, '4', 5, 'abc'], [2]))
 * // => [ 1 ]
 *
 * console.log(arrfind([1, 2, 3, '4', 5, 'abc'], ['4', 2]))
 * // => [ 3, 1 ]
 *
 * console.log(arrfind([1, true, 2, 3, '4', true, 5, 'abc'], true))
 * // => [ 1 ]
 *
 * console.log(arrfind([1, true, 2, 3, '4', true, 5, 'abc'], [true]))
 * // => [ 1 ]
 *
 * console.log(arrfind([1, 2, { x: 'xyz' }, 3, '4', 5, 'abc'], { x: 'xyz' }))
 * // => [ 2 ]
 *
 * console.log(arrfind([1, 2, { x: 'xyz' }, 3, '4', 5, 'abc'], [{ x: 'xyz' }]))
 * // => [ 2 ]
 *
 * console.log(arrfind([1, 2, { x: 'xyz' }, 3, '4', 5, 'abc'], ['4', { x: 'xyz' }]))
 * // => [ 4, 2 ]
 *
 * console.log(arrfind([1, 2, { x: 'xyz' }, 3, '4', 5, 'abc'], [7, { x: 'xyz' }]))
 * // => [-1, 2]
 *
 */
function arrfind(vall, vfind) {

    function ck(v) {
        if (isarr(v)) {
            return v
        }
        return [v]
    }

    //check vall, 會自動轉陣列
    if (iser(vall)) {
        return []
    }
    vall = ck(vall)
    if (vall.length === 0) {
        return []
    }

    //check vfind, 會自動轉陣列
    if (iser(vfind)) {
        return []
    }
    vfind = ck(vfind)

    //map and find
    let inds = map(vfind, function(v) {
        let r = -1
        for (let k = 0; k < vall.length; k++) {
            if (isEqual(vall[k], v)) {
                r = k
                break
            }
        }
        return r
    })

    return inds
}


export default arrfind
