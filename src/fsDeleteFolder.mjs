import fs from 'fs'


/**
 * 後端nodejs刪除資料夾
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/fsDeleteFolder.test.js Github}
 * @memberOf wsemi
 * @param {String} pah 輸入欲刪除資料夾路徑字串
 * @example
 * need test in nodejs.
 */
function fsDeleteFolder(pah) {

    //check
    if (!fs.existsSync(pah)) {
        return {
            error: 'file or folder is not exist: ' + pah
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
        success: 'fsDeleteFolder done: ' + pah
    }
}


export default fsDeleteFolder
