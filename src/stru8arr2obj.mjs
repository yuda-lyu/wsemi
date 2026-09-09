import get from 'lodash-es/get.js'
import isbol from './isbol.mjs'
import iseobj from './iseobj.mjs'
import isestr from './isestr.mjs'
import isarr from './isarr.mjs'
import isu8arr from './isu8arr.mjs'
import isu16arr from './isu16arr.mjs'
import isab from './isab.mjs'


/**
 * 由字串與Unit8Array陣列轉物件，為對obj2stru8arr序列化之數據進行反序列化
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/stru8arr2obj.test.mjs Github}
 * @memberOf wsemi
 * @param {String} data.results 輸入待反序列化字串，其內二進位數據之標記為'[BlazeForUint8Array]::<i>'、'[BlazeForUint16Array]::<i>'、'[BlazeForArrayBuffer]::<i>'，須完整匹配整個字串值才視為二進位參照，故應用字串內夾雜標記文字者不受影響；恰與標記格式完整相同之應用字串由編碼端前置'[BlazeForPreventEscape]'跳脫，此處會剝除一層還原；標記格式正確但索引越界者視為壞封包。注意不支援還原舊版之'[Uint8Array]::<i>'、'[Uint16Array]::<i>'、'[ArrayBuffer]::<i>'標記
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

    //reMark, 標記須完整匹配整個字串(錨定^與$), 否則應用字串內只要夾雜標記文字即被誤判為二進位參照; 索引直接取自捕獲組, 不再以replace去頭後交cint推算(殘留文字會被cint吃成0而取到錯誤之binary)
    let reMark = /^\[BlazeFor(Uint8Array|Uint16Array|ArrayBuffer)\]::(\d+)$/

    //restoreBin, 依標記所記之原型別還原二進位
    //經obj2u8arr打包者, binarys內為切出之原始位元組Uint8Array, 須依型別重建; 未經打包者(直接呼叫obj2stru8arr)binarys內即為原物件, 已是該型別故原樣回傳
    let restoreBin = (type, id, b) => {
        if (type === 'Uint16Array' && !isu16arr(b)) {
            if (!isu8arr(b)) {
                throw new Error(`binarys[${id}] can not be restored to Uint16Array`)
            }
            if (b.byteLength % 2 !== 0) {
                throw new Error(`binarys[${id}] byteLength[${b.byteLength}] is not even, can not be restored to Uint16Array`)
            }
            //Uint16Array之視圖要求byteOffset對齊且長度相符, 不符者複製一份以取得對齊之buffer
            let bb = (b.byteOffset === 0 && b.byteLength === b.buffer.byteLength) ? b : new Uint8Array(b)
            return new Uint16Array(bb.buffer)
        }
        if (type === 'ArrayBuffer' && !isab(b)) {
            if (!isu8arr(b)) {
                throw new Error(`binarys[${id}] can not be restored to ArrayBuffer`)
            }
            return b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength)
        }
        return b
    }

    //reEsced, 編碼端對「與標記格式完整相同之應用字串」前置了跳脫記號, 此處剝掉一層還原; 允許重複跳脫故以*涵蓋多層
    let tagEsc = '[BlazeForPreventEscape]'
    let reEsced = /^\[BlazeForPreventEscape\](?:\[BlazeForPreventEscape\])*\[BlazeFor(?:Uint8Array|Uint16Array|ArrayBuffer)\]::\d+$/

    let o = {}
    try {

        o = JSON.parse(results, function(key, value) {

            //check, 以首字元'['(charCode 91)快篩, 避免對每個字串都跑regex
            if (!isestr(value) || value.charCodeAt(0) !== 91) {
                return value
            }

            //m
            let m = reMark.exec(value)
            if (m === null) {

                //反跳脫, 剝掉一層跳脫記號還原應用字串
                if (reEsced.test(value)) {
                    return value.slice(tagEsc.length)
                }

                return value
            }

            //id, 須做界線檢查; 標記格式正確但索引不存在, 只可能為封包損毀或results與binarys不匹配, 故視為壞封包直接拋錯交由外層catch, 不可回undefined(reviver回undefined會使該鍵消失、陣列元素變null)而靜默毀損
            let id = Number(m[2])
            if (id >= binarys.length) {
                throw new Error(`binary index out of range[${id}], binarys.length[${binarys.length}]`)
            }

            return restoreBin(m[1], id, binarys[id])
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
