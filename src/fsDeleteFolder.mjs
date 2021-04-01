import fs from 'fs'
import fsIsFolder from './fsIsFolder.mjs'


/**
 * 後端nodejs刪除資料夾
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/fsDeleteFolder.test.js Github}
 * @memberOf wsemi
 * @param {String} pah 輸入欲刪除資料夾路徑字串
 * @example
 * need test in nodejs. See example in fsCopyFolder.
 *
 */
function fsDeleteFolder(pah) {

    //check
    if (!fs.existsSync(pah)) {
        return {
            success: 'folder does not exist: ' + pah //資料夾不存在但仍算是刪除成功, 故需先判斷
        }
    }

    //check
    if (!fsIsFolder(pah)) {
        return {
            error: 'input path is not folder: ' + pah //若存在但又不是資料夾, 則視為錯誤
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
