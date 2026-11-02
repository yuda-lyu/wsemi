import assert from 'assert'
import repObj from '../src/repObj.mjs'


//n為必須參數(使用者2026-11-02: 「rep repObj 本身意圖就是重複, 重複次數算必要參數」): 有效整數且為個數(iseint, use: 'count', 0~4294967295; 0回傳[], 與rep之0回傳''對稱; 下限原為1, ws272c主控判定改收0), 非預期throw Error('invalid n: must be a non-negative integer'), 訊息不帶值(K9)
//o為空(iser: undefined、null、''、[]、{}、NaN)回傳[], 先於n之檢查(容器之處置不變)
describe(`repObj`, function() {

    const MSG = 'invalid n: must be a non-negative integer'

    it(`should return [] when n is 0 or '0' (repeat zero times, symmetric to rep returning ''; master decision ws272c)`, function() {
        assert.strict.deepStrictEqual(repObj({ a: 12.45, b: 'opqr' }, 0), [])
        assert.strict.deepStrictEqual(repObj({ a: 12.45, b: 'opqr' }, '0'), [])
        assert.strict.deepStrictEqual(repObj('abc', ' 0 '), [])
        assert.strict.deepStrictEqual(repObj('abc', -0), [])
    })

    it(`should return [{ a: 12.45, b: 'opqr' }, { a: 12.45, b: 'opqr' }] when input { a: 12.45, b: 'opqr' }, 2`, function() {
        let r = repObj({ a: 12.45, b: 'opqr' }, 2)
        assert.strict.deepStrictEqual(r, [{ a: 12.45, b: 'opqr' }, { a: 12.45, b: 'opqr' }])
    })

    it(`should return 1 item when input 'abc', 1`, function() {
        assert.strict.deepStrictEqual(repObj('abc', 1), ['abc'])
    })

    it(`should return 2 items when n is the valid numeric string '2', ' 2 ' and '2.0' (value used is the converted one)`, function() {
        assert.strict.deepStrictEqual(repObj('abc', '2'), ['abc', 'abc'])
        assert.strict.deepStrictEqual(repObj('abc', ' 2 '), ['abc', 'abc'])
        assert.strict.deepStrictEqual(repObj('abc', '2.0'), ['abc', 'abc'])
    })

    it(`should return ['abc', 'abc'] when input 'abc', 2`, function() {
        let r = repObj('abc', 2)
        assert.strict.deepStrictEqual(r, ['abc', 'abc'])
    })

    it(`should return [12.34, 12.34] when input 12.34, 2`, function() {
        let r = repObj(12.34, 2)
        assert.strict.deepStrictEqual(r, [12.34, 12.34])
    })

    //n非預期 -> throw, 訊息固定不帶值(0為有效, 見上)
    for (let [label, n] of [
        ['-1', -1],
        ['-0.5', -0.5],
        ['1.5', 1.5],
        [`'1.5'`, '1.5'],
        ['Infinity', Infinity],
        ['-Infinity', -Infinity],
        ['NaN', NaN],
        [`'Infinity'`, 'Infinity'],
        [`'0x2'`, '0x2'],
        [`'0b11'`, '0b11'],
        [`'1e400'`, '1e400'],
        [`''`, ''],
        [`' '`, ' '],
        [`'abc'`, 'abc'],
        ['[]', []],
        ['[2]', [2]],
        ['{}', {}],
        ['null', null],
        ['undefined', undefined],
        ['true', true],
        ['false', false],
        ['new Number(2)', new Number(2)], // eslint-disable-line no-new-wrappers
        //4294967296(個數上限+1)修前為合法之超大個數而使lodash times配置巨大陣列, 於mocha行程內耗盡記憶體崩潰, 故由intInputHangG6.test.mjs之子行程案例驗證, 此處不含
        ['2 ** 53', 2 ** 53],
        ['1n', 1n],
        ['Symbol()', Symbol('x')],
        ['() => 2', () => 2],
    ]) {
        it(`should throw '${MSG}' when n is unexpected: ${label}`, function() {
            assert.throws(() => repObj({ a: 12.45, b: 'opqr' }, n), (err) => {
                assert.strict.deepStrictEqual(err instanceof Error, true)
                assert.strict.deepStrictEqual(err.message, MSG)
                return true
            })
        })
    }

    it(`should throw when n is not given (required parameter)`, function() {
        assert.throws(() => repObj('abc'), { message: MSG })
    })

    it(`the error message should not carry the input value`, function() {
        let secret = 'SECRET-VALUE-123'
        assert.throws(() => repObj('abc', secret), (err) => {
            assert.ok(!err.message.includes(secret), err.message)
            assert.strict.deepStrictEqual(err.message, MSG)
            return true
        })
    })

    //o為空回傳[], 先於n之檢查
    it(`should return [] when input '', 2`, function() {
        let r = repObj('', 2)
        assert.strict.deepStrictEqual(r, [])
    })

    it(`should return [] when input [], 2`, function() {
        let r = repObj([], 2)
        assert.strict.deepStrictEqual(r, [])
    })

    it(`should return [] when input {}, 2`, function() {
        let r = repObj({}, 2)
        assert.strict.deepStrictEqual(r, [])
    })

    it(`should return [] when input null, 2`, function() {
        let r = repObj(null, 2)
        assert.strict.deepStrictEqual(r, [])
    })

    it(`should return [] when input undefined, 2`, function() {
        let r = repObj(undefined, 2)
        assert.strict.deepStrictEqual(r, [])
    })

    it(`should return [] when input '' (any n, including unexpected ones)`, function() {
        let r = repObj('')
        assert.strict.deepStrictEqual(r, [])
        assert.strict.deepStrictEqual(repObj('', -1), [])
        assert.strict.deepStrictEqual(repObj('', Infinity), [])
    })

    it(`should return [] when input []`, function() {
        let r = repObj([])
        assert.strict.deepStrictEqual(r, [])
    })

    it(`should return [] when input {}`, function() {
        let r = repObj({})
        assert.strict.deepStrictEqual(r, [])
    })

    it(`should return [] when input null`, function() {
        let r = repObj(null)
        assert.strict.deepStrictEqual(r, [])
    })

    it(`should return [] when input undefined`, function() {
        let r = repObj(undefined)
        assert.strict.deepStrictEqual(r, [])
    })

    it(`should return [] when input NaN`, function() {
        let r = repObj(NaN)
        assert.strict.deepStrictEqual(r, [])
    })

})
