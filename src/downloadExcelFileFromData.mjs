import XLSX from 'xlsx'
import getGlobal from './getGlobal.mjs'
import isestr from './isestr.mjs'
import isearr from './isearr.mjs'
import bs2u8arr from './bs2u8arr.mjs'
import downloadFileFromU8Arr from './downloadFileFromU8Arr.mjs'


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
    let wbout = getXLSX().write(wb, { bookType: 'xlsx', type: 'binary' }) //binary, buffer, 但實際使用buffer無用, 一樣是回傳ArrayBuffer

    return wbout
}


/**
 * 前端下載資料成為Excel(*.xlsx)檔案
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/downloadExcelFileFromData.test.js Github}
 * @memberOf wsemi
 * @param {String} cfn 輸入檔名字串
 * @param {String} [csn='data'] 輸入分頁(sheet)名稱字串，預設為'data'
 * @param {Array} data 輸入內容陣列
 * @example
 * need test in browser
 */
function downloadExcelFileFromData(cfn, csn = 'data', data) {

    //check
    if (!isestr(cfn)) {
        let msg = 'no filename'
        console.log(msg)
        return {
            error: msg
        }
    }
    if (!isestr(csn)) {
        csn = 'data'
    }
    if (!isearr(data)) {
        let msg = 'no data'
        console.log(msg)
        return {
            error: msg
        }
    }

    try {

        //wb
        let wb = getWB(csn, data)

        //BinaryString(Uint8Array) to Uint8Array
        let u8a = bs2u8arr(wb)

        //downloadFileFromU8Arr
        downloadFileFromU8Arr(cfn, u8a)

    }
    catch (e) {
        console.log('error: ', e)
        return {
            error: 'can not download Excel file from data'
        }
    }

    return 'ok'
}


export default downloadExcelFileFromData
