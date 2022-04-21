import fs from 'fs'
import crypto from 'crypto'
import get from 'lodash/get'
import each from 'lodash/each'
import evem from './evem.mjs'
import ispint from './ispint.mjs'
import cint from './cint.mjs'
import fsIsFile from './fsIsFile.mjs'


/**
 * 後端nodejs基於fs與crypto提供類似watchFile偵測檔案內容變更或出現或消失事件之EventEmitter
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/fsWatchFile.test.mjs Github}
 * @memberOf wsemi
 * @param {Object} [opt={}] 輸入設定物件，預設{}
 * @param {Integer} [opt.timeDetect=50] 輸入偵測佇列間隔時間整數，若基於檔案變更之頻率小於timeDetect，則會發生事件消失問題，單位為毫秒ms，預設為50
 * @param {Integer} [opt.timeRewatch=1000] 輸入偵測檔案存在時間整數，單位為毫秒ms，預設為1000
 * @example
 * need test in nodejs.
 *
 * let evf = fsWatchFile()
 *
 * evf.on('./abc.json', (msg) => {
 *     console.log(msg.tag, msg.stats.mtime)
 *     // => kAFQmDzST7DWlj99KOF/cg== 2022-04-21T02:58:16.274Z
 * })
 *
 * // evf.clear()
 *
 */
function fsWatchFile(opt = {}) {
    let ts = []
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

    function getTag(fp) {
        let tag = ''
        try {

            //readFileSync
            let bin = fs.readFileSync(fp)

            //tag
            tag = crypto.createHash('md5').update(bin).digest('base64')

        }
        catch (err) {}
        return tag
    }

    function watchEvent(fp, cb) {
        let _tag = null

        //setInterval, 檔案可能仍未存在, 故使用timer偵測
        let t = setInterval(() => {
            // console.log('check fp',fp)

            //check
            if (fsIsFile(fp)) {

                //stat
                fs.stat(fp, (err, stats) => {
                    // console.log('fs.stat', stats)

                    if (!err) {

                        //save tag
                        _tag = getTag(fp)

                        //cb
                        cb({
                            tag: _tag,
                            stats,
                        })

                    }

                })

                //func
                let func = (statsCurr, statsPrev) => {
                    // console.log('fs.watchFile', statsCurr.mtime)

                    //tag, vs code僅儲存會對檔案有3階段影響, 即便最終內容沒有變更, 但過程中檔案內容會改變導致md5不同, 進而觸發變更事件
                    let tag = getTag(fp)

                    //check
                    if (_tag !== tag) {

                        //update tag
                        _tag = tag

                        //cb
                        cb({
                            tag: _tag,
                            stats: statsCurr,
                        })

                    }

                }

                //watchFile
                fs.watchFile(fp, { interval: timeDetect }, func)

                //push
                ws.push({
                    fp,
                    func,
                })

                //clearInterval
                clearInterval(t)

            }

        }, timeRewatch)

        //push
        ts.push({
            fp,
            t,
        })

    }

    function unWatchEvent(fp) {
        each(ts, (v) => {
            if (v.fp === fp) {
                clearInterval(v.t)
            }
        })
        each(ws, (v) => {
            if (v.fp === fp) {
                fs.unwatchFile(v.fp, v.func)
            }
        })
    }

    function clear() {
        each(ts, (v) => {
            clearInterval(v.t)
        })
        each(ws, (v) => {
            fs.unwatchFile(v.fp, v.func)
        })
    }

    //save
    ev.on = watchEvent
    ev.off = unWatchEvent
    ev.clear = clear

    return ev
}

export default fsWatchFile
