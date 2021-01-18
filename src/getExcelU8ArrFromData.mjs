import XLSX from 'xlsx'
import isestr from './isestr.mjs'
import isearr from './isearr.mjs'
import bs2u8arr from './bs2u8arr.mjs'
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
    let wbout = getXLSX().write(wb, { bookType: 'xlsx', type: 'binary' }) //binary回傳BinaryString(Uint8Array)

    return wbout
}


/**
 * 由陣列數據轉成為Excel(*.xlsx)的Uint8Array數據
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/getExcelU8ArrFromData.test.js Github}
 * @memberOf wsemi
 * @param {Array} data 輸入內容陣列
 * @param {String} [csn='data'] 輸入輸出為Excel時所在分頁(sheet)名稱字串，預設為'data'
 * @example
 *
 * import fs from 'fs'
 *
 * let data = [
 *     ['a', '123', 456],
 *     [null, 'abc123', '', 111.222333],
 * ]
 * let u8a = getExcelU8ArrFromData(data)
 * console.log(u8a)
 * // => Uint8Array(14720) [
 * //     80,  75,   3,   4,  10,   0,   0,   0,   0,   0, 202,  99,
 * //     50,  82, 214, 146, 124,  17,  90,   1,   0,   0,  90,   1,
 * //      0,   0,  17,   0,   0,   0, 100, 111,  99,  80, 114, 111,
 * //    112, 115,  47,  99, 111, 114, 101,  46, 120, 109, 108,  60,
 * //     63, 120, 109, 108,  32, 118, 101, 114, 115, 105, 111, 110,
 * //     61,  34,  49,  46,  48,  34,  32, 101, 110,  99, 111, 100,
 * //    105, 110, 103,  61,  34,  85,  84,  70,  45,  56,  34,  32,
 * //    115, 116,  97, 110, 100,  97, 108, 111, 110, 101,  61,  34,
 * //    121, 101, 115,  34,
 * //    ... 14620 more items
 * //  ]
 * fs.writeFileSync('temp.xlsx', u8a)
 *
 */
function getExcelU8ArrFromData(data, csn = 'data') {

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

    let u8a = null
    try {

        //wb
        let wb = getWB(csn, data)

        //BinaryString(Uint8Array) to Uint8Array
        u8a = bs2u8arr(wb)

    }
    catch (e) {
        return {
            error: u8a
        }
    }

    return u8a
}


export default getExcelU8ArrFromData
