import iseobj from './iseobj.mjs'
import isestr from './isestr.mjs'
import isarr from './isarr.mjs'
import cint from './cint.mjs'


/**
 * 由字串與Unit8Array陣列轉物件，為對obj2stru8arr序列化之數據進行反序列化
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/stru8arr2obj.test.mjs Github}
 * @memberOf wsemi
 * @param {String} data.results 輸入待反序列化字串
 * @param {Array} data.binarys 輸入Unit8Array陣列
 * @returns {*} 回傳任意物件
 * @example
 *
 * let r = {
 *     results: '{"a":123,"b":45.67,"c":"l1-測試中文","d":{"da":123,"db":45.67,"dc":"l2-測試中文","dd":["a","xyz",321,76.54],"de":"[Uint8Array]::0"}}',
 *     binarys: [new Uint8Array([66, 97, 115])]
 * }
 * let data = stru8arr2obj(r)
 * console.log(data)
 * // => {
 * //     a: 123,
 * //     b: 45.67,
 * //     c: 'l1-測試中文',
 * //     d: {
 * //         da: 123,
 * //         db: 45.67,
 * //         dc: 'l2-測試中文',
 * //         dd: [ 'a', 'xyz', 321, 76.54 ],
 * //         de: Uint8Array [ 66, 97, 115 ]
 * //     }
 * // }
 *
 */
function stru8arr2obj(data) {

    //check
    if (!iseobj(data)) {
        return {}
    }

    //results, binarys
    let { results, binarys } = data

    //check
    if (!isestr(results)) {
        return {}
    }
    if (!isarr(binarys)) {
        return {}
    }

    let o = {}
    try {

        o = JSON.parse(results, function(key, value) {
            if (isestr(value)) {
                if (value.indexOf('[Uint8Array]::') >= 0) {
                    let id = cint(value.replace('[Uint8Array]::', ''))
                    return binarys[id]
                }
                else if (value.indexOf('[Uint16Array]::') >= 0) {
                    let id = cint(value.replace('[Uint16Array]::', ''))
                    return binarys[id]
                }
                else if (value.indexOf('[ArrayBuffer]::') >= 0) {
                    let id = cint(value.replace('[ArrayBuffer]::', ''))
                    return binarys[id]
                }
            }
            return value
        })

    }
    catch (err) { }

    return o
}


export default stru8arr2obj
