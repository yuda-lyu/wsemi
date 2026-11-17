import assert from 'assert'
import domSetAttr from '../src/domSetAttr.mjs'
import { NOT_ELE, NOT_ESTR, mkQueryEnv } from './tools/domArgKit.mjs'


//ws492e: W-17(使用者2026-11-16「甲」): domSetAttr之val為''為合法值(布林屬性, 如disabled、hidden設為空字串即屬性存在), 原視為無效回null
//  規格: dspec〈輸入參數之檢測機制〉§11 W-17(`''` 為合法值)
//  DOM測試作法: 以最小假DOM(mkQueryEnv)驅動; 真實布林屬性語義(disabled、hidden之實際效果)屬瀏覽器, 另以真瀏覽器實測
describe(`domSetAttr`, function() {

    let env = null

    beforeEach(function() {
        env = mkQueryEnv()
    })

    afterEach(function() {
        env.restore()
    })

    //spec: val為''時設屬性為空字串並回傳''(非null)
    it(`should set a boolean attribute with the empty string and return '' (not null)`, function() {
        let ele = env.mk('input')
        let r = domSetAttr(ele, 'disabled', '')
        assert.strict.deepStrictEqual(r, '')
        assert.strict.deepStrictEqual(ele.getAttribute('disabled'), '')
        assert.strict.deepStrictEqual(ele.nSet.get('disabled'), 1)
    })

    //spec: 非空字串與數字照常設定並回傳屬性值字串
    it(`should set a string value and a number value and return the attribute value`, function() {
        let ele = env.mk('div')
        assert.strict.deepStrictEqual(domSetAttr(ele, 'cus_attr', 'def'), 'def')
        assert.strict.deepStrictEqual(domSetAttr(ele, 'n', 12), '12')
        assert.strict.deepStrictEqual(domSetAttr(ele, 'n2', '3.5'), '3.5')
        assert.strict.deepStrictEqual(ele.getAttribute('cus_attr'), 'def')
    })

    //spec: val非字串亦非數字不動作回null, 不設屬性
    let BADVAL = [
        ['undefined', undefined],
        ['null', null],
        ['true', true],
        ['false', false],
        ['{}', {}],
        ['[]', []],
        ['NaN', NaN],
        ['function', () => {}],
        ['new String(\'\')', new String('')], // eslint-disable-line no-new-wrappers
    ]
    for (let [label, v] of BADVAL) {
        it(`should return null and not set the attribute when val is ${label}`, function() {
            let ele = env.mk('div')
            assert.strict.deepStrictEqual(domSetAttr(ele, 'a', v), null)
            assert.strict.deepStrictEqual(ele.getAttribute('a'), null)
            assert.strict.deepStrictEqual(ele.nSet.get('a'), undefined)
        })
    }

    //spec: ele非元素、attr非非空字串回null(既有行為不變), 不設屬性
    for (let [label, v] of NOT_ELE) {
        it(`should return null when ele is ${label}`, function() {
            assert.strict.deepStrictEqual(domSetAttr(v, 'a', 'x'), null)
        })
    }
    for (let [label, v] of NOT_ESTR) {
        if (typeof v === 'object' && v !== null && !Array.isArray(v) && Object.prototype.toString.call(v) === '[object String]') {
            continue //new String: isestr之既有行為(收包裝字串)不在本批(W-20另批)
        }
        it(`should return null and not set any attribute when attr is ${label}`, function() {
            let ele = env.mk('div')
            assert.strict.deepStrictEqual(domSetAttr(ele, v, 'x'), null)
            assert.strict.deepStrictEqual(ele.attrs.size, 0)
        })
    }

    //spec: setAttribute拋錯(如屬性名含非法字元)回null, 不外拋
    it(`should return null when setAttribute throws`, function() {
        let ele = env.mk('div')
        ele.setAttribute = () => {
            throw new Error('InvalidCharacterError')
        }
        assert.strict.deepStrictEqual(domSetAttr(ele, 'a b', 'x'), null)
    })

})
