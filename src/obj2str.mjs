import cv from './_jsonType.mjs'
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
 * @returns {String} 回傳轉換後字串，data為undefined或無法轉為JSON時回傳空字串
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
 * // => '{"a":"abc","b":12.3,"u8a":"[Uint8Array]::QmFz","u16a":"[Uint16Array]::C08G"}'
 *
 */
function obj2str(data, ext = 'Uint8Array') {

    //check
    if (isundefined(data)) {
        return ''
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
        if (ext.indexOf('Uint8Array') >= 0) {
            v = cv.u8arr2b64(v)
        }
        if (ext.indexOf('Uint16Array') >= 0) {
            v = cv.u16arr2b64(v)
        }
        return v
    }

    let s = ''
    try {
        s = JSON.stringify(data, replacer)
    }
    catch (err) {
        s = ''
    }


    return s
}


export default obj2str
