import fs from 'fs'
import assert from 'assert'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import fsEvem from '../src/fsEvem.mjs'
import fsWatchFile from '../src/fsWatchFile.mjs'
import { defineOptParam, INVALID_TIMER_OVER } from './tools/optValKit.mjs'
import { VALID_STR } from './tools/enumInputs.mjs'
import { resetWarned } from './tools/numOptKit.mjs'
import { stubTimers, withFakeChokidarSync } from './tools/optValG2fsexecKit.mjs'


//fsEvem、fsWatchFile 之 opt.timeInterval(預設100)、opt.timeBinaryInterval(預設300)(fsWatchFolder有下游站點, 屬第二級, 本輪不納入, 其測試不在此; fsEvem內部呼叫之fsWatchFolder為1.9.36原碼, 收到的是fsEvem已解析之有效值):
//  opt類參數, iseint(use: 'timer', min: 1, 正整數計時毫秒; 交給chokidar須為整數), 非預期(含Infinity、超出範圍、0、負數、小數)視為未給、改用預設, 不夾至上限(原fsWatchFile之timeInterval夾至2147483647、timeBinaryInterval不夾)
//  可觀察值: timeInterval為週期輪詢之setInterval毫秒(si)與交給chokidar.watch之interval(ci); timeBinaryInterval為交給chokidar.watch之binaryInterval(cb)
//  以假計時器與假chokidar.watch觀察, 手動呼叫一次輪詢回呼以建立(假)watcher, 不真的等待亦不監看
let __dirname = dirname(fileURLToPath(import.meta.url))
let root = join(__dirname, '_tmp', 'optValG2fsWatch')
let fdFolder = join(root, 'wfolder')
let fpFile = join(root, 'wfile.txt')
let fdEvem = join(root, 'evem')

let KINDS = ['fsEvem', 'fsWatchFile']


//observe, 建立被測函數(計時器與chokidar皆為假), 手動輪詢一次, 回傳 { si, ci, cb }; o為opt(fsEvem另帶fd)
function observe(kind, o) {
    return withFakeChokidarSync((ws) => {
        let ev
        let { calls } = stubTimers(() => {
            if (kind === 'fsEvem') {
                ev = fsEvem({ fd: fdEvem, ...o })
            }
            else {
                ev = fsWatchFile(fpFile, o)
            }
        })
        let iv = calls.filter((c) => c.kind === 'interval')
        assert.strict.deepStrictEqual(iv.length, 1) //週期輪詢恰一個
        iv[0].fn() //輪詢一次, 路徑存在, 建立(假)watcher
        ev.clear()
        assert.strict.deepStrictEqual(ws.length, 1)
        return { si: iv[0].ms, ci: ws[0].opts.interval, cb: ws[0].opts.binaryInterval }
    })
}


//有效計時毫秒(正數): [標籤, 輸入, 期望可觀察值], 另含共用有效字串(扣除非正者)
//  本組參數交給chokidar(其interval／binaryInterval經fs.watchFile須為uint32整數, 小數會使每個檔案回報ERR_OUT_OF_RANGE), 故為整數類: iseint(use: 'timer', min: 1), 小數視為非預期而改用預設(同HEAD之ispint行為); 獨立審查者指出
let timerValid = [
    ['1', 1, 1],
    ['250', 250, 250],
    [`'250'`, '250', 250],
    [`' 30 ' (trimmed)`, ' 30 ', 30],
    ['2147483647 (upper bound)', 2147483647, 2147483647],
    [`'2147483647'`, '2147483647', 2147483647],
    ...VALID_STR.filter(([, , n]) => n > 0 && Number.isInteger(n)),
]

//正整數計時毫秒另有之無效: 超出範圍(視為未給, 不夾至上限)、0與負數(min: 1)、小數(chokidar須為整數)
let timerExtraInvalid = [
    ...INVALID_TIMER_OVER,
    ['2147483648 (upper bound + 1)', 2147483648],
    ['0', 0],
    [`'0'`, '0'],
    ['-0', -0],
    ['-1', -1],
    [`'-1'`, '-1'],
    ['-0.5', -0.5],
    ['0.5 (decimal, chokidar needs an integer)', 0.5],
    ['1.5 (decimal)', 1.5],
    [`'100.5' (decimal)`, '100.5'],
    ...VALID_STR.filter(([, , n]) => n <= 0 || !Number.isInteger(n)).map(([l, v]) => [l, v]),
]


