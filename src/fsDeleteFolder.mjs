import fs from 'fs'
import fsIsFolder from './fsIsFolder.mjs'


/**
 * 後端nodejs刪除資料夾
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/fsDeleteFolder.test.mjs Github}
 * @memberOf wsemi
 * @param {String} pah 輸入欲刪除資料夾路徑字串
 * @returns {Object} 回傳結果物件，提供鍵success代表成功訊息，提供鍵error代表錯誤訊息
 * @example
 * need test in nodejs.
 *
 * console.log('fsDeleteFolder', fsDeleteFolder('./abc'))
 * // fsDeleteFolder { success: 'done: ./abc' }
 *
 */
function fsDeleteFolder(pah) {

    //check, 需先判斷
    if (!fs.existsSync(pah)) {
        return {
            success: 'folder does not exist: ' + pah //目標不存在但仍算是刪除成功, 故需先判斷
        }
    }

    //check
    if (!fsIsFolder(pah)) {
        return {
            error: 'input path is not a folder: ' + pah //若存在但又不是資料夾, 則視為錯誤
        }
    }

    //刪除資料夾內的全部資料夾與檔案
    try {
        fs.readdirSync(pah).forEach(function(file) {
            let curPath = pah + '/' + file
            if (fs.lstatSync(curPath).isDirectory()) {
                fsDeleteFolder(curPath)
            }
            else {
                try {
                    fs.unlinkSync(curPath)
                }
                catch (err) {
                    //
                }
            }
        })
    }
    catch (err) {
        return {
            error: err
        }
    }

    //刪除自己
    try {
        fs.rmdirSync(pah)
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


export default fsDeleteFolder
