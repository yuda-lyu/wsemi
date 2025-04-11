// import fs from 'fs'
import get from 'lodash-es/get.js'
import fsIsFolderCore from './fsIsFolderCore.mjs'


/**
 * 後端nodejs刪除資料夾
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/fsDeleteFolderCore.test.mjs Github}
 * @memberOf wsemi
 * @param {String} pah 輸入欲刪除資料夾路徑字串
 * @returns {Object} 回傳結果物件，提供鍵success代表成功訊息，提供鍵error代表錯誤訊息
 * @example
 * need test in nodejs.
 *
 * //see fsDeleteFolder
 *
 */
function fsDeleteFolderCore(pah, opt = {}) {

    //fs
    let fs = get(opt, 'fs')

    //check, 需先判斷
    if (!fs.existsSync(pah)) {
        return {
            success: 'folder does not exist: ' + pah //目標不存在但仍算是刪除成功, 故需先判斷
        }
    }

    //check
    if (!fsIsFolderCore(pah, { fs })) {
        return {
            error: 'input path is not a folder: ' + pah //若存在但又不是資料夾, 則視為錯誤
        }
    }

    //刪除資料夾內的全部資料夾與檔案
    try {
        fs.rmSync(pah, { recursive: true, force: true })
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


export default fsDeleteFolderCore
