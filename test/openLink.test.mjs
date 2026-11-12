/* eslint-disable no-new-wrappers -- 測試刻意以包裝物件(new String)驗證輸入之判定 */
import assert from 'assert'
import openLink from '../src/openLink.mjs'
import { mkBrowserFake, clearBrowserFake } from './tools/browserFakeKit.mjs'


//規格: 主控dspec〈輸入參數之檢測機制〉§11 Q1-g〈openLink〔使用者2026-11-12定〕〉C1非字串或空字串拋錯(修前: 靜默return); C2不設協定白名單、行為不改; C3無document拋錯(修前: 原生ReferenceError)
//以最小假document(test/tools/browserFakeKit.mjs)觀察<a>之建立、href/target、點擊時是否掛於body、點擊後移除; 瀏覽器實際開啟之行為另以真Chromium實測


describe(`openLink`, function() {

    let env = null

    afterEach(function() {
        clearBrowserFake()
        env = null
    })

    it(`should throw 'invalid url: must be a non-empty string' and create no element when url is not a non-empty string [C1]`, function() {
        let vs = [undefined, null, '', 123, true, {}, [], new String('')]
        let out = vs.map((v) => {
            env = mkBrowserFake()
            let msg = null
            try {
                openLink(v)
            }
            catch (err) {
                msg = err.message
            }
            return { msg, created: env.created.length, clicks: env.clicks.length }
        })
        assert.strict.deepStrictEqual(out, vs.map(() => ({ msg: 'invalid url: must be a non-empty string', created: 0, clicks: 0 })))
    })

    it(`should throw 'document is not available'(not a native ReferenceError) when document is absent [C3]`, function() {
        clearBrowserFake()
        let err = null
        try {
            openLink('https://example.com/')
        }
        catch (e) {
            err = e
        }
        assert.strict.deepStrictEqual([err instanceof Error, err && err.constructor === Error, err && err.message], [true, true, 'document is not available'])
    })

    it(`should throw 'document is not available' when document.body is absent [C3]`, function() {
        env = mkBrowserFake({ noBody: true })
        assert.throws(() => openLink('https://example.com/'), { message: 'document is not available' })
        assert.strict.deepStrictEqual(env.created.length, 0)
    })

    it(`should create <a target="_blank"> with the url, click it while attached to body, then remove it [正常用法]`, function() {
        env = mkBrowserFake()
        openLink('https://example.com/a')
        assert.strict.deepStrictEqual([env.created.length, env.clicks, env.body.children.length], [1, [{ tag: 'A', href: 'https://example.com/a', target: '_blank', connected: true }], 0])
    })

    it(`should pass any non-empty string as is(no protocol whitelist), e.g. relative path, 'not a url', javascript: and blob: [C2 行為不改]`, function() {
        let us = ['/rel/a.pdf', 'not a url', 'javascript:void(0)', 'blob:http://host/123', 'mailto:a@example.com']
        let out = us.map((u) => {
            env = mkBrowserFake()
            openLink(u)
            return env.clicks.map((c) => c.href)
        })
        assert.strict.deepStrictEqual(out, us.map((u) => [u]))
    })

    //規格§3.4 S1: 包裝物件無效(外審terra 3); 不可讀之Proxy、拋錯之存取器亦以固定訊息拋出, 不外洩其錯誤(外審terra 4)
    it(`should throw 'invalid url: must be a non-empty string' for String wrapper, spoofed tag and unreadable url without leaking their errors [C1, S1]`, function() {
        let pr = Proxy.revocable({}, {})
        pr.revoke()
        let throwingTag = {
            get [Symbol.toStringTag]() {
                throw new Error('SENSITIVE')
            },
        }
        let vs = [new String('https://example.com/w'), { [Symbol.toStringTag]: 'String' }, pr.proxy, throwingTag]
        let out = vs.map((v) => {
            env = mkBrowserFake()
            let msg = null
            try {
                openLink(v)
            }
            catch (err) {
                msg = err.message
            }
            return { msg, created: env.created.length }
        })
        assert.strict.deepStrictEqual(out, vs.map(() => ({ msg: 'invalid url: must be a non-empty string', created: 0 })))
    })

})
