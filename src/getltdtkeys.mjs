import map from 'lodash/map'
import keys from 'lodash/keys'
import flattenDeep from 'lodash/flattenDeep'
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

    //keys
    // let keys = _.chain(ltdt)
    //     .map(function(v) {
    //         return _.keys(v)
    //     })
    //     .flattenDeep()
    //     .uniq()
    //     .sort()
    //     .value()

    //rowkeys
    let rowkeys = map(ltdt, function(v) {
        return keys(v)
    })

    //r
    let r = flattenDeep(rowkeys)

    //uniq
    r = uniq(r)

    //sort
    r.sort()

    return r
}


export default getltdtkeys
