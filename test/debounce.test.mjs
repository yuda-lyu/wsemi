import assert from 'assert'
import debounce from '../src/debounce.mjs'
import { runPmSettle } from './tools/pmSettleRun.mjs'
import { traceRec, useFakeClock } from './tools/timeKit.mjs'
import { SENT, mkRec, captureOut, mkFunLog, defineDiagSiteCases } from './tools/diagSiteKit.mjs'


describe(`debounce`, function() {

    //test1、test2之結果取決於呼叫之間隔與等待ms(300)之比較, 時間本身即規格, 以假時鐘推進(R-TRACE-01 P5); 原以真實計時器, 負載下呼叫延後即改變間隔
    //runFake, 啟用假時鐘執行test並推進ms毫秒, 回傳其結果
    async function runFake(test, ms, onTrace) {
        let clock = useFakeClock()
        try {
            let p = test(onTrace)
            await clock.advance(ms)
            return await p
        }
        finally {
            clock.restore()
        }
    }

    function test1(onTrace) {
        return new Promise((resolve, reject) => {
            let ms = []

            let dbc = debounce(300, { onTrace })

            let i = 0
            function core(name) {
                i++
                ms.push({ name, i })
                // console.log({ name, i })
            }

            setTimeout(function() {
                dbc(() => {
                    core('A')
                })
            }, 100)
            setTimeout(function() {
                dbc(() => {
                    core('B')
                })
            }, 200)
            setTimeout(function() {
                dbc(() => {
                    core('C')
                })
            }, 250)
            setTimeout(function() {
                dbc(() => {
                    core('D')
                })
            }, 350)
            setTimeout(function() {
                dbc(() => {
                    core('E')
                })
            }, 400)
            setTimeout(function() {
                resolve(ms)
            }, 800)
        })
    }
    // console.log('test1')
    // test1
    // { name: 'E', i: 1 }
    // [{"name":"E","i":1}]
    let r1 = '[{"name":"E","i":1}]'
    it(`should return '${r1}' when run test1'`, async function() {
        let tr = traceRec()
        let ms = await runFake(test1, 800, tr.on)
        // console.log(JSON.stringify(ms))
        assert.strict.deepStrictEqual(JSON.stringify(ms), r1)
        //觀察回調: 5次排入後只執行最後一個(捨棄4個), 佇列空後停止偵測
        assert.strict.deepStrictEqual(tr.events.map((e) => (e.type === 'push' ? `push${e.size}` : e.type === 'run' ? `run-${e.dropped}` : e.type)), ['push1', 'start', 'push2', 'push3', 'push4', 'push5', 'run-4', 'stop'])
    })

    function test2(onTrace) {
        return new Promise((resolve, reject) => {
            let ms = []

            let dbc = debounce(300, { onTrace })

            let i = 0
            function core(name) {
                i++
                ms.push({ name, i })
                // console.log({ name, i })
            }

            setTimeout(function() {
                dbc(() => {
                    core('A')
                })
            }, 50)
            setTimeout(function() {
                dbc(() => {
                    core('B')
                })
            }, 100)
            setTimeout(function() {
                dbc(() => {
                    core('C')
                })
            }, 150)
            setTimeout(function() {
                dbc(() => {
                    core('D')
                })
            }, 500)
            setTimeout(function() {
                dbc(() => {
                    core('E')
                })
            }, 550)
            setTimeout(function() {
                resolve(ms)
            }, 1400)
        })
    }
    // console.log('test2')
    // test2
    // { name: 'C', i: 1 }
    // { name: 'E', i: 2 }
    // [{"name":"C","i":1},{"name":"E","i":2}]
    let r2 = '[{"name":"C","i":1},{"name":"E","i":2}]'
    it(`should return '${r2}' when run test2'`, async function() {
        let tr = traceRec()
        let ms = await runFake(test2, 1400, tr.on)
        // console.log(JSON.stringify(ms))
        assert.strict.deepStrictEqual(JSON.stringify(ms), r2)
        //觀察回調: 前3次排入執行C(捨棄2個)後停止, 後2次排入重新開始偵測並執行E(捨棄1個)
        assert.strict.deepStrictEqual(tr.events.map((e) => (e.type === 'push' ? `push${e.size}` : e.type === 'run' ? `run-${e.dropped}` : e.type)), ['push1', 'start', 'push2', 'push3', 'run-2', 'stop', 'push1', 'start', 'push2', 'run-1', 'stop'])
    })

    it(`should behave the same without onTrace, with a recording onTrace, and with a throwing, rejecting or invalid onTrace`, async function() {
        //R-TRACE-01 P3: 未傳觀察回調時之對外行為不變(第2參數可省略, 同舊版之debounce(ms)); P4: 回調之拋錯與回傳值不影響去除抖動、不產生未處理之rejection; 以假時鐘使各次之時序相同
        let un = []
        let onUn = (v) => un.push(String(v))
        process.on('unhandledRejection', onUn)
        let rs = []
        try {
            let rec = traceRec()
            for (let onTrace of [undefined, rec.on, () => {
                throw new Error('trace boom')
            }, () => Promise.reject(new Error('trace reject')), 'abc']) {
                rs.push(JSON.stringify(await runFake(test1, 800, onTrace)) + JSON.stringify(await runFake(test2, 1400, onTrace)))
            }
            //省略第2參數
            let clock = useFakeClock()
            try {
                let got = []
                let dbc = debounce(50)
                dbc((v) => got.push(v), 'x')
                dbc((v) => got.push(v), 'y')
                await clock.advance(100)
                rs.push(JSON.stringify(got))
            }
            finally {
                clock.restore()
            }
            await new Promise((resolve) => setImmediate(resolve))
            assert.strict.deepStrictEqual(rec.events.length > 0, true)
        }
        finally {
            process.removeListener('unhandledRejection', onUn)
        }
        let r12 = r1 + r2
        assert.strict.deepStrictEqual([rs, un], [[r12, r12, r12, r12, r12, '["y"]'], []])
    })

})


