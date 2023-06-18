import assert from 'assert'
import secd from '../src/secd.mjs'


describe(`secd`, function() {

    it(`should return 1 when input 0`, function() {
        let r = secd(0)
        let rr = 1
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 1.1547005383792515 when input 30`, function() {
        let r = secd(30)
        let rr = 1.1547005383792515
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 1.414213562373095 when input 45`, function() {
        let r = secd(45)
        let rr = 1.414213562373095
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 1.9999999999999996 when input 60`, function() {
        let r = secd(60)
        let rr = 1.9999999999999996
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 16331239353195370 when input 90`, function() {
        let r = secd(90)
        let rr = 16331239353195370
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return -2.000000000000001 when input 120`, function() {
        let r = secd(120)
        let rr = -2.000000000000001
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return -1.4142135623730951 when input 135`, function() {
        let r = secd(135)
        let rr = -1.4142135623730951
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return -1.1547005383792515 when input 150`, function() {
        let r = secd(150)
        let rr = -1.1547005383792515
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return -1 when input 180`, function() {
        let r = secd(180)
        let rr = -1
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return -1.1547005383792517 when input 210`, function() {
        let r = secd(210)
        let rr = -1.1547005383792517
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return -1.4142135623730947 when input 225`, function() {
        let r = secd(225)
        let rr = -1.4142135623730947
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return -1.9999999999999982 when input 240`, function() {
        let r = secd(240)
        let rr = -1.9999999999999982
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return -5443746451065123 when input 270`, function() {
        let r = secd(270)
        let rr = -5443746451065123
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 1.9999999999999996 when input 300`, function() {
        let r = secd(300)
        let rr = 1.9999999999999996
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 1.4142135623730954 when input 315`, function() {
        let r = secd(315)
        let rr = 1.4142135623730954
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 1.154700538379252 when input 330`, function() {
        let r = secd(330)
        let rr = 1.154700538379252
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 1 when input 360`, function() {
        let r = secd(360)
        let rr = 1
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 3266247870639073.5 when input 450`, function() {
        let r = secd(450)
        let rr = 3266247870639073.5
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 1 when input 720`, function() {
        let r = secd(720)
        let rr = 1
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return null when input ''`, function() {
        let r = secd('')
        assert.strict.deepStrictEqual(r, null)
    })

    it(`should return null when input false`, function() {
        let r = secd(false)
        assert.strict.deepStrictEqual(r, null)
    })

    it(`should return null when input []`, function() {
        let r = secd([])
        assert.strict.deepStrictEqual(r, null)
    })

    it(`should return null when input [{}]`, function() {
        let r = secd([{}])
        assert.strict.deepStrictEqual(r, null)
    })

    it(`should return null when input [{ a: 123 }]`, function() {
        let r = secd([{ a: 123 }])
        assert.strict.deepStrictEqual(r, null)
    })

    it(`should return null when input ['']`, function() {
        let r = secd([''])
        assert.strict.deepStrictEqual(r, null)
    })

    it(`should return null when input ['abc']`, function() {
        let r = secd(['abc'])
        assert.strict.deepStrictEqual(r, null)
    })

    it(`should return null when input {}`, function() {
        let r = secd({})
        assert.strict.deepStrictEqual(r, null)
    })

    it(`should return null when input { a: 123 }`, function() {
        let r = secd({ a: 123 })
        assert.strict.deepStrictEqual(r, null)
    })

    it(`should return null when input { a: 123, b: null, c: [45.67] }`, function() {
        let r = secd({ a: 123, b: null, c: [45.67] })
        assert.strict.deepStrictEqual(r, null)
    })

    it(`should return null when input null`, function() {
        let r = secd(null)
        assert.strict.deepStrictEqual(r, null)
    })

    it(`should return null when input undefined`, function() {
        let r = secd(undefined)
        assert.strict.deepStrictEqual(r, null)
    })

})
