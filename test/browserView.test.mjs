/* eslint-disable no-new-wrappers -- 測試刻意以包裝物件(new String)驗證輸入之判定 */
import assert from 'assert'
import vm from 'vm'
import { mock } from 'node:test'
import browserView from '../src/browserView.mjs'
import { mkBrowserFake, clearBrowserFake } from './tools/browserFakeKit.mjs'


//規格: 主控dspec〈輸入參數之檢測機制〉§11 Q1-g〈browserView系〔使用者2026-11-12定〕〉①data/type無效即同步拋錯(檢查先於建Blob與開分頁), ②開不成即拋錯、開啟後延遲釋放Blob網址, ③可夾帶腳本之類型行為不改
//以最小假window/document(test/tools/browserFakeKit.mjs)觀察createObjectURL、window.open、revokeObjectURL; 延遲釋放以假時鐘(mock.timers)判定, 不以真實延時


let MSG_DATA = 'invalid data: must be a string, Blob, ArrayBuffer or ArrayBufferView'
let MSG_TYPE = 'invalid type: must be a non-empty string'


describe(`browserView`, function() {

    let env = null
    let logs = []
    let cl = console.log

    beforeEach(function() {
        mock.timers.enable({ apis: ['setTimeout'] })
        logs = []
        console.log = (...args) => {
            logs.push(args.map(String).join(' '))
        }
    })

    afterEach(function() {
        console.log = cl
        mock.timers.reset()
        clearBrowserFake()
        env = null
    })

    //①data無效即同步拋錯, 不帶值, 先於建Blob與開分頁(修前: 照開, Blob內容為'undefined'等)
    it(`should throw '${MSG_DATA}' and not create object URL nor open when data is invalid [①]`, function() {
        let vs = [undefined, null, NaN, 123, true, {}, [], () => 1, Symbol('s'), 1n, new Date(0), /a/]
        let out = vs.map((v) => {
            env = mkBrowserFake()
            let msg = null
            try {
                browserView(v, 'text/plain')
            }
            catch (err) {
                msg = err.message
            }
            return { msg, urls: env.urls.length, opens: env.opens.length }
        })
        assert.strict.deepStrictEqual(out, vs.map(() => ({ msg: MSG_DATA, urls: 0, opens: 0 })))
    })

    //①type無效即同步拋錯(修前: type被強轉或為空而照開)
    it(`should throw '${MSG_TYPE}' and not open when type is invalid [①]`, function() {
        let vs = [undefined, null, '', 123, {}, [], true, new String('')]
        let out = vs.map((v) => {
            env = mkBrowserFake()
            let msg = null
            try {
                browserView('abc', v)
            }
            catch (err) {
                msg = err.message
            }
            return { msg, urls: env.urls.length, opens: env.opens.length }
        })
        assert.strict.deepStrictEqual(out, vs.map(() => ({ msg: MSG_TYPE, urls: 0, opens: 0 })))
    })

    //①訊息不帶輸入值(dspec V20)
    it(`should not include the input value in the error message [① V20]`, function() {
        env = mkBrowserFake()
        let msgs = []
        for (let [d, t] of [[{ secret: 'S3CRET' }, 'text/plain'], ['abc', { secret: 'S3CRET' }], [12345678, 'text/plain']]) {
            try {
                browserView(d, t)
            }
            catch (err) {
                msgs.push(err.message)
            }
        }
        assert.strict.deepStrictEqual([msgs.length, msgs.some((m) => m.includes('S3CRET') || m.includes('12345678'))], [3, false])
    })

    //正常用法: 以data與type建Blob、取Blob網址並以window.open開啟(行為不改)
    it(`should create a Blob of given data and type, and open its object URL [正常用法]`, async function() {
        env = mkBrowserFake()
        browserView('abc', 'text/plain')
        assert.strict.deepStrictEqual([env.urls.length, env.opens, env.urls[0].blob.type, await env.urls[0].blob.text()], [1, ['blob:fake/1'], 'text/plain', 'abc'])
    })

    //①data之品牌以內部槽判定(外審terra 1、2、4): 偽裝標籤之物件、包裝字串(規格§3.4 S2)、共享或已分離之緩衝區、不可讀之Proxy與拋錯之存取器皆為無效, 訊息固定且不外洩內部錯誤
    it(`should throw '${MSG_DATA}' for spoofed Symbol.toStringTag objects, String wrapper, shared or detached buffers, and unreadable inputs, without leaking their errors [① 品牌判定]`, function() {
        let ab = new ArrayBuffer(4)
        let u8Detached = new Uint8Array(ab) //檢視須於分離前建立
        structuredClone(ab, { transfer: [ab] }) //ab已分離
        let pr = Proxy.revocable({}, {})
        pr.revoke()
        let vs = [
            new String('xyz'),
            { [Symbol.toStringTag]: 'ArrayBuffer', toString: () => 'FAKE' },
            { [Symbol.toStringTag]: 'Blob', toString: () => 'FAKE' },
            { [Symbol.toStringTag]: 'Uint8Array' },
            { [Symbol.toStringTag]: 'String' },
            new SharedArrayBuffer(4),
            new Uint8Array(new SharedArrayBuffer(4)),
            ab,
            u8Detached,
            pr.proxy,
            {
                get [Symbol.toStringTag]() {
                    throw new Error('SENSITIVE')
                },
            },
        ]
        let out = vs.map((v) => {
            env = mkBrowserFake()
            let msg = null
            try {
                browserView(v, 'text/plain')
            }
            catch (err) {
                msg = err.message
            }
            return { msg, urls: env.urls.length, opens: env.opens.length }
        })
        assert.strict.deepStrictEqual(out, vs.map(() => ({ msg: MSG_DATA, urls: 0, opens: 0 })))
    })

    it(`should throw '${MSG_TYPE}' for String wrapper and unreadable type [① 規格§3.4 S1]`, function() {
        let pr = Proxy.revocable({}, {})
        pr.revoke()
        let out = [new String('text/plain'), pr.proxy, { toString: () => 'text/plain' }].map((v) => {
            env = mkBrowserFake()
            let msg = null
            try {
                browserView('abc', v)
            }
            catch (err) {
                msg = err.message
            }
            return { msg, opens: env.opens.length }
        })
        assert.strict.deepStrictEqual(out, [{ msg: MSG_TYPE, opens: 0 }, { msg: MSG_TYPE, opens: 0 }, { msg: MSG_TYPE, opens: 0 }])
    })

    it(`should accept genuine data from another realm(vm context) and subclasses(File) [① 跨realm有效]`, async function() {
        let ctx = vm.createContext({})
        let u8aOther = vm.runInContext('new Uint8Array([66, 97, 115])', ctx)
        let abOther = vm.runInContext('new Uint8Array([120, 121]).buffer', ctx)
        let out = []
        for (let d of [u8aOther, abOther, new File(['ff'], 'a.txt')]) {
            env = mkBrowserFake()
            browserView(d, 'text/plain')
            out.push([env.opens.length, await env.urls[0].blob.text()])
        }
        assert.strict.deepStrictEqual(out, [[1, 'Bas'], [1, 'xy'], [1, 'ff']])
    })

    it(`should accept primitive string(including empty), Uint8Array, ArrayBuffer, DataView and Blob as data [①有效之data]`, async function() {
        let u8a = new Uint8Array([66, 97, 115])
        let cs = [
            ['', ''],
            ['xyz', 'xyz'],
            [u8a, 'Bas'],
            [u8a.subarray(1), 'as'],
            [u8a.buffer, 'Bas'],
            [new DataView(u8a.buffer), 'Bas'],
            [new Blob(['qq']), 'qq'],
        ]
        let out = []
        for (let [d] of cs) {
            env = mkBrowserFake()
            browserView(d, 'application/pdf')
            out.push([env.opens.length, env.urls[0].blob.type, await env.urls[0].blob.text()])
        }
        assert.strict.deepStrictEqual(out, cs.map(([, e]) => [1, 'application/pdf', e]))
    })

    //③可夾帶腳本之類型行為不改(照開, 由呼叫端負責)
    it(`should still open script-capable types(text/html, image/svg+xml, application/xhtml+xml, text/xml, application/xml) unchanged [③行為不改]`, function() {
        let ts = ['text/html', 'image/svg+xml', 'application/xhtml+xml', 'text/xml', 'application/xml']
        let out = ts.map((t) => {
            env = mkBrowserFake()
            browserView('<b>x</b>', t)
            return [env.opens.length, env.urls[0].blob.type]
        })
        assert.strict.deepStrictEqual(out, ts.map((t) => [1, t]))
    })

    //②開啟後延遲釋放Blob網址(60秒, 理由見JSDoc), 以假時鐘判定(修前: 從不釋放)
    it(`should revoke the object URL 60000ms after opening, not before [②延遲釋放]`, function() {
        env = mkBrowserFake()
        browserView('abc', 'text/plain')
        let r0 = env.revokes.slice()
        mock.timers.tick(59999)
        let r1 = env.revokes.slice()
        mock.timers.tick(1)
        let r2 = env.revokes.slice()
        assert.strict.deepStrictEqual([r0, r1, r2], [[], [], ['blob:fake/1']])
    })

    //②開不成即拋錯(修前: 只console.log後回undefined, 或照常回undefined)
    it(`should throw 'window and document are required' when window or document is absent [②]`, function() {
        let out = []
        //無window與document
        clearBrowserFake()
        try {
            browserView('abc', 'text/plain')
            out.push('no throw')
        }
        catch (err) {
            out.push(err.message)
        }
        //有window無document
        env = mkBrowserFake()
        delete globalThis.document
        try {
            browserView('abc', 'text/plain')
            out.push('no throw')
        }
        catch (err) {
            out.push(err.message)
        }
        assert.strict.deepStrictEqual([out, env.opens.length], [['window and document are required', 'window and document are required'], 0])
    })

    it(`should throw 'URL.createObjectURL is not supported' when createObjectURL is missing [②]`, function() {
        env = mkBrowserFake({ createObjectURL: 'missing' })
        assert.throws(() => browserView('abc', 'text/plain'), { message: 'URL.createObjectURL is not supported' })
        assert.strict.deepStrictEqual(env.opens.length, 0)
    })

    it(`should throw 'can not create object URL'(not leaking the internal error) when createObjectURL throws [②]`, function() {
        env = mkBrowserFake({ createObjectURL: 'throw' })
        assert.throws(() => browserView('abc', 'text/plain'), { message: 'can not create object URL' })
        assert.strict.deepStrictEqual(env.opens.length, 0)
    })

    it(`should throw 'window.open was blocked' and revoke the object URL immediately when window.open returns null [②]`, function() {
        env = mkBrowserFake({ open: 'null' })
        assert.throws(() => browserView('abc', 'text/plain'), { message: 'window.open was blocked' })
        assert.strict.deepStrictEqual([env.opens.length, env.revokes], [1, ['blob:fake/1']])
    })

    it(`should throw 'can not open window' and revoke the object URL immediately when window.open throws [②]`, function() {
        env = mkBrowserFake({ open: 'throw' })
        assert.throws(() => browserView('abc', 'text/plain'), { message: 'can not open window' })
        assert.strict.deepStrictEqual(env.revokes, ['blob:fake/1'])
    })

    //②釋放為盡力而為(外審terra 15): 無revokeObjectURL時仍開啟且不拋錯, 延遲回呼亦不拋錯
    it(`should still open and not throw when URL.revokeObjectURL is absent(revoke is best effort) [②盡力而為]`, function() {
        env = mkBrowserFake()
        delete env.window.URL.revokeObjectURL
        let msg = 'no throw'
        try {
            browserView('abc', 'text/plain')
            mock.timers.tick(60000)
        }
        catch (err) {
            msg = err.message
        }
        assert.strict.deepStrictEqual([msg, env.opens.length], ['no throw', 1])
    })

    it(`should throw 'window.open was blocked' even when revokeObjectURL throws on the blocked path [②盡力而為, 外審terra 15]`, function() {
        env = mkBrowserFake({ open: 'null' })
        env.window.URL.revokeObjectURL = () => {
            throw new Error('SENSITIVE')
        }
        assert.throws(() => browserView('abc', 'text/plain'), { message: 'window.open was blocked' })
    })

    it(`should not print to console on failure(failure goes to the thrown Error only) [②不只console.log]`, function() {
        env = mkBrowserFake({ createObjectURL: 'throw' })
        try {
            browserView('abc', 'text/plain')
        }
        catch (err) {}
        assert.strict.deepStrictEqual(logs, [])
    })

})
