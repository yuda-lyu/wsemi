import fs from 'fs'
import fsIsFile from './fsIsFile.mjs'


/**
 * 後端nodejs刪除檔案
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/fsDeleteFile.test.mjs Github}
 * @memberOf wsemi
 * @param {String} pah 輸入路徑字串
 * @example
 * need test in nodejs.
 *
 * console.log('fsDeleteFile', fsDeleteFile('./abc.txt'))
 * // fsDeleteFile { success: 'done: ./abc.txt' }
 *
 */
function fsDeleteFile(pah) {

    //check, 需先判斷
    if (!fs.existsSync(pah)) {
        return {
            success: 'file does not exist: ' + pah //目標不存在但仍算是刪除成功, 故需先判斷
        }
    }

    //check
    if (!fsIsFile(pah)) {
        return {
            error: 'input path is not a file: ' + pah //若存在但又不是檔案, 則視為錯誤
        }
    }

    //unlinkSync
    try {
        fs.unlinkSync(pah)
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


export default fsDeleteFile
