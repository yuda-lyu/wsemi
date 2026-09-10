import path from 'path'
import chokidar from 'chokidar'
import get from 'lodash-es/get.js'
import ispint from './ispint.mjs'
import isbol from './isbol.mjs'
import cint from './cint.mjs'
import fsIsFile from './fsIsFile.mjs'
import evem from './evem.mjs'
import _evemEmit from './_evemEmit.mjs'


/**
 * 後端nodejs基於chokidar提供偵測檔案內容變更或出現或消失事件
 *
 * 因使用chokidar，變更至少要3秒才能監測，不適用於頻繁觸發事件之工作
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/fsWatchFile.test.mjs Github}
 * @memberOf wsemi
 * @param {String} fp 輸入偵測檔案路徑字串
 * @param {Object} [opt={}] 輸入設定物件，預設{}
 * @param {Boolean} [opt.polling=false] 輸入是否使用輪循布林值，代表chokidar的usePolling，預設為false
 * @param {Integer} [opt.timeInterval=100] 輸入當polling為true時偵測檔案變更間隔時間整數，代表chokidar開啟polling時的interval，單位為毫秒ms，預設為100
 * @param {Integer} [opt.timeBinaryInterval=300] 輸入當polling為true時偵測二進位檔案變更間隔時間整數，代表chokidar開啟polling時的binaryInterval，單位為毫秒ms，預設為300
 * @returns {Object} 回傳事件物件，包含on、clear函數，on可進行監聽change、error事件，clear為停止全部監聽，不須輸入。chokidar之watcher自身出錯(如無權限EPERM、EACCES)以error事件回報{ fun: 'watcher', msg }。事件物件為原生EventEmitter(eventemitter3)。本模組於派發處以try攔截監聽器之同步拋錯故其不會使行程崩潰；惟依EventEmitter規範，同一次派發中先拋錯之監聽器會中止該次派發，其後之監聽器不再被呼叫。async監聽器之reject不被攔截(規範上emit不觀察監聽器回傳值)，須由監聽器自行處理，否則為unhandledRejection，監聽器出錯會改以error事件回報{ fun: 'listener', name, msg, args }，監聽error時請先以fun欄位分流
 * @example
 * need test in nodejs.
 *
 * import getFileName from './src/getFileName.mjs'
 * import fsDeleteFile from './src/fsDeleteFile.mjs'
 * import fsRenameFile from './src/fsRenameFile.mjs'
 * import fsWatchFile from './src/fsWatchFile.mjs'
 *
 * let test = async () => {
 *     return new Promise((resolve, reject) => {
 *         let ms = []
 *
 *         let fp = './_test_fsWatchFile.txt'
 *
 *         fsDeleteFile(fp)
 *
 *         let ev = fsWatchFile(fp)
 *         ev.on('change', (msg) => {
 *             console.log(msg.type, getFileName(msg.fp))
 *             ms.push({ type: msg.type, fp: getFileName(msg.fp) })
 *         })
 *
 *         setTimeout(() => {
 *             fs.writeFileSync(fp, 'abc', 'utf8')
 *         }, 1)
 *
 *         setTimeout(() => {
 *             fsRenameFile(fp, fp + '.tmp')
 *         }, 3000)
 *
 *         setTimeout(() => {
 *             fsRenameFile(fp + '.tmp', fp)
 *         }, 6000)
 *
 *         setTimeout(() => {
 *             fs.writeFileSync(fp, 'def', 'utf8')
 *         }, 9000)
 *
 *         setTimeout(() => {
 *             fsDeleteFile(fp)
 *         }, 12000)
 *
 *         setTimeout(() => {
 *             ev.clear()
 *             console.log('ms', ms)
 *             resolve(ms)
 *         }, 15000)
 *
 *     })
 * }
 * await test()
 *     .catch((err) => {
 *         console.log(err)
 *     })
 * // add _test_fsWatchFile.txt
 * // unlink _test_fsWatchFile.txt
 * // add _test_fsWatchFile.txt
 * // change _test_fsWatchFile.txt
 * // unlink _test_fsWatchFile.txt
 * // ms [
 * //   { type: 'add', fp: '_test_fsWatchFile.txt' },
 * //   { type: 'unlink', fp: '_test_fsWatchFile.txt' },
 * //   { type: 'add', fp: '_test_fsWatchFile.txt' },
 * //   { type: 'change', fp: '_test_fsWatchFile.txt' },
 * //   { type: 'unlink', fp: '_test_fsWatchFile.txt' }
 * // ]
 *
 */
function fsWatchFile(fp, opt = {}) {

    //polling
    let polling = get(opt, 'polling')
    if (!isbol(polling)) {
        polling = false
    }

    //timeInterval
    let timeInterval = get(opt, 'timeInterval')
    if (!ispint(timeInterval)) {
        timeInterval = 100
    }
    timeInterval = cint(timeInterval)

    //timeBinaryInterval
    let timeBinaryInterval = get(opt, 'timeBinaryInterval')
    if (!ispint(timeBinaryInterval)) {
        timeBinaryInterval = 300
    }
    timeBinaryInterval = cint(timeBinaryInterval)

    //ev
    let ev = evem() //change事件於chokidar回呼內派發, 監聽器出錯不得殺行程, 由evem預設政策重發error事件

    //fpSpe
    let fpSpe = fp

    //timer
    let watcher = null
    let t = setInterval(() => {

        //check
        if (watcher !== null) {
            return
        }

        //check
        if (!fsIsFile(fpSpe)) {
            return
        }

        //watcher
        watcher = chokidar.watch(fpSpe, {
            // persistent: true,
            // ignoreInitial: false,
            usePolling: polling,
            interval: timeInterval,
            binaryInterval: timeBinaryInterval,
            awaitWriteFinish: true, //須比較多延遲偵測檔案是否變更完成, 但對於連鎖驅動比較保險
            // depth: undefined,
        })

        //on
        watcher
            .on('all', (type, fp, stats) => {
                // console.log(type, fp, stats)
                //type=add,change,unlink
                //注意當刪除監聽的fp後再新增同名檔案, 或更名監聽的fp再更名回同名檔案, 會觸發type='change'而不是'add'

                //fp
                fp = path.resolve(fp)

                //emit
                _evemEmit(ev, 'change', [{ type, fp, stats }], { tag: 'fsWatchFile' })

            })
            .on('error', (err) => {
                //chokidar之FSWatcher為nodejs原生EventEmitter, 其對非ENOENT/ENOTDIR之錯誤(如EPERM、EACCES)會emit('error'), 無監聽者即throw殺行程, 故轉為ev之error事件
                _evemEmit(ev, 'error', [{ fun: 'watcher', msg: err }], { tag: 'fsWatchFile' })
            })


    }, timeInterval)

    //unWatch
    let unWatch = () => {
        // console.log('call unWatch')
        if (watcher === null) {
            return
        }
        try {
            watcher.unwatch(fpSpe)
        }
        catch (err) {
            console.log(err)
        }
        watcher.close()
            // .then(() => {})
            .catch((err) => {
                console.log(err)
            })
            .finally(() => {
                watcher = null
                // console.log('watcher=null')
            })
    }

    //clear
    let clear = () => {
        unWatch()
        clearInterval(t)
    }

    //save
    ev.clear = clear

    return ev
}

export default fsWatchFile
