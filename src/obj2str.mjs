import get from 'lodash-es/get.js'
import cv from './_jsonType.mjs'
import isbol from './isbol.mjs'
import isundefined from './isundefined.mjs'
import isstr from './isstr.mjs'
import isarr from './isarr.mjs'


/**
 * 任意資料轉字串，可支援內含Uint8Array與Uint16Array數據
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/obj2str.test.mjs Github}
 * @memberOf wsemi
 * @param {*} data 輸入任意資料，為undefined時回傳空字串
 * @param {String|Array} [ext='Uint8Array'] 輸入擴充數據種類字串或陣列，非字串亦非陣列時回退為'Uint8Array'，預設'Uint8Array'
 * @param {Object} [opt={}] 輸入設定物件，預設{}
 * @param {Boolean} [opt.returnWithStateAndMsg=false] 輸入是否回傳含狀態與訊息物件布林值，若為true則回傳{ state, msg }物件，state為'success'或'error'，msg於success時為回傳結果、於error時為錯誤訊息字串，預設false
 * @returns {String|Object} 回傳轉換後字串，data為undefined或無法轉為JSON時回傳空字串；若opt.returnWithStateAndMsg為true則回傳{ state, msg }物件
 * @example
 *
 * let o = {
 *     a: 'abc',
 *     b: 12.3,
 *     u8a: new Uint8Array([66, 97, 115]),
 *     u16a: new Uint16Array([11, 79, 6]),
 * }
 * console.log(obj2str(o))
 * // => '{"a":"abc","b":12.3,"u8a":"[Uint8Array]::QmFz","u16a":{"0":11,"1":79,"2":6}}'
 *
 * console.log(obj2str(o, ['Uint8Array', 'Uint16Array']}))
 * // => '{"a":"abc","b":12.3,"u8a":"[Uint8Array]::QmFz","u16a":"[Uint16Array]::CwBPAAYA"}'
 *
 */
function obj2str(data, ext = 'Uint8Array', opt = {}) {

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
            return ''
        }
    }

    //check
    if (isundefined(data)) {
        return retError('invalid data')
    }

    //ext, 無效時回退預設值
    //回退值須為陣列而非字串, 以與isstr分支轉出之型別一致, 否則後續ext.indexOf將由陣列比對變為字串子字串搜尋
    if (isstr(ext)) {
        ext = [ext]
    }
    else if (isarr(ext)) {
        //none
    }
    else {
        ext = ['Uint8Array']
    }

    //replacer
    function replacer(k, v) {

        //escape, 須先於二進位轉換套用, 否則剛產生之標記字串會被再次跳脫; 只對字串生效故二進位不受影響
        v = cv.escape(v)

        if (ext.indexOf('Uint8Array') >= 0) {
            v = cv.u8arr2b64(v)
        }
        if (ext.indexOf('Uint16Array') >= 0) {
            v = cv.u16arr2b64(v)
        }
        return v
    }

    //s, 序列化失敗(如含BigInt、循環參照)原為catch吞掉回'', 與「本就轉出空字串」無從分辨
    let s = ''
    try {
        s = JSON.stringify(data, replacer)
    }
    catch (err) {
        return retError(err.toString())
    }

    if (returnWithStateAndMsg) {
        return {
            state: 'success',
            msg: s,
        }
    }
    else {
        return s
    }
}


export default obj2str
