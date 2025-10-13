import assert from 'assert'
import sind from '../src/sind.mjs'


describe(`sind`, function() {

    it(`should return 0 when input 0`, function() {
        let r = sind(0)
        let rr = 0
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 0.49999999999999994 when input 30`, function() {
        let r = sind(30)
        let rr = 0.49999999999999994
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 0.7071067811865475 when input 45`, function() {
        let r = sind(45)
        let rr = 0.7071067811865475
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 0.8660254037844386 when input 60`, function() {
        let r = sind(60)
        let rr = 0.8660254037844386
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 1 when input 90`, function() {
        let r = sind(90)
        let rr = 1
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 0.8660254037844387 when input 120`, function() {
        let r = sind(120)
        let rr = 0.8660254037844387
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 0.7071067811865476 when input 135`, function() {
        let r = sind(135)
        let rr = 0.7071067811865476
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 0.49999999999999994 when input 150`, function() {
        let r = sind(150)
        let rr = 0.49999999999999994
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 1.2246467991473532e-16 when input 180`, function() {
        let r = sind(180)
        let rr = 1.2246467991473532e-16
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return -0.5000000000000001 when input 210`, function() {
        let r = sind(210)
        let rr = -0.5000000000000001
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return -0.7071067811865475 when input 225`, function() {
        let r = sind(225)
        let rr = -0.7071067811865475
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return -0.8660254037844385 when input 240`, function() {
        let r = sind(240)
        let rr = -0.8660254037844385
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return -1 when input 270`, function() {
        let r = sind(270)
        let rr = -1
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return -0.8660254037844386 when input 300`, function() {
        let r = sind(300)
        let rr = -0.8660254037844386
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return -0.7071067811865477 when input 315`, function() {
        let r = sind(315)
        let rr = -0.7071067811865477
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return -0.5000000000000004 when input 330`, function() {
        let r = sind(330)
        let rr = -0.5000000000000004
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return -2.4492935982947064e-16 when input 360`, function() {
        let r = sind(360)
        let rr = -2.4492935982947064e-16
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 1 when input 450`, function() {
        let r = sind(450)
        let rr = 1
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return -4.898587196589413e-16 when input 720`, function() {
        let r = sind(720)
        let rr = -4.898587196589413e-16
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return null when input ''`, function() {
        let r = sind('')
        assert.strict.deepStrictEqual(r, null)
    })

    it(`should return null when input false`, function() {
        let r = sind(false)
        assert.strict.deepStrictEqual(r, null)
    })

    it(`should return null when input []`, function() {
        let r = sind([])
        assert.strict.deepStrictEqual(r, null)
    })

    it(`should return null when input [{}]`, function() {
        let r = sind([{}])
        assert.strict.deepStrictEqual(r, null)
    })

    it(`should return null when input [{ a: 123 }]`, function() {
        let r = sind([{ a: 123 }])
        assert.strict.deepStrictEqual(r, null)
    })

    it(`should return null when input ['']`, function() {
        let r = sind([''])
        assert.strict.deepStrictEqual(r, null)
    })

    it(`should return null when input ['abc']`, function() {
        let r = sind(['abc'])
        assert.strict.deepStrictEqual(r, null)
    })

    it(`should return null when input {}`, function() {
        let r = sind({})
        assert.strict.deepStrictEqual(r, null)
    })

    it(`should return null when input { a: 123 }`, function() {
        let r = sind({ a: 123 })
        assert.strict.deepStrictEqual(r, null)
    })

    it(`should return null when input { a: 123, b: null, c: [45.67] }`, function() {
        let r = sind({ a: 123, b: null, c: [45.67] })
        assert.strict.deepStrictEqual(r, null)
    })

    it(`should return null when input null`, function() {
        let r = sind(null)
        assert.strict.deepStrictEqual(r, null)
    })

    it(`should return null when input undefined`, function() {
        let r = sind(undefined)
        assert.strict.deepStrictEqual(r, null)
    })

    it(`should return null when input NaN`, function() {
        let r = sind(NaN)
        assert.strict.deepStrictEqual(r, null)
    })

})
