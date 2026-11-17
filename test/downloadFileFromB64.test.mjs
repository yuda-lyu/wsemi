import assert from 'assert'
import downloadFileFromB64 from '../src/downloadFileFromB64.mjs'
import { NOT_ESTR, mkDownloadEnv } from './tools/domArgKit.mjs'


//ws492e: N-A(主控定): downloadFileFromB64會觸發下載(改動畫面), 依兩通則輸入無效即同步拋固定訊息之Error(V19), 先於建立元素與觸發下載; b64原無任何檢測(null、undefined、物件被轉成字串寫入href並觸發下載), fileName無效僅console.log後return, 主次參數處置不一致(P3)
//  規格: dspec〈輸入參數之檢測機制〉§11 W-17通則、P3、V17、V19、V20(不回顯輸入值)
//  DOM測試作法: 以最小假瀏覽器環境(test/tools/domArgKit.mjs之mkDownloadEnv)驅動; 真實下載屬瀏覽器語義, 另以真瀏覽器實測
describe(`downloadFileFromB64`, function() {

    let env = null

    beforeEach(function() {
        env = mkDownloadEnv()
    })

    afterEach(function() {
        env.restore()
    })

    //spec: fileName非非空字串拋Error('invalid fileName: must be a non-empty string'), 先於任何動作
    for (let [label, v] of NOT_ESTR) {
        if (Object.prototype.toString.call(v) === '[object String]' && typeof v === 'object') {
            continue //包裝字串: isestr之既有行為(W-20另批)
        }
        it(`should throw invalid fileName when fileName is ${label}, doing nothing`, function() {
            assert.throws(() => downloadFileFromB64(v, 'data:text/plain;base64,QUJD'), (err) => {
                assert.strict.deepStrictEqual(err instanceof Error, true)
                assert.strict.deepStrictEqual(err.message, 'invalid fileName: must be a non-empty string')
                return true
            })
            assert.strict.deepStrictEqual(env.nothing(), true)
        })
        it(`should throw invalid b64 when b64 is ${label}, doing nothing`, function() {
            assert.throws(() => downloadFileFromB64('a.txt', v), (err) => {
                assert.strict.deepStrictEqual(err instanceof Error, true)
                assert.strict.deepStrictEqual(err.message, 'invalid b64: must be a non-empty string')
                return true
            })
            assert.strict.deepStrictEqual(env.nothing(), true)
        })
    }

    //spec: 檢測順序fileName、b64
    it(`should report fileName first when both are invalid`, function() {
        assert.throws(() => downloadFileFromB64(null, null), { message: 'invalid fileName: must be a non-empty string' })
        assert.throws(() => downloadFileFromB64(), { message: 'invalid fileName: must be a non-empty string' })
    })

    //spec(V20): 訊息不回顯輸入值
    it(`should not echo the input values in the error message`, function() {
        assert.throws(() => downloadFileFromB64({ s: 'SECRET-name-9f3a' }, 'x'), (err) => !err.message.includes('SECRET'))
        assert.throws(() => downloadFileFromB64('a.txt', { s: 'SECRET-b64-9f3a' }), (err) => !err.message.includes('SECRET'))
    })

    //spec: 輸入檢測先於環境檢查(非瀏覽器環境下無效輸入亦拋錯, 有效輸入不動作不拋錯)
    it(`should validate the arguments before the environment check`, function() {
        env.restore()
        assert.strict.deepStrictEqual(typeof window, 'undefined')
        assert.throws(() => downloadFileFromB64('', 'x'), { message: 'invalid fileName: must be a non-empty string' })
        assert.throws(() => downloadFileFromB64('a.txt', ''), { message: 'invalid b64: must be a non-empty string' })
        let logs = []
        let raw = console.log
        console.log = (...a) => {
            logs.push(a)
        }
        try {
            assert.strict.deepStrictEqual(downloadFileFromB64('a.txt', 'x'), undefined)
        }
        finally {
            console.log = raw
        }
        assert.strict.deepStrictEqual(logs, [['no window']])
    })

    //spec: 有效輸入建立a元素(href為b64、download為fileName), 接於頁面、點擊一次後移除, 回傳undefined
    it(`should create a link with href and download, click it once while attached, then remove it`, function() {
        let b64 = 'data:image/png;base64,iVBORw0KGgo='
        let r = downloadFileFromB64('icon.png', b64)
        assert.strict.deepStrictEqual(r, undefined)
        assert.strict.deepStrictEqual(env.clicks, [{ href: b64, download: 'icon.png', connected: true }])
        assert.strict.deepStrictEqual(env.created.length, 1)
        assert.strict.deepStrictEqual(env.created[0].tagName, 'A')
        assert.strict.deepStrictEqual(env.body.children.length, 0)
    })

})
