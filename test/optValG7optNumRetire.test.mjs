import fs from 'fs'
import path from 'path'
import assert from 'assert'
import fsDownloadFileVerify from '../src/fsDownloadFileVerify.mjs'
import { INVALID } from './tools/enumInputs.mjs'
import { INVALID_EINT_EXTRA, INVALID_TIMER_OVER } from './tools/optValKit.mjs'
import { defineOptParamAsync } from './tools/optValKitAsyncG3count.mjs'
import { useFakeClock } from './tools/timeKit.mjs'


//第221項第二批第2輪第3批(ws272c): _optNum退役, 其6個呼叫端(domDetect、domDrag、domDragPreview、domIsStable、fsDownloadFileVerifyCore、fsEnsureBinsCore, 19處)改用_optVal(R-OPT-VAL-01)
//  規格: dspec〈輸入參數之檢測機制〉K3(opt類遇非預期之輸入視為未給、改用預設, 含超出範圍; opt.debug警告)、K4(檢測之值即使用之值)、§7.1、§11(使用者2026-11-02定A: inf:'keep'移除, Infinity一律非預期)
//  本檔: fsDownloadFileVerify(Core)之maxAttempts、retryDelayMs、stallMs、totalMs四參數(以假fetch回503驅動, 觀察onRetry/onTrace所報之實際採用值);
//        domDetect、domIsStable、domDrag、domDragPreview之案例在各自之測試檔(使用其假DOM載具); fsEnsureBinsCore之manifestMs/extractMs在fsEnsureBins.test.mjs(假時鐘)
//  修前紅: 以tmp之HEAD副本(含_optNum)執行, Infinity/超界/'0x10'/包裝物件於修前被夾限或保留, 與預期之預設不同


const fdt = path.resolve('./test/_tmp/optValG7optNumRetire')
const EXP = { sha256: 'a'.repeat(64), size: 1 }


//dl, 以固定回503之假fetch呼叫fsDownloadFileVerify並記錄: calls為fetch次數, request為各次'request'事件(含stallMs與remainMs), 不連網
//  freeze為true時暫將performance.now固定(Core以之為單調時計), 使整體時限剩餘毫秒remainMs恰等於totalMs(免耗時之誤差), 結束必還原
async function dl(opt, freeze = false) {
    let calls = 0
    let request = []
    let onow = performance.now
    if (freeze) {
        performance.now = () => 1000
    }
    try {
        let pm = fsDownloadFileVerify('x://probe', path.join(fdt, 'o.bin'), EXP, {
            fetch: async () => {
                calls++
                return new Response('x', { status: 503 })
            },
            onTrace: (e) => {
                if (e.type === 'request') {
                    request.push({ stallMs: e.stallMs, remainMs: e.remainMs })
                }
            },
            ...opt,
        })
        try {
            await pm
        }
        catch (err) {
            //503重試用盡: 預期之失敗
        }
    }
    finally {
        performance.now = onow
    }
    return { calls, request }
}


//probeRetryDelay, 假時鐘下取第一次onRetry所報之delayMs(第1次重試前等待retryDelayMs*1); 取得即返回, 其後之等待在假時鐘內, 還原後丟棄
async function probeRetryDelay(v, extra = {}) {
    let clock = useFakeClock()
    try {
        let got = null
        let pm = fsDownloadFileVerify('x://probe', path.join(fdt, 'o.bin'), EXP, {
            fetch: async () => new Response('x', { status: 503 }),
            maxAttempts: 2,
            retryDelayMs: v,
            onRetry: (e) => {
                if (got === null) {
                    got = e.delayMs
                }
            },
            ...extra,
        })
        pm.catch(() => {})
        let isGot = () => got !== null
        for (let i = 0; i < 20000 && !isGot(); i++) {
            await new Promise((resolve) => setImmediate(resolve))
        }
        return got
    }
    finally {
        clock.restore()
    }
}


//remainOf, 第一次'request'事件之remainMs(單調時計凍結時恰等於整體時限totalMs)
function remainOf(r) {
    return r.request[0].remainMs
}


