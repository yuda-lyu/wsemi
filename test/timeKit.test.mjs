import assert from 'assert'
import { traceRec, useFakeClock } from './tools/timeKit.mjs'


//測試輔助(test/tools/timeKit.mjs)自身之測試: 規格P5③「測試輔助之防懸置上限須用模組載入時保存之真實計時器」
//  本檔載入時即保存真實計時器, 作為本檔自身之後援逾時(假時鐘下被測輔助若失效, 以此轉成明確失敗而非整案懸置至mocha逾時並使後續案連鎖失敗)
const realSetTimeout = setTimeout
const realClearTimeout = clearTimeout


//settleOrFail, 以真實計時器為後援: 逾msBackstop仍未落定即回傳{ hung: true }
function settleOrHung(pm, msBackstop) {
    return new Promise((resolve) => {
        let t = realSetTimeout(() => {
            resolve({ hung: true })
        }, msBackstop)
        pm.then(
            (v) => {
                realClearTimeout(t)
                resolve({ ok: true, v })
            },
            (err) => {
                realClearTimeout(t)
                resolve({ err })
            }
        )
    })
}


describe(`timeKit`, function() {

    describe(`traceRec.wait 之防懸置上限(規格P5③)`, function() {

        it(`should reject by the guard under a fake clock that is never advanced (the guard must use the real timer)`, async function() {
            let clock = useFakeClock(0)
            try {
                let tr = traceRec({ guard: 80 })
                //假時鐘不推進, 事件亦不來: 守門若用被假時鐘取代之setTimeout則永不觸發(整案懸置)
                let r = await settleOrHung(tr.wait((e) => e.type === 'never'), 3000)
                assert.strict.deepStrictEqual(r.hung, undefined) //規格P5③: 假時鐘下守門仍須觸發, 不得懸置
                assert.strict.deepStrictEqual(r.err instanceof Error, true)
                assert.strict.deepStrictEqual(/not received within 80ms/.test(r.err.message), true)
                assert.strict.deepStrictEqual(/event #1 from index 0/.test(r.err.message), true)
            }
            finally {
                clock.restore()
            }
        })

        it(`should list the events received so far in the guard error`, async function() {
            let clock = useFakeClock(0)
            try {
                let tr = traceRec({ guard: 60 })
                tr.on({ type: 'a', n: 1 })
                tr.on({ type: 'b', n: 2 })
                let r = await settleOrHung(tr.wait((e) => e.type === 'c', 0, 1), 3000)
                assert.strict.deepStrictEqual(r.hung, undefined)
                assert.strict.deepStrictEqual(r.err instanceof Error, true)
                assert.strict.deepStrictEqual(r.err.message.includes('"type":"a"') && r.err.message.includes('"type":"b"'), true) //已收到之事件列於訊息
            }
            finally {
                clock.restore()
            }
        })

        it(`should not let a fake clock advance trigger the guard (the guard is real time)`, async function() {
            let clock = useFakeClock(0)
            try {
                let tr = traceRec({ guard: 5000 })
                let pm = tr.wait((e) => e.type === 'hit')
                await clock.advance(6000) //假時鐘推進超過guard毫秒數(5000): 守門為真實時間, 不應因此觸發
                tr.on({ type: 'hit', n: 1 })
                let r = await settleOrHung(pm, 3000)
                assert.strict.deepStrictEqual(r.hung, undefined)
                assert.strict.deepStrictEqual(r.err, undefined) //事件到達時resolve, 非守門reject
                assert.strict.deepStrictEqual(r.v.type, 'hit')
            }
            finally {
                clock.restore()
            }
        })

        it(`should resolve at the n-th matching event and clear the guard timer`, async function() {
            let tr = traceRec({ guard: 5000 })
            let pm = tr.wait((e) => e.type === 'x', 0, 2)
            tr.on({ type: 'x', i: 1 })
            tr.on({ type: 'y', i: 2 })
            tr.on({ type: 'x', i: 3 })
            let e = await pm
            assert.strict.deepStrictEqual(e.i, 3) //第2個符合者
            assert.strict.deepStrictEqual(tr.types(), ['x', 'y', 'x'])
            assert.strict.deepStrictEqual(tr.mark(), 3)
            //已收到者亦計入
            let e2 = await tr.wait((x) => x.type === 'x', 0, 1)
            assert.strict.deepStrictEqual(e2.i, 1)
        })

    })

})
