import each from 'lodash/each'
import keys from 'lodash/keys'
import uniq from 'lodash/uniq'
import isearr from './isearr.mjs'


/**
 * 由ltdt提取不重複keys
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/getltdtkeys.test.js Github}
 * @memberOf wsemi
 * @param {Array} ltdt 輸入物件陣列
 * @returns {Array} 回傳不重複keys陣列
 * @example
 *
 * console.log(getltdtkeys([{ a: 123, b: 'xyz', c: '45op', d: null }, { a: 123.456, b: 'xyz', d: '45op', e: '' }]))
 * // => ['a', 'b', 'c', 'd', 'e']
 *
 */
function getltdtkeys(ltdt) {

    //check
    if (!isearr(ltdt)) {
        return []
    }

    //ks
    let ks = []
    each(ltdt, function(v) {
        let kst = keys(v)
        ks = [...ks, ...kst]
        ks = uniq(ks)
    })

    return ks
}


export default getltdtkeys
