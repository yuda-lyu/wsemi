import map from 'lodash/map'
import merge from 'lodash/merge'
import isarr from './isarr.mjs'


/**
 * 針對物件陣列ltdt1與ltdt2逐一呼叫merge合併
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/ltdtmerge.test.js Github}
 * @memberOf wsemi
 * @param {Array} ltdt1 輸入資料物件陣列
 * @param {Array} ltdt2 輸入資料物件陣列，若與ltdt1內物件有重複的欄位值，優先保留ltdt2內物件的欄位值
 * @returns {Array} 回傳處理後物件陣列
 * @example
 * console.log(ltdtmerge([{ a: 12, b: 34.56 }, {}], [{ a: '123', c: 'mn' }, { aa: 'a123', bb: 'bmn' }]))
 * // => [{ a: '123', b: 34.56, c: 'mn' }, { aa: 'a123', bb: 'bmn' }]
 */
function ltdtmerge(ltdt1, ltdt2) {

    //check
    if (!isarr(ltdt1) || !isarr(ltdt2)) {
        return []
    }
    if (ltdt1.length !== ltdt2.length) {
        return []
    }

    let r = map(ltdt1, function(v, k) {
        return merge(ltdt1[k], ltdt2[k])
    })

    return r
}


export default ltdtmerge