describe(`optVal fsDownloadFileVerify (ws272c, formerly _optNum)`, function() {

    this.timeout(60000)

    before(function() {
        fs.mkdirSync(fdt, { recursive: true })
    })

    after(function() {
        fs.rmSync(fdt, { recursive: true, force: true })
    })

    //maxAttempts: opt類參數(預設3), 有效整數且為個數(iseint, use: 'count', min: 1); 以fetch次數觀察(重試延遲給0使之即刻)
    defineOptParamAsync({
        fn: 'fsDownloadFileVerify',
        name: 'opt.maxAttempts',
        def: 3,
        probe: async (v, extra = {}) => {
            return (await dl({ maxAttempts: v, retryDelayMs: 0, ...extra })).calls
        },
        extraInvalid: [...INVALID_EINT_EXTRA, ['0', 0], ['-1', -1], ['4294967296', 4294967296]],
        valid: [
            ['1', 1, 1],
            ['2', 2, 2],
            ['5', 5, 5],
            [`'4'`, '4', 4],
            [`' 2 '`, ' 2 ', 2],
            [`'2.0'`, '2.0', 2],
            [`'1e1'`, '1e1', 10],
        ],
    })

    //retryDelayMs: opt類參數(預設1000), 有效數字且為計時毫秒(isenum, use: 'timer', 0~2147483647, 可帶小數), 非預期不夾至上限而改用預設
    defineOptParamAsync({
        fn: 'fsDownloadFileVerify',
        name: 'opt.retryDelayMs',
        def: 1000,
        probe: probeRetryDelay,
        extraInvalid: [['-1', -1], [`'-1'`, '-1'], ...INVALID_TIMER_OVER],
        valid: [
            ['0', 0, 0],
            ['7', 7, 7],
            ['0.5', 0.5, 0.5],
            [`'30'`, '30', 30],
            [`' 20 '`, ' 20 ', 20],
            ['500000', 500000, 500000], //須小於整體時限預設600000, 否則等待會超過整體時限而不重試(不報onRetry)
        ],
    })

    //stallMs: opt類參數(預設30000), 有效數字且為大於0之計時毫秒(isenum, use: 'timer', gt: 0); 以'request'事件所報之stallMs觀察
    defineOptParamAsync({
        fn: 'fsDownloadFileVerify',
        name: 'opt.stallMs',
        def: 30000,
        probe: async (v, extra = {}) => {
            return (await dl({ stallMs: v, maxAttempts: 1, ...extra })).request[0].stallMs
        },
        extraInvalid: [['0', 0], [`'0'`, '0'], ['-1', -1], [`'-1'`, '-1'], ...INVALID_TIMER_OVER],
        valid: [
            ['1', 1, 1],
            ['0.5', 0.5, 0.5],
            ['5000', 5000, 5000],
            [`'250'`, '250', 250],
            [`' 60 '`, ' 60 ', 60],
            ['2147483647', 2147483647, 2147483647],
        ],
    })

    //totalMs: opt類參數(預設600000), 有效數字且為大於0之計時毫秒(isenum, use: 'timer', gt: 0); 以第一次'request'事件之remainMs觀察(單調時計凍結, 恰等於totalMs)
    defineOptParamAsync({
        fn: 'fsDownloadFileVerify',
        name: 'opt.totalMs',
        def: 600000,
        probe: async (v, extra = {}) => {
            return remainOf(await dl({ totalMs: v, maxAttempts: 1, ...extra }, true))
        },
        extraInvalid: [['0', 0], [`'0'`, '0'], ['-1', -1], [`'-1'`, '-1'], ...INVALID_TIMER_OVER],
        valid: [
            ['1', 1, 1],
            ['0.5', 0.5, 0.5],
            ['5000', 5000, 5000],
            ['12345', 12345, 12345],
            [`'20000'`, '20000', 20000],
            [`' 30000 '`, ' 30000 ', 30000],
            ['86400000', 86400000, 86400000],
            ['2147483647', 2147483647, 2147483647],
        ],
    })

    //Infinity不夾至上限(舊_optNum timer: Infinity夾至2147483647), 而是改用預設
    it(`should use the defaults for Infinity of stallMs and totalMs instead of clamping them to the timer limit`, async function() {
        let r = await dl({ stallMs: Infinity, totalMs: Infinity, maxAttempts: 1 }, true)
        assert.strict.deepStrictEqual(r.request[0].stallMs, 30000)
        assert.strict.deepStrictEqual(remainOf(r), 600000)
    })

    it(`should not read INVALID inputs as valid (matrix sanity: ${INVALID.length} common invalid inputs are defined)`, function() {
        assert.ok(INVALID.length >= 30)
    })

})


describe(`_optNum retirement (ws272c)`, function() {

    it(`should have no src module that imports _optNum, and the module file itself is gone`, function() {
        let dirSrc = path.resolve('./src')
        let names = fs.readdirSync(dirSrc).filter((n) => n.endsWith('.mjs'))
        assert.ok(names.length > 300)
        assert.strict.deepStrictEqual(names.includes('_optNum.mjs'), false)
        let bad = names.filter((n) => fs.readFileSync(path.join(dirSrc, n), 'utf8').includes('_optNum'))
        assert.strict.deepStrictEqual(bad, [])
    })

    it(`should not keep the retired 'inf: keep' rule or the rule objects of _optNum in src`, function() {
        let dirSrc = path.resolve('./src')
        let names = fs.readdirSync(dirSrc).filter((n) => n.endsWith('.mjs'))
        let bad = names.filter((n) => /inf:\s*'keep'/.test(fs.readFileSync(path.join(dirSrc, n), 'utf8')))
        assert.strict.deepStrictEqual(bad, [])
    })

})
