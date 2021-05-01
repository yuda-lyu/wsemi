import XLSX from 'xlsx'
import get from 'lodash/get'
import isestr from './isestr.mjs'
import isearr from './isearr.mjs'
import downloadFileFromBlob from './downloadFileFromBlob.mjs'
import getExcelWorkbookFromData from './getExcelWorkbookFromData.mjs'
import getGlobal from './getGlobal.mjs'
import isWindow from './isWindow.mjs'


function getXLSX() {
    let g = getGlobal()
    let x = XLSX || g.XLSX || g.xlsx
    return x
}


/**
 * 下載資料成為Excel(*.xlsx)檔案，前後端都可用
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/downloadExcelFileFromData.test.js Github}
 * @memberOf wsemi
 * @param {String} cfn 輸入檔名字串
 * @param {String} [csn='data'] 輸入分頁(sheet)名稱字串，預設為'data'
 * @param {Array} data 輸入內容陣列
 * @example
 *
 * let data = [
 *     ['a','b','c'],
 *     [1,23.45,'xyz']
 * ]
 * downloadExcelFileFromData('data.xlsx', 'data', data)
 *
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

    //getExcelWorkbookFromData
    let wb = getExcelWorkbookFromData(data, csn)

    //check
    if (get(wb, 'error')) {
        console.log(wb.error)
        return wb.error
    }

    //check
    if (isWindow()) {

        //wbout
        let wbout = getXLSX().write(wb, { bookType: 'xlsx', bookSST: false, type: 'array' })

        //downloadFileFromBlob
        downloadFileFromBlob(cfn, new Blob([wbout]))

    }
    else {

        //writeFile
        getXLSX().writeFile(wb, cfn)

    }

    return 'ok'
}


export default downloadExcelFileFromData
