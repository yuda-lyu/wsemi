import XLSX from 'xlsx'
import isestr from './isestr.mjs'
import isearr from './isearr.mjs'
import getGlobal from './getGlobal.mjs'


function getXLSX() {
    let g = getGlobal()
    let x = XLSX || g.XLSX || g.xlsx
    return x
}


function datenum(v, date1904) {
    if (date1904) v += 1462
    let epoch = Date.parse(v)
    return (epoch - new Date(Date.UTC(1899, 11, 30))) / (24 * 60 * 60 * 1000)
}


function sheet_from_array_of_arrays(data, opts) {
    let ws = {}
    let range = { s: { c: 10000000, r: 10000000 }, e: { c: 0, r: 0 } }
    for (let R = 0; R !== data.length; ++R) {
        for (let C = 0; C !== data[R].length; ++C) {
            if (range.s.r > R) range.s.r = R
            if (range.s.c > C) range.s.c = C
            if (range.e.r < R) range.e.r = R
            if (range.e.c < C) range.e.c = C
            let cell = { v: data[R][C] }
            if (cell.v === null) continue
            let cell_ref = getXLSX().utils.encode_cell({ c: C, r: R })

            if (typeof cell.v === 'number') cell.t = 'n'
            else if (typeof cell.v === 'boolean') cell.t = 'b'
            else if (cell.v instanceof Date) {
                cell.t = 'n'; cell.z = getXLSX().SSF._table[14]
                cell.v = datenum(cell.v)
            }
            else cell.t = 's'

            ws[cell_ref] = cell
        }
    }
    if (range.s.c < 10000000) ws['!ref'] = getXLSX().utils.encode_range(range)
    return ws
}


function getWB(csn, data) {

    //Workbook
    function Workbook() {
        if (!(this instanceof Workbook)) return new Workbook()
        this.SheetNames = []
        this.Sheets = {}
    }

    //wbout
    let wb = new Workbook()
    let ws = sheet_from_array_of_arrays(data)
    wb.SheetNames.push(csn)
    wb.Sheets[csn] = ws

    return wb
}


/**
 * 由陣列數據轉成為Excel(*.xlsx)的Workbook數據
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/getExcelWorkbookFromData.test.js Github}
 * @memberOf wsemi
 * @param {Array} data 輸入內容陣列
 * @param {String} [csn='data'] 輸入輸出為Excel時所在分頁(sheet)名稱字串，預設為'data'
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
function getExcelWorkbookFromData(data, csn = 'data') {

    //check
    if (!isearr(data)) {
        let msg = 'no data'
        return {
            error: msg
        }
    }
    if (!isestr(csn)) {
        csn = 'data'
    }

    let wb = null
    try {

        //wb
        wb = getWB(csn, data)

    }
    catch (err) {
        return {
            error: err
        }
    }

    return wb
}


export default getExcelWorkbookFromData
