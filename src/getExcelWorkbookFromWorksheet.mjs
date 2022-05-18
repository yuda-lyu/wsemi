import isobj from './isobj.mjs'
import isestr from './isestr.mjs'
import createExcelWorkbook from './createExcelWorkbook.mjs'


/**
 * 由Excel的Worksheet物件轉為Excel的Workbook物件
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/getExcelWorkbookFromWorksheet.test.mjs Github}
 * @memberOf wsemi
 * @param {Object} sheet 輸入Excel的Worksheet物件
 * @param {String} [sheetName='data'] 輸入輸出為Excel時所在分頁(sheet)名稱字串，預設為'data'
 * @returns {Object} 回傳Excel的Workbook物件
 * @example
 *
 * let data = [
 *     ['a', '123', 456],
 *     [null, 'abc123', '', 111.222333],
 * ]
 *
 * let ws = xlsx.utils.aoa_to_sheet(data)
 * console.log(ws)
 * // => {
 * //   A1: { v: 'a', t: 's' },
 * //   B1: { v: '123', t: 's' },
 * //   C1: { v: 456, t: 'n' },
 * //   B2: { v: 'abc123', t: 's' },
 * //   C2: { v: '', t: 's' },
 * //   D2: { v: 111.222333, t: 'n' },
 * //   '!ref': 'A1:D2'
 * // }
 *
 * let wb = getExcelWorkbookFromWorksheet(ws)
 * console.log(JSON.stringify(wb, null, 2))
 * // => {
 * //   "SheetNames": [
 * //     "data"
 * //   ],
 * //   "Sheets": {
 * //     "data": {
 * //       "A1": {
 * //         "v": "a",
 * //         "t": "s"
 * //       },
 * //       "B1": {
 * //         "v": "123",
 * //         "t": "s"
 * //       },
 * //       "C1": {
 * //         "v": 456,
 * //         "t": "n"
 * //       },
 * //       "B2": {
 * //         "v": "abc123",
 * //         "t": "s"
 * //       },
 * //       "C2": {
 * //         "v": "",
 * //         "t": "s"
 * //       },
 * //       "D2": {
 * //         "v": 111.222333,
 * //         "t": "n"
 * //       },
 * //       "!ref": "A1:D2"
 * //     }
 * //   }
 * // }
 *
 */
function getExcelWorkbookFromWorksheet(sheet, sheetName = 'data') {

    //check
    if (!isobj(sheet)) {
        return {
            error: 'sheet is not an object',
        }
    }
    if (!isestr(sheetName)) {
        sheetName = 'data'
    }

    //createExcelWorkbook
    let wb = createExcelWorkbook()

    //push
    wb.SheetNames.push(sheetName)
    wb.Sheets[sheetName] = sheet

    return wb
}


export default getExcelWorkbookFromWorksheet
