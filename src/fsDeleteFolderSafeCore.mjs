import get from 'lodash-es/get.js'
import ispint from './ispint.mjs'
import cint from './cint.mjs'
import delay from './delay.mjs'
import fsExistsCore from './fsExistsCore.mjs'
import fsIsFolderCore from './fsIsFolderCore.mjs'
import errToStr from './_errToStr.mjs'


/**
 * 後端nodejs刪除資料夾，支援失敗重試機制
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/fsDeleteFolderSafeCore.test.mjs Github}
 * @memberOf wsemi
 * @param {String} pah 輸入欲刪除資料夾路徑字串
 * @param {Object} [opt={}] 輸入設定物件，預設{}
 * @param {Object} [opt.fs=null] 輸入設定物件，預設null
 * @param {Integer} [opt.numRetry=5] 輸入嘗試刪除次數整數，預設5
 * @returns {Promise} 回傳Promise，resolve回傳成功訊息，reject回傳錯誤訊息字串(含重試耗盡仍被占用)
 * @example
 * need test in nodejs.
 *
 * //see fsDeleteFolderSafe
 *
 */
async function fsDeleteFolderSafeCore(pah, opt = {}) {
    let numRetry = 5
    let fs = null

    //讀取opt與check置於try內: opt本身或其屬性不可讀(getter拋錯、已撤銷之Proxy)時get拋出(於async函數內未捕捉即以Error物件reject), 注入之fs之lstatSync可拋出任意值, 皆轉字串reject
    try {

        //numRetry
        numRetry = get(opt, 'numRetry')
        if (!ispint(numRetry)) {
            numRetry = 5
        }
        numRetry = cint(numRetry)

        //fs
        fs = get(opt, 'fs', null)

        //check, 需先判斷
        if (!fsExistsCore(pah, { fs })) {
            // return {
            //     success: 'folder does not exist: ' + pah //目標不存在但仍算是刪除成功, 故需先判斷
            // }
            return 'folder does not exist: ' + pah //目標不存在但仍算是刪除成功, 故需先判斷
        }
        if (!fsIsFolderCore(pah, { fs })) {
            // return {
            //     error: 'input path is not a folder: ' + pah //若存在但又不是資料夾, 則視為錯誤
            // }
            return Promise.reject('input path is not a folder: ' + pah) //若存在但又不是資料夾, 則視為錯誤
        }
    }
    catch (err) {
        return Promise.reject(errToStr(err))
    }

    //retry
    let done = false
    let errLast = null
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
            done = true
            break
        }
        catch (err) {
            // return {
            //     error: err
            // }
            errLast = err
            //code, 拋出之值可為null、無原型物件、已撤銷之Proxy, 讀屬性須保護
            let code = null
            try {
                code = err.code
            }
            catch (e) {}
            if (code === 'EBUSY') {
                await delay(300)
            }
            else {
                return Promise.reject(errToStr(err))
            }
        }
    }

    //check, 重試耗盡仍EBUSY: 原為跳出迴圈後回傳done(偽成功), 改以最後一次之錯誤reject
    if (!done) {
        return Promise.reject(errToStr(errLast))
    }

    // return {
    //     success: 'done: ' + pah
    // }
    return 'done: ' + pah
}


export default fsDeleteFolderSafeCore
