import assert from 'assert'
import pmDebounce from '../src/pmDebounce.mjs'
import { runPmSettle } from './tools/pmSettleRun.mjs'
import { traceRec, useFakeClock } from './tools/timeKit.mjs'


describe(`pmDebounce`, function() {

    //test1之結果取決於各呼叫(1、200、600、900ms)與偵測鏈(20ms偵測、300ms防抖等待)及任務(500ms)之先後, 時間本身即規格, 以假時鐘推進(R-TRACE-01 P5); 原以真實計時器與2000ms之快照, 負載下偵測鏈遲到即使c先於b啟動入列而改變內容, 或使快照缺筆
    //settled, 假時鐘推進完畢後取結果: 假時鐘不會自行前進, 若尚未完成則拋錯, 不直接await以免懸置(並使假時鐘無法restore)
    async function settled(p) {
        let done = false
        let pp = p.then((v) => {
            done = true
            return v
        }, (e) => {
            done = true
            throw e
        })
        pp.catch(() => {})
        await new Promise((resolve) => setImmediate(resolve)) //真實setImmediate讓出, 使已可進行之microtask全數執行
        if (!done) {
            throw new Error('not settled within the advanced fake time')
        }
        return pp
    }

    //runFake, 啟用假時鐘執行test並推進ms毫秒, 回傳其結果; onTrace給時改以包裝函數加記假時鐘之時間於at
    async function runFake(test, ms, onTrace, at) {
        let clock = useFakeClock()
        try {
            let on = onTrace
            if (at && typeof onTrace === 'function') {
                on = (e) => {
                    at.push(Date.now())
                    return onTrace(e)
                }
            }
            let p = test(on)
            await clock.advance(ms)
            return await settled(p)
        }
        finally {
            clock.restore()
        }
    }

    async function test1(onTrace) {
        return new Promise((resolve, reject) => {
            let ms = []

            let dbc = pmDebounce(300, { onTrace })

            let i = 0
            let d = 100
            if (true) {
                // console.log(i, 'ms')
                let t = setInterval(() => { //dbc內時間比較快
                    i += d
                    // if (i % 100 === 0) {
                    //     console.log(i, 'ms')
                    // }
                    if (i >= 2000) {
                        clearInterval(t)
                        resolve(ms)
                    }
                }, d)
            }

            // let i = 0
            // let d = 100
            // setTimeout(() => {
            //     let t = setInterval(() => {
            //         i += d
            //         // console.log(i, 'ms')
            //         if (i >= 2000) {
            //             clearInterval(t)
            //             resolve(ms)
            //         }
            //     }, d)
            // }, 1)

            let n = 0
            function test(rin) {
                // console.log(i, 'ms', 'test in:', rin)
                ms.push(`test in: ${rin}`)
                return new Promise(function(resolve, reject) {
                    setTimeout(() => {
                        n++
                        let rout = `${rin}:${n}`
                        // console.log(i, 'ms', 'test out:', rout)
                        ms.push(`test out: ${rout}`)
                        resolve(rout)
                    }, 500)
                })
            }

            if (true) {

                setTimeout(() => {
                    dbc(async(inp) => {
                        return test(inp)
                    }, 'a') //無阻攔時1->300發呆, 300->800執行
                }, 1)
                //1ms, a進入排程, 但a尚未發呆300ms, 故a無法執行
                setTimeout(() => {
                    dbc(async(inp) => {
                        return test(inp)
                    }, 'b') //無阻攔時200->500發呆, 500->1000執行
                }, 200)
                //200ms, b進入排程, 同時排程前面還有a, 故只會取最末b出來判識(a被強制剔除), 因b尚未發呆完300ms故b無法執行
                setTimeout(() => {
                    dbc(async(inp) => {
                        return test(inp)
                    }, 'c') //無阻攔時600->900發呆, 900->1400執行
                }, 600)
                //500ms, b已發呆完開始執行
                //600ms, c進入排程, 因b已於500ms開始執行(b執行為500->1000), c進入排程只能等待
                setTimeout(() => {
                    dbc(async(inp) => {
                        return test(inp)
                    }, 'd') //無阻攔時900->1200發呆, 1200->1700執行
                }, 900)
                //900ms, d進入排程, 因b執行尚未結束, d雖可進入排程, 同時排程前面還有c, 故c與d皆為等待, 發呆時間自最後一次調用(d, 900ms)起算
                //1000ms, b已執行完, 取最末d出來判識(c被強制剔除), 此時d僅發呆100ms(900->1000)未滿300ms, 故再等剩餘200ms
                //1200ms, d已發呆滿300ms(900->1200), 開始執行(d執行為1200->1700)
                //1700ms, d執行完

            }
            //0 ms
            //100 ms
            //200 ms
            //300 ms
            //400 ms
            //400 ms test in: b
            //500 ms
            //600 ms
            //700 ms
            //800 ms
            //900 ms
            //900 ms test out: b:1
            //1000 ms
            //1100 ms
            //1200 ms
            //1200 ms test in: d
            //1300 ms
            //1400 ms
            //1500 ms
            //1600 ms
            //1700 ms
            //1700 ms test out: d:2
            //1800 ms
            //1900 ms
            //2000 ms

        })

    }
    // let ms = await test1()
    // console.log(ms)
    // => [ 'test in: b', 'test out: b:1', 'test in: d', 'test out: d:2' ]
    let r1 = ['test in: b', 'test out: b:1', 'test in: d', 'test out: d:2']
    //fmt, 事件轉為簡式字串: push1(排入後之佇列長度)、run-1(被捨棄之較早任務數)、done、done!(失敗)、start、stop
    let fmt = (e) => {
        if (e.type === 'push') {
            return `push${e.size}`
        }
        if (e.type === 'run') {
            return `run-${e.dropped}`
        }
        if (e.type === 'done') {
            return `done${e.ok ? '' : '!'}`
        }
        return e.type
    }

    it(`should return '${r1}' when run test1'`, async function() {
        let tr = traceRec()
        let at = []
        let ms = await runFake(test1, 2000, tr.on, at)
        assert.strict.deepStrictEqual(ms, r1)
        //觀察回調: a(1ms)與b(200ms)先後排入, 偵測鏈於b之後逾300ms未有調用時只執行最後之b(捨棄a); b執行中(500ms)時c(600ms)、d(900ms)排入而等待, b完成後逾300ms未有調用時只執行最後之d(捨棄c); 佇列空後停止偵測; 共2次執行(d於2000ms前完成)
        assert.strict.deepStrictEqual(tr.events.map(fmt), ['push1', 'start', 'push2', 'run-1', 'push1', 'push2', 'done', 'run-1', 'done', 'stop'])
        //防抖等待(300ms)之時間規格(JSDoc ms「未有調用的時間區間」: 防抖時間自最後一次調用起算, 任務執行中進來之調用亦計入): 執行(run)時與其前最後一次排入(第1次為b之200ms, 第2次為d之900ms)之間隔須逾300ms且不逾300ms加一個偵測週期(20ms); 即d於1200ms起一個偵測週期內執行, 不因b於1000ms完成而重新起算(重新起算則約1320ms才執行)
        //事件索引: 0 push(a,1ms)、1 start、2 push(b,200ms)、3 run、4 push(c,600ms)、5 push(d,900ms)、6 done、7 run、8 done、9 stop
        let tPushB = at[2]
        let tRun1 = at[3]
        let tPushC = at[4]
        let tPushD = at[5]
        let tDone1 = at[6]
        let tRun2 = at[7]
        assert.strict.deepStrictEqual([tPushB, tRun1 - tPushB > 300 && tRun1 - tPushB <= 320, tPushD, tRun2 - tPushD > 300 && tRun2 - tPushD <= 320, tRun2 >= 1200 && tRun2 <= 1220], [200, true, 900, true, true])
        //b於約1000ms完成時d僅閒置約100ms(未滿300ms), 故完成後仍須等剩餘時間才執行d
        assert.strict.deepStrictEqual([tDone1 - tPushD < 300, tRun2 > tDone1], [true, true])
        //執行不重疊: 第1次任務(500ms)完成前不執行第2次, 且c、d排入(600、900ms)時第1次任務仍執行中(排入而等待)
        assert.strict.deepStrictEqual([tDone1 - tRun1 >= 500, tPushC > tRun1 && tPushC < tDone1, tPushD > tRun1 && tPushD < tDone1, tRun2 > tDone1], [true, true, true, true])
    })

    //runCalls, 假時鐘下依calls([虛擬時刻, 任務名])呼叫防抖(ms=300), 各任務耗時500ms, 推進total毫秒; 回傳{ got, ev }: got為被執行之任務名(依序), ev為各事件加上虛擬時刻at(Date.now())之陣列; 偵測每20ms取樣, 故任務最早於自最後一次調用起逾300ms後之下一次取樣執行
    async function runCalls(calls, total) {
        let tr = traceRec()
        let at = []
        let got = []
        await runFake((onTrace) => new Promise((resolve) => {
            let dbc = pmDebounce(300, { onTrace })
            for (let [t, name] of calls) {
                setTimeout(() => {
                    dbc(() => new Promise((resolve) => { //任務自己的resolve(遮蔽外層, 外層僅於下方使用)
                        setTimeout(() => {
                            got.push(name)
                            resolve(name)
                        }, 500)
                    }))
                }, t)
            }
            setTimeout(resolve, total)
        }), total, tr.on, at)
        return { got, ev: tr.events.map((e, i) => ({ ...e, at: at[i] })) }
    }
    let atOf = (ev, type) => ev.filter((e) => e.type === type).map((e) => e.at)

    it(`should run the last call at the next sample after the previous task ends when it has already been idle for ms`, async function() {
        //JSDoc ms「未有調用的時間區間」與pmDebounce說明「任務執行完畢時若自最後一次調用起已閒置滿ms，即於下一次偵測執行」: A(1ms)於321ms執行(耗時500ms)至821ms; B於執行中(401ms)排入, 完成時(821ms)已閒置420ms>=300ms, 故於下一次取樣(<=20ms內)即執行, 不再重新等300ms
        let { got, ev } = await runCalls([[1, 'A'], [401, 'B']], 2000)
        let push = atOf(ev, 'push')
        let run = atOf(ev, 'run')
        let done = atOf(ev, 'done')
        assert.strict.deepStrictEqual(got, ['A', 'B'])
        assert.strict.deepStrictEqual(ev.map((e) => e.type), ['push', 'start', 'run', 'push', 'done', 'run', 'done', 'stop'])
        //A自排入起逾300ms且不逾一個取樣週期即執行
        assert.strict.deepStrictEqual(run[0] - push[0] > 300 && run[0] - push[0] <= 320, true)
        //前提: A完成時B已閒置滿300ms
        assert.strict.deepStrictEqual(done[0] - push[1] > 300, true)
        //B於A完成後下一次取樣內執行(重新起算則約再等300ms)
        assert.strict.deepStrictEqual(run[1] >= done[0] && run[1] - done[0] <= 20, true)
    })

    it(`should wait only the remaining idle time after the previous task ends when it has been idle for less than ms`, async function() {
        //JSDoc 「未滿則只再等剩餘時間」: A(1ms)於321ms執行至821ms; C於執行中(601ms)排入, 完成時(821ms)僅閒置220ms<300ms, 故自C排入起逾300ms後之下一次取樣(921ms)執行, 而非自完成時重新起算(約1141ms)
        let { got, ev } = await runCalls([[1, 'A'], [601, 'C']], 2000)
        let push = atOf(ev, 'push')
        let run = atOf(ev, 'run')
        let done = atOf(ev, 'done')
        assert.strict.deepStrictEqual(got, ['A', 'C'])
        assert.strict.deepStrictEqual(ev.map((e) => e.type), ['push', 'start', 'run', 'push', 'done', 'run', 'done', 'stop'])
        //前提: A完成時C閒置未滿300ms
        assert.strict.deepStrictEqual(done[0] - push[1] < 300, true)
        //C自排入起逾300ms且不逾一個取樣週期即執行, 且在A完成之後
        assert.strict.deepStrictEqual(run[1] - push[1] > 300 && run[1] - push[1] <= 320, true)
        assert.strict.deepStrictEqual(run[1] > done[0], true)
    })

    it(`should restart the idle time at every call, including the calls made while a task is running`, async function() {
        //JSDoc 「防抖時間自最後一次調用起算，任務執行中進來之調用亦計入」: A(1ms)執行至821ms, 執行中B(401ms)、C(701ms)先後排入; 閒置自最後一次調用C起算, 故於C排入起逾300ms後之下一次取樣(1021ms)只執行C(捨棄B)
        let { got, ev } = await runCalls([[1, 'A'], [401, 'B'], [701, 'C']], 1700)
        let push = atOf(ev, 'push')
        let run = atOf(ev, 'run')
        assert.strict.deepStrictEqual(got, ['A', 'C'])
        assert.strict.deepStrictEqual(ev.filter((e) => e.type === 'run').map((e) => e.dropped), [0, 1])
        assert.strict.deepStrictEqual(run[1] - push[2] > 300 && run[1] - push[2] <= 320, true)
    })

    it(`should behave the same without onTrace, with a recording onTrace, and with a throwing, rejecting or invalid onTrace`, async function() {
        //R-TRACE-01 P3: 未傳觀察回調時之對外行為不變(第2參數可省略, 同舊版之pmDebounce(ms)); P4: 回調之拋錯與回傳值不影響去除抖動、不產生未處理之rejection; 以假時鐘使各次之時序相同
        let un = []
        let onUn = (v) => un.push(String(v))
        process.on('unhandledRejection', onUn)
        let rs = []
        try {
            let rec = traceRec()
            for (let onTrace of [undefined, rec.on, () => {
                throw new Error('trace boom')
            }, () => Promise.reject(new Error('trace reject')), 'abc']) {
                rs.push(await runFake(test1, 2000, onTrace))
            }
            //省略第2參數
            let clock = useFakeClock()
            try {
                let got = []
                let dbc = pmDebounce(50)
                dbc((v) => got.push(v), 'x')
                dbc((v) => got.push(v), 'y')
                await clock.advance(100)
                rs.push(got)
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
        assert.strict.deepStrictEqual([rs, un], [[r1, r1, r1, r1, r1, ['y']], []])
    })

    it(`should notify push, start, run, done and stop through onTrace with frozen events of primitive fields and no receiver`, async function() {
        //JSDoc opt.onTrace: 事件為凍結物件{ type, ... }, 欄位依type列舉且皆為原始值; 回調不帶接收者呼叫(R-TRACE-01 P4: 唯讀快照、最少欄位、不暴露內部可變狀態)
        let meta = []
        let tr = traceRec()
        let clock = useFakeClock()
        try {
            let dbc = pmDebounce(50, {
                onTrace: function(e) {
                    meta.push([this, Object.isFrozen(e)])
                    tr.on(e)
                },
            })
            //x、y排入後只執行最後之y(失敗: 同步拋錯, 記錄於console.log), 其後z排入而執行(成功)
            let got = []
            let log = console.log
            console.log = () => {}
            try {
                //非函數不排入佇列(不通知push)
                dbc('notFun')
                dbc(() => got.push('x'))
                dbc(() => {
                    got.push('y')
                    throw new Error('boom')
                })
                await clock.advance(200)
                dbc(() => got.push('z'))
                await clock.advance(200)
            }
            finally {
                console.log = log
            }
            assert.strict.deepStrictEqual(got, ['y', 'z'])
        }
        finally {
            clock.restore()
        }
        assert.strict.deepStrictEqual(tr.events.map(fmt), ['push1', 'start', 'push2', 'run-1', 'done!', 'stop', 'push1', 'start', 'run-0', 'done', 'stop'])
        //各type之欄位固定(排序後)
        let keys = {}
        for (let e of tr.events) {
            keys[e.type] = Object.keys(e).sort().join(',')
        }
        assert.strict.deepStrictEqual(keys, { push: 'size,type', start: 'type', run: 'dropped,type', done: 'ok,type', stop: 'type' })
        //欄位皆為原始值(數字、字串、布林或null)
        assert.strict.deepStrictEqual(tr.events.every((e) => Object.values(e).every((v) => v === null || ['number', 'string', 'boolean'].includes(typeof v))), true)
        //事件為凍結物件, 回調不帶接收者(this為undefined)
        assert.strict.deepStrictEqual(meta.length > 0 && meta.every(([self, frozen]) => self === undefined && frozen), true)
    })

})


describe(`pmDebounce settle(R-PM-SETTLE-01)`, function() {

    it(`pmDebounce: 任務同步拋錯或回傳惡意值不產生uncaughtException, 失敗以console.log記錄, 後續任務照常, 呼叫無回傳值 [規則2、3、10、文件]`, function() {
        let { r } = runPmSettle('debounceSyncThrowThenNext')
        assert.strict.deepStrictEqual(r.out, { ret: 'undefined', next: true, next2: true, logged: 1 })
        assert.strict.deepStrictEqual(r.uncaught, [])
    })

    it(`exitDebounce: 任務失敗後計時器已釋放, 行程自然結束 [規則3、5]`, function() {
        //以是否被逾時終止判定(殘留之interval會使行程永不結束), 不以牆鐘門檻判定, 避免並行高負載誤判
        let { status, signal } = runPmSettle('exitDebounce', 'natural')
        assert.strict.deepStrictEqual({ status, signal }, { status: 0, signal: null })
    })

})


describe(`pmDebounce 非函數任務(R-PM-SETTLE-01規則12)`, function() {

    it(`非函數之任務不排入佇列, 回傳undefined並以console.log記錄'func is not a function', 已排入之任務照常執行 [規則12]`, function() {
        let { r } = runPmSettle('nonFunPmDebounce')
        //R-PM-SETTLE-01 規則12: pmDebounce回undefined並記錄(寫入JSDoc); JSDoc pmDebounce:17「輸入非函數時不排入佇列(不影響已排入之任務)，以console.log記錄'func is not a function'」
        assert.strict.deepStrictEqual(r.out, { ret: 'undefined', ran: true, logged: 1 })
        //R-PM-SETTLE-01 規則2
        assert.strict.deepStrictEqual({ unhandled: r.unhandled, uncaught: r.uncaught }, { unhandled: [], uncaught: [] })
    })

})
