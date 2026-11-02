import fs from 'fs'
import assert from 'assert'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import pmTimeout from '../src/pmTimeout.mjs'
import waitFun from '../src/waitFun.mjs'
import execProcess from '../src/execProcess.mjs'
import { defineOptParamAsync, defineWarnEach, INVALID_WARN } from './tools/optValKitAsyncG3count.mjs'
import { INVALID_EINT_EXTRA, INVALID_TIMER_OVER } from './tools/optValKit.mjs'
import * as K from './tools/optValG5Kit.mjs'
import { traceRec } from './tools/timeKit.mjs'


//第221項第二批第2輪(ws272a, 計時與流程類) 19個函數之opt類(及必須參數pmTimeout.ms)數值參數
//  規格: 主控dspec〈輸入參數之檢測機制〉§3.1 iseint/isenum、§7.1必須參數與opt類、K2、K3(opt類遇非預期之輸入視為未給、改用預設, 含超出範圍; opt.debug警告)、K4、§11(2026-10-31使用者裁定; Infinity一律非預期、改用預設, 語意反向者亦然, 第19、20、21項)
//  規則: sgud/rule/rulebook_optval.md R-OPT-VAL-01(opt類用src/_optVal.mjs)、R-ENUM-CALLERS-01(sgud/rule/rulebook_judge_sites_r1.md〈第 221 項第一批處置結果〉)
//  共用建構器: test/tools/optValKitAsyncG3count.mjs(defineOptParamAsync: 未給→預設; 共用無效輸入矩陣30項→預設; 額外無效→預設; 有效值→期望值; debug警告固定詞彙/不含值/每行程一次/funLog與console.warn/非布林debug不警告/funLog拋錯被吞)
//  探針: test/tools/optValG5Kit.mjs(以假計時器、假Date.now與二分搜尋、假時鐘逐週期推進求「實際採用之值」, 不靠真實等待)
//  修前行為(HEAD)對照: 夾至上限者改為預設(delay、waitFun.timeInterval、cacheSt、alive、evEmitDelay、execProcess、_execPortPids、fsWatchFolder), 語意反向者(Infinity)見各describe之「reverse」案


let __dirname = dirname(fileURLToPath(import.meta.url))
let root = join(__dirname, '_tmp', 'optValG5timerFlow')
let fdFolder = join(root, 'wfolder')


//--- 有效值與額外無效輸入(依參數性質) ---

//正整數計時毫秒(交給計時器, 1~2147483647, 整數): 有效值; 額外無效: 小數/精度遺失字串/非安全整數、超過上限(不夾至上限)、0、負數
const TIMER_VALID = [
    ['1', 1, 1],
    ['250', 250, 250],
    [`'250'`, '250', 250],
    [`' 30 ' (trimmed)`, ' 30 ', 30],
    [`'1e2'`, '1e2', 100],
    ['2147483647 (timer upper bound)', 2147483647, 2147483647],
    [`'2147483647'`, '2147483647', 2147483647],
]
const TIMER_INVALID_EXTRA = [
    ...INVALID_EINT_EXTRA,
    ...INVALID_TIMER_OVER,
    ['2147483648 (timer upper bound + 1)', 2147483648],
    ['0', 0],
    [`'0'`, '0'],
    ['-1', -1],
    [`'-1'`, '-1'],
    ['-0.5', -0.5],
    ['0.5', 0.5],
]

//正整數(只與時間差比較, 不交給計時器, 不設2147483647上限; 1~安全整數): 有效值含超過計時器上限者; 額外無效: 小數/精度遺失字串/非安全整數、0、負數
const POS_VALID = [
    ['1', 1, 1],
    ['250', 250, 250],
    [`'250'`, '250', 250],
    [`' 30 ' (trimmed)`, ' 30 ', 30],
    ['2147483647', 2147483647, 2147483647],
    ['2147483648 (over the timer cap: valid, it is only compared with an elapsed time)', 2147483648, 2147483648],
    [`'4294967296'`, '4294967296', 4294967296],
    ['1e15', 1e15, 1e15],
]
const POS_INVALID_EXTRA = [
    ...INVALID_EINT_EXTRA,
    ['0', 0],
    [`'0'`, '0'],
    ['-1', -1],
    [`'-1'`, '-1'],
    ['-0.5', -0.5],
    ['0.5', 0.5],
]

