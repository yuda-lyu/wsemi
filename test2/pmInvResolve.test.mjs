import assert from 'assert'
import genPm from '../src/genPm.mjs'
import pmInvResolve from '../src/pmInvResolve.mjs'


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
        //console.log(JSON.stringify(ms))
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
        //console.log(JSON.stringify(ms))
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
    it(`should return '${r1}' when run test3'`, async function() {
        let ms = await test3()
        //console.log(JSON.stringify(ms))
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
        //console.log(JSON.stringify(ms))
        assert.strict.deepStrictEqual(JSON.stringify(ms), r4)
    })

})
