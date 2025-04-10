import assert from 'assert'
import getFileHash from '../src/getFileHash.mjs'


describe(`getFileHash`, function() {

    //nodejs沒有Blob或File，只有瀏覽器才有

    it(`should return 'inp is not a Blob or File' when input new ArrayBuffer(1)`, async() => {
        let r = ''
        await getFileHash(new ArrayBuffer(1))
            .catch((err) => {
                r = err
            })
        let rr = 'inp is not a Blob or File'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 'inp is not a Blob or File' when input null`, async() => {
        let r = ''
        await getFileHash(null)
            .catch((err) => {
                r = err
            })
        let rr = 'inp is not a Blob or File'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 'inp is not a Blob or File' when input undefined`, async() => {
        let r = ''
        await getFileHash(undefined)
            .catch((err) => {
                r = err
            })
        let rr = 'inp is not a Blob or File'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 'inp is not a Blob or File' when input NaN`, async() => {
        let r = ''
        await getFileHash(NaN)
            .catch((err) => {
                r = err
            })
        let rr = 'inp is not a Blob or File'
        assert.strict.deepStrictEqual(r, rr)
    })

})
