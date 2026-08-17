import assert from 'assert'
import str2obj from '../src/str2obj.mjs'


describe(`str2obj`, function() {

    let o1 = {
        a: 'abc',
        b: 12.3,
        u8a: new Uint8Array([66, 97, 115]),
    }
    let o2 = {
        a: 'abc',
        b: 12.3,
        u8a: new Uint8Array([66, 97, 115]),
        u16a: new Uint16Array([11, 79, 6]),
    }
    let co1 = '{"a":"abc","b":12.3,"u8a":"[Uint8Array]::QmFz"}'
    let co2 = '{"a":"abc","b":12.3,"u8a":"[Uint8Array]::QmFz","u16a":"[Uint16Array]::C08G"}'

    it(`should return ${JSON.stringify(o1)} when input ${co1}`, function() {
        let r = str2obj(co1)
        let rr = o1
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return ${JSON.stringify(o2)} when input ${co2}, ['Uint8Array', 'Uint16Array']`, function() {
        let r = str2obj(co2, ['Uint8Array', 'Uint16Array'])
        let rr = o2
        assert.strict.deepStrictEqual(r, rr)
    })


    it(`should fallback ext to 'Uint8Array' when ext is an invalid type`, function() {
        //ext非字串亦非陣列時回退為預設之'Uint8Array', 結果須等同未給ext
        let rr = str2obj(co1)
        for (let v of [null, undefined, 12.34, {}, true, NaN]) {
            let r = str2obj(co1, v)
            assert.strict.deepStrictEqual(r, rr)
        }
    })

    it(`should treat string ext the same as single-element array ext`, function() {
        //回退值與isstr分支轉出之型別須一致, 皆為陣列, 故二者結果須相同
        assert.strict.deepStrictEqual(str2obj(co1, 'Uint8Array'), str2obj(co1, ['Uint8Array']))
        assert.strict.deepStrictEqual(str2obj(co2, 'Uint16Array'), str2obj(co2, ['Uint16Array']))
    })

    it(`should not decode Uint8Array when ext only contains Uint16Array`, function() {
        //ext為'Uint16Array'時不可因字串子字串搜尋而誤將Uint8Array一併解碼
        let r = str2obj(co1, 'Uint16Array')
        assert.strict.deepStrictEqual(r.u8a, '[Uint8Array]::QmFz')
    })

    it(`should return [1, '3', 'abc'] when input [1,"3","abc"]`, function() {
        let r = str2obj('[1,"3","abc"]')
        let rr = [1, '3', 'abc']
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [1, '', null, null, [], {}, '3', 'abc'] when input '[1,"",null,null,[],{},"3","abc"]'`, function() {
        let r = str2obj('[1,"",null,null,[],{},"3","abc"]')
        let rr = [1, '', null, null, [], {}, '3', 'abc']
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return { a: 12.34, b: 'abc' } when input '{"a":12.34,"b":"abc"}'`, function() {
        let r = str2obj('{"a":12.34,"b":"abc"}')
        let rr = { a: 12.34, b: 'abc' }
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return { a: 12.34, b: 'abc', c: '', d: null, f: [], g: {} } when input '{"a":12.34,"b":"abc","c":"","d":null,"f":[],"g":{}}'`, function() {
        let r = str2obj('{"a":12.34,"b":"abc","c":"","d":null,"f":[],"g":{}}')
        let rr = { a: 12.34, b: 'abc', c: '', d: null, f: [], g: {} }
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 123 when input '123'`, function() {
        let r = str2obj('123')
        let rr = 123
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 123.456 when input '123.456'`, function() {
        let r = str2obj('123.456')
        let rr = 123.456
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return '123' when input '"123"'`, function() {
        let r = str2obj('"123"')
        let rr = '123'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return '123.456' when input '"123.456"'`, function() {
        let r = str2obj('"123.456"')
        let rr = '123.456'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`sould return '' when input '""'`, function() {
        let r = str2obj('""')
        let rr = ''
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [] when input '[]'`, function() {
        let r = str2obj('[]')
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return {} when input '{}'`, function() {
        let r = str2obj('{}')
        let rr = {}
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return null when input 'null'`, function() {
        let r = str2obj('null')
        let rr = null
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return {} when input ''`, function() {
        let r = str2obj('')
        let rr = {}
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return {} when input undefined`, function() {
        let r = str2obj(undefined)
        let rr = {}
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return {} when input NaN`, function() {
        let r = str2obj(NaN)
        let rr = {}
        assert.strict.deepStrictEqual(r, rr)
    })

})
