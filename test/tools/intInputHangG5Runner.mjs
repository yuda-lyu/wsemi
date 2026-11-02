//intInputHangG5Runner.mjs: 第221項第二批第2輪(ws272a)之「修前會不終止（或等24.8天）」案例之子行程執行器
//  修前: 計時毫秒為Infinity（或超過2147483647）者被夾至2147483647毫秒（約24.8天）、個數類為Infinity者近乎無限輪詢或重試、防抖時間為Infinity者永不觸發, 皆使呼叫端的Promise或事件永不到來;
//  修後: 一律視為非預期而改用預設（見sgud/rule/rulebook_optval.md R-OPT-VAL-01）, 於預設時間內完成
//  須於獨立子行程執行並加逾時, 不在mocha行程內跑（修前原碼會使mocha行程卡死或等24.8天）
//  被測實作固定為本檔往上兩層之src/（由本檔位置推得）
//  結果以一行'@@R@@'開頭之JSON（{ out }）輸出至stdout, 之後process.exit(0)
//用法: node test/tools/intInputHangG5Runner.mjs <caseName>
//測試端: import { runIntInputHangG5 } from './tools/intInputHangG5Runner.mjs'（本檔被匯入時不執行案例, 只在作為主程式執行時執行）
import fs from 'fs'
import os from 'os'
import path from 'path'
import { mock } from 'node:test'
import { fileURLToPath, pathToFileURL } from 'url'
import delay from '../../src/delay.mjs'
import waitFun from '../../src/waitFun.mjs'
import debounce from '../../src/debounce.mjs'
import pmDebounce from '../../src/pmDebounce.mjs'
import cacheBd from '../../src/cacheBd.mjs'
import cacheSt from '../../src/cacheSt.mjs'
import alive from '../../src/alive.mjs'
import evem from '../../src/evem.mjs'
import evEmitDelay from '../../src/evEmitDelay.mjs'
import pmTimeout from '../../src/pmTimeout.mjs'
import fsDeleteFileSafeCore from '../../src/fsDeleteFileSafeCore.mjs'
import fsDeleteFolderSafeCore from '../../src/fsDeleteFolderSafeCore.mjs'
import fsWatchFolder from '../../src/fsWatchFolder.mjs'
import { runChildCase } from './runChildCase.mjs'


let fpSelf = fileURLToPath(import.meta.url)

const realImmediate = setImmediate
const flush = () => new Promise((resolve) => realImmediate(resolve))

//注入式假fs: statSync/lstatSync使標的存在, unlinkSync/rmSync永遠拋EBUSY並計數
function mkBusyFs(op) {
    let st = { calls: 0 }
    let isFolder = op === 'rmSync'
    let fs = {
        statSync: () => ({}),
        lstatSync: () => ({
            isDirectory: () => isFolder,
            isFile: () => !isFolder,
            isSymbolicLink: () => false,
        }),
    }
    fs[op] = () => {
        st.calls++
        throw Object.assign(new Error('busy'), { code: 'EBUSY' })
    }
    return { fs, st }
}

//發生時刻以Date.now量測
async function timed(f) {
    let t0 = Date.now()
    let r = await f()
    return { ...r, ms: Date.now() - t0 }
}


