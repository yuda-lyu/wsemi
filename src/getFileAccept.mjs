import each from 'lodash-es/each.js'
import haskey from './haskey.mjs'
import getFileType from './getFileType.mjs'


/**
 * 取得檔案關聯性資訊
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/getFileAccept.test.mjs Github}
 * @memberOf wsemi
 * @param {string} [groupBy=''] 輸入群組化關鍵字字串，預設''，可選用'name','group','acp','exec'
 * @returns {Array} 回傳檔案關聯性資訊陣列，若有給groupBy則自動群組化
 * @example
 *
 * console.log(getFileAccept()[2])
 * // => { name: 'pdf',
 * //      group: 'docums',
 * //      acp: 'application/pdf',
 * //      exec: 'acrobat' }
 *
 * console.log(getFileAccept('acp')['text/html'])
 * // => [ { name: 'htm',
 * //        group: 'docums',
 * //        acp: 'text/html',
 * //        exec: 'browser' },
 * //      { name: 'html',
 * //        group: 'docums',
 * //        acp: 'text/html',
 * //        exec: 'browser' } ]
 *
 */
function getFileAccept(groupBy = '') {

    //check
    if (
        groupBy !== '' &&
        groupBy !== 'name' &&
        groupBy !== 'group' &&
        groupBy !== 'acp' &&
        groupBy !== 'exec'
    ) {
        return []
    }

    //getFileType
    let data = getFileType()

    //check
    if (groupBy === '') {
        return data
    }

    //groupBy
    let r = {}
    each(data, function(v) {
        let k = v[groupBy]
        if (!haskey(r, k)) {
            r[k] = []
        }
        r[k].push(v)
    })

    return r
}

export default getFileAccept
