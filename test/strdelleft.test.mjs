import assert from 'assert'
import strdelleft from '../src/strdelleft.mjs'


//n為類opt參數(預設0即不刪, 使用者2026-11-02: strdelleft之n無效→視為刪0字、回原字串): 非預期之輸入(未給、null、負數、小數、Infinity、'0x2'、包裝物件、超出個數範圍)視為未給而回傳原字串, 不報錯
//n大於字串長度則回傳''(維持); 其內部以strright(c, c.length - n)轉呼叫, 須Math.max(0, …)使n大於長度時不變成整串
describe(`strdelleft`, function() {

    it(`sould return 'st中文' when input 'test中文', 2`, function() {
        let r = strdelleft('test中文', 2)
        let rr = 'st中文'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`sould return '' when input 'test中文', 10 (n is larger than the length)`, function() {
        let r = strdelleft('test中文', 10)
        let rr = ''
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`sould return '' when n equals the length, and 'x' when n is length - 1`, function() {
        assert.strict.deepStrictEqual(strdelleft('test中文', 6), '')
        assert.strict.deepStrictEqual(strdelleft('test中文', 5), '文')
        assert.strict.deepStrictEqual(strdelleft('test中文', 7), '')
    })

    it(`sould return 'test中文' when input 'test中文', 0`, function() {
        let r = strdelleft('test中文', 0)
        let rr = 'test中文'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`sould return 'st中文' when input 'test中文', '2' and ' 2 ' (valid numeric strings, value used is the converted one)`, function() {
        assert.strict.deepStrictEqual(strdelleft('test中文', '2'), 'st中文')
        assert.strict.deepStrictEqual(strdelleft('test中文', ' 2 '), 'st中文')
    })

    it(`sould return '' when input 'test中文', '10' (numeric string larger than the length)`, function() {
        assert.strict.deepStrictEqual(strdelleft('test中文', '10'), '')
    })

    it(`sould return 'test中文' when input 'test中文', '0'`, function() {
        assert.strict.deepStrictEqual(strdelleft('test中文', '0'), 'test中文')
    })

    //n非預期 -> 視為刪0字, 回原字串
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
        it(`sould return the original string when n is unexpected: ${label}`, function() {
            let r
            assert.doesNotThrow(() => {
                r = strdelleft('test中文', n)
            })
            assert.strict.deepStrictEqual(r, 'test中文')
        })
    }

    it(`sould return the original string when n is not given`, function() {
        assert.strict.deepStrictEqual(strdelleft('test中文'), 'test中文')
    })

    it(`sould return '' when n is 4294967295 (count max, valid, larger than the length)`, function() {
        assert.strict.deepStrictEqual(strdelleft('test中文', 4294967295), '')
    })

    it(`sould return '' when input ''`, function() {
        let r = strdelleft('')
        let rr = ''
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`sould return '' when input []`, function() {
        let r = strdelleft([])
        let rr = ''
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`sould return '' when input {}`, function() {
        let r = strdelleft({})
        let rr = ''
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`sould return '' when input null`, function() {
        let r = strdelleft(null)
        let rr = ''
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`sould return '' when input undefined`, function() {
        let r = strdelleft(undefined)
        let rr = ''
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`sould return '' when input NaN`, function() {
        let r = strdelleft(NaN)
        let rr = ''
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`sould return '' when c is not a string even if n is valid`, function() {
        assert.strict.deepStrictEqual(strdelleft(123, 2), '')
        assert.strict.deepStrictEqual(strdelleft(['abc'], 2), '')
    })

})
