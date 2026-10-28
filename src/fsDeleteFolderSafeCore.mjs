import get from 'lodash-es/get.js'
import ispint from './ispint.mjs'
import cint from './cint.mjs'
import delay from './delay.mjs'
import fsExistsCore from './fsExistsCore.mjs'
import fsIsFolderCore from './fsIsFolderCore.mjs'
import errToStr from './_errToStr.mjs'
import getTrace from './getTrace.mjs'


/**
 * 後端nodejs刪除資料夾，支援失敗重試機制
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/fsDeleteFolderSafeCore.test.mjs Github}
 * @memberOf wsemi
 * @param {String} pah 輸入欲刪除資料夾路徑字串
 * @param {Object} [opt={}] 輸入設定物件，預設{}
 * @param {Object} [opt.fs=null] 輸入設定物件，預設null
 * @param {Integer} [opt.numRetry=5] 輸入嘗試刪除次數整數，預設5
 * @param {Function} [opt.onTrace=null] 輸入觀察回調函數，於內部事件發生當下同步呼叫，傳入一個凍結之事件物件{ type, ... }，供測試以事件(而非等待時間)同步與診斷；type為'attempt'時為即將呼叫rmSync嘗試刪除(含n為由1起算之嘗試序號)，'retry'時為第n次嘗試遇EBUSY而即將等待ms毫秒(固定300)(含n、code為'EBUSY'、ms；n已達numRetry者等待後不再嘗試而接著giveup)，'done'時為第n次嘗試刪除成功而即將resolve(含n)，'skip'時為前置檢查即結束而即將resolve或reject(含n為0與reason；reason為'not-exist'代表標的不存在而resolve、'not-folder'代表標的非資料夾而reject)，'giveup'時為重試耗盡仍遇EBUSY而即將reject(含n為numRetry、code為'EBUSY')，'fail'時為前置檢查拋錯(n為0)或第n次嘗試遇不可重試之錯誤而即將reject(含n、code為該錯誤之code字串，無則null)；事件皆於resolve或reject之前通知；回調不帶接收者呼叫，其拋錯與回傳值皆忽略，不影響刪除，預設null
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
    let trace = null

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

        //trace, 觀察回調(opt.onTrace), 未給時為null; 置於numRetry與fs之讀取之後, 使opt不可讀之既有失敗路徑不變
        trace = getTrace(opt)

        //check, 需先判斷
        if (!fsExistsCore(pah, { fs })) {
            // return {
            //     success: 'folder does not exist: ' + pah //目標不存在但仍算是刪除成功, 故需先判斷
            // }
            if (trace) {
                trace('skip', { n: 0, reason: 'not-exist' })
            }
            return 'folder does not exist: ' + pah //目標不存在但仍算是刪除成功, 故需先判斷
        }
        if (!fsIsFolderCore(pah, { fs })) {
            // return {
            //     error: 'input path is not a folder: ' + pah //若存在但又不是資料夾, 則視為錯誤
            // }
            if (trace) {
                trace('skip', { n: 0, reason: 'not-folder' })
            }
            return Promise.reject('input path is not a folder: ' + pah) //若存在但又不是資料夾, 則視為錯誤
        }
    }
    catch (err) {
        if (trace) {
            let code = null
            try {
                code = err.code
            }
            catch (e) {}
            trace('fail', { n: 0, code: typeof code === 'string' ? code : null })
        }
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
        //attempt
        if (trace) {
            trace('attempt', { n: i + 1 })
        }
        //刪除資料夾內的全部資料夾與檔案
        try {
            fs.rmSync(pah, { recursive: true, force: true })
            if (trace) {
                trace('done', { n: i + 1 })
            }
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
                if (trace) {
                    trace('retry', { n: i + 1, code: 'EBUSY', ms: 300 })
                }
                await delay(300)
            }
            else {
                if (trace) {
                    trace('fail', { n: i + 1, code: typeof code === 'string' ? code : null })
                }
                return Promise.reject(errToStr(err))
            }
        }
    }

    //check, 重試耗盡仍EBUSY: 原為跳出迴圈後回傳done(偽成功), 改以最後一次之錯誤reject
    if (!done) {
        if (trace) {
            trace('giveup', { n: numRetry, code: 'EBUSY' })
        }
        return Promise.reject(errToStr(errLast))
    }

    // return {
    //     success: 'done: ' + pah
    // }
    return 'done: ' + pah
}


export default fsDeleteFolderSafeCore
