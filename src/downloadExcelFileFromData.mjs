import XLSX from 'XLSX'
import isestr from './isestr.mjs'
import isearr from './isearr.mjs'
import bs2u8arr from './bs2u8arr.mjs'
import downloadFileFromU8Arr from './downloadFileFromU8Arr.mjs'


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
            let cell_ref = XLSX.utils.encode_cell({ c: C, r: R })

            if (typeof cell.v === 'number') cell.t = 'n'
            else if (typeof cell.v === 'boolean') cell.t = 'b'
            else if (cell.v instanceof Date) {
                cell.t = 'n'; cell.z = XLSX.SSF._table[14]
                cell.v = datenum(cell.v)
            }
            else cell.t = 's'

            ws[cell_ref] = cell
        }
    }
    if (range.s.c < 10000000) ws['!ref'] = XLSX.utils.encode_range(range)
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
    let wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'binary' }) //binary, buffer, 但實際使用buffer無用, 一樣是回傳ArrayBuffer

    return wbout
}


/**
 * 前端下載text資料成為utf-8(含BOM)檔案
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/downloadExcelFileFromData.test.js Github}
 * @memberOf wsemi
 * @param {String} cfn 輸入檔名字串
 * @param {String} [csn='data'] 輸入分頁(sheet)名稱字串，預設為'data'
 * @param {Array} data 輸入內容陣列
 * @example
 *
 */
function downloadExcelFileFromData(cfn, csn = 'data', data) {

    //check
    if (!isestr(cfn)) {
        console.warn('no filename')
        return
    }
    if (!isestr(csn)) {
        csn = 'data'
    }
    if (!isearr(data)) {
        console.warn('no data')
        return
    }

    //wb
    let wb = getWB(csn, data)

    //ArrayBuffer to BinaryString(Uint8Array)
    let u8a = bs2u8arr(wb)

    //downloadFileFromU8Arr
    downloadFileFromU8Arr(cfn, u8a)

}


export default downloadExcelFileFromData
