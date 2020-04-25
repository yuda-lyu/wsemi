import fs from 'fs'


/**
 * 後端nodejs判斷是否為資料夾
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/fsIsFolder.test.js Github}
 * @memberOf wsemi
 * @param {String} pah 輸入路徑字串
 * @example
 * need test in nodejs.
 * let fd = 'folder p'
 * fsIsFolder(fd)
 * // => true
 *
 * let fn = 'file q'
 * fsIsFolder(fn)
 * // => false
 */
function fsIsFolder(pah) {

    //check
    if (!fs.existsSync(pah)) {
        return false
    }

    //check
    if (fs.lstatSync(pah).isFile()) {
        return false
    }
    if (fs.lstatSync(pah).isSymbolicLink()) {
        return false
    }

    return true
}


export default fsIsFolder
