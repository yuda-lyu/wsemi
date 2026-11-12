import assert from 'assert'
import { mock } from 'node:test'
import browserViewFromBlob from '../src/browserViewFromBlob.mjs'
import { mkBrowserFake, clearBrowserFake } from './tools/browserFakeKit.mjs'


//規格: 主控dspec〈輸入參數之檢測機制〉§11 Q1-g〈browserView系〔使用者2026-11-12定〕〉①bb與type無效即同步拋錯(修前: bb無效靜默return、type不檢照開), ②開不成即拋錯(轉交browserView)


describe(`browserViewFromBlob`, function() {

    let env = null

    beforeEach(function() {
        mock.timers.enable({ apis: ['setTimeout'] })
    })

    afterEach(function() {
        mock.timers.reset()
        clearBrowserFake()
        env = null
    })

    it(`should throw 'invalid bb: must be a Blob' and not open when bb is not a Blob [①]`, function() {
        //偽裝標籤之物件亦無效(以內部槽判定; 外審terra 1)
        let vs = [undefined, null, 'abc', 123, {}, [], new Uint8Array([1]), { [Symbol.toStringTag]: 'Blob', size: 1 }, { [Symbol.toStringTag]: 'File' }]
        let out = vs.map((v) => {
            env = mkBrowserFake()
            let msg = null
            try {
                browserViewFromBlob(v, 'text/plain')
            }
            catch (err) {
                msg = err.message
            }
            return { msg, opens: env.opens.length }
        })
        assert.strict.deepStrictEqual(out, vs.map(() => ({ msg: 'invalid bb: must be a Blob', opens: 0 })))
    })

    it(`should throw 'invalid type: must be a non-empty string' and not open when type is invalid [①]`, function() {
        let vs = [undefined, null, '', 123, {}]
        let out = vs.map((v) => {
            env = mkBrowserFake()
            let msg = null
            try {
                browserViewFromBlob(new Blob(['a']), v)
            }
            catch (err) {
                msg = err.message
            }
            return { msg, opens: env.opens.length, urls: env.urls.length }
        })
        assert.strict.deepStrictEqual(out, vs.map(() => ({ msg: 'invalid type: must be a non-empty string', opens: 0, urls: 0 })))
    })

    it(`should accept File(a Blob subclass) [正常用法]`, async function() {
        env = mkBrowserFake()
        browserViewFromBlob(new File(['ff'], 'a.txt'), 'text/plain')
        assert.strict.deepStrictEqual([env.opens.length, await env.urls[0].blob.text()], [1, 'ff'])
    })

    it(`should open the blob with the given type via browserView [正常用法, 接線]`, async function() {
        env = mkBrowserFake()
        browserViewFromBlob(new Blob([new Uint8Array([66, 97, 115])]), 'application/pdf')
        assert.strict.deepStrictEqual([env.opens.length, env.urls[0].blob.type, await env.urls[0].blob.text()], [1, 'application/pdf', 'Bas'])
    })

    it(`should throw the Error of browserView when it can not open(createObjectURL missing) [②]`, function() {
        env = mkBrowserFake({ createObjectURL: 'missing' })
        assert.throws(() => browserViewFromBlob(new Blob(['a']), 'text/plain'), { message: 'URL.createObjectURL is not supported' })
    })

})