describe(`debounce cancel`, function() {

    //cancel之規格(JSDoc debounce): 立即停止偵測(清除偵測計時器)並丟棄尚未執行之任務; 已開始執行之任務不受影響; 之後再呼叫則重新開始偵測; onTrace之'cancel'事件含dropped、stopped, 不另通知'stop'
    //時序以假時鐘推進(防抖之等待本身即規格, R-TRACE-01 P5), 同步點為觀察回調之事件

    let fmt = (e) => (e.type === 'push' ? `push${e.size}` : e.type === 'run' ? `run-${e.dropped}` : e.type === 'cancel' ? `cancel-${e.dropped}-${e.stopped}` : e.type)

    it(`should drop pending tasks and stop the detection timer immediately`, async function() {
        let clock = useFakeClock()
        try {
            let tr = traceRec()
            let got = []
            let dbc = debounce(300, { onTrace: tr.on })
            dbc((v) => got.push(v), 'A')
            await clock.advance(50)
            dbc((v) => got.push(v), 'B')
            await clock.advance(50)
            let r = dbc.cancel()
            //「丟棄尚未執行之任務」: 等待逾ms後A、B皆未執行; 「停止偵測」: 偵測計時器已清除, 其後不再有任何事件(未清除者會於佇列空時通知stop)
            await clock.advance(1000)
            assert.strict.deepStrictEqual({ r, got, ev: tr.events.map(fmt) }, { r: undefined, got: [], ev: ['push1', 'start', 'push2', 'cancel-2-true'] })
        }
        finally {
            clock.restore()
        }
    })

    it(`should release the detection timer synchronously (active Timeout count returns to the baseline)`, function() {
        //「立即停止偵測」: cancel返回時偵測之setInterval已清除(以本行程之進行中計時器數量測, 基準與比較皆在同一同步區段, 不等待)
        let count = () => process.getActiveResourcesInfo().filter((t) => t === 'Timeout').length
        let base = count()
        let dbc = debounce(300)
        dbc(() => {})
        let during = count()
        dbc.cancel()
        assert.strict.deepStrictEqual([during - base, count() - base], [1, 0])
    })

    it(`should not affect a task that has already started, and should drop the task pushed after it`, async function() {
        let clock = useFakeClock()
        try {
            let tr = traceRec()
            let got = []
            let release = null
            let gate = new Promise((resolve) => {
                release = resolve
            })
            let dbc = debounce(100, { onTrace: tr.on })
            dbc(async () => {
                got.push('A:start')
                await gate
                got.push('A:end')
            })
            //逐1ms推進至A開始執行(run事件), 於下一次偵測(10ms後)之前排入B再取消: A不受影響, B被丟棄
            for (let i = 0; i < 1000 && !tr.events.some((e) => e.type === 'run'); i++) {
                await clock.advance(1)
            }
            dbc(() => got.push('B'))
            dbc.cancel()
            release()
            await clock.advance(500)
            assert.strict.deepStrictEqual({ got, ev: tr.events.map(fmt) }, { got: ['A:start', 'A:end'], ev: ['push1', 'start', 'run-0', 'push1', 'cancel-1-true'] })
        }
        finally {
            clock.restore()
        }
    })

    it(`should restart detection when called again after cancel, and cancel without pending tasks only notifies`, async function() {
        let clock = useFakeClock()
        try {
            let tr = traceRec()
            let got = []
            let dbc = debounce(100, { onTrace: tr.on })
            //未有待執行者時取消: dropped為0、stopped為false
            dbc.cancel()
            dbc((v) => got.push(v), 'A')
            dbc.cancel()
            //取消後再呼叫: 如同初次呼叫重新排入並開始偵測, 逾ms後執行
            dbc((v) => got.push(v), 'C')
            await clock.advance(300)
            assert.strict.deepStrictEqual({ got, ev: tr.events.map(fmt) }, { got: ['C'], ev: ['cancel-0-false', 'push1', 'start', 'cancel-1-true', 'push1', 'start', 'run-0', 'stop'] })
        }
        finally {
            clock.restore()
        }
    })

    it(`should allow cancel inside the running task (the running task completes, detection stops without a stop event)`, async function() {
        let clock = useFakeClock()
        try {
            let tr = traceRec()
            let got = []
            let dbc = debounce(100, { onTrace: tr.on })
            dbc(() => {
                dbc.cancel()
                got.push('A')
            })
            await clock.advance(500)
            assert.strict.deepStrictEqual({ got, ev: tr.events.map(fmt) }, { got: ['A'], ev: ['push1', 'start', 'run-0', 'cancel-0-true'] })
        }
        finally {
            clock.restore()
        }
    })

    it(`should behave the same for cancel without onTrace, with a recording onTrace, and with a throwing, rejecting or invalid onTrace`, async function() {
        //R-TRACE-01 P3/P4: 未傳觀察回調時之對外行為不變; 回調之拋錯與回傳值不影響cancel、不產生未處理之rejection
        let un = []
        let onUn = (v) => un.push(String(v))
        process.on('unhandledRejection', onUn)
        let rs = []
        try {
            let rec = traceRec()
            for (let onTrace of [undefined, rec.on, () => {
                throw new Error('trace boom')
            }, () => Promise.reject(new Error('trace reject')), 'abc']) {
                let clock = useFakeClock()
                try {
                    let got = []
                    let dbc = debounce(100, { onTrace })
                    dbc((v) => got.push(v), 'A')
                    await clock.advance(20)
                    dbc.cancel()
                    dbc((v) => got.push(v), 'B')
                    await clock.advance(300)
                    rs.push(JSON.stringify(got))
                }
                finally {
                    clock.restore()
                }
            }
            await new Promise((resolve) => setImmediate(resolve))
            assert.strict.deepStrictEqual(rec.events.map(fmt), ['push1', 'start', 'cancel-1-true', 'push1', 'start', 'run-0', 'stop'])
        }
        finally {
            process.removeListener('unhandledRejection', onUn)
        }
        assert.strict.deepStrictEqual([rs, un], [Array(5).fill('["B"]'), []])
    })

})


