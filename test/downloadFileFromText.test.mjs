import assert from 'assert'
import downloadFileFromText from '../src/downloadFileFromText.mjs'
import { NOT_ESTR, mkDownloadEnv } from './tools/domArgKit.mjs'


//ws492e: N-A／N-B(主控定): downloadFileFromText之fileName、ccont無效依兩通則同步拋固定訊息之Error(V19), 先於建立Blob與觸發下載(與downloadFileFromB64、downloadFileFromBlob、downloadFileFromU8Arr同一通道; 原為console.log後return); withBOM為帶預設值之位置參數(視同opt鍵), 非布林視為未給改用預設true、照常下載(K3; 原為整個下載被放棄)
//  規格: dspec〈輸入參數之檢測機制〉§11 W-17通則、K2、K3、V16(同層一致)、V19、V20
//  DOM測試作法: 同downloadFileFromB64.test.mjs(mkDownloadEnv); 以讀取交給createObjectURL之Blob內容驗證BOM
describe(`downloadFileFromText`, function() {

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
            assert.throws(() => downloadFileFromText(v, 'abc'), (err) => {
                assert.strict.deepStrictEqual(err instanceof Error, true)
                assert.strict.deepStrictEqual(err.message, 'invalid fileName: must be a non-empty string')
                return true
            })
            assert.strict.deepStrictEqual(env.nothing(), true)
        })
    }

    //spec: ccont非字串拋Error('invalid ccont: must be a string'); 空字串合法
    for (let [label, v] of [['undefined', undefined], ['null', null], ['5', 5], ['true', true], ['{}', {}], ['[]', []], ['a Uint8Array', new Uint8Array([1])], ['function', () => {}]]) {
        it(`should throw invalid ccont when ccont is ${label}, doing nothing`, function() {
            assert.throws(() => downloadFileFromText('a.txt', v), (err) => {
                assert.strict.deepStrictEqual(err instanceof Error, true)
                assert.strict.deepStrictEqual(err.message, 'invalid ccont: must be a string')
                return true
            })
            assert.strict.deepStrictEqual(env.nothing(), true)
        })
    }

    it(`should report fileName first, and not echo the input values`, function() {
        assert.throws(() => downloadFileFromText(null, null), { message: 'invalid fileName: must be a non-empty string' })
        assert.throws(() => downloadFileFromText({ s: 'SECRET-name-9f3a' }, 'x'), (err) => !err.message.includes('SECRET'))
        assert.throws(() => downloadFileFromText('a.txt', { s: 'SECRET-ccont-9f3a' }), (err) => !err.message.includes('SECRET'))
    })

    it(`should validate the arguments before the environment check`, function() {
        env.restore()
        assert.throws(() => downloadFileFromText('', 'x'), { message: 'invalid fileName: must be a non-empty string' })
        assert.throws(() => downloadFileFromText('a.txt', 5), { message: 'invalid ccont: must be a string' })
        let logs = []
        let raw = console.log
        console.log = (...a) => {
            logs.push(a)
        }
        try {
            assert.strict.deepStrictEqual(downloadFileFromText('a.txt', 'x'), undefined)
        }
        finally {
            console.log = raw
        }
        assert.strict.deepStrictEqual(logs, [['no window']]) //有效輸入於非瀏覽器環境維持不動作並輸出'no window'(內部獨立複審#7)
    })

    //text, 取最後一次交給createObjectURL之Blob之文字(以位元組解碼並保留BOM: Blob.text()依規格會去除開頭之BOM)
    let text = async () => Buffer.from(await env.urls[env.urls.length - 1].arrayBuffer()).toString('utf8')

    //spec: 預設含BOM(U+FEFF); 空字串ccont合法
    it(`should download with a BOM by default, also for the empty string`, async function() {
        downloadFileFromText('data.csv', 'a,b\r\nd,測試')
        assert.strict.deepStrictEqual(await text(), '﻿a,b\r\nd,測試')
        assert.strict.deepStrictEqual(env.clicks[0].download, 'data.csv')
        downloadFileFromText('empty.txt', '')
        assert.strict.deepStrictEqual(await text(), '﻿')
        assert.strict.deepStrictEqual(env.clicks.length, 2)
    })

    //spec: withBOM為false不加BOM, 為true加BOM
    it(`should not add a BOM when withBOM is false and add it when true`, async function() {
        downloadFileFromText('a.txt', 'abc', false)
        assert.strict.deepStrictEqual(await text(), 'abc')
        downloadFileFromText('a.txt', 'abc', true)
        assert.strict.deepStrictEqual(await text(), '﻿abc')
    })

    //spec(K3): withBOM非布林視為未給, 改用預設true並照常下載(不放棄下載)
    for (let [label, v] of [['null', null], ['1', 1], ['0', 0], [`'y'`, 'y'], [`'false'`, 'false'], ['{}', {}], ['[]', []], ['NaN', NaN], ['function', () => false]]) {
        it(`should treat withBOM ${label} as not given: download with the default BOM`, async function() {
            downloadFileFromText('a.txt', 'abc', v)
            assert.strict.deepStrictEqual(env.clicks.length, 1)
            assert.strict.deepStrictEqual(await text(), '﻿abc')
        })
    }

    it(`should treat withBOM undefined as the default true`, async function() {
        downloadFileFromText('a.txt', 'abc', undefined)
        assert.strict.deepStrictEqual(await text(), '﻿abc')
    })

})
