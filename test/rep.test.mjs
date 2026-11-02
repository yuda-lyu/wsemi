import assert from 'assert'
import rep from '../src/rep.mjs'


//n為必須參數(使用者2026-11-02: 「rep repObj 本身意圖就是重複, 重複次數算必要參數」): 有效整數且為個數(iseint, use: 'count', 含0), 非預期throw Error('invalid n: must be a non-negative integer'), 訊息不帶值(K9)
//c非有效字串回傳'', 先於n之檢查(容器之處置不變)
describe(`rep`, function() {

    const MSG = 'invalid n: must be a non-negative integer'

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

    //c非有效字串回傳'', 先於n之檢查
    it(`should return '' when input '' (any n, including unexpected ones)`, function() {
        assert.strict.deepStrictEqual(rep('', 2), '')
        assert.strict.deepStrictEqual(rep(''), '')
        assert.strict.deepStrictEqual(rep('', Infinity), '')
    })

    it(`should return '' when input []`, function() {
        let r = rep([])
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input {}`, function() {
        let r = rep({})
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input null`, function() {
        let r = rep(null)
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input undefined`, function() {
        let r = rep(undefined)
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input NaN`, function() {
        let r = rep(NaN)
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when c is not a string even if n is valid or unexpected`, function() {
        assert.strict.deepStrictEqual(rep(123, 2), '')
        assert.strict.deepStrictEqual(rep(['abc'], 2), '')
        assert.strict.deepStrictEqual(rep(123, -1), '')
    })

})
