// import fs from 'fs'
import get from 'lodash-es/get.js'


/**
 * 後端nodejs判斷是否為檔案
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/fsIsFileCore.test.mjs Github}
 * @memberOf wsemi
 * @param {String} pah 輸入路徑字串
 * @returns {Boolean} 回傳是否布林值
 * @example
 * need test in nodejs.
 *
 * //see fsIsFile
 *
 */
function fsIsFileCore(pah, opt = {}) {

    //fs
    let fs = get(opt, 'fs')

    //check
    if (!fs.existsSync(pah)) {
        return false
    }

    //check
    if (fs.lstatSync(pah).isDirectory()) {
        return false
    }
    if (fs.lstatSync(pah).isSymbolicLink()) {
        return false
    }

    return true
}


export default fsIsFileCore
