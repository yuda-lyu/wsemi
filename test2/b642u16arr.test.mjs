import assert from 'assert'
import b642u16arr from '../src/b642u16arr.mjs'


describe(`b642u16arr`, function() {

    it(`should return new Uint16Array([1, 2.3, '45', 'abc']) when input 'AQItAA=='`, function() {
        let u8a = new Uint16Array([1, 2.3, '45', 'abc'])
        let r = b642u16arr('AQItAA==')
        let rr = u8a
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return new Uint16Array() when input '1.25'`, function() {
        //'1.25'會被視為base64文字進行轉換
        let r = b642u16arr('1.25')
        let rr = new Uint16Array([212, 13, 185])
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return new Uint16Array() when input 2.25`, function() {
        let r = b642u16arr(2.25)
        let rr = new Uint16Array()
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return new Uint16Array() when input ''`, function() {
        let r = b642u16arr('')
        let rr = new Uint16Array()
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return new Uint16Array() when input []`, function() {
        let r = b642u16arr([])
        let rr = new Uint16Array()
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return new Uint16Array() when input {}`, function() {
        let r = b642u16arr({})
        let rr = new Uint16Array()
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return new Uint16Array() when input null`, function() {
        let r = b642u16arr(null)
        let rr = new Uint16Array()
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return new Uint16Array() when input undefined`, function() {
        let r = b642u16arr(undefined)
        let rr = new Uint16Array()
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return new Uint16Array() when input NaN`, function() {
        let r = b642u16arr(NaN)
        let rr = new Uint16Array()
        assert.strict.deepStrictEqual(r, rr)
    })

})
