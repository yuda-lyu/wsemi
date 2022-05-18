import isestr from './isestr.mjs'
import isarr from './isarr.mjs'
import isEle from './isEle.mjs'
import haskey from './haskey.mjs'
import getExcelWorksheetFromData from './getExcelWorksheetFromData.mjs'
import getExcelWorkbookFromWorksheet from './getExcelWorkbookFromWorksheet.mjs'


/**
 * 由數據陣列或DOM的table元素轉成為Excel的Workbook物件
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/getExcelWorkbookFromData.test.mjs Github}
 * @memberOf wsemi
 * @param {Array|Element} data 輸入數據陣列或是DOM的table元素(Element)
 * @param {String} [sheetName='data'] 輸入輸出為Excel時所在分頁(sheet)名稱字串，預設為'data'
 * @returns {Object} 回傳Excel的Workbook物件
 * @example
 *
 * import xlsx from 'xlsx'
 *
 * let data = [
 *     ['a', '123', 456],
 *     [null, 'abc123', '', 111.222333],
 * ]
 *
 * let wb1 = getExcelWorkbookFromData(data)
 * console.log(wb1)
 * // => Workbook {
 * //      SheetNames: [ 'data' ],
 * //      Sheets: {
 * //        data: {
 * //          A1: [Object],
 * //          B1: [Object],
 * //          C1: [Object],
 * //          B2: [Object],
 * //          C2: [Object],
 * //          D2: [Object],
 * //          '!ref': 'A1:D2'
 * //        }
 * //      }
 * //    }
 * xlsx.writeFile(wb1, 'temp1.xlsx')
 *
 * let wb2 = getExcelWorkbookFromData(data, 'tester')
 * console.log(wb2)
 * // => Workbook {
 * //      SheetNames: [ 'tester' ],
 * //      Sheets: {
 * //        data: {
 * //          A1: [Object],
 * //          B1: [Object],
 * //          C1: [Object],
 * //          B2: [Object],
 * //          C2: [Object],
 * //          D2: [Object],
 * //          '!ref': 'A1:D2'
 * //        }
 * //      }
 * //    }
 * xlsx.writeFile(wb2, 'temp2.xlsx')
 *
 */
function getExcelWorkbookFromData(data, sheetName = 'data') {

    //check
    if (!isarr(data) && !isEle(data)) {
        return {
            error: 'data is not an array or element',
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
