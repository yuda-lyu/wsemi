import assert from 'assert'
import blobs2b64s from '../src/blobs2b64s.mjs'
import { getRes } from './blob2b64.test.mjs'


describe('blobs2b64s', function() {

    it('need test in browser', function() {
        assert.strict.deepStrictEqual(1, 1)
    })

    it('should reject with invalid bbs when input is not an array', async function() {
        //原碼以lodash之map處理非陣列會得[], 再Promise.all([])即靜默resolve [], 使無效輸入被當成功
        let r = await getRes(() => blobs2b64s(NaN))
        assert.strict.deepStrictEqual(r, { mode: 'reject', msg: 'invalid bbs' })
    })

    it('should resolve [] when input is an empty array', async function() {
        //空陣列為合法輸入, 對應空結果
        let r = await getRes(() => blobs2b64s([]))
        assert.strict.deepStrictEqual(r.mode, 'resolve')
        assert.strict.deepStrictEqual(r.msg, [])
    })

    it('should reject when any element fails', async function() {
        let r = await getRes(() => blobs2b64s([new Blob([new Uint8Array([1])])]))
        assert.strict.deepStrictEqual(r, { mode: 'reject', msg: 'no window' })
    })

})
