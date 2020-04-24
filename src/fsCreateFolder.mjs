import fs from 'fs'


/**
 * 後端nodejs建立資料夾
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/fsCreateFolder.test.js Github}
 * @memberOf wsemi
 * @param {String} pah 輸入資料夾路徑字串
 * @example
 * need test in nodejs.
 */
function fsCreateFolder(pah) {

    //mkdirSync
    try {
        fs.mkdirSync(pah, { recursive: true })
    }
    catch (err) {
        return {
            error: err
        }
    }

    return {
        success: 'fsCreateFolder done: ' + pah
    }
}


export default fsCreateFolder
