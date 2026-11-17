import assert from 'assert'
import domElementsFromPoint from '../src/domElementsFromPoint.mjs'
import { mkQueryEnv } from './tools/domArgKit.mjs'


//ws492e: W-17(使用者2026-11-16「甲」): 查詢類比照domIsFocused, 座標須為有效數字(isenum＋cdbl), 無效回[]、不拋錯、不呼叫原生API(原生會把null、''、true、[]強制轉成0或1)
//  規格: dspec〈輸入參數之檢測機制〉§11 W-17、K4(檢測之值即使用之值)、Q3-c(數值檢測通過即轉型)
//  DOM測試作法: 以最小假DOM(mkQueryEnv)驅動, document.elementsFromPoint以計數與記錄引數之替身包裝; 真實命中判定屬瀏覽器語義, 另以真瀏覽器實測
describe(`domElementsFromPoint`, function() {

    let env = null
    let calls = null

    beforeEach(function() {
        env = mkQueryEnv()
        calls = []
        let raw = env.document.elementsFromPoint
        env.document.elementsFromPoint = (x, y) => {
            calls.push([x, y])
            return raw(x, y)
        }
    })

    afterEach(function() {
        env.restore()
    })

    //無效座標(非有效數字)
    let BAD = [
        ['undefined', undefined],
        ['null', null],
        [`''`, ''],
        [`'  '`, '  '],
        ['true', true],
        ['false', false],
        ['[]', []],
        ['[1]', [1]],
        ['{}', {}],
        ['NaN', NaN],
        ['Infinity', Infinity],
        ['-Infinity', -Infinity],
        [`'Infinity'`, 'Infinity'],
        [`'0x10'`, '0x10'],
        [`'abc'`, 'abc'],
        [`'12abc'`, '12abc'],
        ['new Number(5)', new Number(5)], // eslint-disable-line no-new-wrappers
        ['function', () => 5],
        ['Symbol', Symbol('x')],
    ]

    //spec: clientX或clientY無效回[], 不拋錯, 不呼叫document.elementsFromPoint
    for (let [label, v] of BAD) {
        it(`should return [] without calling document.elementsFromPoint when clientX is ${label}`, function() {
            let r = null
            assert.doesNotThrow(() => {
                r = domElementsFromPoint(v, 10)
            })
            assert.strict.deepStrictEqual(r, [])
            assert.strict.deepStrictEqual(calls.length, 0)
        })
        it(`should return [] without calling document.elementsFromPoint when clientY is ${label}`, function() {
            let r = null
            assert.doesNotThrow(() => {
                r = domElementsFromPoint(10, v)
            })
            assert.strict.deepStrictEqual(r, [])
            assert.strict.deepStrictEqual(calls.length, 0)
        })
    }

    //spec: 有效座標回document.elementsFromPoint之結果
    it(`should return the elements at the point (top to bottom)`, function() {
        let a = env.mk('div')
        let b = env.mk('span')
        env.setStack(10, 20, [a, b])
        let r = domElementsFromPoint(10, 20)
        assert.strict.deepStrictEqual(r, [a, b])
        assert.strict.deepStrictEqual(calls, [[10, 20]])
    })

    //spec(K4): 數字字串通過檢測後以數字(cdbl)交給原生API
    it(`should convert numeric strings to numbers before calling document.elementsFromPoint`, function() {
        let a = env.mk('div')
        env.setStack(12.5, -3, [a])
        let r = domElementsFromPoint(' 12.5 ', '-3')
        assert.strict.deepStrictEqual(r, [a])
        assert.strict.deepStrictEqual(calls, [[12.5, -3]])
        assert.strict.deepStrictEqual(typeof calls[0][0], 'number')
        assert.strict.deepStrictEqual(typeof calls[0][1], 'number')
    })

    it(`should accept 0 and negative coordinates as valid numbers`, function() {
        env.setStack(0, 0, [env.body])
        assert.strict.deepStrictEqual(domElementsFromPoint(0, 0), [env.body])
        assert.strict.deepStrictEqual(domElementsFromPoint(-1, -1), [])
        assert.strict.deepStrictEqual(calls.length, 2)
    })

    //spec: 原生API拋錯回[]不外拋、不輸出console(查詢類, 同domFind; 內部獨立複審#6: 原維持console.log(err))
    it(`should return [] without logging when document.elementsFromPoint throws`, function() {
        env.document.elementsFromPoint = () => {
            throw new Error('native-boom')
        }
        let logs = []
        let raw = console.log
        console.log = (...a) => {
            logs.push(a)
        }
        try {
            assert.strict.deepStrictEqual(domElementsFromPoint(1, 2), [])
        }
        finally {
            console.log = raw
        }
        assert.strict.deepStrictEqual(logs, [])
    })

    //spec: 無document不拋錯、不輸出console, 回[]
    it(`should return [] without logging when document is not defined`, function() {
        let logs = []
        let raw = console.log
        console.log = (...a) => {
            logs.push(a)
        }
        try {
            env.restore()
            assert.strict.deepStrictEqual(domElementsFromPoint(1, 2), [])
        }
        finally {
            console.log = raw
        }
        assert.strict.deepStrictEqual(logs, [])
    })

})
