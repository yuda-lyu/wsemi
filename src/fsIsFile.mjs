import fs from 'fs'


/**
 * 後端nodejs判斷是否為檔案
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/fsIsFile.test.js Github}
 * @memberOf wsemi
 * @param {String} pah 輸入路徑字串
 * @example
 * need test in nodejs.
 * let fd = 'folder p'
 * fsIsFile(fd)
 * // => false
 *
 * let fn = 'file q'
 * fsIsFile(fn)
 * // => true
 */
function fsIsFile(pah) {

    //check
    if (!fs.existsSync(pah)) {
        return false
    }

    //check
    if (fs.lstatSync(pah).isDirectory()) {
        return false
    }

    return true
}


export default fsIsFile
