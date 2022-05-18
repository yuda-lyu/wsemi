import isestr from './isestr.mjs'
import isearr from './isearr.mjs'
import haskey from './haskey.mjs'
import getExcelWorkbookFromData from './getExcelWorkbookFromData.mjs'
import getExcelU8ArrFromWorkbook from './getExcelU8ArrFromWorkbook.mjs'


/**
 * 由數據陣列或DOM的table元素轉成為Excel的Uint8Array數據陣列
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/getExcelU8ArrFromData.test.mjs Github}
 * @memberOf wsemi
 * @param {Array|Element} data 輸入數據陣列或是DOM的table元素(Element)
 * @param {String} [sheetName='data'] 輸入輸出為Excel時所在分頁(sheet)名稱字串，預設為'data'
 * @returns {Array} 回傳Excel的Uint8Array數據陣列
 * @example
 *
 * import fs from 'fs'
 *
 * let data = [
 *     ['a', '123', 456],
 *     [null, 'abc123', '', 111.222333],
 * ]
 * let u8a = getExcelU8ArrFromData(data)
 * console.log(u8a)
 * // => Uint8Array(14720) [
 * //     80,  75,   3,   4,  10,   0,   0,   0,   0,   0, 202,  99,
 * //     50,  82, 214, 146, 124,  17,  90,   1,   0,   0,  90,   1,
 * //      0,   0,  17,   0,   0,   0, 100, 111,  99,  80, 114, 111,
 * //    112, 115,  47,  99, 111, 114, 101,  46, 120, 109, 108,  60,
 * //     63, 120, 109, 108,  32, 118, 101, 114, 115, 105, 111, 110,
 * //     61,  34,  49,  46,  48,  34,  32, 101, 110,  99, 111, 100,
 * //    105, 110, 103,  61,  34,  85,  84,  70,  45,  56,  34,  32,
 * //    115, 116,  97, 110, 100,  97, 108, 111, 110, 101,  61,  34,
 * //    121, 101, 115,  34,
 * //    ... 14620 more items
 * //  ]
 * fs.writeFileSync('temp.xlsx', u8a)
 *
 */
function getExcelU8ArrFromData(data, sheetName = 'data') {

    //check
    if (!isearr(data)) {
        let msg = 'no data'
        return {
            error: msg
        }
    }
    if (!isestr(sheetName)) {
        sheetName = 'data'
    }

    //u8a
    let u8a = null

    //getExcelWorkbookFromData
    let wb = getExcelWorkbookFromData(data, sheetName)

    //check
    if (haskey(wb, 'error')) {
        return wb
    }

    //getExcelU8ArrFromWorkbook
    u8a = getExcelU8ArrFromWorkbook(wb)

    //check
    if (haskey(u8a, 'error')) {
        return u8a
    }

    return u8a
}


export default getExcelU8ArrFromData
