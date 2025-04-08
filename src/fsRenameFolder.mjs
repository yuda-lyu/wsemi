import fs from 'fs'
import fsIsFolder from './fsIsFolder.mjs'


/**
 * 後端nodejs重新命名資料夾
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/fsRenameFolder.test.mjs Github}
 * @memberOf wsemi
 * @param {String} pahOld 輸入資料夾原本路徑字串
 * @param {String} pahNew 輸入資料夾更名路徑字串
 * @returns {Object} 回傳結果物件，提供鍵success代表成功訊息，提供鍵error代表錯誤訊息
 * @example
 * need test in nodejs.
 *
 * console.log('fsRenameFolder', fsRenameFolder('./abc', './def'))
 * // fsRenameFolder { success: 'done: ./def' }
 *
 */
function fsRenameFolder(pahOld, pahNew) {

    //check
    if (!fsIsFolder(pahOld)) {
        return {
            error: `pahOld[${pahOld}] is not a folder` //pahOld不是資料夾則視為錯誤
        }
    }

    //check
    if (fs.existsSync(pahNew)) {
        return {
            error: `pahNew[${pahNew}] does exist` //pahNew存在則視為錯誤
        }
    }

    //renameSync
    try {
        fs.renameSync(pahOld, pahNew)
    }
    catch (err) {
        return {
            error: err
        }
    }

    return {
        success: 'done: ' + pahNew
    }
}


export default fsRenameFolder
