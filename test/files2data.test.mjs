import assert from 'assert'
import files2data from '../src/files2data.mjs'
import { getRes } from './blob2b64.test.mjs'


describe('files2data', function() {

    it('need test in browser', function() {
        assert.strict.deepStrictEqual(1, 1)
    })

    it('should reject with invalid files when input is not an array', async function() {
        let r = await getRes(() => files2data(NaN))
        assert.strict.deepStrictEqual(r, { mode: 'reject', msg: 'invalid files' })
    })

    it('should resolve [] when input is an empty array', async function() {
        let r = await getRes(() => files2data([]))
        assert.strict.deepStrictEqual(r.mode, 'resolve')
        assert.strict.deepStrictEqual(r.msg, [])
    })

    it('should reject (not hang) when the underlying blobs2b64s fails', async function() {
        //原碼之.then無.catch, blobs2b64s一旦reject則pm永不settle, 呼叫端await會永久掛住
        let r = await getRes(() => files2data([new Blob([new Uint8Array([1])])]))
        assert.strict.deepStrictEqual(r, { mode: 'reject', msg: 'no window' })
    })

})
