import assert from 'assert'
import domIsFocused from '../src/domIsFocused.mjs'
import { NOT_ELE, mkEditDom } from './tools/domEditKit.mjs'


//ws286a: 非計算類函數之必須參數遇非預期(第221項 §11 第6項第一類), domIsFocused(ele)之ele非元素回false(原回字串'invalid element', 真值會被if當成有焦點)
//  規格: dspec〈輸入參數之檢測機制〉§5.1(判斷類回布林, P1成功與失敗之回傳型別一致)、§5.3 C18(不以訊息字串作回傳值)
//  DOM測試作法: 以最小假DOM(test/tools/fakeDom.mjs經domEditKit.mjs補語義)驅動; 真實焦點判定屬瀏覽器語義, 非本檔所能驗證, 須於瀏覽器實測
describe(`domIsFocused`, function() {

    let env = null

    beforeEach(function() {
        env = mkEditDom()
    })

    afterEach(function() {
        env.restore()
    })

    //spec: ele非元素回false(嚴格等於false, 非字串、非真值)
    for (let [label, v] of NOT_ELE) {
        it(`should return exactly false for non-element ${label}`, function() {
            let r = domIsFocused(v)
            assert.strict.deepStrictEqual(r, false)
            assert.strict.deepStrictEqual(typeof r, 'boolean')
        })
    }

    it(`should return exactly false when called without argument`, function() {
        assert.strict.deepStrictEqual(domIsFocused(), false)
    })

    //spec: 無效值不得在if中被當成有焦點(原回字串'invalid element'為真值)
    it(`should not let an invalid value pass an if check`, function() {
        let passed = false
        if (domIsFocused('not an element')) {
            passed = true
        }
        assert.strict.deepStrictEqual(passed, false)
    })

    //spec: 有效元素有焦點(document.activeElement即該元素)回true
    it(`should return true for the element that is document.activeElement`, function() {
        let ele = env.mkParent('input')
        env.document.activeElement = ele
        assert.strict.deepStrictEqual(domIsFocused(ele), true)
    })

    //spec: 有效元素無焦點回false, 焦點在他處(兄弟元素/body)或無焦點元素皆是
    it(`should return false for a valid element when the focus is on another element`, function() {
        let a = env.mkParent('input')
        let b = env.mkParent('input')
        env.document.activeElement = b
        assert.strict.deepStrictEqual(domIsFocused(a), false)
        assert.strict.deepStrictEqual(domIsFocused(b), true)
    })

    it(`should return false for a valid element when the focus is on body or there is no active element`, function() {
        let ele = env.mkParent('input')
        env.document.activeElement = env.body
        assert.strict.deepStrictEqual(domIsFocused(ele), false)
        env.document.activeElement = null
        assert.strict.deepStrictEqual(domIsFocused(ele), false)
    })

    //spec: 有效元素在無法讀取焦點之環境(無document)仍回布林false不拋錯, 維持既有try/catch之約定(本輪未改動, 此案鎖定不被一併改壞)
    it(`should return false without throwing for a valid element when document is unavailable`, function() {
        let ele = env.mkParent('input')
        env.restore()
        let logs = []
        let log = console.log
        console.log = (...a) => logs.push(a)
        let r = null
        try {
            r = domIsFocused(ele)
        }
        finally {
            console.log = log
        }
        assert.strict.deepStrictEqual(r, false)
        assert.strict.deepStrictEqual(logs.length, 1)
    })

})
