import path from 'path'
import fs from 'fs'
import each from 'lodash/each'
import evem from './evem.mjs'
import isestr from './isestr.mjs'
import iseobj from './iseobj.mjs'
import j2o from './j2o.mjs'
import fsCreateFolder from './fsCreateFolder.mjs'
import fsIsFile from './fsIsFile.mjs'
import fsIsFolder from './fsIsFolder.mjs'


/**
 * 後端nodejs基於fs機制提供跨程序EventEmitter
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/fsEvem.test.mjs Github}
 * @memberOf wsemi
 * @param {String} [fd='./_evps'] 輸入建置事件檔案所在資料夾路徑字串，預設'./_evps'
 * @example
 * need test in nodejs.
 *
 * import fsEvem from './fsEvem.mjs'
 *
 * let ev = fsEvem(`./_evps`)

 * setTimeout(() => {
 *     // console.log('setTimeout emit1')
 *     ev.emit('chagne', 'abc')
 * }, 1000)
 *
 * setTimeout(() => {
 *     // console.log('setTimeout emit2')
 *     ev.emit('chagne', 12.3)
 * }, 1500)
 *
 * setTimeout(() => {
 *     // console.log('setTimeout emit3')
 *     ev.emit('chagne', { p1: 'abc', p2: 12.3 })
 * }, 2000)
 *
 * ev.on('chagne', (msg) => {
 *     console.log('chagne', msg)
 *     // chagne abc
 *     // chagne 12.3
 *     // chagne { p1: 'abc', p2: 12.3 }
 * })
 *
 */
function fsEvem(fd = './_evps') {
    let ts = []

    //ev
    let ev = evem()

    //check
    if (!fsIsFolder(fd)) {
        fsCreateFolder(fd)
    }

    function watchEvent(evName, cb) {

        //fp
        let fp = path.resolve(fd, evName)
        // console.log('watchEvent fp ', fp)

        // //watch
        // fs.watch(fd, (eventType, filename) => {
        //     console.log('fs.watch 1', eventType, filename)
        //     if (eventType === 'change') {
        //         console.log('fs.watch 2', eventType, filename)
        //     }
        // })

        //setInterval, 檔案可能仍位存在, 故使用timer偵測
        let t = setInterval(() => {
            // console.log('check fp',fp)

            //check
            if (fsIsFile(fp)) {

                //watchFile
                fs.watchFile(fp, { interval: 100 }, (curr, prev) => {
                    // console.log('fs.watchFile', curr.mtime)

                    //readFileSync
                    let msg = fs.readFileSync(fp, 'utf8')

                    //check
                    let _msg = j2o(msg)
                    if (iseobj(_msg)) {
                        msg = _msg
                    }

                    //cb
                    cb(msg)

                })

                //clearInterval
                clearInterval(t)

            }

        }, 1000)

        //push
        ts.push(t)

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
        each(ts, (t) => {
            clearInterval(t)
        })
    }

    //save
    ev.on = watchEvent
    ev.emit = watchEmit
    ev.clear = clear

    return ev
}


export default fsEvem
