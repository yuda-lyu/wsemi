import fs from 'fs'
import fsIsFile from './fsIsFile.mjs'


/**
 * 後端nodejs建立檔案
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/fsCreateFile.test.mjs Github}
 * @memberOf wsemi
 * @param {String} pah 輸入檔案路徑字串
 * @param {Buffer|TypedArray|DataView} data 輸入檔案內容資料
 * @param {Object|String} [opt={}] 輸入寫入設定物件或字串，可給予writeFileSync設定物件，或是編碼字串(例如'utf8')，預設{}
 * @param {String} [opt.encoding='utf8'] 輸入編碼字串，預設'utf8'
 * @param {Integer} [opt.mode=0o666] 輸入寫入模式數字，預設0o666
 * @param {String} [opt.flag='w'] 輸入寫入標誌字串，預設'w'
 * @example
 * need test in nodejs.
 *
 * console.log('fsCreateFile', fsCreateFile('./abc.txt'))
 * // fsCreateFile { success: 'done: ./abc.txt' }
 *
 */
function fsCreateFile(pah, data, opt = {}) {

    //check
    if (fs.existsSync(pah)) {
        return {
            error: 'input path already exists: ' + pah //若路徑存在, 可能是資料夾、檔案或符號連結, 則一律視為錯誤
        }
    }

    //check
    if (fsIsFile(pah)) {
        return {
            error: 'input file is already exists: ' + pah //若檔案存在則視為錯誤
        }
    }

    //writeFileSync
    try {
        fs.writeFileSync(pah, data, opt)
    }
    catch (err) {
        return {
            error: err
        }
    }

    return {
        success: 'done: ' + pah
    }
}


export default fsCreateFile
