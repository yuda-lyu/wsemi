// import fs from 'fs'
import get from 'lodash-es/get.js'
import fsIsFolderCore from './fsIsFolderCore.mjs'


/**
 * 後端nodejs建立資料夾
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/fsCreateFolderCore.test.mjs Github}
 * @memberOf wsemi
 * @param {String} pah 輸入資料夾路徑字串
 * @returns {Object} 回傳結果物件，提供鍵success代表成功訊息，提供鍵error代表錯誤訊息
 * @example
 * need test in nodejs.
 *
 * //see fsCreateFolder
 *
 */
function fsCreateFolderCore(pah, opt = {}) {

    //fs
    let fs = get(opt, 'fs')

    //check, 需先判斷
    if (fsIsFolderCore(pah, { fs })) {
        return {
            success: 'input folder is already exists: ' + pah //若資料夾存在則視為成功, 故需先判斷
        }
    }

    //check
    if (fs.existsSync(pah)) {
        return {
            error: 'input path already exists: ' + pah //若存在但又不是資料夾, 可能是檔案或符號連結, 則一律視為錯誤
        }
    }

    //mkdirSync
    try {
        fs.mkdirSync(pah, { recursive: true }) //不存在則自動建立
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


export default fsCreateFolderCore
