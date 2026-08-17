import assert from 'assert'
import pmTimeout from '../src/pmTimeout.mjs'
import delay from '../src/delay.mjs'
import genPm from '../src/genPm.mjs'


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

    it(`sould throw 'invalid pm' when pm is not a promise`, function() {
        for (let v of [null, undefined, 123, 'abc', [], {}, () => {}, { then: () => {} }]) {
            assert.throws(() => pmTimeout(v, 100), /^Error: invalid pm$/)
        }
    })

    it(`sould accept a promise generated by genPm`, async function() {
        let pm = genPm()
        setTimeout(() => pm.resolve('pmok'), 10)
        let r = await pmTimeout(pm, 1000)
        assert.strict.deepStrictEqual(r, 'pmok')
    })

    it(`sould throw 'invalid ms[ms]' when ms is not a non-negative integer`, function() {
        assert.throws(() => pmTimeout(Promise.resolve(), -1), /^Error: invalid ms\[-1\]$/)
        assert.throws(() => pmTimeout(Promise.resolve(), 1.5), /^Error: invalid ms\[1.5\]$/)
        assert.throws(() => pmTimeout(Promise.resolve(), 'abc'), /^Error: invalid ms\[abc\]$/)
        assert.throws(() => pmTimeout(Promise.resolve(), null), /^Error: invalid ms\[null\]$/)
        assert.throws(() => pmTimeout(Promise.resolve(), undefined), /^Error: invalid ms\[undefined\]$/)
        assert.throws(() => pmTimeout(Promise.resolve(), NaN), /^Error: invalid ms\[NaN\]$/)
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

    it(`sould validate pm before ms`, function() {
        //pm之檢核置於ms之前, 二者皆無效時擲出之訊息須為pm者
        assert.throws(() => pmTimeout(null, -1), /^Error: invalid pm$/)
    })

})
