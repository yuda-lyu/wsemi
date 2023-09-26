import path from 'path'
// import fs from 'fs'
// import crypto from 'crypto'
import chokidar from 'chokidar'
import get from 'lodash/get'
import each from 'lodash/each'
import genID from './genID.mjs'
import now2str from './now2str.mjs'
import evem from './evem.mjs'
import ispint from './ispint.mjs'
import isbol from './isbol.mjs'
import isfun from './isfun.mjs'
import cint from './cint.mjs'
import fsIsFile from './fsIsFile.mjs'
// import fsIsFolder from './fsIsFolder.mjs'


/**
 * 後端nodejs基於chokidar提供偵測資料夾內檔案變更或出現或消失事件之EventEmitter
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/fsWatchFolder.test.mjs Github}
 * @memberOf wsemi
 * @param {Object} [opt={}] 輸入設定物件，預設{}
 * @param {Boolean} [opt.polling=false] 輸入是否使用輪循布林值，代表chokidar的usePolling，預設為false
 * @param {Integer} [opt.timeInterval=100] 輸入當polling為true時偵測檔案變更間隔時間整數，代表chokidar開啟polling時的interval，單位為毫秒ms，預設為100
 * @param {Integer} [opt.timeBinaryInterval=300] 輸入當polling為true時偵測二進位檔案變更間隔時間整數，代表chokidar開啟polling時的binaryInterval，單位為毫秒ms，預設為300
 * @example
 * need test in nodejs.
 *
 * let evfd = fsWatchFolder()
 *
 * evfd.on('./abc', (msg) => {
 *     console.log(msg.type, ':', msg.fp)
 *     // => addDir : ./abc
 *     // add : ./abc/temp1.txt
 *     // unlink : ./abc/temp1.txt
 *     // add : ./abc/temp2.json
 *     // unlinkDir : ./abc
 *     // unlink : ./abc/temp2.json
 * })
 *
 * // evfd.clear()
 *
 */
function fsWatchFolder(opt = {}) {
    // let ts = []
    let kpWhr = {}

    //ev
    let ev = evem()

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

    // function getTag(fp) {
    //     let tag = ''
    //     try {

    //         //readFileSync
    //         let bin = fs.readFileSync(fp)

    //         //tag
    //         tag = crypto.createHash('md5').update(bin).digest('base64')

    //     }
    //     catch (err) {}
    //     return tag
    // }

    function watchEvent(fp, fun) {

        //watcher
        let watcher = null

        //gcls
        let gcls = () => {
            if (watcher === null) {
                return
            }
            watcher.unwatch(fp)
        }

        //gnew
        let gnew = () => {
            //chokidar監測資料夾時, 若資料夾內有子資料夾, 且子資料夾內有檔案時, 此時無法刪除資料夾因被程序上鎖, 故只能先刪除其內檔案或先刪除子資料夾才行
            watcher = chokidar.watch(fp, {
                // persistent: true,
                // ignoreInitial: false,
                usePolling: polling,
                interval: timeInterval,
                binaryInterval: timeBinaryInterval,
                awaitWriteFinish: true, //須比較多延遲偵測檔案是否變更完成, 但對於連鎖驅動比較保險
                // depth: undefined,
            })
        }

        //gn
        let gn = () => {
            gcls()
            gnew()
        }

        //啟動chokidar.watch
        gn()

        //id
        let id = genID()

        //save
        kpWhr[id] = {
            id,
            fp,
            watcher,
            isFile: false,
        }

        //on
        watcher
            .on('all', (type, rfp, stats) => {
                // console.log(type, rfp, stats)
                //type=add,addDir,change,unlink,unlinkDir, 注意當unlinkDir後就不會再觸發變更事件, 故外層用timer重新偵測

                //統一路徑格式
                let rtfp = ''
                if (true) {
                    let t = rfp
                    t = t.replace(/\\/g, '/')
                    t = `./${t}`
                    rtfp = t
                }
                // console.log('all type', type, rfp, rtfp)

                //path.resolve
                let _fp = path.resolve(fp)
                let _rtfp = path.resolve(rtfp)
                // console.log('_fp', _fp)
                // console.log('_rtfp', _rtfp)

                //b
                let bfl = fsIsFile(fp)
                // console.log(fp, 'bfl', bfl)

                //check
                if (bfl) {
                    kpWhr[id].isFile = true
                    return
                }

                //check
                if (kpWhr[id].isFile && type === 'unlink') {
                    if (_fp === _rtfp) {
                        kpWhr[id].isFile = false
                        return
                    }
                }

                //fun
                if (isfun(fun)) {
                    fun({
                        fp: rtfp,
                        type,
                        time: now2str(),
                        stats,
                    })
                }

                //unlinkDir
                if (type === 'unlinkDir') {
                    if (_fp === _rtfp) {
                        //因unlinkDir後就不會再觸發變更事件, 延遲重新啟動chokidar.watch
                        setTimeout(() => {
                            // console.log('call gn')
                            gn()
                        }, 1)
                    }
                }

            })

    }

    function unWatchEventCore(v, k) {
        v.watcher.close()
            // .then(() => {})
            .catch((err) => {
                console.log(err)
                console.log('watcher.close error', v.fp)
            })
            .finally(() => {
                delete kpWhr[k]
            })
    }

    function unWatchEvent(fp) {
        each(kpWhr, (v, k) => {
            if (v.fp === fp) {
                unWatchEventCore(v, k)
            }
        })
    }

    function clear() {
        each(kpWhr, (v, k) => {
            unWatchEventCore(v, k)
        })
    }

    //save
    ev.on = watchEvent
    ev.off = unWatchEvent
    ev.clear = clear

    return ev
}

export default fsWatchFolder
