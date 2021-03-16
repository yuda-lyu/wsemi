import assert from 'assert'
import arrfilter from '../src/arrfilter.mjs'


describe(`arrfilter`, function() {
    let i = -1
    let din = {}
    let dout = {}
    let arr = [
        'abc def xyz',
        '測試abc中文mnop',
        'Instead of creating yet another opinionated application',
        'Node.js module which can be integrated into a larger application',
    ]

    i++
    din[i] = 'abc'
    dout[i] = [
        { hasKeyword: true, weight: 1 },
        { hasKeyword: true, weight: 1 },
        { hasKeyword: false, weight: 0 },
        { hasKeyword: false, weight: 0 }
    ]
    it(`should return ${dout[i]} when input ${arr}, ${din[i]}`, function() {
        let j = 0
        let r = arrfilter(arr, din[j])
        let rr = dout[j]
        assert.strict.deepStrictEqual(r, rr)
    })

    i++
    din[i] = 'def'
    dout[i] = [
        { hasKeyword: true, weight: 1 },
        { hasKeyword: false, weight: 0 },
        { hasKeyword: false, weight: 0 },
        { hasKeyword: false, weight: 0 }
    ]
    it(`should return ${dout[i]} when input ${arr}, ${din[i]}`, function() {
        let j = 1
        let r = arrfilter(arr, din[j])
        let rr = dout[j]
        assert.strict.deepStrictEqual(r, rr)
    })

    i++
    din[i] = 'def 中文'
    dout[i] = [
        { hasKeyword: true, weight: 1 },
        { hasKeyword: true, weight: 0.25 },
        { hasKeyword: false, weight: 0 },
        { hasKeyword: false, weight: 0 }
    ]
    it(`should return ${dout[i]} when input ${arr}, ${din[i]}`, function() {
        let j = 2
        let r = arrfilter(arr, din[j])
        let rr = dout[j]
        assert.strict.deepStrictEqual(r, rr)
    })

    i++
    din[i] = 'def 中文 mnop'
    dout[i] = [
        { hasKeyword: true, weight: 1 },
        { hasKeyword: true, weight: 0.5555555555555557 },
        { hasKeyword: false, weight: 0 },
        { hasKeyword: false, weight: 0 }
    ]
    it(`should return ${dout[i]} when input ${arr}, ${din[i]}`, function() {
        let j = 3
        let r = arrfilter(arr, din[j])
        let rr = dout[j]
        assert.strict.deepStrictEqual(r, rr)
    })

    i++
    din[i] = 'def +yet'
    dout[i] = [
        { hasKeyword: false, weight: 0 },
        { hasKeyword: false, weight: 0 },
        { hasKeyword: true, weight: 0.25 },
        { hasKeyword: false, weight: 0 }
    ]
    it(`should return ${dout[i]} when input ${arr}, ${din[i]}`, function() {
        let j = 3
        let r = arrfilter(arr, din[j])
        let rr = dout[j]
        assert.strict.deepStrictEqual(r, rr)
    })

    i++
    din[i] = 'def of module -yet'
    dout[i] = [
        { hasKeyword: true, weight: 1 },
        { hasKeyword: false, weight: 0 },
        { hasKeyword: false, weight: 0 },
        { hasKeyword: true, weight: 0.25 }
    ]
    it(`should return ${dout[i]} when input ${arr}, ${din[i]}`, function() {
        let j = 4
        let r = arrfilter(arr, din[j])
        let rr = dout[j]
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [] when input []`, function() {
        let r = arrfilter([])
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [] when input [], [2]`, function() {
        let r = arrfilter([], [2])
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [] when input ''`, function() {
        let r = arrfilter('')
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [] when input []`, function() {
        let r = arrfilter([])
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [] when input {}`, function() {
        let r = arrfilter({})
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [] when input null`, function() {
        let r = arrfilter(null)
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [] when input undefined`, function() {
        let r = arrfilter(undefined)
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [] when input [], ''`, function() {
        let r = arrfilter([], '')
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [] when input [], []`, function() {
        let r = arrfilter([], [])
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [] when input [], {}`, function() {
        let r = arrfilter([], {})
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [] when input [], null`, function() {
        let r = arrfilter([], null)
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [] when input [], undefined`, function() {
        let r = arrfilter([], undefined)
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [] when input ['abc'], ''`, function() {
        let r = arrfilter(['abc'], '')
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [] when input ['abc'], []`, function() {
        let r = arrfilter(['abc'], [])
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [] when input ['abc'], {}`, function() {
        let r = arrfilter(['abc'], {})
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [] when input ['abc'], null`, function() {
        let r = arrfilter(['abc'], null)
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [] when input ['abc'], undefined`, function() {
        let r = arrfilter(['abc'], undefined)
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

})
