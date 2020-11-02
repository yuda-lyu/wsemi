import assert from 'assert'
import treeObj from '../src/treeObj.mjs'


describe(`treeObj`, function() {
    let data = {
        a: [123, 45.67, 'test中文'],
        b: {
            c: new Uint8Array([66, 97, 115]),
        },
    }
    let cdata = `{ a: [123, 45.67, 'test中文'], b: { c: new Uint8Array([66, 97, 115]) } }`
    let cres = `[{"value":[123,45.67,"test中文"],"key":"a","nk":[]},{"value":123,"key":0,"nk":["a"]},{"value":45.67,"key":1,"nk":["a"]},{"value":"test中文","key":2,"nk":["a"]},{"value":{"c":{"0":66,"1":97,"2":115}},"key":"b","nk":[]},{"value":{"0":66,"1":97,"2":115},"key":"c","nk":["b"]},{"a":[123,45.67,"test中文"],"b":{"c":{"0":66,"1":97,"2":115}}}]`

    it(`should return ${cres} when input ${cdata}`, function() {
        let m = []
        let r = treeObj(data, (value, key, nk) => {
            m.push({ value, key, nk })
            return value
        })
        m.push(r)
        r = JSON.stringify(m)
        let rr = cres
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