let cases = {

    //delay: Infinity與超過上限, 修前夾至2147483647毫秒（約24.8天）, 修後用預設10毫秒
    'delay-inf': async () => {
        let r = await timed(async () => {
            await delay(Infinity)
            return {}
        })
        return { done: true, fast: r.ms < 2000 }
    },
    'delay-1e10': async () => {
        let r = await timed(async () => {
            await delay(1e10)
            return {}
        })
        return { done: true, fast: r.ms < 2000 }
    },

    //waitFun: attemptNum為Infinity, 修前永遠輪詢（不終止）, 修後用預設200次; timeInterval超過上限, 修前夾至24.8天, 修後用預設1000毫秒
    'waitFun-attempt-inf': async () => {
        let msg = await waitFun(() => false, { attemptNum: Infinity, timeInterval: 1 }).then(() => 'resolved', (e) => String(e))
        return { msg }
    },
    'waitFun-interval-2p40': async () => {
        let r = await timed(async () => {
            let msg = await waitFun(() => false, { attemptNum: 1, timeInterval: 2 ** 40 }).then(() => 'resolved', (e) => String(e))
            return { msg }
        })
        return { msg: r.msg, fast: r.ms < 6000 }
    },

    //debounce、pmDebounce: ms為Infinity, 修前永不觸發, 修後用預設300毫秒
    'debounce-ms-inf': async () => {
        let ran = await new Promise((resolve) => {
            let run = debounce(Infinity)
            run(() => resolve(true))
        })
        return { ran }
    },
    'pmDebounce-ms-inf': async () => {
        let ran = await new Promise((resolve) => {
            let run = pmDebounce(Infinity)
            run(async () => resolve(true))
        })
        return { ran }
    },

    //evEmitDelay: ms為Infinity, 修前夾至24.8天而監聽器永不被呼叫, 修後用預設1毫秒
    'evEmitDelay-ms-inf': async () => {
        let ev = evem()
        let got = await new Promise((resolve) => {
            ev.on('ev', () => resolve(true))
            evEmitDelay(ev, 'ev', [], { ms: Infinity })
        })
        return { got }
    },

    //pmTimeout: ms為Infinity, 修前夾至24.8天（pm永不落定則永遠等）, 修後立即reject
    'pmTimeout-inf': async () => {
        let msg = await pmTimeout(new Promise(() => {}), Infinity).then(() => 'resolved', (e) => String(e && e.message))
        return { msg }
    },

    //alive: timeDetect為Infinity, 修前夾至24.8天而離開永不被偵測, 修後用預設50毫秒
    'alive-detect-inf': async () => {
        let oAL = alive({ timeAlive: 5, timeDetect: Infinity })
        let leave = await new Promise((resolve) => {
            oAL.on('message', (m) => {
                if (m.eventName === 'leave') {
                    resolve(m.key)
                }
            })
            oAL.trigger('k', {})
        })
        oAL.clear()
        return { leave }
    },

    //cacheSt: timeDetect為Infinity, 修前夾至24.8天而過期key永不被刪, 修後用預設2000毫秒（以onTrace等第一次偵測）
    'cacheSt-detect-inf': async () => {
        let got = await new Promise((resolve) => {
            let cs = cacheSt({
                timeExpire: 1,
                timeDetect: Infinity,
                onTrace: (e) => {
                    if (e.type === 'expire') {
                        cs.clear()
                        resolve(e.key)
                    }
                },
            })
            cs.set('k', 1)
        })
        return { got }
    },

    //cacheBd: nMax為Infinity, 修前近乎無限輪詢（以假setTimeout逐1000毫秒推進仍永不落定, 此處不設輪數上限）, 修後用預設200次
    'cacheBd-nMax-inf': async () => {
        mock.timers.enable({ apis: ['setTimeout'] })
        let ref = { v: null }
        let bd = cacheBd(async () => {
            throw new Error('x')
        }, { nMax: Infinity })
        bd.getFromCache().then(() => {
            ref.v = 'resolved'
        }, (e) => {
            ref.v = String(e && e.message)
        })
        let n = 0
        while (ref.v === null) {
            await flush()
            mock.timers.tick(1000)
            n++
        }
        mock.timers.reset()
        return { msg: ref.v, ticks: n }
    },

    //fsDeleteFileSafeCore、fsDeleteFolderSafeCore: numRetry為Infinity, 修前近乎無限重試（每次等300毫秒）, 修後用預設5次
    'fsDeleteFile-numRetry-inf': async () => {
        let { fs, st } = mkBusyFs('unlinkSync')
        let r = await fsDeleteFileSafeCore('p', { fs, numRetry: Infinity }).then(() => 'resolved', (e) => String(e))
        return { r: r === 'resolved' ? r : 'rejected', calls: st.calls }
    },
    'fsDeleteFolder-numRetry-inf': async () => {
        let { fs, st } = mkBusyFs('rmSync')
        let r = await fsDeleteFolderSafeCore('p', { fs, numRetry: Infinity }).then(() => 'resolved', (e) => String(e))
        return { r: r === 'resolved' ? r : 'rejected', calls: st.calls }
    },

    //fsWatchFolder: timeInterval為Infinity, 修前夾至24.8天而週期輪詢不建立watcher, 修後用預設100毫秒（以onTrace等watch事件）
    'fsWatchFolder-interval-inf': async () => {
        let fd = fs.mkdtempSync(path.join(os.tmpdir(), 'wsemi-g5-'))
        try {
            let got = await new Promise((resolve) => {
                let ev = fsWatchFolder(fd, {
                    timeInterval: Infinity,
                    onTrace: (e) => {
                        if (e.type === 'watch') {
                            ev.clear()
                            resolve(true)
                        }
                    },
                })
            })
            return { got }
        }
        finally {
            fs.rmSync(fd, { recursive: true, force: true })
        }
    },
}


/**
 * 於獨立子行程執行本檔之一個案例並剖析其輸出
 *
 * @param {String} caseName 輸入案例名稱字串（本檔cases之鍵）
 * @param {Object} [opt={}] 輸入設定物件
 * @param {Number} [opt.timeout=12000] 輸入子行程逾時毫秒數
 * @returns {Object} 回傳案例回傳之物件（逾時或崩潰時拋出可判讀之錯誤, 修前不終止之案例即於此紅燈）
 */
function runIntInputHangG5(caseName, opt = {}) {
    let rc = runChildCase(fpSelf, caseName, { timeout: 12000, ...opt })
    return rc.r.out
}


async function main() {
    let name = process.argv[2]
    if (!Object.prototype.hasOwnProperty.call(cases, name)) {
        console.log('@@R@@' + JSON.stringify({ out: { runnerError: `unknown case ${name}` } }))
        process.exit(0)
    }
    let out = await cases[name]()
    console.log('@@R@@' + JSON.stringify({ out }))
    process.exit(0)
}


//僅作為主程式執行時才跑案例
if (process.argv[1] && pathToFileURL(path.resolve(process.argv[1])).href === import.meta.url) {
    main()
}


export { runIntInputHangG5 }
