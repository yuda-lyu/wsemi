import assert from 'assert'
import blob2str from '../src/blob2str.mjs'
import { getRes } from './blob2b64.test.mjs'


describe('blob2str', function() {

    it('need test in browser', function() {
        assert.strict.deepStrictEqual(1, 1)
    })

    it('should reject with invalid bb when input is not a blob', async function() {
        let r = await getRes(() => blob2str(NaN))
        assert.strict.deepStrictEqual(r, { mode: 'reject', msg: 'invalid bb' })
    })

    it('should reject with no window when not in a browser', async function() {
        //原碼未做前置檢查而直接new FileReader(), 於nodejs會同步拋ReferenceError
        let r = await getRes(() => blob2str(new Blob([new Uint8Array([1, 2, 3])])))
        assert.strict.deepStrictEqual(r, { mode: 'reject', msg: 'no window' })
    })

})
