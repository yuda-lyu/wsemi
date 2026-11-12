/* eslint-disable no-new-wrappers -- 測試刻意以包裝物件(new String)驗證輸入之判定 */
import assert from 'assert'
import { mock } from 'node:test'
import browserViewFromText from '../src/browserViewFromText.mjs'
import { mkBrowserFake, clearBrowserFake } from './tools/browserFakeKit.mjs'


//規格: 主控dspec〈輸入參數之檢測機制〉§11 Q1-g〈browserView系〔使用者2026-11-12定〕〉①包裝亦無效即同步拋錯(修前: 靜默return), ②開不成即拋錯(轉交browserView)


describe(`browserViewFromText`, function() {

    let env = null

    beforeEach(function() {
        mock.timers.enable({ apis: ['setTimeout'] })
    })

    afterEach(function() {
        mock.timers.reset()
        clearBrowserFake()
        env = null
    })

    it(`should throw 'invalid text: must be a string' and not open when text is not a string [①]`, function() {
        //包裝字串new String與偽裝標籤之物件亦無效(規格§3.4 S2只收原始字串; 外審terra 3)
        let vs = [undefined, null, 123, NaN, true, {}, [], new Uint8Array([1]), new Blob(['a']), new String('w'), { [Symbol.toStringTag]: 'String' }]
        let out = vs.map((v) => {
            env = mkBrowserFake()
            let msg = null
            try {
                browserViewFromText(v)
            }
            catch (err) {
                msg = err.message
            }
            return { msg, opens: env.opens.length, urls: env.urls.length }
        })
        assert.strict.deepStrictEqual(out, vs.map(() => ({ msg: 'invalid text: must be a string', opens: 0, urls: 0 })))
    })

    it(`should open primitive text(including empty string) as 'text/plain' via browserView [正常用法, 接線]`, async function() {
        let out = []
        for (let v of ['abc', '']) {
            env = mkBrowserFake()
            browserViewFromText(v)
            out.push([env.opens.length, env.urls[0].blob.type, await env.urls[0].blob.text()])
        }
        assert.strict.deepStrictEqual(out, [[1, 'text/plain', 'abc'], [1, 'text/plain', '']])
    })

    it(`should throw the Error of browserView when it can not open(window.open returns null) [②]`, function() {
        env = mkBrowserFake({ open: 'null' })
        assert.throws(() => browserViewFromText('abc'), { message: 'window.open was blocked' })
    })

    it(`should revoke the object URL 60000ms after opening via browserView [②延遲釋放, 接線]`, function() {
        env = mkBrowserFake()
        browserViewFromText('abc')
        mock.timers.tick(59999)
        let r1 = env.revokes.length
        mock.timers.tick(1)
        assert.strict.deepStrictEqual([r1, env.revokes], [0, ['blob:fake/1']])
    })

})
