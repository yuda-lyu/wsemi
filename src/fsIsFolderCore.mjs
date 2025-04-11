// import fs from 'fs'
import get from 'lodash-es/get.js'


/**
 * 後端nodejs判斷是否為資料夾
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/fsIsFolderCore.test.mjs Github}
 * @memberOf wsemi
 * @param {String} pah 輸入路徑字串
 * @returns {Boolean} 回傳是否布林值
 * @example
 * need test in nodejs.
 *
 * //see fsIsFolder
 *
 */
function fsIsFolderCore(pah, opt = {}) {

    //fs
    let fs = get(opt, 'fs')

    //check
    if (!fs.existsSync(pah)) {
        return false
    }

    //check
    let s = fs.lstatSync(pah)
    if (s.isFile()) {
        return false
    }
    if (s.isSymbolicLink()) {
        return false
    }

    return true
}


export default fsIsFolderCore
