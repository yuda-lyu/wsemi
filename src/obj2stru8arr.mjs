import isError from 'lodash-es/isError.js'
import get from 'lodash-es/get.js'
import isbol from './isbol.mjs'
import isobj from './isobj.mjs'
import isobj0 from './isobj0.mjs'
import isestr from './isestr.mjs'
import isarr from './isarr.mjs'
import isarr0 from './isarr0.mjs'
import isu8arr from './isu8arr.mjs'
import isu16arr from './isu16arr.mjs'
import isab from './isab.mjs'
//import treeObj from './treeObj.mjs'


/**
 * 物件資料轉字串與Unit8Array，物件內可含Unit8Array數據，適用於大檔。
 *
 * 通過JSON序列化物件內非Unit8Array數據成為字串，另分拆Unit8Array數據出來回傳，兩者間通過指標關聯，主要為避免序列化大型Unit8Array數據造成效能或記憶體不足問題
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/obj2stru8arr.test.mjs Github}
 * @memberOf wsemi
 * @param {Object|Array} data 輸入物件或陣列資料
 * @param {Object} [opt={}] 輸入設定物件，預設{}
 * @param {Boolean} [opt.returnWithStateAndMsg=false] 輸入是否回傳含狀態與訊息物件布林值，若為true則回傳{ state, msg }物件，state為'success'或'error'，msg於success時為回傳結果、於error時為錯誤訊息字串，預設false
 * @returns {Object} 回傳物件，results欄位儲存物件內非序列化文字，binarys欄位儲存各Unit8Array數據；二進位數據於results內以'[BlazeForUint8Array]::<i>'一類標記代表，應用字串若恰與標記格式完整相同則會被前置'[BlazeForPreventEscape]'跳脫，供解碼端還原時區分；輸入非物件非陣列、空物件空陣列或序列化失敗(如含BigInt、循環參照)時回傳{ results: '', binarys: [] }；若opt.returnWithStateAndMsg為true則回傳{ state, msg }物件
 * @example
 *
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
 * //     results: '{"a":123,"b":45.67,"c":"l1-測試中文","d":{"da":123,"db":45.67,"dc":"l2-測試中文","dd":["a","xyz",321,76.54],"de":"[BlazeForUint8Array]::0"}}',
 * //     binarys: [ Uint8Array [ 66, 97, 115 ] ]
 * // }
 *
 * console.log(obj2stru8arr({ id: 1n }, { returnWithStateAndMsg: true }))
 * // => {
 * //     state: 'error',
 * //     msg: 'TypeError: Do not know how to serialize a BigInt'
 * // }
 *
 */
function obj2stru8arr(o, opt = {}) {

    //returnWithStateAndMsg
    let returnWithStateAndMsg = get(opt, 'returnWithStateAndMsg', null)
    if (!isbol(returnWithStateAndMsg)) {
        returnWithStateAndMsg = false
    }

    //retEmpty, 失敗時之空回傳值
    let retEmpty = () => {
        return {
            results: '',
            binarys: []
        }
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
            return retEmpty()
        }
    }

    //check, 物件與陣列皆支援(obj2u8arr之輸入契約為物件或陣列, 解碼端stru8arr2obj亦原就能還原陣列)
    if (!isobj(o) && !isarr(o)) {
        return retError('invalid data, data is not an object or array')
    }
    if (isobj0(o) || isarr0(o)) {
        return retError('invalid data, data is an empty object or empty array')
    }

    //reNeedEsc, 應用字串若與標記格式完整相同(或已是跳脫過之外觀), 須前置跳脫記號, 否則解碼端會誤判為二進位參照; 允許重複跳脫故以*涵蓋多層
    let tagEsc = '[BlazeForPreventEscape]'
    let reNeedEsc = /^(?:\[BlazeForPreventEscape\])*\[BlazeFor(?:Uint8Array|Uint16Array|ArrayBuffer)\]::\d+$/

    let r = ''
    let bs = []
    try {

        //分離u8a或u16a或ab出來
        let i = -1
        r = JSON.stringify(o, function(key, value) {
            //console.log(key, value)
            if (isu8arr(value)) {
                i += 1
                let id = `[BlazeForUint8Array]::${i}`
                bs.push(value)
                return id
            }
            else if (isu16arr(value)) {
                i += 1
                let id = `[BlazeForUint16Array]::${i}`
                bs.push(value)
                return id
            }
            else if (isab(value)) {
                i += 1
                let id = `[BlazeForArrayBuffer]::${i}`
                bs.push(value)
                return id
            }
            if (isError(value)) {
                value = value.toString()
            }

            //跳脫, 以首字元'['(charCode 91)快篩, 避免對每個字串都跑regex
            if (isestr(value) && value.charCodeAt(0) === 91 && reNeedEsc.test(value)) {
                return tagEsc + value
            }

            return value
        })

        // //treeObj, 分離u8a或u16a出來
        // let i = -1
        // let t = treeObj(o, function(key, value) {
        //     //console.log(key, value)
        //     if (isu8arr(value)) {
        //         i += 1
        //         let id = `[BlazeForUint8Array]::${i}`
        //         bs.push(value)
        //         return id
        //     }
        //     else if (isu16arr(value)) {
        //         i += 1
        //         let id = `[BlazeForUint16Array]::${i}`
        //         bs.push(value)
        //         return id
        //     }
        //     return value
        // })

        // //stringify
        // r = JSON.stringify(t)

    }
    catch (err) {
        //JSON.stringify拋錯(如含BigInt、循環參照)時, bs可能已被推入部份數據, 故一律回乾淨之空值
        return retError(err.toString())
    }

    if (returnWithStateAndMsg) {
        return {
            state: 'success',
            msg: {
                results: r,
                binarys: bs
            },
        }
    }
    else {
        return {
            results: r,
            binarys: bs
        }
    }
}


export default obj2stru8arr
