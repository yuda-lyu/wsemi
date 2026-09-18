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

    it('should accept a File as input, passing the input check like a Blob', async function() {
        //input type=file取得者為File; 通過輸入檢查後於nodejs得no window, 不得為invalid bb
        let r = await getRes(() => blob2ab(new File([new Uint8Array([1, 2, 3])], 'a.txt')))
        assert.strict.deepStrictEqual(r, { mode: 'reject', msg: 'no window' })
    })

})