describe(`debounce settle(R-PM-SETTLE-01)`, function() {

    it(`debounce: 非同步任務reject不產生未處理之rejection, 經getDiag出口以console.error記錄一次(label+安全摘要, 不含拋出值), 後續任務照常 [規則2、3、10; R-DIAG-01]`, function() {
        let { r } = runPmSettle('debounceAsyncReject')
        assert.strict.deepStrictEqual(r.out, { next: true, logged: 1, leaked: 0 })
        assert.strict.deepStrictEqual(r.unhandled, [])
    })

    it(`debounce: 記錄之值的檢視器會拋時亦不產生未處理之rejection [規則2]`, function() {
        let { r } = runPmSettle('debounceInspectThrows')
        assert.strict.deepStrictEqual(r.out, { next: true })
        assert.strict.deepStrictEqual(r.unhandled, [])
        assert.strict.deepStrictEqual(r.uncaught, [])
    })

})


describe(`debounce 非函數任務(R-PM-SETTLE-01規則12)`, function() {

    it(`非函數之任務不排入佇列, 回傳undefined並經getDiag出口以console.log記錄'[wsemi debounce] func is not a function', 已排入之任務照常執行 [規則12]`, function() {
        let { r } = runPmSettle('nonFunDebounce')
        //R-PM-SETTLE-01 規則12: debounce回undefined並記錄(寫入JSDoc); JSDoc debounce「輸入非函數時不排入佇列(不影響已排入之任務)，記錄'func is not a function'」(R-DIAG-01: 固定詞彙label)
        assert.strict.deepStrictEqual(r.out, { ret: 'undefined', ran: true, logged: 1 })
        //R-PM-SETTLE-01 規則2
        assert.strict.deepStrictEqual({ unhandled: r.unhandled, uncaught: r.uncaught }, { unhandled: [], uncaught: [] })
    })

})


