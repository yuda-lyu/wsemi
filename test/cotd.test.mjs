import assert from 'assert'
import cotd from '../src/cotd.mjs'


describe(`cotd`, function() {

    it(`should return Infinity when input 0`, function() {
        let r = cotd(0)
        let rr = Infinity
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 1.7320508075688774 when input 30`, function() {
        let r = cotd(30)
        let rr = 1.7320508075688774
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 1.0000000000000002 when input 45`, function() {
        let r = cotd(45)
        let rr = 1.0000000000000002
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 0.577350269189626 when input 60`, function() {
        let r = cotd(60)
        let rr = 0.577350269189626
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 6.123233995736766e-17 when input 90`, function() {
        let r = cotd(90)
        let rr = 6.123233995736766e-17
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return -0.5773502691896254 when input 120`, function() {
        let r = cotd(120)
        let rr = -0.5773502691896254
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return -0.9999999999999998 when input 135`, function() {
        let r = cotd(135)
        let rr = -0.9999999999999998
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return -1.7320508075688774 when input 150`, function() {
        let r = cotd(150)
        let rr = -1.7320508075688774
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return -8165619676597685 when input 180`, function() {
        let r = cotd(180)
        let rr = -8165619676597685
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 1.7320508075688767 when input 210`, function() {
        let r = cotd(210)
        let rr = 1.7320508075688767
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 1.0000000000000004 when input 225`, function() {
        let r = cotd(225)
        let rr = 1.0000000000000004
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 0.5773502691896264 when input 240`, function() {
        let r = cotd(240)
        let rr = 0.5773502691896264
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 1.83697019872103e-16 when input 270`, function() {
        let r = cotd(270)
        let rr = 1.83697019872103e-16
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return -0.5773502691896258 when input 300`, function() {
        let r = cotd(300)
        let rr = -0.5773502691896258
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return -0.9999999999999996 when input 315`, function() {
        let r = cotd(315)
        let rr = -0.9999999999999996
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return -1.7320508075688754 when input 330`, function() {
        let r = cotd(330)
        let rr = -1.7320508075688754
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return -4082809838298842.5 when input 360`, function() {
        let r = cotd(360)
        let rr = -4082809838298842.5
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 3.061616997868383e-16 when input 450`, function() {
        let r = cotd(450)
        let rr = 3.061616997868383e-16
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return -2041404919149421.2 when input 720`, function() {
        let r = cotd(720)
        r = r.toString()
        let rr = '-2041404919149421.2' //eslint會提示失去精度錯誤但實際不會, 避免報錯只好轉字串比對
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return null when input ''`, function() {
        let r = cotd('')
        assert.strict.deepStrictEqual(r, null)
    })

    it(`should return null when input false`, function() {
        let r = cotd(false)
        assert.strict.deepStrictEqual(r, null)
    })

    it(`should return null when input []`, function() {
        let r = cotd([])
        assert.strict.deepStrictEqual(r, null)
    })

    it(`should return null when input [{}]`, function() {
        let r = cotd([{}])
        assert.strict.deepStrictEqual(r, null)
    })

    it(`should return null when input [{ a: 123 }]`, function() {
        let r = cotd([{ a: 123 }])
        assert.strict.deepStrictEqual(r, null)
    })

    it(`should return null when input ['']`, function() {
        let r = cotd([''])
        assert.strict.deepStrictEqual(r, null)
    })

    it(`should return null when input ['abc']`, function() {
        let r = cotd(['abc'])
        assert.strict.deepStrictEqual(r, null)
    })

    it(`should return null when input {}`, function() {
        let r = cotd({})
        assert.strict.deepStrictEqual(r, null)
    })

    it(`should return null when input { a: 123 }`, function() {
        let r = cotd({ a: 123 })
        assert.strict.deepStrictEqual(r, null)
    })

    it(`should return null when input { a: 123, b: null, c: [45.67] }`, function() {
        let r = cotd({ a: 123, b: null, c: [45.67] })
        assert.strict.deepStrictEqual(r, null)
    })

    it(`should return null when input null`, function() {
        let r = cotd(null)
        assert.strict.deepStrictEqual(r, null)
    })

    it(`should return null when input undefined`, function() {
        let r = cotd(undefined)
        assert.strict.deepStrictEqual(r, null)
    })

    it(`should return null when input NaN`, function() {
        let r = cotd(NaN)
        assert.strict.deepStrictEqual(r, null)
    })

})
