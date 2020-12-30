import assert from 'assert'
import treeObj from '../src/treeObj.mjs'


describe(`treeObj`, function() {
    let data = {
        a: [123, 45.67, 'test中文'],
        b: {
            c: new Uint8Array([66, 97, 115]),
        },
        d: Symbol('foo'),
        [Symbol('sym')]: 'e',
    }

    let cdata1 = `{ a: [123, 45.67, 'test中文'], b: { c: new Uint8Array([66, 97, 115]) } }`
    let cres1 = `[{"value":[123,45.67,"test中文"],"key":"a","nk":[]},{"value":123,"key":0,"nk":["a"]},{"value":45.67,"key":1,"nk":["a"]},{"value":"test中文","key":2,"nk":["a"]},{"value":{"c":{"0":66,"1":97,"2":115}},"key":"b","nk":[]},{"value":{"0":66,"1":97,"2":115},"key":"c","nk":["b"]},{"key":"d","nk":[]},{"a":[123,45.67,"test中文"],"b":{"c":{"0":66,"1":97,"2":115}}}]`
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

    let cdata2 = `{ a: [123, 45.67, 'test中文'], b: { c: new Uint8Array([66, 97, 115]) } }, [callback function], { force: true }`
    let cres2 = `[{"value":[123,45.67,"test中文"],"key":"a","nk":[]},{"value":123,"key":0,"nk":["a"]},{"value":45.67,"key":1,"nk":["a"]},{"value":"test中文","key":2,"nk":["a"]},{"value":{"c":{"0":66,"1":97,"2":115}},"key":"b","nk":[]},{"value":{"0":66,"1":97,"2":115},"key":"c","nk":["b"]},{"key":"d","nk":[]},{"value":"e","nk":[]},{"a":[123,45.67,"test中文"],"b":{"c":{"0":66,"1":97,"2":115}}}]`
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
        let rr
        assert.strict.deepStrictEqual(r, rr)
    })

})
