import map from 'lodash/map'
import keys from 'lodash/keys'
import flattenDeep from 'lodash/flattenDeep'
import uniq from 'lodash/uniq'
import reverse from 'lodash/reverse'
import isearr from './isearr.mjs'


/**
 * 由ltdt提取不重複keys
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/getltdtkeys.test.js Github}
 *
 * @example
 *
 * @memberOf wsemi
 * @param {Array} ltdt 輸入物件陣列
 * @returns {Array} 回傳不重複keys陣列
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
