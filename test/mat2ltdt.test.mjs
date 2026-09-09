import assert from 'assert'
import mat2ltdt from '../src/mat2ltdt.mjs'


describe(`mat2ltdt`, function() {
    let k
    let o = {}

    k = 1
    o[k] = {
        in: [['a', 'b'], [12, 34.56], ['x', '12.34']],
        out: [{ a: 12, b: 34.56 }, { a: 'x', b: '12.34' }]
    }
    it(`should return ${JSON.stringify(o[k].out)} when input ${JSON.stringify(o[k].in)}`, function() {
        k = 1
        let r = mat2ltdt(o[k].in)
        let rr = o[k].out
        assert.strict.deepStrictEqual(r, rr)
    })

    k = 2
    o[k] = {
        in: [['a', 'b'], [12, 34.56, 999], ['x', '12.34', 'abc']],
        out: [{ a: 12, b: 34.56 }, { a: 'x', b: '12.34' }]
    }
    it(`should return ${JSON.stringify(o[k].out)} when input ${JSON.stringify(o[k].in)}`, function() {
        k = 2
        let r = mat2ltdt(o[k].in)
        let rr = o[k].out
        assert.strict.deepStrictEqual(r, rr)
    })

    k = 3
    o[k] = {
        in: [['a', 'b', 'c'], [12, 34.56], ['x', '12.34']],
        out: [{ a: 12, b: 34.56, c: '' }, { a: 'x', b: '12.34', c: '' }]
    }
    it(`should return ${JSON.stringify(o[k].out)} when input ${JSON.stringify(o[k].in)}`, function() {
        k = 3
        let r = mat2ltdt(o[k].in)
        let rr = o[k].out
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`sould return [] when input ''`, function() {
        let r = mat2ltdt('')
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`sould return [] when input []`, function() {
        let r = mat2ltdt([])
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`sould return [] when input {}`, function() {
        let r = mat2ltdt({})
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`sould return [] when input null`, function() {
        let r = mat2ltdt(null)
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`sould return [] when input undefined`, function() {
        let r = mat2ltdt(undefined)
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`sould return [] when input NaN`, function() {
        let r = mat2ltdt(NaN)
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return { state: 'success', msg } when input a valid mat with returnWithStateAndMsg`, function() {
        let r = mat2ltdt([['a', 'b'], [1, 2]], { returnWithStateAndMsg: true })
        let rr = { state: 'success', msg: [{ a: 1, b: 2 }] }
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return { state: 'error', msg: 'invalid mat' } when input NaN with returnWithStateAndMsg`, function() {
        let r = mat2ltdt(NaN, { returnWithStateAndMsg: true })
        let rr = { state: 'error', msg: 'invalid mat' }
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return { state: 'error' } when mat has less than 2 rows with returnWithStateAndMsg`, function() {
        //原碼三種失敗皆回[], 與「本就轉出空陣列」無從分辨
        let r = mat2ltdt([['a', 'b']], { returnWithStateAndMsg: true })
        assert.strict.deepStrictEqual(r.state, 'error')
        assert.strict.deepStrictEqual(r.msg.indexOf('2 rows') >= 0, true, `msg 應標明列數不足, got ${r.msg}`)
    })

    it(`should return { state: 'error' } when any row is not an effective array with returnWithStateAndMsg`, function() {
        let r = mat2ltdt([['a', 'b'], NaN], { returnWithStateAndMsg: true })
        assert.strict.deepStrictEqual(r.state, 'error')
        assert.strict.deepStrictEqual(r.msg.indexOf('row') >= 0, true, `msg 應標明列無效, got ${r.msg}`)
    })

    it(`should fallback to the plain return value when returnWithStateAndMsg is not a boolean`, function() {
        let r = mat2ltdt([['a', 'b'], [1, 2]], { returnWithStateAndMsg: 'yes' })
        let rr = [{ a: 1, b: 2 }]
        assert.strict.deepStrictEqual(r, rr)
    })

})
