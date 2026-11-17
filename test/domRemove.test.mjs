import assert from 'assert'
import domRemove from '../src/domRemove.mjs'
import { NOT_ELE, mkQueryEnv } from './tools/domArgKit.mjs'


//ws492e: W-17(使用者2026-11-16「甲」): domRemove回布林(是否有元素被移除); 已脫離之元素不動作回false、不拋錯(原TypeError); 無效輸入、語法無效之選擇器、無符合皆回false
//  規格: dspec〈輸入參數之檢測機制〉§11 W-17、P1(輸出型別恆定)、V20(不外洩選擇器全文之原生SyntaxError)
//  DOM測試作法: 以最小假DOM(mkQueryEnv)驅動, env.ops記錄removeChild
describe(`domRemove`, function() {

    let env = null

    beforeEach(function() {
        env = mkQueryEnv()
    })

    afterEach(function() {
        env.restore()
    })

    //spec: 元素在DOM內, 移除並回true
    it(`should remove an attached element and return true`, function() {
        let parent = env.mk('div')
        let ele = new env.Ele('span')
        parent.appendChild(ele)
        env.resetOps()
        let r = domRemove(ele)
        assert.strict.deepStrictEqual(r, true)
        assert.strict.deepStrictEqual(ele.parentNode, null)
        assert.strict.deepStrictEqual(parent.children, [])
        assert.strict.deepStrictEqual(env.ops, ['removeChild'])
    })

    //spec: 已脫離DOM之元素不動作回false, 不拋錯(原ele.parentNode.removeChild對null拋原生TypeError)
    it(`should do nothing and return false for a detached element without throwing`, function() {
        let ele = new env.Ele('span')
        env.resetOps()
        let r = '(not set)'
        assert.doesNotThrow(() => {
            r = domRemove(ele)
        })
        assert.strict.deepStrictEqual(r, false)
        assert.strict.deepStrictEqual(env.ops.length, 0)
    })

    //spec: 連續兩次移除同一元素, 第二次回false
    it(`should return true then false when removing the same element twice`, function() {
        let ele = env.mk('div')
        assert.strict.deepStrictEqual(domRemove(ele), true)
        assert.strict.deepStrictEqual(domRemove(ele), false)
    })

    //spec: 選擇器字串移除全部符合之元素, 至少移除一個回true
    it(`should remove all elements matching a selector and return true`, function() {
        let a = env.mk('div', { cls: 'k' })
        let b = env.mk('p', { cls: 'k' })
        let c = env.mk('div', { cls: 'other' })
        let r = domRemove('.k')
        assert.strict.deepStrictEqual(r, true)
        assert.strict.deepStrictEqual(a.parentNode, null)
        assert.strict.deepStrictEqual(b.parentNode, null)
        assert.strict.deepStrictEqual(c.parentNode, env.body)
    })

    //spec: 無符合回false
    it(`should return false when the selector matches nothing`, function() {
        env.mk('div', { cls: 'k' })
        assert.strict.deepStrictEqual(domRemove('.zzz'), false)
        assert.strict.deepStrictEqual(env.body.children.length, 1)
    })

    //spec(V20): 選擇器語法無效不外洩原生SyntaxError, 回false
    for (let q of ['[[', '5', '!@#SECRET-9f3a']) {
        it(`should return false instead of throwing for the invalid selector ${JSON.stringify(q)}`, function() {
            env.mk('div')
            let r = '(not set)'
            assert.doesNotThrow(() => {
                r = domRemove(q)
            })
            assert.strict.deepStrictEqual(r, false)
            assert.strict.deepStrictEqual(env.body.children.length, 1)
        })
    }

    //spec: 非元素亦非非空字串之輸入不動作回false(恆為布林, P1)
    for (let [label, v] of NOT_ELE) {
        if (typeof v === 'string' && v !== '') {
            continue //非空字串為選擇器
        }
        it(`should return false and not touch the DOM when inp is ${label}`, function() {
            env.mk('div')
            env.resetOps()
            let r = '(not set)'
            assert.doesNotThrow(() => {
                r = domRemove(v)
            })
            assert.strict.deepStrictEqual(r, false)
            assert.strict.deepStrictEqual(env.ops.length, 0)
            assert.strict.deepStrictEqual(env.body.children.length, 1)
        })
    }

    //spec: 回傳值恆為布林(含無document)
    it(`should return false when document is not defined and inp is a selector`, function() {
        env.restore()
        assert.strict.deepStrictEqual(domRemove('.k'), false)
    })

})