//通報經getDiag出口(R-DIAG-01規則14; 建議書W3、W4: 任務拋出值與固定詞彙之記錄原樣console輸出, 洩漏權杖與資料值、且無法由使用端以funLog接管)
describe(`debounce 通報經getDiag出口(R-DIAG-01規則14)`, function() {

    //三態與形態表(站點W3同步拋錯、W3 reject、W4非函數)
    defineDiagSiteCases(['W3a', 'W3b', 'W4a'])

    //opt於建構時取快照(getDiag之規則): 建構後改動opt不影響已建立之去除抖動函數
    it(`opt.logDetail、opt.funLog於debounce()建構時取快照, 建構後改動opt不影響輸出`, async function() {
        let opt = { logDetail: false }
        let rec = mkRec()
        let cap = captureOut(rec)
        let clock = useFakeClock()
        try {
            let d = debounce(10, opt)
            opt.logDetail = true
            opt.funLog = mkFunLog(rec)
            d(() => {
                throw new Error(`token=${SENT}`)
            })
            await clock.advance(40)
        }
        finally {
            clock.restore()
            cap.restore()
        }
        await rec.wait(1)
        assert.strict.deepStrictEqual(rec.calls, [{ via: 'console.error', args: ['[wsemi debounce] task threw', { errType: 'Error' }] }])
    })

    it(`兩個debounce實例各帶不同funLog, 輸出各歸其funLog(互不串擾), console不輸出`, async function() {
        let r1 = mkRec()
        let r2 = mkRec()
        let rc = mkRec()
        let cap = captureOut(rc)
        let clock = useFakeClock()
        try {
            let d1 = debounce(10, { funLog: mkFunLog(r1) })
            let d2 = debounce(10, { funLog: mkFunLog(r2) })
            d1(() => {
                throw new Error('e1')
            })
            d2('not-a-function')
            d2(() => {
                throw new Error('e2')
            })
            await clock.advance(40)
        }
        finally {
            clock.restore()
            cap.restore()
        }
        await r1.wait(1)
        await r2.wait(2)
        assert.strict.deepStrictEqual(r1.calls.map((c) => [c.args[0], c.args[1]]), [['[wsemi debounce] task threw', { errType: 'Error' }]])
        assert.strict.deepStrictEqual(r2.calls.map((c) => [c.args[0], c.args[1]]), [['[wsemi debounce] func is not a function', undefined], ['[wsemi debounce] task threw', { errType: 'Error' }]])
        assert.strict.deepStrictEqual(rc.calls, [])
    })

    it(`opt為undefined、null、非物件時取預設(console輸出安全摘要), 不拋錯`, async function() {
        for (let opt of [undefined, null, 'abc', 5]) {
            let rec = mkRec()
            let cap = captureOut(rec)
            let clock = useFakeClock()
            try {
                let d = debounce(10, opt)
                d(() => {
                    throw new Error(`token=${SENT}`)
                })
                await clock.advance(40)
            }
            finally {
                clock.restore()
                cap.restore()
            }
            await rec.wait(1)
            assert.strict.deepStrictEqual(rec.calls, [{ via: 'console.error', args: ['[wsemi debounce] task threw', { errType: 'Error' }] }], String(opt))
        }
    })

    //記錄後之行為不變: 失敗之任務不影響後續任務(佇列照常), 仍僅記錄一次
    it(`任務失敗經診斷出口記錄後, 後續任務照常執行且各記錄一次`, async function() {
        let rec = mkRec()
        let ran = []
        let clock = useFakeClock()
        try {
            let d = debounce(10, { funLog: mkFunLog(rec) })
            d(() => {
                throw new Error('e1')
            })
            await clock.advance(40)
            d(() => {
                ran.push('ok')
            })
            await clock.advance(40)
            d(async () => {
                throw new Error('e2')
            })
            await clock.advance(40)
        }
        finally {
            clock.restore()
        }
        await rec.wait(2)
        assert.strict.deepStrictEqual([ran, rec.calls.map((c) => [c.via, c.args[0], c.args[1]])], [['ok'], [['funLog', '[wsemi debounce] task threw', { errType: 'Error' }], ['funLog', '[wsemi debounce] task threw', { errType: 'Error' }]]])
    })

})
