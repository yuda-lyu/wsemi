// import fs from 'fs'
// import crypto from 'crypto'
import chokidar from 'chokidar'
import get from 'lodash-es/get'
import each from 'lodash-es/each'
import genID from './genID.mjs'
import now2str from './now2str.mjs'
import evem from './evem.mjs'
import ispint from './ispint.mjs'
import isbol from './isbol.mjs'
import isfun from './isfun.mjs'
import cint from './cint.mjs'


/**
 * 後端nodejs基於chokidar提供偵測檔案內容變更或出現或消失事件之EventEmitter
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/fsWatchFile.test.mjs Github}
 * @memberOf wsemi
 * @param {Object} [opt={}] 輸入設定物件，預設{}
 * @param {Boolean} [opt.polling=false] 輸入是否使用輪循布林值，代表chokidar的usePolling，預設為false
 * @param {Integer} [opt.timeInterval=100] 輸入當polling為true時偵測檔案變更間隔時間整數，代表chokidar開啟polling時的interval，單位為毫秒ms，預設為100
 * @param {Integer} [opt.timeBinaryInterval=300] 輸入當polling為true時偵測二進位檔案變更間隔時間整數，代表chokidar開啟polling時的binaryInterval，單位為毫秒ms，預設為300
 * @example
 * need test in nodejs.
 *
 * let evfl = fsWatchFile()
 *
 * evfl.on('./abc.json', (msg) => {
 *     console.log(msg.type, ':', msg.fp)
 *     // => add : ./abc.json
 *     // change : ./abc.json
 *     // unlink : ./abc.json
 * })
 *
 * // evfl.clear()
 *
 */
function fsWatchFile(opt = {}) {
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

        //watch
        let watcher = chokidar.watch(fp, {
            // persistent: true,
            // ignoreInitial: false,
            usePolling: polling,
            interval: timeInterval,
            binaryInterval: timeBinaryInterval,
            awaitWriteFinish: true, //須比較多延遲偵測檔案是否變更完成, 但對於連鎖驅動比較保險
            // depth: undefined,
        })

        //id
        let id = genID()

        //save
        kpWhr[id] = {
            id,
            fp,
            watcher,
        }

        //on
        watcher
            .on('all', (type, rfp, stats) => {
                // console.log(type, rfp, stats)
                //type=add,addDir,change,unlink,unlinkDir, 注意當unlinkDir後就不會再觸發變更事件, 此處只處理file

                //check
                if (type === 'addDir' || type === 'unlinkDir') {
                    return
                }

                //fun
                if (isfun(fun)) {
                    fun({
                        fp,
                        type,
                        time: now2str(),
                        stats,
                    })
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

export default fsWatchFile
