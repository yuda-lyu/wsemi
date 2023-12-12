import get from 'lodash-es/get'
import each from 'lodash-es/each'
import map from 'lodash-es/map'
import size from 'lodash-es/size'
import isearr from './isearr.mjs'
import iseobj from './iseobj.mjs'
import isstr from './isstr.mjs'
import isnum from './isnum.mjs'
import isbol from './isbol.mjs'
import haskey from './haskey.mjs'
import o2j from './o2j.mjs'
import getltdtkeys from './getltdtkeys.mjs'


/**
 * 由物件陣列ltdt並使用keys取值轉二維陣列mat
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/ltdtkeys2mat.test.mjs Github}
 * @memberOf wsemi
 * @param {Array} ltdt 輸入物件陣列
 * @param {Array} [keys=null] 輸入字串陣列，若不輸入則由ltdt提取，預設為null
 * @param {Object} [opt={}] 輸入設定物件，預設{}
 * @param {String|Number|Array|Object} [opt.empty=''] 輸入若無鍵值時給予之預設值，預設''
 * @returns {Array} 回傳資料陣列
 * @example
 *
 * console.log(ltdtkeys2mat([{ a: 12, b: 34.56 }, { a: '123', b: 'xyz' }], ['a', 'b']))
 * // => [[12, 34.56], ['123', 'xyz']]
 *
 */
function ltdtkeys2mat(ltdt, keys = null, opt = {}) {

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

    //empty
    let empty = get(opt, 'empty', '')

    //mat
    let mat = []
    each(ltdt, function(v) {
        let r = map(keys, function(k) {
            if (!haskey(v, k)) {
                return empty
            }
            else if (isbol(v[k])) {
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
