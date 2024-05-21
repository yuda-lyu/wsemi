import fs from 'fs'
import fsIsFile from './fsIsFile.mjs'


/**
 * 後端nodejs重新命名檔案
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/fsRenameFile.test.mjs Github}
 * @memberOf wsemi
 * @param {String} pahOld 輸入檔案原本路徑字串
 * @param {String} pahNew 輸入檔案更名路徑字串
 * @example
 * need test in nodejs.
 *
 * console.log('fsRenameFile', fsRenameFile('./abc.txt', './def.txt'))
 * // fsRenameFile { success: 'done: ./def.txt' }
 *
 */
function fsRenameFile(pahOld, pahNew) {

    //check
    if (!fsIsFile(pahOld)) {
        return {
            error: `pahOld[${pahOld}] is not a file` //pahOld不是檔案則視為錯誤
        }
    }

    //check
    if (fs.existsSync(pahNew)) {
        return {
            error: `pahNew[${pahNew}] does exist` //pahNew存在則視為錯誤
        }
    }

    //renameSync
    try {
        fs.renameSync(pahOld, pahNew)
    }
    catch (err) {
        return {
            error: err
        }
    }

    return {
        success: 'done: ' + pahNew
    }
}


export default fsRenameFile
