import isarr from './isarr.mjs'
import isobj from './isobj.mjs'
import isestr from './isestr.mjs'
import get from 'lodash-es/get.js'
import createExcelWorkbook from './createExcelWorkbook.mjs'


/**
 * 由Excel的Worksheet物件轉為Excel的Workbook物件
 *
 * Worksheet物件格式為{ rows }(見getExcelWorksheetFromData)，Workbook物件格式為{ sheets: [{ name, rows }] }
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/getExcelWorkbookFromWorksheet.test.mjs Github}
 * @memberOf wsemi
 * @param {Object} sheet 輸入Excel的Worksheet物件，須含rows二維值陣列
 * @param {String} [sheetName='data'] 輸入輸出為Excel時所在分頁(sheet)名稱字串，預設為'data'
 * @returns {Object} 回傳Excel的Workbook物件，sheet無效時回傳{ error }物件
 * @example
 *
 * let data = [
 *     ['a', '123', 456],
 *     [null, 'abc123', '', 111.222333],
 * ]
 *
 * let ws = getExcelWorksheetFromData(data)
 *
 * let wb1 = getExcelWorkbookFromWorksheet(ws)
 * console.log(wb1.sheets[0].name)
 * // => data
 *
 * let wb2 = getExcelWorkbookFromWorksheet(ws, 'tester')
 * console.log(wb2.sheets[0].name)
 * // => tester
 *
 */
function getExcelWorkbookFromWorksheet(sheet, sheetName = 'data') {

    //check
    if (!isobj(sheet)) {
        return {
            error: 'sheet is not an object',
        }
    }
    if (!isarr(get(sheet, 'rows'))) {
        return {
            error: 'sheet.rows is not an array',
        }
    }
    if (!isestr(sheetName)) {
        sheetName = 'data'
    }

    //createExcelWorkbook
    let wb = createExcelWorkbook()

    //push, 展開sheet後以sheetName覆蓋名稱
    wb.sheets.push({ ...sheet, name: sheetName })

    return wb
}


export default getExcelWorkbookFromWorksheet
