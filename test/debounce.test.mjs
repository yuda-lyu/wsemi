import assert from 'assert'
import debounce from '../src/debounce.mjs'
import { runPmSettle } from './tools/pmSettleRun.mjs'
import { traceRec, useFakeClock } from './tools/timeKit.mjs'


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


describe(`debounce settle(R-PM-SETTLE-01)`, function() {

    it(`debounce: 非同步任務reject不產生未處理之rejection, 以console.log記錄一次, 後續任務照常 [規則2、3、10]`, function() {
        let { r } = runPmSettle('debounceAsyncReject')
        assert.strict.deepStrictEqual(r.out, { next: true, logged: 1 })
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

    it(`非函數之任務不排入佇列, 回傳undefined並以console.log記錄'func is not a function', 已排入之任務照常執行 [規則12]`, function() {
        let { r } = runPmSettle('nonFunDebounce')
        //R-PM-SETTLE-01 規則12: debounce回undefined並記錄(寫入JSDoc); JSDoc debounce:11「輸入非函數時不排入佇列(不影響已排入之任務)，以console.log記錄'func is not a function'」
        assert.strict.deepStrictEqual(r.out, { ret: 'undefined', ran: true, logged: 1 })
        //R-PM-SETTLE-01 規則2
        assert.strict.deepStrictEqual({ unhandled: r.unhandled, uncaught: r.uncaught }, { unhandled: [], uncaught: [] })
    })

})
