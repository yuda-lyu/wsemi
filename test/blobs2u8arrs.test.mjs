import assert from 'assert'
import blobs2u8arrs from '../src/blobs2u8arrs.mjs'
import { getRes } from './blob2b64.test.mjs'


describe('blobs2u8arrs', function() {

    it('need test in browser', function() {
        assert.strict.deepStrictEqual(1, 1)
    })

    it('should reject with invalid bbs when input is not an array', async function() {
        let r = await getRes(() => blobs2u8arrs(NaN))
        assert.strict.deepStrictEqual(r, { mode: 'reject', msg: 'invalid bbs' })
    })

    it('should resolve [] when input is an empty array', async function() {
        let r = await getRes(() => blobs2u8arrs([]))
        assert.strict.deepStrictEqual(r.mode, 'resolve')
        assert.strict.deepStrictEqual(r.msg, [])
    })

    it('should reject when any element fails', async function() {
        let r = await getRes(() => blobs2u8arrs([new Blob([new Uint8Array([1])])]))
        assert.strict.deepStrictEqual(r, { mode: 'reject', msg: 'no window' })
    })

})
