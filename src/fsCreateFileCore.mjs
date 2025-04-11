// import fs from 'fs'
import get from 'lodash-es/get.js'
import isestr from './isestr.mjs'
import getPathParent from './getPathParent.mjs'
import fsIsFileCore from './fsIsFileCore.mjs'
import fsIsFolderCore from './fsIsFolderCore.mjs'
import fsCreateFolderCore from './fsCreateFolderCore.mjs'


/**
 * 後端nodejs建立檔案
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/fsCreateFileCore.test.mjs Github}
 * @memberOf wsemi
 * @param {String} pah 輸入檔案路徑字串
 * @param {Buffer|TypedArray|DataView|String} [data=''] 輸入檔案內容資料，預設''
 * @param {Object|String} [opt={}] 輸入寫入設定物件或字串，可給予writeFileSync設定物件，或是編碼字串(例如'utf8')，預設{}
 * @param {String} [opt.encoding='utf8'] 輸入編碼字串，預設'utf8'
 * @param {Integer} [opt.mode=0o666] 輸入寫入模式數字，預設0o666
 * @param {String} [opt.flag='w'] 輸入寫入標誌字串，預設'w'
 * @returns {Object} 回傳結果物件，提供鍵success代表成功訊息，提供鍵error代表錯誤訊息
 * @example
 * need test in nodejs.
 *
 * //see fsCreateFile
 *
 */
function fsCreateFileCore(pah, data = '', opt = {}) {

    //fs
    let fs = get(opt, 'fs')

    //encoding
    let encoding = get(opt, 'encoding', '')
    if (!isestr(encoding)) {
        encoding = 'utf8'
    }

    //check
    if (fs.existsSync(pah)) {
        return {
            error: 'input path already exists: ' + pah //若路徑存在, 可能是資料夾、檔案或符號連結, 則一律視為錯誤
        }
    }

    //check
    if (fsIsFileCore(pah, { fs })) {
        return {
            error: 'input file is already exists: ' + pah //若檔案存在則視為錯誤
        }
    }

    //fd
    let fd = getPathParent(pah)

    //check
    if (!fsIsFolderCore(fd, { fs })) {
        fsCreateFolderCore(fd, { fs })
    }

    //writeFileSync
    try {
        fs.writeFileSync(pah, data, { encoding })
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


export default fsCreateFileCore
