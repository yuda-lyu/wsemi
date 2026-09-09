import assert from 'assert'
import blob2u8arr from '../src/blob2u8arr.mjs'
import { getRes } from './blob2b64.test.mjs'


describe('blob2u8arr', function() {

    it('need test in browser', function() {
        assert.strict.deepStrictEqual(1, 1)
    })

    it('should reject with invalid bb when input is not a blob', async function() {
        let r = await getRes(() => blob2u8arr(NaN))
        assert.strict.deepStrictEqual(r, { mode: 'reject', msg: 'invalid bb' })
    })

    it('should reject with no window when not in a browser', async function() {
        let r = await getRes(() => blob2u8arr(new Blob([new Uint8Array([1, 2, 3])])))
        assert.strict.deepStrictEqual(r, { mode: 'reject', msg: 'no window' })
    })

})
