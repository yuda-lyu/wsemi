import fs from 'fs'
import fsDeleteFolder from './fsDeleteFolder.mjs'


/**
 * 後端nodejs清空資料夾
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/fsCleanFolder.test.js Github}
 * @memberOf wsemi
 * @param {String} pah 輸入欲清空資料夾路徑字串
 * @example
 * need test in nodejs.
 */
function fsCleanFolder(pah) {

    //check
    if (!fs.lstatSync(pah).isDirectory()) {
        return {
            error: 'input path is not folder'
        }
    }

    //check
    if (!fs.existsSync(pah)) {
        try {
            fs.mkdirSync(pah)
            return {
                success: 'fsCleanFolder done: ' + pah
            }
        }
        catch (err) {
            return {
                error: err
            }
        }
    }

    //刪除資料夾內的全部資料夾與檔案
    try {
        fs.readdirSync(pah).forEach(function(file, index) {
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
        success: 'fsCleanFolder done: ' + pah
    }
}


export default fsCleanFolder
