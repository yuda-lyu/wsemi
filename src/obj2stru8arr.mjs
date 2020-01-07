import isobj from './isobj.mjs'
import isobj0 from './isobj0.mjs'
import isu8arr from './isu8arr.mjs'
import isu16arr from './isu16arr.mjs'


/**
 * 物件資料轉字串與Unit8Array，物件內可含Unit8Array數據，適用於大檔。
 *
 * 通過JSON序列化物件內非Unit8Array數據成為字串，另分拆Unit8Array數據出來回傳，兩者間通過指標關聯，主要為避免序列化大型Unit8Array數據造成效能或記憶體不足問題
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/obj2stru8arr.test.js Github}
 * @memberOf wsemi
 * @param {*} data 輸入任意資料
 * @returns {Object} 回傳物件，results欄位儲存物件內非序列化文字，binarys欄位儲存各Unit8Array數據
 * @example
 * let data = {
 *     a: 123,
 *     b: 45.67,
 *     c: 'l1-測試中文',
 *     d: {
 *         da: 123,
 *         db: 45.67,
 *         dc: 'l2-測試中文',
 *         dd: ['a', 'xyz', 321, 76.54],
 *         de: new Uint8Array([66, 97, 115]),
 *     },
 * }
 * let r = obj2stru8arr(data)
 * console.log(r)
 * // => {
 * //     results: '{"a":123,"b":45.67,"c":"l1-測試中文","d":{"da":123,"db":45.67,"dc":"l2-測試中文","dd":["a","xyz",321,76.54],"de":"[Uint8Array]::0"}}',
 * //     binarys: [ Uint8Array [ 66, 97, 115 ] ]
 * // }
 */
function obj2stru8arr(o) {

    //check
    if (!isobj(o)) {
        return {
            results: '',
            binarys: []
        }
    }
    if (isobj0(o)) {
        return {
            results: '',
            binarys: []
        }
    }

    let r = ''
    let bs = []
    try {

        let i = -1
        r = JSON.stringify(o, function(key, value) {
            if (isu8arr(value)) {
                i += 1
                let id = `[Uint8Array]::${i}`
                bs.push(value)
                return id
            }
            else if (isu16arr(value)) {
                i += 1
                let id = `[Uint16Array]::${i}`
                bs.push(value)
                return id
            }
            return value
        })

    }
    catch (err) { }

    return {
        results: r,
        binarys: bs
    }
}


export default obj2stru8arr