describe('optVal fsEvem / fsWatchFile', function() {

    before(function() {
        fs.rmSync(root, { recursive: true, force: true })
        fs.mkdirSync(fdFolder, { recursive: true })
        fs.writeFileSync(fpFile, 'x', 'utf8')
    })

    after(function() {
        fs.rmSync(root, { recursive: true, force: true })
        assert.strict.deepStrictEqual(fs.existsSync(root), false)
    })

    for (let kind of KINDS) {

        describe(`${kind}`, function() {

            defineOptParam({
                fn: kind,
                name: 'opt.timeInterval',
                def: 100,
                probe: (v, o = {}) => observe(kind, { timeInterval: v, ...o }).si,
                valid: timerValid,
                extraInvalid: timerExtraInvalid,
            })

            defineOptParam({
                fn: kind,
                name: 'opt.timeBinaryInterval',
                def: 300,
                probe: (v, o = {}) => observe(kind, { timeBinaryInterval: v, ...o }).cb,
                valid: timerValid,
                extraInvalid: timerExtraInvalid,
            })

            it('should hand the same resolved timeInterval to the polling timer and to chokidar (interval), and the default 100 / 300 when nothing is given', function() {
                // K4: 判定之值即使用之值; 兩處(計時器、chokidar)用同一個轉換值
                assert.strict.deepStrictEqual(observe(kind, {}), { si: 100, ci: 100, cb: 300 })
                assert.strict.deepStrictEqual(observe(kind, { timeInterval: ' 40 ', timeBinaryInterval: '70' }), { si: 40, ci: 40, cb: 70 })
                //小數: chokidar(fs.watchFile)須為整數, 視為非預期而改用預設(不可把小數交給chokidar, 否則每個檔案回報ERR_OUT_OF_RANGE)
                assert.strict.deepStrictEqual(observe(kind, { timeInterval: 0.5, timeBinaryInterval: 1.5 }), { si: 100, ci: 100, cb: 300 })
                assert.strict.deepStrictEqual(observe(kind, { timeInterval: 100.5, timeBinaryInterval: 300.5 }), { si: 100, ci: 100, cb: 300 })
            })

            it('should resolve timeInterval and timeBinaryInterval independently (an unexpected one does not affect the other)', function() {
                // K3: 各參數獨立改用自己的預設
                assert.strict.deepStrictEqual(observe(kind, { timeInterval: Infinity, timeBinaryInterval: 777 }), { si: 100, ci: 100, cb: 777 })
                assert.strict.deepStrictEqual(observe(kind, { timeInterval: 55, timeBinaryInterval: '0x10' }), { si: 55, ci: 55, cb: 300 })
                assert.strict.deepStrictEqual(observe(kind, { timeInterval: -1, timeBinaryInterval: 0 }), { si: 100, ci: 100, cb: 300 })
            })

            it('should no longer clamp to the timer upper bound: over the bound or Infinity uses the default (the old code clamped timeInterval to 2147483647 and passed timeBinaryInterval through unclamped)', function() {
                // 使用者2026-10-31: 計時值超過上限時, opt類改用預設(取消夾至TIMER_TIME_MAX)
                for (let v of [2147483648, 1e21, Number.MAX_SAFE_INTEGER, Infinity, '2147483648']) {
                    assert.strict.deepStrictEqual(observe(kind, { timeInterval: v, timeBinaryInterval: v }), { si: 100, ci: 100, cb: 300 })
                }
            })

            it('debug true should warn exactly once for each out-of-range or non-positive value at this level (not left to the inner function, which cannot warn)', function() {
                // K3 opt.debug: fsEvem把值轉交內部fsWatchFolder(其再判定會靜默改用預設), 故警告必須在本層(fsEvem)發出; 其餘兩者同理驗證非預期之各類(0、負數、超出範圍)皆警告
                for (let [key, name] of [['timeInterval', 'opt.timeInterval'], ['timeBinaryInterval', 'opt.timeBinaryInterval']]) {
                    for (let v of [0, '0', -1, 2147483648, 1e21, 0.5, '100.5']) { //小數亦非預期(chokidar須為整數)
                        resetWarned()
                        let logs = []
                        observe(kind, { [key]: v, debug: true, funLog: (msg, info) => logs.push(info) })
                        assert.strict.deepStrictEqual(logs, [{ fn: kind, reason: 'invalid', key: name }], `${key}=${String(v)}`)
                    }
                }
                resetWarned()
            })

            it('should treat wrapper objects, other-radix strings and non-numeric values as not given', function() {
                // K3: isenum拒收者(包裝物件、'0x10'、'0b11'、'0o7'、'1e400'、非數字)視為未給
                for (let v of [new Number(30), new String('30'), '0x10', '0b11', '0o7', '1e400', 'abc', '', true, [30], {}]) { // eslint-disable-line no-new-wrappers
                    assert.strict.deepStrictEqual(observe(kind, { timeInterval: v, timeBinaryInterval: v }), { si: 100, ci: 100, cb: 300 })
                }
            })

        })

    }

    it('fsWatchFile: opt given as null or a non-object uses the defaults without throwing', function() {
        // K3: opt本身非預期視為未給(讀取不拋錯)
        for (let kind of ['fsWatchFile']) {
            for (let o of [null, undefined, 'abc', 5, true]) {
                let r = withFakeChokidarSync((ws) => {
                    let ev
                    let { calls } = stubTimers(() => {
                        ev = fsWatchFile(fpFile, o)
                    })
                    calls[0].fn()
                    ev.clear()
                    return { si: calls[0].ms, ci: ws[0].opts.interval, cb: ws[0].opts.binaryInterval }
                })
                assert.strict.deepStrictEqual(r, { si: 100, ci: 100, cb: 300 }, `${kind} opt=${String(o)}`)
            }
        }
    })

    it('fsEvem hands the resolved values to the folder watcher, so the inner fsWatchFolder never warns again (a single warning from fsEvem)', function() {
        // 內部fsWatchFolder收到的是fsEvem已解析之有效值或預設, 不會重複警告
        resetWarned()
        let logs = []
        let funLog = (msg, info) => logs.push({ msg, info })
        observe('fsEvem', { timeInterval: 'abc', timeBinaryInterval: Infinity, debug: true, funLog })
        assert.strict.deepStrictEqual(logs.map((x) => x.info.fn), ['fsEvem', 'fsEvem'])
        assert.strict.deepStrictEqual(logs.map((x) => x.info.key), ['opt.timeInterval', 'opt.timeBinaryInterval'])
        resetWarned()
    })

})
