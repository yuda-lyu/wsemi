import assert from 'assert'
import blob2ab from '../src/blob2ab.mjs'
import { getRes } from './blob2b64.test.mjs'


describe('blob2ab', function() {

    it('need test in browser', function() {
        assert.strict.deepStrictEqual(1, 1)
    })

    it('should reject with invalid bb when input is not a blob', async function() {
        //輸入無效屬呼叫端錯誤, 須先於環境檢查回報, 否則於瀏覽器外一律得到no window而無從分辨
        let r = await getRes(() => blob2ab(NaN))
        assert.strict.deepStrictEqual(r, { mode: 'reject', msg: 'invalid bb' })
    })

    it('should reject with no window when not in a browser', async function() {
        let r = await getRes(() => blob2ab(new Blob([new Uint8Array([1, 2, 3])])))
        assert.strict.deepStrictEqual(r, { mode: 'reject', msg: 'no window' })
    })

})
