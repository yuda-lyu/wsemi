import each from 'lodash/each'
import get from 'lodash/get'
import map from 'lodash/map'
import concat from 'lodash/concat'
import isearr from './isearr.mjs'
import iseobj from './iseobj.mjs'
import getltdtkeys from './getltdtkeys.mjs'
import ltdtkeys2mat from './ltdtkeys2mat.mjs'


/**
 * keys轉heads，物件陣列ltdt使用keys取值，兩者合併轉出二維陣列mat
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/ltdtkeysheads2mat.test.mjs Github}
 * @memberOf wsemi
 * @param {Array} ltdt 輸入物件陣列
 * @param {Array} keys 輸入字串陣列，若不輸入則由ltdt提取
 * @param {Object} kphead 輸入字典物件，內含keys對應values之物件，供keys查詢得values，若不輸入則由keys提取
 * @returns {Array} 回傳資料陣列
 * @example
 *
 * console.log(ltdtkeysheads2mat([{ a: 12, b: 34.56 }, { a: '123', b: 'xyz' }], ['a', 'b'], { a: 'c1', b: 'c2' }))
 * // => [['c1', 'c2'], [12, 34.56], ['123', 'xyz']]
 *
 */
function ltdtkeysheads2mat(ltdt, keys, kphead) {

    //check
    if (!isearr(ltdt)) {
        return []
    }

    //keys
    if (!isearr(keys)) {
        keys = getltdtkeys(ltdt)
    }

    //kphead
    if (!iseobj(kphead)) {
        kphead = {}
        each(keys, (v) => {
            kphead[v] = v
        })
    }

    //check
    let b = false
    each(ltdt, function(v) {
        if (!iseobj(v)) {
            b = true
        }
    })
    if (b) {
        return []
    }

    //h
    let h = map(keys, function(key) {
        return get(kphead, key)
    })

    //m
    let m = ltdtkeys2mat(ltdt, keys)

    //mat
    let mat = concat([h], m)

    return mat
}


export default ltdtkeysheads2mat
