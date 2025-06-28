// import fs from 'fs'
import get from 'lodash-es/get.js'
import ispint from './ispint.mjs'
import cint from './cint.mjs'
import delay from './delay.mjs'
import fsIsFolderCore from './fsIsFolderCore.mjs'


/**
 * 後端nodejs刪除資料夾，支援失敗重試機制
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/fsDeleteFolderSafeCore.test.mjs Github}
 * @memberOf wsemi
 * @param {String} pah 輸入欲刪除資料夾路徑字串
 * @param {Object} [opt={}] 輸入設定物件，預設{}
 * @param {Object} [opt.fs=null] 輸入設定物件，預設null
 * @param {Integer} [opt.numRetry=5] 輸入嘗試刪除次數整數，預設5
 * @returns {Promise} 回傳Promise，resolve回傳成功訊息，reject回傳錯誤訊息
 * @example
 * need test in nodejs.
 *
 * //see fsDeleteFolderSafe
 *
 */
async function fsDeleteFolderSafeCore(pah, opt = {}) {

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
        //     success: 'folder does not exist: ' + pah //目標不存在但仍算是刪除成功, 故需先判斷
        // }
        return 'folder does not exist: ' + pah //目標不存在但仍算是刪除成功, 故需先判斷
    }

    //check
    if (!fsIsFolderCore(pah, { fs })) {
        // return {
        //     error: 'input path is not a folder: ' + pah //若存在但又不是資料夾, 則視為錯誤
        // }
        return Promise.reject('input path is not a folder: ' + pah) //若存在但又不是資料夾, 則視為錯誤
    }

    //retry
    for (let i = 0; i < numRetry; i++) {
        // try {
        //     // await fs.promises.rm(p, { recursive: true, force: true })
        //     fs.rmSync(p, { recursive: true, force: true })
        //     break
        // }
        // catch (e) {
        //     if (e.code === 'EBUSY') {
        //         await delay(100)
        //     }
        //     else throw e
        // }
        //刪除資料夾內的全部資料夾與檔案
        try {
            fs.rmSync(pah, { recursive: true, force: true })
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


export default fsDeleteFolderSafeCore
