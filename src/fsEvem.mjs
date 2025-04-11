import path from 'path'
import fs from 'fs'
import events from 'events'
import get from 'lodash-es/get.js'
import now2str from './now2str.mjs'
import haskey from './haskey.mjs'
import isbol from './isbol.mjs'
import isstr from './isstr.mjs'
import isestr from './isestr.mjs'
import iseobj from './iseobj.mjs'
import ispint from './ispint.mjs'
import cint from './cint.mjs'
import j2o from './j2o.mjs'
import o2j from './o2j.mjs'
import getFileTrueName from './getFileTrueName.mjs'
import fsCreateFolder from './fsCreateFolder.mjs'
import fsIsFolder from './fsIsFolder.mjs'
import fsDeleteFolder from './fsDeleteFolder.mjs'
import fsWatchFolder from './fsWatchFolder.mjs'


/**
 * 後端nodejs跨程序事件發布與訂閱，主要為通過檔案內容變更與監測進行傳遞事件
 *
 * 因使用chokidar，變更至少要3秒才能監測，不適用於頻繁觸發事件之工作
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/fsEvem.test.mjs Github}
 * @memberOf wsemi
 * @param {Object} [opt={}] 輸入設定物件，預設{}
 * @param {String} [opt.fd='./_evps'] 輸入建置事件檔案所在資料夾路徑字串，預設'./_evps'
 * @param {Boolean} [opt.polling=false] 輸入是否使用輪循布林值，代表chokidar的usePolling，預設為false
 * @param {Integer} [opt.timeInterval=100] 輸入當polling為true時偵測檔案變更間隔時間整數，代表chokidar開啟polling時的interval，單位為毫秒ms，預設為100
 * @param {Integer} [opt.timeBinaryInterval=300] 輸入當polling為true時偵測二進位檔案變更間隔時間整數，代表chokidar開啟polling時的binaryInterval，單位為毫秒ms，預設為300
 * @returns {Object} 回傳事件物件，包含on、clear函數，on可進行監聽指定事件，clear為停止全部監聽，不須輸入
 * @example
 * need test in nodejs.
 *
 * import fsDeleteFolder from './src/fsDeleteFolder.mjs'
 * import fsEvem from './src/fsEvem.mjs'
 *
 * let test = async () => {
 *     return new Promise((resolve, reject) => {
 *         let ms = []
 *
 *         fsDeleteFolder('./_evps')
 *
 *         let ev = fsEvem()
 *
 *         ev.on('conut', (msg) => {
 *             console.log('conut', msg)
 *             ms.push(msg)
 *         })
 *
 *         let n = 0
 *         let t = setInterval(() => {
 *             n++
 *             ev.emit('conut', n)
 *             if (n >= 3) {
 *                 clearTimeout(t)
 *             }
 *         }, 3000)
 *
 *         setTimeout(() => {
 *             ev.clear()
 *             console.log('ms', ms)
 *             resolve(ms)
 *         }, 12000)
 *
 *     })
 * }
 * await test()
 *     .catch((err) => {
 *         console.log(err)
 *     })
 * // conut 1
 * // conut 2
 * // conut 3
 * // ms [ 1, 2, 3 ]
 *
 */
function fsEvem(opt = {}) {

    //fd
    let fd = get(opt, 'fd')
    if (!isestr(fd)) {
        fd = './_evps'
    }

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

    //keySys
    let keySys = get(opt, 'keySys')
    if (!isestr(keySys)) {
        keySys = '[::pkg_content::]'
    }

    //check
    if (!fsIsFolder(fd)) {
        fsCreateFolder(fd)
    }

    //writeEventFile
    let writeEventFile = (evName, msg) => {
        // console.log('writeEventFile', evName, msg)

        //fp
        let fp = path.resolve(fd, evName)
        // console.log('watchEmit fp ', fp)

        //check
        if (isstr(msg)) {
            //不用處理
        }
        else {
            msg = o2j(msg)
        }

        //writeFileSync
        fs.writeFileSync(fp, msg, 'utf8')
        // console.log('writeFileSync', fp, msg)

    }

    //evl
    let evl = fsWatchFolder(fd, {
        polling,
        timeInterval,
        timeBinaryInterval,
    })

    //change
    evl.on('change', (msg) => {
        // console.log('fsWatchFolder change', msg.type, msg.fp)

        //check
        if (msg.type !== 'add' && msg.type !== 'change') {
            return
        }
        // console.log('msg.type', msg.type)

        //evName
        let evName = getFileTrueName(msg.fp)
        // console.log('evName', evName)

        //content
        let content = ''
        try {
            content = fs.readFileSync(msg.fp, 'utf8')
            content = j2o(content)
        }
        catch (err) {}
        // console.log(evName, content)

        //check
        if (!iseobj(content)) {
            return
        }

        //emit
        ev.emit(evName, { [keySys]: content })

    })

    //clear
    let clear = () => {
        evl.clear()
        fsDeleteFolder(fd)
    }

    //ev
    let ev = new events.EventEmitter()
    let emt = ev.emit
    ev.emit = function (evName, msg) { //攔截emit與額外處理, 因使用this記得須維持使用funtion
        // console.log('攔截ev.emit', evName, msg)
        let b = false
        if (iseobj(msg)) {
            b = haskey(msg, keySys)
        }
        if (b) {
            // console.log('攔截回call', evName, msg)
            let value = get(msg, keySys, null)
            let pkg = get(value, 'pkg', '')
            let time = get(value, 'time', '')
            return emt.call(this, evName, pkg, time)
        }
        else {
            // console.log('攔截不回call改寫檔', evName, msg)
            writeEventFile(evName, {
                pkg: msg,
                time: now2str(),
            })
        }
    }

    //save
    ev.clear = clear

    return ev
}


export default fsEvem
