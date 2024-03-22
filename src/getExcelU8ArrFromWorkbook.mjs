import get from 'lodash-es/get.js'
import isobj from './isobj.mjs'
import iseobj from './iseobj.mjs'
import isarr from './isarr.mjs'
import bs2u8arr from './bs2u8arr.mjs'
import getXLSX from './_getXLSX.mjs'


/**
 * 由Excel的Workbook物件轉成為Excel的Uint8Array數據陣列
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/getExcelU8ArrFromWorkbook.test.mjs Github}
 * @memberOf wsemi
 * @param {Object} wb 輸入Excel的Workbook物件
 * @returns {Array} 回傳Excel的Uint8Array數據陣列
 * @example
 *
 * let data = [
 *     ['a', '123', 456],
 *     [null, 'abc123', '', 111.222333],
 * ]
 *
 * let wb = getExcelWorkbookFromData(data)
 * let u8a = getExcelU8ArrFromWorkbook(wb)
 * console.log(u8a)
 * // => Uint8Array(15997) [
 * //    80,  75,   3,   4,  20,   0,   0,   0,   0,   0,   0,   0,
 * //    0,   0, 164,   1, 132, 184, 181,   2,   0,   0, 181,   2,
 * //    0,   0,  26,   0,   0,   0, 120, 108,  47,  95, 114, 101,
 * //  108, 115,  47, 119, 111, 114, 107,  98, 111, 111, 107,  46,
 * //  120, 109, 108,  46, 114, 101, 108, 115,  60,  63, 120, 109,
 * //  108,  32, 118, 101, 114, 115, 105, 111, 110,  61,  34,  49,
 * //   46,  48,  34,  32, 101, 110,  99, 111, 100, 105, 110, 103,
 * //   61,  34,  85,  84,  70,  45,  56,  34,  32, 115, 116,  97,
 * //  110, 100,  97, 108,
 * //  ... 15897 more items
 * // ]
 *
 */
function getExcelU8ArrFromWorkbook(wb) {

    //check
    if (!iseobj(wb)) {
        return {
            error: 'wb is not an effective object',
        }
    }
    if (!isarr(get(wb, 'SheetNames'))) {
        return {
            error: 'wb.SheetNames is not an array',
        }
    }
    if (!isobj(get(wb, 'Sheets'))) {
        return {
            error: 'wb.Sheets is not an object',
        }
    }

    //u8a
    let u8a = null
    try {

        //bswb, type給binary代表回傳BinaryString(Uint8Array)
        let bswb = getXLSX().write(wb, { bookType: 'xlsx', type: 'binary' })

        //BinaryString(Uint8Array) to Uint8Array
        u8a = bs2u8arr(bswb)

    }
    catch (err) {
        return {
            error: err
        }
    }

    return u8a
}


export default getExcelU8ArrFromWorkbook
