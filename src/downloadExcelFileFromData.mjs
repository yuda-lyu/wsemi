import XLSX from 'xlsx'
import get from 'lodash/get'
import isestr from './isestr.mjs'
import isarr from './isarr.mjs'
import iseobj from './iseobj.mjs'
import isEle from './isEle.mjs'
import downloadFileFromBlob from './downloadFileFromBlob.mjs'
import getExcelWorkbookFromData from './getExcelWorkbookFromData.mjs'
import ltdtkeysheads2mat from './ltdtkeysheads2mat.mjs'
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
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/downloadExcelFileFromData.test.mjs Github}
 * @memberOf wsemi
 * @param {String} fileName 輸入檔名字串
 * @param {String} [sheetName='data'] 輸入分頁(sheet)名稱字串，預設為'data'
 * @param {Array|Element} data 輸入內容陣列或是DOM的table元素(Element)，內容陣列可為二維陣列(mat)或由物件組成的一維陣列(ltdt)
 * @example
 *
 * let data
 *
 * data = [
 *     ['a', 'b', 'c'],
 *     [1, 23.45, 'xyz']
 * ]
 * downloadExcelFileFromData('data(mat).xlsx', 'data', data)
 *
 * data = [
 *     { x: 'a', y: 'b', z: 'c' },
 *     { x: 1, y: 23.45, zzz: 'xyz' },
 * ]
 * downloadExcelFileFromData('data(ltdt).xlsx', 'data', data)
 *
 */
function downloadExcelFileFromData(fileName, sheetName = 'data', data, opt = {}) {

    //check
    if (!isestr(fileName)) {
        let msg = 'no filename'
        console.log(msg, fileName)
        return {
            error: msg
        }
    }
    if (!isestr(sheetName)) {
        sheetName = 'data'
    }
    if (!isarr(data) && !isEle(data)) {
        let msg = 'data is not array or element'
        console.log(msg, data)
        return {
            error: msg,
        }
    }

    //check ltdt
    //ltdtkeysheads2mat
    if (isarr(data) && iseobj(get(data, 0, null))) {

        //ltdtkeysheads2mat
        data = ltdtkeysheads2mat(data)

    }

    //getExcelWorkbookFromData
    let wb = getExcelWorkbookFromData(data, sheetName)

    //check
    if (get(wb, 'error')) {
        console.log(wb.error)
        return wb.error
    }

    //xlutls
    let xl = getXLSX()

    //check
    if (isWindow()) {

        //wbout
        let wbout = xl.write(wb, { bookType: 'xlsx', bookSST: false, type: 'array' })

        //downloadFileFromBlob
        downloadFileFromBlob(fileName, new Blob([wbout]))

    }
    else {

        //writeFile
        xl.writeFile(wb, fileName)

    }

    return 'ok'
}


export default downloadExcelFileFromData
