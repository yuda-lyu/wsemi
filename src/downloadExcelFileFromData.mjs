import get from 'lodash-es/get.js'
import isestr from './isestr.mjs'
import isarr from './isarr.mjs'
import iseobj from './iseobj.mjs'
import isEle from './isEle.mjs'
import downloadFileFromBlob from './downloadFileFromBlob.mjs'
import getExcelWorkbookFromData from './getExcelWorkbookFromData.mjs'
import ltdtkeysheads2mat from './ltdtkeysheads2mat.mjs'
import isWindow from './isWindow.mjs'
import getXLSX from './_getXLSX.mjs'


/**
 * 下載資料成為Excel檔案，前後端都可用
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
function downloadExcelFileFromData(fileName, sheetName = 'data', data) {

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
        let msg = 'data is not an array or element'
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
        //注意: 本檔本身保持dual-env(前後端都可用), 故不於檔頂端import fs (避免破壞browser webpack/Vue dev編譯)
        //後果: 若Node ESM環境「單獨深度import此檔」(import x from 'wsemi/src/downloadExcelFileFromData.mjs'),
        //會走xlsx ESM build (xlsx.mjs), 其內部_fs未注入故xl.writeFile會擲「cannot save file」
        //解法: 改用「import完整wsemi」(import { downloadExcelFileFromData } from 'wsemi' 或 import wsemi from 'wsemi'),
        //該路徑走package.json main指向的UMD bundle, UMD內走xlsx CJS build, fs會自動載入, writeFile即可運作
        try {
            xl.writeFile(wb, fileName)
        }
        catch (err) {
            let msg = `xl.writeFile failed: ${get(err, 'message', err)}. ` +
                `提示: 若於Node ESM環境單獨深度import此檔, xlsx ESM build的_fs未注入會擲此錯; ` +
                `請改用 import { downloadExcelFileFromData } from 'wsemi' (走package main的UMD bundle, xlsx CJS自動載fs), ` +
                `或於app entry手動呼叫 XLSX.set_fs(fs) 注入fs`
            console.log(msg)
            return msg
        }

    }

    return 'ok'
}


export default downloadExcelFileFromData
