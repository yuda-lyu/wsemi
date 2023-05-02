import fs from 'fs'
import fsDeleteFolder from './fsDeleteFolder.mjs'
import fsCreateFolder from './fsCreateFolder.mjs'
import fsIsFolder from './fsIsFolder.mjs'


/**
 * 後端nodejs清空資料夾
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/fsCleanFolder.test.mjs Github}
 * @memberOf wsemi
 * @param {String} pah 輸入欲清空資料夾路徑字串
 * @example
 * need test in nodejs. See example in fsCopyFolder.
 *
 */
function fsCleanFolder(pah) {

    //check
    if (!fs.existsSync(pah)) {

        //fsCreateFolder
        let r = fsCreateFolder(pah) //若不存在則自動建立, 故先執行

        //check
        if (r.error) {
            return r.error
        }

        return {
            success: 'done: ' + pah
        }
    }

    //check
    if (!fsIsFolder(pah)) {
        return {
            error: 'input path is not a folder' //若存在但又不是資料夾, 則一律視為錯誤
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

    return {
        success: 'done: ' + pah
    }
}


export default fsCleanFolder
