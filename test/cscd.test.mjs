import assert from 'assert'
import cscd from '../src/cscd.mjs'


describe(`cscd`, function() {

    it(`should return Infinity when input 0`, function() {
        let r = cscd(0)
        let rr = Infinity
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 2.0000000000000004 when input 30`, function() {
        let r = cscd(30)
        let rr = 2.0000000000000004
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 1.4142135623730951 when input 45`, function() {
        let r = cscd(45)
        let rr = 1.4142135623730951
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 1.1547005383792517 when input 60`, function() {
        let r = cscd(60)
        let rr = 1.1547005383792517
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 1 when input 90`, function() {
        let r = cscd(90)
        let rr = 1
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 1.1547005383792515 when input 120`, function() {
        let r = cscd(120)
        let rr = 1.1547005383792515
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 1.414213562373095 when input 135`, function() {
        let r = cscd(135)
        let rr = 1.414213562373095
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 2.0000000000000004 when input 150`, function() {
        let r = cscd(150)
        let rr = 2.0000000000000004
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 8165619676597685 when input 180`, function() {
        let r = cscd(180)
        let rr = 8165619676597685
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return -1.9999999999999996 when input 210`, function() {
        let r = cscd(210)
        let rr = -1.9999999999999996
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return -1.4142135623730951 when input 225`, function() {
        let r = cscd(225)
        let rr = -1.4142135623730951
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return -1.1547005383792517 when input 240`, function() {
        let r = cscd(240)
        let rr = -1.1547005383792517
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return -1 when input 270`, function() {
        let r = cscd(270)
        let rr = -1
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return -1.1547005383792517 when input 300`, function() {
        let r = cscd(300)
        let rr = -1.1547005383792517
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return -1.4142135623730947 when input 315`, function() {
        let r = cscd(315)
        let rr = -1.4142135623730947
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return -1.9999999999999982 when input 330`, function() {
        let r = cscd(330)
        let rr = -1.9999999999999982
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return -4082809838298842.5 when input 360`, function() {
        let r = cscd(360)
        let rr = -4082809838298842.5
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 1 when input 450`, function() {
        let r = cscd(450)
        let rr = 1
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return -2041404919149421.2 when input 720`, function() {
        let r = cscd(720)
        r = r.toString()
        let rr = '-2041404919149421.2' //eslint會提示失去精度錯誤但實際不會, 避免報錯只好轉字串比對
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return null when input ''`, function() {
        let r = cscd('')
        assert.strict.deepStrictEqual(r, null)
    })

    it(`should return null when input false`, function() {
        let r = cscd(false)
        assert.strict.deepStrictEqual(r, null)
    })

    it(`should return null when input []`, function() {
        let r = cscd([])
        assert.strict.deepStrictEqual(r, null)
    })

    it(`should return null when input [{}]`, function() {
        let r = cscd([{}])
        assert.strict.deepStrictEqual(r, null)
    })

    it(`should return null when input [{ a: 123 }]`, function() {
        let r = cscd([{ a: 123 }])
        assert.strict.deepStrictEqual(r, null)
    })

    it(`should return null when input ['']`, function() {
        let r = cscd([''])
        assert.strict.deepStrictEqual(r, null)
    })

    it(`should return null when input ['abc']`, function() {
        let r = cscd(['abc'])
        assert.strict.deepStrictEqual(r, null)
    })

    it(`should return null when input {}`, function() {
        let r = cscd({})
        assert.strict.deepStrictEqual(r, null)
    })

    it(`should return null when input { a: 123 }`, function() {
        let r = cscd({ a: 123 })
        assert.strict.deepStrictEqual(r, null)
    })

    it(`should return null when input { a: 123, b: null, c: [45.67] }`, function() {
        let r = cscd({ a: 123, b: null, c: [45.67] })
        assert.strict.deepStrictEqual(r, null)
    })

    it(`should return null when input null`, function() {
        let r = cscd(null)
        assert.strict.deepStrictEqual(r, null)
    })

    it(`should return null when input undefined`, function() {
        let r = cscd(undefined)
        assert.strict.deepStrictEqual(r, null)
    })

    it(`should return null when input NaN`, function() {
        let r = cscd(NaN)
        assert.strict.deepStrictEqual(r, null)
    })

})
