import assert from 'assert'
import verifyValue from '../src/verifyValue.mjs'


describe(`verifyValue`, function() {
    let k
    let o = {}

    k = 3
    o[k] = {
        in1: 12.34,
        in2: 'any',
        out: {
            err: false,
            errmsg: '',
            value: 12.34
        }
    }
    it(`should return ${JSON.stringify(o[k].out)} when input ${JSON.stringify(o[k].in1)}, ${JSON.stringify(o[k].in2)}`, function() {
        let k = 3
        let r = verifyValue(o[k].in1, o[k].in2)
        let rr = o[k].out
        assert.strict.deepStrictEqual(r, rr)
    })

    k = 4
    o[k] = {
        in1: 'abc',
        in2: 'any',
        out: {
            err: false,
            errmsg: '',
            value: 'abc'
        }
    }
    it(`should return ${JSON.stringify(o[k].out)} when input ${JSON.stringify(o[k].in1)}, ${JSON.stringify(o[k].in2)}`, function() {
        let k = 4
        let r = verifyValue(o[k].in1, o[k].in2)
        let rr = o[k].out
        assert.strict.deepStrictEqual(r, rr)
    })

    k = 5
    o[k] = {
        in1: 'abc123',
        in2: 'isstr',
        out: {
            err: false,
            errmsg: '',
            value: 'abc123'
        }
    }
    it(`should return ${JSON.stringify(o[k].out)} when input ${JSON.stringify(o[k].in1)}, ${JSON.stringify(o[k].in2)}`, function() {
        let k = 5
        let r = verifyValue(o[k].in1, o[k].in2)
        let rr = o[k].out
        assert.strict.deepStrictEqual(r, rr)
    })

    k = 6
    o[k] = {
        in1: '12.34',
        in2: 'isnum',
        out: {
            err: false,
            errmsg: '',
            value: '12.34'
        }
    }
    it(`should return ${JSON.stringify(o[k].out)} when input ${JSON.stringify(o[k].in1)}, ${JSON.stringify(o[k].in2)}`, function() {
        let k = 6
        let r = verifyValue(o[k].in1, o[k].in2)
        let rr = o[k].out
        assert.strict.deepStrictEqual(r, rr)
    })

    k = 7
    o[k] = {
        in1: '0',
        in2: 'isp0num',
        out: {
            err: false,
            errmsg: '',
            value: '0'
        }
    }
    it(`should return ${JSON.stringify(o[k].out)} when input ${JSON.stringify(o[k].in1)}, ${JSON.stringify(o[k].in2)}`, function() {
        let k = 7
        let r = verifyValue(o[k].in1, o[k].in2)
        let rr = o[k].out
        assert.strict.deepStrictEqual(r, rr)
    })

    k = 8
    o[k] = {
        in1: '0.123',
        in2: 'isp0num',
        out: {
            err: false,
            errmsg: '',
            value: '0.123'
        }
    }
    it(`should return ${JSON.stringify(o[k].out)} when input ${JSON.stringify(o[k].in1)}, ${JSON.stringify(o[k].in2)}`, function() {
        let k = 8
        let r = verifyValue(o[k].in1, o[k].in2)
        let rr = o[k].out
        assert.strict.deepStrictEqual(r, rr)
    })

    k = 9
    o[k] = {
        in1: '0',
        in2: 'isn0num',
        out: {
            err: false,
            errmsg: '',
            value: '0'
        }
    }
    it(`should return ${JSON.stringify(o[k].out)} when input ${JSON.stringify(o[k].in1)}, ${JSON.stringify(o[k].in2)}`, function() {
        let k = 9
        let r = verifyValue(o[k].in1, o[k].in2)
        let rr = o[k].out
        assert.strict.deepStrictEqual(r, rr)
    })

    k = 10
    o[k] = {
        in1: '-0.123',
        in2: 'isn0num',
        out: {
            err: false,
            errmsg: '',
            value: '-0.123'
        }
    }
    it(`should return ${JSON.stringify(o[k].out)} when input ${JSON.stringify(o[k].in1)}, ${JSON.stringify(o[k].in2)}`, function() {
        let k = 10
        let r = verifyValue(o[k].in1, o[k].in2)
        let rr = o[k].out
        assert.strict.deepStrictEqual(r, rr)
    })

    k = 11
    o[k] = {
        in1: '0',
        in2: 'isint',
        out: {
            err: false,
            errmsg: '',
            value: '0'
        }
    }
    it(`should return ${JSON.stringify(o[k].out)} when input ${JSON.stringify(o[k].in1)}, ${JSON.stringify(o[k].in2)}`, function() {
        let k = 11
        let r = verifyValue(o[k].in1, o[k].in2)
        let rr = o[k].out
        assert.strict.deepStrictEqual(r, rr)
    })

    k = 12
    o[k] = {
        in1: '123',
        in2: 'isint',
        out: {
            err: false,
            errmsg: '',
            value: '123'
        }
    }
    it(`should return ${JSON.stringify(o[k].out)} when input ${JSON.stringify(o[k].in1)}, ${JSON.stringify(o[k].in2)}`, function() {
        let k = 12
        let r = verifyValue(o[k].in1, o[k].in2)
        let rr = o[k].out
        assert.strict.deepStrictEqual(r, rr)
    })

    k = 13
    o[k] = {
        in1: '123',
        in2: 'ispint',
        out: {
            err: false,
            errmsg: '',
            value: '123'
        }
    }
    it(`should return ${JSON.stringify(o[k].out)} when input ${JSON.stringify(o[k].in1)}, ${JSON.stringify(o[k].in2)}`, function() {
        let k = 13
        let r = verifyValue(o[k].in1, o[k].in2)
        let rr = o[k].out
        assert.strict.deepStrictEqual(r, rr)
    })

    k = 14
    o[k] = {
        in1: '-123',
        in2: 'isnint',
        out: {
            err: false,
            errmsg: '',
            value: '-123'
        }
    }
    it(`should return ${JSON.stringify(o[k].out)} when input ${JSON.stringify(o[k].in1)}, ${JSON.stringify(o[k].in2)}`, function() {
        let k = 14
        let r = verifyValue(o[k].in1, o[k].in2)
        let rr = o[k].out
        assert.strict.deepStrictEqual(r, rr)
    })

    k = 15
    o[k] = {
        in1: '0',
        in2: 'isp0int',
        out: {
            err: false,
            errmsg: '',
            value: '0'
        }
    }
    it(`should return ${JSON.stringify(o[k].out)} when input ${JSON.stringify(o[k].in1)}, ${JSON.stringify(o[k].in2)}`, function() {
        let k = 15
        let r = verifyValue(o[k].in1, o[k].in2)
        let rr = o[k].out
        assert.strict.deepStrictEqual(r, rr)
    })

    k = 16
    o[k] = {
        in1: '123',
        in2: 'isp0int',
        out: {
            err: false,
            errmsg: '',
            value: '123'
        }
    }
    it(`should return ${JSON.stringify(o[k].out)} when input ${JSON.stringify(o[k].in1)}, ${JSON.stringify(o[k].in2)}`, function() {
        let k = 16
        let r = verifyValue(o[k].in1, o[k].in2)
        let rr = o[k].out
        assert.strict.deepStrictEqual(r, rr)
    })

    k = 17
    o[k] = {
        in1: '0',
        in2: 'isn0int',
        out: {
            err: false,
            errmsg: '',
            value: '0'
        }
    }
    it(`should return ${JSON.stringify(o[k].out)} when input ${JSON.stringify(o[k].in1)}, ${JSON.stringify(o[k].in2)}`, function() {
        let k = 17
        let r = verifyValue(o[k].in1, o[k].in2)
        let rr = o[k].out
        assert.strict.deepStrictEqual(r, rr)
    })

    k = 18
    o[k] = {
        in1: '-123',
        in2: 'isn0int',
        out: {
            err: false,
            errmsg: '',
            value: '-123'
        }
    }
    it(`should return ${JSON.stringify(o[k].out)} when input ${JSON.stringify(o[k].in1)}, ${JSON.stringify(o[k].in2)}`, function() {
        let k = 18
        let r = verifyValue(o[k].in1, o[k].in2)
        let rr = o[k].out
        assert.strict.deepStrictEqual(r, rr)
    })

    k = 19
    o[k] = {
        in1: 'abc123',
        in2: function(v) {
            return v.substr(0, 3)
        },
        out: {
            err: false,
            errmsg: '',
            value: 'abc'
        }
    }
    it(`should return ${JSON.stringify(o[k].out)} when input ${JSON.stringify(o[k].in1)}, ${JSON.stringify(o[k].in2)}`, function() {
        let k = 19
        let r = verifyValue(o[k].in1, o[k].in2)
        let rr = o[k].out
        assert.strict.deepStrictEqual(r, rr)
    })

    k = 20
    o[k] = {
        in1: 12.34,
        in2: 'isnum',
        out: {
            err: false,
            errmsg: '',
            value: 12.34
        }
    }
    it(`should return ${JSON.stringify(o[k].out)} when input ${JSON.stringify(o[k].in1)}, ${JSON.stringify(o[k].in2)}`, function() {
        let k = 20
        let r = verifyValue(o[k].in1, o[k].in2)
        let rr = o[k].out
        assert.strict.deepStrictEqual(r, rr)
    })

    k = 21
    o[k] = {
        in1: 0,
        in2: 'isp0num',
        out: {
            err: false,
            errmsg: '',
            value: 0
        }
    }
    it(`should return ${JSON.stringify(o[k].out)} when input ${JSON.stringify(o[k].in1)}, ${JSON.stringify(o[k].in2)}`, function() {
        let k = 21
        let r = verifyValue(o[k].in1, o[k].in2)
        let rr = o[k].out
        assert.strict.deepStrictEqual(r, rr)
    })

    k = 22
    o[k] = {
        in1: 0.123,
        in2: 'isp0num',
        out: {
            err: false,
            errmsg: '',
            value: 0.123
        }
    }
    it(`should return ${JSON.stringify(o[k].out)} when input ${JSON.stringify(o[k].in1)}, ${JSON.stringify(o[k].in2)}`, function() {
        let k = 22
        let r = verifyValue(o[k].in1, o[k].in2)
        let rr = o[k].out
        assert.strict.deepStrictEqual(r, rr)
    })

    k = 23
    o[k] = {
        in1: 0,
        in2: 'isn0num',
        out: {
            err: false,
            errmsg: '',
            value: 0
        }
    }
    it(`should return ${JSON.stringify(o[k].out)} when input ${JSON.stringify(o[k].in1)}, ${JSON.stringify(o[k].in2)}`, function() {
        let k = 23
        let r = verifyValue(o[k].in1, o[k].in2)
        let rr = o[k].out
        assert.strict.deepStrictEqual(r, rr)
    })

    k = 24
    o[k] = {
        in1: -0.123,
        in2: 'isn0num',
        out: {
            err: false,
            errmsg: '',
            value: -0.123
        }
    }
    it(`should return ${JSON.stringify(o[k].out)} when input ${JSON.stringify(o[k].in1)}, ${JSON.stringify(o[k].in2)}`, function() {
        let k = 24
        let r = verifyValue(o[k].in1, o[k].in2)
        let rr = o[k].out
        assert.strict.deepStrictEqual(r, rr)
    })

    k = 25
    o[k] = {
        in1: 0,
        in2: 'isint',
        out: {
            err: false,
            errmsg: '',
            value: 0
        }
    }
    it(`should return ${JSON.stringify(o[k].out)} when input ${JSON.stringify(o[k].in1)}, ${JSON.stringify(o[k].in2)}`, function() {
        let k = 25
        let r = verifyValue(o[k].in1, o[k].in2)
        let rr = o[k].out
        assert.strict.deepStrictEqual(r, rr)
    })

    k = 26
    o[k] = {
        in1: 123,
        in2: 'isint',
        out: {
            err: false,
            errmsg: '',
            value: 123
        }
    }
    it(`should return ${JSON.stringify(o[k].out)} when input ${JSON.stringify(o[k].in1)}, ${JSON.stringify(o[k].in2)}`, function() {
        let k = 26
        let r = verifyValue(o[k].in1, o[k].in2)
        let rr = o[k].out
        assert.strict.deepStrictEqual(r, rr)
    })

    k = 27
    o[k] = {
        in1: 123,
        in2: 'ispint',
        out: {
            err: false,
            errmsg: '',
            value: 123
        }
    }
    it(`should return ${JSON.stringify(o[k].out)} when input ${JSON.stringify(o[k].in1)}, ${JSON.stringify(o[k].in2)}`, function() {
        let k = 27
        let r = verifyValue(o[k].in1, o[k].in2)
        let rr = o[k].out
        assert.strict.deepStrictEqual(r, rr)
    })

    k = 28
    o[k] = {
        in1: -123,
        in2: 'isnint',
        out: {
            err: false,
            errmsg: '',
            value: -123
        }
    }
    it(`should return ${JSON.stringify(o[k].out)} when input ${JSON.stringify(o[k].in1)}, ${JSON.stringify(o[k].in2)}`, function() {
        let k = 28
        let r = verifyValue(o[k].in1, o[k].in2)
        let rr = o[k].out
        assert.strict.deepStrictEqual(r, rr)
    })

    k = 29
    o[k] = {
        in1: 0,
        in2: 'isp0int',
        out: {
            err: false,
            errmsg: '',
            value: 0
        }
    }
    it(`should return ${JSON.stringify(o[k].out)} when input ${JSON.stringify(o[k].in1)}, ${JSON.stringify(o[k].in2)}`, function() {
        let k = 29
        let r = verifyValue(o[k].in1, o[k].in2)
        let rr = o[k].out
        assert.strict.deepStrictEqual(r, rr)
    })

    k = 30
    o[k] = {
        in1: 123,
        in2: 'isp0int',
        out: {
            err: false,
            errmsg: '',
            value: 123
        }
    }
    it(`should return ${JSON.stringify(o[k].out)} when input ${JSON.stringify(o[k].in1)}, ${JSON.stringify(o[k].in2)}`, function() {
        let k = 30
        let r = verifyValue(o[k].in1, o[k].in2)
        let rr = o[k].out
        assert.strict.deepStrictEqual(r, rr)
    })

    k = 31
    o[k] = {
        in1: 0,
        in2: 'isn0int',
        out: {
            err: false,
            errmsg: '',
            value: 0
        }
    }
    it(`should return ${JSON.stringify(o[k].out)} when input ${JSON.stringify(o[k].in1)}, ${JSON.stringify(o[k].in2)}`, function() {
        let k = 31
        let r = verifyValue(o[k].in1, o[k].in2)
        let rr = o[k].out
        assert.strict.deepStrictEqual(r, rr)
    })

    k = 32
    o[k] = {
        in1: -123,
        in2: 'isn0int',
        out: {
            err: false,
            errmsg: '',
            value: -123
        }
    }
    it(`should return ${JSON.stringify(o[k].out)} when input ${JSON.stringify(o[k].in1)}, ${JSON.stringify(o[k].in2)}`, function() {
        let k = 32
        let r = verifyValue(o[k].in1, o[k].in2)
        let rr = o[k].out
        assert.strict.deepStrictEqual(r, rr)
    })

    let q = {
        err: true,
        errmsg: '需要指定驗證類型',
        value: null,
    }
    it(`should return '' when input ''`, function() {
        let r = verifyValue('')
        assert.strict.deepStrictEqual(r, q)
    })

    it(`should return '' when input false`, function() {
        let r = verifyValue(false)
        assert.strict.deepStrictEqual(r, q)
    })

    it(`should return '' when input []`, function() {
        let r = verifyValue([])
        assert.strict.deepStrictEqual(r, q)
    })

    it(`should return '' when input [{}]`, function() {
        let r = verifyValue([{}])
        assert.strict.deepStrictEqual(r, q)
    })

    it(`should return '' when input [{ a: 123 }]`, function() {
        let r = verifyValue([{ a: 123 }])
        assert.strict.deepStrictEqual(r, q)
    })

    it(`should return '' when input ['']`, function() {
        let r = verifyValue([''])
        assert.strict.deepStrictEqual(r, q)
    })

    it(`should return '' when input ['abc']`, function() {
        let r = verifyValue(['abc'])
        assert.strict.deepStrictEqual(r, q)
    })

    it(`should return '' when input {}`, function() {
        let r = verifyValue({})
        assert.strict.deepStrictEqual(r, q)
    })

    it(`should return '' when input { a: 123 }`, function() {
        let r = verifyValue({ a: 123 })
        assert.strict.deepStrictEqual(r, q)
    })

    it(`should return '' when input { a: 123, b: null, c: [45.67] }`, function() {
        let r = verifyValue({ a: 123, b: null, c: [45.67] })
        assert.strict.deepStrictEqual(r, q)
    })

    it(`should return '' when input null`, function() {
        let r = verifyValue(null)
        assert.strict.deepStrictEqual(r, q)
    })

    it(`should return '' when input undefined`, function() {
        let r = verifyValue(undefined)
        assert.strict.deepStrictEqual(r, q)
    })

})
