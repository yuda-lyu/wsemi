import assert from 'assert'
import downloadFileFromBlob from '../src/downloadFileFromBlob.mjs'
import { NOT_ESTR, mkDownloadEnv } from './tools/domArgKit.mjs'


//ws492e: N-A(主控定): downloadFileFromBlob會觸發下載(改動畫面), 依兩通則輸入無效即同步拋固定訊息之Error(V19), 先於建立網址、建立元素與觸發下載; blob原無檢測(非Blob使createObjectURL拋原生TypeError), fileName無效僅console.log後return, 主次參數處置不一致(P3)
//  規格: dspec〈輸入參數之檢測機制〉§11 W-17通則、P3、V17、V19、V20
//  DOM測試作法: 同downloadFileFromB64.test.mjs(mkDownloadEnv); IE11分支以覆蓋全域navigator模擬並記錄msSaveOrOpenBlob
describe(`downloadFileFromBlob`, function() {

    let env = null
    let bb = new Blob(['abc'], { type: 'text/plain' })

    beforeEach(function() {
        env = mkDownloadEnv()
    })

    afterEach(function() {
        env.restore()
    })

    //spec: fileName非非空字串拋Error, 先於任何動作(不建立網址、元素、不點擊)
    for (let [label, v] of NOT_ESTR) {
        if (Object.prototype.toString.call(v) === '[object String]' && typeof v === 'object') {
            continue //包裝字串: isestr之既有行為(W-20另批)
        }
        it(`should throw invalid fileName when fileName is ${label}, doing nothing`, function() {
            assert.throws(() => downloadFileFromBlob(v, bb), (err) => {
                assert.strict.deepStrictEqual(err instanceof Error, true)
                assert.strict.deepStrictEqual(err.message, 'invalid fileName: must be a non-empty string')
                return true
            })
            assert.strict.deepStrictEqual(env.nothing(), true)
        })
    }

    //spec: blob非Blob拋Error('invalid blob: must be a Blob'), 先於任何動作(原為createObjectURL之原生TypeError)
    for (let [label, v] of [['undefined', undefined], ['null', null], [`'abc'`, 'abc'], ['5', 5], ['true', true], ['{}', {}], ['[]', []], ['a Uint8Array', new Uint8Array([1])], ['an ArrayBuffer', new ArrayBuffer(2)], ['{ size: 1, type: "x" }', { size: 1, type: 'x' }], ['function', () => {}]]) {
        it(`should throw invalid blob when blob is ${label}, doing nothing`, function() {
            assert.throws(() => downloadFileFromBlob('a.txt', v), (err) => {
                assert.strict.deepStrictEqual(err instanceof Error, true)
                assert.strict.deepStrictEqual(err.message, 'invalid blob: must be a Blob')
                return true
            })
            assert.strict.deepStrictEqual(env.nothing(), true)
        })
    }

    it(`should report fileName first when both are invalid, and not echo the input values`, function() {
        assert.throws(() => downloadFileFromBlob(null, null), { message: 'invalid fileName: must be a non-empty string' })
        assert.throws(() => downloadFileFromBlob({ s: 'SECRET-name-9f3a' }, bb), (err) => !err.message.includes('SECRET'))
        assert.throws(() => downloadFileFromBlob('a.txt', { s: 'SECRET-blob-9f3a' }), (err) => !err.message.includes('SECRET'))
    })

    //spec: 輸入檢測先於環境檢查
    it(`should validate the arguments before the environment check`, function() {
        env.restore()
        assert.throws(() => downloadFileFromBlob('', bb), { message: 'invalid fileName: must be a non-empty string' })
        assert.throws(() => downloadFileFromBlob('a.txt', 5), { message: 'invalid blob: must be a Blob' })
        let logs = []
        let raw = console.log
        console.log = (...a) => {
            logs.push(a)
        }
        try {
            assert.strict.deepStrictEqual(downloadFileFromBlob('a.txt', bb), undefined)
        }
        finally {
            console.log = raw
        }
        assert.strict.deepStrictEqual(logs, [['no window']]) //有效輸入於非瀏覽器環境維持不動作並輸出'no window'(內部獨立複審#7)
    })

    //spec: Blob與File皆為有效, 建立網址後建立a元素點擊一次並移除, 其後釋放網址
    it(`should create an object URL, click a link once and then revoke the URL for a Blob and a File`, function() {
        for (let v of [bb, new File(['x'], 'f.txt')]) {
            env.clicks.length = 0
            env.urls.length = 0
            env.revoked.length = 0
            let r = downloadFileFromBlob('out.txt', v)
            assert.strict.deepStrictEqual(r, undefined)
            assert.strict.deepStrictEqual(env.urls, [v])
            assert.strict.deepStrictEqual(env.clicks, [{ href: 'blob:fake-1', download: 'out.txt', connected: true }])
            assert.strict.deepStrictEqual(env.revoked, ['blob:fake-1'])
            assert.strict.deepStrictEqual(env.body.children.length, 0)
        }
    })

    //spec: IE11以msSaveOrOpenBlob(既有行為不變)
    it(`should use msSaveOrOpenBlob in IE11`, function() {
        let desc = Object.getOwnPropertyDescriptor(globalThis, 'navigator')
        Object.defineProperty(globalThis, 'navigator', {
            configurable: true,
            value: { userAgent: 'Mozilla/5.0 (Windows NT 10.0; WOW64; Trident/7.0; rv:11.0) like Gecko' },
        })
        let saved = []
        env.window.navigator = { msSaveOrOpenBlob: (b, n) => saved.push([b, n]) }
        try {
            downloadFileFromBlob('ie.txt', bb)
            assert.strict.deepStrictEqual(saved, [[bb, 'ie.txt']])
            assert.strict.deepStrictEqual(env.urls.length, 0)
        }
        finally {
            if (desc) {
                Object.defineProperty(globalThis, 'navigator', desc)
            }
            else {
                delete globalThis.navigator
            }
        }
    })

})
