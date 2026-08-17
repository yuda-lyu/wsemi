import get from 'lodash-es/get.js'
import downloadExcelFileFromData from './downloadExcelFileFromData.mjs'


/**
 * 前端下載資料成為Excel檔案
 *
 * 本函數為相容舊版之保留函數：舊版採動態加載CDN之SheetJS(xlsx)，現Excel引擎已改為hucre並直接打包進wsemi，無需再動態加載
 * 內部直接委派downloadExcelFileFromData，pathItems參數保留簽名相容但已不使用
 * 與downloadExcelFileFromData之差異僅在錯誤處理：本函數以reject回傳錯誤訊息，非resolve回傳{ error }物件
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/downloadExcelFileFromDataDyn.test.mjs Github}
 * @memberOf wsemi
 * @param {String} fileName 輸入檔名字串
 * @param {String} [sheetName='data'] 輸入分頁(sheet)名稱字串，預設為'data'
 * @param {Array} data 輸入內容陣列，可為二維陣列(mat)或由物件組成的一維陣列(ltdt)
 * @param {String|Object|Array} [pathItems=undefined] 輸入資源字串、字串陣列、物件、物件陣列，已不使用，僅保留簽名相容
 * @returns {Promise} 回傳Promise，resolve代表成功，reject回傳錯誤訊息
 * @example
 * need test in browser
 *
 * let data
 *
 * data = [
 *     ['a', 'b', 'c'],
 *     [1, 23.45, 'xyz']
 * ]
 * downloadExcelFileFromDataDyn('data(mat).xlsx', 'data', data)
 *
 * data = [
 *     { x: 'a', y: 'b', z: 'c' },
 *     { x: 1, y: 23.45, zzz: 'xyz' },
 * ]
 * downloadExcelFileFromDataDyn('data(ltdt).xlsx', 'data', data)
 *
 */
async function downloadExcelFileFromDataDyn(fileName, sheetName = 'data', data, pathItems) { // eslint-disable-line no-unused-vars

    //downloadExcelFileFromData
    let r = await downloadExcelFileFromData(fileName, sheetName, data)

    if (get(r, 'error', '') !== '') {
        return Promise.reject(r.error)
    }
    return r
}


export default downloadExcelFileFromDataDyn
