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
import fsErrMsg from './_fsErrMsg.mjs'


/**
 * 下載資料成為Excel檔案，前後端都可用
 *
 * 本函數為async function，前端觸發瀏覽器下載，後端寫入檔案(fileName可含路徑)
 *
 * 失敗一律resolve { error }(不reject、不拋錯)，error為固定字串、不含輸入值(V19、V20；原console.log帶出fileName與整份data，含NUL之檔名與寫檔失敗以Node原生錯誤reject而回顯路徑)：fileName非非空字串為'invalid fileName: must be a non-empty string'，fileName含NUL字元為'invalid fileName: must not contain a NUL character'，data非陣列為'invalid data: must be an array'，寫檔失敗為'operation failed (code <錯誤碼>)'(如ENOENT、EPERM，不帶路徑)；轉換失敗回傳下游之{ error }；檢測順序為fileName、data，且先於任何轉換與寫檔
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

    //check, 失敗走{ error }通道(Excel類既有通道), 訊息V19固定詞彙, 不回顯輸入值(V20; 原console.log帶出fileName與整份data)
    if (!isestr(fileName)) {
        return {
            error: 'invalid fileName: must be a non-empty string'
        }
    }
    if (fileName.indexOf('\u0000') >= 0) { //含NUL之檔名(R-FS-INVALID-PATH-01), 原於寫檔時才由Node拋原生錯誤並回顯路徑
        return {
            error: 'invalid fileName: must not contain a NUL character'
        }
    }
    if (!isestr(sheetName)) {
        sheetName = 'data'
    }
    if (!isarr(data)) {
        return {
            error: 'invalid data: must be an array',
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
        //webpack為靜態分析: 字面import('fs')於browser target會直接Module not found建置失敗; 變數間接化import(key)可過但留Critical dependency警告
        let keyFs = 'fs'
        let fs = await import(/* webpackIgnore: true */ /* @vite-ignore */ keyFs)
        try {
            fs.default.writeFileSync(fileName, u8a)
        }
        catch (err) {
            return {
                error: fsErrMsg(err), //Node原生錯誤改固定詞彙加錯誤碼, 不帶路徑(V20、W-23)
            }
        }

    }

}


export default downloadExcelFileFromData