//個數(1~4294967295, 整數): 有效值(驅動逐週期推進, 不取大值); 額外無效: 小數/精度遺失字串/非安全整數、超過個數上限、0、負數
const COUNT_VALID = [
    ['1', 1, 1],
    ['7', 7, 7],
    [`'7'`, '7', 7],
    [`' 9 ' (trimmed)`, ' 9 ', 9],
    ['50', 50, 50],
]
const COUNT_INVALID_EXTRA = [
    ...INVALID_EINT_EXTRA,
    ['4294967296 (count upper bound + 1)', 4294967296],
    [`'4294967296'`, '4294967296'],
    ['Number.MAX_SAFE_INTEGER', Number.MAX_SAFE_INTEGER],
    ['1e21', 1e21],
    ['0', 0],
    [`'0'`, '0'],
    ['-1', -1],
    [`'-1'`, '-1'],
]

//並行上限(0~4294967295, 整數, 0=不限): 有效值; 額外無效: 負數、小數(舊版cint四捨五入為2, 現為非預期)、十六進位字串(舊版為3)、包裝物件、超過個數上限
const TAKE_VALID = [
    ['0 (unlimited)', 0, 0],
    ['1', 1, 1],
    ['2', 2, 2],
    ['5', 5, 5],
    [`'3'`, '3', 3],
    [`' 4 ' (trimmed)`, ' 4 ', 4],
]
const TAKE_INVALID_EXTRA = [
    ['-1', -1],
    [`'-1'`, '-1'],
    ['1.5 (old: cint rounded to 2)', 1.5],
    ['2.5', 2.5],
    [`'2.5'`, '2.5'],
    [`'0x3' (old: cint gave 3)`, '0x3'],
    ['new Number(2)', new Number(2)], // eslint-disable-line no-new-wrappers
    [`new String('2')`, new String('2')], // eslint-disable-line no-new-wrappers
    ['4294967296 (count upper bound + 1)', 4294967296],
]


//共用無效輸入中取代表者, 與各參數額外無效輸入一併驗「debug為true時每個非預期之輸入皆警告恰一次」(使「接受範圍放寬而結果恰與預設相同」之變異現形, 如內層函數再次檢測而遮蔽外層規則者)
const WARN_SHARED = INVALID_WARN.filter(([label]) => ['Infinity', `'0x10'`, `'abc'`, '{}', 'new Number(30)', 'NaN', 'true'].includes(label))

//defineParam: 逐參數宣告全部案例(未給→預設; 共用無效矩陣→預設; 額外無效→預設; 有效值→期望值; debug警告) + 每個非預期之輸入警告恰一次
function defineParam(spec) {
    defineOptParamAsync(spec)
    defineWarnEach({ fn: spec.fn, name: spec.name, probe: spec.probe, list: [...WARN_SHARED, ...(spec.extraInvalid || [])], title: spec.title })
}


