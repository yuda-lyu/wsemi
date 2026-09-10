import path from 'path'
import chokidar from 'chokidar'
import get from 'lodash-es/get.js'
import ispint from './ispint.mjs'
import isbol from './isbol.mjs'
import cint from './cint.mjs'
import fsIsFolder from './fsIsFolder.mjs'
import cst from './_const.mjs'
import evem from './evem.mjs'
import evEmit from './evEmit.mjs'


/**
 * 後端nodejs基於chokidar提供偵測資料夾內檔案變更或出現或消失事件
 *
 * 因使用chokidar，變更至少要3秒才能監測，不適用於頻繁觸發事件之工作
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/fsWatchFolder.test.mjs Github}
 * @memberOf wsemi
 * @param {String} fd 輸入偵測資料夾路徑字串
 * @param {Object} [opt={}] 輸入設定物件，預設{}
 * @param {Boolean} [opt.polling=false] 輸入是否使用輪循布林值，代表chokidar的usePolling，預設為false
 * @param {Integer} [opt.timeInterval=100] 輸入當polling為true時偵測檔案變更間隔時間整數，代表chokidar開啟polling時的interval，單位為毫秒ms，預設為100
 * @param {Integer} [opt.timeBinaryInterval=300] 輸入當polling為true時偵測二進位檔案變更間隔時間整數，代表chokidar開啟polling時的binaryInterval，單位為毫秒ms，預設為300
 * @returns {Object} 回傳事件物件，包含on、clear函數，on可進行監聽change、error事件，clear為停止全部監聽，不須輸入。chokidar之watcher自身出錯(如資料夾內含無權限之子資料夾EPERM、EACCES)以error事件回報{ fun: 'watcher', msg }。事件物件為原生EventEmitter(eventemitter3)。本模組於派發處以try攔截監聽器之同步拋錯故其不會使行程崩潰；惟依EventEmitter規範，同一次派發中先拋錯之監聽器會中止該次派發，其後之監聽器不再被呼叫。async監聽器之reject不被攔截(規範上emit不觀察監聽器回傳值)，須由監聽器自行處理，否則為unhandledRejection，監聽器出錯會改以error事件回報{ fun: 'listener', name, msg, args }，監聽error時請先以fun欄位分流
 * @example
 * need test in nodejs.
 *
 * import getFileName from './src/getFileName.mjs'
 * import fsDeleteFile from './src/fsDeleteFile.mjs'
 * import fsRenameFile from './src/fsRenameFile.mjs'
 * import fsCreateFolder from './src/fsCreateFolder.mjs'
 * import fsDeleteFolder from './src/fsDeleteFolder.mjs'
 * import fsRenameFolder from './src/fsRenameFolder.mjs'
 * import fsWatchFolder from './src/fsWatchFolder.mjs'
 *
 * let test = async () => {
 *     return new Promise((resolve, reject) => {
 *         let ms = []
 *
 *         let fp = './_test_fsWatchFolder'
 *
 *         fsDeleteFolder(fp)
 *
 *         let ev = fsWatchFolder(fp)
 *         ev.on('change', (msg) => {
 *             console.log(msg.type, getFileName(msg.fp))
 *             ms.push({ type: msg.type, fp: getFileName(msg.fp) })
 *         })
 *
 *         setTimeout(() => {
 *             fsCreateFolder(fp)
 *         }, 1)
 *
 *         setTimeout(() => {
 *             fs.writeFileSync(`${fp}/abc.txt`, 'abc', 'utf8')
 *         }, 3000)
 *
 *         setTimeout(() => {
 *             fsRenameFile(`${fp}/abc.txt`, `${fp}/abc.txt` + '.tmp')
 *         }, 6000)
 *
 *         setTimeout(() => {
 *             fsRenameFile(`${fp}/abc.txt` + '.tmp', `${fp}/abc.txt`)
 *         }, 9000)
 *
 *         setTimeout(() => {
 *             fs.writeFileSync(`${fp}/abc.txt`, 'def', 'utf8')
 *         }, 12000)
 *
 *         setTimeout(() => {
 *             fsCreateFolder(`${fp}/test-fd`)
 *         }, 15000)
 *
 *         setTimeout(() => {
 *             fsRenameFolder(`${fp}/test-fd`, `${fp}/test-fd` + '-tmp')
 *         }, 18000)
 *
 *         setTimeout(() => {
 *             fsRenameFolder(`${fp}/test-fd` + '-tmp', `${fp}/test-fd`)
 *         }, 21000)
 *
 *         setTimeout(() => {
 *             fsDeleteFile(`${fp}/abc.txt`)
 *         }, 24000)
 *
 *         setTimeout(() => {
 *             fsDeleteFolder(`${fp}/test-fd`)
 *         }, 27000)
 *
 *         setTimeout(() => {
 *             fsDeleteFolder(fp)
 *         }, 30000)
 *
 *         setTimeout(() => {
 *             ev.clear()
 *             console.log('ms', ms)
 *             resolve(ms)
 *         }, 33000)
 *
 *     })
 * }
 * await test()
 *     .catch((err) => {
 *         console.log(err)
 *     })
 * // addDir _test_fsWatchFolder
 * // add abc.txt
 * // unlink abc.txt
 * // add abc.txt.tmp
 * // unlink abc.txt.tmp
 * // add abc.txt
 * // change abc.txt
 * // addDir test-fd
 * // unlinkDir test-fd
 * // addDir test-fd-tmp
 * // unlinkDir test-fd-tmp
 * // addDir test-fd
 * // unlink abc.txt
 * // unlinkDir test-fd
 * // unlinkDir _test_fsWatchFolder
 * // ms [
 * //   { type: 'addDir', fp: '_test_fsWatchFolder' },
 * //   { type: 'add', fp: 'abc.txt' },
 * //   { type: 'unlink', fp: 'abc.txt' },
 * //   { type: 'add', fp: 'abc.txt.tmp' },
 * //   { type: 'unlink', fp: 'abc.txt.tmp' },
 * //   { type: 'add', fp: 'abc.txt' },
 * //   { type: 'change', fp: 'abc.txt' },
 * //   { type: 'addDir', fp: 'test-fd' },
 * //   { type: 'unlinkDir', fp: 'test-fd' },
 * //   { type: 'addDir', fp: 'test-fd-tmp' },
 * //   { type: 'unlinkDir', fp: 'test-fd-tmp' },
 * //   { type: 'addDir', fp: 'test-fd' },
 * //   { type: 'unlink', fp: 'abc.txt' },
 * //   { type: 'unlinkDir', fp: 'test-fd' },
 * //   { type: 'unlinkDir', fp: '_test_fsWatchFolder' }
 * // ]
 *
 */
