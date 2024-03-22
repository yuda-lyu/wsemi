import get from 'lodash-es/get.js'
import isobj from './isobj.mjs'
import iseobj from './iseobj.mjs'
import isarr from './isarr.mjs'
import haskey from './haskey.mjs'
import getExcelWorksheetFromData from './getExcelWorksheetFromData.mjs'


/**
 * 由數據陣列或DOM的table元素轉成Excel的Worksheet物件，並加入至Excel的Workbook物件
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/addExcelWorksheetFromData.test.mjs Github}
 * @memberOf wsemi
 * @param {Object} wb 輸入Excel的Workbook物件
 * @param {Array|Element} data 輸入數據陣列或是DOM的table元素(Element)
 * @param {String} [sheetName='data'] 輸入輸出為Excel時所在分頁(sheet)名稱字串，預設為'data'
 * @returns {Object} 回傳Excel的Workbook物件
 * @example
 *
 * let data = [
 *     ['a', '123', 456],
 *     [null, 'abc123', '', 111.222333],
 * ]
 *
 * let wb = createExcelWorkbook()
 * console.log(wb)
 * // => Workbook { SheetNames: [], Sheets: {} }
 *
 * wb = addExcelWorksheetFromData(wb, data, 'tester')
 * console.log(JSON.stringify(wb, null, 2))
 * // => {
 * //   "SheetNames": [
 * //     "tester"
 * //   ],
 * //   "Sheets": {
 * //     "tester": {
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
function addExcelWorksheetFromData(wb, data, sheetName = 'data') {

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

    //getExcelWorksheetFromData
    let ws = getExcelWorksheetFromData(data)

    //check
    if (haskey(ws, 'error')) {
        return ws
    }

    //push
    wb.SheetNames.push(sheetName)
    wb.Sheets[sheetName] = ws

    return wb
}


export default addExcelWorksheetFromData
