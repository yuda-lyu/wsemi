import assert from 'assert'
import genPm from '../src/genPm.mjs'
import pmInvResolve from '../src/pmInvResolve.mjs'
import pmConvertResolve from '../src/pmConvertResolve.mjs'
import { runPmSettle } from './tools/pmSettleRun.mjs'


describe(`pmInvResolve`, function() {

    async function test1() {
        let ms = []
        let pmInp = genPm()
        pmInp.resolve({
            state: 'success',
            msg: 'abc',
        })
        let pmOut = pmInvResolve(pmInp)
        await pmOut
            .then((res) => {
                // console.log('then', res)
                // then abc
                ms.push({ mode: 'then', res })
            })
            .catch((res) => {
                // console.log('catch', res)
            })
        return ms
    }
    let r1 = '[{"mode":"then","res":"abc"}]'
    it(`should return '${r1}' when run test1'`, async function() {
        let ms = await test1()
        // console.log(JSON.stringify(ms))
        assert.strict.deepStrictEqual(JSON.stringify(ms), r1)
    })

    async function test2() {
        let ms = []
        let pmInp = genPm()
        pmInp.resolve({
            state: 'error',
            msg: 'abc',
        })
        let pmOut = pmInvResolve(pmInp)
        await pmOut
            .then((res) => {
                // console.log('then', res)
            })
            .catch((res) => {
                // console.log('catch', res)
                // catch abc
                ms.push({ mode: 'catch', res })
            })
        return ms
    }
    let r2 = '[{"mode":"catch","res":"abc"}]'
    it(`should return '${r2}' when run test2'`, async function() {
        let ms = await test2()
        // console.log(JSON.stringify(ms))
        assert.strict.deepStrictEqual(JSON.stringify(ms), r2)
    })

    async function test3() {
        let ms = []
        let pmInp = genPm()
        pmInp.resolve({
            state: 'cancelled',
            msg: 'abc',
        })
        let pmOut = pmInvResolve(pmInp)
        await pmOut
            .then((res) => {
                // console.log('then', res)
            })
            .catch((res) => {
                // console.log('catch', res)
                // catch { reason: 'cancelled' }
                ms.push({ mode: 'catch', res })
            })
        return ms
    }
    let r3 = '[{"mode":"catch","res":{"reason":"cancelled"}}]'
    it(`should return '${r3}' when run test3'`, async function() {
        let ms = await test3()
        // console.log(JSON.stringify(ms))
        assert.strict.deepStrictEqual(JSON.stringify(ms), r3)
    })

    async function test4() {
        let ms = []
        let pmInp = genPm()
        pmInp.resolve({
            data: {
                state: 'success',
                msg: 'abc',
            },
        })
        let pmOut = pmInvResolve(pmInp, { thenExtractData: true })
        await pmOut
            .then((res) => {
                // console.log('test4 then', res)
                // test4 then abc
                ms.push({ mode: 'then', res })
            })
            .catch((res) => {
                // console.log('test4 catch', res)
            })
        return ms
    }
    let r4 = '[{"mode":"then","res":"abc"}]'
    it(`should return '${r4}' when run test4'`, async function() {
        let ms = await test4()
        // console.log(JSON.stringify(ms))
        assert.strict.deepStrictEqual(JSON.stringify(ms), r4)
    })

})


