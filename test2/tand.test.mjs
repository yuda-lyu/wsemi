import assert from 'assert'
import tand from '../src/tand.mjs'


describe(`tand`, function() {

    it(`should return 0 when input 0`, function() {
        let r = tand(0)
        let rr = 0
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 0.5773502691896257 when input 30`, function() {
        let r = tand(30)
        let rr = 0.5773502691896257
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 0.9999999999999999 when input 45`, function() {
        let r = tand(45)
        let rr = 0.9999999999999999
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 1.7320508075688767 when input 60`, function() {
        let r = tand(60)
        let rr = 1.7320508075688767
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 16331239353195370 when input 90`, function() {
        let r = tand(90)
        let rr = 16331239353195370
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return -1.7320508075688783 when input 120`, function() {
        let r = tand(120)
        let rr = -1.7320508075688783
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return -1.0000000000000002 when input 135`, function() {
        let r = tand(135)
        let rr = -1.0000000000000002
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return -0.5773502691896257 when input 150`, function() {
        let r = tand(150)
        let rr = -0.5773502691896257
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return -1.2246467991473532e-16 when input 180`, function() {
        let r = tand(180)
        let rr = -1.2246467991473532e-16
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 0.577350269189626 when input 210`, function() {
        let r = tand(210)
        let rr = 0.577350269189626
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 0.9999999999999997 when input 225`, function() {
        let r = tand(225)
        let rr = 0.9999999999999997
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 1.7320508075688754 when input 240`, function() {
        let r = tand(240)
        let rr = 1.7320508075688754
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 5443746451065123 when input 270`, function() {
        let r = tand(270)
        let rr = 5443746451065123
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return -1.732050807568877 when input 300`, function() {
        let r = tand(300)
        let rr = -1.732050807568877
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return -1.0000000000000004 when input 315`, function() {
        let r = tand(315)
        let rr = -1.0000000000000004
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return -0.5773502691896264 when input 330`, function() {
        let r = tand(330)
        let rr = -0.5773502691896264
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return -2.4492935982947064e-16 when input 360`, function() {
        let r = tand(360)
        let rr = -2.4492935982947064e-16
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 3266247870639074 when input 450`, function() {
        let r = tand(450)
        let rr = 3266247870639074
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return -4.898587196589413e-16 when input 720`, function() {
        let r = tand(720)
        let rr = -4.898587196589413e-16
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return null when input ''`, function() {
        let r = tand('')
        assert.strict.deepStrictEqual(r, null)
    })

    it(`should return null when input false`, function() {
        let r = tand(false)
        assert.strict.deepStrictEqual(r, null)
    })

    it(`should return null when input []`, function() {
        let r = tand([])
        assert.strict.deepStrictEqual(r, null)
    })

    it(`should return null when input [{}]`, function() {
        let r = tand([{}])
        assert.strict.deepStrictEqual(r, null)
    })

    it(`should return null when input [{ a: 123 }]`, function() {
        let r = tand([{ a: 123 }])
        assert.strict.deepStrictEqual(r, null)
    })

    it(`should return null when input ['']`, function() {
        let r = tand([''])
        assert.strict.deepStrictEqual(r, null)
    })

    it(`should return null when input ['abc']`, function() {
        let r = tand(['abc'])
        assert.strict.deepStrictEqual(r, null)
    })

    it(`should return null when input {}`, function() {
        let r = tand({})
        assert.strict.deepStrictEqual(r, null)
    })

    it(`should return null when input { a: 123 }`, function() {
        let r = tand({ a: 123 })
        assert.strict.deepStrictEqual(r, null)
    })

    it(`should return null when input { a: 123, b: null, c: [45.67] }`, function() {
        let r = tand({ a: 123, b: null, c: [45.67] })
        assert.strict.deepStrictEqual(r, null)
    })

    it(`should return null when input null`, function() {
        let r = tand(null)
        assert.strict.deepStrictEqual(r, null)
    })

    it(`should return null when input undefined`, function() {
        let r = tand(undefined)
        assert.strict.deepStrictEqual(r, null)
    })

})
