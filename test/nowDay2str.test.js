import assert from 'assert'
import ot from 'dayjs'
import nowDay2str from '../src/nowDay2str.mjs'


describe(`nowDay2str`, function() {

    //還是有可能剛好遇到時間差1day
    let r = nowDay2str()
    let d = ot()
    let rr = d.format('YYYY-MM-DD')
    it(`should return ${rr} when input ${r}`, function() {
        assert.strict.deepEqual(r, rr)
    })

})
