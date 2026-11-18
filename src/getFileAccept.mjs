import each from 'lodash-es/each.js'
import getFileType from './getFileType.mjs'


/**
 * 取得檔案關聯性資訊
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/getFileAccept.test.mjs Github}
 * @memberOf wsemi
 * @param {string} [groupBy=''] 輸入群組化關鍵字字串，可選用'name','group','acp','exec'，空字串或其他值(含null、數字、布林、物件、陣列、包裝物件、不在可選集合之字串)視為未給而改用預設''(不群組化，回傳陣列)，不報錯，預設''
 * @returns {Array|Object} 回傳檔案關聯性資訊陣列，若有給有效groupBy則自動群組化(回傳以該欄位值為鍵、各組陣列為值之物件)
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

    //groupBy, opt類位置參數(簽名預設''): 非預期(非字串, 或不在name、group、acp、exec之字串)視為未給, 改用預設''(不群組化, 回傳陣列; K3, W-13/N-B, 使用者2026-11-16)
    if (
        groupBy !== '' &&
        groupBy !== 'name' &&
        groupBy !== 'group' &&
        groupBy !== 'acp' &&
        groupBy !== 'exec'
    ) {
        groupBy = ''
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
        if (!Object.prototype.hasOwnProperty.call(r, k)) {
            r[k] = []
        }
        r[k].push(v)
    })

    return r
}

export default getFileAccept
