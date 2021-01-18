import get from 'lodash/get'
import isestr from './isestr.mjs'
import isearr from './isearr.mjs'
import downloadFileFromU8Arr from './downloadFileFromU8Arr.mjs'
import getExcelU8ArrFromData from './getExcelU8ArrFromData.mjs'


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

    //getExcelU8ArrFromData
    let u8a = getExcelU8ArrFromData(data, csn)

    //check
    if (get(u8a, 'error')) {
        console.log(u8a.error)
        return u8a.error
    }

    //downloadFileFromU8Arr
    downloadFileFromU8Arr(cfn, u8a)

    return 'ok'
}


export default downloadExcelFileFromData
