// import fs from 'fs'
import get from 'lodash-es/get.js'
import ispint from './ispint.mjs'
import cint from './cint.mjs'
import delay from './delay.mjs'
import fsIsFileCore from './fsIsFileCore.mjs'


/**
 * 後端nodejs刪除檔案，支援失敗重試機制
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/fsDeleteFileSafeCore.test.mjs Github}
 * @memberOf wsemi
 * @param {String} pah 輸入路徑字串
 * @param {Object} [opt={}] 輸入設定物件，預設{}
 * @param {Object} [opt.fs=null] 輸入設定物件，預設null
 * @param {Integer} [opt.numRetry=5] 輸入嘗試刪除次數整數，預設5
 * @returns {Promise} 回傳Promise，resolve回傳成功訊息，reject回傳錯誤訊息
 * @example
 * need test in nodejs.
 *
 * //see fsDeleteFileSafe
 *
 */
async function fsDeleteFileSafeCore(pah, opt = {}) {

    //numRetry
    let numRetry = get(opt, 'numRetry')
    if (!ispint(numRetry)) {
        numRetry = 5
    }
    numRetry = cint(numRetry)

    //fs
    let fs = get(opt, 'fs', null)

    //check, 需先判斷
    if (!fs.existsSync(pah)) {
        // return {
        //     success: 'file does not exist: ' + pah //目標不存在但仍算是刪除成功, 故需先判斷
        // }
        return 'file does not exist: ' + pah //目標不存在但仍算是刪除成功, 故需先判斷
    }

    //check
    if (!fsIsFileCore(pah, { fs })) {
        // return {
        //     error: 'input path is not a file: ' + pah //若存在但又不是檔案, 則視為錯誤
        // }
        return Promise.reject('input path is not a file: ' + pah) //若存在但又不是檔案, 則視為錯誤
    }

    //retry
    for (let i = 0; i < numRetry; i++) {
        //unlinkSync
        try {
            fs.unlinkSync(pah)
            break
        }
        catch (err) {
            // return {
            //     error: err
            // }
            if (err.code === 'EBUSY') {
                await delay(300)
            }
            else {
                return Promise.reject(err)
            }
        }
    }

    // return {
    //     success: 'done: ' + pah
    // }
    return 'done: ' + pah
}


export default fsDeleteFileSafeCore
