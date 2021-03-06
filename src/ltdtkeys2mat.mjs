import each from 'lodash/each'
import map from 'lodash/map'
import size from 'lodash/size'
import isearr from './isearr.mjs'
import iseobj from './iseobj.mjs'
import isstr from './isstr.mjs'
import isnum from './isnum.mjs'
import isbol from './isbol.mjs'
import o2j from './o2j.mjs'
import getltdtkeys from './getltdtkeys.mjs'


/**
 * 由物件陣列ltdt並使用keys取值轉二維陣列mat
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/ltdtkeys2mat.test.js Github}
 * @memberOf wsemi
 * @param {Array} ltdt 輸入物件陣列
 * @param {Array} keys 輸入字串陣列，若不輸入則由ltdt提取
 * @returns {Array} 回傳資料陣列
 * @example
 *
 * console.log(ltdtkeys2mat([{ a: 12, b: 34.56 }, { a: '123', b: 'xyz' }], ['a', 'b']))
 * // => [[12, 34.56], ['123', 'xyz']]
 *
 */
function ltdtkeys2mat(ltdt, keys) {

    //check
    if (!isearr(ltdt)) {
        return []
    }

    //keys
    if (!isearr(keys)) {
        keys = getltdtkeys(ltdt)
    }

    //check
    if (size(keys) === 0) {
        return []
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

    //mat
    let mat = []
    each(ltdt, function(v) {
        let r = map(keys, function(k) {
            if (isbol(v[k])) {
                return v[k] ? 'true' : 'false'
            }
            else if (!isstr(v[k]) && !isnum(v[k])) {
                return o2j(v[k])
            }
            return v[k]
        })
        mat.push(r)
    })

    return mat
}


export default ltdtkeys2mat
