import fs from 'fs'
import fsDeleteFileSafeCore from './fsDeleteFileSafeCore.mjs'
import errToStr from './_errToStr.mjs'


/**
 * 後端nodejs刪除檔案，支援失敗重試機制
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/fsDeleteFileSafe.test.mjs Github}
 * @memberOf wsemi
 * @param {String} pah 輸入路徑字串
 * @param {Object} [opt={}] 輸入設定物件，預設{}
 * @param {Object} [opt.fs=null] 輸入設定物件，預設null
 * @param {Integer} [opt.numRetry=5] 輸入嘗試刪除次數整數，預設5
 * @param {Function} [opt.onTrace=null] 輸入觀察回調函數，於內部事件發生當下同步呼叫，傳入一個凍結之事件物件{ type, ... }，供測試以事件(而非等待時間)同步與診斷；type為'attempt'時為即將呼叫unlinkSync嘗試刪除(含n為由1起算之嘗試序號)，'retry'時為第n次嘗試遇EBUSY而即將等待ms毫秒(固定300)(含n、code為'EBUSY'、ms；n已達numRetry者等待後不再嘗試而接著giveup)，'done'時為第n次嘗試刪除成功而即將resolve(含n)，'skip'時為不需(再)刪除而即將resolve或reject(含n與reason；reason為'not-exist'代表前置檢查標的不存在而resolve、'not-file'代表前置檢查標的非檔案而reject，此二者n為0；reason為'vanished'代表第n次嘗試得ENOENT且標的確已不存在(重試期間被他方刪除)而resolve)，'giveup'時為重試耗盡仍遇EBUSY而即將reject(含n為numRetry、code為'EBUSY')，'fail'時為前置檢查拋錯(n為0)或第n次嘗試遇不可重試之錯誤而即將reject(含n、code為該錯誤之code字串，無則null)；事件皆於resolve或reject之前通知；回調不帶接收者呼叫，其拋錯與回傳值皆忽略，不影響刪除，預設null
 * @returns {Promise} 回傳Promise，resolve回傳成功訊息，reject回傳錯誤訊息字串(含重試耗盡仍被占用)
 * @example
 * need test in nodejs.
 *
 * let test = async () => {
 *
 *     let ms = []
 *
 *     let fdt = './_test_fsDeleteFileSafe'
 *
 *     fsCreateFolder(fdt) //創建臨時任務資料夾
 *
 *     let fn = 'abc.txt'
 *     let fp = `${fdt}/${fn}`
 *
 *     fsCreateFile(fp, 'abc', { encoding: 'utf8' })
 *
 *     let b1 = fsIsFile(fp)
 *     console.log('fsDeleteFileSafe(before)', b1)
 *     ms.push({ 'fsDeleteFileSafe(before)': b1 })
 *
 *     await fsDeleteFileSafe(fp)
 *
 *     let b2 = fsIsFile(fp)
 *     console.log('fsDeleteFileSafe(after)', b2)
 *     ms.push({ 'fsDeleteFileSafe(after)': b2 })
 *
 *     fsDeleteFolder(fdt) //刪除臨時任務資料夾
 *
 *     console.log('ms', ms)
 *     return ms
 * }
 * test()
 * // fsDeleteFileSafe(before) true
 * // fsDeleteFileSafe(after) false
 * // ms [ { 'fsDeleteFileSafe(before)': true }, { 'fsDeleteFileSafe(after)': false } ]
 *
 */
async function fsDeleteFileSafe(pah, opt = {}) {

    //o, 展開置於try內: opt本身或其屬性不可讀(getter拋錯、已撤銷之Proxy)時展開即拋出, 於async函數內未捕捉即以Error物件reject
    let o = null
    try {
        o = { fs, ...opt }
    }
    catch (err) {
        return Promise.reject(errToStr(err))
    }

    return await fsDeleteFileSafeCore(pah, o)
}


export default fsDeleteFileSafe
