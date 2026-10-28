import path from 'path'
import fs from 'fs'
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
import evem from './evem.mjs'
import evEmit from './evEmit.mjs'
import getTrace from './getTrace.mjs'


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
 * @param {Function} [opt.onTrace=null] 輸入觀察回調函數，於內部事件發生當下同步呼叫，傳入一個凍結之事件物件{ type, ... }，供測試以事件(而非等待時間)同步與診斷；type為'write'時為emit已寫出事件檔案(含evName為事件名稱，即檔名)，'ready'時為內部監看事件檔案資料夾之watcher已就緒(初始掃描完成，此後寫入之事件檔案才經穩定期後確實被接收；僅傳了onTrace才監聽，不影響原行為，且不轉傳內部fsWatchFolder之事件流)，'skip'時為監看到檔案事件但略過(含reason為略過原因，'kind'代表事件種類非add與change如資料夾本身之addDir或事件檔之unlink，'content'代表檔案內容無法解析為非空物件；kind為監看事件之種類；evName為由檔名推得之事件名稱)，'emit'時為即將對本程序之監聽器派發一個事件(含evName為事件名稱；不含事件內容)，'clear'時為clear被呼叫(僅首次)；clear後不再通知；回調不帶接收者呼叫，其拋錯與回傳值皆忽略，不影響事件傳遞，預設null
 * @returns {Object} 回傳事件物件，包含on、emit、clear函數，on可進行監聽指定事件，emit為跨程序發布事件(寫入事件檔案後由各程序之watcher接收再於本地派發)，clear為停止全部監聽，不須輸入。事件物件為原生EventEmitter(eventemitter3)。本模組於派發處以try攔截監聽器之同步拋錯故其不會使行程崩潰；惟依EventEmitter規範，同一次派發中先拋錯之監聽器會中止該次派發，其後之監聽器不再被呼叫。async監聽器之reject不被攔截(規範上emit不觀察監聽器回傳值)，須由監聽器自行處理，否則為unhandledRejection，監聽器出錯會改於本程序派發error事件{ fun: 'listener', name, msg, args }(僅本地不寫檔廣播)，無error監聽者則console.error；故事件名稱請避免使用'error'。emit寫入事件檔案失敗(如事件名稱為空字串致寫入目標為資料夾、資料夾無法寫入)時同步拋出Error物件，呼叫端須自行try
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

    //trace, 觀察回調(opt.onTrace), 未給時為null
    let trace = getTrace(opt)

    //cleared, 是否已clear, 供trace於clear後不再通知
    let cleared = false

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

        //trace
        if (trace && !cleared) {
            trace('write', { evName })
        }

    }

    //optWatch
    let optWatch = {
        polling,
        timeInterval,
        timeBinaryInterval,
    }
    if (trace) {
        //僅轉為本函數之ready通知, 不轉傳內部fsWatchFolder之事件流
        optWatch.onTrace = (e) => {
            if (e.type === 'ready' && !cleared) {
                trace('ready', {})
            }
        }
    }

    //evl
    let evl = fsWatchFolder(fd, optWatch)

    //change
    evl.on('change', (msg) => {
        // console.log('fsWatchFolder change', msg.type, msg.fp)

        //check
        if (msg.type !== 'add' && msg.type !== 'change') {
            if (trace && !cleared) {
                trace('skip', { reason: 'kind', kind: msg.type, evName: getFileTrueName(msg.fp) })
            }
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
            if (trace && !cleared) {
                trace('skip', { reason: 'content', kind: msg.type, evName })
            }
            return
        }

        //emit
        ev.emit(evName, { [keySys]: content })

    })

    //clear
    let clear = () => {
        let first = !cleared
        cleared = true
        if (trace && first) {
            trace('clear', {})
        }
        evl.clear()
        fsDeleteFolder(fd)
    }

    //ev
    let ev = evem()
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

            //trace, 即將對本程序之監聽器派發
            if (trace && !cleared) {
                trace('emit', { evName: String(evName) })
            }

            //本地派發, 事件源於fsWatchFolder之change回呼故監聽器同步拋錯須於此攔截
            //  funEmit須指定為原生emt: 通報之error若走覆寫後之ev.emit會被寫成事件檔而廣播至各程序
            let self = this
            return evEmit(ev, evName, [pkg, time], {
                tag: 'fsEvem',
                funEmit: (nm, ...a) => {
                    return emt.call(self, nm, ...a)
                },
            })
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
