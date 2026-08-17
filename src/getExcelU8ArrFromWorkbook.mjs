import { writeXlsx } from 'hucre/xlsx'
import get from 'lodash-es/get.js'
import isarr from './isarr.mjs'
import iseobj from './iseobj.mjs'


/**
 * 由Excel的Workbook物件轉成為Excel檔案的Uint8Array數據
 *
 * Workbook物件格式為{ sheets: [{ name, rows }] }(見createExcelWorkbook/getExcelWorkbookFromData)
 * 本函數為async function，前後端都可用
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/getExcelU8ArrFromWorkbook.test.mjs Github}
 * @memberOf wsemi
 * @param {Object} wb 輸入Excel的Workbook物件
 * @returns {Promise} 回傳Promise，resolve回傳Excel檔案的Uint8Array數據，wb無效或轉換失敗時resolve回傳{ error }物件
 * @example
 * //need test in nodejs
 *
 * async function test() {
 *
 *     let data = [
 *         ['a', '123', 456],
 *         [null, 'abc123', '', 111.222333],
 *     ]
 *
 *     let wb = getExcelWorkbookFromData(data)
 *     let u8a = await getExcelU8ArrFromWorkbook(wb)
 *     console.log(u8a instanceof Uint8Array, u8a[0], u8a[1])
 *     // => true 80 75 (xlsx為zip容器, 開頭必為'PK')
 *
 * }
 * test()
 *     .catch((err) => {
 *         console.log(err)
 *     })
 *
 */
async function getExcelU8ArrFromWorkbook(wb) {

    //check
    if (!iseobj(wb)) {
        return {
            error: 'wb is not an effective object',
        }
    }
    if (!isarr(get(wb, 'sheets'))) {
        return {
            error: 'wb.sheets is not an array',
        }
    }

    //u8a
    let u8a = null
    try {

        //writeXlsx, wb即為{ sheets }結構可直接傳入, 回傳Uint8Array
        u8a = await writeXlsx(wb)

    }
    catch (err) {
        return {
            error: err
        }
    }

    return u8a
}


export default getExcelU8ArrFromWorkbook
