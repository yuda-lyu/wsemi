import assert from 'assert'
import obj2str from '../src/obj2str.mjs'
import str2obj from '../src/str2obj.mjs'


describe(`obj2str`, function() {

    let o = {
        a: 'abc',
        b: 12.3,
        u8a: new Uint8Array([66, 97, 115]),
        u16a: new Uint16Array([11, 79, 6]),
    }
    let co1 = '{"a":"abc","b":12.3,"u8a":"[Uint8Array]::QmFz","u16a":{"0":11,"1":79,"2":6}}'
    let co2 = '{"a":"abc","b":12.3,"u8a":"[Uint8Array]::QmFz","u16a":"[Uint16Array]::C08G"}'

    it(`should return ${co1} when input ${JSON.stringify(o)}`, function() {
        let r = obj2str(o)
        let rr = co1
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return ${co2} when input ${JSON.stringify(o)}, ['Uint8Array', 'Uint16Array']`, function() {
        let r = obj2str(o, ['Uint8Array', 'Uint16Array'])
        let rr = co2
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should fallback ext to 'Uint8Array' when ext is an invalid type`, function() {
        //ext非字串亦非陣列時回退為預設之'Uint8Array', 結果須等同未給ext
        for (let v of [null, undefined, 12.34, {}, true, NaN]) {
            let r = obj2str(o, v)
            assert.strict.deepStrictEqual(r, co1)
        }
    })

    it(`should treat string ext the same as single-element array ext`, function() {
        //回退值與isstr分支轉出之型別須一致, 皆為陣列, 故二者結果須相同
        assert.strict.deepStrictEqual(obj2str(o, 'Uint8Array'), obj2str(o, ['Uint8Array']))
        assert.strict.deepStrictEqual(obj2str(o, 'Uint16Array'), obj2str(o, ['Uint16Array']))
    })

    it(`should round-trip with str2obj under invalid ext`, function() {
        //obj2str與str2obj須成對使用相同ext, 兩端對無效ext之回退一致才能正確往返
        let c = obj2str(o, null)
        let r = str2obj(c, null)
        assert.strict.deepStrictEqual(r.u8a, o.u8a)
    })

    it(`should return '[1,"3","abc"]' when input [1, '3', 'abc']`, function() {
        let r = obj2str([1, '3', 'abc'])
        let rr = '[1,"3","abc"]'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return '[1,"",null,null,[],{},"3","abc"]' when input [1, '', null, undefined, [], {}, '3', 'abc']`, function() {
        let r = obj2str([1, '', null, undefined, [], {}, '3', 'abc'])
        let rr = '[1,"",null,null,[],{},"3","abc"]'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return '{"a":12.34,"b":"abc"}' when input { a: 12.34, b: 'abc' }`, function() {
        let r = obj2str({ a: 12.34, b: 'abc' })
        let rr = '{"a":12.34,"b":"abc"}'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return '{"a":12.34,"b":"abc","c":"","d":null,"f":[],"g":{}}' when input { a: 12.34, b: 'abc', c: '', d: null, e: undefined, f: [], g: {} }`, function() {
        let r = obj2str({ a: 12.34, b: 'abc', c: '', d: null, e: undefined, f: [], g: {} })
        let rr = '{"a":12.34,"b":"abc","c":"","d":null,"f":[],"g":{}}'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return '123' when input 123`, function() {
        let r = obj2str(123)
        let rr = '123'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return '123.456' when input 123.456`, function() {
        let r = obj2str(123.456)
        let rr = '123.456'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return '"123"' when input '123'`, function() {
        let r = obj2str('123')
        let rr = '"123"'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return '"123.456"' when input '123.456'`, function() {
        let r = obj2str('123.456')
        let rr = '"123.456"'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`sould return '""' when input ''`, function() {
        let r = obj2str('')
        let rr = '""'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return '[]' when input []`, function() {
        let r = obj2str([])
        let rr = '[]'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return '{}' when input {}`, function() {
        let r = obj2str({})
        let rr = '{}'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 'null' when input null`, function() {
        let r = obj2str(null)
        let rr = 'null'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return '' when input undefined`, function() {
        let r = obj2str(undefined)
        let rr = ''
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return '' when input NaN`, function() {
        let r = obj2str(NaN)
        let rr = 'null' //NaN為Number, 故JSON.stringify轉為null
        assert.strict.deepStrictEqual(r, rr)
    })

})
