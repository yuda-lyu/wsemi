import assert from 'assert'
import ot from 'dayjs'
import now2str from '../src/now2str.mjs'


describe(`now2str`, function() {

    //還是有可能剛好遇到時間差1s
    let r = now2str()
    let d = ot()
    let rr = d.format('YYYY-MM-DDTHH:mm:ssZ')
    it(`should return ${rr} when input ${r}`, function() {
        assert.strict.deepStrictEqual(r, rr)
    })

})
