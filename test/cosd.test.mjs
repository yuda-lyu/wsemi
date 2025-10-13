import assert from 'assert'
import cosd from '../src/cosd.mjs'


describe(`cosd`, function() {

    it(`should return 1 when input 0`, function() {
        let r = cosd(0)
        let rr = 1
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 0.8660254037844387 when input 30`, function() {
        let r = cosd(30)
        let rr = 0.8660254037844387
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 0.7071067811865476 when input 45`, function() {
        let r = cosd(45)
        let rr = 0.7071067811865476
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 0.5000000000000001 when input 60`, function() {
        let r = cosd(60)
        let rr = 0.5000000000000001
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 6.123233995736766e-17 when input 90`, function() {
        let r = cosd(90)
        let rr = 6.123233995736766e-17
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return -0.4999999999999998 when input 120`, function() {
        let r = cosd(120)
        let rr = -0.4999999999999998
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return -0.7071067811865475 when input 135`, function() {
        let r = cosd(135)
        let rr = -0.7071067811865475
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return -0.8660254037844387 when input 150`, function() {
        let r = cosd(150)
        let rr = -0.8660254037844387
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return -1 when input 180`, function() {
        let r = cosd(180)
        let rr = -1
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return -0.8660254037844386 when input 210`, function() {
        let r = cosd(210)
        let rr = -0.8660254037844386
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return -0.7071067811865477 when input 225`, function() {
        let r = cosd(225)
        let rr = -0.7071067811865477
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return -0.5000000000000004 when input 240`, function() {
        let r = cosd(240)
        let rr = -0.5000000000000004
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return -1.8369701987210297e-16 when input 270`, function() {
        let r = cosd(270)
        let rr = -1.8369701987210297e-16
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 0.5000000000000001 when input 300`, function() {
        let r = cosd(300)
        let rr = 0.5000000000000001
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 0.7071067811865474 when input 315`, function() {
        let r = cosd(315)
        let rr = 0.7071067811865474
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 0.8660254037844384 when input 330`, function() {
        let r = cosd(330)
        let rr = 0.8660254037844384
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 1 when input 360`, function() {
        let r = cosd(360)
        let rr = 1
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 3.061616997868383e-16 when input 450`, function() {
        let r = cosd(450)
        let rr = 3.061616997868383e-16
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 1 when input 720`, function() {
        let r = cosd(720)
        let rr = 1
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return null when input ''`, function() {
        let r = cosd('')
        assert.strict.deepStrictEqual(r, null)
    })

    it(`should return null when input false`, function() {
        let r = cosd(false)
        assert.strict.deepStrictEqual(r, null)
    })

    it(`should return null when input []`, function() {
        let r = cosd([])
        assert.strict.deepStrictEqual(r, null)
    })

    it(`should return null when input [{}]`, function() {
        let r = cosd([{}])
        assert.strict.deepStrictEqual(r, null)
    })

    it(`should return null when input [{ a: 123 }]`, function() {
        let r = cosd([{ a: 123 }])
        assert.strict.deepStrictEqual(r, null)
    })

    it(`should return null when input ['']`, function() {
        let r = cosd([''])
        assert.strict.deepStrictEqual(r, null)
    })

    it(`should return null when input ['abc']`, function() {
        let r = cosd(['abc'])
        assert.strict.deepStrictEqual(r, null)
    })

    it(`should return null when input {}`, function() {
        let r = cosd({})
        assert.strict.deepStrictEqual(r, null)
    })

    it(`should return null when input { a: 123 }`, function() {
        let r = cosd({ a: 123 })
        assert.strict.deepStrictEqual(r, null)
    })

    it(`should return null when input { a: 123, b: null, c: [45.67] }`, function() {
        let r = cosd({ a: 123, b: null, c: [45.67] })
        assert.strict.deepStrictEqual(r, null)
    })

    it(`should return null when input null`, function() {
        let r = cosd(null)
        assert.strict.deepStrictEqual(r, null)
    })

    it(`should return null when input undefined`, function() {
        let r = cosd(undefined)
        assert.strict.deepStrictEqual(r, null)
    })

    it(`should return null when input NaN`, function() {
        let r = cosd(NaN)
        assert.strict.deepStrictEqual(r, null)
    })

})
