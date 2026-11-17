import assert from 'assert'
import downloadFileFromU8Arr from '../src/downloadFileFromU8Arr.mjs'
import { NOT_ESTR, mkDownloadEnv } from './tools/domArgKit.mjs'


//ws492e: N-A(主控定, 同族一併): downloadFileFromU8Arr之fileName、u8a無效依兩通則同步拋固定訊息之Error(V19), 先於轉成Blob與觸發下載(與downloadFileFromB64、downloadFileFromBlob、downloadFileFromText同一通道, V16同層一致; 原為console.log後return)
//  規格: dspec〈輸入參數之檢測機制〉§11 W-17通則、V16、V17、V19、V20
//  DOM測試作法: 同downloadFileFromB64.test.mjs(mkDownloadEnv)
describe(`downloadFileFromU8Arr`, function() {

    let env = null

    beforeEach(function() {
        env = mkDownloadEnv()
    })

    afterEach(function() {
        env.restore()
    })

    //spec: fileName非非空字串拋Error, 先於任何動作
    for (let [label, v] of NOT_ESTR) {
        if (Object.prototype.toString.call(v) === '[object String]' && typeof v === 'object') {
            continue //包裝字串: isestr之既有行為(W-20另批)
        }
        it(`should throw invalid fileName when fileName is ${label}, doing nothing`, function() {
            assert.throws(() => downloadFileFromU8Arr(v, new Uint8Array([1])), (err) => {
                assert.strict.deepStrictEqual(err instanceof Error, true)
                assert.strict.deepStrictEqual(err.message, 'invalid fileName: must be a non-empty string')
                return true
            })
            assert.strict.deepStrictEqual(env.nothing(), true)
        })
    }

    //spec: u8a非Uint8Array拋Error('invalid u8a: must be a Uint8Array')
    for (let [label, v] of [['undefined', undefined], ['null', null], [`'abc'`, 'abc'], ['5', 5], ['{}', {}], ['[1,2]', [1, 2]], ['an ArrayBuffer', new ArrayBuffer(2)], ['a Blob', new Blob(['x'])], ['function', () => {}]]) {
        it(`should throw invalid u8a when u8a is ${label}, doing nothing`, function() {
            assert.throws(() => downloadFileFromU8Arr('a.bin', v), (err) => {
                assert.strict.deepStrictEqual(err instanceof Error, true)
                assert.strict.deepStrictEqual(err.message, 'invalid u8a: must be a Uint8Array')
                return true
            })
            assert.strict.deepStrictEqual(env.nothing(), true)
        })
    }

    it(`should report fileName first, and not echo the input values`, function() {
        assert.throws(() => downloadFileFromU8Arr(null, null), { message: 'invalid fileName: must be a non-empty string' })
        assert.throws(() => downloadFileFromU8Arr({ s: 'SECRET-name-9f3a' }, new Uint8Array(1)), (err) => !err.message.includes('SECRET'))
        assert.throws(() => downloadFileFromU8Arr('a.bin', { s: 'SECRET-u8a-9f3a' }), (err) => !err.message.includes('SECRET'))
    })

    it(`should validate the arguments before the environment check`, function() {
        env.restore()
        assert.throws(() => downloadFileFromU8Arr('', new Uint8Array(1)), { message: 'invalid fileName: must be a non-empty string' })
        assert.throws(() => downloadFileFromU8Arr('a.bin', 5), { message: 'invalid u8a: must be a Uint8Array' })
        let logs = []
        let raw = console.log
        console.log = (...a) => {
            logs.push(a)
        }
        try {
            assert.strict.deepStrictEqual(downloadFileFromU8Arr('a.bin', new Uint8Array(1)), undefined)
        }
        finally {
            console.log = raw
        }
        assert.strict.deepStrictEqual(logs, [['no window']]) //有效輸入於非瀏覽器環境維持不動作並輸出'no window'(內部獨立複審#7)
    })

    //spec: 有效輸入下載該位元組(含空陣列)
    it(`should download the bytes of a Uint8Array, including an empty one`, async function() {
        downloadFileFromU8Arr('icon.png', new Uint8Array([137, 80, 78, 71]))
        let b = env.urls[0]
        assert.strict.deepStrictEqual(Array.from(new Uint8Array(await b.arrayBuffer())), [137, 80, 78, 71])
        assert.strict.deepStrictEqual(env.clicks[0].download, 'icon.png')
        downloadFileFromU8Arr('empty.bin', new Uint8Array(0))
        assert.strict.deepStrictEqual(env.urls[1].size, 0)
        assert.strict.deepStrictEqual(env.clicks.length, 2)
    })

})
