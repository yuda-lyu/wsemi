import cv from './_jsonType.mjs'
import isstr from './isstr.mjs'
import isarr from './isarr.mjs'


/**
 * 字串轉任意資料，可支援內含Uint8Array與Uint16Array數據
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/str2obj.test.mjs Github}
 * @memberOf wsemi
 * @param {*} data 輸入任意資料
 * @param {String|Array} [ext='Uint8Array'] 輸入擴充數據種類字串或陣列，非字串亦非陣列時回退為'Uint8Array'，預設'Uint8Array'
 * @returns {Object} 回傳轉換後資料，data無法解析為JSON時回傳空物件
 * @example
 *
 * console.log(str2obj('{"a":"abc","b":12.3,"u8a":"[Uint8Array]::QmFz","u16a":{"0":11,"1":79,"2":6}}'))
 * // => {
 * // =>   a: 'abc',
 * // =>   b: 12.3,
 * // =>   u8a: Uint8Array [ 66, 97, 115 ],
 * // =>   u16a: { '0': 11, '1': 79, '2': 6 }
 * // => }
 *
 * console.log(str2obj('{"a":"abc","b":12.3,"u8a":"[Uint8Array]::QmFz","u16a":"[Uint8Array]::C08G"}', ['Uint8Array', 'Uint16Array']}))
 * // => {
 * // =>   a: 'abc',
 * // =>   b: 12.3,
 * // =>   u8a: Uint8Array [ 66, 97, 115 ],
 * // =>   u16a: Uint8Array [ 11, 79, 6 ]
 * // => }
 *
 */
function str2obj(data, ext = 'Uint8Array') {

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
            v = cv.b642u8arr(v)
        }
        if (ext.indexOf('Uint16Array') >= 0) {
            v = cv.b642u16arr(v)
        }
        return v
    }

    let s = {}
    try {
        s = JSON.parse(data, replacer)
    }
    catch (err) {
        s = {}
    }

    return s
}


export default str2obj
