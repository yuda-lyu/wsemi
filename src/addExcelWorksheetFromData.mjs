import get from 'lodash-es/get.js'
import isarr from './isarr.mjs'
import iseobj from './iseobj.mjs'
import isestr from './isestr.mjs'
import haskey from './haskey.mjs'
import getExcelWorksheetFromData from './getExcelWorksheetFromData.mjs'


/**
 * 由數據陣列轉成為Excel的Worksheet物件並添加至Workbook物件
 *
 * Workbook物件格式為{ sheets: [{ name, rows }] }(見createExcelWorkbook)，數據陣列可為二維陣列(mat)或物件陣列(ltdt)，見getExcelWorksheetFromData
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/addExcelWorksheetFromData.test.mjs Github}
 * @memberOf wsemi
 * @param {Object} wb 輸入Excel的Workbook物件
 * @param {Array} data 輸入數據陣列，可為二維陣列(mat)或物件陣列(ltdt)
 * @param {String} [sheetName='data'] 輸入輸出為Excel時所在分頁(sheet)名稱字串，預設為'data'
 * @returns {Object} 回傳添加分頁後的Workbook物件，輸入無效時回傳{ error }物件
 * @example
 *
 * let data = [
 *     ['a', '123', 456],
 *     [null, 'abc123', '', 111.222333],
 * ]
 *
 * let wb = createExcelWorkbook()
 * console.log(wb)
 * // => { sheets: [] }
 *
 * wb = addExcelWorksheetFromData(wb, data, 'tester')
 * console.log(JSON.stringify(wb))
 * // => {"sheets":[{"rows":[["a","123",456],[null,"abc123","",111.222333]],"name":"tester"}]}
 *
 */
function addExcelWorksheetFromData(wb, data, sheetName = 'data') {

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
    if (!isestr(sheetName)) {
        sheetName = 'data'
    }

    //getExcelWorksheetFromData
    let ws = getExcelWorksheetFromData(data)

    //check
    if (haskey(ws, 'error')) {
        return ws
    }

    //push, 展開ws後以sheetName覆蓋名稱
    wb.sheets.push({ ...ws, name: sheetName })

    return wb
}


export default addExcelWorksheetFromData
