import get from 'lodash-es/get.js'
import isbol from './isbol.mjs'
import iseobj from './iseobj.mjs'
import isestr from './isestr.mjs'
import isarr from './isarr.mjs'
import cint from './cint.mjs'


/**
 * 由字串與Unit8Array陣列轉物件，為對obj2stru8arr序列化之數據進行反序列化
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/stru8arr2obj.test.mjs Github}
 * @memberOf wsemi
 * @param {String} data.results 輸入待反序列化字串，其內二進位數據之標記為'[BlazeForUint8Array]::<i>'、'[BlazeForUint16Array]::<i>'、'[BlazeForArrayBuffer]::<i>'，注意不支援還原舊版之'[Uint8Array]::<i>'、'[Uint16Array]::<i>'、'[ArrayBuffer]::<i>'標記
 * @param {Array} data.binarys 輸入Unit8Array陣列
 * @param {Object} [opt={}] 輸入設定物件，預設{}
 * @param {Boolean} [opt.returnWithStateAndMsg=false] 輸入是否回傳含狀態與訊息物件布林值，若為true則回傳{ state, msg }物件，state為'success'或'error'，msg於success時為回傳結果、於error時為錯誤訊息字串，預設false
 * @returns {*} 回傳任意物件，輸入無效或反序列化失敗(如results非合法JSON)時回傳空物件；若opt.returnWithStateAndMsg為true則回傳{ state, msg }物件
 * @example
 *
 * let r = {
 *     results: '{"a":123,"b":45.67,"c":"l1-測試中文","d":{"da":123,"db":45.67,"dc":"l2-測試中文","dd":["a","xyz",321,76.54],"de":"[BlazeForUint8Array]::0"}}',
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
 * console.log(stru8arr2obj({ results: 'not-json', binarys: [] }, { returnWithStateAndMsg: true }))
 * // => {
 * //     state: 'error',
 * //     msg: 'SyntaxError: Unexpected token \'o\', "not-json" is not valid JSON'
 * // }
 *
 */
function stru8arr2obj(data, opt = {}) {

    //returnWithStateAndMsg
    let returnWithStateAndMsg = get(opt, 'returnWithStateAndMsg', null)
    if (!isbol(returnWithStateAndMsg)) {
        returnWithStateAndMsg = false
    }

    //retError
    let retError = (msg) => {
        if (returnWithStateAndMsg) {
            return {
                state: 'error',
                msg,
            }
        }
        else {
            return {}
        }
    }

    //check
    if (!iseobj(data)) {
        return retError('invalid data')
    }

    //results, binarys, 取值須攔截非預期錯誤(如data之getter拋錯), 否則會外拋至呼叫端
    let results = null
    let binarys = null
    try {
        results = data.results
        binarys = data.binarys
    }
    catch (err) {
        return retError(err.toString())
    }

    //check
    if (!isestr(results)) {
        return retError('invalid results')
    }
    if (!isarr(binarys)) {
        return retError('invalid binarys')
    }

    let o = {}
    try {

        o = JSON.parse(results, function(key, value) {
            if (isestr(value)) {

                //標記, 以BlazeFor前綴降低與應用字串碰撞之機率
                if (value.indexOf('[BlazeForUint8Array]::') >= 0) {
                    let id = cint(value.replace('[BlazeForUint8Array]::', ''))
                    return binarys[id]
                }
                else if (value.indexOf('[BlazeForUint16Array]::') >= 0) {
                    let id = cint(value.replace('[BlazeForUint16Array]::', ''))
                    return binarys[id]
                }
                else if (value.indexOf('[BlazeForArrayBuffer]::') >= 0) {
                    let id = cint(value.replace('[BlazeForArrayBuffer]::', ''))
                    return binarys[id]
                }

            }
            return value
        })

    }
    catch (err) {
        return retError(err.toString())
    }

    if (returnWithStateAndMsg) {
        return {
            state: 'success',
            msg: o,
        }
    }
    else {
        return o
    }
}


export default stru8arr2obj
