import get from 'lodash-es/get.js'
import isestr from './isestr.mjs'
import isarr from './isarr.mjs'
import iseobj from './iseobj.mjs'
import haskey from './haskey.mjs'
import downloadFileFromBlob from './downloadFileFromBlob.mjs'
import getExcelWorkbookFromData from './getExcelWorkbookFromData.mjs'
import getExcelU8ArrFromWorkbook from './getExcelU8ArrFromWorkbook.mjs'
import ltdtkeysheads2mat from './ltdtkeysheads2mat.mjs'
import isWindow from './isWindow.mjs'


/**
 * 下載資料成為Excel檔案，前後端都可用
 *
 * 本函數為async function，前端觸發瀏覽器下載，後端寫入檔案(fileName可含路徑)
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/downloadExcelFileFromData.test.mjs Github}
 * @memberOf wsemi
 * @param {String} fileName 輸入檔名字串，後端可含路徑
 * @param {String} [sheetName='data'] 輸入分頁(sheet)名稱字串，預設為'data'
 * @param {Array} data 輸入內容陣列，可為二維陣列(mat)或由物件組成的一維陣列(ltdt)
 * @returns {Promise} 回傳Promise，resolve代表已觸發下載或寫檔完成，輸入無效或轉換失敗時resolve回傳{ error }物件
 * @example
 *
 * let data
 *
 * data = [
 *     ['a', 'b', 'c'],
 *     [1, 23.45, 'xyz']
 * ]
 * await downloadExcelFileFromData('data(mat).xlsx', 'data', data)
 *
 * data = [
 *     { x: 'a', y: 'b', z: 'c' },
 *     { x: 1, y: 23.45, zzz: 'xyz' },
 * ]
 * await downloadExcelFileFromData('data(ltdt).xlsx', 'data', data)
 *
 */
async function downloadExcelFileFromData(fileName, sheetName = 'data', data) {

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
    if (!isarr(data)) {
        let msg = 'data is not an array'
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
    if (haskey(wb, 'error')) {
        console.log(wb.error)
        return wb
    }

    //getExcelU8ArrFromWorkbook
    let u8a = await getExcelU8ArrFromWorkbook(wb)

    //check
    if (haskey(u8a, 'error')) {
        console.log(u8a.error)
        return u8a
    }

    //check
    if (isWindow()) {

        //downloadFileFromBlob
        downloadFileFromBlob(fileName, new Blob([u8a]))

    }
    else {

        //writeFileSync
        //本檔保持dual-env(前後端都可用), 故不於檔頂端import fs, 改於Node分支動態import(本函數已為async故可行)
        let fs = await import('fs')
        fs.default.writeFileSync(fileName, u8a)

    }

}


export default downloadExcelFileFromData
