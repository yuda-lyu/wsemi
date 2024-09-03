import map from 'lodash-es/map.js'
import pullAt from 'lodash-es/pullAt.js'
import cloneDeep from 'lodash-es/cloneDeep.js'
import isearr from './isearr.mjs'
import isp0int from './isp0int.mjs'
import cint from './cint.mjs'


/**
 * 針對陣列移除指定位置或陣列的指定位置
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/arrPullAt.test.mjs Github}
 * @memberOf wsemi
 * @param {Array} vsrc 輸入原始陣列
 * @param {Array|Integer} vpull 輸入要被移除的指定位置或陣列的指定位置
 * @returns {Array} 回傳移除後陣列
 * @example
 *
 * console.log(arrPullAt([1, 2, 3, 4, 5, 'abc'], [0, 2]))
 * // => [ 2, 4, 5, 'abc' ]
 *
 * console.log(arrPullAt([1, 2, 3, '4', 5, 'abc'], [1, 3]))
 * // => [ 1, 3, 5, 'abc' ]
 *
 * console.log(arrPullAt([1, 2, 3, '4', 5, 'abc'], [4, 7]))
 * // => [ 1, 2, 3, '4', 'abc' ]
 *
 */
function arrPullAt(vall, vpull) {

    //check
    if (!isearr(vall)) {
        return []
    }

    //vall
    if (isp0int(vpull)) {
        vpull = [vpull]
    }
    if (!isearr(vpull)) {
        return vall
    }

    //cdbl
    vpull = map(vpull, (v) => {
        return cint(v)
    })

    //cloneDeep
    let rs = cloneDeep(vall)

    //pullAt
    pullAt(rs, vpull)

    return rs
}


export default arrPullAt
