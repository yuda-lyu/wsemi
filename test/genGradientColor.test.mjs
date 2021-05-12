import assert from 'assert'
import genGradientColor from '../src/genGradientColor.mjs'


describe(`genGradientColor`, function() {
    let k
    let o = {}

    k = 1
    o[k] = {
        in: '#000',
        out: {
            linearGradient: {
                x1: 0,
                x2: 0,
                y1: 0,
                y2: 1
            },
            stops: [
                [
                    0,
                    'hsla(0, 0%, 0%, 0.4)'
                ],
                [
                    1,
                    'hsla(0, 0%, 0%, 0.9)'
                ]
            ]
        }
    }
    it(`should return ${JSON.stringify(o[k].out)} when input ${JSON.stringify(o[k].in)}`, function() {
        k = 1
        let r = genGradientColor(o[k].in)
        let rr = o[k].out
        assert.strict.deepStrictEqual(r, rr)
    })

    k = 2
    o[k] = {
        in: '#f26',
        out: {
            linearGradient: {
                x1: 0,
                x2: 0,
                y1: 0,
                y2: 1
            },
            stops: [
                [
                    0,
                    'hsla(342, 100%, 57%, 0.4)'
                ],
                [
                    1,
                    'hsla(342, 100%, 57%, 0.9)'
                ]
            ]
        }
    }
    it(`should return ${JSON.stringify(o[k].out)} when input ${JSON.stringify(o[k].in)}`, function() {
        k = 2
        let r = genGradientColor(o[k].in)
        let rr = o[k].out
        assert.strict.deepStrictEqual(r, rr)
    })

    k = 3
    o[k] = {
        in: '#F26',
        out: {
            linearGradient: {
                x1: 0,
                x2: 0,
                y1: 0,
                y2: 1
            },
            stops: [
                [
                    0,
                    'hsla(342, 100%, 57%, 0.4)'
                ],
                [
                    1,
                    'hsla(342, 100%, 57%, 0.9)'
                ]
            ]
        }
    }
    it(`should return ${JSON.stringify(o[k].out)} when input ${JSON.stringify(o[k].in)}`, function() {
        k = 3
        let r = genGradientColor(o[k].in)
        let rr = o[k].out
        assert.strict.deepStrictEqual(r, rr)
    })

    k = 4
    o[k] = {
        in: '#f02060',
        out: {
            linearGradient: {
                x1: 0,
                x2: 0,
                y1: 0,
                y2: 1
            },
            stops: [
                [
                    0,
                    'hsla(342, 87%, 53%, 0.4)'
                ],
                [
                    1,
                    'hsla(342, 87%, 53%, 0.9)'
                ]
            ]
        }
    }
    it(`should return ${JSON.stringify(o[k].out)} when input ${JSON.stringify(o[k].in)}`, function() {
        k = 4
        let r = genGradientColor(o[k].in)
        let rr = o[k].out
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

    it(`should return {} when input #00'`, function() {
        let r = genGradientColor('#00')
        assert.strict.deepStrictEqual(r, {})
    })

    it(`should return {} when input #f'`, function() {
        let r = genGradientColor('#f')
        assert.strict.deepStrictEqual(r, {})
    })

    it(`should return {} when input #ff'`, function() {
        let r = genGradientColor('#ff')
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

})
