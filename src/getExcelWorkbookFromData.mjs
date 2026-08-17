import isestr from './isestr.mjs'
import isarr from './isarr.mjs'
import haskey from './haskey.mjs'
import getExcelWorksheetFromData from './getExcelWorksheetFromData.mjs'
import getExcelWorkbookFromWorksheet from './getExcelWorkbookFromWorksheet.mjs'


/**
 * 由數據陣列轉成為Excel的Workbook物件
 *
 * Workbook物件格式為{ sheets: [{ name, rows }] }，數據陣列可為二維陣列(mat)或物件陣列(ltdt)，見getExcelWorksheetFromData
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/getExcelWorkbookFromData.test.mjs Github}
 * @memberOf wsemi
 * @param {Array} data 輸入數據陣列，可為二維陣列(mat)或物件陣列(ltdt)
 * @param {String} [sheetName='data'] 輸入輸出為Excel時所在分頁(sheet)名稱字串，預設為'data'
 * @returns {Object} 回傳Excel的Workbook物件，data非陣列時回傳{ error }物件
 * @example
 *
 * let data = [
 *     ['a', '123', 456],
 *     [null, 'abc123', '', 111.222333],
 * ]
 *
 * let wb1 = getExcelWorkbookFromData(data)
 * console.log(wb1.sheets[0].name)
 * // => data
 *
 * let wb2 = getExcelWorkbookFromData(data, 'tester')
 * console.log(wb2.sheets[0].name)
 * // => tester
 *
 */
function getExcelWorkbookFromData(data, sheetName = 'data') {

    //check
    if (!isarr(data)) {
        return {
            error: 'data is not an array',
        }
    }
    if (!isestr(sheetName)) {
        sheetName = 'data'
    }

    //wb
    let wb = null

    //getExcelWorksheetFromData
    let ws = getExcelWorksheetFromData(data)

    //check
    if (haskey(ws, 'error')) {
        return ws
    }

    //getExcelWorkbookFromWorksheet
    wb = getExcelWorkbookFromWorksheet(ws, sheetName)

    //check
    if (haskey(wb, 'error')) {
        return wb
    }

    return wb
}


export default getExcelWorkbookFromData
