import assert from 'assert'
import genGradientColor from '../src/genGradientColor.mjs'


describe(`genGradientColor`, function() {
    let k
    let inp = []
    let out = []

    k = 1
    inp[k] = '#ff'
    out[k] = {
        linearGradient: { x1: 0, x2: 0, y1: 0, y2: 1 },
        stops: [[0, 'rgba(255, 255, 255, 0.4)'], [1, 'rgba(255, 255, 255, 0.9)']]
    }
    it(`should return ${JSON.stringify(out[k])} when input '${inp[k]}'`, function() {
        k = 1
        let r = genGradientColor(inp[k])
        let rr = out[k]
        assert.strict.deepStrictEqual(r, rr)
    })

    k = 1
    inp[k] = '#000'
    out[k] = {
        linearGradient: { x1: 0, x2: 0, y1: 0, y2: 1 },
        stops: [[0, 'rgba(0, 0, 0, 0.4)'], [1, 'rgba(0, 0, 0, 0.9)']]
    }
    it(`should return ${JSON.stringify(out[k])} when input '${inp[k]}'`, function() {
        k = 1
        let r = genGradientColor(inp[k])
        let rr = out[k]
        assert.strict.deepStrictEqual(r, rr)
    })

    k = 2
    inp[k] = 'hsl (320, 50%, 40%)'
    out[k] = {
        linearGradient: { x1: 0, x2: 0, y1: 0, y2: 1 },
        stops: [
            [0, 'rgba(153, 51, 119, 0.4)'],
            [1, 'rgba(153, 51, 119, 0.9)']
        ]
    }
    it(`should return ${JSON.stringify(out[k])} when input '${inp[k]}'`, function() {
        k = 2
        let r = genGradientColor(inp[k])
        let rr = out[k]
        assert.strict.deepStrictEqual(r, rr)
    })

    k = 3
    inp[k] = 'hsva (320, 100%, 50%, 0.1)'
    out[k] = {
        linearGradient: { x1: 0, x2: 0, y1: 0, y2: 1 },
        stops: [[0, 'rgba(128, 0, 85, 0.4)'], [1, 'rgba(128, 0, 85, 0.9)']]
    }
    it(`should return ${JSON.stringify(out[k])} when input '${inp[k]}'`, function() {
        k = 3
        let r = genGradientColor(inp[k])
        let rr = out[k]
        assert.strict.deepStrictEqual(r, rr)
    })

    k = 4
    inp[k] = '#6a3'
    out[k] = {
        linearGradient: { x1: 0, x2: 0, y1: 0, y2: 1 },
        stops: [
            [0, 'rgba(102, 170, 51, 0.4)'],
            [1, 'rgba(102, 170, 51, 0.9)']
        ]
    }
    it(`should return ${JSON.stringify(out[k])} when input '${inp[k]}'`, function() {
        k = 4
        let r = genGradientColor(inp[k])
        let rr = out[k]
        assert.strict.deepStrictEqual(r, rr)
    })

    k = 5
    inp[k] = '#6b8e23'
    out[k] = {
        linearGradient: { x1: 0, x2: 0, y1: 0, y2: 1 },
        stops: [
            [0, 'rgba(107, 142, 35, 0.4)'],
            [1, 'rgba(107, 142, 35, 0.9)']
        ]
    }
    it(`should return ${JSON.stringify(out[k])} when input '${inp[k]}'`, function() {
        k = 5
        let r = genGradientColor(inp[k])
        let rr = out[k]
        assert.strict.deepStrictEqual(r, rr)
    })

    k = 6
    inp[k] = 'skyblue'
    out[k] = {
        linearGradient: { x1: 0, x2: 0, y1: 0, y2: 1 },
        stops: [
            [0, 'rgba(135, 206, 235, 0.4)'],
            [1, 'rgba(135, 206, 235, 0.9)']
        ]
    }
    it(`should return ${JSON.stringify(out[k])} when input '${inp[k]}'`, function() {
        k = 6
        let r = genGradientColor(inp[k])
        let rr = out[k]
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return {} when input #'`, function() {
        let r = genGradientColor('#')
        assert.strict.deepStrictEqual(r, {})
    })

    it(`should return {} when input #0'`, function() {
        let r = genGradientColor('#0')
        assert.strict.deepStrictEqual(r, {})
    })

    it(`should return {} when input #f'`, function() {
        let r = genGradientColor('#f')
        assert.strict.deepStrictEqual(r, {})
    })

    it(`should return {} when input '1.25'`, function() {
        let r = genGradientColor('1.25')
        assert.strict.deepStrictEqual(r, {})
    })

    it(`should return {} when input 2.25`, function() {
        let r = genGradientColor(2.25)
        assert.strict.deepStrictEqual(r, {})
    })

    it(`should return {} when input ''`, function() {
        let r = genGradientColor('')
        assert.strict.deepStrictEqual(r, {})
    })

    it(`should return {} when input []`, function() {
        let r = genGradientColor([])
        assert.strict.deepStrictEqual(r, {})
    })

    it(`should return {} when input {}`, function() {
        let r = genGradientColor({})
        assert.strict.deepStrictEqual(r, {})
    })

    it(`should return {} when input null`, function() {
        let r = genGradientColor(null)
        assert.strict.deepStrictEqual(r, {})
    })

    it(`should return {} when input undefined`, function() {
        let r = genGradientColor(undefined)
        assert.strict.deepStrictEqual(r, {})
    })

    it(`should return {} when input NaN`, function() {
        let r = genGradientColor(NaN)
        assert.strict.deepStrictEqual(r, {})
    })

})
