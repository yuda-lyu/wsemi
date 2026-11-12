import assert from 'assert'
import vm from 'vm'
import { mock } from 'node:test'
import browserViewFromU8arr from '../src/browserViewFromU8arr.mjs'
import { mkBrowserFake, clearBrowserFake } from './tools/browserFakeKit.mjs'


//規格: 主控dspec〈輸入參數之檢測機制〉§11 Q1-g〈browserView系〔使用者2026-11-12定〕〉①u8a與type無效即同步拋錯(修前: u8a無效靜默return、type不檢照開), ②開不成即拋錯(轉交browserView)


describe(`browserViewFromU8arr`, function() {

    let env = null

    beforeEach(function() {
        mock.timers.enable({ apis: ['setTimeout'] })
    })

    afterEach(function() {
        mock.timers.reset()
        clearBrowserFake()
        env = null
    })

    it(`should throw 'invalid u8a: must be a Uint8Array' and not open when u8a is not a Uint8Array [①]`, function() {
        //偽裝標籤之物件、底層共享或已分離之Uint8Array亦無效, 以本函數之參數名拋出(外審terra 1、2)
        let ab = new ArrayBuffer(4)
        let u8Detached = new Uint8Array(ab)
        structuredClone(ab, { transfer: [ab] })
        let vs = [undefined, null, 'abc', 123, {}, [66, 97], new Uint16Array([1]), new ArrayBuffer(2), new Blob(['a']), { [Symbol.toStringTag]: 'Uint8Array', length: 1 }, new Uint8Array(new SharedArrayBuffer(4)), u8Detached]
        let out = vs.map((v) => {
            env = mkBrowserFake()
            let msg = null
            try {
                browserViewFromU8arr(v, 'text/plain')
            }
            catch (err) {
                msg = err.message
            }
            return { msg, opens: env.opens.length }
        })
        assert.strict.deepStrictEqual(out, vs.map(() => ({ msg: 'invalid u8a: must be a Uint8Array', opens: 0 })))
    })

    it(`should throw 'invalid type: must be a non-empty string' and not open when type is invalid [①]`, function() {
        let vs = [undefined, null, '', 123, {}]
        let out = vs.map((v) => {
            env = mkBrowserFake()
            let msg = null
            try {
                browserViewFromU8arr(new Uint8Array([1]), v)
            }
            catch (err) {
                msg = err.message
            }
            return { msg, opens: env.opens.length, urls: env.urls.length }
        })
        assert.strict.deepStrictEqual(out, vs.map(() => ({ msg: 'invalid type: must be a non-empty string', opens: 0, urls: 0 })))
    })

    it(`should accept a genuine Uint8Array from another realm(vm context) [跨realm有效]`, async function() {
        env = mkBrowserFake()
        browserViewFromU8arr(vm.runInContext('new Uint8Array([66, 97, 115])', vm.createContext({})), 'text/plain')
        assert.strict.deepStrictEqual([env.opens.length, await env.urls[0].blob.text()], [1, 'Bas'])
    })

    it(`should open the Uint8Array with the given type via browserView [正常用法, 接線]`, async function() {
        env = mkBrowserFake()
        browserViewFromU8arr(new Uint8Array([66, 97, 115]), 'application/pdf')
        assert.strict.deepStrictEqual([env.opens.length, env.urls[0].blob.type, await env.urls[0].blob.text()], [1, 'application/pdf', 'Bas'])
    })

    it(`should throw the Error of browserView when it can not open(window.open throws) [②]`, function() {
        env = mkBrowserFake({ open: 'throw' })
        assert.throws(() => browserViewFromU8arr(new Uint8Array([1]), 'text/plain'), { message: 'can not open window' })
    })

})
