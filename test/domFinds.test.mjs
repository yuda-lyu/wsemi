import assert from 'assert'
import domFinds from '../src/domFinds.mjs'
import { NOT_ESTR, mkQueryEnv } from './tools/domArgKit.mjs'


//ws492e: W-17(使用者2026-11-16「甲」): 查詢類比照domIsFocused, 無效回空清單[]、不拋錯、不帶值
//  規格: dspec〈輸入參數之檢測機制〉§11 W-17(查詢類)、K9/V20、§3.4 S1(包裝物件無效)
//  DOM測試作法: 同domFind.test.mjs(test/tools/domArgKit.mjs之mkQueryEnv)
describe(`domFinds`, function() {

    let env = null

    beforeEach(function() {
        env = mkQueryEnv()
    })

    afterEach(function() {
        env.restore()
    })

    //spec: query非非空原始字串回空陣列[], 不拋錯, 且不呼叫原生API
    for (let [label, v] of NOT_ESTR) {
        it(`should return an empty array without throwing and without calling document.querySelectorAll when query is ${label}`, function() {
            env.mk('div', { id: 'a' })
            env.qcalls.length = 0
            let r = '(not set)'
            assert.doesNotThrow(() => {
                r = domFinds(v)
            })
            assert.strict.deepStrictEqual(Array.isArray(r), true)
            assert.strict.deepStrictEqual(r.length, 0)
            assert.strict.deepStrictEqual(env.qcalls.length, 0)
        })
    }

    //spec: 有效選擇器回全部符合元素(NodeList之length與索引存取)
    it(`should return all matching elements and pass the query to document.querySelectorAll once`, function() {
        let a1 = env.mk('div', { cls: 'k' })
        env.mk('div', { cls: 'other' })
        let a2 = env.mk('p', { cls: 'k' })
        env.qcalls.length = 0
        let r = domFinds('.k')
        assert.strict.deepStrictEqual(r.length, 2)
        assert.strict.deepStrictEqual(r[0], a1)
        assert.strict.deepStrictEqual(r[1], a2)
        assert.strict.deepStrictEqual(env.qcalls, [{ fn: 'querySelectorAll', arg: '.k' }])
    })

    //spec: 有效但無符合回空清單(長度0)
    it(`should return an empty list when nothing matches`, function() {
        env.mk('div', { id: 'a' })
        let r = domFinds('.zzz')
        assert.strict.deepStrictEqual(r.length, 0)
    })

    //spec(V20): 選擇器語法錯誤不外洩原生SyntaxError, 回空陣列
    for (let q of ['[[', '5', ' ', '#', '!@#SECRET-9f3a']) {
        it(`should return an empty array instead of throwing the native SyntaxError for the invalid selector ${JSON.stringify(q)}`, function() {
            let r = null
            assert.doesNotThrow(() => {
                r = domFinds(q)
            })
            assert.strict.deepStrictEqual(Array.isArray(r), true)
            assert.strict.deepStrictEqual(r.length, 0)
            assert.strict.deepStrictEqual(env.qcalls.length, 1)
        })
    }

    //spec: 無document不拋錯, 回空陣列
    it(`should return an empty array when document is not defined`, function() {
        env.restore()
        assert.strict.deepStrictEqual(typeof document, 'undefined')
        let r = domFinds('.k')
        assert.strict.deepStrictEqual(Array.isArray(r), true)
        assert.strict.deepStrictEqual(r.length, 0)
    })

})
