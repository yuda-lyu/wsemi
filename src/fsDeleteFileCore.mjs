// import fs from 'fs'
import get from 'lodash-es/get.js'
import fsIsFileCore from './fsIsFileCore.mjs'


/**
 * 後端nodejs刪除檔案
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/fsDeleteFileCore.test.mjs Github}
 * @memberOf wsemi
 * @param {String} pah 輸入路徑字串
 * @returns {Object} 回傳結果物件，提供鍵success代表成功訊息，提供鍵error代表錯誤訊息
 * @example
 * need test in nodejs.
 *
 * //see fsDeleteFile
 *
 */
function fsDeleteFileCore(pah, opt = {}) {

    //fs
    let fs = get(opt, 'fs')

    //check, 需先判斷
    if (!fs.existsSync(pah)) {
        return {
            success: 'file does not exist: ' + pah //目標不存在但仍算是刪除成功, 故需先判斷
        }
    }

    //check
    if (!fsIsFileCore(pah, { fs })) {
        return {
            error: 'input path is not a file: ' + pah //若存在但又不是檔案, 則視為錯誤
        }
    }

    //unlinkSync
    try {
        fs.unlinkSync(pah)
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


export default fsDeleteFileCore