function fsWatchFolder(fd, opt = {}) {

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
    timeInterval = Math.min(timeInterval, cst.TIMER_TIME_MAX) //夾至計時器上限, 見_const.mjs

    //timeBinaryInterval
    let timeBinaryInterval = get(opt, 'timeBinaryInterval')
    if (!ispint(timeBinaryInterval)) {
        timeBinaryInterval = 300
    }
    timeBinaryInterval = cint(timeBinaryInterval)

    //ev
    let ev = evem() //change事件於chokidar回呼或setInterval內派發, 監聽器出錯不得殺行程, 故派發處以evEmit攔截

    //fpSpe
    let fpSpe = fd

    //timer
    let watcher = null
    let t = setInterval(() => {

        //check
        if (watcher !== null) {

            //check, 若watcher已成功監聽fd, 但更名fd時會無法觸發
            if (!fsIsFolder(fpSpe)) {
                //因監聽觸發狀態不能unWatch, 故要延遲呼叫

                //emit, 資料夾已消失無法stat, stats比照chokidar之unlinkDir給undefined(原碼誤將fs.fstatSync函數本身塞入)
                evEmit(ev, 'change', [{
                    type: 'unlinkDir',
                    fp: path.resolve(fpSpe),
                    stats: undefined,
                }], { tag: 'fsWatchFolder' })

                setTimeout(() => {
                    unWatch()
                }, 1)
            }

            return
        }

        //check
        if (!fsIsFolder(fpSpe)) {
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
                //type=add,unlink,change,addDir,unlinkDir
                //注意當unlinkDir原本監聽的fd後, 就不會再觸發變更事件, 故外層用timer重新偵測

                //fp
                fp = path.resolve(fp)

                //emit
                evEmit(ev, 'change', [{ type, fp, stats }], { tag: 'fsWatchFolder' })

                //check
                if (type === 'unlinkDir' && path.resolve(fpSpe) === fp) {
                    //因監聽觸發狀態不能unWatch, 故要延遲呼叫
                    setTimeout(() => {
                        unWatch()
                    }, 1)
                }

            })
            .on('error', (err) => {
                //chokidar之FSWatcher為nodejs原生EventEmitter, 其對非ENOENT/ENOTDIR之錯誤(如EPERM、EACCES)會emit('error'), 無監聽者即throw殺行程, 故轉為ev之error事件
                evEmit(ev, 'error', [{ fun: 'watcher', msg: err }], { tag: 'fsWatchFolder' })
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

export default fsWatchFolder
