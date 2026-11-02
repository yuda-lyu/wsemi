import assert from 'assert'
import rep from '../src/rep.mjs'


//n為必須參數(使用者2026-11-02: 「rep repObj 本身意圖就是重複, 重複次數算必要參數」): 有效整數且為個數(iseint, use: 'count', 含0), 非預期throw Error('invalid n: must be a non-negative integer'), 訊息不帶值(K9)
//ws286b: c為必須參數(使用者2026-11-02逐列確認): c非字串throw Error('invalid c: must be a string'), 訊息不帶值, 先於n之檢查; c為''回傳''(不變), 但n仍須有效(rep('', 'x')因n無效throw)
describe(`rep`, function() {

    const MSG = 'invalid n: must be a non-negative integer'
    const MSG_C = 'invalid c: must be a string'

    it(`should return 'abcabc' when input 'abc', 2`, function() {
        let r = rep('abc', 2)
        assert.strict.deepStrictEqual(r, 'abcabc')
    })

    it(`should return '' when input 'abc', 0 (0 times is valid)`, function() {
        let r = rep('abc', 0)
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return 'abcabc' when n is the valid numeric string '2', ' 2 ' and '2.0' (value used is the converted one)`, function() {
        assert.strict.deepStrictEqual(rep('abc', '2'), 'abcabc')
        assert.strict.deepStrictEqual(rep('abc', ' 2 '), 'abcabc')
        assert.strict.deepStrictEqual(rep('abc', '2.0'), 'abcabc')
        assert.strict.deepStrictEqual(rep('abc', '0'), '')
    })

    it(`should return 'a' repeated 1000 times when input 'a', 1000`, function() {
        assert.strict.deepStrictEqual(rep('a', 1000), 'a'.repeat(1000))
    })

    //n非預期 -> throw, 訊息固定不帶值
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
        ['4294967296 (over count max)', 4294967296],
        ['2 ** 53', 2 ** 53],
        ['1n', 1n],
        ['Symbol()', Symbol('x')],
        ['() => 2', () => 2],
    ]) {
        it(`should throw '${MSG}' when n is unexpected: ${label}`, function() {
            assert.throws(() => rep('abc', n), (err) => {
                assert.strict.deepStrictEqual(err instanceof Error, true)
                assert.strict.deepStrictEqual(err.message, MSG)
                return true
            })
        })
    }

    it(`should throw when n is not given (required parameter)`, function() {
        assert.throws(() => rep('abc'), { message: MSG })
    })

    it(`the error message should not carry the input value`, function() {
        let secret = 'SECRET-VALUE-123'
        assert.throws(() => rep('abc', secret), (err) => {
            assert.ok(!err.message.includes(secret), err.message)
            assert.strict.deepStrictEqual(err.message, MSG)
            return true
        })
    })

    //c為''回傳'', 但n仍須有效(必須參數於c為''時亦檢測)
    it(`should return '' when c is '' and n is valid`, function() {
        assert.strict.deepStrictEqual(rep('', 2), '')
        assert.strict.deepStrictEqual(rep('', 0), '')
        assert.strict.deepStrictEqual(rep('', '3'), '')
    })

    it(`should throw ${MSG} when c is '' but n is unexpected (n is still a required parameter)`, function() {
        assert.throws(() => rep('', 'x'), { message: MSG })
        assert.throws(() => rep(''), { message: MSG })
        assert.throws(() => rep('', Infinity), { message: MSG })
        assert.throws(() => rep('', -1), { message: MSG })
    })

    //c非字串 -> throw('invalid c: must be a string'), 先於n之檢查(n有效或無效皆然), 訊息固定不帶值
    for (let [label, c] of [
        ['123', 123],
        ['0', 0],
        ['NaN', NaN],
        ['true', true],
        ['null', null],
        ['undefined', undefined],
        ['[]', []],
        [`['abc']`, ['abc']],
        ['{}', {}],
        ['() => 1', () => 1],
        ['Symbol()', Symbol('x')],
        ['1n', 1n],
    ]) {
        it(`should throw '${MSG_C}' when c is not a string: ${label} (n valid, unexpected or not given)`, function() {
            for (let n of [2, 0, -1, Infinity, 'x', undefined]) {
                assert.throws(() => rep(c, n), (err) => {
                    assert.strict.deepStrictEqual(err instanceof Error, true)
                    assert.strict.deepStrictEqual(err.message, MSG_C)
                    return true
                })
            }
            assert.throws(() => rep(c), { message: MSG_C })
        })
    }

    it(`should throw ${MSG_C} for rep(123, 2), rep([], 2), rep({}), rep(null), rep(undefined), rep(NaN)`, function() {
        assert.throws(() => rep(123, 2), { message: MSG_C })
        assert.throws(() => rep([], 2), { message: MSG_C })
        assert.throws(() => rep({}), { message: MSG_C })
        assert.throws(() => rep(null), { message: MSG_C })
        assert.throws(() => rep(undefined), { message: MSG_C })
        assert.throws(() => rep(NaN), { message: MSG_C })
    })

    it(`the error message of c should not carry the input value`, function() {
        assert.throws(() => rep({ secret: 'SECRET-VALUE-123' }, 2), (err) => {
            assert.ok(!err.message.includes('SECRET'), err.message)
            assert.strict.deepStrictEqual(err.message, MSG_C)
            return true
        })
    })

})
