import assert from 'assert'
import strleft from '../src/strleft.mjs'


//n為類opt參數(預設即整串, 使用者2026-10-31裁定): 非預期之輸入(未給、null、負數、小數、Infinity、'0x2'、包裝物件、超出個數範圍)視為未給而取整串, 不報錯
describe(`strleft`, function() {

    it(`sould return 'te' when input 'test中文', 2`, function() {
        let r = strleft('test中文', 2)
        let rr = 'te'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`sould return 'test中文' when input 'test中文', 10`, function() {
        let r = strleft('test中文', 10)
        let rr = 'test中文'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`sould return '' when input 'test中文', 0`, function() {
        let r = strleft('test中文', 0)
        let rr = ''
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`sould return 'te' when input 'test中文', '2' and ' 2 ' (valid numeric strings, value used is the converted one)`, function() {
        assert.strict.deepStrictEqual(strleft('test中文', '2'), 'te')
        assert.strict.deepStrictEqual(strleft('test中文', ' 2 '), 'te')
    })

    it(`sould return '' when input 'test中文', '0'`, function() {
        assert.strict.deepStrictEqual(strleft('test中文', '0'), '')
    })

    //n非預期 -> 取整串(預設即整串)
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
        it(`sould return the whole string when n is unexpected: ${label}`, function() {
            let r
            assert.doesNotThrow(() => {
                r = strleft('test中文', n)
            })
            assert.strict.deepStrictEqual(r, 'test中文')
        })
    }

    it(`sould return the whole string when n is not given`, function() {
        assert.strict.deepStrictEqual(strleft('test中文'), 'test中文')
    })

    it(`sould return the whole string when n is 4294967295 (count max, valid)`, function() {
        assert.strict.deepStrictEqual(strleft('test中文', 4294967295), 'test中文')
    })

    it(`sould return '' when input ''`, function() {
        let r = strleft('')
        let rr = ''
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`sould return '' when input '', 2`, function() {
        assert.strict.deepStrictEqual(strleft('', 2), '')
    })

    it(`sould return '' when input []`, function() {
        let r = strleft([])
        let rr = ''
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`sould return '' when input {}`, function() {
        let r = strleft({})
        let rr = ''
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`sould return '' when input null`, function() {
        let r = strleft(null)
        let rr = ''
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`sould return '' when input undefined`, function() {
        let r = strleft(undefined)
        let rr = ''
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`sould return '' when input NaN`, function() {
        let r = strleft(NaN)
        let rr = ''
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`sould return '' when c is not a string even if n is valid`, function() {
        assert.strict.deepStrictEqual(strleft(123, 2), '')
        assert.strict.deepStrictEqual(strleft(['abc'], 2), '')
    })

})
