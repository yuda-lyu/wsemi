import fs from 'fs'
import path from 'path'
import assert from 'assert'
import fsTask from '../src/fsTask.mjs'
import { INVALID_EINT_EXTRA, INVALID_TIMER_OVER, captureTimers, defineOptParam } from './tools/optValKit.mjs'
import { defineOptParamAsync } from './tools/optValKitAsyncG3count.mjs'
import { traceRec } from './tools/timeKit.mjs'


//第221項第二批第2輪第3批(ws272c): fsTask之levelLimit與timeInterval改經iseint／isenum判定(R-OPT-VAL-01), 使用者2026-11-02定A:
//  levelLimit: iseint(use: 'count', min: 1), 非預期(含0、負數、小數、Infinity、'0x10'、包裝物件、null)改用預設1;
//  timeInterval: isenum(use: 'timer', gt: 0), 有效數字直接用小數、不再cint四捨五入(比照setTimeoutHp), Infinity、超過計時器上限、'0x10'改用預設60000(不夾至上限)
//  規格: dspec〈輸入參數之檢測機制〉K3、K4、§7.1、§11; 兩者皆為opt類參數(JSDoc [opt.levelLimit=1]、[opt.timeInterval=60000])


const root = path.resolve('./test/_tmp/optValG7fsTask')
let nCase = 0


//mkCase, 每案專用之資料夾: watch為監看夾(內有各層各1個檔, 共5層), _tkfs為儲存夾
function mkCase() {
    nCase++
    let base = path.join(root, `c${nCase}`)
    let watch = path.join(base, 'watch')
    let fdStorage = path.join(base, '_tkfs')
    let fd = watch
    fs.mkdirSync(watch, { recursive: true })
    for (let k = 1; k <= 5; k++) {
        fs.writeFileSync(path.join(fd, `f${k}.txt`), `level${k}`, 'utf8')
        fd = path.join(fd, `d${k}`)
        fs.mkdirSync(fd, { recursive: true })
    }
    return { watch, fdStorage }
}


describe(`optVal fsTask (ws272c)`, function() {

    this.timeout(60000)

    before(function() {
        fs.rmSync(root, { recursive: true, force: true })
        fs.mkdirSync(root, { recursive: true })
    })

    after(function() {
        fs.rmSync(root, { recursive: true, force: true })
        assert.strict.deepStrictEqual(fs.existsSync(root), false)
    })

    //levelLimit: 首次掃描(onTrace之scan end)所得檔案數即列舉層數(每層1個檔, 共5層)
    defineOptParamAsync({
        fn: 'fsTask',
        name: 'opt.levelLimit',
        def: 1,
        probe: async (v, extra = {}) => {
            let { watch, fdStorage } = mkCase()
            let tr = traceRec()
            let ev = fsTask(watch, { fdStorage, timeInterval: 20, levelLimit: v, onTrace: tr.on, ...extra })
            try {
                let e = await tr.wait((x) => x.type === 'scan' && x.phase === 'end')
                return e.files
            }
            finally {
                ev.clear()
            }
        },
        extraInvalid: [...INVALID_EINT_EXTRA, ['0', 0], [`'0'`, '0'], ['-1', -1], [`'-1'`, '-1'], ['4294967296', 4294967296]],
        valid: [
            ['1', 1, 1],
            ['2', 2, 2],
            ['3', 3, 3],
            ['5', 5, 5],
            [`'4'`, '4', 4],
            [`' 2 '`, ' 2 ', 2],
            [`'3.0'`, '3.0', 3],
            ['100 (deeper than the folder)', 100, 5],
        ],
    })

    //timeInterval: setInterval之毫秒; 小數直接使用不四捨五入(舊制cint: 1.4→1、2.5→3、0.4→0)
    defineOptParam({
        fn: 'fsTask',
        name: 'opt.timeInterval',
        def: 60000,
        probe: (v, extra = {}) => {
            let { watch, fdStorage } = mkCase()
            let { r: ev, calls } = captureTimers(() => fsTask(watch, { fdStorage, timeInterval: v, ...extra }))
            ev.clear()
            return calls.find((c) => c.kind === 'interval').ms
        },
        extraInvalid: [['0', 0], [`'0'`, '0'], ['-1', -1], [`'-1'`, '-1'], ['-0.5', -0.5], ...INVALID_TIMER_OVER],
        valid: [
            ['1', 1, 1],
            ['500', 500, 500],
            ['0.4 (formerly 0)', 0.4, 0.4],
            ['1.4 (formerly 1)', 1.4, 1.4],
            ['2.5 (formerly 3)', 2.5, 2.5],
            [`'7.5'`, '7.5', 7.5],
            [`'30'`, '30', 30],
            [`' 45 '`, ' 45 ', 45],
            ['2147483647', 2147483647, 2147483647],
        ],
    })

    it(`should use the default 60000 for Infinity and 2147483648 instead of clamping them to the timer limit 2147483647`, function() {
        for (let v of [Infinity, 2147483648, '0x10', 1e21]) {
            let { watch, fdStorage } = mkCase()
            let { r: ev, calls } = captureTimers(() => fsTask(watch, { fdStorage, timeInterval: v }))
            ev.clear()
            assert.strict.deepStrictEqual(calls.filter((c) => c.kind === 'interval').map((c) => c.ms), [60000], String(v))
        }
    })

    it(`should not take levelLimit null as unlimited depth (null is not expected, the default 1 is used)`, async function() {
        let { watch, fdStorage } = mkCase()
        let tr = traceRec()
        let ev = fsTask(watch, { fdStorage, timeInterval: 20, levelLimit: null, onTrace: tr.on })
        try {
            let e = await tr.wait((x) => x.type === 'scan' && x.phase === 'end')
            assert.strict.deepStrictEqual(e.files, 1)
        }
        finally {
            ev.clear()
        }
    })

})
