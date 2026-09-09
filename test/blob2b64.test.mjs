import assert from 'assert'
import blob2b64 from '../src/blob2b64.mjs'


//getRes, 分辨「同步拋錯」「resolve」「reject」三種結果
//回傳Promise之函數其失敗一律須走reject: 同步拋錯會使呼叫端之.catch完全接不到(連Promise都還沒回傳), 靜默resolve則使失敗無從辨識
let getRes = async (fn) => {
    let r = null
    try {
        r = fn()
    }
    catch (err) {
        return { mode: 'throw', msg: String((err && err.message) || err) }
    }
    if (r === null || typeof r.then !== 'function') {
        return { mode: 'notPromise', msg: '' }
    }
    return r
        .then((v) => {
            return { mode: 'resolve', msg: v }
        })
        .catch((err) => {
            return { mode: 'reject', msg: String((err && err.message) || err) }
        })
}


describe('blob2b64', function() {

    it('need test in browser', function() {
        assert.strict.deepStrictEqual(1, 1)
    })

    it('should reject with invalid bb when input is not a blob', async function() {
        let r = await getRes(() => blob2b64(NaN))
        assert.strict.deepStrictEqual(r, { mode: 'reject', msg: 'invalid bb' })
    })

    it('should reject with no window when not in a browser', async function() {
        //原碼未做前置檢查而直接new FileReader(), 於nodejs會同步拋ReferenceError
        let r = await getRes(() => blob2b64(new Blob([new Uint8Array([1, 2, 3])])))
        assert.strict.deepStrictEqual(r, { mode: 'reject', msg: 'no window' })
    })

})


export { getRes }
