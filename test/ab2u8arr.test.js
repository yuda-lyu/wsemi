import assert from 'assert'
import ab2u8arr from '../src/ab2u8arr.mjs'


describe('ab2u8arr', function() {

    it('should return true(is Uint8Array) when input ArrayBuffer', function() {
        let ab = new ArrayBuffer(8)
        let r = ab2u8arr(ab)
        r = Object.prototype.toString.call(r)
        assert.strictEqual(r, '[object Uint8Array]')
    })

})
