import assert from 'assert'
import treeObj from '../src/treeObj.mjs'


describe(`treeObj`, function() {
    let data = {
        a: 123,
        b: 145.67,
        c: 'test中文1',
        d: true,
        e: function() {},
        f: [11, 'xyz', false, new Uint8Array([166, 197, 215])],
        g: {
            ga: 223,
            gb: 245.67,
            gc: 'test中文2',
            gd: new Uint8Array([66, 97, 115]),
        },
        h: Symbol('foo'),
        [Symbol('i-sym-key')]: 'i-sym-value',
    }

    let cdata1 = `{ a: 123, b: 145.67, c: 'test中文1', d: true, e: function() {}, f: [11, 'xyz', false, new Uint8Array([166, 197, 215])], g: { ga: 223, gb: 245.67, gc: 'test中文2', gd: new Uint8Array([66, 97, 115]), }, h: Symbol('foo'), [Symbol('i-sym-key')]: 'i-sym-value' }`
    let cres1 = `[{"value":123,"key":"a","nk":[]},{"value":145.67,"key":"b","nk":[]},{"value":"test中文1","key":"c","nk":[]},{"value":true,"key":"d","nk":[]},{"key":"e","nk":[]},{"value":[11,"xyz",false,{"0":166,"1":197,"2":215}],"key":"f","nk":[]},{"value":11,"key":0,"nk":["f"]},{"value":"xyz","key":1,"nk":["f"]},{"value":false,"key":2,"nk":["f"]},{"value":{"0":166,"1":197,"2":215},"key":3,"nk":["f"]},{"value":{"ga":223,"gb":245.67,"gc":"test中文2","gd":{"0":66,"1":97,"2":115}},"key":"g","nk":[]},{"value":223,"key":"ga","nk":["g"]},{"value":245.67,"key":"gb","nk":["g"]},{"value":"test中文2","key":"gc","nk":["g"]},{"value":{"0":66,"1":97,"2":115},"key":"gd","nk":["g"]},{"key":"h","nk":[]},{"a":123,"b":145.67,"c":"test中文1","d":true,"f":[11,"xyz",false,{"0":166,"1":197,"2":215}],"g":{"ga":223,"gb":245.67,"gc":"test中文2","gd":{"0":66,"1":97,"2":115}}}]`
    it(`should return ${cres1} when input ${cdata1}`, function() {
        let m = []
        let r = treeObj(data, (value, key, nk) => {
            m.push({ value, key, nk })
            return value
        })
        m.push(r)
        r = JSON.stringify(m)
        let rr = cres1
        assert.strict.deepStrictEqual(r, rr)
    })

    let cdata2 = `{ a: 123, b: 145.67, c: 'test中文1', d: true, e: function() {}, f: [11, 'xyz', false, new Uint8Array([166, 197, 215])], g: { ga: 223, gb: 245.67, gc: 'test中文2', gd: new Uint8Array([66, 97, 115]), }, h: Symbol('foo'), [Symbol('i-sym-key')]: 'i-sym-value' }, { force: true }`
    let cres2 = `[{"value":123,"key":"a","nk":[]},{"value":145.67,"key":"b","nk":[]},{"value":"test中文1","key":"c","nk":[]},{"value":true,"key":"d","nk":[]},{"key":"e","nk":[]},{"value":[11,"xyz",false,{"0":166,"1":197,"2":215}],"key":"f","nk":[]},{"value":11,"key":0,"nk":["f"]},{"value":"xyz","key":1,"nk":["f"]},{"value":false,"key":2,"nk":["f"]},{"value":{"0":166,"1":197,"2":215},"key":3,"nk":["f"]},{"value":{"ga":223,"gb":245.67,"gc":"test中文2","gd":{"0":66,"1":97,"2":115}},"key":"g","nk":[]},{"value":223,"key":"ga","nk":["g"]},{"value":245.67,"key":"gb","nk":["g"]},{"value":"test中文2","key":"gc","nk":["g"]},{"value":{"0":66,"1":97,"2":115},"key":"gd","nk":["g"]},{"key":"h","nk":[]},{"value":"i-sym-value","nk":[]},{"a":123,"b":145.67,"c":"test中文1","d":true,"f":[11,"xyz",false,{"0":166,"1":197,"2":215}],"g":{"ga":223,"gb":245.67,"gc":"test中文2","gd":{"0":66,"1":97,"2":115}}}]`
    it(`should return ${cres2} when input ${cdata2}`, function() {
        let m = []
        let r = treeObj(data, (value, key, nk) => {
            m.push({ value, key, nk })
            return value
        }, { force: true })
        m.push(r)
        r = JSON.stringify(m)
        let rr = cres2
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return '' when input ''`, function() {
        let r = treeObj('')
        let rr = ''
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [] when input []`, function() {
        let r = treeObj([])
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return {} when input {}`, function() {
        let r = treeObj({})
        let rr = {}
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return null when input null`, function() {
        let r = treeObj(null)
        let rr = null
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return undefined when input undefined`, function() {
        let r = treeObj(undefined)
        assert.strict.deepStrictEqual(r, undefined)
    })

    it(`should return undefined when input NaN`, function() {
        let r = treeObj(NaN)
        let rr = NaN
        assert.strict.deepStrictEqual(r, rr)
    })

})
