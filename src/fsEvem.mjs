import path from 'path'
import fs from 'fs'
import get from 'lodash/get'
import each from 'lodash/each'
import evem from './evem.mjs'
import isestr from './isestr.mjs'
import iseobj from './iseobj.mjs'
import ispint from './ispint.mjs'
import cint from './cint.mjs'
import j2o from './j2o.mjs'
import fsCreateFolder from './fsCreateFolder.mjs'
import fsIsFolder from './fsIsFolder.mjs'
import fsWatchFile from './fsWatchFile.mjs'


/**
 * 後端nodejs基於檔案內容變更機制提供跨程序EventEmitter
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/fsEvem.test.mjs Github}
 * @memberOf wsemi
 * @param {String} [fd='./_evps'] 輸入建置事件檔案所在資料夾路徑字串，預設'./_evps'
 * @param {Object} [opt={}] 輸入設定物件，預設{}
 * @param {Integer} [opt.timeDetect=50] 輸入偵測佇列間隔時間整數，若基於檔案變更之頻率小於timeDetect，則會發生事件消失問題，單位為毫秒ms，預設為50
 * @param {Integer} [opt.timeRewatch=1000] 輸入偵測檔案存在時間整數，單位為毫秒ms，預設為1000
 * @example
 * need test in nodejs.
 *
 * // ---- g1.mjs ----
 *
 * import fsEvem from './src/fsEvem.mjs'
 *
 * let evf = fsEvem()
 *
 * evf.on('change', (msgc, msgf) => {
 *     console.log('recv change g1', msgc)
 * })
 *
 * let n = 0
 * setInterval(() => {
 *     n++
 *     evf.emit('change', { p1: 'abc', p2: n, p3: 'from g1' })
 * }, 2000)
 * // recv change g1 { p1: 'abc', p2: 1, p3: 'from g1' }
 * // recv change g1 { p1: 'def', p2: 1, p3: 'from g2' }
 * // recv change g1 { p1: 'abc', p2: 2, p3: 'from g1' }
 * // recv change g1 { p1: 'def', p2: 2, p3: 'from g2' }
 * // recv change g1 { p1: 'abc', p2: 3, p3: 'from g1' }
 * // recv change g1 { p1: 'def', p2: 3, p3: 'from g2' }
 * // recv change g1 { p1: 'abc', p2: 4, p3: 'from g1' }
 * // ...
 *
 * //node --experimental-modules --es-module-specifier-resolution=node g1.mjs
 *
 * // ---- g2.mjs ----
 *
 * import fsEvem from './src/fsEvem.mjs'
 *
 * let evf = fsEvem()
 *
 * evf.on('change', (msgc, msgf) => {
 *     console.log('recv change g2', msgc)
 * })
 *
 * //延遲1s開始
 * let n = 0
 * setTimeout(() => {
 *     setInterval(() => {
 *         n++
 *         evf.emit('change', { p1: 'def', p2: n, p3: 'from g2' })
 *     }, 2000)
 * }, 1000)
 * // recv change g2 { p1: 'abc', p2: 1, p3: 'from g1' }
 * // recv change g2 { p1: 'def', p2: 1, p3: 'from g2' }
 * // recv change g2 { p1: 'abc', p2: 2, p3: 'from g1' }
 * // recv change g2 { p1: 'def', p2: 2, p3: 'from g2' }
 * // recv change g2 { p1: 'abc', p2: 3, p3: 'from g1' }
 * // recv change g2 { p1: 'def', p2: 3, p3: 'from g2' }
 * // recv change g2 { p1: 'abc', p2: 4, p3: 'from g1' }
 * // ...
 *
 * //node --experimental-modules --es-module-specifier-resolution=node g2.mjs
 *
 */
function fsEvem(fd = './_evps', opt = {}) {
    let ws = []

    //ev
    let ev = evem()

    //timeDetect
    let timeDetect = get(opt, 'timeDetect')
    if (!ispint(timeDetect)) {
        timeDetect = 50
    }
    timeDetect = cint(timeDetect)

    //timeRewatch
    let timeRewatch = get(opt, 'timeRewatch')
    if (!ispint(timeRewatch)) {
        timeRewatch = 1000
    }
    timeRewatch = cint(timeRewatch)

    //check
    if (!fsIsFolder(fd)) {
        fsCreateFolder(fd)
    }

    function watchEvent(evName, cb) {

        //fp
        let fp = path.resolve(fd, evName)
        // console.log('watchEvent fp ', fp)

        //fsWatchFile
        let evf = fsWatchFile({
            timeDetect,
            timeRewatch,
        })

        //監聽檔案內容變更或出現或消失事件
        evf.on(fp, (msgFile) => {

            //readFileSync
            let msgContent = fs.readFileSync(fp, 'utf8')

            //check
            let _msgContent = j2o(msgContent)
            if (iseobj(_msgContent)) {
                msgContent = _msgContent
            }

            //cb
            cb(msgContent, msgFile)

        })

        //push
        ws.push({
            fp,
            evf,
        })

    }

    function unWatchEvent(evName) {

        //fp
        let fp = path.resolve(fd, evName)
        // console.log('watchEvent fp ', fp)

        each(ws, (v) => {
            if (v.fp === fp) {
                v.evf.clear()
            }
        })

    }

    function watchEmit(evName, msg) {

        //fp
        let fp = path.resolve(fd, evName)
        // console.log('watchEmit fp ', fp)

        //check
        if (!isestr(msg)) {
            msg = JSON.stringify(msg)
        }

        //writeFileSync
        fs.writeFileSync(fp, msg, 'utf8')

    }

    function clear() {
        each(ws, (v) => {
            v.evf.clear()
        })
    }

    //save
    ev.on = watchEvent
    ev.off = unWatchEvent
    ev.emit = watchEmit
    ev.clear = clear

    return ev
}


export default fsEvem
