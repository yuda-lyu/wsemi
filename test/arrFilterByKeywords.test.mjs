import assert from 'assert'
import arrFilterByKeywords from '../src/arrFilterByKeywords.mjs'


describe(`arrFilterByKeywords`, function() {
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
    it(`should return ${JSON.stringify(dout[i])} when input ${JSON.stringify(arr)}, ${JSON.stringify(din[i])}`, function() {
        let j = 0
        let r = arrFilterByKeywords(arr, din[j])
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
    it(`should return ${JSON.stringify(dout[i])} when input ${JSON.stringify(arr)}, ${JSON.stringify(din[i])}`, function() {
        let j = 1
        let r = arrFilterByKeywords(arr, din[j])
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
    it(`should return ${JSON.stringify(dout[i])} when input ${JSON.stringify(arr)}, ${JSON.stringify(din[i])}`, function() {
        let j = 2
        let r = arrFilterByKeywords(arr, din[j])
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
    it(`should return ${JSON.stringify(dout[i])} when input ${JSON.stringify(arr)}, ${JSON.stringify(din[i])}`, function() {
        let j = 3
        let r = arrFilterByKeywords(arr, din[j])
        let rr = dout[j]
        assert.strict.deepStrictEqual(r, rr)
    })

    i++
    din[i] = 'def +yet'
    dout[i] = [
        { hasKeyword: false, weight: 0 },
        { hasKeyword: false, weight: 0 },
        { hasKeyword: true, weight: 1 },
        { hasKeyword: false, weight: 0 }
    ]
    it(`should return ${JSON.stringify(dout[i])} when input ${JSON.stringify(arr)}, ${JSON.stringify(din[i])}`, function() {
        let j = 4
        let r = arrFilterByKeywords(arr, din[j])
        let rr = dout[j]
        assert.strict.deepStrictEqual(r, rr)
        // assert.strict.deepStrictEqual(`${j}-${JSON.stringify(dout[j])}`, '')
    })

    i++
    din[i] = 'def of module -yet'
    dout[i] = [
        { hasKeyword: true, weight: 1 },
        { hasKeyword: true, weight: 1 },
        { hasKeyword: false, weight: 0 },
        { hasKeyword: true, weight: 1 }
    ]
    it(`should return ${JSON.stringify(dout[i])} when input ${JSON.stringify(arr)}, ${JSON.stringify(din[i])}`, function() {
        let j = 5
        let r = arrFilterByKeywords(arr, din[j])
        let rr = dout[j]
        assert.strict.deepStrictEqual(r, rr)
    })

    i++
    din[i] = '+'
    dout[i] = [
        { hasKeyword: false, weight: 0 },
        { hasKeyword: false, weight: 0 },
        { hasKeyword: false, weight: 0 },
        { hasKeyword: false, weight: 0 }
    ]
    it(`should return ${JSON.stringify(dout[i])} when input ${JSON.stringify(arr)}, ${JSON.stringify(din[i])}`, function() {
        let j = 6
        let r = arrFilterByKeywords(arr, din[j])
        let rr = dout[j]
        assert.strict.deepStrictEqual(r, rr)
    })

    i++
    din[i] = '-'
    dout[i] = [
        { hasKeyword: false, weight: 0 },
        { hasKeyword: false, weight: 0 },
        { hasKeyword: false, weight: 0 },
        { hasKeyword: false, weight: 0 }
    ]
    it(`should return ${JSON.stringify(dout[i])} when input ${JSON.stringify(arr)}, ${JSON.stringify(din[i])}`, function() {
        let j = 7
        let r = arrFilterByKeywords(arr, din[j])
        let rr = dout[j]
        assert.strict.deepStrictEqual(r, rr)
    })

    i++
    din[i] = 'def +'
    dout[i] = [
        { hasKeyword: true, weight: 1 },
        { hasKeyword: false, weight: 0 },
        { hasKeyword: false, weight: 0 },
        { hasKeyword: false, weight: 0 }
    ]
    it(`should return ${JSON.stringify(dout[i])} when input ${JSON.stringify(arr)}, ${JSON.stringify(din[i])}`, function() {
        let j = 8
        let r = arrFilterByKeywords(arr, din[j])
        let rr = dout[j]
        assert.strict.deepStrictEqual(r, rr)
    })

    i++
    din[i] = ['def', 'of', 'module', '-yet']
    dout[i] = [
        { hasKeyword: true, weight: 1 },
        { hasKeyword: true, weight: 1 },
        { hasKeyword: false, weight: 0 },
        { hasKeyword: true, weight: 1 }
    ]
    it(`should return ${JSON.stringify(dout[i])} when input ${JSON.stringify(arr)}, ${JSON.stringify(din[i])}`, function() {
        let j = 9
        let r = arrFilterByKeywords(arr, din[j])
        let rr = dout[j]
        assert.strict.deepStrictEqual(r, rr)
    })

    i++
    din[i] = ['can be', 'def']
    dout[i] = [
        { hasKeyword: true, weight: 0.25 },
        { hasKeyword: false, weight: 0 },
        { hasKeyword: false, weight: 0 },
        { hasKeyword: true, weight: 1 }
    ]
    it(`should return ${JSON.stringify(dout[i])} when input ${JSON.stringify(arr)}, ${JSON.stringify(din[i])}`, function() {
        let j = 10
        let r = arrFilterByKeywords(arr, din[j])
        let rr = dout[j]
        assert.strict.deepStrictEqual(r, rr)
    })

    i++
    din[i] = ['+abc']
    dout[i] = [
        { hasKeyword: true, weight: 1 },
        { hasKeyword: true, weight: 1 },
        { hasKeyword: false, weight: 0 },
        { hasKeyword: false, weight: 0 }
    ]
    it(`should return ${JSON.stringify(dout[i])} when input ${JSON.stringify(arr)}, ${JSON.stringify(din[i])}`, function() {
        let j = 11
        let r = arrFilterByKeywords(arr, din[j])
        let rr = dout[j]
        assert.strict.deepStrictEqual(r, rr)
    })

    i++
    din[i] = ['-abc']
    dout[i] = [
        { hasKeyword: false, weight: 0 },
        { hasKeyword: false, weight: 0 },
        { hasKeyword: true, weight: 1 },
        { hasKeyword: true, weight: 1 }
    ]
    it(`should return ${JSON.stringify(dout[i])} when input ${JSON.stringify(arr)}, ${JSON.stringify(din[i])}`, function() {
        let j = 12
        let r = arrFilterByKeywords(arr, din[j])
        let rr = dout[j]
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [] when input [], [2]`, function() {
        let r = arrFilterByKeywords([], [2])
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [] when input [], ''`, function() {
        let r = arrFilterByKeywords([], '')
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [] when input [], []`, function() {
        let r = arrFilterByKeywords([], [])
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [] when input [], {}`, function() {
        let r = arrFilterByKeywords([], {})
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [] when input [], null`, function() {
        let r = arrFilterByKeywords([], null)
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [] when input [], undefined`, function() {
        let r = arrFilterByKeywords([], undefined)
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [] when input ['abc'], ''`, function() {
        let r = arrFilterByKeywords(['abc'], '')
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [] when input ['abc'], []`, function() {
        let r = arrFilterByKeywords(['abc'], [])
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [] when input ['abc'], {}`, function() {
        let r = arrFilterByKeywords(['abc'], {})
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [] when input ['abc'], null`, function() {
        let r = arrFilterByKeywords(['abc'], null)
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [] when input ['abc'], undefined`, function() {
        let r = arrFilterByKeywords(['abc'], undefined)
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [] when input ''`, function() {
        let r = arrFilterByKeywords('')
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [] when input []`, function() {
        let r = arrFilterByKeywords([])
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [] when input {}`, function() {
        let r = arrFilterByKeywords({})
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [] when input null`, function() {
        let r = arrFilterByKeywords(null)
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [] when input undefined`, function() {
        let r = arrFilterByKeywords(undefined)
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

})
