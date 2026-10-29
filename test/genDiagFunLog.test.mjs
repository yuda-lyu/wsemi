import assert from 'assert'
import genDiagFunLog from '../src/genDiagFunLog.mjs'
import diagSuite from './tools/diagSuite.mjs'


//genDiagFunLog為伺服端轉接器, 規則見sgud/rule/rulebook_diag.md之R-DIAG-01(主控裁示Q1: 只寫安全摘要)


describe(`genDiagFunLog`, function() {

    it(`should mark funLog with a read-only noDetail and declare only two parameters`, function() {
        //設計§6.7第5條、§3.8: funLog帶noDetail===true, 不宣告第3引數
        let { funLog } = genDiagFunLog(() => {})
        assert.strict.deepStrictEqual([funLog.noDetail, funLog.length], [true, 2])
        assert.strict.deepStrictEqual([Reflect.set(funLog, 'noDetail', false), funLog.noDetail], [false, true])
    })

    it(`should write safe as an object and drop non-object safe`, function() {
        //設計§3.8: safe寫為物件(不寫JSON字串); 非純物件之safe為undefined
        let rs = []
        let { funLog } = genDiagFunLog((o) => rs.push(o), { event: 1 })
        funLog('a', { s: 'x'.repeat(300), arr: Array.from({ length: 25 }, (v, i) => i), deep: { a: { b: { c: 1 } } } })
        funLog('b', 'str')
        assert.strict.deepStrictEqual(rs[0].event, 'orm-diag')
        assert.strict.deepStrictEqual([rs[0].safe.s.length, rs[0].safe.arr.length, rs[0].safe.arr[20], rs[0].safe.deep], [200, 21, '[Truncated]', { a: { b: '[Object]' } }])
        assert.strict.deepStrictEqual(rs[1].safe, undefined)
    })

    it(`should not run traps of a Proxy opt or of a Proxy returned by write (terra #29)`, function() {
        //設計§3.4.1: 可偵測之Proxy不觸發陷阱
        let n = 0
        let h = {
            getOwnPropertyDescriptor(t, k) {
                n++
                return Reflect.getOwnPropertyDescriptor(t, k)
            },
            getPrototypeOf(t) {
                n++
                return Reflect.getPrototypeOf(t)
            },
            get(t, k) {
                n++
                return Reflect.get(t, k)
            }
        }
        let rs = []
        let { funLog } = genDiagFunLog((o) => {
            rs.push(o.event)
            return new Proxy({}, h)
        }, new Proxy({ event: 'x' }, h))
        funLog('lb', {})
        assert.strict.deepStrictEqual([n, rs], [0, ['orm-diag']])
    })

    diagSuite('genDiagFunLog')

})
