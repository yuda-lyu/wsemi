import assert from 'assert'
import pmTimeout from '../src/pmTimeout.mjs'
import delay from '../src/delay.mjs'
import genPm from '../src/genPm.mjs'
import cst from '../src/_const.mjs'
import { runPmSettle } from './tools/pmSettleRun.mjs'
import { traceRec, useFakeClock } from './tools/timeKit.mjs'


describe(`pmTimeout`, function() {

    it(`sould resolve with the original value when pm settles first`, async function() {
        let r = await pmTimeout(delay(10).then(() => 'ok'), 1000)
        assert.strict.deepStrictEqual(r, 'ok')
    })

    it(`sould keep the original resolved value type`, async function() {
        let o = { a: 1, b: [2, 3] }
        let r = await pmTimeout(delay(10).then(() => o), 1000)
        assert.strict.deepStrictEqual(r, o)
    })

    it(`sould reject with a TIMEOUT error when pm exceeds ms`, async function() {
        let err = null
        try {
            await pmTimeout(delay(3000), 100)
        }
        catch (e) {
            err = e
        }
        // console.log('timeout err', err)
        assert.strict.deepStrictEqual(err instanceof Error, true)
        assert.strict.deepStrictEqual(err.message, 'timeout[100ms]')
        assert.strict.deepStrictEqual(err.code, 'TIMEOUT')
        assert.strict.deepStrictEqual(err.timeout, 100)
    })

    it(`sould reject soon after ms rather than waiting for pm to settle`, async function() {
        //確認確實是計時器勝出而非等pm自然結束
        let t0 = Date.now()
        try {
            await pmTimeout(delay(5000), 100)
        }
        catch (e) {
            //none
        }
        let dt = Date.now() - t0
        // console.log('dt', dt)
        assert.strict.deepStrictEqual(dt >= 100 && dt < 3000, true)
    })

    it(`sould prefix the error message with opt.label`, async function() {
        let err = null
        try {
            await pmTimeout(delay(3000), 100, { label: 'fetchUser' })
        }
        catch (e) {
            err = e
        }
        assert.strict.deepStrictEqual(err.message, 'fetchUser timeout[100ms]')
        assert.strict.deepStrictEqual(err.code, 'TIMEOUT')
    })

    it(`sould not leave a leading space in the message when opt.label is absent`, async function() {
        //label為空時不可加前綴, 否則訊息會出現多餘之前導空白
        for (let opt of [{}, { label: '' }, { label: null }, { label: 123 }, { label: [] }, null, 'invalid']) {
            let err = null
            try {
                await pmTimeout(delay(3000), 50, opt)
            }
            catch (e) {
                err = e
            }
            assert.strict.deepStrictEqual(err.message, 'timeout[50ms]')
        }
    })

    it(`sould pass through the rejection of pm itself`, async function() {
        //pm自身之錯誤須原樣傳出, 且code不為'TIMEOUT'故可與逾時區分
        let e0 = new Error('mine')
        let err = null
        try {
            await pmTimeout(delay(10).then(() => {
                throw e0
            }), 1000)
        }
        catch (e) {
            err = e
        }
        assert.strict.deepStrictEqual(err, e0)
        assert.strict.deepStrictEqual(err.code, undefined)
    })

    it(`sould pass through a non-Error rejection of pm itself`, async function() {
        let err = null
        try {
            await pmTimeout(Promise.reject('strErr'), 1000)
        }
        catch (e) {
            err = e
        }
        assert.strict.deepStrictEqual(err, 'strErr')
    })

    it(`sould accept ms of 0 and timeout on the next event loop`, async function() {
        let err = null
        try {
            await pmTimeout(delay(1000), 0)
        }
        catch (e) {
            err = e
        }
        assert.strict.deepStrictEqual(err.code, 'TIMEOUT')
        assert.strict.deepStrictEqual(err.message, 'timeout[0ms]')
    })

    it(`sould let an already resolved pm win even when ms is 0`, async function() {
        //已完成之Promise於microtask即settle, 早於setTimeout之macrotask
        let r = await pmTimeout(Promise.resolve('fast'), 0)
        assert.strict.deepStrictEqual(r, 'fast')
    })

    it(`sould clear the timer so a pending long timeout does not block the event loop`, async function() {
        //pm先完成時須clearTimeout, 否則60s計時器會佔住event loop
        //以本測試能於短時間內結束反證計時器確實被清除
        let t0 = Date.now()
        await pmTimeout(delay(20), 60000)
        let dt = Date.now() - t0
        assert.strict.deepStrictEqual(dt < 3000, true)
    })

    it(`sould not raise unhandled rejection when pm rejects after timeout`, async function() {
        //逾時落敗後pm自身之reject須仍被Promise.race內部handler接住
        let hit = []
        let fnHit = (r) => {
            hit.push(r)
        }
        process.on('unhandledRejection', fnHit)
        let pm = delay(150).then(() => {
            throw new Error('late fail')
        })
        try {
            await pmTimeout(pm, 30)
        }
        catch (e) {
            //none
        }
        await delay(400) //等pm自己reject後再觀察
        process.off('unhandledRejection', fnHit)
        // console.log('hit', hit)
        assert.strict.deepStrictEqual(hit.length, 0)
    })

    it(`sould reject with 'invalid pm' when pm is not a promise`, async function() {
        //pmTimeout為async function, 參數錯誤以rejection傳出而非同步throw
        for (let v of [null, undefined, 123, 'abc', [], {}, () => {}, { then: () => {} }]) {
            await assert.rejects(() => pmTimeout(v, 100), /^Error: invalid pm$/)
        }
    })

    it(`sould not throw synchronously when pm is invalid`, function() {
        //async function之保證: 呼叫當下不得同步throw, 否則.catch鏈式呼叫將接不到
        let r = null
        assert.doesNotThrow(() => {
            r = pmTimeout(null, 100)
        })
        assert.strict.deepStrictEqual(r instanceof Promise, true)
        r.catch(() => {}) //已驗證回傳型別, 消化該rejection避免unhandledRejection
    })

    it(`sould be catchable by chained .catch when pm is invalid`, function(done) {
        //pm*家族之JSDoc範例慣用.catch鏈式, 此處驗證該寫法確實可接到參數錯誤
        pmTimeout(null, 100)
            .then(() => {
                done(new Error('should not resolve'))
            })
            .catch((err) => {
                try {
                    assert.strict.deepStrictEqual(err.message, 'invalid pm')
                    done()
                }
                catch (e) {
                    done(e)
                }
            })
    })

    it(`sould be catchable by chained .catch when timeout occurs`, function(done) {
        pmTimeout(delay(3000), 50, { label: 'lb' })
            .then(() => {
                done(new Error('should not resolve'))
            })
            .catch((err) => {
                try {
                    assert.strict.deepStrictEqual(err.message, 'lb timeout[50ms]')
                    assert.strict.deepStrictEqual(err.code, 'TIMEOUT')
                    done()
                }
                catch (e) {
                    done(e)
                }
            })
    })

    it(`sould accept a promise generated by genPm`, async function() {
        let pm = genPm()
        setTimeout(() => pm.resolve('pmok'), 10)
        let r = await pmTimeout(pm, 1000)
        assert.strict.deepStrictEqual(r, 'pmok')
    })

    it(`sould reject with 'invalid ms[ms]' when ms is not a non-negative integer`, async function() {
        await assert.rejects(() => pmTimeout(Promise.resolve(), -1), /^Error: invalid ms\[-1\]$/)
        await assert.rejects(() => pmTimeout(Promise.resolve(), 1.5), /^Error: invalid ms\[1.5\]$/)
        await assert.rejects(() => pmTimeout(Promise.resolve(), 'abc'), /^Error: invalid ms\[abc\]$/)
        await assert.rejects(() => pmTimeout(Promise.resolve(), null), /^Error: invalid ms\[null\]$/)
        await assert.rejects(() => pmTimeout(Promise.resolve(), undefined), /^Error: invalid ms\[undefined\]$/)
        await assert.rejects(() => pmTimeout(Promise.resolve(), NaN), /^Error: invalid ms\[NaN\]$/)
    })

    it(`sould accept numeric string as ms`, async function() {
        let err = null
        try {
            await pmTimeout(delay(3000), '100')
        }
        catch (e) {
            err = e
        }
        assert.strict.deepStrictEqual(err.code, 'TIMEOUT')
    })

    it(`sould validate pm before ms`, async function() {
        //pm之檢核置於ms之前, 二者皆無效時傳出之訊息須為pm者
        await assert.rejects(() => pmTimeout(null, -1), /^Error: invalid pm$/)
    })

    it(`sould not start a timer when the arguments are invalid`, async function() {
        //參數檢核置於setTimeout之前, 故參數無效時不得留下計時器
        //以本測試能立即結束反證: 若誤在檢核前就建立60s計時器, mocha將被卡住至逾時
        await assert.rejects(() => pmTimeout(null, 60000), /^Error: invalid pm$/)
        await assert.rejects(() => pmTimeout(Promise.resolve(), -1), /^Error: invalid ms\[-1\]$/)
    })

    //以下為觀察回調(opt.onTrace)之案(R-TRACE-01): 逾時門檻本身即規格, 以假時鐘推進(時間只由advance推進, 不受負載影響)
    //scenarios, 各情境於假時鐘下執行並推進, 回傳pmTimeout之結果[狀態, 值]; opt為傳給pmTimeout之第3參數
    let toR = (p) => p.then((v) => ['resolve', v], (e) => ['reject', e instanceof Error ? `${e.code}:${e.message}` : e])
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
    let scenarios = {
        //pm於60ms先完成(逾時門檻100ms)
        pmFirst: async(clock, opt) => {
            let pm = genPm()
            let p = toR(pmTimeout(pm, 100, opt))
            setTimeout(() => pm.resolve('ok'), 60)
            await clock.advance(200)
            return settled(p)
        },
        //pm於101ms才完成(逾時門檻100ms): 門檻之邊界, 逾時勝出
        timeoutFirst: async(clock, opt) => {
            let pm = genPm()
            let p = toR(pmTimeout(pm, 100, opt))
            setTimeout(() => pm.resolve('late'), 101)
            await clock.advance(200)
            return settled(p)
        },
        //pm於99ms完成(逾時門檻100ms): 門檻之邊界, pm勝出
        pmJustBefore: async(clock, opt) => {
            let pm = genPm()
            let p = toR(pmTimeout(pm, 100, opt))
            setTimeout(() => pm.resolve('ok'), 99)
            await clock.advance(200)
            return settled(p)
        },
        //pm於30ms先reject
        pmReject: async(clock, opt) => {
            let pm = genPm()
            let p = toR(pmTimeout(pm, 100, opt))
            setTimeout(() => pm.reject('strErr'), 30)
            await clock.advance(200)
            return settled(p)
        },
        //參數無效
        invalidPm: async(clock, opt) => toR(pmTimeout(null, 100, opt)),
        invalidMs: async(clock, opt) => toR(pmTimeout(Promise.resolve(), -1, opt)),
    }
    //go, 啟用假時鐘執行情境name, 回傳{ r, events, at }: at為各事件發生時之假時鐘時間(ms)
    async function go(name, optBase = {}, useOnTrace = true) {
        let clock = useFakeClock()
        try {
            let tr = traceRec()
            let at = []
            let opt = optBase
            if (useOnTrace) {
                opt = {
                    ...optBase,
                    onTrace: (e) => {
                        at.push(Date.now())
                        tr.on(e)
                    },
                }
            }
            let r = await scenarios[name](clock, opt)
            return { r, events: tr.events, at }
        }
        finally {
            clock.restore()
        }
    }
    //fmt, 事件轉為簡式字串: start100(逾時毫秒數)、timeout100、settle:pm:ok(settle之by與ok)
    let fmt = (e) => (e.type === 'settle' ? `settle:${e.by}:${e.ok ? 'ok' : 'ng'}` : e.ms === undefined ? e.type : `${e.type}${e.ms}`)

    it(`should notify start and settle(pm) when pm settles before the timeout`, async function() {
        let { r, events, at } = await go('pmFirst')
        assert.strict.deepStrictEqual(r, ['resolve', 'ok'])
        //觀察回調: 啟動計時器(100ms)於0ms, pm先完成(60ms)而settle, 不通知timeout
        assert.strict.deepStrictEqual(events.map(fmt), ['start100', 'settle:pm:ok'])
        assert.strict.deepStrictEqual(at, [0, 60])
        let rj = await go('pmReject')
        assert.strict.deepStrictEqual(rj.r, ['reject', 'strErr'])
        assert.strict.deepStrictEqual(rj.events.map(fmt), ['start100', 'settle:pm:ng'])
        assert.strict.deepStrictEqual(rj.at, [0, 30])
    })

    it(`should notify timeout at exactly ms and settle(timeout) before rejecting`, async function() {
        let { r, events, at } = await go('timeoutFirst', { label: 'L' })
        //JSDoc: 逾時則reject code為'TIMEOUT'之Error, message為'[label ]timeout[ms數ms]'
        assert.strict.deepStrictEqual(r, ['reject', 'TIMEOUT:L timeout[100ms]'])
        //觀察回調: 逾時計時器恰於100ms到期(timeout)並由逾時勝出(settle), pm於101ms完成時已不再通知
        assert.strict.deepStrictEqual(events.map(fmt), ['start100', 'timeout100', 'settle:timeout:ng'])
        assert.strict.deepStrictEqual(at, [0, 100, 100])
    })

    it(`should let pm win at ms-1 and the timeout win at ms+1 (boundary of the timeout threshold)`, async function() {
        //逾時門檻之邊界: pm於99ms完成(門檻100ms)則pm勝出且不通知timeout; 於101ms完成則逾時勝出
        let a = await go('pmJustBefore')
        assert.strict.deepStrictEqual(a.r, ['resolve', 'ok'])
        assert.strict.deepStrictEqual(a.events.map(fmt), ['start100', 'settle:pm:ok'])
        let b = await go('timeoutFirst')
        assert.strict.deepStrictEqual(b.r, ['reject', 'TIMEOUT:timeout[100ms]'])
        assert.strict.deepStrictEqual(b.events.map(fmt), ['start100', 'timeout100', 'settle:timeout:ng'])
    })

    it(`should notify settle(invalid) only, without start or timeout, when the arguments are invalid`, async function() {
        let a = await go('invalidPm')
        assert.strict.deepStrictEqual(a.r, ['reject', 'undefined:invalid pm'])
        assert.strict.deepStrictEqual(a.events.map(fmt), ['settle:invalid:ng'])
        let b = await go('invalidMs')
        assert.strict.deepStrictEqual(b.r, ['reject', 'undefined:invalid ms[-1]'])
        assert.strict.deepStrictEqual(b.events.map(fmt), ['settle:invalid:ng'])
    })

    it(`should notify start with ms clamped to the timer upper bound`, async function() {
        //JSDoc: 夾至計時器上限(cst.TIMER_TIME_MAX); start之ms為夾至上限後之逾時毫秒數
        let tr = traceRec()
        let r = await pmTimeout(Promise.resolve('ok'), cst.TIMER_TIME_MAX + 1000, { onTrace: tr.on })
        assert.strict.deepStrictEqual(r, 'ok')
        assert.strict.deepStrictEqual(tr.events.map(fmt), [`start${cst.TIMER_TIME_MAX}`, 'settle:pm:ok'])
    })

    it(`should behave the same without onTrace, with a recording onTrace, and with a throwing, rejecting or invalid onTrace`, async function() {
        //R-TRACE-01 P3: 未傳觀察回調時之對外行為不變(opt可省略, 同舊版之pmTimeout(pm, ms)); P4: 回調之拋錯與回傳值不影響逾時判定、不產生未處理之rejection; 以假時鐘使各次之時序相同
        let un = []
        let onUn = (v) => un.push(String(v))
        process.on('unhandledRejection', onUn)
        let rs = []
        try {
            let rec = traceRec()
            for (let onTrace of [undefined, rec.on, () => {
                throw new Error('trace boom')
            }, () => Promise.reject(new Error('trace reject')), 'abc']) {
                let got = {}
                for (let name of Object.keys(scenarios)) {
                    let clock = useFakeClock()
                    try {
                        got[name] = await scenarios[name](clock, onTrace === undefined ? { label: 'L' } : { label: 'L', onTrace })
                    }
                    finally {
                        clock.restore()
                    }
                }
                rs.push(got)
            }
            //省略第3參數
            let clock = useFakeClock()
            try {
                let pm = genPm()
                let p = toR(pmTimeout(pm, 100))
                await clock.advance(150)
                rs.push({ omitted: await settled(p) })
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
        let exp = {
            pmFirst: ['resolve', 'ok'],
            timeoutFirst: ['reject', 'TIMEOUT:L timeout[100ms]'],
            pmJustBefore: ['resolve', 'ok'],
            pmReject: ['reject', 'strErr'],
            invalidPm: ['reject', 'undefined:invalid pm'],
            invalidMs: ['reject', 'undefined:invalid ms[-1]'],
        }
        assert.strict.deepStrictEqual([rs, un], [[exp, exp, exp, exp, exp, { omitted: ['reject', 'TIMEOUT:timeout[100ms]'] }], []])
    })

    it(`should notify start, timeout and settle through onTrace with frozen events of primitive fields and no receiver`, async function() {
        //JSDoc opt.onTrace: 事件為凍結物件{ type, ... }, 欄位依type列舉且皆為原始值; 回調不帶接收者呼叫(R-TRACE-01 P4: 唯讀快照、最少欄位、不暴露內部可變狀態)
        let meta = []
        let all = []
        for (let name of ['pmFirst', 'timeoutFirst', 'invalidPm']) {
            let clock = useFakeClock()
            try {
                let tr = traceRec()
                await scenarios[name](clock, {
                    onTrace: function(e) {
                        meta.push([this, Object.isFrozen(e)])
                        tr.on(e)
                    },
                })
                all.push(...tr.events)
            }
            finally {
                clock.restore()
            }
        }
        //各type之欄位固定(排序後)
        let keys = {}
        for (let e of all) {
            keys[e.type] = Object.keys(e).sort().join(',')
        }
        assert.strict.deepStrictEqual(keys, { start: 'ms,type', timeout: 'ms,type', settle: 'by,ok,type' })
        //欄位皆為原始值(數字、字串、布林或null)
        assert.strict.deepStrictEqual(all.every((e) => Object.values(e).every((v) => v === null || ['number', 'string', 'boolean'].includes(typeof v))), true)
        //事件為凍結物件, 回調不帶接收者(this為undefined)
        assert.strict.deepStrictEqual(meta.length > 0 && meta.every(([self, frozen]) => self === undefined && frozen), true)
        //每次呼叫恰通知一次settle
        assert.strict.deepStrictEqual(all.filter((e) => e.type === 'settle').map((e) => e.by), ['pm', 'timeout', 'invalid'])
    })

})


describe(`pmTimeout settle(R-PM-SETTLE-01)`, function() {

    it(`ispm之使用端: pmTimeout輸入讀取即拋錯之值為invalid pm, waitFun謂詞回傳之視為未就緒 [規則8]`, function() {
        let { r } = runPmSettle('ispmCallers')
        assert.strict.deepStrictEqual(r.out, { pmTimeout: { s: 'reject', msg: 'invalid pm' }, waitFun: { s: 'reject', v: 'exceeded attemptNum[2]' } })
    })

})
