import XLSX from 'xlsx'
import isestr from './isestr.mjs'
import isarr from './isarr.mjs'
import isEle from './isEle.mjs'
import getGlobal from './getGlobal.mjs'
import getExcelWorkbookFromWorksheet from './getExcelWorkbookFromWorksheet.mjs'


function getXLSX() {
    let g = getGlobal()
    let x = XLSX || g.XLSX || g.xlsx
    return x
}


/**
 * 由陣列數據轉成為Excel(*.xlsx)的Workbook數據
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/getExcelWorkbookFromData.test.mjs Github}
 * @memberOf wsemi
 * @param {Array|Element} data 輸入內容陣列或是DOM的table元素(Element)
 * @param {String} [sheetName='data'] 輸入輸出為Excel時所在分頁(sheet)名稱字串，預設為'data'
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
function getExcelWorkbookFromData(data, sheetName = 'data', opt = {}) {

    //check
    if (!isarr(data) && !isEle(data)) {
        return {
            error: 'data is not array or element',
        }
    }
    if (!isestr(sheetName)) {
        sheetName = 'data'
    }

    let wb = null
    try {

        //xlutls
        let xl = getXLSX()
        let xlutls = xl.utils

        //ws
        let ws = null
        if (isarr(data)) {

            //ws
            ws = xlutls.aoa_to_sheet(data)

        }
        else if (isEle(data)) {

            //ws
            ws = xlutls.table_to_sheet(data, {
                raw: true,
                // cellDates: true,
                // dateNF: 0,
            })

        }

        //getExcelWorkbookFromWorksheet
        wb = getExcelWorkbookFromWorksheet(ws, sheetName)

    }
    catch (err) {
        return {
            error: err
        }
    }

    return wb
}


export default getExcelWorkbookFromData
