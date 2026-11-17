import assert from 'assert'
import domFind from '../src/domFind.mjs'
import { NOT_ESTR, mkQueryEnv } from './tools/domArgKit.mjs'


//ws492e: W-17(使用者2026-11-16「甲」): 查詢類比照domIsFocused, 無效回null、不拋錯、不帶值
//  規格: dspec〈輸入參數之檢測機制〉§11 W-17(查詢類)、K9/V20(不回顯輸入值)、§3.4 S1(包裝物件無效)
//  DOM測試作法: 以最小假DOM(test/tools/domArgKit.mjs之mkQueryEnv, 仿原生querySelector之字串強制轉型與SyntaxError)驅動; 真實選擇器解析屬瀏覽器語義, 另以真瀏覽器實測
describe(`domFind`, function() {

    let env = null

    beforeEach(function() {
        env = mkQueryEnv()
    })

    afterEach(function() {
        env.restore()
    })

    //spec: query非非空原始字串回null, 不拋錯, 且不呼叫原生API(原生會把非字串轉成字串當選擇器: null得'null'標籤而無聲得null、5得SyntaxError)
    for (let [label, v] of NOT_ESTR) {
        it(`should return null without throwing and without calling document.querySelector when query is ${label}`, function() {
            env.mk('div', { id: 'a' })
            env.qcalls.length = 0
            let r = '(not set)'
            assert.doesNotThrow(() => {
                r = domFind(v)
            })
            assert.strict.deepStrictEqual(r, null)
            assert.strict.deepStrictEqual(env.qcalls.length, 0)
        })
    }

    //spec: 有效選擇器回第一個符合之元素, 原樣傳給document.querySelector一次
    it(`should return the first matching element and pass the query to document.querySelector once`, function() {
        let a = env.mk('div', { id: 'a' })
        env.mk('div', { id: 'a' })
        env.qcalls.length = 0
        let r = domFind('#a')
        assert.strict.deepStrictEqual(r, a)
        assert.strict.deepStrictEqual(env.qcalls, [{ fn: 'querySelector', arg: '#a' }])
    })

    it(`should find by class, tag and attribute selectors`, function() {
        let x = env.mk('span', { cls: 'c1 c2' })
        let y = env.mk('input', { name: 'n1' })
        assert.strict.deepStrictEqual(domFind('.c2'), x)
        assert.strict.deepStrictEqual(domFind('input'), y)
        assert.strict.deepStrictEqual(domFind('[name=n1]'), y)
    })

    //spec: 有效但無符合回null
    it(`should return null when nothing matches`, function() {
        env.mk('div', { id: 'a' })
        assert.strict.deepStrictEqual(domFind('#zzz'), null)
    })

    //spec(V20): 選擇器語法錯誤(原生SyntaxError, 訊息含選擇器全文)不外洩, 回null
    for (let q of ['[[', '5', ' ', '#', 'a b c d e f g h', '!@#SECRET-9f3a']) {
        it(`should return null instead of throwing the native SyntaxError for the invalid selector ${JSON.stringify(q)}`, function() {
            let r = '(not set)'
            assert.doesNotThrow(() => {
                r = domFind(q)
            })
            assert.strict.deepStrictEqual(r, null)
            assert.strict.deepStrictEqual(env.qcalls.length, 1) //語法錯誤由原生拋出, 本函數接住
        })
    }

    //spec: 無document(非瀏覽器環境)不拋錯, 回null
    it(`should return null when document is not defined`, function() {
        env.restore()
        assert.strict.deepStrictEqual(typeof document, 'undefined')
        assert.strict.deepStrictEqual(domFind('#a'), null)
    })

    //spec: 空白字串為有效字串但為語法無效之選擇器, 同樣回null(不呼叫即回null亦可, 以結果為準)
    it(`should return null for the empty string without calling document.querySelector`, function() {
        env.qcalls.length = 0
        assert.strict.deepStrictEqual(domFind(''), null)
        assert.strict.deepStrictEqual(env.qcalls.length, 0)
    })

})
