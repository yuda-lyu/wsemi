

/**
 * 由Worksheet數據轉Workbook數據
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/getExcelWorkbookFromWorksheet.test.mjs Github}
 * @memberOf wsemi
 * @param {Object} sheet 輸入js-xlsx的worksheet物件
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
 * let ws = xlsx.utils.aoa_to_sheet(data)
 * console.log('ws', ws)
 * // ws {
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
 * console.log('wb', wb)
 * // wb Workbook {
 * //   SheetNames: [ 'data' ],
 * //   Sheets: {
 * //     data: {
 * //       A1: [Object],
 * //       B1: [Object],
 * //       C1: [Object],
 * //       B2: [Object],
 * //       C2: [Object],
 * //       D2: [Object],
 * //       '!ref': 'A1:D2'
 * //     }
 * //   }
 * // }
 *
 */
function getExcelWorkbookFromWorksheet(sheet, sheetName = 'data') {

    //Workbook
    function Workbook() {
        if (!(this instanceof Workbook)) return new Workbook()
        this.SheetNames = []
        this.Sheets = {}
    }

    //wbout
    let wb = new Workbook()
    wb.SheetNames.push(sheetName)
    wb.Sheets[sheetName] = sheet

    return wb
}


export default getExcelWorkbookFromWorksheet