describe('optVal timer/flow functions (ws272a)', function() {

    this.timeout(120000)

    before(function() {
        fs.rmSync(root, { recursive: true, force: true })
        fs.mkdirSync(fdFolder, { recursive: true })
    })

    after(async function() {
        await K.drainExec()
        fs.rmSync(root, { recursive: true, force: true })
        assert.strict.deepStrictEqual(fs.existsSync(root), false)
    })


    //--- delay ---

    describe('delay', function() {

        // opt類(位置參數, 預設10), isenum(use: 'timer'): 0~2147483647可帶小數, 非預期(含Infinity、負數、超過上限、'0x10')改用預設10, 不夾至上限
        defineParam({
            fn: 'delay',
            name: 'ms',
            def: 10,
            probe: K.delayMs,
            valid: [
                ['0', 0, 0],
                ['1.5 (decimal is valid)', 1.5, 1.5],
                ...TIMER_VALID,
            ],
            extraInvalid: [
                ['-1', -1],
                [`'-1'`, '-1'],
                ['-0.5', -0.5],
                ...INVALID_TIMER_OVER,
                ['2147483648 (timer upper bound + 1)', 2147483648],
            ],
        })

        it('reverse: delay(Infinity), delay(1e10) and delay(-5) now use the default 10ms (old: Infinity and 1e10 were clamped to 2147483647ms = 24.8 days, -5 became about 1ms)', async function() {
            for (let v of [Infinity, 1e10, -5, '0x10', 'Infinity']) {
                assert.strict.deepStrictEqual(await K.delayMs(v), 10, String(v))
            }
        })

    })


    //--- waitFun ---

    describe('waitFun', function() {

        // attemptNum: opt類(預設200), iseint(use: 'count', min: 1); Infinity語意反向(舊版永遠輪詢), 現用預設200
        defineParam({
            fn: 'waitFun',
            name: 'opt.attemptNum',
            def: 200,
            probe: K.waitFunAttempt,
            valid: COUNT_VALID,
            extraInvalid: COUNT_INVALID_EXTRA,
        })

        // timeInterval: opt類(預設1000), iseint(use: 'timer', min: 1), 取消夾限
        defineParam({
            fn: 'waitFun',
            name: 'opt.timeInterval',
            def: 1000,
            probe: K.waitFunInterval,
            valid: TIMER_VALID,
            extraInvalid: TIMER_INVALID_EXTRA,
        })

        it('reverse: attemptNum Infinity is 200 attempts (exceeded attemptNum[200] after 201 polls and 202 calls of fun), not endless polling', async function() {
            let calls = 0
            let msg = await K.stubTimersAsync(async (cs) => {
                let ref = { v: null }
                waitFun(() => {
                    calls++
                    return false
                }, { attemptNum: Infinity, timeInterval: 1 }).then(() => {
                    ref.v = 'res'
                }, (e) => {
                    ref.v = e
                })
                await K.flush()
                let iv = cs.find((c) => c.kind === 'interval')
                for (let i = 0; i < 400 && ref.v === null; i++) {
                    await iv.fn()
                    await K.flush()
                }
                return ref.v
            })
            assert.strict.deepStrictEqual(msg, 'exceeded attemptNum[200]')
            assert.strict.deepStrictEqual(calls, 202) //立即1次+輪詢201次(計數超過attemptNum後該次完成時判定)
        })

    })


    //--- debounce、pmDebounce ---

    for (let [fn, probe] of [['debounce', K.debounceMs], ['pmDebounce', K.pmDebounceMs]]) {
        describe(fn, function() {

            // ms: opt類(位置參數, 預設300), iseint(min: 1), 只與時間差比較(偵測週期固定), 不設計時器上限; Infinity語意反向(舊版永不觸發), 現用預設300
            defineParam({
                fn,
                name: 'ms',
                def: 300,
                probe,
                valid: POS_VALID,
                extraInvalid: POS_INVALID_EXTRA,
            })

            it('reverse: ms Infinity runs the task after the default 300ms (old: never ran)', async function() {
                assert.strict.deepStrictEqual(await probe(Infinity), 300)
            })

        })
    }


    //--- cache ---

    describe('cache', function() {

        // timeExpired: set/getProxy之逐key選項, opt類(預設5000), iseint(min: 1), 只與時間差比較; Infinity語意反向(舊版永不過期), 現用預設5000
        defineParam({
            fn: 'cache',
            name: 'opt.timeExpired',
            def: 5000,
            probe: K.cacheTimeExpired,
            valid: POS_VALID,
            extraInvalid: POS_INVALID_EXTRA,
        })

        it('reverse: timeExpired Infinity expires after the default 5000ms (old: never expired)', async function() {
            assert.strict.deepStrictEqual(await K.cacheTimeExpired(Infinity), 5000)
        })

    })


    //--- cacheSt ---

    describe('cacheSt', function() {

        // timeExpire: opt類(預設30分鐘), iseint(min: 1), 只與時間差比較
        defineParam({
            fn: 'cacheSt',
            name: 'opt.timeExpire',
            def: 1800000,
            probe: K.cacheStTimeExpire,
            valid: POS_VALID,
            extraInvalid: POS_INVALID_EXTRA,
        })

        // timeDetect: opt類(預設2000), iseint(use: 'timer', min: 1), 交給setInterval, 取消夾限
        defineParam({
            fn: 'cacheSt',
            name: 'opt.timeDetect',
            def: 2000,
            probe: K.cacheStTimeDetect,
            valid: TIMER_VALID,
            extraInvalid: TIMER_INVALID_EXTRA,
        })

        // waitExist與waitNotExist之optWait.attemptNum(預設30, use: 'count', min: 1)、optWait.timeInterval(預設100, use: 'timer', min: 1)
        for (let kind of ['waitExist', 'waitNotExist']) {

            defineParam({
                fn: 'cacheSt',
                name: 'optWait.attemptNum',
                title: `cacheSt ${kind} optWait.attemptNum`,
                def: 30,
                probe: K.cacheStWaitAttempt(kind),
                valid: COUNT_VALID,
                extraInvalid: COUNT_INVALID_EXTRA,
            })

            defineParam({
                fn: 'cacheSt',
                name: 'optWait.timeInterval',
                title: `cacheSt ${kind} optWait.timeInterval`,
                def: 100,
                probe: K.cacheStWaitInterval(kind),
                valid: TIMER_VALID,
                extraInvalid: TIMER_INVALID_EXTRA,
            })

        }

    })


    //--- cacheBd ---

    describe('cacheBd', function() {

        // nMax: opt類(預設200), iseint(use: 'count', min: 1); Infinity舊版近乎無限輪詢, 現用預設200
        defineParam({
            fn: 'cacheBd',
            name: 'opt.nMax',
            def: 200,
            probe: K.cacheBdNMax,
            valid: COUNT_VALID,
            extraInvalid: COUNT_INVALID_EXTRA,
        })

        // nTrigger: opt類(預設3), iseint(use: 'count', min: 1)
        defineParam({
            fn: 'cacheBd',
            name: 'opt.nTrigger',
            def: 3,
            probe: K.cacheBdNTrigger,
            valid: COUNT_VALID,
            extraInvalid: COUNT_INVALID_EXTRA,
        })

    })


    //--- alive ---

    describe('alive', function() {

        // timeAlive: opt類(預設10000), iseint(min: 1), 只與時間差比較; Infinity語意反向(舊版夾至上限24.8天), 現用預設10000
        defineParam({
            fn: 'alive',
            name: 'opt.timeAlive',
            def: 10000,
            probe: K.aliveTimeAlive,
            valid: POS_VALID,
            extraInvalid: POS_INVALID_EXTRA,
        })

        // timeDetect: opt類(預設50), iseint(use: 'timer', min: 1), 交給setInterval, 取消夾限
        defineParam({
            fn: 'alive',
            name: 'opt.timeDetect',
            def: 50,
            probe: K.aliveTimeDetect,
            valid: TIMER_VALID,
            extraInvalid: TIMER_INVALID_EXTRA,
        })

    })


    //--- evEmitDelay ---

    describe('evEmitDelay', function() {

        // ms: opt類(預設1), iseint(use: 'timer', min: 1), 取消夾限
        defineParam({
            fn: 'evEmitDelay',
            name: 'opt.ms',
            def: 1,
            probe: K.evEmitDelayMs,
            valid: TIMER_VALID,
            extraInvalid: TIMER_INVALID_EXTRA,
        })

    })


    //--- pmTimeout(必須參數) ---

    describe('pmTimeout ms (required parameter)', function() {

        // 必須參數: 有效整數且在0~2147483647(iseint, use: 'timer'), 非預期(含Infinity、超過上限、'0x10')reject固定訊息(不帶輸入值, dspec K9/V20; ws272b起), 不夾至上限; 失敗通道維持現行(async函數throw=reject Error)
        const MSG_INVALID_MS = 'invalid ms: must be an integer within 0 to 2147483647'
        let VALID = [
            ['0', 0, 0],
            ['1', 1, 1],
            [`'30'`, '30', 30],
            [`' 30 ' (trimmed)`, ' 30 ', 30],
            [`'1e2'`, '1e2', 100],
            ['2147483647 (timer upper bound)', 2147483647, 2147483647],
        ]
        for (let [label, v, exp] of VALID) {
            it(`should start the timeout timer with ${exp}ms for valid ms ${label}`, async function() {
                let got = await K.stubTimersAsync(async (cs) => {
                    let r = await pmTimeout(Promise.resolve('ok'), v)
                    assert.strict.deepStrictEqual(r, 'ok')
                    return cs.filter((c) => c.kind === 'timeout').map((c) => c.ms)
                })
                assert.strict.deepStrictEqual(got, [exp])
            })
        }

        let INVALID_MS = [
            ['Infinity', Infinity],
            ['-Infinity', -Infinity],
            [`'Infinity'`, 'Infinity'],
            ['2147483648 (timer upper bound + 1; old: clamped)', 2147483648],
            [`'2147483648'`, '2147483648'],
            ['2 ** 40', 2 ** 40],
            ['Number.MAX_SAFE_INTEGER', Number.MAX_SAFE_INTEGER],
            ['1e21', 1e21],
            [`'0x10' (old: 16ms)`, '0x10'],
            [`'1e400'`, '1e400'],
            ['new Number(5) (old: accepted)', new Number(5)], // eslint-disable-line no-new-wrappers
            ['1.5', 1.5],
            ['-1', -1],
            [`''`, ''],
            [`'abc'`, 'abc'],
            ['null', null],
            ['undefined', undefined],
            ['NaN', NaN],
            ['true', true],
            ['{}', {}],
            ['[]', []],
        ]
        for (let [label, v] of INVALID_MS) {
            it(`should reject the fixed message 'invalid ms: must be an integer within 0 to 2147483647' (no value, no clamp, no timer) for invalid ms ${label}`, async function() {
                let tr = traceRec()
                let timers = await K.stubTimersAsync(async (cs) => {
                    await assert.rejects(() => pmTimeout(Promise.resolve('ok'), v, { onTrace: tr.on }), (err) => err instanceof Error && err.message === MSG_INVALID_MS)
                    return cs.length
                })
                assert.strict.deepStrictEqual(timers, 0)
                assert.strict.deepStrictEqual(tr.events.map((e) => `${e.type}:${e.by}:${e.ok}`), ['settle:invalid:false'])
            })
        }

        it('reverse: ms Infinity and 1e10 now reject (old: clamped to 2147483647ms = 24.8 days and kept the timer)', async function() {
            await assert.rejects(() => pmTimeout(Promise.resolve('ok'), Infinity), { message: MSG_INVALID_MS })
            await assert.rejects(() => pmTimeout(Promise.resolve('ok'), 1e10), { message: MSG_INVALID_MS })
        })

        it('should not read opt.debug or warn: a required parameter reports an error (no default to warn about)', async function() {
            let logs = []
            await assert.rejects(() => pmTimeout(Promise.resolve('ok'), Infinity, { debug: true, funLog: (m) => logs.push(m) }), { message: MSG_INVALID_MS })
            assert.strict.deepStrictEqual(logs, [])
        })

    })


    //--- queue、pmQueue、pmMap ---

    for (let [fn, probe] of [['queue', K.queueTakeLimit], ['pmQueue', K.pmQueueTakeLimit], ['pmMap', K.pmMapTakeLimit]]) {
        describe(fn, function() {

            // takeLimit: opt類(位置參數, 預設0=不限), iseint(use: 'count'); Infinity語意相同(舊版1.8e308近乎不限, 現用預設0=不限)
            defineParam({
                fn,
                name: 'takeLimit',
                def: 0,
                probe,
                valid: TAKE_VALID,
                extraInvalid: TAKE_INVALID_EXTRA,
            })

            it('Infinity and 1e21 keep every task running at once (unlimited), same as the default 0', async function() {
                assert.strict.deepStrictEqual(await probe(Infinity), 0)
                assert.strict.deepStrictEqual(await probe(1e21), 0)
                assert.strict.deepStrictEqual(await probe(undefined), 0)
            })

        })
    }


    //--- execProcess ---

    describe('execProcess', function() {

        // timeout: opt類(預設null=不限時), isenum(gt: 0, use: 'timer'), 無效null; Infinity語意反向(舊版夾至24.8天之有限逾時), 現為不限時(不建立逾時計時器)
        defineParam({
            fn: 'execProcess',
            name: 'opt.timeout',
            def: null,
            probe: K.execProcessTimeout,
            valid: [
                ['1', 1, 1],
                ['0.5 (decimal is valid)', 0.5, 0.5],
                ['250', 250, 250],
                [`'250'`, '250', 250],
                [`' 30 ' (trimmed)`, ' 30 ', 30],
                ['2147483647 (timer upper bound)', 2147483647, 2147483647],
            ],
            extraInvalid: [
                ['0', 0],
                [`'0'`, '0'],
                ['-1', -1],
                [`'-1'`, '-1'],
                ['-0.5', -0.5],
                ...INVALID_TIMER_OVER,
                ['2147483648 (timer upper bound + 1)', 2147483648],
            ],
        })

        it('reverse: timeout Infinity or over the timer upper bound means no time limit (no timeout timer is created); old: a finite timeout clamped to 2147483647ms', async function() {
            for (let v of [Infinity, 1e10, 2147483648, '0x10', 0, -1]) {
                assert.strict.deepStrictEqual(await K.execProcessTimeout(v), null, String(v))
            }
        })

        it('a finite valid timeout still kills a long-running child and rejects timeout[Nms]', async function() {
            let tr = traceRec()
            let pm = execProcess(process.execPath, ['-e', 'setTimeout(() => {}, 60000)'], { timeout: 300, onTrace: tr.on })
            await assert.rejects(() => pm, (err) => typeof err === 'string' && /^timeout\[300ms\]:/.test(err))
            assert.strict.deepStrictEqual(tr.events.filter((e) => e.type === 'timeout').map((e) => e.ms), [300])
        })

    })


    //--- _execPortPids(execProcessPortPids、execProcessPortPidsSync 之 opt.timeout) ---

    describe('execProcessPortPids / execProcessPortPidsSync opt.timeout', function() {

        // timeout: opt類(預設10000), isenum(gt: 0, use: 'timer'), 小數無條件進位為整數(spawnSync須整數), 非預期(含Infinity、超過上限)改用預設, 不夾至上限
        defineParam({
            fn: 'execProcessPortPids',
            name: 'opt.timeout',
            def: 10000,
            probe: K.portPidsTimeout,
            valid: [
                ['1', 1, 1],
                ['300', 300, 300],
                [`'300'`, '300', 300],
                ['1500.5 (ceil)', 1500.5, 1501],
                [`'0.5' (ceil)`, '0.5', 1],
                [`' 30 ' (trimmed)`, ' 30 ', 30],
                ['2147483647 (timer upper bound)', 2147483647, 2147483647],
                ['2147483646.5 (ceil to the upper bound)', 2147483646.5, 2147483647],
            ],
            extraInvalid: [
                ['0', 0],
                [`'0'`, '0'],
                ['-5', -5],
                [`'-5'`, '-5'],
                ...INVALID_TIMER_OVER,
                ['2147483648 (timer upper bound + 1; old: clamped)', 2147483648],
                ['2 ** 40 (old: clamped)', 2 ** 40],
            ],
        })

    })


    //--- fsDeleteFileSafeCore、fsDeleteFolderSafeCore ---

    for (let [fn, probe] of [['fsDeleteFileSafeCore', K.fsDeleteFileNumRetry], ['fsDeleteFolderSafeCore', K.fsDeleteFolderNumRetry]]) {
        describe(fn, function() {

            // numRetry: opt類(預設5), iseint(use: 'count', min: 1); Infinity舊版近乎無限重試(每次等300ms), 現用預設5
            defineParam({
                fn,
                name: 'opt.numRetry',
                def: 5,
                probe,
                valid: COUNT_VALID,
                extraInvalid: COUNT_INVALID_EXTRA,
            })

        })
    }


    //--- fsWatchFolder ---

    describe('fsWatchFolder', function() {

        // timeInterval(預設100)、timeBinaryInterval(預設300): opt類, iseint(use: 'timer', min: 1; 交給chokidar須整數), 取消夾限, 比照fsWatchFile
        defineParam({
            fn: 'fsWatchFolder',
            name: 'opt.timeInterval',
            def: 100,
            probe: async (v, o = {}) => K.observeFsWatchFolder(fdFolder, { timeInterval: v, ...o }).si,
            valid: TIMER_VALID,
            extraInvalid: TIMER_INVALID_EXTRA,
        })

        defineParam({
            fn: 'fsWatchFolder',
            name: 'opt.timeBinaryInterval',
            def: 300,
            probe: async (v, o = {}) => K.observeFsWatchFolder(fdFolder, { timeBinaryInterval: v, ...o }).cb,
            valid: TIMER_VALID,
            extraInvalid: TIMER_INVALID_EXTRA,
        })

        it('should hand the same resolved timeInterval to the polling timer and to chokidar (interval); default 100 / 300; each parameter resolves independently', function() {
            // K4: 判定之值即使用之值
            assert.strict.deepStrictEqual(K.observeFsWatchFolder(fdFolder, {}), { si: 100, ci: 100, cb: 300 })
            assert.strict.deepStrictEqual(K.observeFsWatchFolder(fdFolder, { timeInterval: ' 40 ', timeBinaryInterval: '70' }), { si: 40, ci: 40, cb: 70 })
            assert.strict.deepStrictEqual(K.observeFsWatchFolder(fdFolder, { timeInterval: Infinity, timeBinaryInterval: 777 }), { si: 100, ci: 100, cb: 777 })
            assert.strict.deepStrictEqual(K.observeFsWatchFolder(fdFolder, { timeInterval: 55, timeBinaryInterval: '0x10' }), { si: 55, ci: 55, cb: 300 })
            assert.strict.deepStrictEqual(K.observeFsWatchFolder(fdFolder, { timeInterval: 0.5, timeBinaryInterval: 1.5 }), { si: 100, ci: 100, cb: 300 })
            //取消夾限: 超過上限不再夾成2147483647(timeInterval)或原樣溢位(timeBinaryInterval), 皆用預設
            assert.strict.deepStrictEqual(K.observeFsWatchFolder(fdFolder, { timeInterval: 2147483648, timeBinaryInterval: 2147483648 }), { si: 100, ci: 100, cb: 300 })
        })

    })


    //--- domRipple(最小假DOM, 只測參數解析路徑: 移除用setTimeout之毫秒與transition字串) ---

    describe('domRipple (fake DOM, parameter parsing path only)', function() {

        // timeDuration: opt類(預設1000), iseint(use: 'timer', min: 1; 交給setTimeout), 取消夾限(舊版超過上限使setTimeout以1ms觸發)
        defineParam({
            fn: 'domRipple',
            name: 'opt.timeDuration',
            def: 1000,
            probe: K.domRippleDuration,
            valid: TIMER_VALID,
            extraInvalid: TIMER_INVALID_EXTRA,
        })

        it('should use the resolved duration for both the removal timer and the css transition, and still create the effect timer (1ms) and the ripple element', async function() {
            let a = await K.domRippleRun(700)
            assert.strict.deepStrictEqual([a.ms, a.nTimers, a.transition], [700, 2, 'all 0.7s linear'])
            let b = await K.domRippleRun(Infinity) //舊版: Infinity通過ispint, 移除計時器以1ms觸發, transition為'all Infinitys linear'
            assert.strict.deepStrictEqual([b.ms, b.nTimers, b.transition], [1000, 2, 'all 1s linear'])
            let c = await K.domRippleRun(undefined)
            assert.strict.deepStrictEqual([c.ms, c.transition], [1000, 'all 1s linear'])
        })

    })

})