describe(`pmInvResolve msg原樣傳遞與掛載(R-PM-SETTLE-01規則14)`, function() {

    //st, 結果轉為{ s, v }, v原樣(本段之值皆為原始值)
    let st = (pm) => pm.then((v) => ({ s: 'resolve', v }), (v) => ({ s: 'reject', v }))

    //res, 以genPm產生resolve指定值之Promise
    let res = (v) => {
        let pm = genPm()
        pm.resolve(v)
        return pm
    }

    it(`success之msg為undefined時resolve undefined [規則14]`, async function() {
        //R-PM-SETTLE-01 規則14: msg原樣傳遞(含undefined), 不以{}補預設; JSDoc pmInvResolve:16「state為success時resolve其msg…msg原樣傳遞(含undefined)」
        assert.strict.deepStrictEqual(await st(pmInvResolve(pmConvertResolve(() => undefined)())), { s: 'resolve', v: undefined })
        assert.strict.deepStrictEqual(await st(pmInvResolve(res({ state: 'success' }))), { s: 'resolve', v: undefined })
    })

    it(`error之msg為undefined時reject undefined [規則14]`, async function() {
        //R-PM-SETTLE-01 規則14: 同上句; JSDoc pmInvResolve:16「其餘(含error、缺state或非結果物件)reject其msg；msg原樣傳遞(含undefined)」
        assert.strict.deepStrictEqual(await st(pmInvResolve(pmConvertResolve(() => {
            throw undefined // eslint-disable-line no-throw-literal
        })())), { s: 'reject', v: undefined })
        assert.strict.deepStrictEqual(await st(pmInvResolve(res({ state: 'error' }))), { s: 'reject', v: undefined })
        assert.strict.deepStrictEqual(await st(pmInvResolve(res(1))), { s: 'reject', v: undefined })
    })

    it(`thenExtractData時data之msg為undefined亦原樣傳遞 [規則14]`, async function() {
        //R-PM-SETTLE-01 規則14: msg原樣傳遞(含undefined); JSDoc pmInvResolve:15 thenExtractData
        assert.strict.deepStrictEqual(await st(pmInvResolve(res({ data: { state: 'success' } }), { thenExtractData: true })), { s: 'resolve', v: undefined })
        assert.strict.deepStrictEqual(await st(pmInvResolve(res({ data: undefined }), { thenExtractData: true })), { s: 'reject', v: undefined })
    })

    it(`msg為null、0時原樣傳遞(對照) [規則14]`, async function() {
        //R-PM-SETTLE-01 規則14: msg原樣傳遞
        assert.strict.deepStrictEqual(await st(pmInvResolve(res({ state: 'success', msg: null }))), { s: 'resolve', v: null })
        assert.strict.deepStrictEqual(await st(pmInvResolve(res({ state: 'error', msg: 0 }))), { s: 'reject', v: 0 })
    })

    it(`輸入之pm被reject時原樣reject其值 [規則14]`, async function() {
        //R-PM-SETTLE-01 規則14: 輸入pm被reject時原樣reject; JSDoc pmInvResolve:16「輸入之pm被reject時原樣reject其值」
        assert.strict.deepStrictEqual(await st(pmInvResolve(Promise.reject(undefined))), { s: 'reject', v: undefined })
        assert.strict.deepStrictEqual(await st(pmInvResolve(Promise.reject('x'))), { s: 'reject', v: 'x' })
    })

    it(`pm非Promise時同步拋出Error('pm is not a promise') [規則12]`, function() {
        for (let v of [undefined, null, 0, 'abc', {}]) {
            //R-PM-SETTLE-01 規則12: pmInvResolve之pm非Promise時同步拋出(寫入JSDoc); JSDoc pmInvResolve:13「pm非Promise時同步拋出Error('pm is not a promise')」
            assert.strict.throws(() => pmInvResolve(v), (e) => e instanceof Error && e.message === 'pm is not a promise')
        }
    })

    it(`可呼叫thenable(then回傳undefined)與覆寫catch之子類別不使其同步拋出, 依其結果settle, 無未處理之rejection [規則2、4、14]`, function() {
        let { r } = runPmSettle('invResolveThenable')
        //R-PM-SETTLE-01 規則14: 掛載依規則4單次then(onS, onR), 掛載本身包try(可呼叫thenable之then回undefined、覆寫catch之子類別不得使其同步拋出)
        assert.strict.deepStrictEqual(r.out, {
            callable: { syncThrow: false, s: 'resolve', v: 'V' },
            subclassResolve: { syncThrow: false, s: 'resolve', v: 'W' },
            subclassReject: { syncThrow: false, s: 'reject', v: '<same error>' },
        })
        //R-PM-SETTLE-01 規則2
        assert.strict.deepStrictEqual({ unhandled: r.unhandled, uncaught: r.uncaught }, { unhandled: [], uncaught: [] })
    })

})
