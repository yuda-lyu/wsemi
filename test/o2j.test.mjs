import assert from 'assert'
import o2j from '../src/o2j.mjs'
import { thrower, thrownCases } from './tools/codecThrown.mjs'
import { showDeep } from './tools/caseKit.mjs'


describe(`o2j`, function() {

    it(`should return '[1,"3","abc"]' when input [1, '3', 'abc']`, function() {
        let r = o2j([1, '3', 'abc'])
        let rr = '[1,"3","abc"]'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return '[1,"",null,null,[],{},"3","abc"]' when input [1, '', null, undefined, [], {}, '3', 'abc']`, function() {
        let r = o2j([1, '', null, undefined, [], {}, '3', 'abc'])
        let rr = '[1,"",null,null,[],{},"3","abc"]'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return '{"a":12.34,"b":"abc"}' when input { a: 12.34, b: 'abc' }`, function() {
        let r = o2j({ a: 12.34, b: 'abc' })
        let rr = '{"a":12.34,"b":"abc"}'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return '{"a":12.34,"b":"abc","c":"","d":null,"f":[],"g":{}}' when input { a: 12.34, b: 'abc', c: '', d: null, e: undefined, f: [], g: {} }`, function() {
        let r = o2j({ a: 12.34, b: 'abc', c: '', d: null, e: undefined, f: [], g: {} })
        let rr = '{"a":12.34,"b":"abc","c":"","d":null,"f":[],"g":{}}'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return '123' when input 123`, function() {
        let r = o2j(123)
        let rr = '123'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return '123.456' when input 123.456`, function() {
        let r = o2j(123.456)
        let rr = '123.456'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return '"123"' when input '123'`, function() {
        let r = o2j('123')
        let rr = '"123"'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return '"123.456"' when input '123.456'`, function() {
        let r = o2j('123.456')
        let rr = '"123.456"'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`sould return 'true' when input true`, function() {
        let r = o2j(true)
        let rr = 'true'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`sould return '""' when input ''`, function() {
        let r = o2j('')
        let rr = '""'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return '[]' when input []`, function() {
        let r = o2j([])
        let rr = '[]'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return '{}' when input {}`, function() {
        let r = o2j({})
        let rr = '{}'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 'null' when input null`, function() {
        let r = o2j(null)
        let rr = 'null'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return '' when input undefined`, function() {
        let r = o2j(undefined)
        let rr = ''
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return '' when input NaN`, function() {
        let r = o2j(NaN)
        let rr = 'null' //NaN是Number, 轉JSON字串會變成null
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return { state: 'success', msg } when input { a: 1 } with returnWithStateAndMsg`, function() {
        //opt為第3參數, 因第2參數bFormat為既有參數
        let r = o2j({ a: 1 }, false, { returnWithStateAndMsg: true })
        let rr = { state: 'success', msg: '{"a":1}' }
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return { state: 'error', msg: 'invalid v: must not be undefined' } when input undefined with returnWithStateAndMsg`, function() {
        let r = o2j(undefined, false, { returnWithStateAndMsg: true })
        let rr = { state: 'error', msg: 'invalid v: must not be undefined' }
        assert.strict.deepStrictEqual(r, rr)
    })

    //第559項④: 序列化失敗之msg為V19固定詞彙, 不含原生訊息(循環參照之原生訊息帶構造器名與屬性名, toJSON所拋之文字亦可能含輸入內容; V20)
    it(`should return { state: 'error', msg: 'invalid v: must be serializable to JSON' } when input an object with BigInt with returnWithStateAndMsg`, function() {
        let r = o2j({ id: 1n }, false, { returnWithStateAndMsg: true })
        assert.strict.deepStrictEqual(r, { state: 'error', msg: 'invalid v: must be serializable to JSON' })
    })

    it(`should fallback to the plain return value when returnWithStateAndMsg is not a boolean`, function() {
        let r = o2j({ a: 1 }, false, { returnWithStateAndMsg: 'yes' })
        let rr = '{"a":1}'
        assert.strict.deepStrictEqual(r, rr)
    })

})


describe(`o2j 呼叫端拋出任意值(R-CODEC-ERR-01之2)`, function() {

    for (let c of thrownCases) {
        it(`should not throw but return { state: 'error', msg: 'invalid v: must be serializable to JSON' } (not the thrown text '${c.msg}') when toJSON throws ${c.name} with returnWithStateAndMsg [R-CODEC-ERR-01之2, 第559項④]`, function() {
            //bFormat為false與true兩條序列化路徑皆須攔截; msg為固定詞彙(V19、V20), 不含呼叫端所拋出之文字
            for (let bFormat of [false, true]) {
                let v = { a: { toJSON: thrower(c.mk()) } }
                let r = null
                assert.doesNotThrow(() => {
                    r = o2j(v, bFormat, { returnWithStateAndMsg: true })
                })
                assert.strict.deepStrictEqual(showDeep(r), { state: 'error', msg: 'invalid v: must be serializable to JSON' })
            }
        })
    }

    for (let c of thrownCases) {
        it(`should not throw but return '' when toJSON throws ${c.name} without opt [R-CODEC-ERR-01之2]`, function() {
            let v = { a: { toJSON: thrower(c.mk()) } }
            let r = null
            assert.doesNotThrow(() => {
                r = o2j(v)
            })
            assert.strict.deepStrictEqual(showDeep(r), '')
        })
    }

    //第559項④: 循環參照之原生訊息帶構造器名與屬性名, 改為固定訊息; 原生細節經opt.funLog之診斷出口(預設靜默)
    it(`should not leak the constructor name and the property name of a circular structure in msg, and hand the detail only to opt.funLog (silent by default) [第559項④]`, function() {
        let SECRET = function Sec3tCtor() {}
        let o = new SECRET()
        o.sec3tProp = o
        let r = o2j(o, false, { returnWithStateAndMsg: true })
        assert.strict.deepStrictEqual(r, { state: 'error', msg: 'invalid v: must be serializable to JSON' })
        assert.strict.deepStrictEqual(JSON.stringify(r).includes('Sec3t'), false)
        let calls = []
        let rec = { log: [], warn: [], error: [] }
        let raw = { log: console.log, warn: console.warn, error: console.error }
        for (let k of Object.keys(rec)) {
            console[k] = (...a) => rec[k].push(a)
        }
        let r2
        let r3
        try {
            r3 = o2j(o, false, { returnWithStateAndMsg: true }) //未給funLog: 靜默
            r2 = o2j(o, false, { returnWithStateAndMsg: true, funLog: (label, safe, detail) => calls.push([label, safe, detail]) })
        }
        finally {
            for (let k of Object.keys(rec)) {
                console[k] = raw[k]
            }
        }
        assert.strict.deepStrictEqual(r2, { state: 'error', msg: 'invalid v: must be serializable to JSON' })
        assert.strict.deepStrictEqual(r3, r2)
        assert.strict.deepStrictEqual([rec.log.length, rec.warn.length, rec.error.length], [0, 0, 0])
        assert.strict.deepStrictEqual(calls.length, 1)
        assert.strict.deepStrictEqual([calls[0][0], calls[0][1]], ['[wsemi o2j] can not serialize', { errType: 'TypeError' }])
    })

})


describe(`o2j Error依JSON原生(R-CODEC-ERR-01之1a)`, function() {

    it(`should return '{}' when input new Error('x') [R-CODEC-ERR-01之1a]`, function() {
        //R-CODEC-ERR-01 規則1a: o2j維持JSON原生不轉, 一般Error為{}(JSON原生之設計事實, o2j JSDoc新句「Error依JSON原生只保留可列舉自有欄位(一般Error為{})」)
        assert.strict.deepStrictEqual(o2j(new Error('x')), '{}')
    })

    it(`should keep only enumerable own fields of a nested Error [R-CODEC-ERR-01之1a]`, function() {
        //R-CODEC-ERR-01 規則1a: Error只保留可列舉自有欄位(JSON原生之設計事實, o2j JSDoc新句)
        let err = new Error('boom')
        err.code = 'E1'
        let r = o2j({ err, msg: 'x' })
        assert.strict.deepStrictEqual(r, '{"err":{"code":"E1"},"msg":"x"}')
    })

})
