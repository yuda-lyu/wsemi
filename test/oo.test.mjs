import assert from 'assert'
import oo from '../src/oo.mjs'


describe(`oo`, function() {

    it(`should return [1, '3', 'abc'] when input [1, '3', 'abc']`, function() {
        let r = oo([1, '3', 'abc'])
        let rr = [1, '3', 'abc']
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [1, '3', 'abc', null] when input [1, '3', 'abc', function(){}]`, function() {
        let r = oo([1, '3', 'abc', function() {}])
        let rr = [1, '3', 'abc', null]
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [1, '', null, null, [], {}, '3', 'abc'] when input [1, '', null, undefined, [], {}, '3', 'abc']`, function() {
        let r = oo([1, '', null, undefined, [], {}, '3', 'abc'])
        let rr = [1, '', null, null, [], {}, '3', 'abc']
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return { a: 12.34, b: 'abc' } when input { a: 12.34, b: 'abc' }`, function() {
        let r = oo({ a: 12.34, b: 'abc' })
        let rr = { a: 12.34, b: 'abc' }
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return { a: 12.34, b: 'abc' } when input { a: 12.34, b: 'abc', c: function(){} }`, function() {
        let r = oo({ a: 12.34, b: 'abc', c: function() {} })
        let rr = { a: 12.34, b: 'abc' }
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return { a: 12.34, b: 'abc', c: '', d: null, f: [], g: {} } when input { a: 12.34, b: 'abc', c: '', d: null, e: undefined, f: [], g: {} }`, function() {
        let r = oo({ a: 12.34, b: 'abc', c: '', d: null, e: undefined, f: [], g: {} })
        let rr = { a: 12.34, b: 'abc', c: '', d: null, f: [], g: {} }
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 123 when input 123`, function() {
        let r = oo(123)
        let rr = 123
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 123.456 when input 123.456`, function() {
        let r = oo(123.456)
        let rr = 123.456
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return '123' when input '123'`, function() {
        let r = oo('123')
        let rr = '123'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return '123.456' when input '123.456'`, function() {
        let r = oo('123.456')
        let rr = '123.456'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`sould return '' when input ''`, function() {
        let r = oo('')
        let rr = ''
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [] when input []`, function() {
        let r = oo([])
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return {} when input {}`, function() {
        let r = oo({})
        let rr = {}
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return null when input null`, function() {
        let r = oo(null)
        let rr = null
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return undefined when input undefined`, function() {
        let r = oo(undefined)
        assert.strict.deepStrictEqual(r, undefined)
    })

    it(`should return undefined when input NaN`, function() {
        let r = oo(NaN)
        let rr = null //NaN為Number, 故o2j轉會為'null', 再j2o反轉為null
        assert.strict.deepStrictEqual(r, rr)
    })

    describe(`failure behavior stated in the JSDoc (W-01, only documented: ws492j)`, function() {

        let circ = { a: 1 }
        circ.self = circ

        it(`should return {} for top-level values that can not be serialized (function, Symbol, BigInt, circular object, Map, Set)`, function() {
            // JSDoc: 不可序列化之頂層值回傳{}
            for (let v of [function() {}, () => 1, Symbol('s'), 10n, circ, new Map([[1, 2]]), new Set([1])]) {
                assert.strict.deepStrictEqual(oo(v), {})
            }
        })

        it(`should not tell success from failure by the returned value: {} for a legal empty object is the same as {} for a function`, function() {
            // JSDoc: {}亦為合法輸出, 無法由回傳值判斷成敗
            assert.strict.deepStrictEqual(oo({}), oo(function() {}))
        })

        it(`should map NaN and Infinity to null, Date to an ISO string, and drop functions in an object / null them in an array`, function() {
            assert.strict.deepStrictEqual([oo(NaN), oo(Infinity), oo(-Infinity)], [null, null, null])
            assert.strict.deepStrictEqual(oo(new Date(0)), '1970-01-01T00:00:00.000Z')
            assert.strict.deepStrictEqual(oo({ a: 1, f: function() {}, u: undefined, n: NaN }), { a: 1, n: null })
            assert.strict.deepStrictEqual(oo([1, function() {}, undefined, NaN]), [1, null, null, null])
        })

        it(`should keep the documented difference from lodash cloneDeep: Map becomes {}, the copy shares no reference`, function() {
            let src = { m: new Map([[1, 2]]), d: { x: [1, 2] } }
            let r = oo(src)
            assert.strict.deepStrictEqual(r, { m: {}, d: { x: [1, 2] } })
            assert.ok(r.d !== src.d && r.d.x !== src.d.x)
        })

        it(`should state in the JSDoc the failure behavior, the unreadable failure and the division of work with cloneDeep (documented text lock)`, async function() {
            let fs = await import('fs')
            let path = await import('path')
            let url = await import('url')
            let fp = path.join(path.dirname(url.fileURLToPath(import.meta.url)), '..', 'src', 'oo.mjs')
            let c = fs.readFileSync(fp, 'utf8')
            for (let s of ['失敗時不拋錯、不提供狀態', '而{}亦為合法輸出', '故無法由回傳值判斷成敗', '與lodash之cloneDeep之分工', '改以o2j(o, false, { returnWithStateAndMsg: true })']) {
                assert.strict.deepStrictEqual(c.split(s).length - 1, 1, s) //各句於JSDoc恰出現一次, 避免其他處相同片段使鎖定失效
            }
        })

    })

})
