import map from 'lodash/map'
import keys from 'lodash/keys'
import flattenDeep from 'lodash/flattenDeep'
import uniq from 'lodash/uniq'
import reverse from 'lodash/reverse'


/**
 * 由ltdt提取不重複keys
 *
 * @memberOf wsemi
 * @param {Array} ltdt 輸入物件陣列
 * @returns {Array} 回傳不重複keys陣列
 */
function getltdtkeys(ltdt) {

    //keys
    // let keys = _.chain(ltdt)
    //     .map(function(v) {
    //         return _.keys(v)
    //     })
    //     .flattenDeep()
    //     .uniq()
    //     .sort()
    //     .reverse()
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

    //reverse
    r = reverse(r)

    return r
}


export default getltdtkeys
